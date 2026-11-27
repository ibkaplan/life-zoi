import { createMailer } from "@/lib/email-challenge/mailer";
import { cronAuthorized, getChallengeRepository } from "@/lib/email-challenge/runtime";
import { runDailySend } from "@/lib/email-challenge/service";

const NO_STORE = { "Cache-Control": "no-store" };

/**
 * The scheduled sending run. Only a caller with `Authorization: Bearer <CRON_SECRET>`
 * gets past the first line. With EMAIL_PROVIDER off (the default) it only counts
 * what would be due and changes nothing. The report holds counts, never addresses.
 * No schedule is set up in this repository; see docs/claude-migration/EMAIL_CHALLENGE.md.
 */
export async function GET(request: Request) {
  if (!cronAuthorized(request.headers.get("authorization"))) {
    return Response.json({ error: "Not allowed." }, { status: 401, headers: NO_STORE });
  }
  const { repo, storage } = getChallengeRepository();
  if (storage !== "database") return Response.json({ error: "Storage is not set up." }, { status: 503, headers: NO_STORE });
  try {
    const report = await runDailySend(repo, createMailer(), new Date());
    return Response.json(report, { headers: NO_STORE });
  } catch {
    return Response.json({ error: "The run stopped early. The next run carries on." }, { status: 503, headers: NO_STORE });
  }
}
