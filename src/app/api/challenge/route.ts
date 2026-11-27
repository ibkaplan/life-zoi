import { randomUUID } from "node:crypto";
import { memberFromRequest } from "@/lib/auth/session";
import { mailerMode } from "@/lib/email-challenge/mailer";
import { allowSignup, clientAddress, getChallengeRepository } from "@/lib/email-challenge/runtime";
import { joinChallenge, memberLeave, memberStatus } from "@/lib/email-challenge/service";
import { jsonError, readJson } from "@/lib/http";
import { msg } from "@/lib/i18n/translate";

const NO_STORE = { "Cache-Control": "private, no-store" };

async function signedIn(request: Request) {
  const state = await memberFromRequest(request);
  return state.status === "member" ? state.member : null;
}

/**
 * Public. Whether emails are switched on, and for a signed-in member whether they joined.
 * It never says whether some other address has joined.
 */
export async function GET(request: Request) {
  const member = await signedIn(request);
  try {
    const { repo, storage } = getChallengeRepository();
    const status = await memberStatus(member, repo);
    return Response.json({ sending: mailerMode() !== "off", storage, member: status }, { headers: NO_STORE });
  } catch {
    return Response.json({ sending: mailerMode() !== "off", storage: "unavailable", member: null }, { headers: NO_STORE });
  }
}

/** Public. Join with consent. A visitor's address waits for its confirmation link; a member's account address does not. */
export async function POST(request: Request) {
  const member = await signedIn(request);
  if (!member && !allowSignup(clientAddress(request))) {
    return jsonError(msg("Too many tries from this connection. Try again in an hour."), 429);
  }
  const body = await readJson(request, 2_000);
  if (!body.ok) return jsonError(body.error, body.status);
  if (!body.value || typeof body.value !== "object" || Array.isArray(body.value)) return jsonError(msg("The request could not be read."), 400);
  try {
    const result = await joinChallenge(
      { body: body.value as Record<string, unknown>, member, now: new Date(), newId: randomUUID },
      getChallengeRepository().repo,
    );
    return Response.json(result.body, { status: result.status, headers: NO_STORE });
  } catch {
    return Response.json({ error: msg("Your sign-up could not be saved. Try again later.") }, { status: 503, headers: NO_STORE });
  }
}

/** A signed-in member leaves the challenge; their row is deleted. Visitors use the link in any email. */
export async function DELETE(request: Request) {
  const member = await signedIn(request);
  if (!member) return jsonError(msg("Sign in to use lifeZoi."), 401);
  try {
    const result = await memberLeave(member, getChallengeRepository().repo);
    return Response.json(result.body, { status: result.status, headers: NO_STORE });
  } catch {
    return Response.json({ error: msg("That did not work. Try again later.") }, { status: 503, headers: NO_STORE });
  }
}
