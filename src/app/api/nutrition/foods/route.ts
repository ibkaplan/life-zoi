import { cacheLife } from "next/cache";
import { requireMember } from "@/lib/auth/require-member";
import { jsonError } from "@/lib/http";
import { isLocale } from "@/lib/i18n/config";
import { msg } from "@/lib/i18n/translate";
import { cleanQuery, searchOnline } from "@/lib/calories/online";

/**
 * Food search in the free online databases. Every member shares one cached answer per
 * name and language, so Open Food Facts sees few requests. Only the food name is sent.
 */
async function cachedSearch(query: string, language: string) {
  "use cache";
  const result = await searchOnline(query.toLowerCase(), language);
  if (result.answered.length === 0) cacheLife({ stale: 30, revalidate: 60, expire: 300 });
  else cacheLife({ stale: 3600, revalidate: 24 * 3600, expire: 7 * 24 * 3600 });
  return result;
}

export async function GET(request: Request) {
  const checked = await requireMember(request);
  if (!checked.ok) return checked.response;
  const url = new URL(request.url);
  const query = cleanQuery(url.searchParams.get("q"));
  if (!query) return jsonError(msg("Type 2 to 60 letters of a food name."), 400);
  const language = url.searchParams.get("lang");
  const result = await cachedSearch(query, isLocale(language) ? language : "en");
  return Response.json(result, { headers: { "Cache-Control": "private, max-age=600" } });
}
