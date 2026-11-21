import { describe, expect, it } from "vitest";
import { containsProhibitedClaim } from "@/lib/claims";
import { guideBySlug } from "@/lib/library/guides";
import {
  GUIDE_ANSWERS,
  GUIDE_TOPICS,
  PREPARED_SOURCE,
  answerBlocks,
  answersInTopic,
} from "@/lib/wellness-assistant/guide";

const UNSAFE =
  /stop taking|change (?:your|the) dose|you have (?:diabetes|cancer|hypertension)|prevents (?:disease|cancer|diabetes|heart disease)|guaranteed|lose \d+ (?:pounds|kg)|prescrib|take \d+\s*mg|api[_ -]?key/i;

const EXPECTED: Record<string, string[]> = {
  energy: [
    "Why do I feel tired all the time?",
    "How can I have more energy during the day?",
    "Why do I feel sleepy after eating?",
    "How can I improve my daily routine?",
    "How can I feel more motivated?",
  ],
  weight: [
    "How can I lose weight in a healthy way?",
    "Why am I gaining weight?",
    "How can I reduce sugar cravings?",
    "What should I eat to feel full longer?",
    "How can I avoid overeating?",
  ],
  eating: [
    "What is prediabetes?",
    "How can I keep my blood sugar stable?",
    "What is a balanced meal?",
    "Which foods contain hidden sugar?",
    "Why is fiber important?",
  ],
  sleep: [
    "How can I sleep better?",
    "Why do I wake up during the night?",
    "How can I relax before bedtime?",
    "What can I do to reduce everyday stress?",
  ],
  movement: [
    "How much walking do I need every day?",
    "Is chair yoga beneficial?",
    "How can I improve my balance?",
    "Why is strength training important?",
    "How can I stay active as I age?",
  ],
  brain: [
    "How can I keep my brain active?",
    "What habits support brain health?",
    "Why is social interaction important?",
    "What daily habits support healthy aging?",
  ],
};

describe("wellness assistant question library", () => {
  it("has the six topics in order, each with exactly the requested questions", () => {
    expect(GUIDE_TOPICS.map((topic) => topic.label)).toEqual([
      "Energy & Daily Wellness",
      "Healthy Weight",
      "Healthy Eating & Blood Sugar",
      "Sleep & Relaxation",
      "Movement & Fitness",
      "Brain & Longevity",
    ]);
    for (const topic of GUIDE_TOPICS) {
      expect(answersInTopic(topic.id).map((item) => item.question)).toEqual(EXPECTED[topic.id]);
    }
    expect(GUIDE_ANSWERS).toHaveLength(28);
    expect(new Set(GUIDE_ANSWERS.map((item) => item.id)).size).toBe(28);
  });

  it("gives every question a full, safe answer", () => {
    for (const item of GUIDE_ANSWERS) {
      expect(PREPARED_SOURCE.answerFor(item.id)).toBe(item);
      expect(item.intro.length).toBeGreaterThan(0);
      expect(item.tips.length).toBeGreaterThanOrEqual(4);
      expect(item.example.length).toBeGreaterThan(20);
      expect(item.care).toMatch(/doctor|emergency/i);
      const all = [item.question, ...item.intro, ...item.tips, item.example, item.care].join(" ");
      expect(all.split(/\s+/).length).toBeGreaterThan(110);
      expect(all, item.id).not.toMatch(UNSAFE);
      expect(containsProhibitedClaim(all), item.id).toBe(false);
    }
    expect(PREPARED_SOURCE.answerFor("unknown")).toBeNull();
  });

  it("links only to sections that exist", () => {
    const pages = new Set(["/academy/meals", "/academy/move/resources", "/progress", "/brain-quiz", "/community", "/life-matters", "/emotional-wellness", "/food-labels"]);
    for (const item of GUIDE_ANSWERS) {
      for (const link of item.links) {
        if (link.href.startsWith("/library/guides/")) expect(guideBySlug(link.href.slice(16)), link.href).toBeTruthy();
        else if (link.href.startsWith("/academy/move/resources/categories/")) expect(link.href).toMatch(/categories\/[a-z-]+$/);
        else expect(pages.has(link.href), link.href).toBe(true);
      }
    }
  });

  it("reads aloud exactly the text shown, in screen order", () => {
    const item = GUIDE_ANSWERS[0];
    const blocks = answerBlocks(item);
    expect(blocks.map((block) => block.text)).toEqual([
      item.question,
      ...item.intro,
      "What you can try",
      ...item.tips,
      "Example",
      item.example,
      "When to talk with a doctor",
      item.care,
    ]);
    const shout = answerBlocks(item, (text) => text.toUpperCase());
    expect(shout[0].text).toBe(item.question.toUpperCase());
  });
});
