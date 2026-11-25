import type { FetchLike, OutboundMessage, Sender, SendResult } from "./types";

/** Records nothing and sends nothing. Used whenever email is not set up or sending is off. */
export function dryRunSender(channel: "email" | "telegram"): Sender {
  return {
    channel,
    provider: "dry-run",
    live: false,
    send: async () => ({ status: "dry-run", provider: "dry-run" }),
  };
}

/**
 * Resend's HTTP API (https://resend.com/docs/api-reference/emails/send-email).
 * Only created when the server has EMAIL_PROVIDER=resend, a key, a sender
 * address, and DAILY_TIP_SENDING=on. The key never appears in a result.
 */
export function resendSender(apiKey: string, from: string, fetchImpl: FetchLike = fetch): Sender {
  return {
    channel: "email",
    provider: "resend",
    live: true,
    async send(message: OutboundMessage): Promise<SendResult> {
      if (message.channel !== "email") return { status: "failed", provider: "resend", error: "wrong-channel" };
      try {
        const response = await fetchImpl("https://api.resend.com/emails", {
          method: "POST",
          headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            from,
            to: [message.to],
            subject: message.subject ?? "",
            text: message.text,
            headers: message.headers,
          }),
          signal: AbortSignal.timeout(10_000),
        });
        return response.ok
          ? { status: "sent", provider: "resend" }
          : { status: "failed", provider: "resend", error: `http-${response.status}` };
      } catch {
        return { status: "failed", provider: "resend", error: "network" };
      }
    },
  };
}
