/**
 * The voice companion's choices, saved in this browser only. They hold switches and
 * the microphone choice, never anything the person said.
 */

export const COMPANION_STORAGE_KEY = "lifezoi.voice-companion.v1";

/** "none": not asked yet or turned off. "local": on-device recognition only. "browser": the browser decides. */
export type MicChoice = "none" | "local" | "browser";

export type CompanionPrefs = {
  /** "new" shows the one-time welcome panel. "done" or "later" never show it again. */
  setup: "new" | "done" | "later";
  autoWelcome: boolean;
  handsFree: boolean;
  navigation: boolean;
  voiceOutput: boolean;
  mic: MicChoice;
  /** The last welcome line, so the next one is different. */
  lastVariant: number | null;
};

export const DEFAULT_COMPANION_PREFS: CompanionPrefs = {
  setup: "new",
  autoWelcome: true,
  handsFree: false,
  navigation: true,
  voiceOutput: true,
  mic: "none",
  lastVariant: null,
};

const bool = (value: unknown, fallback: boolean) => (typeof value === "boolean" ? value : fallback);

export function parseCompanionPrefs(raw: string | null | undefined): CompanionPrefs {
  if (!raw) return { ...DEFAULT_COMPANION_PREFS };
  try {
    const value = JSON.parse(raw) as Partial<CompanionPrefs> | null;
    if (!value || typeof value !== "object") return { ...DEFAULT_COMPANION_PREFS };
    const mic: MicChoice = value.mic === "local" || value.mic === "browser" ? value.mic : "none";
    return {
      setup: value.setup === "done" || value.setup === "later" ? value.setup : "new",
      autoWelcome: bool(value.autoWelcome, true),
      // Hands-free needs a microphone choice; without one it is off.
      handsFree: mic !== "none" && bool(value.handsFree, false),
      navigation: bool(value.navigation, true),
      voiceOutput: bool(value.voiceOutput, true),
      mic,
      lastVariant: typeof value.lastVariant === "number" && Number.isInteger(value.lastVariant) ? value.lastVariant : null,
    };
  } catch {
    return { ...DEFAULT_COMPANION_PREFS };
  }
}

export function serializeCompanionPrefs(prefs: CompanionPrefs): string {
  return JSON.stringify(prefs);
}
