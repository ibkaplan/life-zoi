"use client";

import { useSyncExternalStore } from "react";
import { localISODate } from "@/lib/dates";

/**
 * Today's date in the person's own time zone (YYYY-MM-DD). It changes by itself at local
 * midnight, and when the tab comes back into view or the device clock or time zone moves,
 * so a page left open overnight unlocks the new daily challenge without a reload.
 * Empty on the server and during the first browser render.
 */
function subscribe(onChange: () => void) {
  let timer: number | undefined;
  const schedule = () => {
    window.clearTimeout(timer);
    const now = new Date();
    const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 1);
    // Re-check at least every 15 minutes, in case the computer slept through midnight.
    timer = window.setTimeout(() => {
      onChange();
      schedule();
    }, Math.min(next.getTime() - now.getTime(), 15 * 60 * 1000));
  };
  const wake = () => {
    onChange();
    schedule();
  };
  schedule();
  document.addEventListener("visibilitychange", wake);
  window.addEventListener("focus", wake);
  return () => {
    window.clearTimeout(timer);
    document.removeEventListener("visibilitychange", wake);
    window.removeEventListener("focus", wake);
  };
}

export function useLocalToday(): string {
  return useSyncExternalStore(subscribe, () => localISODate(), () => "");
}
