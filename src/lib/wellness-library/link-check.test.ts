import { describe, expect, it } from "vitest";
import { checkVideo } from "@/lib/wellness-library/link-check";

function fake(status: number, body: unknown = {}) {
  return (async () => new Response(JSON.stringify(body), { status })) as unknown as typeof fetch;
}

describe("link check", () => {
  const video = { id: "v", originalUrl: "https://www.youtube.com/watch?v=WS9Yzh-XiIs" };
  it("maps oEmbed answers to a status", async () => {
    expect((await checkVideo(video, fake(200, { title: "T", author_name: "NHS" }))).status).toBe("ok");
    expect((await checkVideo(video, fake(401))).status).toBe("embedding-off");
    expect((await checkVideo(video, fake(404))).status).toBe("missing");
    const failing = (async () => {
      throw new Error("offline");
    }) as unknown as typeof fetch;
    expect(await checkVideo(video, failing)).toMatchObject({ status: "error", detail: "offline" });
  });
});
