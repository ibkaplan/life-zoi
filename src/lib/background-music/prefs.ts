import { DEFAULT_CATEGORY, isLibraryCategory, type LibraryCategory } from "@/lib/music-library/catalog";

/**
 * The background music preference. It is saved in this browser only and holds
 * nothing about health: whether music is wanted, the volume, mute, the music
 * category, which piece was last playing, and how music behaves during sessions.
 */
export const MUSIC_STORAGE_KEY = "lifezoi.music.v1";

/**
 * - `unset`: never chosen. Music stays silent and is only offered.
 * - `playing`: the person started music and did not pause it. LifeZoi tries to
 *   continue on the next visit if the browser allows sound.
 * - `paused`: the person paused. Nothing starts until they press play.
 * - `off`: the person turned music off permanently. It is not offered again
 *   until they turn it back on.
 */
export type MusicChoice = "unset" | "playing" | "paused" | "off";

export type MusicPrefs = {
  choice: MusicChoice;
  /** 0 to 1. Starts soft. */
  volume: number;
  muted: boolean;
  /** Id of the last piece, so a return visit continues the same playlist. */
  trackId: string | null;
  category: LibraryCategory;
  /**
   * During an exercise video, guided breathing, or spoken instructions:
   * `true` keeps music playing quietly underneath at `sessionVolume`,
   * `false` pauses music until the session sound ends.
   */
  underSessions: boolean;
  /** 0 to 1. The music level while a session is on screen, set separately from the video's own volume. */
  sessionVolume: number;
};

export const DEFAULT_VOLUME = 0.3;
/** Quiet enough that an instructor's voice stays clear over it. */
export const DEFAULT_SESSION_VOLUME = 0.12;

export const DEFAULT_PREFS: MusicPrefs = {
  choice: "unset",
  volume: DEFAULT_VOLUME,
  muted: false,
  trackId: null,
  category: DEFAULT_CATEGORY,
  underSessions: true,
  sessionVolume: DEFAULT_SESSION_VOLUME,
};

const CHOICES: readonly MusicChoice[] = ["unset", "playing", "paused", "off"];

export function clampVolume(value: unknown, fallback = DEFAULT_VOLUME): number {
  const number = typeof value === "number" ? value : Number.NaN;
  if (!Number.isFinite(number)) return fallback;
  return Math.min(1, Math.max(0, Math.round(number * 100) / 100));
}

/** Reads a saved value defensively. Anything unexpected falls back to the default. */
export function parsePrefs(raw: string | null | undefined): MusicPrefs {
  if (!raw) return { ...DEFAULT_PREFS };
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return { ...DEFAULT_PREFS };
  }
  if (!data || typeof data !== "object") return { ...DEFAULT_PREFS };
  const value = data as Record<string, unknown>;
  const choice = CHOICES.includes(value.choice as MusicChoice) ? (value.choice as MusicChoice) : "unset";
  const trackId = typeof value.trackId === "string" && /^[a-z0-9-]{1,64}$/.test(value.trackId) ? value.trackId : null;
  return {
    choice,
    volume: "volume" in value ? clampVolume(value.volume) : DEFAULT_VOLUME,
    muted: value.muted === true,
    trackId,
    category: isLibraryCategory(value.category) ? value.category : DEFAULT_CATEGORY,
    underSessions: value.underSessions !== false,
    sessionVolume: "sessionVolume" in value ? clampVolume(value.sessionVolume, DEFAULT_SESSION_VOLUME) : DEFAULT_SESSION_VOLUME,
  };
}

export function serializePrefs(prefs: MusicPrefs): string {
  return JSON.stringify({
    choice: prefs.choice,
    volume: clampVolume(prefs.volume),
    muted: prefs.muted,
    trackId: prefs.trackId,
    category: prefs.category,
    underSessions: prefs.underSessions,
    sessionVolume: clampVolume(prefs.sessionVolume, DEFAULT_SESSION_VOLUME),
  });
}

/** Whether a page load should try to continue music. The browser may still refuse. */
export function shouldTryResume(prefs: MusicPrefs): boolean {
  return prefs.choice === "playing";
}

/**
 * The volume actually sent to the speakers. While a session is on screen
 * (`ducked`), music plays at the separate session level.
 */
export function effectiveVolume(prefs: Pick<MusicPrefs, "volume" | "muted"> & Partial<Pick<MusicPrefs, "sessionVolume">>, ducked = false): number {
  if (prefs.muted) return 0;
  if (!ducked) return clampVolume(prefs.volume);
  return clampVolume(prefs.sessionVolume, DEFAULT_SESSION_VOLUME);
}

export type SessionKind = "sound" | "video" | "voice";

/**
 * What music does while other LifeZoi sound is on.
 * - Another music player (`sound`) always pauses it, so two tunes never clash.
 * - A video or a speaking voice lowers it when the person chose music under
 *   sessions, and pauses it otherwise.
 */
export function sessionEffect(kinds: readonly SessionKind[], underSessions: boolean): "none" | "duck" | "pause" {
  if (kinds.length === 0) return "none";
  if (kinds.includes("sound")) return "pause";
  return underSessions ? "duck" : "pause";
}

export type DayPart = "morning" | "afternoon" | "evening";

/** Morning is 05:00 to 11:59, afternoon 12:00 to 17:59, and everything else evening. */
export function dayPartFor(hour: number): DayPart {
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 18) return "afternoon";
  return "evening";
}
