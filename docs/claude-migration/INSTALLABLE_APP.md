# Installable app (PWA)

lifeZoi can be added to a phone's or computer's home screen and opens in its own window.

- Manifest: `src/app/manifest.ts` → `/manifest.webmanifest` (name, theme `#6A3DA8`, background `#F9F7F2`, standalone, start at `/`).
- Icons: `public/icons/` (192, 512, maskable 512, Apple touch 180), drawn from the tab icon by `node scripts/make-app-icons.mjs`.
- Service worker: `public/sw.js`, registered in production only by `ServiceWorkerRegister` in the root layout.
  - Keeps only the offline page, manifest and icons (`PRECACHE_FILES` in `src/lib/pwa/config.ts`).
  - Never stores a page, an API answer, audio, or anything a member typed. Page loads go to the network first; the offline page is shown only when the network fails.
  - API calls, audio, voice, images and Next files are not intercepted, so sign-in, the voice companion and Listen work as before.
- Offline page: `public/offline.html`, static, in English, Ukrainian, Russian and Greek (from the saved language).
- Install hint: `src/components/pwa/install-hint.tsx`, on the members' home and members' pages. Uses the browser's install prompt where offered (Android, desktop Chrome/Edge), explains Share → Add to Home Screen on iPhone/iPad Safari, hides inside the installed app, and stays hidden 30 days after "Not now".
- The proxy lets visitors fetch `/manifest.webmanifest`, `/sw.js`, `/offline.html` and `/icons/` (`PUBLIC_APP_FILES`, `PUBLIC_ASSET_PREFIXES`); none holds personal data.
- On iPhone, the home-screen app keeps its own sign-in, so a member may need to log in once inside it.
