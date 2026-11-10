"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { Synth } from "@/components/companion/synth";
import { audioFocus } from "@/lib/background-music/audio-focus";
import {
  clampVolume,
  DEFAULT_PREFS,
  effectiveVolume,
  MUSIC_STORAGE_KEY,
  parsePrefs,
  serializePrefs,
  shouldTryResume,
  type MusicPrefs,
} from "@/lib/background-music/prefs";
import { backgroundPlaylist, nextIndex, startIndex, type BackgroundPiece } from "@/lib/background-music/tracks";

/**
 * - `idle`: silent, nothing chosen yet (or turned off).
 * - `blocked`: the person wants music, but the browser has not allowed sound yet.
 *   LifeZoi shows PLAY MUSIC and waits for a click or key press. It never works around this.
 * - `held`: paused because other sound in LifeZoi is playing.
 */
export type MusicStatus = "idle" | "starting" | "playing" | "paused" | "blocked" | "held" | "unsupported";
export type HoldReason = "sound" | "video" | null;

type MusicContextValue = {
  ready: boolean;
  prefs: MusicPrefs;
  status: MusicStatus;
  holdReason: HoldReason;
  piece: BackgroundPiece | null;
  usesRecordings: boolean;
  play: () => void;
  pause: () => void;
  next: () => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  turnOff: () => void;
  turnOn: () => void;
};

const MusicContext = createContext<MusicContextValue | null>(null);

const PLAYLIST = backgroundPlaylist();
const CHANNEL = "lifezoi-music";

function readPrefs(): MusicPrefs {
  try {
    return parsePrefs(window.localStorage.getItem(MUSIC_STORAGE_KEY));
  } catch {
    return { ...DEFAULT_PREFS };
  }
}

function writePrefs(prefs: MusicPrefs) {
  try {
    window.localStorage.setItem(MUSIC_STORAGE_KEY, serializePrefs(prefs));
  } catch {
    // Storage can be blocked. The choice still applies until the page closes.
  }
}

const subscribeNothing = () => () => undefined;
const clientReady = () => true;
const serverReady = () => false;

/** Marks music controls, so a click on them is not also treated as "any click" when sound was blocked. */
export const MUSIC_CONTROL_ATTR = "data-music-control";

/**
 * One background music player for the whole site. It lives in the root layout,
 * so moving between pages never restarts it, and only one piece plays at a time.
 */
export function BackgroundMusicProvider({ children }: { children: React.ReactNode }) {
  // False while the server page hydrates, true afterwards, so saved choices never cause a mismatch.
  const ready = useSyncExternalStore(subscribeNothing, clientReady, serverReady);
  const [prefs, setPrefs] = useState<MusicPrefs>(() => (typeof window === "undefined" ? { ...DEFAULT_PREFS } : readPrefs()));
  const [status, setStatus] = useState<MusicStatus>("idle");
  const [holdReason, setHoldReason] = useState<HoldReason>(null);
  const [index, setIndex] = useState(() => startIndex(PLAYLIST, prefs.trackId));

  const prefsRef = useRef(prefs);
  const statusRef = useRef(status);
  const indexRef = useRef(index);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const synthRef = useRef<Synth | null>(null);
  const synthPosition = useRef(0);
  const videoHold = useRef(false);
  const attempt = useRef(0);
  const tabId = useRef("");
  const channelRef = useRef<BroadcastChannel | null>(null);

  const updateStatus = useCallback((next: MusicStatus) => {
    statusRef.current = next;
    setStatus(next);
  }, []);

  const updatePrefs = useCallback((change: Partial<MusicPrefs>) => {
    const next = { ...prefsRef.current, ...change, volume: clampVolume(change.volume ?? prefsRef.current.volume) };
    prefsRef.current = next;
    setPrefs(next);
    writePrefs(next);
  }, []);

  const audioElement = useCallback(() => {
    if (!audioRef.current) {
      const element = new Audio();
      element.preload = "none";
      element.dataset.lifezoiMusic = "true";
      audioRef.current = element;
    }
    return audioRef.current;
  }, []);

  const silence = useCallback(() => {
    attempt.current += 1;
    audioRef.current?.pause();
    if (synthRef.current) {
      synthPosition.current = synthRef.current.position();
      synthRef.current.stop();
      synthRef.current = null;
    }
  }, []);

  /** Starts the piece at `at`. Resolves with the result; never retries on its own. */
  const sound = useCallback(
    async (at: number, fromStart: boolean): Promise<MusicStatus> => {
      const piece = PLAYLIST[at];
      if (!piece) return "unsupported";
      const ticket = ++attempt.current;
      const volume = effectiveVolume(prefsRef.current);
      if (piece.kind === "file") {
        const element = audioElement();
        if (!element.src.endsWith(piece.recording.file)) element.src = piece.recording.file;
        if (fromStart) element.currentTime = 0;
        element.volume = volume;
        try {
          await element.play();
        } catch (error) {
          return error instanceof DOMException && error.name === "NotAllowedError" ? "blocked" : "unsupported";
        }
        return ticket === attempt.current ? "playing" : statusRef.current;
      }
      if (fromStart) synthPosition.current = 0;
      let engine: Synth;
      try {
        engine = new Synth(volume);
      } catch {
        return "unsupported";
      }
      const allowed = await engine.allowed();
      if (!allowed || ticket !== attempt.current) {
        engine.stop();
        return allowed ? statusRef.current : "blocked";
      }
      engine.start(piece.track, synthPosition.current);
      synthRef.current = engine;
      return "playing";
    },
    [audioElement],
  );

  const begin = useCallback(
    async (at: number, fromStart: boolean) => {
      if (audioFocus.busy() || videoHold.current) {
        setHoldReason(videoHold.current || audioFocus.claims().some((claim) => claim.kind === "video") ? "video" : "sound");
        updateStatus("held");
        return;
      }
      updateStatus("starting");
      const result = await sound(at, fromStart);
      if (statusRef.current !== "starting") {
        // Paused, turned off, or held while starting.
        if (result === "playing") silence();
        return;
      }
      updateStatus(result);
      if (result === "playing") {
        setHoldReason(null);
        channelRef.current?.postMessage({ playing: tabId.current });
      }
    },
    [silence, sound, updateStatus],
  );

  const goTo = useCallback(
    (at: number, fromStart: boolean) => {
      indexRef.current = at;
      setIndex(at);
      updatePrefs({ trackId: PLAYLIST[at]?.id ?? null });
      void begin(at, fromStart);
    },
    [begin, updatePrefs],
  );

  // Load the saved choice and continue if the person left music playing.
  useEffect(() => {
    if (shouldTryResume(prefsRef.current)) void begin(indexRef.current, true);
    return () => silence();
  }, [begin, silence]);

  // Only one LifeZoi tab plays at a time.
  useEffect(() => {
    if (!tabId.current) tabId.current = Math.random().toString(36).slice(2);
    if (typeof BroadcastChannel === "undefined") return;
    const channel = new BroadcastChannel(CHANNEL);
    channelRef.current = channel;
    channel.onmessage = (event: MessageEvent<{ playing?: string }>) => {
      if (event.data?.playing && event.data.playing !== tabId.current && statusRef.current === "playing") {
        silence();
        updateStatus("paused");
      }
    };
    return () => {
      channel.close();
      channelRef.current = null;
    };
  }, [silence, updateStatus]);

  // When a file ends, or a synthesized piece reaches its length, move to the next one.
  useEffect(() => {
    if (status !== "playing") return;
    const piece = PLAYLIST[indexRef.current];
    if (piece?.kind === "file") {
      const element = audioElement();
      const onEnded = () => goTo(nextIndex(PLAYLIST, indexRef.current), true);
      element.addEventListener("ended", onEnded);
      return () => element.removeEventListener("ended", onEnded);
    }
    const timer = setInterval(() => {
      const engine = synthRef.current;
      if (piece?.kind === "synth" && engine && engine.position() >= piece.track.minutes * 60) {
        silence();
        goTo(nextIndex(PLAYLIST, indexRef.current), true);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [status, audioElement, goTo, silence]);

  // Step aside for other sound: LifeZoi players that claim focus, any other <audio>/<video>, and spoken instructions.
  useEffect(() => {
    const react = () => {
      const busy = audioFocus.busy() || videoHold.current;
      if (busy && (statusRef.current === "playing" || statusRef.current === "starting")) {
        silence();
        setHoldReason(videoHold.current || audioFocus.claims().some((claim) => claim.kind === "video") ? "video" : "sound");
        updateStatus("held");
      } else if (!busy && statusRef.current === "held" && prefsRef.current.choice === "playing") {
        setTimeout(() => {
          if (statusRef.current === "held" && !audioFocus.busy() && !videoHold.current) void begin(indexRef.current, false);
        }, 800);
      }
    };
    const unsubscribe = audioFocus.subscribe(react);

    let mediaCount = 0;
    const mediaIds = new WeakMap<EventTarget, string>();
    const onPlay = (event: Event) => {
      const target = event.target;
      if (!(target instanceof HTMLMediaElement) || target === audioRef.current) return;
      if (target.muted) return;
      let id = mediaIds.get(target);
      if (!id) {
        id = `page-media-${(mediaCount += 1)}`;
        mediaIds.set(target, id);
      }
      audioFocus.claim(id, target instanceof HTMLVideoElement ? "video" : "sound");
    };
    const onStop = (event: Event) => {
      const id = event.target ? mediaIds.get(event.target) : undefined;
      if (id) audioFocus.release(id);
    };
    document.addEventListener("play", onPlay, true);
    document.addEventListener("pause", onStop, true);
    document.addEventListener("ended", onStop, true);
    document.addEventListener("emptied", onStop, true);

    // A click into an embedded video (for example a YouTube lesson) moves focus into its frame.
    // LifeZoi cannot see inside the frame, so music pauses until the person resumes it.
    const onBlur = () => {
      setTimeout(() => {
        if (document.activeElement?.tagName !== "IFRAME") return;
        if (statusRef.current === "playing" || statusRef.current === "starting") {
          videoHold.current = true;
          react();
        }
      }, 0);
    };
    window.addEventListener("blur", onBlur);

    const speech = setInterval(() => {
      const speaking = typeof window !== "undefined" && "speechSynthesis" in window && window.speechSynthesis.speaking;
      if (speaking) audioFocus.claim("spoken-instructions");
      else audioFocus.release("spoken-instructions");
    }, 1000);

    return () => {
      unsubscribe();
      document.removeEventListener("play", onPlay, true);
      document.removeEventListener("pause", onStop, true);
      document.removeEventListener("ended", onStop, true);
      document.removeEventListener("emptied", onStop, true);
      window.removeEventListener("blur", onBlur);
      clearInterval(speech);
    };
  }, [begin, silence, updateStatus]);

  const play = useCallback(() => {
    videoHold.current = false;
    updatePrefs({ choice: "playing" });
    void begin(indexRef.current, false);
  }, [begin, updatePrefs]);

  // Sound was blocked: the next click or key press anywhere is the permission browsers ask for.
  useEffect(() => {
    if (status !== "blocked") return;
    const onGesture = (event: Event) => {
      const target = event.target as Element | null;
      if (target?.closest?.(`[${MUSIC_CONTROL_ATTR}]`)) return;
      if (prefsRef.current.choice === "playing") void begin(indexRef.current, false);
    };
    document.addEventListener("pointerup", onGesture, { capture: true });
    document.addEventListener("keydown", onGesture, { capture: true });
    return () => {
      document.removeEventListener("pointerup", onGesture, { capture: true });
      document.removeEventListener("keydown", onGesture, { capture: true });
    };
  }, [status, begin]);

  const pause = useCallback(() => {
    silence();
    videoHold.current = false;
    updatePrefs({ choice: "paused" });
    updateStatus("paused");
  }, [silence, updatePrefs, updateStatus]);

  const next = useCallback(() => {
    const wasOn = statusRef.current === "playing" || statusRef.current === "starting";
    silence();
    synthPosition.current = 0;
    const at = nextIndex(PLAYLIST, indexRef.current);
    if (wasOn) goTo(at, true);
    else {
      indexRef.current = at;
      setIndex(at);
      updatePrefs({ trackId: PLAYLIST[at]?.id ?? null });
      if (audioRef.current) audioRef.current.removeAttribute("src");
    }
  }, [goTo, silence, updatePrefs]);

  const applyVolume = useCallback(() => {
    const volume = effectiveVolume(prefsRef.current);
    if (audioRef.current) audioRef.current.volume = volume;
    synthRef.current?.setVolume(volume);
  }, []);

  const setVolume = useCallback(
    (volume: number) => {
      updatePrefs({ volume, muted: volume === 0 ? prefsRef.current.muted : false });
      applyVolume();
    },
    [applyVolume, updatePrefs],
  );

  const toggleMute = useCallback(() => {
    updatePrefs({ muted: !prefsRef.current.muted });
    applyVolume();
  }, [applyVolume, updatePrefs]);

  const turnOff = useCallback(() => {
    silence();
    videoHold.current = false;
    updatePrefs({ choice: "off" });
    updateStatus("idle");
  }, [silence, updatePrefs, updateStatus]);

  const value = useMemo<MusicContextValue>(
    () => ({
      ready,
      prefs,
      status,
      holdReason,
      piece: PLAYLIST[index] ?? null,
      usesRecordings: PLAYLIST[0]?.kind === "file",
      play,
      pause,
      next,
      setVolume,
      toggleMute,
      turnOff,
      turnOn: play,
    }),
    [ready, prefs, status, holdReason, index, play, pause, next, setVolume, toggleMute, turnOff],
  );

  return <MusicContext.Provider value={value}>{children}</MusicContext.Provider>;
}

export function useBackgroundMusic(): MusicContextValue {
  const value = useContext(MusicContext);
  if (!value) throw new Error("useBackgroundMusic must be used inside BackgroundMusicProvider");
  return value;
}

export function isSounding(status: MusicStatus): boolean {
  return status === "playing" || status === "starting";
}
