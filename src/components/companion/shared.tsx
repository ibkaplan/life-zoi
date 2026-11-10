"use client";

import { AudioFocusClaim } from "@/components/background-music/use-audio-focus";
import { useEffect, useRef, useState } from "react";
import { localISODate } from "@/lib/dates";
import { addRecent, clearEntry, recordEntry, toggleFavorite, type DayLog, type EntryStatus } from "@/lib/companion/state";
import { commitCompanion, SAVE_MODE_TEXT, useCompanion } from "@/lib/companion/store";
import { COST_TEXT, sourceById, videoSafety, type VideoItem } from "@/lib/wellness-library/catalog";
import type { GuidedSession } from "@/lib/wellness-library/discover";
import { useLocale, useT } from "@/components/locale-provider";
import { msg } from "@/lib/i18n/translate";

export function SaveNote() {
  const { saveMode } = useCompanion();
  const t = useT();
  return (
    <p className="lz-save" data-mode={saveMode} role="status">
      {t(SAVE_MODE_TEXT[saveMode])}
    </p>
  );
}

export function formatClock(seconds: number): string {
  const safe = Math.max(0, Math.round(seconds));
  const m = Math.floor(safe / 60);
  const s = safe % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

type Counts = Partial<Pick<DayLog, "walkingMinutes" | "exerciseMinutes" | "readingPages" | "listeningMinutes" | "brainGames" | "nutritionHabits">>;

const STATUS_TEXT: Record<EntryStatus, string> = {
  done: msg("Completed"),
  partial: msg("Partly done"),
  skipped: msg("Skipped. That is fine."),
};

/** Who a favorite button is for, as a whole phrase in each language. */
const FAVORITE_TEXT: Record<string, string> = {
  "this video": msg("Add this video to favorites"),
  "this session": msg("Add this session to favorites"),
  "this class": msg("Add this class to favorites"),
  "this track": msg("Add this track to favorites"),
  "this book": msg("Add this book to favorites"),
};

const LEVEL_WORD: Record<string, string> = { beginner: msg("Beginner"), intermediate: msg("Intermediate"), advanced: msg("Advanced") };
const INTENSITY_WORD: Record<string, string> = { "very-light": msg("Very light"), light: msg("Light"), moderate: msg("Moderate"), vigorous: msg("Vigorous") };
const EQUIPMENT_WORD: Record<string, string> = {
  none: msg("None"),
  chair: msg("Chair"),
  mat: msg("Mat"),
  "light-weights": msg("Light weights"),
  wall: msg("Wall"),
  counter: msg("Counter"),
  stairs: msg("Stairs"),
};
const PHASE_WORD: Record<string, string> = { "warm-up": msg("Warm-up"), main: msg("Main part"), "cool-down": msg("Cool-down") };

/** Completed, Partially completed, Skip, and (optionally) Replace for one activity today. */
export function ActivityActions({
  activityId,
  minutes,
  counts,
  onReplace,
  replaceLabel,
}: {
  activityId: string;
  minutes: number;
  counts?: (status: EntryStatus) => Counts;
  onReplace?: () => void;
  replaceLabel?: string;
}) {
  const { state } = useCompanion();
  const t = useT();
  const today = localISODate();
  const entry = state.days[today]?.entries[activityId];
  function mark(status: EntryStatus) {
    const used = status === "partial" ? Math.max(1, Math.round(minutes / 2)) : status === "done" ? minutes : 0;
    commitCompanion((current) =>
      recordEntry(current, today, activityId, { status, minutes: used, replacedWith: "" }, counts ? counts(status) : {}),
    );
  }
  return (
    <div className="stack">
      {entry ? (
        <p role="status" className="hint">
          <strong>{t(STATUS_TEXT[entry.status])}</strong>
          {entry.status !== "skipped" && entry.minutes ? ` · ${t("{minutes} min", { minutes: entry.minutes })}` : ""}{" "}
          <button className="btn btn-ghost" type="button" onClick={() => commitCompanion((current) => clearEntry(current, today, activityId))}>
            {t("Undo")}
          </button>
        </p>
      ) : null}
      <div className="lz-buttons">
        <button className="btn btn-teal" type="button" onClick={() => mark("done")} aria-pressed={entry?.status === "done"}>
          {t("Completed")}
        </button>
        <button className="btn btn-secondary" type="button" onClick={() => mark("partial")} aria-pressed={entry?.status === "partial"}>
          {t("Partially completed")}
        </button>
        <button className="btn btn-ghost" type="button" onClick={() => mark("skipped")} aria-pressed={entry?.status === "skipped"}>
          {t("Skip")}
        </button>
        {onReplace ? (
          <button className="btn btn-ghost" type="button" onClick={onReplace}>
            {replaceLabel ?? t("Replace")}
          </button>
        ) : null}
      </div>
    </div>
  );
}

export function FavoriteButton({ id, label }: { id: string; label: string }) {
  const { state } = useCompanion();
  const on = state.media.favorites.includes(id);
  const t = useT();
  const add = FAVORITE_TEXT[label] ? t(FAVORITE_TEXT[label]) : `Add ${label} to favorites`;
  return (
    <button className="btn btn-ghost" type="button" aria-pressed={on} onClick={() => commitCompanion((current) => toggleFavorite(current, id))}>
      {on ? `★ ${t("Saved to favorites")}` : `☆ ${add}`}
    </button>
  );
}

export function RatingControl({ id }: { id: string }) {
  const { state } = useCompanion();
  const value = state.media.ratings[id] ?? 0;
  const t = useT();
  return (
    <div className="inline-form" role="group" aria-label={t("Your rating")}>
      <span className="hint">{t("Your rating:")}</span>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          className="btn btn-ghost"
          aria-pressed={value === n}
          aria-label={t("{value} out of 5", { value: n })}
          onClick={() =>
            commitCompanion((current) => ({ ...current, media: { ...current.media, ratings: { ...current.media.ratings, [id]: n } } }))
          }
        >
          {n <= value ? "★" : "☆"}
        </button>
      ))}
    </div>
  );
}

export function VideoMeta({ video }: { video: VideoItem }) {
  const t = useT();
  const { locale } = useLocale();
  const minutes = video.durationSeconds === null ? t("Length not checked yet") : t("{time} long", { time: formatClock(video.durationSeconds) });
  return (
    <ul className="lz-meta">
      <li>{minutes}</li>
      <li>{LEVEL_WORD[video.level] ? t(LEVEL_WORD[video.level]) : video.level[0]?.toUpperCase() + video.level.slice(1)}</li>
      <li>{INTENSITY_WORD[video.intensity] ? t(INTENSITY_WORD[video.intensity]) : video.intensity.replace("-", " ")}</li>
      <li>{t("Equipment: {list}", { list: video.equipment.map((item) => (EQUIPMENT_WORD[item] ? t(EQUIPMENT_WORD[item]) : item)).join(", ") })}</li>
      <li className={video.cost === "free-verified" ? "lz-meta-ok" : "lz-meta-warn"}>{t(COST_TEXT[video.cost])}</li>
      {!video.lastChecked ? <li className="lz-meta-warn">{t("Availability not checked yet")}</li> : null}
      {locale !== "en" && video.language === "en" ? <li>{t("Video in English")}</li> : null}
    </ul>
  );
}

/** Official YouTube player, loaded only after the person presses Play. */
export function VideoPlayer({ video, autoStart = false }: { video: VideoItem; autoStart?: boolean }) {
  const [playing, setPlaying] = useState(autoStart);
  const t = useT();
  const source = sourceById(video.sourceId);
  return (
    <div className="stack">
      <VideoMeta video={video} />
      <p className="hint">
        {t("Source: {instructor} via {source}. The video stays on {platform}; LifeZoi does not copy it.", { instructor: video.instructor, source: source?.name ?? video.platform, platform: video.platform })}{" "}
        <a href={video.originalUrl} target="_blank" rel="noopener noreferrer">
          {t("Open the original")}
        </a>
      </p>
      {playing && video.embedUrl ? (
        <div className="video-frame">
          <AudioFocusClaim id="video-player" />
          <iframe
            src={video.embedUrl}
            title={video.title}
            allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
        </div>
      ) : video.embedUrl ? (
        <button
          className="btn btn-primary"
          type="button"
          onClick={() => {
            setPlaying(true);
            commitCompanion((current) => addRecent(current, `video:${video.id}`, new Date().toISOString()));
          }}
        >
          ▶ {t("Play video")}
        </button>
      ) : (
        <p className="hint">{t("This video cannot be embedded. Use the link above.")}</p>
      )}
      {playing && !video.lastChecked ? (
        <p className="hint">{t("If the player shows an error, the video may have moved. An administrator will check it.")}</p>
      ) : null}
      <p className="studio-safety-line">{t(videoSafety(video))}</p>
    </div>
  );
}

/** Step-by-step timer for an original LifeZoi session. */
export function SessionPlayer({ session, onFinished }: { session: GuidedSession; onFinished?: (secondsDone: number) => void }) {
  const [running, setRunning] = useState(false);
  const [started, setStarted] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const finishedRef = useRef(false);
  const t = useT();
  const total = session.steps.reduce((sum, step) => sum + step.seconds, 0);

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => setElapsed((value) => Math.min(total, value + 1)), 1000);
    return () => window.clearInterval(id);
  }, [running, total]);

  useEffect(() => {
    if (elapsed >= total && started && !finishedRef.current) {
      finishedRef.current = true;
      setRunning(false);
      onFinished?.(total);
    }
  }, [elapsed, total, started, onFinished]);

  let at = 0;
  let current = session.steps[0];
  let left = current?.seconds ?? 0;
  for (const step of session.steps) {
    if (elapsed < at + step.seconds) {
      current = step;
      left = at + step.seconds - elapsed;
      break;
    }
    at += step.seconds;
  }
  const index = current ? session.steps.indexOf(current) : 0;
  const next = session.steps[index + 1];

  return (
    <div className="stack">
      <ul className="lz-meta">
        <li>{t("{minutes} minutes", { minutes: session.minutes })}</li>
        <li>{LEVEL_WORD[session.level] ? t(LEVEL_WORD[session.level]) : session.level[0]?.toUpperCase() + session.level.slice(1)}</li>
        <li>{INTENSITY_WORD[session.intensity] ? t(INTENSITY_WORD[session.intensity]) : session.intensity}</li>
        <li>{t("Equipment: {list}", { list: session.equipment.map((item) => (EQUIPMENT_WORD[item] ? t(EQUIPMENT_WORD[item]) : item)).join(", ") })}</li>
        <li className="lz-meta-ok">{t(session.costText)}</li>
      </ul>
      {started ? (
        <div className="lz-player" aria-live="polite">
          <p className="hint">
            {t("Step {current} of {total}", { current: index + 1, total: session.steps.length })} ·{" "}
            {current ? (PHASE_WORD[current.phase] ? t(PHASE_WORD[current.phase]) : current.phase.replace("-", " ")) : ""}
          </p>
          <p className="lz-player-now">{current ? t(current.name) : ""}</p>
          <p>{current ? t(current.cue) : ""}</p>
          <p className="hint">{t("Easier: {text}", { text: current ? t(current.easier) : "" })}</p>
          <p className="lz-player-clock" aria-label={t("{time} left in this step", { time: formatClock(left) })}>
            {formatClock(left)}
          </p>
          <progress className="lz-range" max={total} value={elapsed} aria-label={t("Session progress")} />
          {next ? <p className="hint">{t("Next: {name}", { name: t(next.name) })}</p> : <p className="hint">{t("Last step.")}</p>}
          <div className="lz-buttons">
            <button className="btn btn-primary" type="button" onClick={() => setRunning((value) => !value)}>
              {running ? t("Pause") : elapsed >= total ? t("Finished") : t("Resume")}
            </button>
            <button
              className="btn btn-secondary"
              type="button"
              disabled={!next}
              onClick={() => setElapsed(at + (current?.seconds ?? 0))}
            >
              {t("Next step")}
            </button>
            <button
              className="btn btn-ghost"
              type="button"
              onClick={() => {
                setRunning(false);
                setStarted(false);
                setElapsed(0);
                finishedRef.current = false;
              }}
            >
              {t("Stop")}
            </button>
          </div>
        </div>
      ) : (
        <button
          className="btn btn-primary"
          type="button"
          onClick={() => {
            setStarted(true);
            setRunning(true);
            commitCompanion((state) => addRecent(state, `session:${session.id}`, new Date().toISOString()));
          }}
        >
          ▶ {t("Start session")}
        </button>
      )}
      <details>
        <summary>{t("See all steps ({count})", { count: session.steps.length })}</summary>
        <ol className="lz-steps">
          {session.steps.map((step, i) => (
            <li key={`${step.moveId}-${i}`}>
              <strong>{t(step.name)}</strong> ({formatClock(step.seconds)}): {t(step.cue)}
            </li>
          ))}
        </ol>
      </details>
      {session.modifications.length > 0 ? (
        <details>
          <summary>{t("Lower-impact and beginner options")}</summary>
          <ul>
            {session.modifications.map((text) => (
              <li key={text}>{t(text)}</li>
            ))}
          </ul>
        </details>
      ) : null}
      <p className="studio-safety-line">{t(session.safety)}</p>
    </div>
  );
}
