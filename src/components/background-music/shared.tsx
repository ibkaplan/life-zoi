"use client";

import { useLocale } from "@/components/locale-provider";
import { isSounding, MUSIC_CONTROL_ATTR, useBackgroundMusic, type MusicStatus } from "@/components/background-music/provider";
import type { Messages } from "@/lib/i18n/messages";
import type { BackgroundPiece } from "@/lib/background-music/tracks";

export const controlProps = { [MUSIC_CONTROL_ATTR]: "" };

export function pieceTitle(m: Messages, piece: BackgroundPiece | null): string {
  if (!piece) return "";
  if (piece.kind === "file") return piece.recording.title;
  const titles = m.music.tracks as Record<string, string>;
  return titles[piece.id] ?? piece.track.title;
}

export function statusText(m: Messages, status: MusicStatus, holdReason: "sound" | "video" | null): string {
  switch (status) {
    case "playing":
      return m.music.statusPlaying;
    case "starting":
      return m.music.statusStarting;
    case "paused":
      return m.music.statusPaused;
    case "blocked":
      return m.music.statusBlocked;
    case "held":
      return holdReason === "video" ? m.music.statusHeldVideo : m.music.statusHeldSound;
    case "unsupported":
      return m.music.statusUnsupported;
    default:
      return m.music.statusIdle;
  }
}

export function MusicNoteIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        fill="currentColor"
        d="M19 3.2v11.3a3.2 3.2 0 1 1-1.8-2.9V7.1l-8 1.8v7.7a3.2 3.2 0 1 1-1.8-2.9V6.4c0-.5.3-.9.8-1l9.6-2.2c.6-.1 1.2.3 1.2 1z"
      />
    </svg>
  );
}

/** The big play / pause button used on the dashboard and in the panel. */
export function PlayPauseButton({ label, className = "btn btn-primary music-play" }: { label?: string; className?: string }) {
  const { messages: m } = useLocale();
  const music = useBackgroundMusic();
  const on = isSounding(music.status);
  return (
    <button
      {...controlProps}
      type="button"
      className={className}
      aria-pressed={on}
      onClick={() => (on ? music.pause() : music.play())}
    >
      <span aria-hidden="true">{on ? "❚❚" : "▶"}</span>{" "}
      {on ? m.music.pause : music.status === "held" ? m.music.resume : (label ?? m.music.playMusic)}
    </button>
  );
}
