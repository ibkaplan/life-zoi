"use client";

import Link from "next/link";
import { useId } from "react";
import { useLocale } from "@/components/locale-provider";
import { isSounding, useBackgroundMusic, useMusicProgress } from "@/components/background-music/provider";
import { clock, controlProps, pieceArtist, pieceTitle, statusText } from "@/components/background-music/shared";
import { fmt } from "@/lib/i18n/config";
import { CATEGORY_ICON, LIBRARY_CATEGORIES, type LibraryCategory } from "@/lib/music-library/catalog";

/** The large Music ON / Music OFF switch. OFF stops the sound straight away. */
export function MusicOnOffSwitch() {
  const { messages: m } = useLocale();
  const music = useBackgroundMusic();
  const on = isSounding(music.status) || music.status === "held";
  return (
    <button
      {...controlProps}
      type="button"
      className="music-onoff"
      role="switch"
      aria-checked={on}
      aria-label={m.music.onOffLabel}
      onClick={() => (on ? music.pause() : music.play())}
    >
      <span className="music-onoff-track" aria-hidden="true">
        <span className="music-onoff-thumb" />
      </span>
      <span>{on ? m.music.musicOn : m.music.musicOff}</span>
    </button>
  );
}

/** Previous, Play or Pause, and Next, as large buttons. */
export function TransportControls() {
  const { messages: m } = useLocale();
  const music = useBackgroundMusic();
  const on = isSounding(music.status);
  return (
    <div className="music-transport" role="group" aria-label={m.music.headerLabel} {...controlProps}>
      <button type="button" className="music-round" aria-label={m.music.previous} title={m.music.previous} onClick={() => music.previous()}>
        <span aria-hidden="true">⏮</span>
      </button>
      <button
        type="button"
        className="music-round music-round-main"
        aria-pressed={on}
        aria-label={on ? m.music.pause : music.status === "held" ? m.music.resume : m.music.play}
        title={on ? m.music.pause : m.music.play}
        onClick={() => (on ? music.pause() : music.play())}
      >
        <span aria-hidden="true">{on ? "❚❚" : "▶"}</span>
      </button>
      <button type="button" className="music-round" aria-label={m.music.next} title={m.music.next} onClick={() => music.next()}>
        <span aria-hidden="true">⏭</span>
      </button>
    </div>
  );
}

/** Title, artist, and the current status. */
export function NowPlaying() {
  const { messages: m } = useLocale();
  const music = useBackgroundMusic();
  const title = pieceTitle(m, music.piece);
  if (!title) return null;
  return (
    <div className="music-now-block" aria-live="polite">
      <p className="music-now-title">{title}</p>
      <p className="music-now-artist">{pieceArtist(m, music.piece)}</p>
      <p className="hint">{statusText(m, music.status, music.holdReason, music.ducked)}</p>
    </div>
  );
}

/** Progress bar with playback time. Dragging it moves within the piece. */
export function MusicProgress() {
  const { messages: m } = useLocale();
  const music = useBackgroundMusic();
  const { position, duration } = useMusicProgress();
  const id = useId();
  const time = duration ? fmt(m.music.time, { position: clock(position), length: clock(duration) }) : fmt(m.music.timeUnknown, { position: clock(position) });
  return (
    <div className="music-progress" {...controlProps}>
      <input
        id={id}
        type="range"
        min={0}
        max={duration ?? Math.max(1, position)}
        step={1}
        value={Math.min(position, duration ?? position)}
        disabled={!duration}
        aria-label={m.music.progress}
        aria-valuetext={time}
        onChange={(event) => music.seek(Number(event.target.value))}
      />
      <span className="music-time">{time}</span>
    </div>
  );
}

/** The music volume. With `session`, the separate level used under videos and voices. */
export function MusicVolume({ session = false }: { session?: boolean }) {
  const { messages: m } = useLocale();
  const music = useBackgroundMusic();
  const id = useId();
  const raw = session ? music.prefs.sessionVolume : music.prefs.volume;
  const value = music.prefs.muted ? 0 : raw;
  const percent = Math.round(value * 100);
  return (
    <label className="field music-volume" htmlFor={id} {...controlProps}>
      <span>
        {session ? m.music.session.volume : m.music.volume} <span className="hint">{percent}%</span>
      </span>
      <input
        id={id}
        type="range"
        min={0}
        max={session ? 0.6 : 1}
        step={0.02}
        value={value}
        aria-valuetext={`${percent}%`}
        onChange={(event) => (session ? music.setSessionVolume(Number(event.target.value)) : music.setVolume(Number(event.target.value)))}
      />
    </label>
  );
}

/** A compact category choice for small panels. */
export function CategorySelect() {
  const { messages: m } = useLocale();
  const music = useBackgroundMusic();
  const id = useId();
  return (
    <label className="field music-category" htmlFor={id} {...controlProps}>
      <span>{m.music.category}</span>
      <select id={id} value={music.prefs.category} onChange={(event) => music.selectCategory(event.target.value as LibraryCategory)}>
        {LIBRARY_CATEGORIES.map((category) => (
          <option key={category} value={category}>
            {CATEGORY_ICON[category]} {m.music.categories[category].name}
          </option>
        ))}
      </select>
    </label>
  );
}

/**
 * Background music controls shown beside an exercise video, guided breathing,
 * or a meditation. Changing anything here never touches the video itself.
 */
export function SessionMusicControls() {
  const { messages: m } = useLocale();
  const music = useBackgroundMusic();
  const underId = useId();
  if (!music.ready) return null;
  const on = isSounding(music.status) || music.status === "held";
  return (
    <section className="music-session" aria-label={m.music.session.title} {...controlProps}>
      <div className="music-session-head">
        <h3>
          <span aria-hidden="true">♪</span> {m.music.session.title}
        </h3>
        <MusicOnOffSwitch />
      </div>
      <p className="hint">{m.music.session.intro}</p>
      {on ? (
        <>
          <NowPlaying />
          <div className="music-session-row">
            <CategorySelect />
            <TransportControls />
          </div>
          <MusicVolume session={music.ducked} />
        </>
      ) : (
        <p className="hint">{m.music.session.nothingPlaying}</p>
      )}
      <label className="music-check" htmlFor={underId}>
        <input id={underId} type="checkbox" checked={music.prefs.underSessions} onChange={(event) => music.setUnderSessions(event.target.checked)} />
        <span>
          {m.music.session.under}
          <span className="hint"> {m.music.session.underHint}</span>
        </span>
      </label>
      <p className="hint">
        <Link href="/library/music">{m.music.openLibrary}</Link>
      </p>
    </section>
  );
}
