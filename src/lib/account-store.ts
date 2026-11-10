"use client";

import { useSyncExternalStore } from "react";
import { msg } from "@/lib/i18n/translate";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  normalizeStoredIds,
  prepareAccountWrite,
  rowsToSession,
  shouldCopyLocalIntoAccount,
  type AccountRead,
  type AccountWrite,
} from "@/lib/account-records";
import { isAdminEmail } from "@/lib/admin-allowlist";
import { writeBrowserStore } from "@/lib/browser-store";
import {
  authenticatorQrSrc,
  isTotpCode,
  needsSecondFactor,
  publicAuthMessage,
  validateAccountCredentials,
} from "@/lib/mfa";
import {
  CONFIRMATION_RESENT,
  emailRequestMessage,
  isEmailAddress,
  PASSWORD_UPDATED,
  passwordChangeMessage,
  RESET_REQUEST_SENT,
  resetRedirectUrl,
  validateNewPassword,
} from "@/lib/password-recovery";
import { loadStoredSession } from "@/lib/session";
import { getBrowserSupabase } from "@/lib/supabase-browser";
import { emptySession, type UserSession } from "@/lib/types";

const SAVE_ERROR = msg("Saved answers could not be stored. Try again.");
const LOAD_ERROR = msg("Saved answers could not be loaded.");
const SAMPLE_ERROR = msg("Sample data is not saved to an account.");

export type AccountPhase = "loading" | "off" | "signed-out" | "needs-mfa" | "ready" | "error";

export type AuthenticatorEnrollment = {
  factorId: string;
  qr: string;
  secret: string;
};

export type AccountSnapshot = {
  phase: AccountPhase;
  email: string | null;
  userId: string | null;
  isAdmin: boolean;
  factorVerified: boolean;
  session: UserSession;
  error: string;
  enrollment: AuthenticatorEnrollment | null;
};

const initialSnapshot: AccountSnapshot = {
  phase: "loading",
  email: null,
  userId: null,
  isAdmin: false,
  factorVerified: false,
  session: emptySession(),
  error: "",
  enrollment: null,
};

let snapshot: AccountSnapshot = initialSnapshot;
let started = false;
let generation = 0;
let localEdits = 0;
let pending: UserSession | null = null;
let writing = false;
let timer = 0;
const listeners = new Set<() => void>();
let refreshQueue: Promise<void> = Promise.resolve();

function emit() {
  for (const listener of listeners) listener();
}

function publish(next: AccountSnapshot) {
  snapshot = next;
  emit();
}

function signedOut(error = ""): AccountSnapshot {
  return {
    phase: "signed-out",
    email: null,
    userId: null,
    isAdmin: false,
    factorVerified: false,
    session: emptySession(),
    error,
    enrollment: null,
  };
}

export function subscribeAccount(listener: () => void) {
  listeners.add(listener);
  if (!started && typeof window !== "undefined") {
    started = true;
    window.addEventListener("pagehide", () => {
      if (pending) void flush();
    });
    void boot();
  }
  return () => {
    listeners.delete(listener);
  };
}

export function getAccountSnapshot() {
  return snapshot;
}

export function getAccountServerSnapshot() {
  return initialSnapshot;
}

export function useAccount() {
  return useSyncExternalStore(subscribeAccount, getAccountSnapshot, getAccountServerSnapshot);
}

async function boot() {
  const supabase = getBrowserSupabase();
  if (!supabase) {
    publish({ ...signedOut(), phase: "off" });
    return;
  }
  supabase.auth.onAuthStateChange((event) => {
    if (event === "SIGNED_OUT") {
      generation += 1;
      pending = null;
      publish(signedOut());
      return;
    }
    if (event === "INITIAL_SESSION" ||
      event === "SIGNED_IN" ||
      event === "PASSWORD_RECOVERY" ||
      event === "MFA_CHALLENGE_VERIFIED") {
      queueRefresh();
    }
  });
  queueRefresh();
}

function queueRefresh() {
  refreshQueue = refreshQueue.then(() => refreshFromAuth()).catch(() => undefined);
}

async function refreshFromAuth() {
  const supabase = getBrowserSupabase();
  if (!supabase) {
    publish({ ...signedOut(), phase: "off" });
    return;
  }
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user?.id) {
    if (snapshot.phase !== "signed-out" && snapshot.phase !== "off") publish(signedOut());
    return;
  }
  const userId = data.user.id;
  const email = data.user.email ?? null;
  const assurance = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (assurance.error || !assurance.data) {
    publish({ ...signedOut(LOAD_ERROR), phase: "error", email, userId });
    return;
  }
  const listed = await supabase.auth.mfa.listFactors();
  const verifiedTotp = listed.data?.totp ?? [];
  if (needsSecondFactor(assurance.data.currentLevel, assurance.data.nextLevel)) {
    generation += 1;
    pending = null;
    publish({
      phase: "needs-mfa",
      email,
      userId,
      isAdmin: false,
      factorVerified: true,
      session: emptySession(),
      error: "",
      enrollment: null,
    });
    return;
  }
  if (snapshot.phase === "ready" && snapshot.userId === userId) {
    publish({ ...snapshot, email, factorVerified: verifiedTotp.length > 0 });
    await refreshAdmin(userId);
    return;
  }
  await loadReady(supabase, userId, email, verifiedTotp.length > 0);
}

async function loadReady(
  supabase: SupabaseClient,
  userId: string,
  email: string | null,
  factorVerified: boolean,
) {
  const editsAtStart = localEdits;
  const genAtStart = generation;
  const loaded = await fetchAccount(supabase, userId);
  if (editsAtStart !== localEdits || genAtStart !== generation) return;
  if ("error" in loaded) {
    publish({
      phase: "error",
      email,
      userId,
      isAdmin: false,
      factorVerified,
      session: emptySession(),
      error: loaded.error,
      enrollment: null,
    });
    return;
  }
  const local = loadStoredSession(window.sessionStorage);
  let session = loaded.session;
  let saveError: string | null = null;
  if (shouldCopyLocalIntoAccount(loaded.session, local)) {
    session = normalizeStoredIds(local);
    saveError = await persist(session, generation);
    if (editsAtStart !== localEdits || genAtStart !== generation) return;
    if (!saveError) writeBrowserStore(emptySession(), false);
  } else {
    writeBrowserStore(local, false);
    if (!loaded.hadProfile) saveError = await persist(session, generation);
    if (editsAtStart !== localEdits || genAtStart !== generation) return;
  }
  publish({
    phase: "ready",
    email,
    userId,
    isAdmin: false,
    factorVerified,
    session,
    error: saveError ?? "",
    enrollment: null,
  });
  await refreshAdmin(userId);
}

async function refreshAdmin(userId: string) {
  const supabase = getBrowserSupabase();
  if (!supabase || snapshot.userId !== userId || snapshot.phase !== "ready") return;
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) return;
  try {
    const response = await fetch("/api/account", {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (snapshot.userId !== userId || snapshot.phase !== "ready") return;
    if (!response.ok) {
      publish({ ...snapshot, isAdmin: false });
      return;
    }
    const body = (await response.json()) as { isAdmin?: unknown };
    if (snapshot.userId !== userId || snapshot.phase !== "ready") return;
    publish({ ...snapshot, isAdmin: body.isAdmin === true });
  } catch {
    if (snapshot.userId === userId && snapshot.phase === "ready") {
      publish({ ...snapshot, isAdmin: false });
    }
  }
}

async function fetchAccount(
  supabase: SupabaseClient,
  userId: string,
): Promise<{ session: UserSession; hadProfile: boolean } | { error: string }> {
  const [profile, assessments, scenarios, goals, checkIns] = await Promise.all([
    supabase.from("profiles").select("display_name, session_state").eq("user_id", userId).maybeSingle(),
    supabase.from("assessments").select("id, answers, completed_at").eq("user_id", userId).order("completed_at", { ascending: false }),
    supabase.from("scenarios").select("id, habit_id, note, saved_at").eq("user_id", userId).order("saved_at", { ascending: false }),
    supabase.from("habit_goals").select("habit_id, days_per_week").eq("user_id", userId),
    supabase.from("check_ins").select("id, habit_id, entry_date, done, note").eq("user_id", userId).order("entry_date", { ascending: false }),
  ]);
  const failed = [profile.error, assessments.error, scenarios.error, goals.error, checkIns.error].some(Boolean);
  if (failed) return { error: LOAD_ERROR };
  const read: AccountRead = {
    profile: profile.data,
    assessments: assessments.data ?? [],
    scenarios: scenarios.data ?? [],
    goals: goals.data ?? [],
    checkIns: checkIns.data ?? [],
  };
  return { session: rowsToSession(read), hadProfile: profile.data !== null };
}

export function writeAccountSession(next: UserSession, mode: "soon" | "now" = "now") {
  if (snapshot.phase !== "ready" || !snapshot.userId) return;
  const prepared = prepareAccountWrite(next, snapshot.userId, new Date().toISOString());
  if (!prepared.ok) {
    publish({ ...snapshot, error: prepared.reason === "sample" ? SAMPLE_ERROR : SAVE_ERROR });
    return;
  }
  const session = rowsToSession(rowsToRead(prepared.rows));
  localEdits += 1;
  pending = session;
  publish({ ...snapshot, session, error: "" });
  if (mode === "now") {
    window.clearTimeout(timer);
    void flush();
  } else {
    window.clearTimeout(timer);
    timer = window.setTimeout(() => {
      void flush();
    }, 400);
  }
}

function rowsToRead(rows: AccountWrite): AccountRead {
  return {
    profile: { display_name: rows.profile.display_name, session_state: rows.profile.session_state },
    assessments: rows.assessments.map((row) => ({
      id: row.id,
      answers: row.answers,
      completed_at: row.completed_at,
    })),
    scenarios: rows.scenarios.map((row) => ({
      id: row.id,
      habit_id: row.habit_id,
      note: row.note,
      saved_at: row.saved_at,
    })),
    goals: rows.goals.map((row) => ({ habit_id: row.habit_id, days_per_week: row.days_per_week })),
    checkIns: rows.checkIns.map((row) => ({
      id: row.id,
      habit_id: row.habit_id,
      entry_date: row.entry_date,
      done: row.done,
      note: row.note,
    })),
  };
}

async function flush() {
  if (writing) return;
  writing = true;
  try {
    while (pending) {
      const next = pending;
      pending = null;
      const gen = generation;
      const saveError = await persist(next, gen);
      if (gen !== generation) return;
      if (saveError) publish({ ...snapshot, error: saveError });
    }
  } finally {
    writing = false;
    if (pending) void flush();
  }
}

async function persist(session: UserSession, gen: number): Promise<string | null> {
  if (gen !== generation) return null;
  const supabase = getBrowserSupabase();
  if (!supabase) return SAVE_ERROR;
  const { data, error } = await supabase.auth.getUser();
  if (gen !== generation) return null;
  if (error || !data.user?.id) return msg("Sign in again to save answers.");
  const prepared = prepareAccountWrite(session, data.user.id, new Date().toISOString());
  if (!prepared.ok) return prepared.reason === "sample" ? SAMPLE_ERROR : SAVE_ERROR;
  if (gen !== generation) return null;
  return writePrepared(supabase, data.user.id, prepared.rows);
}

async function writePrepared(
  supabase: SupabaseClient,
  userId: string,
  rows: AccountWrite,
): Promise<string | null> {
  const profile = await supabase.from("profiles").upsert(rows.profile, { onConflict: "user_id" });
  if (profile.error) return dbError(profile.error.message);
  if (rows.assessments.length > 0) {
    const saved = await supabase.from("assessments").upsert(rows.assessments, { onConflict: "id" });
    if (saved.error) return dbError(saved.error.message);
  }
  const removedAssessments = await deleteMissing(supabase, "assessments", userId, "id", rows.assessments.map((row) => row.id));
  if (removedAssessments) return removedAssessments;
  if (rows.scenarios.length > 0) {
    const saved = await supabase.from("scenarios").upsert(rows.scenarios, { onConflict: "id" });
    if (saved.error) return dbError(saved.error.message);
  }
  const removedScenarios = await deleteMissing(supabase, "scenarios", userId, "id", rows.scenarios.map((row) => row.id));
  if (removedScenarios) return removedScenarios;
  if (rows.goals.length > 0) {
    const saved = await supabase.from("habit_goals").upsert(rows.goals, { onConflict: "user_id,habit_id" });
    if (saved.error) return dbError(saved.error.message);
  }
  const removedGoals = await deleteMissing(supabase, "habit_goals", userId, "habit_id", rows.goals.map((row) => row.habit_id));
  if (removedGoals) return removedGoals;
  if (rows.checkIns.length > 0) {
    const saved = await supabase.from("check_ins").upsert(rows.checkIns, { onConflict: "user_id,habit_id,entry_date" });
    if (saved.error) return dbError(saved.error.message);
  }
  return deleteMissing(supabase, "check_ins", userId, "id", rows.checkIns.map((row) => row.id));
}

function dbError(message: string): string {
  if (/sample data/i.test(message)) return SAMPLE_ERROR;
  return SAVE_ERROR;
}

async function deleteMissing(
  supabase: SupabaseClient,
  table: "assessments" | "scenarios" | "habit_goals" | "check_ins",
  userId: string,
  column: "id" | "habit_id",
  keep: string[],
): Promise<string | null> {
  const safe = keep.filter((value) => /^[A-Za-z0-9-]{2,80}$/.test(value));
  let query = supabase.from(table).delete().eq("user_id", userId);
  if (safe.length > 0) {
    query = query.not(column, "in", `(${safe.map((value) => `"${value}"`).join(",")})`);
  }
  const { error } = await query;
  return error ? SAVE_ERROR : null;
}

export async function clearAccountRecords(): Promise<string | null> {
  if (snapshot.phase !== "ready" || !snapshot.userId) return null;
  const supabase = getBrowserSupabase();
  if (!supabase) return SAVE_ERROR;
  generation += 1;
  pending = null;
  const userId = snapshot.userId;
  publish({ ...snapshot, session: emptySession(), error: "", enrollment: null });
  const tables = ["check_ins", "habit_goals", "scenarios", "assessments", "profiles"] as const;
  for (const table of tables) {
    const { error } = await supabase.from(table).delete().eq("user_id", userId);
    if (error) {
      publish({ ...snapshot, error: msg("Saved answers could not be cleared.") });
      return msg("Saved answers could not be cleared.");
    }
  }
  return null;
}

export async function signUpWithPassword(
  email: string,
  password: string,
): Promise<{ error: string | null; confirmEmail: boolean }> {
  const invalid = validateAccountCredentials(email, password);
  if (invalid) return { error: invalid, confirmEmail: false };
  // New accounts are closed. Supabase sign-ups are off and the database refuses other emails too.
  if (!isAdminEmail(email)) return { error: msg("New accounts are not open yet."), confirmEmail: false };
  const supabase = getBrowserSupabase();
  if (!supabase) return { error: msg("Account sign-in is not configured in this environment."), confirmEmail: false };
  const { data, error } = await supabase.auth.signUp({ email: email.trim(), password });
  if (error) return { error: publicAuthMessage(error.message, msg("The account could not be created.")), confirmEmail: false };
  if (!data.session) return { error: null, confirmEmail: true };
  await refreshFromAuth();
  return { error: null, confirmEmail: false };
}

export async function signInWithPassword(email: string, password: string): Promise<string | null> {
  const invalid = validateAccountCredentials(email, password);
  if (invalid) return invalid;
  const supabase = getBrowserSupabase();
  if (!supabase) return msg("Account sign-in is not configured in this environment.");
  const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
  if (error) {
    if (/confirm/i.test(error.message)) {
      return msg("Confirm the email from the sign-up message, then sign in. Email confirmation stays on.");
    }
    return publicAuthMessage(error.message, msg("Sign-in could not be completed."));
  }
  await refreshFromAuth();
  return null;
}

export async function verifySignInCode(code: string): Promise<string | null> {
  if (!isTotpCode(code)) return msg("Enter the 6-digit code from your authenticator app.");
  const supabase = getBrowserSupabase();
  if (!supabase || snapshot.phase !== "needs-mfa") return msg("Sign in before entering the authenticator code.");
  const listed = await supabase.auth.mfa.listFactors();
  const factor = listed.data?.totp[0];
  if (listed.error || !factor) return msg("No authenticator is set up for this account.");
  const verified = await supabase.auth.mfa.challengeAndVerify({ factorId: factor.id, code: code.trim() });
  if (verified.error) return msg("That code was not accepted. Try the current code.");
  await refreshFromAuth();
  return null;
}

export async function beginAuthenticatorSetup(): Promise<string | null> {
  const supabase = getBrowserSupabase();
  if (!supabase || snapshot.phase !== "ready") return msg("Sign in before setting up an authenticator app.");
  const listed = await supabase.auth.mfa.listFactors();
  if (listed.error || !listed.data) return msg("The authenticator setup could not be started.");
  for (const factor of listed.data.all) {
    if (factor.factor_type === "totp" && factor.status !== "verified") {
      const removed = await supabase.auth.mfa.unenroll({ factorId: factor.id });
      if (removed.error) return msg("The authenticator setup could not be started.");
    }
  }
  const enrolled = await supabase.auth.mfa.enroll({
    factorType: "totp",
    friendlyName: "lifeZoi",
    issuer: "lifeZoi",
  });
  if (enrolled.error || enrolled.data?.type !== "totp") return msg("The authenticator setup could not be started.");
  const qr = authenticatorQrSrc(enrolled.data.totp.qr_code);
  const secret = enrolled.data.totp.secret.trim();
  if (!qr || !secret) return msg("The authenticator setup could not be started.");
  publish({ ...snapshot, enrollment: { factorId: enrolled.data.id, qr, secret }, error: "" });
  return null;
}

export async function confirmAuthenticatorSetup(code: string): Promise<string | null> {
  if (!isTotpCode(code)) return msg("Enter the 6-digit code from your authenticator app.");
  const enrollment = snapshot.enrollment;
  const supabase = getBrowserSupabase();
  if (!supabase || !enrollment || snapshot.phase !== "ready") return msg("Start authenticator setup first.");
  const verified = await supabase.auth.mfa.challengeAndVerify({
    factorId: enrollment.factorId,
    code: code.trim(),
  });
  if (verified.error) return msg("That code was not accepted. Try the current code.");
  publish({ ...snapshot, enrollment: null, factorVerified: true, error: "" });
  await refreshFromAuth();
  return null;
}

export async function cancelAuthenticatorSetup(): Promise<void> {
  const enrollment = snapshot.enrollment;
  publish({ ...snapshot, enrollment: null });
  const supabase = getBrowserSupabase();
  if (supabase && enrollment) await supabase.auth.mfa.unenroll({ factorId: enrollment.factorId });
}

export async function signOutAccount(): Promise<void> {
  generation += 1;
  pending = null;
  const supabase = getBrowserSupabase();
  publish(signedOut());
  if (supabase) await supabase.auth.signOut();
}

export async function deleteSignedInAccount(): Promise<string | null> {
  const supabase = getBrowserSupabase();
  if (!supabase || snapshot.phase !== "ready") return msg("Sign in before deleting the account.");
  const { error } = await supabase.rpc("delete_own_account");
  if (error) return msg("The account could not be deleted.");
  generation += 1;
  pending = null;
  writeBrowserStore(emptySession(), false);
  await supabase.auth.signOut();
  publish(signedOut());
  return null;
}

export type AccountNotice = { ok: true; message: string } | { ok: false; message: string };

const NOT_CONFIGURED = msg("Account sign-in is not configured in this environment.");

/** Sends a reset link. The answer is the same whether or not the email has an account. */
export async function requestPasswordReset(email: string): Promise<AccountNotice> {
  if (!isEmailAddress(email)) return { ok: false, message: msg("Enter a valid email address.") };
  const supabase = getBrowserSupabase();
  if (!supabase) return { ok: false, message: NOT_CONFIGURED };
  const redirectTo = resetRedirectUrl(window.location.origin);
  if (!redirectTo) return { ok: false, message: msg("The reset link could not be prepared on this page.") };
  const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo });
  const problem = emailRequestMessage(error);
  return problem ? { ok: false, message: problem } : { ok: true, message: RESET_REQUEST_SENT };
}

/** Sends the sign-up confirmation email again. Neutral answer, like the reset request. */
export async function resendConfirmationEmail(email: string): Promise<AccountNotice> {
  if (!isEmailAddress(email)) return { ok: false, message: msg("Enter a valid email address.") };
  const supabase = getBrowserSupabase();
  if (!supabase) return { ok: false, message: NOT_CONFIGURED };
  const { error } = await supabase.auth.resend({ type: "signup", email: email.trim() });
  const problem = emailRequestMessage(error);
  return problem ? { ok: false, message: problem } : { ok: true, message: CONFIRMATION_RESENT };
}

/** Sets a new password for the signed-in account, including a session opened by a reset link. */
export async function updateAccountPassword(password: string, confirm: string): Promise<AccountNotice> {
  const invalid = validateNewPassword(password, confirm);
  if (invalid) return { ok: false, message: invalid };
  const supabase = getBrowserSupabase();
  if (!supabase) return { ok: false, message: NOT_CONFIGURED };
  if (snapshot.phase === "needs-mfa") {
    return { ok: false, message: msg("Enter the code from your authenticator app first, then set the new password.") };
  }
  if (snapshot.phase !== "ready") return { ok: false, message: msg("Sign in, or open a new reset link, before changing the password.") };
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { ok: false, message: passwordChangeMessage(error) };
  return { ok: true, message: PASSWORD_UPDATED };
}

export function retryAccountLoad() {
  queueRefresh();
}
