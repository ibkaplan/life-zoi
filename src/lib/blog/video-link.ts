/**
 * Short videos are added to Health tips by link only. The video stays on YouTube or Vimeo,
 * so lifeZoi hosts nothing and pays for nothing. A link that is not one of these
 * two players, or does not carry a plain video id, is refused.
 */
export type VideoLink = {
  provider: "youtube" | "vimeo";
  id: string;
  /** Player address for the iframe. YouTube uses its no-cookie domain. */
  embedUrl: string;
  /** The video's own page, for "Watch on …". */
  watchUrl: string;
  /** A still image for the card, when the provider gives one without a request. */
  thumbnailUrl: string | null;
};

const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/;
const VIMEO_ID = /^\d{6,12}$/;

function youtube(id: string | null | undefined): VideoLink | null {
  if (!id || !YOUTUBE_ID.test(id)) return null;
  return {
    provider: "youtube",
    id,
    embedUrl: `https://www.youtube-nocookie.com/embed/${id}`,
    watchUrl: `https://www.youtube.com/watch?v=${id}`,
    thumbnailUrl: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
  };
}

function vimeo(id: string | null | undefined): VideoLink | null {
  if (!id || !VIMEO_ID.test(id)) return null;
  return {
    provider: "vimeo",
    id,
    embedUrl: `https://player.vimeo.com/video/${id}?dnt=1`,
    watchUrl: `https://vimeo.com/${id}`,
    thumbnailUrl: null,
  };
}

/** Reads a YouTube or Vimeo link (watch, share, Shorts, or embed form). Anything else gives null. */
export function parseVideoLink(raw: string): VideoLink | null {
  let url: URL;
  try {
    url = new URL(raw.trim());
  } catch {
    return null;
  }
  if (url.protocol !== "https:") return null;
  const host = url.hostname.toLowerCase().replace(/^www\.|^m\./, "");
  const parts = url.pathname.split("/").filter(Boolean);

  if (host === "youtu.be") return youtube(parts[0]);
  if (host === "youtube.com" || host === "youtube-nocookie.com") {
    if (parts[0] === "watch") return youtube(url.searchParams.get("v"));
    if (parts[0] === "shorts" || parts[0] === "embed" || parts[0] === "live") return youtube(parts[1]);
    return null;
  }
  if (host === "vimeo.com") return vimeo(parts[0]);
  if (host === "player.vimeo.com" && parts[0] === "video") return vimeo(parts[1]);
  return null;
}
