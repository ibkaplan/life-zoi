"use client";

type AudioWindow = Window & { webkitAudioContext?: typeof AudioContext };

let context: AudioContext | null = null;

function audioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (context) return context;
  const Ctor = window.AudioContext ?? (window as AudioWindow).webkitAudioContext;
  if (!Ctor) return null;
  try {
    context = new Ctor();
  } catch {
    context = null;
  }
  return context;
}

/**
 * Call from a click. Browsers only let sound start after the person presses
 * something, so the chime is prepared when they press Start.
 */
export function prepareChime() {
  const ctx = audioContext();
  if (ctx && ctx.state === "suspended") void ctx.resume().catch(() => undefined);
}

/**
 * A soft two-note bell made in the browser with the Web Audio API.
 * Nothing is downloaded. It does not pause background music, because it is short.
 */
export function playChime(kind: "focus-done" | "break-done" = "focus-done") {
  const ctx = audioContext();
  if (!ctx) return;
  if (ctx.state === "suspended") void ctx.resume().catch(() => undefined);
  const notes = kind === "focus-done" ? [659.25, 880] : [523.25, 659.25, 783.99];
  const start = ctx.currentTime + 0.05;
  notes.forEach((frequency, index) => {
    const at = start + index * 0.35;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = frequency;
    gain.gain.setValueAtTime(0.0001, at);
    gain.gain.exponentialRampToValueAtTime(0.25, at + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, at + 1.4);
    osc.connect(gain).connect(ctx.destination);
    osc.start(at);
    osc.stop(at + 1.5);
  });
}
