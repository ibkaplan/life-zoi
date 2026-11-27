import { requireAdmin } from "@/lib/auth/require-member";
import { senderTipAccess, siteUrl } from "@/lib/daily-tip/runtime";
import { runDailySend } from "@/lib/daily-tip/sender";
import { msg } from "@/lib/i18n/translate";
import { getSenders, readMessagingConfig } from "@/lib/messaging";

const NO_STORE = { "Cache-Control": "private, no-store" };

/**
 * Administrator only: runs one pass of the daily send now and returns counts.
 * It is a dry run (nothing leaves the server) unless the server has
 * DAILY_TIP_SENDING=on and a configured provider. No schedule calls it yet.
 */
export async function POST(request: Request) {
  const checked = await requireAdmin(request);
  if (!checked.ok) return checked.response;
  const access = senderTipAccess();
  if (!access) {
    return Response.json({ error: msg("The daily send needs the server's account key, which is not set here.") }, { status: 503, headers: NO_STORE });
  }
  try {
    const summary = await runDailySend({ now: new Date(), repo: access.repo, senders: getSenders(readMessagingConfig()), emailFor: access.emailFor, siteUrl: siteUrl() });
    return Response.json({ summary }, { headers: NO_STORE });
  } catch {
    return Response.json({ error: msg("The daily send could not run. Try again later.") }, { status: 503, headers: NO_STORE });
  }
}
