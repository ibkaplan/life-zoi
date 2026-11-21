import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { beforeEach, describe, expect, it } from "vitest";
import { isAdminEmail } from "@/lib/admin-allowlist";
import { handleCommunityRequest } from "@/lib/community/handle-request";
import { defaultFilterConfig, runLocalFilter } from "@/lib/community/local-filter";
import { PENDING_NOTICE, PRIVACY_NOTICE, REJECTION_NOTICE } from "@/lib/community/notices";
import { MODERATION_ENDPOINT, MODERATION_MODEL, mapProviderCategory, moderateText } from "@/lib/community/provider";
import { createMemoryRepository } from "@/lib/community/repository";
import { resetCommunityRuntimeForTests, communityAction, communityBoard, submitCommunity, type CommunityActor, type CommunityDeps } from "@/lib/community/service";
import { COMMUNITY_TABLES, communityRepositoryFromEnv, guardCommunityClient, type CommunityDbClient } from "@/lib/community/supabase-repository";
import type { CommunityBoard } from "@/lib/community/types";

const MEMBER = "11111111-1111-4111-8111-111111111111";
const OTHER = "22222222-2222-4222-8222-222222222222";
const ADMIN = "33333333-3333-4333-8333-333333333333";
const SECRET = "test-moderation-key-0123456789";
const FRIENDLY = "I walked for twenty minutes after lunch and I plan to do the same tomorrow.";
const QUOTE = 'Our walking group quoted one rude example, "you idiot", then practiced a kinder reply.';

const member: CommunityActor = { id: MEMBER, isAdmin: false };
const other: CommunityActor = { id: OTHER, isAdmin: false };
const admin: CommunityActor = { id: ADMIN, isAdmin: true };

type Row = Record<string, unknown>;

function providerResponse(flagged: boolean, categories: Record<string, boolean> = {}) {
  return new Response(JSON.stringify({ results: [{ flagged, categories }] }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

function harness(overrides: Partial<CommunityDeps> = {}) {
  const calls: { url: string; body: string; authorization: string }[] = [];
  const repo = overrides.repo ?? createMemoryRepository();
  let clock = new Date("2026-11-06T12:00:00.000Z");
  const fetchImpl: typeof fetch = async (url, init) => {
    const headers = new Headers(init?.headers);
    calls.push({
      url: String(url),
      body: String(init?.body ?? ""),
      authorization: headers.get("Authorization") ?? "",
    });
    return providerResponse(false);
  };
  const deps: CommunityDeps = {
    repo,
    storage: "memory",
    apiKey: SECRET,
    fetchImpl: overrides.fetchImpl ?? fetchImpl,
    now: overrides.now ?? (() => clock),
    ...overrides,
  };
  return {
    repo,
    deps,
    calls,
    setClock(value: Date) {
      clock = value;
    },
  };
}

function send(actor: CommunityActor, body: string, deps: CommunityDeps, extra: Record<string, unknown> = {}) {
  const displayName = actor.id === OTHER ? "Brook" : actor.id === ADMIN ? "Guide" : "River";
  return submitCommunity(actor, { action: "submit", displayName, body, ...extra }, deps);
}

function boardOf(result: { body: unknown }) {
  return result.body as CommunityBoard;
}

function decisionOf(result: { body: unknown }) {
  return result.body as {
    status: string;
    notice: string;
    source: string;
    duplicate?: boolean;
    message: { id: string; body: string; authorName: string; parentId: string | null };
  };
}

beforeEach(() => {
  resetCommunityRuntimeForTests();
});

describe("community moderation", () => {
  it("publishes friendly habit talk after a clear check", async () => {
    const { deps, calls } = harness();
    const result = await send(member, FRIENDLY, deps);
    expect(decisionOf(result).status).toBe("approved");
    expect(decisionOf(result).notice).toMatch(/published/i);
    const board = boardOf(await communityBoard(member, deps));
    expect(board.messages.map((message) => message.body)).toEqual([FRIENDLY]);
    expect(board.messages[0]?.authorName).toBe("River");
    expect(calls).toHaveLength(1);
    expect(calls[0]?.url).toBe(MODERATION_ENDPOINT);
    expect(JSON.parse(calls[0]?.body ?? "{}")).toEqual({ model: MODERATION_MODEL, input: FRIENDLY });
    expect(JSON.stringify(board)).not.toContain(MEMBER);
    expect(JSON.stringify(board)).not.toContain(SECRET);
    expect(calls[0]?.authorization.startsWith("Bearer ")).toBe(true);
    expect(calls[0]?.authorization).not.toBe("Bearer ");
  });

  it("does not send health records, questionnaire answers, email, or a real name", async () => {
    const { deps, calls } = harness();
    await submitCommunity(
      member,
      {
        action: "submit",
        displayName: "River",
        body: FRIENDLY,
        email: "river@example.com",
        realName: "Ada Lovelace",
        answers: { sleep: 8 },
        questionnaire: { mood: "ok" },
      },
      deps,
    );
    const sent = JSON.parse(calls[0]?.body ?? "{}") as { input: string };
    expect(sent.input).toBe(FRIENDLY);
    expect(JSON.stringify(sent)).not.toContain("Ada Lovelace");
    expect(JSON.stringify(sent)).not.toContain("river@example.com");
    const board = boardOf(await communityBoard(other, deps));
    expect(JSON.stringify(board)).not.toContain("river@example.com");
    expect(JSON.stringify(board)).not.toContain("Ada Lovelace");
    expect(JSON.stringify(board)).not.toContain(MEMBER);
  });

  it("rejects English and Russian profanity, including evasion, without a provider call", async () => {
    const english = defaultFilterConfig.englishProfanity[0] ?? "fuck";
    const russian = defaultFilterConfig.russianProfanity[0] ?? "хуй";
    const samples = [
      `This habit note is ${english} hard`,
      english.toUpperCase(),
      english.split("").join(" "),
      english.split("").join("."),
      `${english[0]}${(english[1] ?? "u").repeat(4)}${english.slice(2)}`,
      "what an 4sshole remark",
      `Это просто ${russian}`,
      russian.split("").join(" "),
      russian.split("").join("."),
      russian.toUpperCase(),
    ];
    for (const sample of samples) {
      const { deps, calls, repo } = harness({
        fetchImpl: async () => {
          throw new Error("provider should not be called");
        },
      });
      const result = await send(member, sample, deps);
      expect(decisionOf(result).status).toBe("rejected");
      expect(decisionOf(result).notice).toBe(REJECTION_NOTICE);
      expect(calls).toHaveLength(0);
      expect(boardOf(await communityBoard(other, deps)).messages).toHaveLength(0);
      expect((await repo.listMessages()).some((message) => message.status === "approved")).toBe(false);
    }
  });

  it("rejects a direct insult and does not reject one quoted word in a harmless note", async () => {
    expect(runLocalFilter("You are an idiot").action).toBe("reject");
    expect(runLocalFilter(QUOTE, defaultFilterConfig, { allowQuotation: true }).action).toBe("quotation");
    expect(runLocalFilter('"you idiot" said', defaultFilterConfig, { allowQuotation: true }).action).toBe("reject");
    expect(
      runLocalFilter(
        'The group quoted a serious line, "I will kill you", only as an example of what not to post.',
        defaultFilterConfig,
        { allowQuotation: true },
      ).action,
    ).toBe("reject");

    const { deps, calls } = harness();
    const insult = await send(member, "You are an idiot", deps);
    expect(decisionOf(insult).status).toBe("rejected");
    expect(calls).toHaveLength(0);

    const quoted = await send(member, QUOTE, deps);
    expect(decisionOf(quoted).status).toBe("approved");
    expect(decisionOf(quoted).notice).not.toBe(REJECTION_NOTICE);
    const quiet = harness({ apiKey: "" });
    const waiting = await send(member, QUOTE, quiet.deps);
    expect(decisionOf(waiting).status).toBe("pending");
    expect(decisionOf(waiting).status).not.toBe("rejected");
    expect(quiet.calls).toHaveLength(0);
  });

  it("rejects a threat, hate, and spam before they are public", async () => {
    for (const sample of ["I will kill you", "Please go back to your country", "Please buy now before the walk", "See https://a.example https://b.example https://c.example today"]) {
      const { deps, repo } = harness({
        fetchImpl: async () => {
          throw new Error("provider should not be called");
        },
      });
      const result = await send(member, sample, deps);
      expect(decisionOf(result).status).toBe("rejected");
      expect(decisionOf(result).notice).toBe(REJECTION_NOTICE);
      expect((await repo.listMessages()).every((message) => message.status === "rejected")).toBe(true);
      expect(boardOf(await communityBoard(other, deps)).messages).toHaveLength(0);
    }
  });

  it("rejects provider hate and threatening flags when the local filter is quiet", async () => {
    const flagged = harness({
      fetchImpl: async () => providerResponse(true, { hate: true }),
    });
    const hate = await send(member, FRIENDLY, flagged.deps);
    expect(decisionOf(hate).status).toBe("rejected");
    expect((await flagged.repo.getMessage(decisionOf(hate).message.id))?.category).toBe("hate");

    const threat = harness({
      fetchImpl: async () => providerResponse(true, { "harassment/threatening": true }),
    });
    const result = await send(member, "See you at the park tomorrow.", threat.deps);
    expect(decisionOf(result).status).toBe("rejected");
    expect((await threat.repo.getMessage(decisionOf(result).message.id))?.category).toBe("threat");
    expect(mapProviderCategory("sexual/minors")).toBe("sexual");
    expect(mapProviderCategory("self-harm")).toBe("self-harm");
  });

  it("keeps a timed-out, quota-limited, or failed check pending and unpublished", async () => {
    const timeout = harness({
      timeoutMs: 20,
      fetchImpl: (_url, init) =>
        new Promise((_resolve, reject) => {
          const signal = init?.signal;
          const fail = () => reject(Object.assign(new Error("timed out"), { name: "TimeoutError" }));
          if (signal?.aborted) fail();
          else signal?.addEventListener("abort", fail);
        }),
    });
    const timed = await send(member, FRIENDLY, timeout.deps);
    expect(decisionOf(timed).status).toBe("pending");
    expect(decisionOf(timed).notice).toBe(PENDING_NOTICE);
    expect(decisionOf(timed).source).toBe("timeout");
    expect(boardOf(await communityBoard(other, timeout.deps)).messages).toHaveLength(0);

    const quota = harness({ fetchImpl: async () => new Response("{}", { status: 429 }) });
    const limited = await send(member, FRIENDLY, quota.deps);
    expect(decisionOf(limited).status).toBe("pending");
    expect(decisionOf(limited).source).toBe("quota");
    expect(decisionOf(limited).notice).toBe(PENDING_NOTICE);

    const broken = harness({ fetchImpl: async () => new Response("nope", { status: 500 }) });
    const failed = await send(member, FRIENDLY, broken.deps);
    expect(decisionOf(failed).status).toBe("pending");
    expect(decisionOf(failed).source).toBe("error");
    expect(JSON.stringify(failed.body)).not.toContain(SECRET);
  });

  it("does not call the provider or pretend a check succeeded when no key is configured", async () => {
    const fetchImpl: typeof fetch = async () => {
      throw new Error("live call");
    };
    const { deps } = harness({ apiKey: "", fetchImpl });
    const result = await send(member, FRIENDLY, deps);
    expect(decisionOf(result).status).toBe("pending");
    expect(decisionOf(result).source).toBe("not-configured");
    expect(decisionOf(result).notice).toContain("awaiting moderation");
    expect(decisionOf(result).notice).not.toMatch(/published/i);
    const outcome = await moderateText(FRIENDLY, { apiKey: "  ", fetchImpl });
    expect(outcome.kind).toBe("not-configured");
    const board = boardOf(await communityBoard(member, deps));
    expect(board.moderation).toBe("not-configured");
    expect(board.messages).toHaveLength(0);
    expect(board.mine[0]?.status).toBe("pending");
  });

  it("dedupes a repeated submit so the provider is called once", async () => {
    let calls = 0;
    let release: (value: Response) => void = () => undefined;
    const gate = new Promise<Response>((resolve) => {
      release = resolve;
    });
    const { deps, repo } = harness({
      fetchImpl: () => {
        calls += 1;
        return gate;
      },
    });
    const first = send(member, FRIENDLY, deps);
    const second = send(member, FRIENDLY, deps);
    for (let attempt = 0; attempt < 20 && calls === 0; attempt += 1) {
      await new Promise((resolve) => setTimeout(resolve, 5));
    }
    expect(calls).toBe(1);
    release(providerResponse(false));
    const [a, b] = await Promise.all([first, second]);
    expect(decisionOf(a).message.id).toBe(decisionOf(b).message.id);
    expect(await repo.listMessages()).toHaveLength(1);

    const again = await send(member, FRIENDLY, deps);
    expect(decisionOf(again).duplicate).toBe(true);
    expect(calls).toBe(1);
    expect(await repo.listMessages()).toHaveLength(1);
  });

  it("applies a temporary limit after repeat harassment and does not permanently ban", async () => {
    const { deps, repo, setClock } = harness({
      fetchImpl: async () => {
        throw new Error("provider should not be called");
      },
    });
    for (const sample of ["You are an idiot", "You are a moron", "You are stupid"]) {
      expect(decisionOf(await send(member, sample, deps)).status).toBe("rejected");
    }
    const profile = await repo.getProfile(MEMBER);
    expect(profile?.violations).toHaveLength(3);
    expect(profile?.restrictedUntil).toBeTruthy();
    expect(profile).not.toHaveProperty("banned");
    const blocked = await send(member, FRIENDLY, deps);
    expect(blocked.status).toBe(403);
    expect(String(blocked.body.error)).toMatch(/temporary/i);
    expect(String(blocked.body.error)).toMatch(/not a permanent ban/i);
    expect(JSON.stringify(blocked.body)).not.toContain("banned");
    expect((await repo.listMessages()).some((message) => message.body === FRIENDLY)).toBe(false);

    setClock(new Date("2026-11-09T13:00:00.000Z"));
    const clear = harness({
      repo,
      now: () => new Date("2026-11-09T13:00:00.000Z"),
    });
    const restored = await send(member, FRIENDLY, clear.deps);
    expect(decisionOf(restored).status).toBe("approved");
  });

  it("does not restrict someone after one uncertain result", async () => {
    const { deps, repo } = harness({ fetchImpl: async () => new Response("{}", { status: 429 }) });
    const pending = await send(member, FRIENDLY, deps);
    expect(decisionOf(pending).status).toBe("pending");
    expect((await repo.getProfile(MEMBER))?.restrictedUntil).toBeNull();
    expect((await repo.getProfile(MEMBER))?.violations).toHaveLength(0);
    const next = harness({
      repo,
      fetchImpl: async () => providerResponse(false),
    });
    const published = await send(member, "I slept well and I am keeping the same bedtime tonight.", next.deps);
    expect(decisionOf(published).status).toBe("approved");
  });

  it("supports report, block, mute, remove, and appeal", async () => {
    const { deps, repo } = harness();
    const post = decisionOf(await send(member, FRIENDLY, deps));
    const comment = decisionOf(
      await submitCommunity(other, { action: "submit", displayName: "Brook", body: "I can start with ten minutes too.", parentId: post.message.id }, deps),
    );
    expect(comment.message.parentId).toBe(post.message.id);
    const rude = await submitCommunity(other, { action: "submit", displayName: "Brook", body: "You are an idiot", parentId: post.message.id }, deps);
    expect(decisionOf(rude).status).toBe("rejected");

    const report = await communityAction(other, { action: "report", messageId: post.message.id, reason: "spam" }, deps);
    expect(report.status).toBe(200);
    const repeat = await communityAction(other, { action: "report", messageId: post.message.id, reason: "spam" }, deps);
    expect(repeat.body.duplicate).toBe(true);
    await communityAction(admin, { action: "report", messageId: post.message.id, reason: "harassment" }, deps);
    const queue = boardOf(await communityBoard(admin, deps)).queue;
    expect(queue?.reports).toHaveLength(2);
    expect(queue?.reports.map((item) => item.reason).sort()).toEqual(["harassment", "spam"]);
    expect(queue?.reports[0]?.reportCount).toBe(2);
    expect(queue?.reports[0]?.createdAt).toBeTruthy();
    expect(JSON.stringify(queue)).not.toContain(OTHER);

    const dismissed = await communityAction(admin, { action: "admin-dismiss", reportId: queue?.reports[0]?.id }, deps);
    expect(dismissed.status).toBe(200);
    expect(boardOf(await communityBoard(admin, deps)).queue?.reports).toHaveLength(1);
    expect((await repo.getProfile(MEMBER))?.violations ?? []).toHaveLength(0);

    await communityAction(other, { action: "block", messageId: post.message.id }, deps);
    expect(boardOf(await communityBoard(other, deps)).messages.map((message) => message.authorName)).not.toContain("River");
    expect(boardOf(await communityBoard(member, deps)).messages.map((message) => message.authorName)).not.toContain("Brook");
    const fresh = harness();
    const visible = decisionOf(await send(member, FRIENDLY, fresh.deps));
    await send(other, "A short stretch after dinner is my plan.", fresh.deps);
    await communityAction(other, { action: "mute", messageId: visible.message.id }, fresh.deps);
    expect(boardOf(await communityBoard(other, fresh.deps)).messages.map((message) => message.authorName)).not.toContain("River");
    expect(boardOf(await communityBoard(member, fresh.deps)).messages.map((message) => message.authorName)).toContain("Brook");

    await communityAction(member, { action: "remove", messageId: visible.message.id }, fresh.deps);
    expect(boardOf(await communityBoard(member, fresh.deps)).messages.map((message) => message.body)).not.toContain(FRIENDLY);
    expect((await fresh.repo.getMessage(visible.message.id))?.body).toBe("");

    const appealRepo = createMemoryRepository();
    const appealDeps = harness({ repo: appealRepo, fetchImpl: async () => { throw new Error("no"); } }).deps;
    const rejected = decisionOf(await send(member, "You are an idiot", appealDeps));
    const appealed = await communityAction(member, { action: "appeal", messageId: rejected.message.id }, appealDeps);
    expect(decisionOf(appealed).status).toBe("pending");
    expect(decisionOf(appealed).notice).toContain("awaiting moderation");
    expect(boardOf(await communityBoard(other, appealDeps)).messages).toHaveLength(0);
    expect(boardOf(await communityBoard(admin, appealDeps)).queue?.pending[0]?.appealed).toBe(true);
    const second = await communityAction(member, { action: "appeal", messageId: rejected.message.id }, appealDeps);
    expect(second.status).toBe(400);
  });

  it("lets only the allowlisted admin approve or reject, and keeps uncertain reviews from counting", async () => {
    const { deps } = harness({ apiKey: "" });
    const waiting = decisionOf(await send(member, FRIENDLY, deps));
    const denied = await communityAction(member, { action: "admin-approve", messageId: waiting.message.id, isAdmin: true }, deps);
    expect(denied.status).toBe(403);
    const approved = await communityAction(admin, { action: "admin-approve", messageId: waiting.message.id }, deps);
    expect(approved.status).toBe(200);
    expect(boardOf(await communityBoard(other, deps)).messages).toHaveLength(1);

    const pending = decisionOf(await send(member, "I am keeping water nearby during the day.", deps));
    await communityAction(admin, { action: "admin-reject", messageId: pending.message.id }, deps);
    const mine = boardOf(await communityBoard(member, deps)).mine.find((message) => message.id === pending.message.id);
    expect(mine?.notice).toBe(REJECTION_NOTICE);
    const profile = await deps.repo.getProfile(MEMBER);
    expect(profile?.restrictedUntil).toBeNull();
    expect(profile).not.toHaveProperty("banned");
  });

  it("deletes old rejected records and keeps a published message", async () => {
    let clock = new Date("2026-11-06T12:00:00.000Z");
    const repo = createMemoryRepository();
    const deps: CommunityDeps = {
      repo,
      storage: "memory",
      apiKey: SECRET,
      fetchImpl: async () => providerResponse(false),
      now: () => clock,
    };
    const published = decisionOf(await send(member, FRIENDLY, deps));
    await send(member, "You are an idiot", deps);
    clock = new Date("2026-12-08T12:00:00.000Z");
    await communityBoard(member, deps);
    const left = await repo.listMessages();
    expect(left.map((message) => message.id)).toEqual([published.message.id]);
  });

  it("stops a member from burning the provider quota and still refuses to publish", async () => {
    let calls = 0;
    const { deps, repo } = harness({
      maxProviderCallsPerHour: 1,
      fetchImpl: async () => {
        calls += 1;
        return providerResponse(false);
      },
    });
    expect(decisionOf(await send(member, FRIENDLY, deps)).status).toBe("approved");
    const second = await send(member, "I am taking the stairs once this afternoon.", deps);
    expect(second.status).toBe(429);
    expect(String(second.body.error)).toMatch(/not published/i);
    expect(calls).toBe(1);
    expect((await repo.listMessages()).some((message) => message.body.includes("stairs"))).toBe(false);
  });

  it("keeps the local list configurable and still does not publish when the provider is off", async () => {
    const { deps } = harness({
      apiKey: "",
      filterConfig: { ...defaultFilterConfig, enabled: false },
    });
    const result = await send(member, "This habit note is fuck hard", deps);
    expect(decisionOf(result).status).toBe("pending");
    expect(runLocalFilter("This habit note is fuck hard", { ...defaultFilterConfig, enabled: false }).action).toBe("allow");
    expect(defaultFilterConfig.enabled).toBe(true);
    expect(defaultFilterConfig.englishProfanity.length).toBeGreaterThan(0);
    expect(defaultFilterConfig.russianProfanity.length).toBeGreaterThan(0);
  });

  it("uses the admin allowlist in the request handler and hides the key", async () => {
    expect(isAdminEmail("tatyanaserikovaru@gmail.com")).toBe(true);
    const repo = createMemoryRepository();
    const posted = await handleCommunityRequest(
      {
        method: "POST",
        authorization: "Bearer member-token",
        body: { action: "submit", displayName: "River", body: FRIENDLY, isAdmin: true },
      },
      {
        repo,
        apiKey: "",
        readAccount: async () => ({ id: MEMBER, email: "member@example.com", isAdmin: true }),
      },
    );
    expect(posted.status).toBe(200);
    const messageId = decisionOf(posted).message.id;
    const forged = await handleCommunityRequest(
      { method: "POST", authorization: "Bearer member-token", body: { action: "admin-approve", messageId, isAdmin: true } },
      { repo, apiKey: SECRET, readAccount: async () => ({ id: MEMBER, email: "member@example.com", isAdmin: true }) },
    );
    expect(forged.status).toBe(403);
    expect(JSON.stringify(forged.body)).not.toContain(SECRET);
    const allowed = await handleCommunityRequest(
      { method: "POST", authorization: "Bearer admin-token", body: { action: "admin-approve", messageId } },
      {
        repo,
        apiKey: SECRET,
        readAccount: async () => ({ id: ADMIN, email: "Tatyanaserikovaru@gmail.com", isAdmin: false }),
      },
    );
    expect(allowed.status).toBe(200);
    const signedOut = await handleCommunityRequest(
      { method: "GET", authorization: null, body: null },
      { repo, apiKey: "", readAccount: async () => null },
    );
    expect(boardOf(signedOut).signedIn).toBe(false);
    expect(boardOf(signedOut).messages).toHaveLength(0);
    expect(boardOf(signedOut).privacyNotice).toBe(PRIVACY_NOTICE);
    const refused = await handleCommunityRequest(
      { method: "POST", authorization: null, body: { action: "submit", displayName: "River", body: FRIENDLY } },
      { repo, apiKey: "", readAccount: async () => null },
    );
    expect(refused.status).toBe(401);
  });

  it("stores community rows only in community tables", async () => {
    expect(communityRepositoryFromEnv({}, () => {
      throw new Error("should not connect");
    })).toBeNull();
    let connected = false;
    const repo = communityRepositoryFromEnv(
      {
        NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
        NEXT_PUBLIC_SUPABASE_ANON_KEY: "public-anon-key-value-0001",
        SUPABASE_SERVICE_ROLE_KEY: "server-role-test-value-0001",
      },
      () => {
        connected = true;
        return fakeDb();
      },
    );
    expect(connected).toBe(true);
    expect(repo).not.toBeNull();
    const profile = {
      userId: MEMBER,
      displayName: "River",
      restrictedUntil: null,
      violations: [],
      providerCalls: [],
    };
    await repo?.saveProfile(profile);
    expect((await repo?.getProfile(MEMBER))?.displayName).toBe("River");
    expect(() => guardCommunityClient(fakeDb()).from("assessments")).toThrow(/cannot use that table/);
    expect(COMMUNITY_TABLES).not.toContain("assessments");
    expect(COMMUNITY_TABLES).not.toContain("profiles");
  });

  it("documents the free provider, the empty key, and the retention window", () => {
    const provider = readFileSync("src/lib/community/provider.ts", "utf8");
    const env = readFileSync(".env.example", "utf8");
    const privacy = readFileSync("src/app/(public)/privacy/page.tsx", "utf8");
    const sql = readFileSync("supabase/schema.sql", "utf8");
    const view = readFileSync("src/components/community-view.tsx", "utf8");
    expect(provider).toContain(MODERATION_ENDPOINT);
    expect(provider).toContain(MODERATION_MODEL);
    expect(provider).not.toContain("chat/completions");
    expect(env).toMatch(/^OPENAI_API_KEY=$/m);
    expect(env).not.toMatch(/^NEXT_PUBLIC_OPENAI/m);
    expect(env).not.toMatch(/sk-[A-Za-z0-9]{20,}/);
    expect(privacy).toContain("Submitted message text may be processed by an external moderation provider.");
    expect(privacy).toContain("30 days");
    expect(sql).toContain("kept for 30 days");
    expect(sql).toContain("revoke all on table public.community_messages");
    expect(sql).toContain("delete from public.community_messages where author_id = actor");
    expect(view).toContain("PRIVACY_NOTICE");
    expect(view).not.toContain("OPENAI");
    expect(view).not.toContain("SERVICE_ROLE");
    expect(view).not.toContain("process.env");
    const files = walk("src/lib/community")
      .filter((file) => !file.endsWith(".test.ts"))
      .concat(["src/app/api/community/route.ts", "src/components/community-view.tsx"]);
    for (const file of files) {
      const source = readFileSync(file, "utf8");
      expect(source).not.toContain("chat/completions");
      expect(source).not.toContain("NEXT_PUBLIC_OPENAI");
      expect(source).not.toContain("console.log");
    }
  });
});

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

function fakeDb(): CommunityDbClient {
  const tables: Record<string, Row[]> = {
    community_profiles: [],
    community_messages: [],
    community_reports: [],
    community_blocks: [],
    community_mutes: [],
  };
  return {
    from(table: string) {
      if (!tables[table]) throw new Error(`blocked table ${table}`);
      const filters: ((row: Row) => boolean)[] = [];
      let op: "select" | "insert" | "update" | "delete" | "upsert" = "select";
      let payload: Row | null = null;
      const builder = {
        select() {
          return builder;
        },
        insert(row: Row) {
          op = "insert";
          payload = { ...row };
          return builder;
        },
        update(row: Row) {
          op = "update";
          payload = { ...row };
          return builder;
        },
        upsert(row: Row) {
          op = "upsert";
          payload = { ...row };
          return builder;
        },
        delete() {
          op = "delete";
          return builder;
        },
        eq(column: string, value: unknown) {
          filters.push((row) => row[column] === value);
          return builder;
        },
        order() {
          return builder;
        },
        limit() {
          return builder;
        },
        async execute() {
          const match = (row: Row) => filters.every((filter) => filter(row));
          const rows = tables[table] ?? [];
          if (op === "insert" && payload) rows.push(payload);
          if (op === "upsert" && payload) {
            const key = "user_id" in payload ? "user_id" : "id";
            const index = rows.findIndex((row) => row[key] === payload?.[key]);
            if (index >= 0) rows[index] = { ...rows[index], ...payload };
            else rows.push(payload);
          }
          if (op === "update" && payload) tables[table] = rows.map((row) => (match(row) ? { ...row, ...payload } : row));
          if (op === "delete") tables[table] = rows.filter((row) => !match(row));
          return { data: (tables[table] ?? []).filter(match), error: null };
        },
        async maybeSingle() {
          const result = await builder.execute();
          return { data: result.data[0] ?? null, error: null };
        },
        then(onfulfilled: (value: { data: Row[]; error: null }) => unknown) {
          return builder.execute().then(onfulfilled);
        },
      };
      return builder;
    },
  } as CommunityDbClient;
}
