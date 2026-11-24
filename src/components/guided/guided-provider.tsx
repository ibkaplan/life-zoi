"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { GuidedPlayer } from "@/components/guided/guided-player";
import { browserTimers, createEngineNarrator, duckMusic } from "@/components/guided/narrator";
import { useLocale } from "@/components/locale-provider";
import { commitCompanion } from "@/lib/companion/store";
import { addGuidedSession } from "@/lib/companion/state";
import { localISODate } from "@/lib/dates";
import { guidedById } from "@/lib/guided/catalog";
import { GUIDED_START_EVENT, type GuidedStartDetail } from "@/lib/guided/launcher";
import { createGuidedController, type GuidedController } from "@/lib/guided/controller";
import { beatsOf } from "@/lib/guided/timeline";
import type { GuidedSession } from "@/lib/guided/types";
import { primeSpeech, readVoicePrefs } from "@/lib/voice/engine";

export type SaveResult = "saved" | "sample" | null;

type Running = {
  session: GuidedSession;
  controller: GuidedController;
};

type GuidedContextValue = {
  /** Opens the player for a session. With `start`, the voice begins straight away (call it from a tap). */
  launch: (id: string, options?: { start?: boolean }) => void;
  close: () => void;
  running: Running | null;
};

const GuidedContext = createContext<GuidedContextValue | null>(null);

/**
 * One guided-session player for the whole site. Any page (My Day, My Health
 * Day, the guided sessions library) can start a session with `useGuided().launch`.
 * The player opens over the page, so nobody has to look for it elsewhere.
 */
export function GuidedProvider({ children }: { children: React.ReactNode }) {
  const { t, locale } = useLocale();
  const [running, setRunning] = useState<Running | null>(null);
  const [saved, setSaved] = useState<SaveResult>(null);
  const [silent, setSilent] = useState<"unsupported" | "no-voice" | null>(null);
  const tRef = useRef(t);
  const localeRef = useRef(locale);
  useEffect(() => {
    tRef.current = t;
    localeRef.current = locale;
  }, [t, locale]);

  const runningRef = useRef<Running | null>(null);

  const close = useCallback(() => {
    runningRef.current?.controller.stop();
    runningRef.current = null;
    setRunning(null);
    setSaved(null);
    setSilent(null);
  }, []);

  const launch = useCallback(
    (id: string, options: { start?: boolean } = {}) => {
      const session = guidedById(id);
      if (!session) return;
      runningRef.current?.controller.stop();
      setSaved(null);
      setSilent(null);
      const narrator = createEngineNarrator({
        translate: (english) => tRef.current(english),
        locale: () => localeRef.current,
        rateFactor: session.rateFactor,
        onSilent: (reason) => setSilent(reason),
      });
      const controller = createGuidedController({
        beats: beatsOf(session),
        narrator,
        timers: browserTimers,
        duck: duckMusic,
        rate: () => readVoicePrefs().rate * session.rateFactor,
        onComplete: ({ activeSeconds }) => {
          const date = localISODate();
          const ok = commitCompanion((state) =>
            addGuidedSession(state, {
              id: `g-${Date.now().toString(36)}`,
              session: session.id,
              kind: session.kind,
              date,
              seconds: Math.max(activeSeconds, 1),
            }),
          );
          setSaved(ok ? "saved" : "sample");
          // A kind word to finish, in the same voice.
          narrator.speak(session.complete, () => undefined, () => undefined);
        },
      });
      const next = { session, controller };
      runningRef.current = next;
      setRunning(next);
      if (options.start) {
        // Straight from the tap, so phones allow the voice to start.
        primeSpeech();
        controller.play();
      }
    },
    [],
  );

  // Keep the screen on during a session where the browser allows it, so the voice is not cut off by the lock screen.
  const subscribeRunning = useCallback((listener: () => void) => (running ? running.controller.subscribe(listener) : () => undefined), [running]);
  const status = useSyncExternalStore(
    subscribeRunning,
    () => (running ? running.controller.state().status : "idle"),
    () => "idle",
  );
  useEffect(() => {
    if (status !== "playing") return;
    type WakeLock = { release: () => Promise<void> };
    const nav = navigator as Navigator & { wakeLock?: { request: (type: "screen") => Promise<WakeLock> } };
    if (!nav.wakeLock) return;
    let lock: WakeLock | null = null;
    let cancelled = false;
    const request = () => {
      nav.wakeLock
        ?.request("screen")
        .then((value) => {
          if (cancelled) void value.release().catch(() => undefined);
          else lock = value;
        })
        .catch(() => undefined);
    };
    request();
    const onVisible = () => {
      if (document.visibilityState === "visible") request();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisible);
      void lock?.release().catch(() => undefined);
    };
  }, [status]);

  // `requestGuidedSession(id)` from anywhere (a voice command, a link handler) opens the session here.
  useEffect(() => {
    const onStart = (event: Event) => {
      const detail = (event as CustomEvent<GuidedStartDetail>).detail;
      if (!detail || typeof detail.id !== "string" || !guidedById(detail.id)) return;
      event.preventDefault();
      launch(detail.id, { start: detail.start !== false });
    };
    window.addEventListener(GUIDED_START_EVENT, onStart);
    return () => window.removeEventListener(GUIDED_START_EVENT, onStart);
  }, [launch]);

  // Leaving the site mid-session: stop cleanly so nothing keeps talking.
  useEffect(() => {
    const onHide = () => runningRef.current?.controller.pause();
    window.addEventListener("pagehide", onHide);
    return () => window.removeEventListener("pagehide", onHide);
  }, []);

  const value = useMemo(() => ({ launch, close, running }), [launch, close, running]);

  return (
    <GuidedContext.Provider value={value}>
      {children}
      {running ? (
        <GuidedPlayer
          key={running.session.id}
          session={running.session}
          controller={running.controller}
          saved={saved}
          silent={silent}
          onClose={close}
        />
      ) : null}
    </GuidedContext.Provider>
  );
}

export function useGuided(): GuidedContextValue {
  const value = useContext(GuidedContext);
  if (!value) throw new Error("useGuided needs GuidedProvider");
  return value;
}
