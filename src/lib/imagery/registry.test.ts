import { existsSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { DAILY_PHOTOS, PHOTOS, TOPICS, needsAttribution, type Photo } from "./registry";

const ROOT = join(__dirname, "..", "..", "..");
const entries = Object.entries(PHOTOS) as [string, Photo][];

/** Width and height from a WebP file header (VP8, VP8L or VP8X). */
function webpSize(file: string): { width: number; height: number } {
  const b = readFileSync(file);
  const kind = b.toString("ascii", 12, 16);
  if (kind === "VP8X") return { width: 1 + b.readUIntLE(24, 3), height: 1 + b.readUIntLE(27, 3) };
  if (kind === "VP8L") {
    const bits = b.readUInt32LE(21);
    return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
  }
  return { width: b.readUInt16LE(26) & 0x3fff, height: b.readUInt16LE(28) & 0x3fff };
}

describe("imagery registry", () => {
  it("stores every photo locally with the size the registry states", () => {
    for (const [id, item] of entries) {
      const file = join(ROOT, "public", item.src);
      expect(existsSync(file), id).toBe(true);
      expect(webpSize(file), id).toEqual({ width: item.width, height: item.height });
      // Modest files: none over 200 KB.
      expect(statSync(file).size, id).toBeLessThan(200 * 1024);
    }
  });

  it("never uses the same file or the same source photo twice", () => {
    const srcs = entries.map(([, item]) => item.src);
    const sources = entries.map(([, item]) => item.credit.source);
    expect(new Set(srcs).size).toBe(srcs.length);
    expect(new Set(sources).size).toBe(sources.length);
  });

  it("records an author, a license and a source page for every photo", () => {
    for (const [id, item] of entries) {
      expect(item.credit.author.trim(), id).not.toBe("");
      expect(item.credit.source, id).toMatch(/^https:\/\/commons\.wikimedia\.org\/wiki\/File:/);
      expect(item.alt.trim().length, id).toBeGreaterThan(20);
    }
  });

  it("lists every photo in docs/IMAGE_CREDITS.md", () => {
    const doc = readFileSync(join(ROOT, "docs", "IMAGE_CREDITS.md"), "utf8");
    for (const [id, item] of entries) {
      expect(doc, id).toContain(item.src);
      expect(doc, id).toContain(item.credit.license);
    }
  });

  it("shows adults of many ages, not only older people", () => {
    const people = entries.map(([, item]) => item.ages).filter((age) => age !== "none");
    const younger = people.filter((age) => age === "30s" || age === "40s" || age === "50s").length;
    const older = people.filter((age) => age === "60s" || age === "70s+").length;
    expect(younger).toBeGreaterThanOrEqual(4);
    expect(older).toBeGreaterThanOrEqual(4);
    expect(people.filter((age) => age === "mixed").length).toBeGreaterThanOrEqual(1);
  });

  it("gives each of the seven topics its own photo and an existing page", () => {
    expect(TOPICS.map((topic) => topic.id)).toEqual(["energy", "nutrition", "movement", "sleep", "brain", "heart", "longevity"]);
    const used = TOPICS.map((topic) => topic.photo);
    expect(new Set(used).size).toBe(used.length);
    for (const topic of TOPICS) {
      const page = join(ROOT, "src", "app", "(members)", ...topic.href.split("/").filter(Boolean), "page.tsx");
      expect(existsSync(page), topic.href).toBe(true);
    }
  });

  it("knows which licenses need a visible credit", () => {
    expect(needsAttribution("CC0")).toBe(false);
    expect(needsAttribution("Public domain")).toBe(false);
    expect(needsAttribution("CC BY 2.0")).toBe(true);
    expect(needsAttribution("CC BY-SA 4.0")).toBe(true);
  });

  it("points the LifeZoi Daily images at registered photos", () => {
    for (const id of Object.values(DAILY_PHOTOS)) expect(PHOTOS[id]).toBeDefined();
  });
});
