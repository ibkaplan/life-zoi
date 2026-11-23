import { describe, expect, it } from "vitest";
import { LOCALES } from "@/lib/i18n/config";
import { downloadSize, lengthScaleFor, NEURAL_VOICES, parseNeuralChoice, SHARED_DOWNLOAD_MB, softenEdges } from "./catalog";

describe("natural voices", () => {
  it("has one voice for every site language, from the official Piper voice list", () => {
    for (const lang of LOCALES) {
      const voice = NEURAL_VOICES[lang];
      expect(voice.lang).toBe(lang);
      expect(voice.model).toMatch(/^https:\/\/huggingface\.co\/rhasspy\/piper-voices\/resolve\/main\/.+\.onnx$/);
      expect(voice.config).toBe(`${voice.model}.json`);
      expect(voice.model).toContain(voice.key);
      expect(voice.license.length).toBeGreaterThan(2);
    }
  });

  it("counts the shared pronunciation data only for the first voice", () => {
    expect(downloadSize("uk", 0)).toBe(NEURAL_VOICES.uk.downloadMb + SHARED_DOWNLOAD_MB);
    expect(downloadSize("uk", 1)).toBe(NEURAL_VOICES.uk.downloadMb);
  });

  it("turns the reading speed into a calm Piper length scale", () => {
    expect(lengthScaleFor(1)).toBe(1);
    expect(lengthScaleFor(0.95)).toBe(1.05);
    expect(lengthScaleFor(1.25)).toBe(0.8);
    expect(lengthScaleFor(0.1)).toBe(1.6);
    expect(lengthScaleFor(Number.NaN)).toBe(1);
  });

  it("reads back only languages that were turned on", () => {
    expect(parseNeuralChoice('{"ru":true,"en":false,"xx":true}')).toEqual({ ru: true });
    expect(parseNeuralChoice("{oops")).toEqual({});
    expect(parseNeuralChoice(null)).toEqual({});
  });

  it("fades the first and last few milliseconds so sentences do not click", () => {
    const pcm = softenEdges(new Float32Array(1000).fill(1), 16000);
    expect(pcm[0]).toBe(0);
    expect(pcm[pcm.length - 1]).toBe(0);
    expect(pcm[500]).toBe(1);
  });
});
