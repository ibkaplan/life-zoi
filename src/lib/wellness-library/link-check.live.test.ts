import { describe, expect, it } from "vitest";
import { VIDEOS } from "@/lib/wellness-library/catalog";
import { checkVideo } from "@/lib/wellness-library/link-check";
import { LIBRARY_VIDEOS } from "@/lib/wellness-library/video-library";

/** Runs only with `npm run check:library`. It makes real network requests. */
const live = process.env.LIFEZOI_LINK_CHECK === "1";

describe.skipIf(!live)("library link check (live)", () => {
  it("reports availability and embedding for every catalog video", async () => {
    const results = [];
    for (const video of VIDEOS) results.push(await checkVideo(video));
    console.table(results);
    expect(results.length).toBe(VIDEOS.length);
  }, 120_000);

  it("reports availability and embedding for every Wellness Library collection video", async () => {
    const results = [];
    for (const video of LIBRARY_VIDEOS) results.push(await checkVideo(video));
    console.table(results);
    expect(results.filter((result) => result.status !== "ok")).toEqual([]);
  }, 300_000);
});
