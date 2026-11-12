import { cacheLife } from "next/cache";
import { requireMember } from "@/lib/auth/require-member";
import { loadNews, newsIsEmpty } from "@/lib/news/load";
import { NEWS_REFRESH_SECONDS } from "@/lib/news/sources";

/**
 * The server reads the public feeds at most once per refresh window and every
 * visitor shares that copy, so opening the dashboard does not trigger a new
 * request to each newsroom. Only signed-in members can ask for it, so the
 * browser may keep its own copy but a shared cache may not. When every feed fails, the empty answer is kept
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

export async function GET(request: Request) {
  const checked = await requireMember(request);
  if (!checked.ok) return checked.response;
  const payload = await cachedNews();
  const maxAge = newsIsEmpty(payload) ? 300 : NEWS_REFRESH_SECONDS;
  return Response.json(payload, {
    headers: { "Cache-Control": `private, max-age=${Math.min(maxAge, 1800)}` },
  });
}
