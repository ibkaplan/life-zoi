import { estimatedSeconds } from "@/lib/voice/voices";
import type { Beat, GuidedSession } from "@/lib/guided/types";

/** The session as a flat list of cues, in the order they are spoken. */
export function beatsOf(session: Pick<GuidedSession, "steps">): Beat[] {
  const beats: Beat[] = [];
  session.steps.forEach((step, stepIndex) => {
    step.cues.forEach((cue, cueIndex) => beats.push({ step: stepIndex, cue: cueIndex, say: cue.say, hold: Math.max(0, cue.hold) }));
  });
  return beats;
}

/**
 * Rough speaking time of one cue. The voice adds a short pause after each
 * sentence, so that is counted too. Only used for the progress bar and time
 * left: the session itself always waits for the voice to finish.
 */
export function speechSeconds(text: string, rate = 1): number {
  const sentences = Math.max(1, (text.match(/[.!?…]+/g) ?? []).length);
  return estimatedSeconds(text, rate) + sentences * 0.4;
}

export function beatSeconds(beat: Pick<Beat, "say" | "hold">, rate = 1): number {
  return speechSeconds(beat.say, rate) + beat.hold;
}

/** Planned length of the whole session in seconds, at this speaking speed. */
export function plannedSeconds(beats: readonly Beat[], rate = 1): number {
  return beats.reduce((sum, beat) => sum + beatSeconds(beat, rate), 0);
}

/** Planned seconds before beat `index` starts. */
export function secondsBefore(beats: readonly Beat[], index: number, rate = 1): number {
  let sum = 0;
  for (let at = 0; at < Math.min(index, beats.length); at += 1) sum += beatSeconds(beats[at] as Beat, rate);
  return sum;
}

/** First beat of the step after (or before) the one beat `index` is in. -1 past the end. */
export function stepStart(beats: readonly Beat[], index: number, direction: 1 | -1): number {
  const step = beats[index]?.step ?? 0;
  if (direction === 1) return beats.findIndex((beat) => beat.step > step);
  // Back: to the start of this step if part of it was heard, otherwise to the step before.
  const thisStart = beats.findIndex((beat) => beat.step === step);
  const target = index > thisStart ? step : Math.max(0, step - 1);
  return beats.findIndex((beat) => beat.step === target);
}

/**
 * Whether music stays quieter through a quiet hold. A short gap between two
 * sentences keeps it low, so the music does not swell and drop every few
 * seconds. A longer hold, while the person moves or rests, lets it come back up.
 */
export const DUCK_THROUGH_SECONDS = 6;

export function duckThrough(hold: number): boolean {
  return hold < DUCK_THROUGH_SECONDS;
}

/** "4:05" style clock. */
export function clockText(seconds: number): string {
  const safe = Math.max(0, Math.round(seconds));
  const minutes = Math.floor(safe / 60);
  return `${minutes}:${String(safe % 60).padStart(2, "0")}`;
}
