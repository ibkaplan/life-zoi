"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { readVoicePrefs } from "@/lib/voice/engine";
import { neuralActive, playClip, stopClip, synthesize, unlockNeuralAudio } from "@/lib/voice/neural/client";
import { chooseVoice, rankVoices, splitSentences, voiceLanguage } from "@/lib/voice/voices";

export type ReadAloudStatus = "idle" | "speaking" | "paused";

export type VoiceOption = { id: string; name: string; lang: string };

function supported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window && typeof window.speechSynthesis?.speak === "function";
}

const noVoices: VoiceOption[] = [];
let cacheKey = "";
let cache: VoiceOption[] = noVoices;

function subscribeVoices(onChange: () => void) {
  if (!supported()) return () => undefined;
  const synth = window.speechSynthesis;
  synth.addEventListener("voiceschanged", onChange);
  return () => synth.removeEventListener("voiceschanged", onChange);
}

function voicesSnapshot(): VoiceOption[] {
  if (!supported()) return noVoices;
  const list = window.speechSynthesis.getVoices().map((voice) => ({ id: voice.voiceURI || voice.name, name: voice.name, lang: voice.lang }));
  const key = list.map((voice) => voice.id).join("|");
  if (key !== cacheKey) {
    cacheKey = key;
    cache = list.length ? list : noVoices;
  }
  return cache;
}

/**
 * Voices for a language such as "uk", ranked the same way as every other Listen
 * button: the voice type chosen in Settings (a soft female voice unless changed)
 * and the more natural voices first. The voice chosen in Settings comes first.
 */
export function voicesFor(voices: readonly VoiceOption[], lang: string): VoiceOption[] {
  const base = voiceLanguage({ lang });
  if (!base) return [];
  const prefs = readVoicePrefs();
  const ranked = rankVoices(voices, base, prefs.tone);
  const saved = chooseVoice(voices, base, prefs.voices[base], prefs.tone);
  return saved ? [saved, ...ranked.filter((voice) => voice !== saved)] : ranked;
}

function cancelSpeech() {
  stopClip();
  if (supported()) window.speechSynthesis.cancel();
}

const FOCUS_RATE = 0.9;

/**
 * Reads text aloud with the voices built into this device. Nothing is sent anywhere.
 * While it speaks, background music steps aside and comes back afterwards.
 */
export function useReadAloud(lang: string) {
  const available = useSyncExternalStore(subscribeVoices, supported, () => false);
  const allVoices = useSyncExternalStore(subscribeVoices, voicesSnapshot, () => noVoices);
  const voices = voicesFor(allVoices, lang);
  const [voiceId, setVoiceId] = useState("");
  const [status, setStatus] = useState<ReadAloudStatus>("idle");
  const [lastText, setLastText] = useState("");
  const ticket = useRef(0);
  // While the lifeZoi natural voice reads: the sentences and where Resume continues.
  const neural = useRef<{ sentences: string[]; index: number } | null>(null);

  const chosen = voices.find((voice) => voice.id === voiceId) ?? voices[0] ?? null;

  const stop = () => {
    ticket.current += 1;
    neural.current = null;
    cancelSpeech();
    setStatus("idle");
  };

  const base = voiceLanguage({ lang });

  /** Reads with the natural voice from sentence `from`. Falls back to the device voice if it fails. */
  const runNeural = async (mine: number, from: number) => {
    const reading = neural.current;
    if (!reading || !base) return;
    for (let at = from; at < reading.sentences.length; at += 1) {
      reading.index = at;
      try {
        const clip = await synthesize(base, reading.sentences[at], FOCUS_RATE);
        if (ticket.current !== mine) return;
        const next = reading.sentences[at + 1];
        if (next) void synthesize(base, next, FOCUS_RATE).catch(() => undefined);
        await playClip(clip);
        if (ticket.current !== mine) return;
      } catch {
        if (ticket.current !== mine) return;
        neural.current = null;
        speakWithDevice(reading.sentences.slice(at).join(" "), mine);
        return;
      }
    }
    if (ticket.current === mine) {
      neural.current = null;
      setStatus("idle");
    }
  };

  const speakWithDevice = (text: string, mine: number) => {
    if (!supported()) {
      setStatus("idle");
      return;
    }
    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = chosen?.lang ?? lang;
    const voice = chosen ? synth.getVoices().find((item) => (item.voiceURI || item.name) === chosen.id) : undefined;
    if (voice) utterance.voice = voice;
    utterance.rate = FOCUS_RATE;
    const done = () => {
      if (ticket.current === mine) setStatus("idle");
    };
    utterance.onend = done;
    utterance.onerror = done;
    setStatus("speaking");
    synth.speak(utterance);
  };

  const play = (text: string) => {
    if (!text.trim()) return;
    const natural = base !== null && neuralActive(base);
    if (!natural && !supported()) return;
    cancelSpeech();
    setLastText(text);
    const mine = ++ticket.current;
    if (natural) {
      unlockNeuralAudio();
      neural.current = { sentences: splitSentences(text), index: 0 };
      setStatus("speaking");
      void runNeural(mine, 0);
      return;
    }
    neural.current = null;
    speakWithDevice(text, mine);
  };

  const pause = () => {
    if (neural.current) {
      // The sentence stops; Resume reads it again from its start.
      ticket.current += 1;
      stopClip();
      setStatus("paused");
      return;
    }
    if (!supported()) return;
    window.speechSynthesis.pause();
    setStatus("paused");
  };

  const resume = () => {
    if (neural.current) {
      unlockNeuralAudio();
      const mine = ++ticket.current;
      setStatus("speaking");
      void runNeural(mine, neural.current.index);
      return;
    }
    if (!supported()) return;
    window.speechSynthesis.resume();
    setStatus("speaking");
  };

  const replay = () => {
    if (lastText) play(lastText);
  };

  // Stop speaking when the page closes or the language changes.
  useEffect(() => cancelSpeech, [lang]);

  return { available, status, voices, voiceId: chosen?.id ?? "", setVoiceId, play, pause, resume, stop, replay, hasText: lastText !== "" };
}
