"use client";

import "@/components/growth-academy/academy.css";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useLocale, useT } from "@/components/locale-provider";
import { useSession } from "@/components/session-provider";
import { localISODate } from "@/lib/dates";
import { allAchievements } from "@/lib/growth-academy/achievements";
import { ACADEMY_BASE, ACADEMY_NOTE, GROWTH_COURSES, JOURNEY_PATH } from "@/lib/growth-academy/catalog";
import { setVoicePref, type LessonStatus } from "@/lib/growth-academy/progress";
import { ACADEMY_SAVE_TEXT, commitAcademy, useAcademy } from "@/lib/growth-academy/store";
import type { Translate } from "@/lib/i18n/translate";

/** Today's local date, updated when the tab comes back into view (a page left open overnight rolls over). */
export function useToday(): string {
  const [today, setToday] = useState(() => localISODate());
  useEffect(() => {
    const refresh = () => setToday(localISODate());
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    const timer = window.setInterval(refresh, 60_000);
    return () => {
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
      window.clearInterval(timer);
    };
  }, []);
  return today;
}

export function formatDay(iso: string, locale: string): string {
  if (!iso) return "";
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  return new Intl.DateTimeFormat(locale, { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(Date.UTC(y, m - 1, d)));
}

export function formatDuration(t: Translate, seconds: number): string {
  const minutes = Math.round(seconds / 60);
  if (minutes < 1) return t("Under a minute");
  if (minutes < 60) return t("{minutes} min", { minutes });
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? t("{hours} h {minutes} min", { hours, minutes: rest }) : t("{hours} h", { hours });
}

export function ProgressBar({ completed, total, label }: { completed: number; total: number; label?: string }) {
  const t = useT();
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
  const text = completed === 0 ? t("Not started") : t("{percent}%", { percent });
  return (
    <div className="ga-progress">
      <div className="ga-progress-label">
        <span>{label ?? t("{done} / {total} lessons completed", { done: completed, total })}</span>
        <span>{text}</span>
      </div>
      <div
        className="ga-bar"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={completed}
        aria-valuetext={t("{done} of {total} lessons completed", { done: completed, total })}
      >
        <span style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

export function statusLabel(t: Translate, status: LessonStatus): string {
  if (status === "completed") return t("Completed");
  if (status === "in-progress") return t("In progress");
  return t("Not started");
}

export function StatusBadge({ status }: { status: LessonStatus }) {
  const t = useT();
  return (
    <span className="ga-badge" data-status={status}>
      {status === "completed" ? "✓ " : null}
      {statusLabel(t, status)}
    </span>
  );
}

/** Where progress is saved, in plain words. */
export function SaveNote() {
  const t = useT();
  const { saveMode } = useAcademy();
  return (
    <p className="ga-note" role="status">
      {t(ACADEMY_SAVE_TEXT[saveMode])}
    </p>
  );
}

export function AcademyNote() {
  const t = useT();
  return <p className="ga-note">{t(ACADEMY_NOTE)}</p>;
}

/** "Show Listen buttons": voice is optional, and every lesson reads fully without it. */
export function VoiceToggle() {
  const t = useT();
  const { state } = useAcademy();
  return (
    <label className="ga-check ga-no-print">
      <input type="checkbox" checked={state.prefs.voice} onChange={(event) => commitAcademy((s) => setVoicePref(s, event.target.checked))} />
      <span>{t("Show Listen buttons (read lessons aloud with the LifeZoi voice)")}</span>
    </label>
  );
}

/** A short, dismissible note when an achievement is earned. */
export function AchievementToast({ ids, onClose }: { ids: string[]; onClose: () => void }) {
  const t = useT();
  useEffect(() => {
    if (ids.length === 0) return;
    const timer = window.setTimeout(onClose, 9000);
    return () => window.clearTimeout(timer);
  }, [ids, onClose]);
  if (ids.length === 0) return null;
  const all = allAchievements(GROWTH_COURSES);
  const names = ids.map((id) => all.find((item) => item.id === id)).filter(Boolean).map((item) => t(item!.title));
  return (
    <div className="ga-toast" role="status" aria-live="polite">
      <span>
        🏅 {t("Achievement earned: {name}", { name: names.join(", ") })} <Link href={`${JOURNEY_PATH}#achievements`} style={{ color: "inherit" }}>{t("See achievements")}</Link>
      </span>
      <button type="button" onClick={onClose}>
        {t("Close")}
      </button>
    </div>
  );
}

/** Breadcrumb-style links back to the Academy and My Growth Journey. */
export function AcademyLinks({ children }: { children?: React.ReactNode }) {
  const t = useT();
  return (
    <nav className="ga-row ga-no-print" aria-label={t("Training Academy")}>
      <Link href={ACADEMY_BASE}>{t("Training Academy")}</Link>
      <span aria-hidden="true">·</span>
      <Link href={JOURNEY_PATH}>{t("My Growth Journey")}</Link>
      {children}
    </nav>
  );
}

/** The session and the store are both ready, and the sample flag. */
export function useAcademyReady() {
  const { ready, sample } = useSession();
  const academy = useAcademy();
  const { locale } = useLocale();
  return { ready: ready && academy.ready, sample, academy, locale };
}
