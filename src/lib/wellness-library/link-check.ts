import type { VideoItem } from "@/lib/wellness-library/catalog";

/**
 * Availability and embedding check through YouTube's public oEmbed endpoint.
 * oEmbed answers 200 for a public, embeddable video, 401 when embedding is
 * turned off, and 404 when the video is gone. It needs no API key and makes
 * one request per video. It does not prove the video is free of charge;
 * that stays a person's check.
 */
export type LinkResult = { id: string; status: "ok" | "embedding-off" | "missing" | "error"; detail: string; title?: string };

export async function checkVideo(video: Pick<VideoItem, "id" | "originalUrl">, fetcher: typeof fetch = fetch): Promise<LinkResult> {
  const url = `https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(video.originalUrl)}`;
  try {
    const response = await fetcher(url, { headers: { Accept: "application/json" } });
    if (response.status === 200) {
      const body = (await response.json()) as { title?: unknown; author_name?: unknown };
      return {
        id: video.id,
        status: "ok",
        detail: `Embeddable. Channel: ${typeof body.author_name === "string" ? body.author_name : "unknown"}.`,
        title: typeof body.title === "string" ? body.title : undefined,
      };
    }
    if (response.status === 401 || response.status === 403) return { id: video.id, status: "embedding-off", detail: "The owner does not allow embedding." };
    if (response.status === 404) return { id: video.id, status: "missing", detail: "Video not found or private." };
    return { id: video.id, status: "error", detail: `Unexpected status ${response.status}.` };
  } catch (error) {
    return { id: video.id, status: "error", detail: error instanceof Error ? error.message : "Request failed." };
  }
}
