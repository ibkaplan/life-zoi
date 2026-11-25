import { describe, expect, it } from "vitest";
import { parseVideoLink } from "./video-link";

describe("parseVideoLink", () => {
  it("reads YouTube watch, share, Shorts, and embed links", () => {
    for (const link of [
      "https://www.youtube.com/watch?v=4YOBIEOobCE",
      "https://youtu.be/4YOBIEOobCE",
      "https://m.youtube.com/watch?v=4YOBIEOobCE&t=10",
      "https://www.youtube.com/shorts/4YOBIEOobCE",
      "https://www.youtube-nocookie.com/embed/4YOBIEOobCE",
    ]) {
      const video = parseVideoLink(link);
      expect(video?.provider, link).toBe("youtube");
      expect(video?.embedUrl).toBe("https://www.youtube-nocookie.com/embed/4YOBIEOobCE");
    }
  });

  it("reads Vimeo links without tracking", () => {
    expect(parseVideoLink("https://vimeo.com/76979871")?.embedUrl).toBe("https://player.vimeo.com/video/76979871?dnt=1");
    expect(parseVideoLink("https://player.vimeo.com/video/76979871")?.id).toBe("76979871");
  });

  it("refuses other sites, plain http, and odd ids", () => {
    for (const link of [
      "http://www.youtube.com/watch?v=4YOBIEOobCE",
      "https://example.com/watch?v=4YOBIEOobCE",
      "https://www.youtube.com/watch?v=short",
      "https://www.youtube.com/watch?v=4YOBIEOobCE%22%3E",
      "https://youtube.com.evil.test/watch?v=4YOBIEOobCE",
      "javascript:alert(1)",
      "not a link",
    ]) {
      expect(parseVideoLink(link), link).toBeNull();
    }
  });
});
