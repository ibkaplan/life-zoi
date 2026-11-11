"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { stopAllSpeech } from "@/lib/voice/engine";

/** Stops any reading when the person moves to another page or closes the tab. */
export function VoiceRouteGuard() {
  const pathname = usePathname();
  const last = useRef(pathname);
  useEffect(() => {
    if (last.current === pathname) return;
    last.current = pathname;
    stopAllSpeech();
  }, [pathname]);
  useEffect(() => {
    // A reload can leave the browser still speaking text from the page before.
    stopAllSpeech();
    const onHide = () => stopAllSpeech();
    window.addEventListener("pagehide", onHide);
    return () => window.removeEventListener("pagehide", onHide);
  }, []);
  return null;
}
