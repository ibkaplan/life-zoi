import { describe, expect, it } from "vitest";
import { VIDEOS } from "@/lib/wellness-library/catalog";
import { checkVideo } from "@/lib/wellness-library/link-check";

/** Runs only with `npm run check:library`. It makes real network requests. */
const live = process.env.LIFEZOI_LINK_CHECK === "1";

describe.skipIf(!live)("library link check (live)", () => {
  it("reports availability and embedding for every catalog video", async () => {
    const results = [];
    for (const video of VIDEOS) results.push(await checkVideo(video));
    console.table(results);
    expect(results.length).toBe(VIDEOS.length);
  }, 120_000);
});
