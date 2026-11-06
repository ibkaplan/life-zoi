import { describe, expect, it } from "vitest";
import { containsProhibitedClaim } from "@/lib/claims";
import { exerciseApps } from "@/lib/wellness/exercise-resources/apps";
import { categories } from "@/lib/wellness/exercise-resources/categories";
import { isOffered, OFFERED_TIER } from "@/lib/wellness/exercise-resources/copy";
import { guides, requiredGuideSlugs } from "@/lib/wellness/exercise-resources/guides";
import { externalLinks } from "@/lib/wellness/exercise-resources/links";
import { buildGuidePdf, pdfPlainText } from "@/lib/wellness/exercise-resources/pdf";
import { publicExerciseText } from "@/lib/wellness/exercise-resources/public";
import { routines } from "@/lib/wellness/exercise-resources/routines";
import { PERMITTED_EMBEDS, resolvedVideos, youtubeEmbedSrc } from "@/lib/wellness/exercise-resources/videos";

const categoryTitles = [
  "Chair Exercises for Seniors",
  "Chair Yoga",
  "Gentle Stretching",
  "Balance and Stability",
  "Strength for Beginners",
  "Walking and Daily Movement",
  "Hand and Finger Exercises",
  "Feet and Ankle Mobility",
  "Neck and Shoulder Mobility",
  "Breathing and Relaxation",
  "Tai Chi and Gentle Movement",
  "Morning Movement",
];

describe("free exercise resources", () => {
  it("keeps the center free and inside the named categories", () => {
    expect(OFFERED_TIER).toBe("free");
    expect(categories.map((item) => item.title)).toEqual(categoryTitles);
    expect(routines.map((item) => item.title)).toEqual([
      "10-Minute Chair Movement",
      "10-Minute Morning Stretch",
      "Beginner Balance",
      "Hand and Finger",
      "Feet and Ankle",
      "Gentle Strength",
    ]);
    for (const slug of requiredGuideSlugs) {
      const guide = guides.find((item) => item.slug === slug);
      expect(guide?.tier).toBe("free");
      expect(guide?.filename.endsWith(".pdf")).toBe(true);
    }
    expect(guides.find((item) => item.slug === "gentle-strength")?.tier).toBe("free");
    expect(guides.every((item) => isOffered(item.tier))).toBe(true);
    expect(categories.every((item) => item.steps.length > 2 && item.intro.length > 20)).toBe(true);
    expect(routines.every((item) => item.moves.every((move) => move.dose && move.easier))).toBe(true);
  });

  it("stays educational and does not copy the reference-only site", () => {
    const text = publicExerciseText();
    expect(containsProhibitedClaim(text)).toBe(false);
    expect(text).not.toMatch(/aiseniors|live longer|lifespan|we diagnose|this treats/i);
    expect(text).toContain("FREE EXERCISE RESOURCES");
    expect(text).toContain("Explore free exercise videos, printable guides, and simple movement routines to help you stay active at home.");
    expect(text).toContain("LIVE BETTER. MAKE LIFE MATTER.");
    expect(text).toContain("not treatment");
    expect(text).toContain("not a diagnosis");
    expect(text).toContain("not physical therapy");
    expect(text).toContain("at risk of falling");
    expect(text).toContain("qualified professional");
    expect(text).toContain("recent surgery");
    expect(text).toContain("A free download is not the same as fully free functionality.");
    expect(text).toContain("optional paid features");
    expect(text).toContain("lifeZoi does not depend on");
  });

  it("links out over https and embeds only permitted NIA players", () => {
    for (const link of externalLinks) {
      expect(link.url.startsWith("https://")).toBe(true);
      expect(link.source.length).toBeGreaterThan(3);
    }
    const videos = resolvedVideos();
    expect(videos.map((item) => item.group)).toEqual(expect.arrayContaining([
      "chair",
      "balance",
      "strength",
      "stretching",
      "walking",
      "gentle-yoga",
      "healthy-aging",
    ]));
    for (const video of videos) {
      expect(video.url.startsWith("https://")).toBe(true);
      expect(video.title.length).toBeGreaterThan(3);
      expect(video.description.length).toBeGreaterThan(20);
      if (video.embedId) {
        expect(PERMITTED_EMBEDS).toContain(video.embedId);
        expect(video.embedSrc).toBe(`https://www.youtube.com/embed/${video.embedId}`);
        expect(video.url).toContain(video.embedId);
      } else {
        expect(video.embedSrc).toBeNull();
      }
    }
    expect(youtubeEmbedSrc("not-a-real-id")).toBeNull();
    expect(exerciseApps).toHaveLength(1);
    expect(exerciseApps[0]?.linkId).toBe("chair-yoga-fit");
  });

  it("builds a real PDF for every free guide", () => {
    for (const guide of guides) {
      const bytes = buildGuidePdf(guide);
      const raw = new TextDecoder().decode(bytes);
      expect(raw.startsWith("%PDF-1.4")).toBe(true);
      expect(raw).toContain("%%EOF");
      const text = pdfPlainText(bytes);
      expect(text).toContain(guide.title);
      expect(text).toContain("These guides are not treatment.");
      expect(text).toContain("LIVE BETTER. MAKE LIFE MATTER.");
      expect(text).toContain(`https://life-zoi.vercel.app/academy/move/resources/guides/${guide.slug}`);
      expect(text).toContain(guide.safety.slice(0, 40));
    }
  });
});
