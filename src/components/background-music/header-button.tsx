"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useLocale } from "@/components/locale-provider";
import { isSounding, useBackgroundMusic } from "@/components/background-music/provider";
import Link from "next/link";
import { CategorySelect, MusicProgress, MusicVolume, NowPlaying, TransportControls } from "@/components/background-music/controls";
import { controlProps, MusicNoteIcon } from "@/components/background-music/shared";
import { fmt } from "@/lib/i18n/config";

/** The ♪ button in the header opens My Music. The small arrow beside it opens quick controls for the one background player. */
export function HeaderMusicButton() {
  const { messages: m, t } = useLocale();
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
      <Link
        href="/library/music"
        className="music-button"
        data-state={off ? "off" : on ? "on" : "idle"}
        aria-label={`${m.music.openLibrary}. ${label}`}
        title={m.music.openLibrary}
        onClick={() => setOpen(false)}
      >
        <MusicNoteIcon />
        {on ? <span className="music-bars" aria-hidden="true"><i /><i /><i /></span> : null}
      </Link>
      <button
        ref={buttonRef}
        type="button"
        className="music-quick"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        aria-label={t("Quick music controls")}
        title={t("Quick music controls")}
        onClick={() => setOpen((value) => !value)}
      >
        <span aria-hidden="true">▾</span>
      </button>
      {open ? (
        <div className="music-panel stack" id={panelId} role="dialog" aria-label={m.music.headerLabel}>
          <div className="music-panel-head">
            <h2>{m.music.headerLabel}</h2>
            <button type="button" className="music-close" aria-label={m.music.close} onClick={() => { setOpen(false); buttonRef.current?.focus(); }}>
              ×
            </button>
          </div>
          <p>
            <Link className="btn btn-secondary music-open-library" href="/library/music" onClick={() => setOpen(false)}>
              <span aria-hidden="true">♪</span> {m.music.openLibrary}
            </Link>
          </p>
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
              <details className="music-credits">
                <summary>{m.music.credits}</summary>
                {music.piece?.kind === "file" ? (
                  <p className="hint">
                    {music.piece.streamed ? m.music.creditsStreamed : m.music.creditsFiles}{" "}
                    {fmt(m.music.licence, { licence: music.piece.license })}.{" "}
                    {music.piece.attribution ? `${music.piece.attribution}. ` : ""}
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
