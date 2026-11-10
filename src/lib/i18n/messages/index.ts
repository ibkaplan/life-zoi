import type { Locale } from "../config";
import { el } from "./el";
import { en, type Messages } from "./en";
import { ru } from "./ru";
import { uk } from "./uk";

export type { Messages };

export const MESSAGES: Record<Locale, Messages> = { en, uk, ru, el };

export function messagesFor(locale: Locale): Messages {
  return MESSAGES[locale] ?? en;
}
