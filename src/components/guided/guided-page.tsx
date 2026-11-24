"use client";

import "@/components/guided/guided.css";
import { GuidedDayPicks, GuidedFromLink, GuidedHistory, GuidedLibrary } from "@/components/guided/guided-launch";
import { useLocale } from "@/components/locale-provider";

/** /guided: every voice-guided session, today's suggestions, and the sessions already finished. */
export function GuidedPage() {
  const { t } = useLocale();
  return (
    <div className="stack-lg">
      <GuidedFromLink />
      <header className="stack">
        <p className="kicker">{t("Voice-guided")}</p>
        <h1>{t("Guided sessions")}</h1>
        <p>{t("Press Start and the LifeZoi voice guides you through each step, with quiet time to move or rest. Pause, resume, or stop whenever you like.")}</p>
      </header>
      <section className="card stack" aria-labelledby="gs-today-title">
        <h2 id="gs-today-title">{t("For your day")}</h2>
        <GuidedDayPicks />
      </section>
      <GuidedLibrary />
      <GuidedHistory />
    </div>
  );
}
