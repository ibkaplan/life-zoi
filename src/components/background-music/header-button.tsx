"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useLocale } from "@/components/locale-provider";
import { isSounding, useBackgroundMusic } from "@/components/background-music/provider";
import { controlProps, MusicNoteIcon, pieceTitle, PlayPauseButton, statusText } from "@/components/background-music/shared";
import { fmt } from "@/lib/i18n/config";
import { RECORDINGS } from "@/lib/background-music/tracks";

/** The small ♪ button in the header. It opens the controls for the one background player. */
export function HeaderMusicButton() {
  const { messages: m } = useLocale();
  const music = useBackgroundMusic();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();
  const volumeId = useId();

  useEffect(() => {
    if (!open) return;
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
  }, [open]);

  if (!music.ready) return null;

  const on = isSounding(music.status);
  const off = music.prefs.choice === "off";
  const label = off ? m.music.headerOff : on ? m.music.headerPlaying : m.music.headerPaused;
  const title = pieceTitle(m, music.piece);
  const percent = Math.round((music.prefs.muted ? 0 : music.prefs.volume) * 100);

  return (
    <div className="music-switch" ref={rootRef} {...controlProps}>
      {music.status === "blocked" && !off ? (
        <button type="button" className="music-blocked-play" onClick={() => music.play()}>
          <span aria-hidden="true">▶</span> {m.music.playMusic}
        </button>
      ) : null}
      <button
        ref={buttonRef}
        type="button"
        className="music-button"
        data-state={off ? "off" : on ? "on" : "idle"}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        aria-label={label}
        title={m.music.headerLabel}
        onClick={() => setOpen((value) => !value)}
      >
        <MusicNoteIcon />
        {on ? <span className="music-bars" aria-hidden="true"><i /><i /><i /></span> : null}
      </button>
      {open ? (
        <div className="music-panel stack" id={panelId} role="dialog" aria-label={m.music.headerLabel}>
          <div className="music-panel-head">
            <h2>{m.music.headerLabel}</h2>
            <button type="button" className="music-close" aria-label={m.music.close} onClick={() => { setOpen(false); buttonRef.current?.focus(); }}>
              ×
            </button>
          </div>
          {off ? (
            <>
              <p>{m.music.offNote}</p>
              <button type="button" className="btn btn-primary" onClick={() => music.turnOn()}>
                {m.music.turnOn}
              </button>
            </>
          ) : (
            <>
              <p className="hint">{m.music.panelIntro}</p>
              <p className="music-now" aria-live="polite">
                {title ? fmt(on ? m.music.nowPlaying : m.music.upNext, { title }) : null}
                <br />
                <span className="hint">{statusText(m, music.status, music.holdReason)}</span>
              </p>
              <div className="music-row">
                <PlayPauseButton label={m.music.play} />
                <button type="button" className="btn btn-secondary" aria-pressed={music.prefs.muted} onClick={() => music.toggleMute()}>
                  <span aria-hidden="true">{music.prefs.muted ? "🔇" : "🔊"}</span> {music.prefs.muted ? m.music.unmute : m.music.mute}
                </button>
                <button type="button" className="btn btn-ghost" onClick={() => music.next()}>
                  {m.music.next} <span aria-hidden="true">⏭</span>
                </button>
              </div>
              <label className="field music-volume" htmlFor={volumeId}>
                <span>
                  {m.music.volume} <span className="hint">{percent}%</span>
                </span>
                <input
                  id={volumeId}
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={music.prefs.muted ? 0 : music.prefs.volume}
                  aria-valuetext={`${percent}%`}
                  onChange={(event) => music.setVolume(Number(event.target.value))}
                />
              </label>
              <details className="music-credits">
                <summary>{m.music.credits}</summary>
                {music.usesRecordings ? (
                  <>
                    <p className="hint">{m.music.creditsFiles}</p>
                    <ul>
                      {RECORDINGS.map((recording) => (
                        <li key={recording.id}>
                          {recording.title}. {recording.attribution}. {fmt(m.music.licence, { licence: recording.license })}.{" "}
                          <a href={recording.sourceUrl} target="_blank" rel="noopener noreferrer">
                            {m.music.source}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </>
                ) : (
                  <p className="hint">{m.music.creditsSynth}</p>
                )}
              </details>
              <div className="music-off stack-sm">
                <button type="button" className="btn btn-ghost" onClick={() => music.turnOff()}>
                  {m.music.turnOff}
                </button>
                <p className="hint">{m.music.turnOffHint}</p>
              </div>
              <p className="hint">{m.music.saveNote}</p>
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}
