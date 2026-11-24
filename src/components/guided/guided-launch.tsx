"use client";

import "@/components/guided/guided.css";
import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useGuided } from "@/components/guided/guided-provider";
import { useLocale } from "@/components/locale-provider";
import { useCompanion } from "@/lib/companion/store";
import { DAY_PART_LABEL, DAY_PICKS, dayPartFor, guidedById, GUIDED_SESSIONS, KIND_ICON, KIND_LABEL, NOT_MEDICAL } from "@/lib/guided/catalog";
import { MEDITATION_MINUTES, MEDITATION_THEME_INFO } from "@/lib/guided/meditation";
import type { DayPart } from "@/lib/guided/types";

/** A Start button that opens the player and starts the voice straight from the tap. */
export function GuidedStartButton({ id, label, className = "gs-go" }: { id: string; label?: string; className?: string }) {
  const { t } = useLocale();
  const guided = useGuided();
  const session = guidedById(id);
  if (!session) return null;
  return (
    <button type="button" className={className} onClick={() => guided.launch(id, { start: true })} aria-label={label ?? t("Start {title} with voice guidance", { title: t(session.title) })}>
      <span aria-hidden="true">▶</span> {label ?? t("Start with voice")}
    </button>
  );
}

function SessionCard({ id, label, heading: Heading = "h4" }: { id: string; label?: string; heading?: "h3" | "h4" }) {
  const { t } = useLocale();
  const session = guidedById(id);
  if (!session) return null;
  return (
    <li className="gs-card">
      <p className="hd-match-kind">
        <span aria-hidden="true">{KIND_ICON[session.kind]} </span>
        {t(KIND_LABEL[session.kind])} · {t("{minutes} min", { minutes: session.minutes })}
      </p>
      <Heading>{t(label ?? session.title)}</Heading>
      <p>{t(session.summary)}</p>
      <GuidedStartButton id={id} label={t("Start")} />
    </li>
  );
}

/**
 * My Day's guided sessions: morning, afternoon, and evening suggestions. One
 * tap starts the spoken session right here. With `only`, shows just that part of the day.
 */
export function GuidedDayPicks({ only, headingLevel = "h3" }: { only?: DayPart; headingLevel?: "h3" | "h4" }) {
  const { t } = useLocale();
  const now = dayPartFor(new Date().getHours());
  const parts: DayPart[] = only ? [only] : ["morning", "afternoon", "evening"];
  const Heading = headingLevel;
  return (
    <div className="gs-picks">
      {parts.map((part) => (
        <div key={part} className={`gs-part${part === now && !only ? " gs-part-now" : ""}`}>
          {only ? null : (
            <Heading>
              {t(DAY_PART_LABEL[part])}
              {part === now ? <span className="hint"> · {t("now")}</span> : null}
            </Heading>
          )}
          <ul className="gs-cards">
            {DAY_PICKS[part].map((pick) => (
              <SessionCard key={pick.id} id={pick.id} label={pick.label} heading={headingLevel === "h3" ? "h4" : "h4"} />
            ))}
          </ul>
        </div>
      ))}
      <p className="hint">{t(NOT_MEDICAL)}</p>
    </div>
  );
}

/** A section for My Day: the three parts of the day with Start buttons. */
export function GuidedDaySection() {
  const { t } = useLocale();
  return (
    <section className="card stack" aria-labelledby="guided-day-title">
      <p className="kicker">{t("Voice-guided")}</p>
      <h2 id="guided-day-title">{t("Guided sessions for your day")}</h2>
      <p>{t("Tap Start and the LifeZoi voice guides you step by step. You can listen without looking at the screen.")}</p>
      <GuidedDayPicks />
    </section>
  );
}

/** Every guided session, grouped by kind, with meditation lengths as buttons. */
export function GuidedLibrary() {
  const { t } = useLocale();
  const guided = useGuided();
  const movement = GUIDED_SESSIONS.filter((session) => session.kind !== "meditation");
  return (
    <div className="stack">
      <section className="card stack" aria-labelledby="gs-move-title">
        <h2 id="gs-move-title">{t("Pilates, yoga, stretching, and breathing")}</h2>
        <ul className="gs-cards">
          {movement.map((session) => (
            <SessionCard key={session.id} id={session.id} heading="h3" />
          ))}
        </ul>
      </section>
      <section className="card stack" aria-labelledby="gs-med-title">
        <h2 id="gs-med-title">{t("Meditation")}</h2>
        <p>{t("Choose a theme and a length. Longer sessions have more quiet time between the instructions.")}</p>
        <ul className="gs-cards">
          {MEDITATION_THEME_INFO.map((theme) => (
            <li key={theme.id} className="gs-card">
              <p className="hd-match-kind">
                <span aria-hidden="true">{KIND_ICON.meditation} </span>
                {t("Meditation")}
              </p>
              <h3>{t(theme.title)}</h3>
              <p>{t(theme.summary)}</p>
              <div className="gs-lengths" role="group" aria-label={t("Length of {title}", { title: t(theme.title) })}>
                {MEDITATION_MINUTES.map((minutes) => (
                  <button
                    key={minutes}
                    type="button"
                    className="gs-go"
                    onClick={() => guided.launch(`meditation-${theme.id}-${minutes}`, { start: true })}
                    aria-label={t("Start {title}, {minutes} minutes", { title: t(theme.title), minutes })}
                  >
                    {t("{minutes} min", { minutes })}
                  </button>
                ))}
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

/** Finished guided sessions, newest first. */
export function GuidedHistory() {
  const { t, locale } = useLocale();
  const companion = useCompanion();
  if (!companion.ready) return null;
  const list = companion.state.guided.sessions.slice(0, 20);
  const format = new Intl.DateTimeFormat(locale, { weekday: "short", day: "numeric", month: "short" });
  return (
    <section className="card stack" aria-labelledby="gs-history-title">
      <h2 id="gs-history-title">{t("Your guided sessions")}</h2>
      {list.length === 0 ? (
        <p>{t("No guided sessions finished yet. When you complete one, it is saved here.")}</p>
      ) : (
        <ul className="gs-history">
          {list.map((record) => {
            const session = guidedById(record.session);
            return (
              <li key={record.id}>
                <span>
                  <span aria-hidden="true">{KIND_ICON[record.kind]} </span>
                  {session ? t(session.title) : t(KIND_LABEL[record.kind])}
                  {session?.kind === "meditation" ? ` · ${t("{minutes} min", { minutes: session.minutes })}` : ""}
                </span>
                <span className="hint">
                  {format.format(new Date(`${record.date}T12:00:00`))} · {t("{minutes} min", { minutes: Math.max(1, Math.round(record.seconds / 60)) })}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

/** Opens `/guided?session=<id>&start=1` links. Without a tap first, phones may still need Play pressed. */
export function GuidedFromLink() {
  const params = useSearchParams();
  const guided = useGuided();
  const done = useRef(false);
  useEffect(() => {
    if (done.current) return;
    const id = params.get("session");
    if (!id || !guidedById(id)) return;
    done.current = true;
    guided.launch(id, { start: params.get("start") === "1" });
  }, [params, guided]);
  return null;
}
