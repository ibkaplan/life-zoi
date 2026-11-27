import type { MetadataRoute } from "next";
import { sitemapEntries } from "@/lib/blog/seo";

/** Public pages only. Members' pages are never listed. */
export default function sitemap(): MetadataRoute.Sitemap {
  return sitemapEntries();
}
