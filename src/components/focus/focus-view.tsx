"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLocale, useT } from "@/components/locale-provider";
import { isSounding, useBackgroundMusic } from "@/components/background-music/provider";
import { controlProps, pieceTitle, statusText } from "@/components/background-music/shared";
import { SAVE_MODE_TEXT } from "@/lib/companion/store";
import { LOCALE_META } from "@/lib/i18n/config";
import { localISODate } from "@/lib/dates";
import { ENCOURAGEMENT, suggestBreak, type BreakActivity } from "@/lib/focus/activities";
import { focusDay, weekHistory, weekTotals } from "@/lib/focus/progress";
import {
  advance,
  changeLengths,
  cleanTask,
  CYCLE_LENGTH,
  formatClock,
  initialTimer,
  isFinished,
  LONG_BREAK_CHOICES,
  parseTimer,
  pauseTimer,
  phaseMinutes,
  phaseProgress,
  PRESETS,
  remainingMs,
  resetCycle,
  resetPhase,
  serializeTimer,
  startTimer,
  TIMER_STORAGE_KEY,
  type LongBreakMinutes,
  type Phase,
  type PresetId,
  type TimerState,
} from "@/lib/focus/timer";
import { playChime, prepareChime } from "@/components/focus/chime";
import { useReadAloud } from "@/components/focus/read-aloud";
import { saveBreak, saveFocusSession, useFocus } from "@/components/focus/use-focus";
import { msg } from "@/lib/i18n/translate";
import "./focus.css";

const PHASE_LABEL: Record<Phase, string> = {
  focus: msg("Focus Time"),
  short: msg("Short Break"),
  long: msg("Long Break"),
};

const HOW_IT_WORKS = [
  msg("Choose one task you want to accomplish."),
  msg("Focus on that task for 25 minutes."),
  msg("Take a 5-minute break."),
  msg("Repeat this cycle four times."),
  msg("After four cycles, take a longer break of 15 to 30 minutes."),
  msg("Start another cycle if you like."),
];

function readTimer(): TimerState | null {
  try {
    return parseTimer(window.sessionStorage.getItem(TIMER_STORAGE_KEY), Date.now());
  } catch {
    return null;
  }
}

function writeTimer(state: TimerState) {
  try {
    window.sessionStorage.setItem(TIMER_STORAGE_KEY, serializeTimer(state));
  } catch {
    // Storage can be blocked. The timer still works while this page is open.
  }
}

function dayNumber(date: string): number {
  return Math.floor(Date.parse(`${date}T00:00:00Z`) / 86_400_000);
}

export function FocusView() {
  const t = useT();
  const { locale, messages: m } = useLocale();
  const lang = LOCALE_META[locale].htmlLang;
  const { ready, focus, saveMode, setPrefs } = useFocus();
  const prefs = focus.prefs;
  const music = useBackgroundMusic();
  const reader = useReadAloud(lang);

  const [timer, setTimer] = useState<TimerState>(() => initialTimer());
  const [loaded, setLoaded] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const [shift, setShift] = useState(0);
  const [announcement, setAnnouncement] = useState("");
  const handling = useRef(false);

  // Restore the timer saved in this tab, or start from the saved settings.
  useEffect(() => {
    if (!ready || loaded) return;
    const saved = readTimer();
    // Loading browser storage after the first render keeps the server page and the first client render the same.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTimer(saved ?? initialTimer(prefs.preset, prefs.longMinutes));
    setLoaded(true);
  }, [ready, loaded, prefs.preset, prefs.longMinutes]);

  useEffect(() => {
    if (loaded) writeTimer(timer);
  }, [timer, loaded]);

  useEffect(() => {
    if (!timer.running) return;
    const id = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(id);
  }, [timer.running]);

  const today = ready ? localISODate(new Date(now)) : "2026-01-01";

  const musicFollows = useCallback(
    (next: TimerState) => {
      if (!prefs.musicInFocus) return;
      const wantsMusic = next.running && next.phase === "focus";
      if (wantsMusic && !isSounding(music.status)) music.play();
      if (!wantsMusic && isSounding(music.status)) music.pause();
    },
    [prefs.musicInFocus, music],
  );

  const update = useCallback(
    (next: TimerState) => {
      setTimer(next);
      setNow(Date.now());
      musicFollows(next);
    },
    [musicFollows],
  );

  // A phase reached zero: save it, chime, and move on.
  useEffect(() => {
    if (!loaded || !isFinished(timer, now) || handling.current) return;
    handling.current = true;
    const finished = timer;
    const date = localISODate();
    if (finished.phase === "focus") saveFocusSession(date, phaseMinutes(finished.preset, finished.longMinutes, "focus"));
    else saveBreak(date);
    if (prefs.sound) playChime(finished.phase === "focus" ? "focus-done" : "break-done");
    const next = advance(finished, Date.now(), prefs.autoNext);
    const text =
      next.phase === "focus"
        ? t("Break is over. Focus session {round} of {total} is ready.", { round: next.round, total: CYCLE_LENGTH })
        : next.phase === "long"
          ? t("Four focus sessions done. Time for a long break.")
          : t("Focus session done. Time for a short break.");
    setAnnouncement(text);
    if (prefs.voice) reader.play(text);
    setShift(0);
    update(next);
    handling.current = false;
  }, [timer, now, loaded, prefs.sound, prefs.voice, prefs.autoNext, t, reader, update]);

  const left = remainingMs(timer, now);
  const progress = phaseProgress(timer, now);
  const onBreak = timer.phase !== "focus";
  const activity = suggestBreak(onBreak ? (timer.phase === "long" ? "long" : "short") : timer.round >= CYCLE_LENGTH ? "long" : "short", timer.round, dayNumber(today), shift);
  const encouragement = ENCOURAGEMENT[timer.phase][(timer.round - 1) % ENCOURAGEMENT[timer.phase].length];

  const start = () => {
    prepareChime();
    update(startTimer(timer, Date.now()));
  };
  const pause = () => update(pauseTimer(timer, Date.now()));
  const reset = () => update(resetPhase(timer));
  const newCycle = () => update(resetCycle(timer));
  const skip = () => {
    const current = timer;
    // A break counts once at least a minute of it was taken.
    if (current.phase !== "focus" && current.started && remainingMs(current, Date.now()) <= Math.max(0, phaseMinutes(current.preset, current.longMinutes, current.phase) * 60_000 - 60_000)) {
      saveBreak(localISODate());
    }
    setShift(0);
    update(advance(current, Date.now(), current.running));
  };

  const chooseLengths = (preset: PresetId, longMinutes: LongBreakMinutes) => {
    setPrefs({ preset, longMinutes });
    update(changeLengths(timer, preset, longMinutes));
  };

  const week = weekHistory(focus, today);
  const totals = weekTotals(week);
  const todayRow = focusDay(focus, today);
  const most = Math.max(25, ...week.map((day) => day.minutes));
  const dayName = (date: string) =>
    new Intl.DateTimeFormat(lang, { weekday: "short", timeZone: "UTC" }).format(new Date(`${date}T12:00:00Z`));

  const ring = 2 * Math.PI * 108;
  const mainLabel = timer.running ? t("Pause") : timer.started ? t("Resume") : t("Start");
  const musicOn = isSounding(music.status);

  const activityText = (item: BreakActivity) => [t(item.title), ...item.steps.map((step) => t(step))].join(". ");

  return (
    <div className="stack-lg focus-page">
      <section className="hero-panel focus-hero">
        <p className="kicker">{t("LifeZoi · Brain health")}</p>
        <h1>{t("Focus & Brain Training")}</h1>
        <p>{t("Exercise your brain as well as your body. Focus on one task, then rest with a gentle break activity.")}</p>
        <p className="muted">{t("Based on the Pomodoro Technique: short focus sessions with regular breaks.")}</p>
      </section>

      <section className="card focus-timer" aria-labelledby="focus-phase" data-phase={timer.phase}>
        <ol className="focus-phases" aria-label={t("Sessions")}>
          {(["focus", "short", "long"] as Phase[]).map((phase) => (
            <li key={phase} aria-current={timer.phase === phase ? "step" : undefined} data-phase={phase}>
              {t(PHASE_LABEL[phase])}
            </li>
          ))}
        </ol>

        <h2 id="focus-phase" className="focus-phase-title">
          {t(PHASE_LABEL[timer.phase])}
        </h2>
        <p className="focus-round">
          {t("Focus session {round} of {total}", { round: timer.round, total: CYCLE_LENGTH })}
        </p>
        <div className="focus-dots" aria-hidden="true">
          {Array.from({ length: CYCLE_LENGTH }, (_, index) => {
            const done = index + 1 < timer.round || (index + 1 === timer.round && onBreak);
            return <span key={index} data-done={done} data-current={index + 1 === timer.round && !onBreak} />;
          })}
        </div>

        <div className="focus-clock">
          <svg viewBox="0 0 240 240" aria-hidden="true" focusable="false">
            <circle className="focus-ring-bg" cx="120" cy="120" r="108" />
            {progress > 0.005 ? <circle
              className="focus-ring"
              cx="120"
              cy="120"
              r="108"
              strokeDasharray={ring}
              strokeDashoffset={ring * (1 - progress)}
              transform="rotate(-90 120 120)"
            /> : null}
          </svg>
          <div className="focus-time" role="timer" aria-live="off" aria-label={t("Time left: {time}", { time: formatClock(left) })}>
            {formatClock(left)}
          </div>
        </div>
        <div
          className="focus-bar"
          role="progressbar"
          aria-label={t("Session progress")}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress * 100)}
        >
          <span style={{ width: `${Math.round(progress * 100)}%` }} />
        </div>

        <p className="focus-cheer">{t(encouragement)}</p>
        <p className="focus-announce" role="status" aria-live="polite" data-empty={!announcement}>
          {announcement}
        </p>

        <div className="focus-controls">
          <button type="button" className="btn btn-primary focus-big" onClick={timer.running ? pause : start}>
            <span aria-hidden="true">{timer.running ? "❚❚" : "▶"}</span> {mainLabel}
          </button>
          <button type="button" className="btn btn-secondary focus-big" onClick={reset} disabled={!timer.started}>
            <span aria-hidden="true">↺</span> {t("Reset")}
          </button>
          <button type="button" className="btn btn-secondary focus-big" onClick={skip}>
            <span aria-hidden="true">⏭</span> {onBreak ? t("End break") : t("Skip to break")}
          </button>
        </div>
        <button type="button" className="btn btn-ghost focus-new-cycle" onClick={newCycle}>
          {t("Start a new cycle")}
        </button>

        <label className="focus-task">
          <span>{t("Your one task")}</span>
          <input
            type="text"
            value={timer.task}
            maxLength={120}
            placeholder={t("For example: write a letter to my grandson")}
            onChange={(event) => setTimer({ ...timer, task: cleanTask(event.target.value) })}
          />
          <small className="hint">{t("The task stays in this browser tab only and is not saved to your progress.")}</small>
        </label>
      </section>

      <section className={`card focus-break ${onBreak ? "is-now" : ""}`} aria-labelledby="focus-break-title">
        <p className="kicker">{onBreak ? t("Your break activity") : t("Coming up in your next break")}</p>
        <h2 id="focus-break-title">
          <span aria-hidden="true">{activity.icon}</span> {t(activity.title)}
        </h2>
        <p>{t(activity.summary)}</p>
        <ol className="focus-steps">
          {activity.steps.map((step) => (
            <li key={step}>{t(step)}</li>
          ))}
        </ol>
        <div className="actions">
          {reader.available ? (
            <>
              {reader.status === "idle" ? (
                <button type="button" className="btn btn-primary" onClick={() => reader.play(activityText(activity))}>
                  <span aria-hidden="true">🔊</span> {t("Read aloud")}
                </button>
              ) : null}
              {reader.status === "speaking" ? (
                <button type="button" className="btn btn-primary" onClick={reader.pause}>
                  {t("Pause reading")}
                </button>
              ) : null}
              {reader.status === "paused" ? (
                <button type="button" className="btn btn-primary" onClick={reader.resume}>
                  {t("Resume reading")}
                </button>
              ) : null}
              {reader.status !== "idle" ? (
                <button type="button" className="btn btn-secondary" onClick={reader.stop}>
                  {t("Stop")}
                </button>
              ) : null}
              <button type="button" className="btn btn-secondary" onClick={reader.replay} disabled={reader.status !== "idle" || !reader.hasText}>
                {t("Replay")}
              </button>
            </>
          ) : null}
          <button type="button" className="btn btn-secondary" onClick={() => setShift((value) => value + 1)}>
            {t("Show another idea")}
          </button>
          {activity.href && activity.linkLabel ? (
            <Link className="btn btn-ghost" href={activity.href}>
              {t(activity.linkLabel)}
            </Link>
          ) : null}
        </div>
        {reader.available && reader.voices.length > 1 ? (
          <label className="focus-voice">
            <span>{t("Voice")}</span>
            <select value={reader.voiceId} onChange={(event) => reader.setVoiceId(event.target.value)}>
              {reader.voices.map((voice) => (
                <option key={voice.id} value={voice.id}>
                  {voice.name}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        {reader.available && reader.voices.length === 0 ? (
          <p className="hint">{t("This device has no voice for this language yet, so the reading may use another voice.")}</p>
        ) : null}
        <p className="hint">{t("Move gently and stop if anything hurts. These activities are general wellness ideas, not medical advice.")}</p>
      </section>

      <div className="focus-grid">
        <section className="card stack" aria-labelledby="focus-settings-title">
          <h2 id="focus-settings-title">{t("Session length")}</h2>
          <div className="focus-presets" role="radiogroup" aria-label={t("Session length")}>
            {PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                role="radio"
                aria-checked={prefs.preset === preset.id}
                className="focus-preset"
                onClick={() => chooseLengths(preset.id, prefs.longMinutes)}
              >
                <strong>{t("{focus} min focus", { focus: preset.focus })}</strong>
                <span>{t("{rest} min break", { rest: preset.short })}</span>
                {preset.id === "25-5" ? <em>{t("Standard")}</em> : null}
              </button>
            ))}
          </div>
          <h3>{t("Long break after four sessions")}</h3>
          <div className="focus-chips" role="radiogroup" aria-label={t("Long break after four sessions")}>
            {LONG_BREAK_CHOICES.map((minutes) => (
              <button
                key={minutes}
                type="button"
                role="radio"
                aria-checked={prefs.longMinutes === minutes}
                className="focus-chip"
                onClick={() => chooseLengths(prefs.preset, minutes)}
              >
                {t("{minutes} min", { minutes })}
              </button>
            ))}
          </div>
          {timer.started ? <p className="hint">{t("New lengths apply from the next session.")}</p> : null}

          <h3>{t("Sound and voice")}</h3>
          <label className="focus-toggle">
            <input type="checkbox" checked={prefs.sound} onChange={(event) => setPrefs({ sound: event.target.checked })} />
            <span>{t("Play a soft chime when a session ends")}</span>
          </label>
          <button
            type="button"
            className="btn btn-ghost focus-test"
            onClick={() => {
              prepareChime();
              playChime();
            }}
          >
            {t("Test the chime")}
          </button>
          <label className="focus-toggle">
            <input type="checkbox" checked={prefs.voice} onChange={(event) => setPrefs({ voice: event.target.checked })} />
            <span>{t("Say out loud when a session changes")}</span>
          </label>
          <label className="focus-toggle">
            <input type="checkbox" checked={prefs.autoNext} onChange={(event) => setPrefs({ autoNext: event.target.checked })} />
            <span>{t("Start the next session automatically")}</span>
          </label>
        </section>

        <section className="card stack focus-music" aria-labelledby="focus-music-title">
          <h2 id="focus-music-title">
            <span aria-hidden="true">🎵</span> {t("Focus music")}
          </h2>
          <p>{t("Gentle background music can help some people settle into a task. It is optional.")}</p>
          <label className="focus-toggle">
            <input
              type="checkbox"
              checked={prefs.musicInFocus}
              onChange={(event) => {
                setPrefs({ musicInFocus: event.target.checked });
                if (!event.target.checked) return;
                if (timer.running && timer.phase === "focus" && !musicOn) music.play();
              }}
            />
            <span>{t("Play music during focus time and pause it for breaks")}</span>
          </label>
          <div className="actions" {...controlProps}>
            <button {...controlProps} type="button" className="btn btn-primary" aria-pressed={musicOn} onClick={() => (musicOn ? music.pause() : music.play())}>
              <span aria-hidden="true">{musicOn ? "❚❚" : "▶"}</span> {musicOn ? m.music.pause : m.music.play}
            </button>
            <button {...controlProps} type="button" className="btn btn-secondary" onClick={music.next}>
              {m.music.next}
            </button>
          </div>
          <p className="hint" role="status">
            {music.piece ? (musicOn ? m.music.nowPlaying : m.music.upNext).replace("{title}", pieceTitle(m, music.piece)) : null}{" "}
            {statusText(m, music.status, music.holdReason)}
          </p>
          <label className="focus-volume" {...controlProps}>
            <span>{t("Music volume")}</span>
            <input
              {...controlProps}
              type="range"
              min={0}
              max={100}
              step={5}
              value={Math.round(music.prefs.volume * 100)}
              onChange={(event) => music.setVolume(Number(event.target.value) / 100)}
            />
          </label>
          <p className="hint">{t("Music volume is separate from the chime and the reading voice.")}</p>
          <Link className="btn btn-ghost" href="/library/music">
            {t("More music: classical piano, relaxing instrumentals, and nature sounds")}
          </Link>
        </section>
      </div>

      <section className="card stack" aria-labelledby="focus-progress-title">
        <h2 id="focus-progress-title">{t("Your progress")}</h2>
        <div className="focus-stats">
          <p>
            <strong>{todayRow.sessions}</strong> {t("focus sessions today")}
          </p>
          <p>
            <strong>{todayRow.minutes}</strong> {t("focused minutes today")}
          </p>
          <p>
            <strong>{todayRow.breaks}</strong> {t("breaks taken today")}
          </p>
        </div>
        <h3>{t("This week")}</h3>
        <div className="focus-week" role="list" aria-label={t("Focused minutes in the last seven days")}>
          {week.map((day) => (
            <div key={day.date} role="listitem" className="focus-day" data-today={day.date === today}>
              <span className="focus-day-bar" aria-hidden="true">
                <span style={{ height: `${Math.round((day.minutes / most) * 100)}%` }} />
              </span>
              <span className="focus-day-minutes">{t("{minutes} min", { minutes: day.minutes })}</span>
              <span className="focus-day-name">{dayName(day.date)}</span>
            </div>
          ))}
        </div>
        <p>
          {t("This week: {sessions} focus sessions, {minutes} focused minutes, and {breaks} breaks.", {
            sessions: totals.sessions,
            minutes: totals.minutes,
            breaks: totals.breaks,
          })}
        </p>
        <p className="hint">{t("Every session counts, even one. Rest days are part of a healthy rhythm too.")}</p>
        <p className="lz-save" data-mode={saveMode} role="status">
          {t(SAVE_MODE_TEXT[saveMode])}
        </p>
      </section>

      <section className="card stack" aria-labelledby="focus-how-title">
        <h2 id="focus-how-title">{t("How the Pomodoro Technique works")}</h2>
        <ol className="focus-how">
          {HOW_IT_WORKS.map((step) => (
            <li key={step}>{t(step)}</li>
          ))}
        </ol>
        <p className="hint">{t("Choose the lengths that feel comfortable. Shorter sessions are a good way to begin.")}</p>
        <div className="actions">
          <Link className="btn btn-secondary" href="/brain-quiz">
            {t("Brain & Habit Quiz")}
          </Link>
          <Link className="btn btn-secondary" href="/breathe">
            {t("Breathe for Life")}
          </Link>
          <Link className="btn btn-secondary" href="/academy/move/breaks">
            {t("Movement breaks")}
          </Link>
        </div>
      </section>
    </div>
  );
}
