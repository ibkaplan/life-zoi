import { describe, expect, it } from "vitest";
import {
  buildSegments,
  chooseVoice,
  detectTextLanguage,
  parseVoicePrefs,
  rankVoices,
  serializeVoicePrefs,
  speakableText,
  splitSentences,
  voiceTone,
  type DeviceVoice,
} from "./voices";

const VOICES: DeviceVoice[] = [
  { name: "Samantha", lang: "en-US", localService: true, default: true },
  { name: "Fred", lang: "en-US", localService: true },
  { name: "Bubbles", lang: "en-US", localService: true },
  { name: "Google US English", lang: "en-US", localService: false },
  { name: "Microsoft Aria Online (Natural) - English (United States)", lang: "en-US", localService: false },
  { name: "Ava (Premium)", lang: "en-US", localService: true },
  { name: "Milena", lang: "ru-RU", localService: true },
  { name: "Google русский", lang: "ru-RU", localService: false },
  { name: "Melina", lang: "el-GR", localService: true },
];

describe("voice ranking", () => {
  it("puts natural and premium voices first and leaves out novelty voices", () => {
    const ranked = rankVoices(VOICES, "en").map((voice) => voice.name);
    expect(ranked[0]).toContain("Natural");
    expect(ranked).not.toContain("Bubbles");
    expect(ranked.indexOf("Samantha")).toBeGreaterThan(ranked.indexOf("Ava (Premium)"));
    expect(ranked.indexOf("Fred")).toBe(-1);
  });

  it("only offers voices for the requested language", () => {
    expect(rankVoices(VOICES, "ru").map((voice) => voice.lang)).toEqual(["ru-RU", "ru-RU"]);
    expect(rankVoices(VOICES, "uk")).toEqual([]);
    expect(chooseVoice(VOICES, "uk")).toBeNull();
  });

  it("keeps a saved choice while the device still has it", () => {
    expect(chooseVoice(VOICES, "en", "Samantha")?.name).toBe("Samantha");
    expect(chooseVoice(VOICES, "en", "Gone voice")?.name).toContain("Natural");
    // A saved English voice is never used for Russian.
    expect(chooseVoice(VOICES, "ru", "Samantha")?.lang).toBe("ru-RU");
  });
});

describe("text language", () => {
  it("follows the alphabet of the text, not only the site language", () => {
    expect(detectTextLanguage("Breathe in slowly.", "ru")).toBe("en");
    expect(detectTextLanguage("Медленно вдохните.", "en")).toBe("ru");
    expect(detectTextLanguage("Повільно вдихніть і видихніть.", "ru")).toBe("uk");
    expect(detectTextLanguage("Εισπνεύστε αργά.", "en")).toBe("el");
    expect(detectTextLanguage("Добре", "uk")).toBe("uk");
    expect(detectTextLanguage("12:30", "el")).toBe("el");
  });
});

describe("sentences and pauses", () => {
  it("splits into sentences and does not read symbols", () => {
    expect(splitSentences("First, wash your vegetables. Next, cut the tomatoes! Finally, add dressing?")).toEqual([
      "First, wash your vegetables.",
      "Next, cut the tomatoes!",
      "Finally, add dressing?",
    ]);
    expect(speakableText("Rest 🌿 · then → repeat")).toBe("Rest, then repeat");
    expect(speakableText("WALKING with USDA data")).toBe("Walking with USDA data");
  });

  it("keeps long sentences under the length some browsers cut off", () => {
    const long = Array.from({ length: 30 }, (_, index) => `part ${index}`).join(", ") + ".";
    for (const piece of splitSentences(long)) expect(piece.length).toBeLessThanOrEqual(220);
  });

  it("marks the end of each numbered step so a guided session can wait there", () => {
    const segments = buildSegments(
      [
        { text: "Salad", kind: "heading" },
        { text: "Wash the vegetables well. Dry them with a towel.", kind: "step" },
        { text: "Cut the tomatoes.", kind: "step" },
      ],
      "en",
    );
    expect(segments[0].text).toBe("Salad.");
    expect(segments.filter((segment) => segment.endsStep).map((segment) => segment.text)).toEqual(["Dry them with a towel.", "Cut the tomatoes."]);
    expect(segments[1].pauseMs).toBeLessThan(segments[2].pauseMs);
  });
});

describe("saved voice choice", () => {
  it("survives a round trip and ignores bad values", () => {
    const prefs = parseVoicePrefs(serializeVoicePrefs({ rate: 1.1, voices: { en: "Ava (Premium)" }, stepWait: null, tone: "soft", volume: 0.6 }));
    expect(prefs).toEqual({ rate: 1.1, voices: { en: "Ava (Premium)" }, stepWait: null, tone: "soft", volume: 0.6 });
    expect(parseVoicePrefs("{not json").rate).toBe(0.95);
    expect(parseVoicePrefs(JSON.stringify({ rate: 9, voices: { xx: "a", en: 5 }, stepWait: 7 }))).toEqual({ rate: 1.5, voices: {}, stepWait: 0, tone: "soft", volume: 1 });
    // Older saved settings have no volume: full volume. Silence is never stored by accident.
    expect(parseVoicePrefs(JSON.stringify({ volume: 0 })).volume).toBe(0.2);
  });
});

describe("voice type", () => {
  // What Chrome on Windows offers on the device itself: David is the system default.
  const WINDOWS = [
    { name: "Microsoft David - English (United States)", lang: "en-US", localService: true, default: true },
    { name: "Microsoft Mark - English (United States)", lang: "en-US", localService: true },
    { name: "Microsoft Zira - English (United States)", lang: "en-US", localService: true },
    { name: "Microsoft Pavel - Russian (Russia)", lang: "ru-RU", localService: true },
    { name: "Microsoft Irina - Russian (Russia)", lang: "ru-RU", localService: true },
    { name: "Google UK English Male", lang: "en-GB", localService: false },
    { name: "Google UK English Female", lang: "en-GB", localService: false },
  ];

  it("guesses female and male voices from their names", () => {
    expect(voiceTone({ name: "Microsoft Zira - English (United States)" })).toBe("soft");
    expect(voiceTone({ name: "Microsoft David - English (United States)" })).toBe("deep");
    expect(voiceTone({ name: "Google UK English Male" })).toBe("deep");
    expect(voiceTone({ name: "Google UK English Female" })).toBe("soft");
    expect(voiceTone({ name: "Google русский" })).toBe("soft");
    expect(voiceTone({ name: "Microsoft Polina Online (Natural) - Ukrainian (Ukraine)" })).toBe("soft");
    expect(voiceTone({ name: "Microsoft Ostap Online (Natural) - Ukrainian (Ukraine)" })).toBe("deep");
    expect(voiceTone({ name: "Basic English" })).toBeNull();
  });

  it("picks a soft female voice by default, even over the system's male default", () => {
    const local = WINDOWS.filter((voice) => voice.localService);
    expect(chooseVoice(local, "en")?.name).toContain("Zira");
    expect(chooseVoice(local, "ru")?.name).toContain("Irina");
    expect(chooseVoice(WINDOWS, "en")?.name).toBe("Google UK English Female");
  });

  it("follows the chosen voice type, and a voice chosen by name still wins", () => {
    expect(chooseVoice(WINDOWS, "ru", null, "deep")?.name).toContain("Pavel");
    expect(rankVoices(WINDOWS, "en", "any").length).toBe(5);
    expect(chooseVoice(WINDOWS, "en", "Microsoft David - English (United States)")?.name).toContain("David");
  });

  it("saves the voice type and falls back to soft", () => {
    expect(parseVoicePrefs(null).tone).toBe("soft");
    expect(parseVoicePrefs('{"tone":"deep"}').tone).toBe("deep");
    expect(parseVoicePrefs('{"tone":"loud"}').tone).toBe("soft");
    expect(parseVoicePrefs(serializeVoicePrefs({ ...parseVoicePrefs(null), tone: "any" })).tone).toBe("any");
  });
});
