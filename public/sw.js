/*
 * lifeZoi service worker. It makes the site installable and shows a friendly page
 * when the phone is offline. It is deliberately small:
 *
 * - It keeps only PRECACHE_FILES: the offline page, the manifest and the app icons.
 *   They are public and the same for everyone (see src/lib/pwa/config.ts).
 * - It never stores a page, an API answer, audio, or anything a member typed. Members'
 *   pages and answers are personal and are sent with "Cache-Control: private, no-store".
 * - Page loads always go to the network first. Only when the network fails does it
 *   answer with the offline page.
 * - Every other request (API calls, audio, voice, images, Next files) is left alone.
 */
const CACHE = "lifezoi-shell-v1";
const OFFLINE_PATH = "/offline.html";
const PRECACHE_FILES = [
  "/offline.html",
  "/manifest.webmanifest",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/maskable-512.png",
  "/icons/apple-touch-icon.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(PRECACHE_FILES.map((path) => new Request(path, { cache: "reload" }))))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key.startsWith("lifezoi-") && key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    // Network first, with the browser's normal cookies, so sign-in and redirects work as before.
    event.respondWith(
      fetch(request).catch(() =>
        caches.match(OFFLINE_PATH).then((cached) => cached || new Response("Offline", { status: 503, headers: { "Content-Type": "text/plain" } })),
      ),
    );
    return;
  }

  if (PRECACHE_FILES.includes(url.pathname)) {
    event.respondWith(caches.match(url.pathname).then((cached) => cached || fetch(request)));
  }
});
