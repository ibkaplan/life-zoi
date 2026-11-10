"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useSyncExternalStore } from "react";
import {
  DEFAULT_LOCALE,
  detectLocale,
  isLocale,
  LOCALE_META,
  LOCALE_STORAGE_KEY,
  type Locale,
} from "@/lib/i18n/config";
import { messagesFor, type Messages } from "@/lib/i18n/messages";

const CHANGE_EVENT = "lifezoi:locale";

/** Used only when the browser blocks storage, so a choice still applies on this page. */
let memoryLocale: Locale | null = null;

function readStoredLocale(): Locale | null {
  try {
    const value = window.localStorage.getItem(LOCALE_STORAGE_KEY);
    return isLocale(value) ? value : null;
  } catch {
    return null;
  }
}

/** A saved choice wins. A first visit follows the browser languages, then English. */
function clientLocale(): Locale {
  return memoryLocale ?? readStoredLocale() ?? detectLocale(typeof navigator === "undefined" ? [] : navigator.languages);
}

function serverLocale(): Locale {
  return DEFAULT_LOCALE;
}

function subscribe(onChange: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key === null || event.key === LOCALE_STORAGE_KEY) onChange();
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener("languagechange", onChange);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener("languagechange", onChange);
  };
}

export function saveLocale(locale: Locale) {
  try {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
    memoryLocale = null;
  } catch {
    // Storage can be blocked. The choice still applies until the page is closed.
    memoryLocale = locale;
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

type LocaleContextValue = { locale: Locale; messages: Messages; setLocale: (locale: Locale) => void };

const LocaleContext = createContext<LocaleContextValue>({
  locale: DEFAULT_LOCALE,
  messages: messagesFor(DEFAULT_LOCALE),
  setLocale: () => {},
});

/**
 * Holds the interface language. Switching only re-renders: no reload, no navigation,
 * and nothing in the session (assessment draft, progress) is touched.
 */
export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const locale = useSyncExternalStore(subscribe, clientLocale, serverLocale);

  useEffect(() => {
    document.documentElement.lang = LOCALE_META[locale].htmlLang;
  }, [locale]);

  const setLocale = useCallback((next: Locale) => saveLocale(next), []);
  const value = useMemo(() => ({ locale, messages: messagesFor(locale), setLocale }), [locale, setLocale]);
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  return useContext(LocaleContext);
}

/** The text for the current language. */
export function useMessages(): Messages {
  return useContext(LocaleContext).messages;
}
