/** Member-facing copy. These strings do not claim a live provider call succeeded. */

export const REJECTION_NOTICE =
  "Your message could not be published because it may violate our Community Guidelines. Please rewrite it respectfully.";

export const PENDING_NOTICE = "Your message is awaiting moderation.";

export const NOT_CONFIGURED_NOTICE =
  "Your message is awaiting moderation. Automatic checking is not configured on this server, so a person will review it before it can be public.";

export const APPROVED_NOTICE = "Your message is published. Members see your chosen name only.";

export const PRIVACY_NOTICE =
  "Submitted message text may be processed by an external moderation provider. Do not post identifying information. Do not post health records or questionnaire answers. Members see your chosen community name only, never your email, real name, or account id.";

export const RETENTION_SUMMARY =
  "Rejected messages, messages you remove, and closed reports are kept for 30 days so a review or appeal can finish, then deleted. A published message stays until you remove it. The moderation record keeps the chosen name, the message text while it still exists, a short category, the decision, and the time. It does not keep an email address, a legal name, a health record, or a questionnaire answer. The server keeps the signed-in account's internal id so it can tell your own messages apart, apply a block or mute, and delete them with your account. That id is not shown to other members.";

export function temporaryRestrictionMessage(until: string): string {
  return `You cannot post right now. This limit is temporary and ends at ${until}. It is not a permanent ban.`;
}

export function noticeFor(status: "approved" | "pending" | "rejected", source: string): string {
  if (status === "rejected") return REJECTION_NOTICE;
  if (status === "approved") return APPROVED_NOTICE;
  if (source === "not-configured") return NOT_CONFIGURED_NOTICE;
  return PENDING_NOTICE;
}

export function sourceLabel(source: string): string {
  switch (source) {
    case "local-filter":
      return "Local filter";
    case "provider":
      return "Moderation provider";
    case "not-configured":
      return "Provider not configured";
    case "timeout":
      return "Provider timed out";
    case "quota":
      return "Provider quota";
    case "error":
      return "Provider error";
    case "admin":
      return "Admin review";
    default:
      return "Review";
  }
}
