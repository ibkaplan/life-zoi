"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import {
  DEFAULT_LOCALE,
  detectLocale,
  isLocale,
  LOCALE_META,
  LOCALE_STORAGE_KEY,
  type Locale,
} from "@/lib/i18n/config";
import { messagesFor, type Messages } from "@/lib/i18n/messages";
import { CATALOG_LOADERS, makeTranslate, type Catalog, type Translate } from "@/lib/i18n/translate";

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

/** Catalogs already fetched in this page. Each language is loaded once, the first time it is needed. */
const catalogs: Partial<Record<Locale, Catalog>> = {};
const pending: Partial<Record<Locale, Promise<Catalog>>> = {};

/** Fetch a language's text ahead of time, for example when the language menu opens, so the switch is instant. */
export function preloadCatalog(locale: Locale): Promise<Catalog | null> {
  if (locale === "en") return Promise.resolve(null);
  if (catalogs[locale]) return Promise.resolve(catalogs[locale]);
  pending[locale] ??= CATALOG_LOADERS[locale]()
    .then((catalog) => {
      catalogs[locale] = catalog;
      return catalog;
    })
    .catch((error) => {
      delete pending[locale];
      throw error;
    });
  return pending[locale];
}

const englishT = makeTranslate(null);

type LocaleContextValue = { locale: Locale; messages: Messages; t: Translate; setLocale: (locale: Locale) => void };

const LocaleContext = createContext<LocaleContextValue>({
  locale: DEFAULT_LOCALE,
  messages: messagesFor(DEFAULT_LOCALE),
  t: englishT,
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

  // Bumped when a catalog arrives, so text in that language replaces the English shown meanwhile.
  const [, setLoaded] = useState(0);
  useEffect(() => {
    if (locale === "en" || catalogs[locale]) return;
    let live = true;
    preloadCatalog(locale)
      .then(() => {
        if (live) setLoaded((count) => count + 1);
      })
      .catch(() => {
        // Offline or blocked: English stays readable.
      });
    return () => {
      live = false;
    };
  }, [locale]);

  const setLocale = useCallback((next: Locale) => {
    // Switch once the text is here, so the page changes language in one step.
    preloadCatalog(next)
      .catch(() => null)
      .finally(() => saveLocale(next));
  }, []);
  const catalog = locale === "en" ? null : (catalogs[locale] ?? null);
  const value = useMemo(
    () => ({ locale, messages: messagesFor(locale), t: catalog ? makeTranslate(catalog) : englishT, setLocale }),
    [locale, catalog, setLocale],
  );
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  return useContext(LocaleContext);
}

/** The text for the current language. */
export function useMessages(): Messages {
  return useContext(LocaleContext).messages;
}

/** Translate English text into the current language: `t("Save answers")`, `t("{count} answers need attention:", { count: 2 })`. */
export function useT(): Translate {
  return useContext(LocaleContext).t;
}
