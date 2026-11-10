import { cacheLife } from "next/cache";
import { loadNews, newsIsEmpty } from "@/lib/news/load";
import { NEWS_REFRESH_SECONDS } from "@/lib/news/sources";

/**
 * The server reads the public feeds at most once per refresh window and every
 * visitor shares that copy, so opening the dashboard does not trigger a new
 * request to each newsroom. When every feed fails, the empty answer is kept
 * only briefly so the next visit can try again.
 */
async function cachedNews() {
  "use cache";
  const payload = await loadNews();
  if (newsIsEmpty(payload)) {
    cacheLife({ stale: 60, revalidate: 300, expire: 900 });
  } else {
    cacheLife({ stale: 300, revalidate: NEWS_REFRESH_SECONDS, expire: 24 * 60 * 60 });
  }
  return payload;
}

export async function GET() {
  const payload = await cachedNews();
  const maxAge = newsIsEmpty(payload) ? 300 : NEWS_REFRESH_SECONDS;
  return Response.json(payload, {
    headers: { "Cache-Control": `public, max-age=${Math.min(maxAge, 1800)}, s-maxage=${maxAge}, stale-while-revalidate=600` },
  });
}
