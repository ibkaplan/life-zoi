"use client";

import { audioFocus } from "@/lib/background-music/audio-focus";
import type { Narrator } from "@/lib/guided/controller";
import { speechSeconds } from "@/lib/guided/timeline";
import type { Locale } from "@/lib/i18n/config";
import { player, readVoicePrefs, speechSupported } from "@/lib/voice/engine";
import { segmentsFromText } from "@/lib/voice/voices";

/** The read-aloud owner for guided sessions. Starting any other Listen button stops it. */
export const GUIDED_OWNER = "guided-session";
const FOCUS_ID = "guided-session";

export type NarratorSettings = {
  /** Text for the voice, already translated. */
  translate: (english: string) => string;
  locale: () => Locale;
  rateFactor: number;
  /** Called when the device cannot speak this language (or at all): cues are then shown and timed without a voice. */
  onSilent: (reason: "unsupported" | "no-voice") => void;
};

/**
 * The guided-session voice is the LifeZoi voice: the shared read-aloud player
 * with the person's saved voice, speed, and the optional LifeZoi natural voice.
 * No other voice or service is used.
 *
 * When the device has no voice, the session keeps going silently, with each cue
 * on screen for about as long as it would take to say.
 */
export function createEngineNarrator(settings: NarratorSettings): Narrator {
  let generation = 0;
  let unsubscribe: (() => void) | null = null;
  let silentTimer: ReturnType<typeof setTimeout> | null = null;
  let silent = false;

  function cleanUp() {
    unsubscribe?.();
    unsubscribe = null;
    if (silentTimer) clearTimeout(silentTimer);
    silentTimer = null;
  }

  function speakSilently(text: string, done: () => void, mine: number) {
    const rate = readVoicePrefs().rate * settings.rateFactor;
    silentTimer = setTimeout(() => {
      if (mine === generation) done();
    }, speechSeconds(text, rate) * 1000);
  }

  return {
    speak(text, done, interrupted) {
      cleanUp();
      generation += 1;
      const mine = generation;
      const words = settings.translate(text);
      if (silent || !speechSupported()) {
        if (!silent) {
          silent = true;
          settings.onSilent("unsupported");
        }
        speakSilently(words, done, mine);
        return;
      }
      let settled = false;
      const settle = (then: () => void) => {
        if (settled || mine !== generation) return;
        settled = true;
        cleanUp();
        then();
      };
      unsubscribe = player.subscribe(() => {
        const state = player.state();
        if (state.owner !== GUIDED_OWNER) return;
        if (state.problem === "no-voice" || state.problem === "unsupported") {
          // Never read with a voice for another language: carry on without a voice.
          settle(() => {
            silent = true;
            settings.onSilent(state.problem === "no-voice" ? "no-voice" : "unsupported");
            speakSilently(words, done, mine);
          });
        } else if (state.problem === "failed") {
          settle(() => interrupted("blocked"));
        } else if (state.status === "paused") {
          // Guided sessions never pause the shared player themselves, so this is the browser asking for a tap.
          settle(() => interrupted("blocked"));
        }
      });
      player.play(GUIDED_OWNER, segmentsFromText(words, settings.locale()), {
        stepWait: 0,
        rateFactor: settings.rateFactor,
        onEnd: (reason) => settle(() => (reason === "done" ? done() : interrupted(reason))),
      });
    },
    stop() {
      generation += 1;
      cleanUp();
      player.stop(GUIDED_OWNER);
    },
  };
}

/** Lowers background music through LifeZoi's audio focus, the same signal every voice uses. */
export function duckMusic(on: boolean) {
  if (on) audioFocus.claim(FOCUS_ID, "voice");
  else audioFocus.release(FOCUS_ID);
}

export const browserTimers = {
  now: () => Date.now(),
  set: (callback: () => void, ms: number) => setTimeout(callback, ms),
  clear: (handle: unknown) => clearTimeout(handle as ReturnType<typeof setTimeout>),
};
