import type { Locale } from "@/lib/i18n/config";

/** Version of the consent wording a person agreed to. Change it when the wording on the page changes. */
export const CONSENT_VERSION = "2026-11-25";

/**
 * One person in the challenge. Only what sending needs: an address, a language,
 * a time zone, the consent, and how far the emails have gone. No health data.
 * The row is deleted when the person stops, and after the last day is sent.
 */
export type Signup = {
  id: string;
  email: string;
  userId: string | null;
  locale: Locale;
  timeZone: string;
  consentVersion: string;
  consentedAt: string;
  status: "pending" | "active";
  confirmToken: string;
  confirmSentAt: string | null;
  confirmedAt: string | null;
  unsubscribeToken: string;
  lastSentDay: number;
  lastSentOn: string | null;
  createdAt: string;
};
