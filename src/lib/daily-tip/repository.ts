import type { SupabaseClient } from "@supabase/supabase-js";
import { isLocale } from "@/lib/i18n/config";
import { isTimeZone } from "./schedule";
import { DEFAULT_HOUR, SEND_HOURS, type TipPrefs, type TipSubscription } from "./types";

/**
 * `daily_tip_subscriptions` (supabase/migrations/20261125120000_daily_tip_subscriptions.sql).
 * A member's own calls use their sign-in, so row level security limits them to
 * their own row. Only the daily send uses the service role, on the server, to
 * read every active row. No email address is stored here: the send reads the
 * account's own sign-in address, so tips cannot be pointed at someone else.
 */
export const TIP_TABLE = "daily_tip_subscriptions";

export type TipRepository = {
  get: (userId: string) => Promise<TipSubscription | null>;
  save: (userId: string, prefs: TipPrefs) => Promise<TipSubscription>;
  setTelegram: (userId: string, fields: { chatId: string | null; code: string | null; codeExpires: string | null }) => Promise<void>;
  remove: (userId: string) => Promise<void>;
  /** Every row with at least one channel on. Service role only. */
  listActive: () => Promise<TipSubscription[]>;
  markSent: (userId: string, date: string) => Promise<void>;
};

/** The table is not created yet (migration not applied). */
export class TipTableMissing extends Error {}

type Row = {
  user_id: string;
  email_enabled: boolean;
  telegram_enabled: boolean;
  telegram_chat_id: number | string | null;
  telegram_link_code: string | null;
  telegram_code_expires_at: string | null;
  locale: string;
  send_hour: number;
  time_zone: string;
  last_sent_on: string | null;
};

const COLUMNS =
  "user_id, email_enabled, telegram_enabled, telegram_chat_id, telegram_link_code, telegram_code_expires_at, locale, send_hour, time_zone, last_sent_on";

export function rowToSubscription(row: Row): TipSubscription {
  return {
    userId: row.user_id,
    email: row.email_enabled === true,
    telegram: row.telegram_enabled === true,
    telegramChatId: row.telegram_chat_id === null || row.telegram_chat_id === undefined ? null : String(row.telegram_chat_id),
    telegramCode: row.telegram_link_code ?? null,
    telegramCodeExpires: row.telegram_code_expires_at ?? null,
    locale: isLocale(row.locale) ? row.locale : "en",
    sendHour: (SEND_HOURS as readonly number[]).includes(row.send_hour) ? row.send_hour : DEFAULT_HOUR,
    timeZone: isTimeZone(row.time_zone) ? row.time_zone : "UTC",
    lastSentOn: row.last_sent_on ?? null,
  };
}

function check(error: { code?: string; message?: string } | null) {
  if (!error) return;
  if (error.code === "42P01" || error.code === "PGRST205") throw new TipTableMissing(TIP_TABLE);
  throw new Error("daily-tip-storage");
}

export function createSupabaseTipRepository(client: SupabaseClient): TipRepository {
  const table = () => client.from(TIP_TABLE);
  return {
    async get(userId) {
      const { data, error } = await table().select(COLUMNS).eq("user_id", userId).maybeSingle();
      check(error);
      return data ? rowToSubscription(data as Row) : null;
    },
    async save(userId, prefs) {
      const { data, error } = await table()
        .upsert(
          {
            user_id: userId,
            email_enabled: prefs.email,
            telegram_enabled: prefs.telegram,
            locale: prefs.locale,
            send_hour: prefs.sendHour,
            time_zone: prefs.timeZone,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id" },
        )
        .select(COLUMNS)
        .single();
      check(error);
      return rowToSubscription(data as Row);
    },
    async setTelegram(userId, fields) {
      const { error } = await table()
        .update({
          telegram_chat_id: fields.chatId,
          telegram_link_code: fields.code,
          telegram_code_expires_at: fields.codeExpires,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId);
      check(error);
    },
    async remove(userId) {
      const { error } = await table().delete().eq("user_id", userId);
      check(error);
    },
    async listActive() {
      const { data, error } = await table().select(COLUMNS).or("email_enabled.eq.true,telegram_enabled.eq.true").limit(10_000);
      check(error);
      return ((data ?? []) as Row[]).map(rowToSubscription);
    },
    async markSent(userId, date) {
      const { error } = await table().update({ last_sent_on: date }).eq("user_id", userId);
      check(error);
    },
  };
}

/** For tests and a local preview without Supabase. Rows are lost on restart. */
export function createMemoryTipRepository(): TipRepository {
  const rows = new Map<string, TipSubscription>();
  const blank = (userId: string, prefs: TipPrefs): TipSubscription => ({
    ...prefs,
    userId,
    telegramChatId: null,
    telegramCode: null,
    telegramCodeExpires: null,
    lastSentOn: null,
  });
  return {
    get: async (userId) => (rows.has(userId) ? { ...rows.get(userId)! } : null),
    async save(userId, prefs) {
      const next = { ...(rows.get(userId) ?? blank(userId, prefs)), ...prefs };
      rows.set(userId, next);
      return { ...next };
    },
    async setTelegram(userId, fields) {
      const row = rows.get(userId);
      if (row) rows.set(userId, { ...row, telegramChatId: fields.chatId, telegramCode: fields.code, telegramCodeExpires: fields.codeExpires });
    },
    remove: async (userId) => void rows.delete(userId),
    listActive: async () => [...rows.values()].filter((row) => row.email || row.telegram).map((row) => ({ ...row })),
    async markSent(userId, date) {
      const row = rows.get(userId);
      if (row) rows.set(userId, { ...row, lastSentOn: date });
    },
  };
}
