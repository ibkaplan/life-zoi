import { INSTALL_HINT_QUIET_DAYS } from "./config";

export type InstallHint =
  /** The browser offered its own install prompt; show an Install button. */
  | "prompt"
  /** iPhone or iPad Safari: no prompt exists, so explain Share, then Add to Home Screen. */
  | "ios"
  | "none";

export type InstallHintInput = {
  /** Already opened from the home screen (display-mode standalone, or iOS `navigator.standalone`). */
  standalone: boolean;
  /** The browser fired `beforeinstallprompt` and we kept the event. */
  canPrompt: boolean;
  userAgent: string;
  /** Touch points, to tell an iPad that reports itself as a Mac. */
  maxTouchPoints: number;
  /** When the person last closed the hint, in milliseconds, or null. */
  closedAt: number | null;
  now: number;
};

/** True on iPhone, iPad, or iPod, including iPadOS that reports "Macintosh". */
export function isAppleMobile(userAgent: string, maxTouchPoints: number): boolean {
  if (/iPhone|iPad|iPod/i.test(userAgent)) return true;
  return /Macintosh/i.test(userAgent) && maxTouchPoints > 1;
}

/** Safari itself, not Chrome, Firefox, or Edge on iOS, which cannot add to the home screen the same way. */
export function isAppleSafari(userAgent: string): boolean {
  return /Safari/i.test(userAgent) && !/CriOS|FxiOS|EdgiOS|OPiOS|GSA\//i.test(userAgent);
}

/** Which install hint to show, if any. Pure, so every case is unit tested. */
export function installHintFor(input: InstallHintInput): InstallHint {
  if (input.standalone) return "none";
  if (input.closedAt !== null) {
    const quietMs = INSTALL_HINT_QUIET_DAYS * 24 * 60 * 60 * 1000;
    if (input.now - input.closedAt < quietMs && input.now >= input.closedAt) return "none";
  }
  if (input.canPrompt) return "prompt";
  if (isAppleMobile(input.userAgent, input.maxTouchPoints) && isAppleSafari(input.userAgent)) return "ios";
  return "none";
}

/** Reads the saved "closed at" time; anything unreadable counts as never closed. */
export function parseClosedAt(raw: string | null): number | null {
  if (!raw) return null;
  const value = Number(raw);
  return Number.isFinite(value) && value > 0 ? value : null;
}
