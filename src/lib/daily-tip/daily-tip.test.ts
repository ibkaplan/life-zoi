import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it, vi } from "vitest";
import ru from "@/lib/i18n/catalog/ru";
import { readMessagingConfig, publicChannelState } from "@/lib/messaging/config";
import { getSenders } from "@/lib/messaging";
import { findStartChat } from "@/lib/messaging/telegram";
import { composeTip, translatorFor } from "./compose";
import { createMemoryTipRepository } from "./repository";
import { localClock } from "./schedule";
import { isDue, runDailySend } from "./sender";
import { maskEmail, tipAction, tipState } from "./service";
import { TIPS, tipForDate } from "./tips";
import { validatePrefs } from "./validate";

const TOKEN = "123456789:AAEexampleexampleexampleexample12345";
const LIVE_ENV = {
  DAILY_TIP_SENDING: "on",
  EMAIL_PROVIDER: "resend",
  RESEND_API_KEY: "re_test_key_000000000000000",
  EMAIL_FROM: "LifeZoi <tips@lifezoi.example>",
  TELEGRAM_BOT_TOKEN: TOKEN,
  TELEGRAM_BOT_USERNAME: "LifeZoiTipsBot",
};
const member = { id: "00000000-0000-0000-0000-00000000000a", email: "tatyana@example.com" };
const prefs = { email: true, telegram: false, locale: "ru", sendHour: 8, timeZone: "Europe/Kyiv" };

describe("tip bank", () => {
  it("has unique ids and rotates one tip per day without repeating neighbours", () => {
    expect(new Set(TIPS.map((tip) => tip.id)).size).toBe(TIPS.length);
    expect(TIPS.length).toBeGreaterThanOrEqual(30);
    expect(tipForDate("2026-11-25").id).not.toBe(tipForDate("2026-11-26").id);
    expect(tipForDate("2026-11-25")).toBe(tipForDate("2026-11-25"));
  });

  it("keeps tips qualitative: no percentages or lifespan claims", () => {
    for (const tip of TIPS) expect(tip.text).not.toMatch(/%|percent|years of life|lifespan|cure|prevent/i);
  });

  it("has every tip in Russian", () => {
    for (const tip of TIPS) expect(ru[tip.text], tip.id).toBeTruthy();
  });
});

describe("choices", () => {
  it("accepts a valid choice and refuses bad hours, languages and zones", () => {
    expect(validatePrefs(prefs).ok).toBe(true);
    expect(validatePrefs({ ...prefs, sendHour: 3 }).ok).toBe(false);
    expect(validatePrefs({ ...prefs, locale: "de" }).ok).toBe(false);
    expect(validatePrefs({ ...prefs, timeZone: "Mars/Base" }).ok).toBe(false);
    expect(validatePrefs({ ...prefs, email: "yes" }).ok).toBe(false);
  });

  it("reads the local hour in the member's time zone", () => {
    expect(localClock(new Date("2026-11-25T06:30:00Z"), "Europe/Kyiv")).toEqual({ date: "2026-11-25", hour: 8 });
    expect(localClock(new Date("2026-11-25T23:30:00Z"), "Europe/Athens").date).toBe("2026-11-26");
  });

  it("masks the sign-in address shown on the page", () => {
    expect(maskEmail("tatyana@example.com")).toBe("ta•••@example.com");
  });
});

describe("messaging config", () => {
  it("is off and dry-run with no environment", () => {
    const config = readMessagingConfig({});
    expect(publicChannelState(config)).toEqual({ sending: "off", email: false, telegram: false, telegramBot: null });
    const senders = getSenders(config);
    expect(senders.email.live).toBe(false);
    expect(senders.telegram.live).toBe(false);
  });

  it("stays dry-run when providers are set but sending is not switched on", () => {
    const senders = getSenders(readMessagingConfig({ ...LIVE_ENV, DAILY_TIP_SENDING: "" }));
    expect(senders.email.live).toBe(false);
    expect(senders.telegram.live).toBe(false);
  });

  it("never shows a key or token to the page", () => {
    const state = JSON.stringify(publicChannelState(readMessagingConfig(LIVE_ENV)));
    expect(state).not.toContain(TOKEN);
    expect(state).not.toContain("re_test_key");
    expect(state).toContain("LifeZoiTipsBot");
  });
});

describe("member actions", () => {
  it("saves, reads back, and deletes choices", async () => {
    const repo = createMemoryTipRepository();
    const config = readMessagingConfig({});
    expect((await tipAction(member, { action: "save", prefs }, repo, config)).status).toBe(200);
    const state = await tipState(member, repo, config);
    expect(state.body.subscription).toMatchObject({ email: true, locale: "ru", sendHour: 8, telegramLinked: false });
    expect(JSON.stringify(state.body)).not.toContain("tatyana@");
    await tipAction(member, { action: "unsubscribe" }, repo, config);
    expect((await tipState(member, repo, config)).body.subscription).toBeNull();
  });

  it("refuses a Telegram link while no bot is configured", async () => {
    const repo = createMemoryTipRepository();
    await tipAction(member, { action: "save", prefs: { ...prefs, telegram: true } }, repo, readMessagingConfig({}));
    expect((await tipAction(member, { action: "telegram-code" }, repo, readMessagingConfig({}))).status).toBe(409);
  });

  it("links Telegram only after the bot sees /start with the member's code", async () => {
    const repo = createMemoryTipRepository();
    const config = readMessagingConfig(LIVE_ENV);
    const now = new Date("2026-11-25T08:00:00Z");
    await tipAction(member, { action: "save", prefs: { ...prefs, telegram: true } }, repo, config, { now });
    const made = await tipAction(member, { action: "telegram-code" }, repo, config, { now });
    const code = String(made.body.link).split("start=")[1];
    expect(made.body.link).toMatch(/^https:\/\/t\.me\/LifeZoiTipsBot\?start=[A-Za-z0-9]{10}$/);
    const updates = (text: string) =>
      vi.fn(async () => Response.json({ ok: true, result: [{ message: { text, chat: { id: 4242, type: "private" } } }] }));
    expect((await tipAction(member, { action: "telegram-check" }, repo, config, { now, fetchImpl: updates("/start other") })).status).toBe(404);
    const linked = await tipAction(member, { action: "telegram-check" }, repo, config, { now, fetchImpl: updates(`/start ${code}`) });
    expect(linked.body.subscription).toMatchObject({ telegramLinked: true });
    expect(JSON.stringify(linked.body)).not.toContain("4242");
    const late = new Date(now.getTime() + 31 * 60_000);
    await tipAction(member, { action: "telegram-unlink" }, repo, config, { now });
    await tipAction(member, { action: "telegram-code" }, repo, config, { now });
    expect((await tipAction(member, { action: "telegram-check" }, repo, config, { now: late })).status).toBe(409);
  });

  it("ignores group chats when linking", async () => {
    const fetchImpl = vi.fn(async () => Response.json({ ok: true, result: [{ message: { text: "/start ABCDEF1234", chat: { id: -5, type: "group" } } }] }));
    expect(await findStartChat(TOKEN, "ABCDEF1234", fetchImpl)).toBeNull();
  });
});

describe("daily send", () => {
  async function setup() {
    const repo = createMemoryTipRepository();
    await repo.save(member.id, { email: true, telegram: true, locale: "ru", sendHour: 8, timeZone: "Europe/Kyiv" });
    await repo.setTelegram(member.id, { chatId: "4242", code: null, codeExpires: null });
    return repo;
  }

  it("is due once the local hour is reached and only once a day", async () => {
    const repo = await setup();
    const sub = (await repo.get(member.id))!;
    expect(isDue(sub, new Date("2026-11-25T05:30:00Z"))).toBe(false);
    expect(isDue(sub, new Date("2026-11-25T06:30:00Z"))).toBe(true);
    expect(isDue({ ...sub, lastSentOn: "2026-11-25" }, new Date("2026-11-25T09:30:00Z"))).toBe(false);
  });

  it("sends nothing and marks nothing in a dry run", async () => {
    const repo = await setup();
    const fetchImpl = vi.fn();
    const summary = await runDailySend({
      now: new Date("2026-11-25T06:30:00Z"),
      repo,
      senders: getSenders(readMessagingConfig({}), fetchImpl),
      emailFor: async () => member.email,
      siteUrl: "https://www.lifezoi.com",
    });
    expect(fetchImpl).not.toHaveBeenCalled();
    expect(summary).toMatchObject({ due: 1, sent: 0, dryRun: 2, failed: 0 });
    expect((await repo.get(member.id))!.lastSentOn).toBeNull();
  });

  it("sends in the member's language to their sign-in address and chat when live", async () => {
    const repo = await setup();
    const calls: { url: string; body: Record<string, unknown> }[] = [];
    const fetchImpl = vi.fn(async (url: string, init?: RequestInit) => {
      calls.push({ url, body: JSON.parse(String(init?.body)) });
      return new Response("{}", { status: 200 });
    });
    const summary = await runDailySend({
      now: new Date("2026-11-25T06:30:00Z"),
      repo,
      senders: getSenders(readMessagingConfig(LIVE_ENV), fetchImpl),
      emailFor: async () => member.email,
      siteUrl: "https://www.lifezoi.com",
    });
    expect(summary).toMatchObject({ due: 1, sent: 2 });
    const tip = tipForDate("2026-11-25");
    expect(calls[0].url).toBe("https://api.resend.com/emails");
    expect(calls[0].body.to).toEqual([member.email]);
    expect(String(calls[0].body.text)).toContain(ru[tip.text]);
    expect(calls[1].url).toContain("/sendMessage");
    expect(calls[1].body.chat_id).toBe("4242");
    expect((await repo.get(member.id))!.lastSentOn).toBe("2026-11-25");
  });

  it("composes only the tip and a settings link", async () => {
    const message = composeTip(tipForDate("2026-11-25"), await translatorFor("en"), "https://www.lifezoi.com/", "en");
    expect(message.emailText).toContain("https://www.lifezoi.com/daily/tip");
    expect(message.subject).toMatch(/^Your LifeZoi tip for today: /);
    expect(message.headers["List-Unsubscribe"]).toBe("<https://www.lifezoi.com/daily/tip>");
  });
});

describe("migration", () => {
  const sql = readFileSync(join(process.cwd(), "supabase", "migrations", "20261127180100_daily_tip_subscriptions.sql"), "utf8");
  it("is additive, owner-only, and stores no email address", () => {
    expect(sql).not.toMatch(/\bdrop table\b|\bdelete from\b|\balter table [^;]* drop\b/i);
    expect(sql).toContain("enable row level security");
    expect(sql).toContain("auth.uid() = user_id and public.auth_session_may_use_rows()");
    expect(sql).not.toMatch(/\bemail text\b/);
  });
});
