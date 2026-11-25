/**
 * One outbound message, whatever carries it. The daily tip and the 7-day
 * challenge use the same shape so they can share one sender later.
 */
export type Channel = "email" | "telegram";

export type OutboundMessage = {
  channel: Channel;
  /** An email address, or a Telegram chat id as text. */
  to: string;
  subject?: string;
  text: string;
  headers?: Record<string, string>;
};

/**
 * sent: the provider accepted it. dry-run: nothing left the server because
 * sending is off or the provider is not configured. failed: the provider refused.
 */
export type SendResult = { status: "sent" | "dry-run" | "failed"; provider: string; error?: string };

export type Sender = {
  channel: Channel;
  provider: string;
  /** False means every call is a dry run. */
  live: boolean;
  send: (message: OutboundMessage) => Promise<SendResult>;
};

export type FetchLike = (input: string, init?: RequestInit) => Promise<Response>;
