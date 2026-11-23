"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { readVoicePrefs } from "@/lib/voice/engine";
import { chooseVoice, rankVoices, voiceLanguage } from "@/lib/voice/voices";

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
  if (supported()) window.speechSynthesis.cancel();
}

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

  const chosen = voices.find((voice) => voice.id === voiceId) ?? voices[0] ?? null;

  const stop = () => {
    ticket.current += 1;
    cancelSpeech();
    setStatus("idle");
  };

  const play = (text: string) => {
    if (!supported() || !text.trim()) return;
    const synth = window.speechSynthesis;
    synth.cancel();
    setLastText(text);
    const mine = ++ticket.current;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = chosen?.lang ?? lang;
    const voice = chosen ? synth.getVoices().find((item) => (item.voiceURI || item.name) === chosen.id) : undefined;
    if (voice) utterance.voice = voice;
    utterance.rate = 0.9;
    const done = () => {
      if (ticket.current === mine) setStatus("idle");
    };
    utterance.onend = done;
    utterance.onerror = done;
    setStatus("speaking");
    synth.speak(utterance);
  };

  const pause = () => {
    if (!supported()) return;
    window.speechSynthesis.pause();
    setStatus("paused");
  };

  const resume = () => {
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
