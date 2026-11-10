import { msg } from "@/lib/i18n/translate";
import { createHash, randomUUID } from "node:crypto";
import { defaultFilterConfig, runLocalFilter, type FilterConfig, type LocalResult } from "@/lib/community/local-filter";
import {
  APPROVED_NOTICE,
  NOT_CONFIGURED_NOTICE,
  noticeFor,
  PENDING_NOTICE,
  PRIVACY_NOTICE,
  REJECTION_NOTICE,
  RETENTION_SUMMARY,
  temporaryRestrictionMessage,
} from "@/lib/community/notices";
import {
  DUPLICATE_WINDOW_MINUTES,
  MAX_BODY_LENGTH,
  MEMBER_PROVIDER_CALLS_PER_HOUR,
  MEMBER_SUBMITS_PER_HOUR,
  REPEAT_CATEGORIES,
  REPEAT_LIMIT,
  REPEAT_WINDOW_DAYS,
  REPORT_REASONS,
  RESTRICTION_HOURS,
  retentionCutoff,
} from "@/lib/community/policy";
import { moderateText, type ProviderOutcome } from "@/lib/community/provider";
import {
  type CommunityProfile,
  type CommunityRepository,
  type StoredMessage,
  type StoredRelation,
  type StoredReport,
} from "@/lib/community/repository";
import type {
  AdminQueue,
  CommunityBoard,
  ModerationStatus,
  OwnMessage,
  PublicMessage,
  QueueMessage,
  QueueReport,
  ReportReason,
} from "@/lib/community/types";

export type CommunityActor = { id: string; isAdmin: boolean };

export type CommunityDeps = {
  repo: CommunityRepository;
  storage: "memory" | "account";
  apiKey?: string;
  fetchImpl?: typeof fetch;
  now?: () => Date;
  filterConfig?: FilterConfig;
  maxProviderCallsPerHour?: number;
  maxSubmitsPerHour?: number;
  timeoutMs?: number;
};

export type ActionResult = { status: number; body: Record<string, unknown> };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const REASON_SET = new Set<string>(REPORT_REASONS);
const REQUEST_ID = /^[A-Za-z0-9_-]{8,80}$/;
const CATEGORIES = new Set([
  "none",
  "profanity",
  "insult",
  "harassment",
  "hate",
  "threat",
  "violence",
  "sexual",
  "self-harm",
  "illicit",
  "spam",
  "other",
]);

const inFlight = new Map<string, Promise<ActionResult>>();

export function resetCommunityRuntimeForTests() {
  inFlight.clear();
}

function nowOf(deps: CommunityDeps): Date {
  return deps.now?.() ?? new Date();
}

function moderationMode(deps: CommunityDeps): "configured" | "not-configured" {
  return deps.apiKey?.trim() ? "configured" : "not-configured";
}

function contentHash(parentId: string | null, body: string): string {
  const normalized = body.toLowerCase().replace(/\s+/g, " ").trim();
  return createHash("sha256").update(`${parentId ?? ""}\n${normalized}`).digest("hex");
}

function emptyProfile(userId: string): CommunityProfile {
  return { userId, displayName: "", restrictedUntil: null, violations: [], providerCalls: [] };
}

export function normalizeProfile(profile: CommunityProfile, nowMs: number) {
  const windowStart = nowMs - REPEAT_WINDOW_DAYS * 24 * 60 * 60 * 1000;
  const hourStart = nowMs - 60 * 60 * 1000;
  profile.violations = profile.violations.filter((item) => Date.parse(item.at) >= windowStart);
  profile.providerCalls = profile.providerCalls.filter((at) => Date.parse(at) >= hourStart);
  if (profile.violations.length >= REPEAT_LIMIT) {
    const latest = Math.max(...profile.violations.map((item) => Date.parse(item.at)));
    profile.restrictedUntil = new Date(latest + RESTRICTION_HOURS * 60 * 60 * 1000).toISOString();
  } else {
    profile.restrictedUntil = null;
  }
}

function addViolation(profile: CommunityProfile, message: StoredMessage, nowIso: string, nowMs: number) {
  if (message.violationCounted || !REPEAT_CATEGORIES.has(message.category)) return;
  profile.violations.push({ at: nowIso, category: message.category, messageId: message.id });
  message.violationCounted = true;
  normalizeProfile(profile, nowMs);
}

function retractViolation(profile: CommunityProfile, message: StoredMessage, nowMs: number) {
  profile.violations = profile.violations.filter((item) => item.messageId !== message.id);
  message.violationCounted = false;
  normalizeProfile(profile, nowMs);
}

function hidden(viewerId: string, authorId: string, blocks: StoredRelation[], mutes: StoredRelation[]) {
  if (viewerId === authorId) return false;
  const blocked = blocks.some(
    (item) =>
      (item.ownerId === viewerId && item.otherId === authorId) ||
      (item.ownerId === authorId && item.otherId === viewerId),
  );
  if (blocked) return true;
  return mutes.some((item) => item.ownerId === viewerId && item.otherId === authorId);
}

function toPublic(message: StoredMessage): PublicMessage {
  return {
    id: message.id,
    authorName: message.authorName,
    body: message.body,
    createdAt: message.createdAt,
    parentId: message.parentId,
  };
}

function toOwn(message: StoredMessage): OwnMessage {
  return {
    ...toPublic(message),
    status: message.status,
    source: message.source,
    notice: noticeFor(message.status, message.source),
    appealed: message.appealUsed && message.status === "pending",
  };
}

function storageError(): ActionResult {
  return { status: 503, body: { error: msg("Community storage is unavailable. The message was not published.") } };
}

async function guard(repo: CommunityRepository, task: () => Promise<ActionResult>): Promise<ActionResult> {
  try {
    return await repo.runExclusive(task);
  } catch {
    return storageError();
  }
}

async function applyRetention(repo: CommunityRepository, nowMs: number) {
  const cutoff = retentionCutoff(nowMs);
  const messages = await repo.listMessages();
  const reports = await repo.listReports();
  for (const message of messages) {
    const openPending = message.status === "pending" && !message.removedAt && !message.redacted;
    const published = message.status === "approved" && !message.removedAt && !message.redacted;
    if (openPending || published) continue;
    const stamp = Date.parse(message.removedAt ?? message.decidedAt);
    if (Number.isNaN(stamp) || stamp >= cutoff) continue;
    await repo.deleteMessage(message.id);
    for (const report of reports) {
      if (report.messageId === message.id) await repo.deleteReport(report.id);
    }
  }
  for (const report of await repo.listReports()) {
    if (report.status !== "dismissed" || !report.resolvedAt) continue;
    if (Date.parse(report.resolvedAt) < cutoff) await repo.deleteReport(report.id);
  }
  for (const profile of await repo.listProfiles()) {
    const before = JSON.stringify(profile);
    normalizeProfile(profile, nowMs);
    if (JSON.stringify(profile) !== before) await repo.saveProfile(profile);
  }
}

function cleanName(input: unknown): { ok: true; name: string } | { ok: false; error: string } {
  if (typeof input !== "string") return { ok: false, error: msg("Choose a community name before posting. The message was not published.") };
  const name = input.replace(/[\u200B-\u200D\uFEFF]/g, "").trim().replace(/\s+/g, " ");
  if (name.length < 2 || name.length > 24) {
    return { ok: false, error: msg("Choose a community name of 2 to 24 characters. The message was not published.") };
  }
  if (name.includes("@") || /https?:\/\//i.test(name) || name.toLowerCase() === "sample visitor") {
    return { ok: false, error: msg("Choose a community name that is not an email address. The message was not published.") };
  }
  if (!/^[\p{L}\p{N}](?:[\p{L}\p{N} ._-]{0,22}[\p{L}\p{N}])?$/u.test(name)) {
    return { ok: false, error: msg("Use letters or numbers for your community name. The message was not published.") };
  }
  return { ok: true, name };
}

function cleanBody(input: unknown): { ok: true; body: string } | { ok: false; error: string } {
  if (typeof input !== "string") return { ok: false, error: msg("Write a message before sharing it. It was not published.") };
  const body = input.replace(/[\u200B-\u200D\uFEFF]/g, "").replace(/\r\n/g, "\n").trim();
  if (!body) return { ok: false, error: msg("Write a message before sharing it. It was not published.") };
  if (body.length > MAX_BODY_LENGTH) return { ok: false, error: msg("That message is too long. It was not published.") };
  return { ok: true, body };
}

function baseBoard(actor: CommunityActor | null, deps: CommunityDeps): CommunityBoard {
  return {
    signedIn: Boolean(actor),
    isAdmin: actor?.isAdmin === true,
    moderation: moderationMode(deps),
    storage: deps.storage,
    privacyNotice: PRIVACY_NOTICE,
    pendingNotice: PENDING_NOTICE,
    rejectionNotice: REJECTION_NOTICE,
    retentionSummary: RETENTION_SUMMARY,
    messages: [],
    mine: [],
    queue: null,
  };
}

function violationCount(profile: CommunityProfile | null, nowMs: number): { count: number; restrictedUntil: string | null } {
  if (!profile) return { count: 0, restrictedUntil: null };
  const copy = JSON.parse(JSON.stringify(profile)) as CommunityProfile;
  normalizeProfile(copy, nowMs);
  return { count: copy.violations.length, restrictedUntil: copy.restrictedUntil };
}

function queueMessage(
  message: StoredMessage,
  profiles: CommunityProfile[],
  reports: StoredReport[],
  nowMs: number,
): QueueMessage {
  const profile = profiles.find((item) => item.userId === message.authorId) ?? null;
  const limits = violationCount(profile, nowMs);
  return {
    id: message.id,
    authorName: message.authorName,
    body: message.body,
    status: message.status === "rejected" ? "rejected" : "pending",
    category: message.category,
    source: message.source,
    createdAt: message.createdAt,
    decidedAt: message.decidedAt,
    authorViolationCount: limits.count,
    reportCount: reports.filter((report) => report.messageId === message.id).length,
    appealed: message.appealUsed && message.status === "pending",
    restrictedUntil: limits.restrictedUntil,
  };
}

async function buildBoard(actor: CommunityActor | null, deps: CommunityDeps, nowMs: number): Promise<CommunityBoard> {
  const board = baseBoard(actor, deps);
  if (!actor) return board;
  const [messages, reports, blocks, mutes, profiles] = await Promise.all([
    deps.repo.listMessages(),
    deps.repo.listReports(),
    deps.repo.listBlocks(),
    deps.repo.listMutes(),
    deps.repo.listProfiles(),
  ]);
  const visible = messages.filter(
    (message) =>
      message.status === "approved" &&
      !message.redacted &&
      !message.removedAt &&
      !hidden(actor.id, message.authorId, blocks, mutes),
  );
  board.messages = visible
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    .map(toPublic);
  board.mine = messages
    .filter((message) => message.authorId === actor.id && !message.redacted && message.status !== "approved")
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map(toOwn);
  if (!actor.isAdmin) return board;
  const pending = messages.filter((message) => message.status === "pending" && !message.redacted && !message.removedAt);
  const rejected = messages.filter((message) => message.status === "rejected" && !message.redacted && !message.removedAt);
  const openReports = reports.filter((report) => report.status === "open");
  const queue: AdminQueue = {
    pending: pending
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
      .map((message) => queueMessage(message, profiles, reports, nowMs)),
    rejected: rejected
      .sort((a, b) => b.decidedAt.localeCompare(a.decidedAt))
      .map((message) => queueMessage(message, profiles, reports, nowMs)),
    reports: openReports
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
      .flatMap((report) => {
        const message = messages.find((item) => item.id === report.messageId);
        if (!message || message.redacted) return [];
        const item: QueueReport = {
          id: report.id,
          messageId: report.messageId,
          authorName: message.authorName,
          body: message.body,
          reason: report.reason,
          createdAt: report.createdAt,
          reportCount: reports.filter((itemReport) => itemReport.messageId === report.messageId).length,
          authorViolationCount: violationCount(
            profiles.find((profile) => profile.userId === message.authorId) ?? null,
            nowMs,
          ).count,
        };
        return [item];
      }),
  };
  board.queue = queue;
  return board;
}

function strongerLocal(name: LocalResult, body: LocalResult): LocalResult {
  if (name.action === "reject") return name;
  if (body.action === "reject") return body;
  if (body.action === "quotation") return body;
  return { action: "allow" };
}

function decide(local: LocalResult, provider: ProviderOutcome): { status: ModerationStatus; category: string; source: string } {
  if (local.action === "reject") return { status: "rejected", category: local.category, source: "local-filter" };
  switch (provider.kind) {
    case "clear":
      return { status: "approved", category: "none", source: "provider" };
    case "flagged":
      return { status: "rejected", category: provider.category, source: "provider" };
    case "not-configured":
      return { status: "pending", category: "none", source: "not-configured" };
    case "timeout":
      return { status: "pending", category: "none", source: "timeout" };
    case "quota":
      return { status: "pending", category: "none", source: "quota" };
    case "error":
      return { status: "pending", category: "none", source: "error" };
  }
}

function findDuplicate(
  messages: StoredMessage[],
  authorId: string,
  parentId: string | null,
  hash: string,
  clientRequestId: string | null,
  nowMs: number,
): StoredMessage | null {
  const own = messages.filter((message) => message.authorId === authorId && !message.redacted && !message.removedAt);
  if (clientRequestId) {
    const byRequest = own.find((message) => message.clientRequestId === clientRequestId);
    if (byRequest) return byRequest;
  }
  const same = own.filter((message) => message.contentHash === hash && message.parentId === parentId);
  const blocking = same.find((message) => message.status === "pending" || message.status === "rejected");
  if (blocking) return blocking;
  const windowStart = nowMs - DUPLICATE_WINDOW_MINUTES * 60 * 1000;
  return (
    same.find((message) => message.status === "approved" && Date.parse(message.createdAt) >= windowStart) ?? null
  );
}

type PreparedSubmit = {
  name: string;
  body: string;
  parentId: string | null;
  clientRequestId: string | null;
  hash: string;
  key: string;
};

function prepareSubmit(actor: CommunityActor, input: Record<string, unknown>): { ok: true; value: PreparedSubmit } | { ok: false; result: ActionResult } {
  const name = cleanName(input.displayName);
  if (!name.ok) return { ok: false, result: { status: 400, body: { error: name.error } } };
  const body = cleanBody(input.body);
  if (!body.ok) return { ok: false, result: { status: 400, body: { error: body.error } } };
  let parentId: string | null = null;
  if (input.parentId !== undefined && input.parentId !== null && input.parentId !== "") {
    if (typeof input.parentId !== "string" || !UUID.test(input.parentId)) {
      return { ok: false, result: { status: 400, body: { error: msg("That conversation is not available. The comment was not published.") } } };
    }
    parentId = input.parentId;
  }
  let clientRequestId: string | null = null;
  if (input.clientRequestId !== undefined && input.clientRequestId !== null && input.clientRequestId !== "") {
    if (typeof input.clientRequestId !== "string" || !REQUEST_ID.test(input.clientRequestId)) {
      return { ok: false, result: { status: 400, body: { error: msg("That submit could not be accepted. The message was not published.") } } };
    }
    clientRequestId = input.clientRequestId;
  }
  const hash = contentHash(parentId, body.body);
  return {
    ok: true,
    value: { name: name.name, body: body.body, parentId, clientRequestId, hash, key: `${actor.id}|${parentId ?? ""}|${hash}` },
  };
}

async function submitUnlocked(
  actor: CommunityActor,
  prepared: PreparedSubmit,
  deps: CommunityDeps,
  now: Date,
): Promise<ActionResult> {
  const nowMs = now.getTime();
  const nowIso = now.toISOString();
  await applyRetention(deps.repo, nowMs);
  const profiles = await deps.repo.listProfiles();
  const messages = await deps.repo.listMessages();
  const blocks = await deps.repo.listBlocks();
  const mutes = await deps.repo.listMutes();
  const profile = profiles.find((item) => item.userId === actor.id) ?? emptyProfile(actor.id);
  normalizeProfile(profile, nowMs);
  if (profile.restrictedUntil && Date.parse(profile.restrictedUntil) > nowMs) {
    return { status: 403, body: { error: temporaryRestrictionMessage(profile.restrictedUntil) } };
  }
  if (prepared.parentId) {
    const parent = messages.find((message) => message.id === prepared.parentId);
    const available =
      parent &&
      !parent.parentId &&
      parent.status === "approved" &&
      !parent.redacted &&
      !parent.removedAt &&
      !hidden(actor.id, parent.authorId, blocks, mutes);
    if (!available) {
      return { status: 400, body: { error: msg("That conversation is not available. The comment was not published.") } };
    }
  }
  const duplicate = findDuplicate(messages, actor.id, prepared.parentId, prepared.hash, prepared.clientRequestId, nowMs);
  if (duplicate) {
    return { status: 200, body: { ...publicDecision(duplicate), duplicate: true } };
  }
  const recentSubmits = messages.filter(
    (message) => message.authorId === actor.id && Date.parse(message.createdAt) >= nowMs - 60 * 60 * 1000,
  ).length;
  const submitCap = deps.maxSubmitsPerHour ?? MEMBER_SUBMITS_PER_HOUR;
  if (recentSubmits >= submitCap) {
    return { status: 429, body: { error: msg("Please wait before sending another message. It was not published.") } };
  }
  const taken = profiles.some(
    (item) => item.userId !== actor.id && item.displayName.toLowerCase() === prepared.name.toLowerCase(),
  );
  if (taken) return { status: 400, body: { error: msg("That community name is already used. Choose another. The message was not published.") } };
  profile.displayName = prepared.name;
  const config = deps.filterConfig ?? defaultFilterConfig;
  const local = strongerLocal(
    runLocalFilter(prepared.name, config, { allowQuotation: false }),
    runLocalFilter(prepared.body, config, { allowQuotation: true }),
  );
  const messageBase = {
    id: randomUUID(),
    authorId: actor.id,
    authorName: prepared.name,
    parentId: prepared.parentId,
    body: prepared.body,
    redacted: false,
    contentHash: prepared.hash,
    clientRequestId: prepared.clientRequestId,
    createdAt: nowIso,
    decidedAt: nowIso,
    removedAt: null,
    appealUsed: false,
    violationCounted: false,
  };
  if (local.action === "reject") {
    const message: StoredMessage = { ...messageBase, status: "rejected", category: local.category, source: "local-filter" };
    addViolation(profile, message, nowIso, nowMs);
    await deps.repo.saveProfile(profile);
    await deps.repo.insertMessage(message);
    return { status: 200, body: { ...publicDecision(message), duplicate: false } };
  }
  const providerCap = deps.maxProviderCallsPerHour ?? MEMBER_PROVIDER_CALLS_PER_HOUR;
  const willCall = Boolean(deps.apiKey?.trim());
  if (willCall && profile.providerCalls.length >= providerCap) {
    return { status: 429, body: { error: msg("Please wait before sending another message. It was not published.") } };
  }
  const provider = await moderateText(prepared.body, {
    apiKey: deps.apiKey,
    fetchImpl: deps.fetchImpl,
    timeoutMs: deps.timeoutMs,
  });
  if (provider.kind !== "not-configured") {
    profile.providerCalls.push(nowIso);
    normalizeProfile(profile, nowMs);
  }
  const decision = decide(local, provider);
  const message: StoredMessage = {
    ...messageBase,
    status: decision.status,
    category: decision.category,
    source: decision.source,
  };
  if (decision.status === "rejected") addViolation(profile, message, nowIso, nowMs);
  await deps.repo.saveProfile(profile);
  await deps.repo.insertMessage(message);
  return { status: 200, body: { ...publicDecision(message), duplicate: false } };
}

function publicDecision(message: StoredMessage) {
  const own = toOwn(message);
  return {
    status: own.status,
    notice: own.notice,
    source: own.source,
    message: own,
  };
}

export async function submitCommunity(
  actor: CommunityActor,
  input: Record<string, unknown>,
  deps: CommunityDeps,
): Promise<ActionResult> {
  const prepared = prepareSubmit(actor, input);
  if (!prepared.ok) return prepared.result;
  const existing = inFlight.get(prepared.value.key);
  if (existing) return existing;
  const promise = guard(deps.repo, () => submitUnlocked(actor, prepared.value, deps, nowOf(deps)));
  inFlight.set(prepared.value.key, promise);
  void promise.finally(() => {
    if (inFlight.get(prepared.value.key) === promise) inFlight.delete(prepared.value.key);
  });
  return promise;
}

function canSee(actor: CommunityActor, message: StoredMessage, blocks: StoredRelation[], mutes: StoredRelation[]) {
  if (message.redacted || message.removedAt) return false;
  if (message.authorId === actor.id) return true;
  if (message.status !== "approved") return false;
  return !hidden(actor.id, message.authorId, blocks, mutes);
}

export async function communityBoard(actor: CommunityActor | null, deps: CommunityDeps): Promise<ActionResult> {
  if (!actor) return { status: 200, body: { ...baseBoard(null, deps) } };
  return guard(deps.repo, async () => {
    await applyRetention(deps.repo, nowOf(deps).getTime());
    const board = await buildBoard(actor, deps, nowOf(deps).getTime());
    return { status: 200, body: { ...board } };
  });
}

function bad(status: number, error: string): ActionResult {
  return { status, body: { error } };
}

export async function communityAction(
  actor: CommunityActor,
  input: Record<string, unknown>,
  deps: CommunityDeps,
): Promise<ActionResult> {
  const action = typeof input.action === "string" ? input.action : "";
  if (action === "submit") return submitCommunity(actor, input, deps);
  return guard(deps.repo, async () => {
    const now = nowOf(deps);
    const nowMs = now.getTime();
    const nowIso = now.toISOString();
    await applyRetention(deps.repo, nowMs);
    if (action === "admin-approve" || action === "admin-reject" || action === "admin-dismiss") {
      if (!actor.isAdmin) return bad(403, msg("Admin review is not available for this account."));
    }
    if (action === "admin-dismiss") return dismissReport(input, deps, nowIso);
    if (action === "admin-approve" || action === "admin-reject") return reviewMessage(actor, action, input, deps, nowIso, nowMs);
    const messageId = typeof input.messageId === "string" ? input.messageId : "";
    if (!UUID.test(messageId)) return bad(400, msg("That message is not available."));
    const message = await deps.repo.getMessage(messageId);
    if (!message) return bad(404, msg("That message is not available."));
    const blocks = await deps.repo.listBlocks();
    const mutes = await deps.repo.listMutes();
    if (action === "remove") return removeOwn(actor, message, deps, nowIso);
    if (action === "appeal") return appealOwn(actor, message, deps, nowIso);
    if (!canSee(actor, message, blocks, mutes)) return bad(404, msg("That message is not available."));
    if (action === "report") return reportMessage(actor, message, input, deps, nowIso);
    if (action === "block" || action === "mute") return relate(actor, message, action, deps, nowIso);
    return bad(400, msg("That action is not available."));
  });
}

async function reportMessage(
  actor: CommunityActor,
  message: StoredMessage,
  input: Record<string, unknown>,
  deps: CommunityDeps,
  nowIso: string,
): Promise<ActionResult> {
  if (message.authorId === actor.id) return bad(400, msg("You can remove your own message instead of reporting it."));
  const reason = typeof input.reason === "string" ? input.reason : "";
  if (!REASON_SET.has(reason)) {
    return bad(400, msg("Choose a report reason. The report was not saved."));
  }
  const reports = await deps.repo.listReports();
  const existing = reports.find((report) => report.messageId === message.id && report.reporterId === actor.id);
  if (existing) return { status: 200, body: { ok: true, duplicate: true } };
  await deps.repo.insertReport({
    id: randomUUID(),
    messageId: message.id,
    reporterId: actor.id,
    reason: reason as ReportReason,
    createdAt: nowIso,
    status: "open",
    resolvedAt: null,
  });
  return { status: 200, body: { ok: true, duplicate: false } };
}

async function relate(
  actor: CommunityActor,
  message: StoredMessage,
  action: "block" | "mute",
  deps: CommunityDeps,
  nowIso: string,
): Promise<ActionResult> {
  if (message.authorId === actor.id) return bad(400, msg("That action is not available on your own message."));
  const relation = { ownerId: actor.id, otherId: message.authorId, createdAt: nowIso };
  if (action === "block") await deps.repo.addBlock(relation);
  else await deps.repo.addMute(relation);
  return { status: 200, body: { ok: true } };
}

async function removeOwn(actor: CommunityActor, message: StoredMessage, deps: CommunityDeps, nowIso: string): Promise<ActionResult> {
  if (message.authorId !== actor.id) return bad(403, msg("You can remove only your own message."));
  if (message.redacted) return { status: 200, body: { ok: true } };
  message.body = "";
  message.redacted = true;
  message.removedAt = nowIso;
  await deps.repo.updateMessage(message);
  return { status: 200, body: { ok: true } };
}

async function appealOwn(actor: CommunityActor, message: StoredMessage, deps: CommunityDeps, nowIso: string): Promise<ActionResult> {
  if (message.authorId !== actor.id) return bad(403, msg("You can appeal only your own message."));
  if (message.status !== "rejected" || message.redacted) return bad(400, msg("That message cannot be appealed."));
  if (message.appealUsed) return bad(400, msg("That message was already appealed. It is awaiting moderation."));
  message.status = "pending";
  message.appealUsed = true;
  message.decidedAt = nowIso;
  await deps.repo.updateMessage(message);
  return { status: 200, body: { ...publicDecision(message), duplicate: false } };
}

async function reviewMessage(
  actor: CommunityActor,
  action: "admin-approve" | "admin-reject",
  input: Record<string, unknown>,
  deps: CommunityDeps,
  nowIso: string,
  nowMs: number,
): Promise<ActionResult> {
  if (!actor.isAdmin) return bad(403, msg("Admin review is not available for this account."));
  const messageId = typeof input.messageId === "string" ? input.messageId : "";
  if (!UUID.test(messageId)) return bad(400, msg("That message is not available."));
  const message = await deps.repo.getMessage(messageId);
  if (!message || message.redacted || !message.body) return bad(404, msg("That message is not available."));
  const profile = (await deps.repo.getProfile(message.authorId)) ?? emptyProfile(message.authorId);
  if (!profile.displayName) profile.displayName = message.authorName;
  normalizeProfile(profile, nowMs);
  if (action === "admin-approve") {
    message.status = "approved";
    message.source = "admin";
    message.decidedAt = nowIso;
    retractViolation(profile, message, nowMs);
  } else {
    const requested = typeof input.category === "string" ? input.category : "";
    if (requested && CATEGORIES.has(requested) && requested !== "none") message.category = requested;
    else if (message.category === "none") message.category = "other";
    message.status = "rejected";
    message.source = "admin";
    message.decidedAt = nowIso;
    addViolation(profile, message, nowIso, nowMs);
  }
  await deps.repo.saveProfile(profile);
  await deps.repo.updateMessage(message);
  return { status: 200, body: { ok: true, status: message.status, notice: noticeFor(message.status, message.source) } };
}

async function dismissReport(input: Record<string, unknown>, deps: CommunityDeps, nowIso: string): Promise<ActionResult> {
  const reportId = typeof input.reportId === "string" ? input.reportId : "";
  if (!UUID.test(reportId)) return bad(400, msg("That report is not available."));
  const reports = await deps.repo.listReports();
  const report = reports.find((item) => item.id === reportId);
  if (!report) return bad(404, msg("That report is not available."));
  report.status = "dismissed";
  report.resolvedAt = nowIso;
  await deps.repo.updateReport(report);
  return { status: 200, body: { ok: true } };
}

export const memberNotices = {
  approved: APPROVED_NOTICE,
  pending: PENDING_NOTICE,
  notConfigured: NOT_CONFIGURED_NOTICE,
  rejected: REJECTION_NOTICE,
};
