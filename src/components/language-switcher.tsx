"use client";

import { useEffect, useId, useRef, useState } from "react";
import { preloadCatalog, useLocale } from "@/components/locale-provider";
import { fmt, LOCALE_META, LOCALES, type Locale } from "@/lib/i18n/config";

/** The 🌐 LANGUAGE button in the header. One click opens the list, one click picks a language. */
export function LanguageSwitcher() {
  const { locale, messages, setLocale } = useLocale();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    // Fetch the other languages while the person reads the list, so a pick switches at once.
    for (const code of LOCALES) preloadCatalog(code).catch(() => null);
    itemRefs.current[LOCALES.indexOf(locale)]?.focus();
    const onPointer = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, locale]);

  function choose(next: Locale) {
    setLocale(next);
    setOpen(false);
    buttonRef.current?.focus();
  }

  function onItemKey(event: React.KeyboardEvent, index: number) {
    const last = LOCALES.length - 1;
    const target =
      event.key === "ArrowDown" ? (index === last ? 0 : index + 1)
      : event.key === "ArrowUp" ? (index === 0 ? last : index - 1)
      : event.key === "Home" ? 0
      : event.key === "End" ? last
      : null;
    if (target === null) return;
    event.preventDefault();
    itemRefs.current[target]?.focus();
  }

  const current = LOCALE_META[locale];

  return (
    <div className="lang-switch" ref={rootRef}>
      <button
        ref={buttonRef}
        type="button"
        className="lang-button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        aria-label={`${messages.language.button}. ${fmt(messages.language.current, { language: current.nativeName })}`}
        onClick={() => setOpen((value) => !value)}
      >
        <span aria-hidden="true">🌐</span>
        <span className="lang-button-word">{messages.language.button}</span>
        <span className="lang-button-code" aria-hidden="true">{current.short}</span>
      </button>
      {open ? (
        <div className="lang-menu" id={menuId} role="menu" aria-label={messages.language.menuLabel}>
          {LOCALES.map((code, index) => {
            const meta = LOCALE_META[code];
            return (
              <button
                key={code}
                ref={(node) => {
                  itemRefs.current[index] = node;
                }}
                type="button"
                role="menuitemradio"
                aria-checked={code === locale}
                lang={meta.htmlLang}
                className="lang-option"
                onClick={() => choose(code)}
                onKeyDown={(event) => onItemKey(event, index)}
              >
                <span className="lang-flag" aria-hidden="true">{meta.flag}</span>
                <span>{meta.nativeName}</span>
                {code === locale ? <span className="lang-check" aria-hidden="true">✓</span> : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
