/**
 * Installable-app settings (PWA). lifeZoi can be added to a phone's home screen,
 * but nothing personal is kept for offline use: the service worker stores only the
 * offline page, the app icons and the manifest, never a member's page or an API answer.
 */

export const APP_NAME = "lifeZoi";
export const APP_SHORT_NAME = "lifeZoi";

/** Matches `--primary` in globals.css, used for the phone's status bar. */
export const THEME_COLOR = "#6A3DA8";
/** Matches `--bg` in globals.css, shown on the splash screen while the app opens. */
export const BACKGROUND_COLOR = "#F9F7F2";

export const SERVICE_WORKER_PATH = "/sw.js";
export const MANIFEST_PATH = "/manifest.webmanifest";
export const OFFLINE_PATH = "/offline.html";
export const ICONS_PREFIX = "/icons/";

/**
 * The only files the service worker keeps on the phone. Every one is public and
 * identical for every visitor. `service-worker.test.ts` checks that `public/sw.js`
 * uses exactly this list.
 */
export const PRECACHE_FILES = [
  OFFLINE_PATH,
  MANIFEST_PATH,
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/maskable-512.png",
  "/icons/apple-touch-icon.png",
] as const;

/** Saved in this browser only: when the person closed the install hint. Never health information. */
export const INSTALL_HINT_KEY = "lifezoi.install-hint.closed.v1";

/** After closing the hint, it stays away this long. */
export const INSTALL_HINT_QUIET_DAYS = 30;
