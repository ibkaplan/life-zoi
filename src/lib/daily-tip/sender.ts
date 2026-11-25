import type { Senders } from "@/lib/messaging";
import { composeTip, translatorFor } from "./compose";
import type { TipRepository } from "./repository";
import { localClock } from "./schedule";
import { tipForDate } from "./tips";
import type { TipSubscription } from "./types";

export type SendSummary = {
  checked: number;
  due: number;
  sent: number;
  dryRun: number;
  failed: number;
  /** Telegram is chosen but the member never finished linking it. */
  notLinked: number;
  live: { email: boolean; telegram: boolean };
};

/** Due when a channel is on, the local hour has reached the chosen hour, and nothing went out today. */
export function isDue(sub: TipSubscription, now: Date): boolean {
  if (!sub.email && !sub.telegram) return false;
  const clock = localClock(now, sub.timeZone);
  return clock.hour >= sub.sendHour && sub.lastSentOn !== clock.date;
}

/**
 * One pass of the daily send. Meant to run once an hour. With dry-run senders
 * nothing leaves the server and no row is marked sent, so a later live run still sends.
 */
export async function runDailySend(input: {
  now: Date;
  repo: TipRepository;
  senders: Senders;
  emailFor: (userId: string) => Promise<string | null>;
  siteUrl: string;
}): Promise<SendSummary> {
  const { now, repo, senders, emailFor, siteUrl } = input;
  const summary: SendSummary = {
    checked: 0,
    due: 0,
    sent: 0,
    dryRun: 0,
    failed: 0,
    notLinked: 0,
    live: { email: senders.email.live, telegram: senders.telegram.live },
  };
  const rows = await repo.listActive();
  summary.checked = rows.length;
  for (const sub of rows) {
    if (!isDue(sub, now)) continue;
    summary.due += 1;
    const date = localClock(now, sub.timeZone).date;
    const text = composeTip(tipForDate(date), await translatorFor(sub.locale), siteUrl, sub.locale);
    let delivered = false;
    if (sub.email) {
      const to = await emailFor(sub.userId);
      if (to) {
        const result = await senders.email.send({ channel: "email", to, subject: text.subject, text: text.emailText, headers: text.headers });
        if (result.status === "sent") delivered = true;
        summary[result.status === "sent" ? "sent" : result.status === "dry-run" ? "dryRun" : "failed"] += 1;
      } else summary.failed += 1;
    }
    if (sub.telegram) {
      if (!sub.telegramChatId) summary.notLinked += 1;
      else {
        const result = await senders.telegram.send({ channel: "telegram", to: sub.telegramChatId, text: text.telegramText });
        if (result.status === "sent") delivered = true;
        summary[result.status === "sent" ? "sent" : result.status === "dry-run" ? "dryRun" : "failed"] += 1;
      }
    }
    if (delivered) await repo.markSent(sub.userId, date);
  }
  return summary;
}
