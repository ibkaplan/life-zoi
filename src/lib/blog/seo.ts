import { BLOG_ARTICLES, type BlogArticle } from "@/lib/blog/articles";
import { SITE_ORIGIN } from "@/lib/site";
import { sources } from "@/lib/sources";

/** Public pages worth listing for search engines. Sign-in helpers are left out. */
const LISTED_PAGES = ["/", "/blog", "/privacy"] as const;

export type SitemapEntry = { url: string; lastModified?: string; changeFrequency?: "weekly" | "monthly"; priority?: number };

export function sitemapEntries(): SitemapEntry[] {
  const newest = BLOG_ARTICLES.map((article) => article.published).sort().at(-1);
  return [
    ...LISTED_PAGES.map((path) => ({
      url: `${SITE_ORIGIN}${path === "/" ? "" : path}`,
      changeFrequency: "monthly" as const,
      priority: path === "/" ? 1 : 0.7,
      ...(path === "/blog" && newest ? { lastModified: newest, changeFrequency: "weekly" as const } : {}),
    })),
    ...BLOG_ARTICLES.map((article) => ({
      url: `${SITE_ORIGIN}/blog/${article.slug}`,
      lastModified: article.published,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}

/** schema.org Article data, in English like the page's first render. */
export function articleJsonLd(article: BlogArticle) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.summary,
    datePublished: article.published,
    dateModified: article.published,
    inLanguage: "en",
    mainEntityOfPage: `${SITE_ORIGIN}/blog/${article.slug}`,
    image: `${SITE_ORIGIN}/home/hero-meadow.webp`,
    author: { "@type": "Organization", name: "lifeZoi", url: SITE_ORIGIN },
    publisher: { "@type": "Organization", name: "lifeZoi", url: SITE_ORIGIN },
    citation: article.sourceIds.map((id) => sources[id].url),
  };
}
