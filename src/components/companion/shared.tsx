"use client";

import { SessionMusicControls } from "@/components/background-music/controls";
import { AudioFocusClaim } from "@/components/background-music/use-audio-focus";
import { useEffect, useRef, useState } from "react";
import { localISODate } from "@/lib/dates";
import { addRecent, clearEntry, recordEntry, toggleFavorite, type DayLog, type EntryStatus } from "@/lib/companion/state";
import { commitCompanion, SAVE_MODE_TEXT, useCompanion } from "@/lib/companion/store";
import { COST_TEXT, sourceById, videoSafety, type VideoItem } from "@/lib/wellness-library/catalog";
import type { GuidedSession } from "@/lib/wellness-library/discover";

export function SaveNote() {
  const { saveMode } = useCompanion();
  return (
    <p className="lz-save" data-mode={saveMode} role="status">
      {SAVE_MODE_TEXT[saveMode]}
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
  done: "Completed",
  partial: "Partly done",
  skipped: "Skipped. That is fine.",
};

/** Completed, Partially completed, Skip, and (optionally) Replace for one activity today. */
export function ActivityActions({
  activityId,
  minutes,
  counts,
  onReplace,
  replaceLabel = "Replace",
}: {
  activityId: string;
  minutes: number;
  counts?: (status: EntryStatus) => Counts;
  onReplace?: () => void;
  replaceLabel?: string;
}) {
  const { state } = useCompanion();
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
          <strong>{STATUS_TEXT[entry.status]}</strong>
          {entry.status !== "skipped" && entry.minutes ? ` · ${entry.minutes} min` : ""}{" "}
          <button className="btn btn-ghost" type="button" onClick={() => commitCompanion((current) => clearEntry(current, today, activityId))}>
            Undo
          </button>
        </p>
      ) : null}
      <div className="lz-buttons">
        <button className="btn btn-teal" type="button" onClick={() => mark("done")} aria-pressed={entry?.status === "done"}>
          Completed
        </button>
        <button className="btn btn-secondary" type="button" onClick={() => mark("partial")} aria-pressed={entry?.status === "partial"}>
          Partially completed
        </button>
        <button className="btn btn-ghost" type="button" onClick={() => mark("skipped")} aria-pressed={entry?.status === "skipped"}>
          Skip
        </button>
        {onReplace ? (
          <button className="btn btn-ghost" type="button" onClick={onReplace}>
            {replaceLabel}
          </button>
        ) : null}
      </div>
    </div>
  );
}

export function FavoriteButton({ id, label }: { id: string; label: string }) {
  const { state } = useCompanion();
  const on = state.media.favorites.includes(id);
  return (
    <button className="btn btn-ghost" type="button" aria-pressed={on} onClick={() => commitCompanion((current) => toggleFavorite(current, id))}>
      {on ? `★ Saved to favorites` : `☆ Add ${label} to favorites`}
    </button>
  );
}

export function RatingControl({ id }: { id: string }) {
  const { state } = useCompanion();
  const value = state.media.ratings[id] ?? 0;
  return (
    <div className="inline-form" role="group" aria-label="Your rating">
      <span className="hint">Your rating:</span>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          className="btn btn-ghost"
          aria-pressed={value === n}
          aria-label={`${n} out of 5`}
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
  const minutes = video.durationSeconds === null ? "Length not checked yet" : `${formatClock(video.durationSeconds)} long`;
  return (
    <ul className="lz-meta">
      <li>{minutes}</li>
      <li>{video.level[0]?.toUpperCase() + video.level.slice(1)}</li>
      <li>{video.intensity.replace("-", " ")}</li>
      <li>Equipment: {video.equipment.join(", ")}</li>
      <li className={video.cost === "free-verified" ? "lz-meta-ok" : "lz-meta-warn"}>{COST_TEXT[video.cost]}</li>
      {!video.lastChecked ? <li className="lz-meta-warn">Availability not checked yet</li> : null}
    </ul>
  );
}

/** Official YouTube player, loaded only after the person presses Play. */
export function VideoPlayer({ video, autoStart = false }: { video: VideoItem; autoStart?: boolean }) {
  const [playing, setPlaying] = useState(autoStart);
  const source = sourceById(video.sourceId);
  return (
    <div className="stack">
      <VideoMeta video={video} />
      <p className="hint">
        Source: {video.instructor} via {source?.name ?? video.platform}. The video stays on {video.platform}; LifeZoi does not copy it.{" "}
        <a href={video.originalUrl} target="_blank" rel="noopener noreferrer">
          Open the original
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
          ▶ Play video
        </button>
      ) : (
        <p className="hint">This video cannot be embedded. Use the link above.</p>
      )}
      {playing && !video.lastChecked ? (
        <p className="hint">If the player shows an error, the video may have moved. An administrator will check it.</p>
      ) : null}
      {playing && video.embedUrl ? <SessionMusicControls /> : null}
      <p className="studio-safety-line">{videoSafety(video)}</p>
    </div>
  );
}

/** Step-by-step timer for an original LifeZoi session. */
export function SessionPlayer({ session, onFinished }: { session: GuidedSession; onFinished?: (secondsDone: number) => void }) {
  const [running, setRunning] = useState(false);
  const [started, setStarted] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const finishedRef = useRef(false);
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
        <li>{session.minutes} minutes</li>
        <li>{session.level[0]?.toUpperCase() + session.level.slice(1)}</li>
        <li>{session.intensity}</li>
        <li>Equipment: {session.equipment.join(", ")}</li>
        <li className="lz-meta-ok">{session.costText}</li>
      </ul>
      {started ? (
        <div className="lz-player" aria-live="polite">
          <p className="hint">
            Step {index + 1} of {session.steps.length} · {current?.phase.replace("-", " ")}
          </p>
          <p className="lz-player-now">{current?.name}</p>
          <p>{current?.cue}</p>
          <p className="hint">Easier: {current?.easier}</p>
          <p className="lz-player-clock" aria-label={`${formatClock(left)} left in this step`}>
            {formatClock(left)}
          </p>
          <progress className="lz-range" max={total} value={elapsed} aria-label="Session progress" />
          {next ? <p className="hint">Next: {next.name}</p> : <p className="hint">Last step.</p>}
          <div className="lz-buttons">
            <button className="btn btn-primary" type="button" onClick={() => setRunning((value) => !value)}>
              {running ? "Pause" : elapsed >= total ? "Finished" : "Resume"}
            </button>
            <button
              className="btn btn-secondary"
              type="button"
              disabled={!next}
              onClick={() => setElapsed(at + (current?.seconds ?? 0))}
            >
              Next step
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
              Stop
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
          ▶ Start session
        </button>
      )}
      <details>
        <summary>See all {session.steps.length} steps</summary>
        <ol className="lz-steps">
          {session.steps.map((step, i) => (
            <li key={`${step.moveId}-${i}`}>
              <strong>{step.name}</strong> ({formatClock(step.seconds)}): {step.cue}
            </li>
          ))}
        </ol>
      </details>
      {session.modifications.length > 0 ? (
        <details>
          <summary>Lower-impact and beginner options</summary>
          <ul>
            {session.modifications.map((text) => (
              <li key={text}>{text}</li>
            ))}
          </ul>
        </details>
      ) : null}
      <p className="studio-safety-line">{session.safety}</p>
    </div>
  );
}
