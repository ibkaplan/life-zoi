/**
 * The background music preference. It is saved in this browser only and holds
 * nothing about health: whether music is wanted, the volume, mute, and which
 * piece was last playing.
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
};

export const DEFAULT_VOLUME = 0.3;

export const DEFAULT_PREFS: MusicPrefs = { choice: "unset", volume: DEFAULT_VOLUME, muted: false, trackId: null };

const CHOICES: readonly MusicChoice[] = ["unset", "playing", "paused", "off"];

export function clampVolume(value: unknown): number {
  const number = typeof value === "number" ? value : Number.NaN;
  if (!Number.isFinite(number)) return DEFAULT_VOLUME;
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
  };
}

export function serializePrefs(prefs: MusicPrefs): string {
  return JSON.stringify({ choice: prefs.choice, volume: clampVolume(prefs.volume), muted: prefs.muted, trackId: prefs.trackId });
}

/** Whether a page load should try to continue music. The browser may still refuse. */
export function shouldTryResume(prefs: MusicPrefs): boolean {
  return prefs.choice === "playing";
}

/** The volume actually sent to the speakers. */
export function effectiveVolume(prefs: Pick<MusicPrefs, "volume" | "muted">): number {
  return prefs.muted ? 0 : clampVolume(prefs.volume);
}

export type DayPart = "morning" | "afternoon" | "evening";

/** Morning is 05:00 to 11:59, afternoon 12:00 to 17:59, and everything else evening. */
export function dayPartFor(hour: number): DayPart {
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 18) return "afternoon";
  return "evening";
}
