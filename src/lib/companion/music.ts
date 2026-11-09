/**
 * Wellness music, synthesized in the browser with the Web Audio API.
 *
 * Every track is original LifeZoi sound design, or a performance LifeZoi makes of
 * a melody whose composer died long ago (public domain). Nothing is downloaded,
 * streamed, or copied from a recording.
 */

export const MUSIC_CATEGORIES = ["relaxation", "meditation", "sleep", "classical", "nature", "focus", "positive", "breathing"] as const;
export type MusicCategory = (typeof MUSIC_CATEGORIES)[number];

export const MUSIC_CATEGORY_LABEL: Record<MusicCategory, string> = {
  relaxation: "Relaxation",
  meditation: "Meditation",
  sleep: "Sleep",
  classical: "Classical",
  nature: "Nature sounds",
  focus: "Focus",
  positive: "Positive mood",
  breathing: "Breathing",
};

export type Note = [midi: number | null, beats: number];

export type Track = {
  id: string;
  title: string;
  category: MusicCategory;
  description: string;
  credit: string;
  minutes: number;
  tempo: number;
  /** Chords held under the music, each `chordBeats` long, looping. */
  chords: number[][];
  chordBeats: number;
  melody: Note[];
  wave: OscillatorType;
  noise: "" | "rain" | "waves" | "wind";
  /** Breathing guide in seconds: in, hold, out. */
  breath: [number, number, number] | null;
};

const ORIGINAL = "Original LifeZoi sound design.";

// Note numbers: 60 is middle C.
export const TRACKS: Track[] = [
  {
    id: "soft-evening",
    title: "Soft evening",
    category: "relaxation",
    description: "Slow, warm chords that move gently. Good for unwinding after the day.",
    credit: ORIGINAL,
    minutes: 10,
    tempo: 50,
    chords: [
      [48, 55, 60, 64],
      [45, 52, 57, 60],
      [41, 48, 53, 57],
      [43, 50, 55, 59],
    ],
    chordBeats: 8,
    melody: [[72, 4], [71, 4], [69, 8], [67, 4], [69, 4], [72, 8]],
    wave: "sine",
    noise: "",
    breath: null,
  },
  {
    id: "garden-air",
    title: "Garden air",
    category: "relaxation",
    description: "Light pads with a soft breeze in the background.",
    credit: ORIGINAL,
    minutes: 15,
    tempo: 56,
    chords: [
      [50, 57, 62, 66],
      [47, 54, 59, 62],
      [43, 50, 55, 59],
      [45, 52, 57, 61],
    ],
    chordBeats: 8,
    melody: [[74, 2], [null, 2], [73, 2], [71, 6], [null, 4], [69, 4], [71, 4]],
    wave: "triangle",
    noise: "wind",
    breath: null,
  },
  {
    id: "still-point",
    title: "Still point",
    category: "meditation",
    description: "One steady tone and a slow bell every few breaths. Nothing to follow.",
    credit: ORIGINAL,
    minutes: 10,
    tempo: 40,
    chords: [[45, 52, 57]],
    chordBeats: 16,
    melody: [[81, 8], [null, 8], [76, 8], [null, 8]],
    wave: "sine",
    noise: "",
    breath: null,
  },
  {
    id: "night-harbour",
    title: "Night harbour",
    category: "sleep",
    description: "Very slow chords over quiet waves. Set it and let it fade.",
    credit: ORIGINAL,
    minutes: 30,
    tempo: 36,
    chords: [
      [41, 48, 57],
      [43, 50, 55],
      [40, 47, 55],
      [41, 48, 53],
    ],
    chordBeats: 12,
    melody: [],
    wave: "sine",
    noise: "waves",
    breath: null,
  },
  {
    id: "brahms-lullaby",
    title: "Lullaby (after Brahms)",
    category: "sleep",
    description: "The familiar cradle song, played softly and slowly.",
    credit: "Melody by Johannes Brahms (1868), public domain. Performance synthesized by LifeZoi.",
    minutes: 10,
    tempo: 66,
    chords: [
      [53, 57, 60],
      [48, 52, 55],
      [53, 57, 60],
      [48, 55, 58],
    ],
    chordBeats: 6,
    melody: [
      [69, 1], [69, 1], [72, 4], [69, 1], [69, 1], [72, 4],
      [69, 1], [72, 1], [77, 2], [76, 3], [74, 1], [74, 2], [72, 2],
      [67, 1], [69, 1], [70, 2], [67, 2], [67, 1], [69, 1], [70, 4],
      [67, 1], [70, 1], [76, 1], [74, 1], [72, 2], [76, 2], [77, 4],
    ],
    wave: "triangle",
    noise: "",
    breath: null,
  },
  {
    id: "ode-to-joy",
    title: "Ode to Joy (after Beethoven)",
    category: "classical",
    description: "The melody from the Ninth Symphony, played gently on a soft keyboard sound.",
    credit: "Melody by Ludwig van Beethoven (1824), public domain. Performance synthesized by LifeZoi.",
    minutes: 5,
    tempo: 92,
    chords: [
      [48, 52, 55],
      [43, 47, 50],
      [48, 52, 55],
      [43, 47, 50],
    ],
    chordBeats: 4,
    melody: [
      [64, 1], [64, 1], [65, 1], [67, 1], [67, 1], [65, 1], [64, 1], [62, 1],
      [60, 1], [60, 1], [62, 1], [64, 1], [64, 1.5], [62, 0.5], [62, 2],
      [64, 1], [64, 1], [65, 1], [67, 1], [67, 1], [65, 1], [64, 1], [62, 1],
      [60, 1], [60, 1], [62, 1], [64, 1], [62, 1.5], [60, 0.5], [60, 2],
    ],
    wave: "triangle",
    noise: "",
    breath: null,
  },
  {
    id: "canon-ground",
    title: "Canon ground (after Pachelbel)",
    category: "classical",
    description: "The slow repeating bass and chords from the famous canon, with a simple line above.",
    credit: "Harmony by Johann Pachelbel (about 1700), public domain. Performance synthesized by LifeZoi.",
    minutes: 10,
    tempo: 60,
    chords: [
      [50, 54, 57],
      [45, 49, 52],
      [47, 50, 54],
      [42, 45, 49],
      [43, 47, 50],
      [38, 42, 45],
      [43, 47, 50],
      [45, 49, 52],
    ],
    chordBeats: 2,
    melody: [[78, 2], [76, 2], [74, 2], [73, 2], [71, 2], [69, 2], [71, 2], [73, 2]],
    wave: "sine",
    noise: "",
    breath: null,
  },
  {
    id: "spring-rain",
    title: "Spring rain",
    category: "nature",
    description: "Steady soft rain with no music. Good for reading or resting.",
    credit: ORIGINAL,
    minutes: 20,
    tempo: 60,
    chords: [],
    chordBeats: 8,
    melody: [],
    wave: "sine",
    noise: "rain",
    breath: null,
  },
  {
    id: "sea-shore",
    title: "Sea shore",
    category: "nature",
    description: "Waves that rise and fall slowly, about six times a minute.",
    credit: ORIGINAL,
    minutes: 20,
    tempo: 60,
    chords: [],
    chordBeats: 8,
    melody: [],
    wave: "sine",
    noise: "waves",
    breath: null,
  },
  {
    id: "clear-desk",
    title: "Clear desk",
    category: "focus",
    description: "An even pulse and simple pattern that stays in the background while you work or read.",
    credit: ORIGINAL,
    minutes: 20,
    tempo: 72,
    chords: [
      [45, 52, 57, 60],
      [41, 48, 53, 57],
      [48, 55, 60, 64],
      [43, 50, 55, 59],
    ],
    chordBeats: 8,
    melody: [[69, 1], [72, 1], [76, 1], [72, 1], [69, 1], [72, 1], [76, 1], [79, 1]],
    wave: "sine",
    noise: "",
    breath: null,
  },
  {
    id: "morning-steps",
    title: "Morning steps",
    category: "positive",
    description: "A bright, cheerful tune at walking pace.",
    credit: ORIGINAL,
    minutes: 5,
    tempo: 100,
    chords: [
      [48, 52, 55],
      [53, 57, 60],
      [55, 59, 62],
      [48, 52, 55],
    ],
    chordBeats: 4,
    melody: [
      [72, 1], [76, 1], [79, 1], [76, 1], [77, 1], [81, 1], [79, 2],
      [76, 1], [74, 1], [72, 1], [74, 1], [76, 2], [72, 2],
    ],
    wave: "triangle",
    noise: "",
    breath: null,
  },
  {
    id: "breath-four-six",
    title: "Breathe in 4, out 6",
    category: "breathing",
    description: "The tone rises while you breathe in for 4 seconds and falls while you breathe out for 6.",
    credit: ORIGINAL,
    minutes: 5,
    tempo: 60,
    chords: [[45, 52, 57]],
    chordBeats: 20,
    melody: [],
    wave: "sine",
    noise: "",
    breath: [4, 0, 6],
  },
  {
    id: "breath-box",
    title: "Box breathing 4-4-4",
    category: "breathing",
    description: "Breathe in for 4, hold for 4, and breathe out for 4, following the tone.",
    credit: ORIGINAL,
    minutes: 5,
    tempo: 60,
    chords: [[48, 55, 60]],
    chordBeats: 20,
    melody: [],
    wave: "sine",
    noise: "",
    breath: [4, 4, 4],
  },
];

export function trackById(id: string): Track | null {
  return TRACKS.find((track) => track.id === id) ?? null;
}

export function midiToHz(midi: number): number {
  return 440 * 2 ** ((midi - 69) / 12);
}

export type NoteEvent = { at: number; midi: number; seconds: number; voice: "pad" | "melody" };

/** Notes that start in [from, to) seconds after the track began. Pure, so it can be tested. */
export function notesBetween(track: Track, from: number, to: number): NoteEvent[] {
  const beat = 60 / track.tempo;
  const events: NoteEvent[] = [];
  const end = Math.min(to, track.minutes * 60);
  if (track.chords.length > 0) {
    const chordSeconds = track.chordBeats * beat;
    for (let index = Math.max(0, Math.floor(from / chordSeconds)); index * chordSeconds < end; index += 1) {
      const at = index * chordSeconds;
      if (at < from) continue;
      const chord = track.chords[index % track.chords.length] ?? [];
      for (const midi of chord) events.push({ at, midi, seconds: chordSeconds, voice: "pad" });
    }
  }
  const loopBeats = track.melody.reduce((sum, [, beats]) => sum + beats, 0);
  if (loopBeats > 0) {
    const loopSeconds = loopBeats * beat;
    for (let loop = Math.max(0, Math.floor(from / loopSeconds)); loop * loopSeconds < end; loop += 1) {
      let at = loop * loopSeconds;
      for (const [midi, beats] of track.melody) {
        if (midi !== null && at >= from && at < end) events.push({ at, midi, seconds: beats * beat, voice: "melody" });
        at += beats * beat;
      }
    }
  }
  return events.sort((a, b) => a.at - b.at);
}

/** Where in the breathing cycle a moment falls, for the on-screen guide. */
export function breathPhase(breath: [number, number, number], seconds: number): { phase: "in" | "hold" | "out"; left: number } {
  const [inhale, hold, exhale] = breath;
  const cycle = inhale + hold + exhale;
  const t = ((seconds % cycle) + cycle) % cycle;
  if (t < inhale) return { phase: "in", left: Math.ceil(inhale - t) };
  if (t < inhale + hold) return { phase: "hold", left: Math.ceil(inhale + hold - t) };
  return { phase: "out", left: Math.ceil(cycle - t) };
}
