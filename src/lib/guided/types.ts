/**
 * Voice-guided sessions: Pilates, yoga, stretching, mobility, breathing,
 * relaxation, and meditation, spoken by the LifeZoi voice (the shared
 * read-aloud player in `src/lib/voice/engine.ts`).
 *
 * A session is a timed script: short spoken cues, each followed by a quiet
 * hold while the person moves or rests. Pause stops the voice and remembers the
 * cue; Resume says that cue again, or finishes the quiet hold that was left.
 * All text is English marked with `msg`, translated through the catalogs.
 */

export const GUIDED_KINDS = ["pilates", "yoga", "stretching", "mobility", "breathing", "relaxation", "meditation"] as const;
export type GuidedKind = (typeof GUIDED_KINDS)[number];

export type DayPart = "morning" | "afternoon" | "evening";

/** One thing the instructor says, then `hold` seconds of quiet. */
export type Cue = { say: string; hold: number };

export type GuidedStep = {
  title: string;
  /** A rest between exercises. Shown differently, and the voice keeps it short. */
  rest?: boolean;
  cues: Cue[];
};

export type GuidedSession = {
  id: string;
  kind: GuidedKind;
  title: string;
  summary: string;
  /** The length shown on the card. The tests check the script really lasts about this long. */
  minutes: number;
  /** Where the person is: on a mat, in a chair, standing, or lying down. */
  position: string;
  /** A short safety line for this session, shown before Play and kept on screen. */
  care: string;
  /** Shown and spoken at the end. */
  complete: string;
  /** Multiplies the person's saved speaking speed. Meditation is read a little slower. */
  rateFactor: number;
  /** Times of day where My Day suggests it. */
  parts: DayPart[];
  steps: GuidedStep[];
  /** For meditation: the theme, so the library can group lengths together. */
  theme?: string;
};

/** One cue placed in the session: which step it belongs to, and its quiet hold. */
export type Beat = {
  step: number;
  /** Position of this cue inside its step, from 0. */
  cue: number;
  say: string;
  hold: number;
};
