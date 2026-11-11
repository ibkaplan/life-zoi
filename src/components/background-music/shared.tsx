"use client";

import { useLocale } from "@/components/locale-provider";
import { isSounding, MUSIC_CONTROL_ATTR, useBackgroundMusic, type MusicStatus } from "@/components/background-music/provider";
import type { Messages } from "@/lib/i18n/messages";
import type { LibraryPiece } from "@/lib/music-library/catalog";

export const controlProps = { [MUSIC_CONTROL_ATTR]: "" };

export function pieceTitle(m: Messages, piece: LibraryPiece | null): string {
  if (!piece) return "";
  if (piece.kind === "file") return piece.title;
  const titles = m.music.tracks as Record<string, string>;
  return titles[piece.id] ?? piece.track.title;
}

/** Who made it: the Pixabay uploader, or LifeZoi for its own in-browser pieces. */
export function pieceArtist(m: Messages, piece: LibraryPiece | null): string {
  if (!piece) return "";
  return piece.kind === "file" ? piece.artist : m.music.library.builtIn;
}

export function pieceNote(m: Messages, piece: LibraryPiece | null): string {
  if (!piece || piece.kind === "file") return "";
  const notes = m.music.trackNotes as Record<string, string>;
  return notes[piece.id] ?? piece.track.description;
}

/** Minutes and seconds, for example 3:07. Unknown lengths show as --:--. */
export function clock(seconds: number | null): string {
  if (seconds === null || !Number.isFinite(seconds)) return "--:--";
  const safe = Math.max(0, Math.floor(seconds));
  return `${Math.floor(safe / 60)}:${String(safe % 60).padStart(2, "0")}`;
}

export function statusText(m: Messages, status: MusicStatus, holdReason: "sound" | "video" | null, ducked = false): string {
  switch (status) {
    case "playing":
      return ducked ? m.music.statusDucked : m.music.statusPlaying;
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
