import { readMessagingConfig, type MessagingConfig } from "./config";
import { dryRunSender, resendSender } from "./email";
import { telegramSender } from "./telegram";
import type { FetchLike, Sender } from "./types";

export type Senders = { email: Sender; telegram: Sender };

/**
 * The senders for this server. A channel is live only when its provider is set
 * up AND DAILY_TIP_SENDING=on; otherwise its sender is a dry run that sends nothing.
 */
export function getSenders(config: MessagingConfig = readMessagingConfig(), fetchImpl: FetchLike = fetch): Senders {
  return {
    email: config.sendingOn && config.email ? resendSender(config.email.apiKey, config.email.from, fetchImpl) : dryRunSender("email"),
    telegram: config.sendingOn && config.telegram ? telegramSender(config.telegram.token, fetchImpl) : dryRunSender("telegram"),
  };
}

export { readMessagingConfig, publicChannelState } from "./config";
export type { MessagingConfig } from "./config";
export type { Channel, OutboundMessage, SendResult, Sender } from "./types";
