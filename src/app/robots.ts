import type { MetadataRoute } from "next";
import { SITE_ORIGIN } from "@/lib/site";

/**
 * Crawlers may read the public pages and Health tips; members' pages are closed anyway.
 * Pages still send `noindex` (root layout and X-Robots-Tag) until the owner turns
 * indexing on, so this file alone does not put lifeZoi in search results.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: ["/$", "/blog", "/privacy"], disallow: ["/api/", "/"] }],
    sitemap: `${SITE_ORIGIN}/sitemap.xml`,
  };
}
