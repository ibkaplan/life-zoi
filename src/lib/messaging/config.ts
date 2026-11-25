/**
 * Which outbound channels this server can use. Everything is off unless the
 * server environment turns it on, and no value here is ever sent to the browser.
 *
 * Email: EMAIL_PROVIDER=resend, RESEND_API_KEY, EMAIL_FROM (the same names the
 * 7-day challenge uses). Telegram: TELEGRAM_BOT_TOKEN and TELEGRAM_BOT_USERNAME.
 * Real messages also need DAILY_TIP_SENDING=on; without it every send is a dry run.
 */
type Env = Record<string, string | undefined>;

export type MessagingConfig = {
  sendingOn: boolean;
  email: { provider: "resend"; apiKey: string; from: string } | null;
  telegram: { token: string; username: string } | null;
};

const TOKEN = /^\d{5,15}:[A-Za-z0-9_-]{30,64}$/;
const USERNAME = /^[A-Za-z][A-Za-z0-9_]{3,31}bot$/i;
const FROM = /^(?:[^<>\n]{1,80}<)?[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+>?$/;

export function readMessagingConfig(env: Env = process.env): MessagingConfig {
  const provider = env.EMAIL_PROVIDER?.trim().toLowerCase();
  const apiKey = env.RESEND_API_KEY?.trim() ?? "";
  const from = env.EMAIL_FROM?.trim() ?? "";
  const email =
    provider === "resend" && apiKey.length >= 20 && !/\s/.test(apiKey) && FROM.test(from)
      ? { provider: "resend" as const, apiKey, from }
      : null;
  const token = env.TELEGRAM_BOT_TOKEN?.trim() ?? "";
  const username = (env.TELEGRAM_BOT_USERNAME?.trim() ?? "").replace(/^@/, "");
  const telegram = TOKEN.test(token) && USERNAME.test(username) ? { token, username } : null;
  return { sendingOn: env.DAILY_TIP_SENDING?.trim().toLowerCase() === "on", email, telegram };
}

/** What the page may know: whether a channel is ready, never a key. */
export function publicChannelState(config: MessagingConfig) {
  return {
    sending: config.sendingOn ? ("on" as const) : ("off" as const),
    email: config.email !== null,
    telegram: config.telegram !== null,
    telegramBot: config.telegram?.username ?? null,
  };
}
