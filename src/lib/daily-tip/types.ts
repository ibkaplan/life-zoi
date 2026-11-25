import type { Locale } from "@/lib/i18n/config";

/** What a member chose. Saved in `daily_tip_subscriptions`, one row per account. */
export type TipPrefs = {
  email: boolean;
  telegram: boolean;
  locale: Locale;
  /** Local hour, 6 to 21, when the tip may go out. */
  sendHour: number;
  timeZone: string;
};

export type TipSubscription = TipPrefs & {
  userId: string;
  /** Set only after the member pressed Start in the LifeZoi bot and the server saw it. */
  telegramChatId: string | null;
  telegramCode: string | null;
  telegramCodeExpires: string | null;
  lastSentOn: string | null;
};

export const SEND_HOURS = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21] as const;
export const DEFAULT_HOUR = 8;
