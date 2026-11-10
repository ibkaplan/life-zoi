"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useLocale } from "@/components/locale-provider";
import { isSounding, useBackgroundMusic } from "@/components/background-music/provider";
import Link from "next/link";
import { CategorySelect, MusicProgress, MusicVolume, NowPlaying, TransportControls } from "@/components/background-music/controls";
import { controlProps, MusicNoteIcon } from "@/components/background-music/shared";
import { fmt } from "@/lib/i18n/config";

/** The small ♪ button in the header. It opens the controls for the one background player. */
export function HeaderMusicButton() {
  const { messages: m } = useLocale();
  const music = useBackgroundMusic();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();
  
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
              <NowPlaying />
              <TransportControls />
              <MusicProgress />
              <div className="music-row">
                <button type="button" className="btn btn-secondary" aria-pressed={music.prefs.muted} onClick={() => music.toggleMute()}>
                  <span aria-hidden="true">{music.prefs.muted ? "🔇" : "🔊"}</span> {music.prefs.muted ? m.music.unmute : m.music.mute}
                </button>
              </div>
              <MusicVolume session={music.ducked} />
              <CategorySelect />
              <p>
                <Link className="btn btn-ghost" href="/library/music" onClick={() => setOpen(false)}>
                  {m.music.openLibrary}
                </Link>
              </p>
              <details className="music-credits">
                <summary>{m.music.credits}</summary>
                {music.piece?.kind === "file" ? (
                  <p className="hint">
                    {m.music.creditsFiles} {fmt(m.music.licence, { licence: music.piece.license })}.{" "}
                    <a href={music.piece.sourceUrl} target="_blank" rel="noopener noreferrer">
                      {m.music.source}
                    </a>
                  </p>
                ) : (
                  <p className="hint">{m.music.library.aboutBuiltIn}</p>
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
