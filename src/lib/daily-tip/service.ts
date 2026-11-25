import { randomBytes } from "node:crypto";
import { msg } from "@/lib/i18n/translate";
import { publicChannelState, type MessagingConfig } from "@/lib/messaging/config";
import { findStartChat } from "@/lib/messaging/telegram";
import type { FetchLike } from "@/lib/messaging/types";
import { TipTableMissing, type TipRepository } from "./repository";
import type { TipSubscription } from "./types";
import { validatePrefs } from "./validate";

export type Result = { status: number; body: Record<string, unknown> };

const CODE_MINUTES = 30;

/** "ta•••@gmail.com": enough for the member to recognise their address on a shared screen. */
export function maskEmail(email: string): string {
  const [name, domain] = email.split("@");
  if (!name || !domain) return "";
  return `${name.slice(0, 2)}•••@${domain}`;
}

/** What the page sees: never a chat id, a key, or another member's row. */
export function publicSubscription(sub: TipSubscription | null) {
  if (!sub) return null;
  return {
    email: sub.email,
    telegram: sub.telegram,
    telegramLinked: sub.telegramChatId !== null,
    locale: sub.locale,
    sendHour: sub.sendHour,
    timeZone: sub.timeZone,
    lastSentOn: sub.lastSentOn,
  };
}

function notReady(): Result {
  return {
    status: 503,
    body: { error: msg("Daily tips are not set up on the server yet. Nothing was saved."), storage: "not-ready" },
  };
}

async function guarded(run: () => Promise<Result>): Promise<Result> {
  try {
    return await run();
  } catch (error) {
    if (error instanceof TipTableMissing) return notReady();
    return { status: 503, body: { error: msg("Your choices could not be saved. Try again later.") } };
  }
}

export function newLinkCode(): string {
  return randomBytes(9).toString("base64url").replace(/[^A-Za-z0-9]/g, "").slice(0, 10).padEnd(10, "x");
}

export async function tipState(member: { id: string; email: string }, repo: TipRepository, config: MessagingConfig): Promise<Result> {
  return guarded(async () => ({
    status: 200,
    body: {
      storage: "account",
      subscription: publicSubscription(await repo.get(member.id)),
      channels: publicChannelState(config),
      accountEmail: maskEmail(member.email),
    },
  }));
}

export async function tipAction(
  member: { id: string; email: string },
  input: Record<string, unknown>,
  repo: TipRepository,
  config: MessagingConfig,
  options: { now?: Date; fetchImpl?: FetchLike } = {},
): Promise<Result> {
  const now = options.now ?? new Date();
  return guarded(async () => {
    switch (input.action) {
      case "save": {
        const checked = validatePrefs(input.prefs);
        if (!checked.ok) return { status: 400, body: { error: checked.error } };
        const saved = await repo.save(member.id, checked.value);
        return { status: 200, body: { subscription: publicSubscription(saved) } };
      }
      case "telegram-code": {
        if (!config.telegram) return { status: 409, body: { error: msg("Telegram is not connected to LifeZoi yet.") } };
        const current = await repo.get(member.id);
        if (!current) return { status: 409, body: { error: msg("Save your choices first.") } };
        const code = newLinkCode();
        const expires = new Date(now.getTime() + CODE_MINUTES * 60_000).toISOString();
        await repo.setTelegram(member.id, { chatId: current.telegramChatId, code, codeExpires: expires });
        return { status: 200, body: { link: `https://t.me/${config.telegram.username}?start=${code}`, expires } };
      }
      case "telegram-check": {
        if (!config.telegram) return { status: 409, body: { error: msg("Telegram is not connected to LifeZoi yet.") } };
        const current = await repo.get(member.id);
        if (!current?.telegramCode || !current.telegramCodeExpires || Date.parse(current.telegramCodeExpires) < now.getTime()) {
          return { status: 409, body: { error: msg("That link has expired. Make a new one and press Start again.") } };
        }
        const chat = await findStartChat(config.telegram.token, current.telegramCode, options.fetchImpl);
        if (chat === "unreachable") return { status: 503, body: { error: msg("Telegram could not be reached. Try again in a minute.") } };
        if (!chat) return { status: 404, body: { error: msg("LifeZoi has not seen your Start yet. Open the link, press Start in Telegram, then try again.") } };
        await repo.setTelegram(member.id, { chatId: chat, code: null, codeExpires: null });
        return { status: 200, body: { subscription: publicSubscription(await repo.get(member.id)) } };
      }
      case "telegram-unlink": {
        await repo.setTelegram(member.id, { chatId: null, code: null, codeExpires: null });
        return { status: 200, body: { subscription: publicSubscription(await repo.get(member.id)) } };
      }
      case "unsubscribe": {
        await repo.remove(member.id);
        return { status: 200, body: { subscription: null } };
      }
      default:
        return { status: 400, body: { error: msg("The request could not be read.") } };
    }
  });
}
