import { describe, expect, it } from "vitest";
import { emptyBreathe, sanitizeBreathe } from "@/lib/breathe/state";
import { isYoutubeId, lengthText, PRACTICE_SAFETY, PRACTICE_VIDEOS, practiceEmbedSrc, practiceThumbnail } from "@/lib/breathe/practice-videos";

const REQUIRED = [
  "Diaphragmatic Breathing",
  "Full Yogic Breathing",
  "Nadi Shodhana",
  "Anulom Vilom",
  "Bhramari",
  "Ujjayi Breathing",
  "Sitali Pranayama",
  "Sitkari Breathing",
  "Sama Vritti",
  "Extended Exhale Breathing",
];

describe("Explore Breathing Practices", () => {
  it("has the ten requested techniques, each once, with distinct videos", () => {
    expect(PRACTICE_VIDEOS).toHaveLength(10);
    for (const name of REQUIRED) expect(PRACTICE_VIDEOS.filter((video) => video.technique.startsWith(name)), name).toHaveLength(1);
    expect(new Set(PRACTICE_VIDEOS.map((video) => video.youtubeId)).size).toBe(10);
    expect(new Set(PRACTICE_VIDEOS.map((video) => video.id)).size).toBe(10);
  });

  it("uses well-formed YouTube IDs and the privacy-enhanced player only for listed videos", () => {
    for (const video of PRACTICE_VIDEOS) {
      expect(isYoutubeId(video.youtubeId), video.id).toBe(true);
      expect(practiceEmbedSrc(video.youtubeId)).toBe(`https://www.youtube-nocookie.com/embed/${video.youtubeId}?autoplay=1&rel=0`);
      expect(practiceThumbnail(video.youtubeId)).toMatch(/^https:\/\/i\.ytimg\.com\/vi\/[\w-]{11}\/hqdefault\.jpg$/);
    }
    expect(practiceEmbedSrc("dQw4w9WgXcQ")).toBeNull();
    expect(practiceEmbedSrc("bad id")).toBeNull();
  });

  it("never states a length without a source", () => {
    for (const video of PRACTICE_VIDEOS) {
      if (video.minutes === null) {
        expect(video.lengthFrom).toBeNull();
        expect(lengthText(video)).toBe("Length shown in the player");
      } else {
        expect(video.lengthFrom).not.toBeNull();
      }
      if (video.lengthFrom === "title") expect(video.title).toContain(String(video.minutes));
    }
  });

  it("gives sitting guidance, a gentle option, and hand steps for the alternate-nostril practices", () => {
    for (const video of PRACTICE_VIDEOS) {
      expect(video.sitting).toMatch(/chair/i);
      expect(video.gentle.length).toBeGreaterThan(20);
      expect(video.summary.length).toBeGreaterThan(20);
    }
    for (const id of ["nadi-shodhana", "anulom-vilom"]) expect(PRACTICE_VIDEOS.find((video) => video.id === id)?.hands?.length).toBeGreaterThan(3);
  });

  it("asks for no breath holding and says it is not treatment", () => {
    const text = PRACTICE_SAFETY.join(" ");
    expect(text).toMatch(/never need to hold your breath/);
    expect(text).toMatch(/dizzy/);
    expect(text).toMatch(/not medical treatment/);
    for (const video of PRACTICE_VIDEOS) expect(`${video.summary} ${video.gentle}`).not.toMatch(/\bhold (your|the) breath for\b/i);
  });
});

describe("breathing guide shape", () => {
  it("defaults to the circle and keeps a saved balloon", () => {
    expect(emptyBreathe().guide).toBe("circle");
    expect(sanitizeBreathe({ guide: "balloon" }).guide).toBe("balloon");
    expect(sanitizeBreathe({ guide: "triangle" }).guide).toBe("circle");
    expect(sanitizeBreathe({}).guide).toBe("circle");
  });
});
