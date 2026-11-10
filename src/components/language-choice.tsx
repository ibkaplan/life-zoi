"use client";

import { useLocale } from "@/components/locale-provider";
import { LOCALE_META, LOCALES } from "@/lib/i18n/config";

/** The same four languages as the header button, laid out as radio buttons for Settings. */
export function LanguageChoice() {
  const { locale, messages, setLocale } = useLocale();
  return (
    <fieldset className="field">
      <legend className="sr-only">{messages.language.menuLabel}</legend>
      <div className="choices">
        {LOCALES.map((code) => (
          <label className="choice" key={code} lang={LOCALE_META[code].htmlLang}>
            <input type="radio" name="language" value={code} checked={locale === code} onChange={() => setLocale(code)} />
            <span>
              <span aria-hidden="true">{LOCALE_META[code].flag}</span> {LOCALE_META[code].nativeName}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
