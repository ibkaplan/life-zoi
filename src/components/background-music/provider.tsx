"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { Synth } from "@/components/companion/synth";
import { audioFocus } from "@/lib/background-music/audio-focus";
import {
  clampVolume,
  DEFAULT_PREFS,
  DEFAULT_SESSION_VOLUME,
  effectiveVolume,
  MUSIC_STORAGE_KEY,
  parsePrefs,
  serializePrefs,
  sessionEffect,
  shouldTryResume,
  type MusicPrefs,
} from "@/lib/background-music/prefs";
import {
  categoryPlaylist,
  nextIndex,
  pieceLength,
  previousIndex,
  startIndex,
  type LibraryCategory,
  type LibraryPiece,
} from "@/lib/music-library/catalog";

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
  /** True while music plays quietly under a session (video, voice, guided breathing). */
  ducked: boolean;
  piece: LibraryPiece | null;
  playlist: readonly LibraryPiece[];
  index: number;
  usesRecordings: boolean;
  play: () => void;
  pause: () => void;
  next: () => void;
  previous: () => void;
  /** Plays the piece at this place in the current category. */
  playAt: (index: number) => void;
  /** Switches category. Music keeps playing if it was playing, or starts when `start` is true. */
  selectCategory: (category: LibraryCategory, start?: boolean) => void;
  seek: (seconds: number) => void;
  setVolume: (volume: number) => void;
  setSessionVolume: (volume: number) => void;
  setUnderSessions: (value: boolean) => void;
  toggleMute: () => void;
  turnOff: () => void;
  turnOn: () => void;
};

type Progress = { position: number; duration: number | null };

const MusicContext = createContext<MusicContextValue | null>(null);
const ProgressContext = createContext<Progress>({ position: 0, duration: null });

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
 * One music player for the whole site. It lives in the root layout, so moving
 * between pages never restarts it, and only one piece plays at a time. Only the
 * piece that is playing is loaded; nothing else is downloaded.
 */
export function BackgroundMusicProvider({ children }: { children: React.ReactNode }) {
  // False while the server page hydrates, true afterwards, so saved choices never cause a mismatch.
  const ready = useSyncExternalStore(subscribeNothing, clientReady, serverReady);
  const [prefs, setPrefs] = useState<MusicPrefs>(() => (typeof window === "undefined" ? { ...DEFAULT_PREFS } : readPrefs()));
  const [status, setStatus] = useState<MusicStatus>("idle");
  const [holdReason, setHoldReason] = useState<HoldReason>(null);
  const [ducked, setDucked] = useState(false);
  const playlist = useMemo(() => categoryPlaylist(prefs.category), [prefs.category]);
  const [index, setIndex] = useState(() => startIndex(playlist, prefs.trackId));
  const [progress, setProgress] = useState<Progress>({ position: 0, duration: null });

  const prefsRef = useRef(prefs);
  const statusRef = useRef(status);
  const indexRef = useRef(index);
  const playlistRef = useRef(playlist);
  const duckedRef = useRef(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const synthRef = useRef<Synth | null>(null);
  const synthPosition = useRef(0);
  const videoHold = useRef(false);
  const attempt = useRef(0);
  const tabId = useRef("");
  const channelRef = useRef<BroadcastChannel | null>(null);
  const reactRef = useRef<() => void>(() => undefined);

  useEffect(() => {
    playlistRef.current = playlist;
  }, [playlist]);

  const updateStatus = useCallback((next: MusicStatus) => {
    statusRef.current = next;
    setStatus(next);
  }, []);

  const updatePrefs = useCallback((change: Partial<MusicPrefs>) => {
    const next = {
      ...prefsRef.current,
      ...change,
      volume: clampVolume(change.volume ?? prefsRef.current.volume),
      sessionVolume: clampVolume(change.sessionVolume ?? prefsRef.current.sessionVolume, DEFAULT_SESSION_VOLUME),
    };
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

  const currentVolume = useCallback(() => effectiveVolume(prefsRef.current, duckedRef.current), []);

  const applyVolume = useCallback(() => {
    const volume = currentVolume();
    if (audioRef.current) audioRef.current.volume = volume;
    synthRef.current?.setVolume(volume);
  }, [currentVolume]);

  const silence = useCallback(() => {
    attempt.current += 1;
    audioRef.current?.pause();
    if (synthRef.current) {
      synthPosition.current = synthRef.current.position();
      synthRef.current.stop();
      synthRef.current = null;
    }
  }, []);

  /** The focus decision right now: play normally, play quietly underneath, or pause. */
  const focusEffect = useCallback(() => {
    const kinds = audioFocus.claims().map((claim) => claim.kind);
    if (videoHold.current) return "pause" as const;
    return sessionEffect(kinds, prefsRef.current.underSessions);
  }, []);

  const holdFor = useCallback(() => {
    const kinds = audioFocus.claims().map((claim) => claim.kind);
    setHoldReason(videoHold.current || kinds.includes("video") ? "video" : "sound");
  }, []);

  /** Starts the piece at `at`. Resolves with the result; never retries on its own. */
  const sound = useCallback(
    async (at: number, fromStart: boolean): Promise<MusicStatus> => {
      const piece = playlistRef.current[at];
      if (!piece) return "unsupported";
      const ticket = ++attempt.current;
      const volume = currentVolume();
      if (piece.kind === "file") {
        const element = audioElement();
        if (!element.src.endsWith(piece.file)) element.src = piece.file;
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
    [audioElement, currentVolume],
  );

  const begin = useCallback(
    async (at: number, fromStart: boolean) => {
      const effect = focusEffect();
      if (effect === "pause") {
        holdFor();
        updateStatus("held");
        return;
      }
      duckedRef.current = effect === "duck";
      setDucked(duckedRef.current);
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
    [focusEffect, holdFor, silence, sound, updateStatus],
  );

  const goTo = useCallback(
    (at: number, fromStart: boolean) => {
      indexRef.current = at;
      setIndex(at);
      synthPosition.current = 0;
      updatePrefs({ trackId: playlistRef.current[at]?.id ?? null });
      void begin(at, fromStart);
    },
    [begin, updatePrefs],
  );

  /** Moves to a piece without making sound. */
  const cue = useCallback(
    (at: number) => {
      indexRef.current = at;
      setIndex(at);
      synthPosition.current = 0;
      updatePrefs({ trackId: playlistRef.current[at]?.id ?? null });
      if (audioRef.current) audioRef.current.removeAttribute("src");
      setProgress({ position: 0, duration: pieceLength(playlistRef.current[at] ?? null) });
    },
    [updatePrefs],
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

  // Progress, and moving on when a piece ends.
  useEffect(() => {
    const piece = playlist[index] ?? null;
    const read = (): Progress => {
      if (piece?.kind === "file") {
        const element = audioRef.current;
        const duration = element && Number.isFinite(element.duration) ? element.duration : null;
        return { position: element?.currentTime ?? 0, duration };
      }
      const position = synthRef.current ? synthRef.current.position() : synthPosition.current;
      return { position: Math.max(0, position), duration: pieceLength(piece) };
    };
    setProgress(read());
    if (status !== "playing") return;
    const onEnded = () => goTo(nextIndex(playlistRef.current, indexRef.current), true);
    const element = piece?.kind === "file" ? audioElement() : null;
    element?.addEventListener("ended", onEnded);
    const timer = setInterval(() => {
      const now = read();
      setProgress(now);
      if (piece?.kind === "synth" && synthRef.current && now.duration !== null && now.position >= now.duration) {
        silence();
        onEnded();
      }
    }, 500);
    return () => {
      clearInterval(timer);
      element?.removeEventListener("ended", onEnded);
    };
  }, [status, index, playlist, audioElement, goTo, silence]);

  // Other LifeZoi sound: lower the music under videos and voices, pause it for another tune.
  useEffect(() => {
    const react = () => {
      const effect = focusEffect();
      const sounding = statusRef.current === "playing" || statusRef.current === "starting";
      if (effect === "pause") {
        if (sounding) {
          silence();
          holdFor();
          updateStatus("held");
        }
        return;
      }
      const duck = effect === "duck";
      if (duck !== duckedRef.current) {
        duckedRef.current = duck;
        setDucked(duck);
        applyVolume();
      }
      if (statusRef.current === "held" && prefsRef.current.choice === "playing") {
        setTimeout(() => {
          if (statusRef.current === "held" && focusEffect() !== "pause") void begin(indexRef.current, false);
        }, 800);
      }
    };
    reactRef.current = react;
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
    // LifeZoi cannot see inside the frame. When the person chose to pause music for sessions,
    // music pauses until they resume it. Otherwise the video's on-screen claim already lowers it.
    const onBlur = () => {
      setTimeout(() => {
        if (document.activeElement?.tagName !== "IFRAME" || prefsRef.current.underSessions) return;
        if (statusRef.current === "playing" || statusRef.current === "starting") {
          videoHold.current = true;
          react();
        }
      }, 0);
    };
    window.addEventListener("blur", onBlur);

    // Spoken instructions (read aloud, guided breathing) count as a voice.
    const speech = setInterval(() => {
      const speaking = typeof window !== "undefined" && "speechSynthesis" in window && window.speechSynthesis.speaking;
      if (speaking) audioFocus.claim("spoken-instructions", "voice");
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
  }, [applyVolume, begin, focusEffect, holdFor, silence, updateStatus]);

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

  const isOn = () => statusRef.current === "playing" || statusRef.current === "starting";

  const playAt = useCallback(
    (at: number) => {
      silence();
      videoHold.current = false;
      updatePrefs({ choice: "playing" });
      goTo(Math.max(0, Math.min(at, playlistRef.current.length - 1)), true);
    },
    [goTo, silence, updatePrefs],
  );

  const next = useCallback(() => {
    const wasOn = isOn();
    silence();
    const at = nextIndex(playlistRef.current, indexRef.current);
    if (wasOn) goTo(at, true);
    else cue(at);
  }, [cue, goTo, silence]);

  const previous = useCallback(() => {
    const wasOn = isOn();
    const piece = playlistRef.current[indexRef.current];
    const position = piece?.kind === "file" ? (audioRef.current?.currentTime ?? 0) : (synthRef.current?.position() ?? synthPosition.current);
    silence();
    // Like most players: a few seconds in, Previous goes back to the start of this piece.
    const at = position > 5 ? indexRef.current : previousIndex(playlistRef.current, indexRef.current);
    if (wasOn) goTo(at, true);
    else cue(at);
  }, [cue, goTo, silence]);

  const selectCategory = useCallback(
    (category: LibraryCategory, start = false) => {
      const wasOn = isOn() || statusRef.current === "held";
      silence();
      const list = categoryPlaylist(category);
      playlistRef.current = list;
      updatePrefs({ category, trackId: list[0]?.id ?? null, ...(start ? { choice: "playing" as const } : {}) });
      if (start || wasOn) {
        videoHold.current = false;
        goTo(0, true);
      } else cue(0);
    },
    [cue, goTo, silence, updatePrefs],
  );

  const seek = useCallback(
    (seconds: number) => {
      const piece = playlistRef.current[indexRef.current];
      if (!piece) return;
      const length = pieceLength(piece) ?? audioRef.current?.duration ?? 0;
      const to = Math.max(0, Math.min(Number.isFinite(length) && length > 0 ? length - 1 : 0, seconds));
      if (piece.kind === "file") {
        const element = audioElement();
        if (!element.src.endsWith(piece.file)) element.src = piece.file;
        element.currentTime = to;
        setProgress((value) => ({ ...value, position: to }));
        return;
      }
      const wasOn = isOn();
      silence();
      synthPosition.current = to;
      setProgress((value) => ({ ...value, position: to }));
      if (wasOn) void begin(indexRef.current, false);
    },
    [audioElement, begin, silence],
  );

  const setVolume = useCallback(
    (volume: number) => {
      updatePrefs({ volume, muted: volume === 0 ? prefsRef.current.muted : false });
      applyVolume();
    },
    [applyVolume, updatePrefs],
  );

  const setSessionVolume = useCallback(
    (sessionVolume: number) => {
      updatePrefs({ sessionVolume, muted: sessionVolume === 0 ? prefsRef.current.muted : false });
      applyVolume();
    },
    [applyVolume, updatePrefs],
  );

  const setUnderSessions = useCallback(
    (underSessions: boolean) => {
      updatePrefs({ underSessions });
      videoHold.current = false;
      reactRef.current();
    },
    [updatePrefs],
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

  // Lock screen and headphone buttons on phones, where the browser supports them.
  const piece = playlist[index] ?? null;
  useEffect(() => {
    if (typeof navigator === "undefined" || !("mediaSession" in navigator)) return;
    const session = navigator.mediaSession;
    const handlers: [MediaSessionAction, () => void][] = [
      ["play", play],
      ["pause", pause],
      ["nexttrack", next],
      ["previoustrack", previous],
    ];
    try {
      for (const [action, handler] of handlers) session.setActionHandler(action, handler);
    } catch {
      // Some browsers do not support every action.
    }
    return () => {
      try {
        for (const [action] of handlers) session.setActionHandler(action, null);
      } catch {
        // Nothing to undo.
      }
    };
  }, [play, pause, next, previous]);

  const value = useMemo<MusicContextValue>(
    () => ({
      ready,
      prefs,
      status,
      holdReason,
      ducked,
      piece,
      playlist,
      index,
      usesRecordings: playlist.some((item) => item.kind === "file"),
      play,
      pause,
      next,
      previous,
      playAt,
      selectCategory,
      seek,
      setVolume,
      setSessionVolume,
      setUnderSessions,
      toggleMute,
      turnOff,
      turnOn: play,
    }),
    [ready, prefs, status, holdReason, ducked, piece, playlist, index, play, pause, next, previous, playAt, selectCategory, seek, setVolume, setSessionVolume, setUnderSessions, toggleMute, turnOff],
  );

  return (
    <MusicContext.Provider value={value}>
      <ProgressContext.Provider value={progress}>{children}</ProgressContext.Provider>
    </MusicContext.Provider>
  );
}

export function useBackgroundMusic(): MusicContextValue {
  const value = useContext(MusicContext);
  if (!value) throw new Error("useBackgroundMusic must be used inside BackgroundMusicProvider");
  return value;
}

/** Position and length of the current piece, in seconds. Updates twice a second while playing. */
export function useMusicProgress(): Progress {
  return useContext(ProgressContext);
}

export function isSounding(status: MusicStatus): boolean {
  return status === "playing" || status === "starting";
}
