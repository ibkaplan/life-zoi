"use client";

import { useEffect } from "react";
import { useMessages, useT } from "@/components/locale-provider";

/** Small translated pieces that server components can place in their markup. */
export function LoadingText() {
  return <>{useMessages().common.loading}</>;
}

export function SkipLink() {
  return (
    <a className="skip" href="#main">
      {useMessages().shell.skip}
    </a>
  );
}

/**
 * Translated text for server components, which cannot call `useT()` themselves:
 * `<T text="Movement breaks" />`. The English is the catalog key.
 */
export function T({ text, values }: { text: string; values?: Record<string, string | number> }) {
  return <>{useT()(text, values)}</>;
}

// The English title Next.js last set, and the translated title this component wrote.
let englishTitle = "";
let shownTitle = "";

/**
 * Keeps the browser tab title in the chosen language. Page titles are set in English
 * by each page's metadata; each part of "Page · lifeZoi" is translated here.
 */
export function TitleSync() {
  const t = useT();
  useEffect(() => {
    const apply = () => {
      if (document.title !== shownTitle) englishTitle = document.title;
      shownTitle = englishTitle
        .split(" · ")
        .map((part) => t(part))
        .join(" · ");
      if (document.title !== shownTitle) document.title = shownTitle;
    };
    apply();
    const observer = new MutationObserver(apply);
    observer.observe(document.head, { subtree: true, childList: true, characterData: true });
    return () => observer.disconnect();
  }, [t]);
  return null;
}
