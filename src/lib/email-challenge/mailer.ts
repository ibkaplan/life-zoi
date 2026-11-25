/**
 * The one place that could send an email. It is off unless the server has all of
 *   EMAIL_PROVIDER=resend, RESEND_API_KEY, and EMAIL_FROM.
 * Off means every call returns "dry-run" and nothing leaves the server.
 * The key is server-only: never in the browser, never in a NEXT_PUBLIC_ variable,
 * never logged, never returned in a response.
 */
export type OutboundEmail = { to: string; subject: string; text: string; headers?: Record<string, string> };
export type SendResult = { status: "sent" } | { status: "dry-run" } | { status: "failed" };
export type Mailer = { mode: "off" | "resend"; send: (email: OutboundEmail) => Promise<SendResult> };

type Env = Record<string, string | undefined>;

const RESEND_URL = "https://api.resend.com/emails";

export function mailerMode(env: Env = process.env): "off" | "resend" {
  const provider = env.EMAIL_PROVIDER?.trim().toLowerCase();
  const key = env.RESEND_API_KEY?.trim() ?? "";
  const from = env.EMAIL_FROM?.trim() ?? "";
  if (provider !== "resend") return "off";
  if (key.length < 10 || /\s/.test(key) || !from.includes("@")) return "off";
  return "resend";
}

export function createMailer(env: Env = process.env, fetcher: typeof fetch = fetch): Mailer {
  const mode = mailerMode(env);
  if (mode === "off") return { mode, send: async () => ({ status: "dry-run" }) };
  const key = env.RESEND_API_KEY!.trim();
  const from = env.EMAIL_FROM!.trim();
  return {
    mode,
    async send(email) {
      try {
        const response = await fetcher(RESEND_URL, {
          method: "POST",
          headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
          body: JSON.stringify({ from, to: [email.to], subject: email.subject, text: email.text, headers: email.headers }),
          signal: AbortSignal.timeout(10_000),
        });
        return response.ok ? { status: "sent" } : { status: "failed" };
      } catch {
        return { status: "failed" };
      }
    },
  };
}
