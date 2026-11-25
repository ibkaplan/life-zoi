import type { FetchLike, OutboundMessage, Sender, SendResult } from "./types";

/**
 * Telegram Bot API (https://core.telegram.org/bots/api). Free. Needs a bot made
 * by a person with @BotFather; the token stays on the server. A bot can only
 * write to a chat whose owner pressed Start, so nobody gets tips they did not ask for.
 */
function api(token: string, method: string) {
  return `https://api.telegram.org/bot${token}/${method}`;
}

export function telegramSender(token: string, fetchImpl: FetchLike = fetch): Sender {
  return {
    channel: "telegram",
    provider: "telegram",
    live: true,
    async send(message: OutboundMessage): Promise<SendResult> {
      if (message.channel !== "telegram" || !/^-?\d{1,20}$/.test(message.to)) {
        return { status: "failed", provider: "telegram", error: "bad-chat" };
      }
      try {
        const response = await fetchImpl(api(token, "sendMessage"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chat_id: message.to, text: message.text, disable_web_page_preview: true }),
          signal: AbortSignal.timeout(10_000),
        });
        return response.ok
          ? { status: "sent", provider: "telegram" }
          : { status: "failed", provider: "telegram", error: `http-${response.status}` };
      } catch {
        return { status: "failed", provider: "telegram", error: "network" };
      }
    },
  };
}

type Update = { message?: { text?: unknown; chat?: { id?: unknown; type?: unknown } } };

/**
 * Looks through the bot's recent messages for "/start CODE" and returns that
 * private chat's id. This is how a member links Telegram without a webhook or
 * a public address: they press Start in Telegram, then "I pressed Start" here.
 */
export async function findStartChat(token: string, code: string, fetchImpl: FetchLike = fetch): Promise<string | null | "unreachable"> {
  if (!/^[A-Za-z0-9]{6,32}$/.test(code)) return null;
  try {
    const response = await fetchImpl(api(token, "getUpdates"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ allowed_updates: ["message"], limit: 100 }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) return "unreachable";
    const body = (await response.json()) as { ok?: boolean; result?: Update[] };
    if (!body.ok || !Array.isArray(body.result)) return "unreachable";
    for (const update of [...body.result].reverse()) {
      const text = update.message?.text;
      const chat = update.message?.chat;
      if (typeof text !== "string" || chat?.type !== "private") continue;
      if (text.trim() !== `/start ${code}`) continue;
      const id = chat.id;
      if (typeof id === "number" && Number.isSafeInteger(id)) return String(id);
    }
    return null;
  } catch {
    return "unreachable";
  }
}
