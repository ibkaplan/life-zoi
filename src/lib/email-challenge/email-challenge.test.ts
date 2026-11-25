import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { LOCALES } from "@/lib/i18n/config";
import { CHALLENGE_DAYS, CHALLENGE_LENGTH, EMAIL_WORDS } from "./content";
import { confirmEmail, dayEmail } from "./email";
import { createMailer, mailerMode, type Mailer, type OutboundEmail } from "./mailer";
import { createMemoryChallengeRepository } from "./repository";
import { cronAuthorized } from "./runtime";
import { daysBetween, localDate, nextDueDay, safeTimeZone } from "./schedule";
import { confirmByToken, joinChallenge, memberLeave, normalizeEmail, runDailySend, unsubscribeByToken } from "./service";

let counter = 0;
const newId = () => `00000000-0000-4000-8000-${String(++counter).padStart(12, "0")}`;
const NOW = new Date("2026-11-25T08:00:00Z");

function recordingMailer(result: "sent" | "failed" = "sent"): Mailer & { outbox: OutboundEmail[] } {
  const outbox: OutboundEmail[] = [];
  return { mode: "resend", outbox, send: async (email) => (outbox.push(email), { status: result }) };
}

describe("challenge content", () => {
  it("has seven days in every language, with no empty text", () => {
    expect(CHALLENGE_DAYS.map((item) => item.day)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    for (const item of CHALLENGE_DAYS) {
      for (const locale of LOCALES) {
        const text = item[locale];
        for (const value of [text.title, text.task, text.why]) expect(value.trim().length, `${locale} day ${item.day}`).toBeGreaterThan(5);
        if (locale !== "en") expect(text.task).not.toBe(item.en.task);
      }
    }
  });

  it("makes no health claim with a number in it", () => {
    for (const item of CHALLENGE_DAYS) {
      for (const locale of LOCALES) expect(item[locale].why, `${locale} day ${item.day}`).not.toMatch(/\d|%/);
    }
  });

  it("keeps the email placeholders in every language", () => {
    for (const locale of LOCALES) {
      expect(EMAIL_WORDS[locale].subject).toContain("{day}");
      expect(EMAIL_WORDS[locale].subject).toContain("{title}");
      expect(EMAIL_WORDS[locale].unsubscribe).toContain("{link}");
    }
  });
});

describe("dates in the person's time zone", () => {
  it("reads the local date and refuses odd zone names", () => {
    expect(localDate(new Date("2026-11-25T23:30:00Z"), "Europe/Kyiv")).toBe("2026-11-26");
    expect(localDate(new Date("2026-11-25T03:00:00Z"), "America/New_York")).toBe("2026-11-24");
    expect(safeTimeZone("Not/AZone")).toBe("UTC");
    expect(safeTimeZone("<script>")).toBe("UTC");
    expect(daysBetween("2026-11-25", "2026-12-02")).toBe(7);
  });

  it("sends one email a local day, in order, and stops after seven", () => {
    expect(nextDueDay({ lastSentDay: 0, lastSentOn: null, today: "2026-11-25", length: 7 })).toBe(1);
    expect(nextDueDay({ lastSentDay: 1, lastSentOn: "2026-11-25", today: "2026-11-25", length: 7 })).toBeNull();
    expect(nextDueDay({ lastSentDay: 1, lastSentOn: "2026-11-25", today: "2026-11-28", length: 7 })).toBe(2);
    expect(nextDueDay({ lastSentDay: 7, lastSentOn: "2026-11-20", today: "2026-11-28", length: 7 })).toBeNull();
  });
});

describe("emails", () => {
  const signup = { email: "a@example.com", locale: "ru" as const, unsubscribeToken: newId(), confirmToken: newId() };

  it("carries the task, a one-click stop link, and the mail-app unsubscribe headers", () => {
    const email = dayEmail(signup, 3, "https://x.test")!;
    expect(email.subject).toContain("День 3");
    expect(email.text).toContain(CHALLENGE_DAYS[2].ru.task);
    expect(email.text).toContain(`https://x.test/free/challenge/stop?token=${signup.unsubscribeToken}`);
    expect(email.headers?.["List-Unsubscribe"]).toBe(`<https://x.test/api/challenge/unsubscribe?token=${signup.unsubscribeToken}>`);
    expect(email.headers?.["List-Unsubscribe-Post"]).toBe("List-Unsubscribe=One-Click");
    expect(dayEmail(signup, 8)).toBeNull();
  });

  it("asks a visitor to confirm before anything else", () => {
    const email = confirmEmail(signup, "https://x.test");
    expect(email.text).toContain(`https://x.test/free/challenge/confirm?token=${signup.confirmToken}`);
  });
});

describe("mailer", () => {
  it("is off unless the provider, key, and sender are all set", () => {
    expect(mailerMode({})).toBe("off");
    expect(mailerMode({ EMAIL_PROVIDER: "resend", RESEND_API_KEY: "re_1234567890" })).toBe("off");
    expect(mailerMode({ EMAIL_PROVIDER: "other", RESEND_API_KEY: "re_1234567890", EMAIL_FROM: "a@b.c" })).toBe("off");
    expect(mailerMode({ EMAIL_PROVIDER: "resend", RESEND_API_KEY: "re_1234567890", EMAIL_FROM: "LifeZoi <hi@b.c>" })).toBe("resend");
  });

  it("makes no network call when off", async () => {
    let calls = 0;
    const mailer = createMailer({}, (async () => {
      calls += 1;
      return new Response("{}");
    }) as typeof fetch);
    expect(await mailer.send({ to: "a@b.c", subject: "s", text: "t" })).toEqual({ status: "dry-run" });
    expect(calls).toBe(0);
  });

  it("is never imported by a browser file and never uses a public variable name", () => {
    const code = readFileSync(join(__dirname, "mailer.ts"), "utf8");
    expect(code).not.toMatch(/env\.NEXT_PUBLIC_/);
    const view = readFileSync(join(__dirname, "..", "..", "components", "email-challenge", "challenge-view.tsx"), "utf8");
    expect(view).not.toMatch(/mailer|runtime|repository|service/);
  });
});

describe("cron secret", () => {
  it("lets only the matching bearer secret run the sender", () => {
    const env = { CRON_SECRET: "a-long-enough-secret-value" };
    expect(cronAuthorized("Bearer a-long-enough-secret-value", env)).toBe(true);
    expect(cronAuthorized("Bearer wrong", env)).toBe(false);
    expect(cronAuthorized(null, env)).toBe(false);
    expect(cronAuthorized("Bearer short", { CRON_SECRET: "short" })).toBe(false);
    expect(cronAuthorized("Bearer x", {})).toBe(false);
  });
});

describe("sign-up, confirm, stop", () => {
  it("refuses without consent and with a bad address", async () => {
    const repo = createMemoryChallengeRepository();
    expect((await joinChallenge({ body: { email: "a@example.com" }, member: null, now: NOW, newId }, repo)).status).toBe(400);
    expect((await joinChallenge({ body: { email: "nope", consent: true }, member: null, now: NOW, newId }, repo)).status).toBe(400);
    expect(repo.rows.size).toBe(0);
    expect(normalizeEmail(" A@Example.COM ")).toBe("a@example.com");
  });

  it("drops a bot that fills the hidden field", async () => {
    const repo = createMemoryChallengeRepository();
    const result = await joinChallenge({ body: { email: "a@example.com", consent: true, website: "x" }, member: null, now: NOW, newId }, repo);
    expect(result.body.state).toBe("check-inbox");
    expect(repo.rows.size).toBe(0);
  });

  it("keeps a visitor pending and answers the same for a second sign-up", async () => {
    const repo = createMemoryChallengeRepository();
    const body = { email: "a@example.com", consent: true, locale: "uk", timeZone: "Europe/Kyiv" };
    const first = await joinChallenge({ body, member: null, now: NOW, newId }, repo);
    const second = await joinChallenge({ body, member: null, now: NOW, newId }, repo);
    expect(first.body.state).toBe("check-inbox");
    expect(second.body.state).toBe("check-inbox");
    expect(repo.rows.size).toBe(1);
    const row = [...repo.rows.values()][0];
    expect(row).toMatchObject({ status: "pending", locale: "uk", timeZone: "Europe/Kyiv", lastSentDay: 0 });
    expect((await confirmByToken(row.confirmToken, repo, NOW)).status).toBe(200);
    expect([...repo.rows.values()][0].status).toBe("active");
    expect((await unsubscribeByToken(row.unsubscribeToken, repo)).status).toBe(200);
    expect(repo.rows.size).toBe(0);
    expect((await unsubscribeByToken("not-a-token", repo)).status).toBe(400);
  });

  it("uses a member's account address, starts at once, and deletes on leave", async () => {
    const repo = createMemoryChallengeRepository();
    const member = { id: newId(), email: "Member@Example.com" };
    const result = await joinChallenge({ body: { email: "someone-else@example.com", consent: true }, member, now: NOW, newId }, repo);
    expect(result.body.state).toBe("joined");
    expect([...repo.rows.values()][0]).toMatchObject({ email: "member@example.com", status: "active", userId: member.id });
    await memberLeave(member, repo);
    expect(repo.rows.size).toBe(0);
  });
});

describe("the daily sending run", () => {
  async function activeRepo() {
    const repo = createMemoryChallengeRepository();
    await joinChallenge({ body: { consent: true, locale: "el", timeZone: "Europe/Athens" }, member: { id: newId(), email: "m@example.com" }, now: NOW, newId }, repo);
    await joinChallenge({ body: { email: "v@example.com", consent: true }, member: null, now: NOW, newId }, repo);
    return repo;
  }

  it("only counts and changes nothing when sending is off", async () => {
    const repo = await activeRepo();
    const before = JSON.stringify([...repo.rows.values()]);
    const report = await runDailySend(repo, createMailer({}), NOW);
    expect(report).toMatchObject({ mode: "off", confirmations: { due: 1, sent: 0 }, days: { due: 1, sent: 0 } });
    expect(JSON.stringify([...repo.rows.values()])).toBe(before);
  });

  it("sends one confirmation, then one day a local day, and deletes the row after day 7", async () => {
    const repo = await activeRepo();
    const mailer = recordingMailer();
    let report = await runDailySend(repo, mailer, NOW, "https://x.test");
    expect(report.confirmations.sent).toBe(1);
    expect(report.days.sent).toBe(1);
    report = await runDailySend(repo, mailer, NOW, "https://x.test");
    expect(report.confirmations.due + report.days.due).toBe(0);
    for (let day = 2; day <= CHALLENGE_LENGTH; day += 1) {
      await runDailySend(repo, mailer, new Date(NOW.getTime() + (day - 1) * 86_400_000), "https://x.test");
    }
    const dayEmails = mailer.outbox.filter((email) => email.to === "m@example.com");
    expect(dayEmails).toHaveLength(CHALLENGE_LENGTH);
    expect(dayEmails[6].subject).toContain("Ημέρα 7");
    expect([...repo.rows.values()].some((row) => row.email === "m@example.com")).toBe(false);
    // The unconfirmed visitor got exactly one email, and is deleted after 14 days.
    expect(mailer.outbox.filter((email) => email.to === "v@example.com")).toHaveLength(1);
    await runDailySend(repo, mailer, new Date(NOW.getTime() + 15 * 86_400_000));
    expect(repo.rows.size).toBe(0);
  });

  it("puts the row back when the provider refuses, so the day is tried again", async () => {
    const repo = await activeRepo();
    const report = await runDailySend(repo, recordingMailer("failed"), NOW);
    expect(report.days.failed).toBe(1);
    const member = [...repo.rows.values()].find((row) => row.userId !== null)!;
    expect(member.lastSentDay).toBe(0);
    expect(member.lastSentOn).toBeNull();
  });
});
