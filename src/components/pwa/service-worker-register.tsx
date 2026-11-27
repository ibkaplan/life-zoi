"use client";

import { useEffect } from "react";
import { SERVICE_WORKER_PATH } from "@/lib/pwa/config";

/**
 * Registers the small service worker in production builds. It keeps only the offline
 * page and the app icons (see `public/sw.js`); in development it stays off so a
 * stale worker never hides a code change.
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;
    const register = () => {
      navigator.serviceWorker.register(SERVICE_WORKER_PATH, { scope: "/" }).catch(() => {
        // Installing is optional. The site works the same without it.
      });
    };
    if (document.readyState === "complete") register();
    else window.addEventListener("load", register, { once: true });
    return () => window.removeEventListener("load", register);
  }, []);
  return null;
}
