"use client";

import { createElement, useEffect, useId } from "react";
import { audioFocus, type FocusKind } from "@/lib/background-music/audio-focus";

/** Pauses background music while `active` is true. Release is automatic on unmount. */
export function useAudioFocus(active: boolean, id: string, kind: FocusKind = "sound") {
  useEffect(() => {
    if (!active) return;
    audioFocus.claim(id, kind);
    return () => audioFocus.release(id);
  }, [active, id, kind]);
}

function Claim({ id }: { id: string }) {
  const unique = useId();
  useAudioFocus(true, `${id}${unique}`, "video");
  return null;
}

/** Render next to an embedded video player: background music pauses while it is on screen. */
export function AudioFocusClaim({ id }: { id: string }) {
  return createElement(Claim, { id });
}
