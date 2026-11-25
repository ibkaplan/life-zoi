import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlogArticleView } from "@/components/blog/blog-views";
import { articleBySlug, BLOG_ARTICLES } from "@/lib/blog/articles";
import { articleJsonLd } from "@/lib/blog/seo";
import { SITE_ORIGIN } from "@/lib/site";

export function generateStaticParams() {
  return BLOG_ARTICLES.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const article = articleBySlug(slug);
  if (!article) return {};
  const url = `${SITE_ORIGIN}/blog/${article.slug}`;
  return {
    metadataBase: new URL(SITE_ORIGIN),
    title: article.title,
    description: article.summary,
    alternates: { canonical: `/blog/${article.slug}` },
    openGraph: {
      type: "article",
      url,
      siteName: "lifeZoi",
      title: article.title,
      description: article.summary,
      publishedTime: article.published,
      images: [{ url: `${SITE_ORIGIN}/home/hero-meadow.webp`, width: 1600, height: 1200 }],
    },
    twitter: { card: "summary_large_image", title: article.title, description: article.summary },
  };
}

/** One public Health tips article. */
export default async function BlogArticlePage({ params }: PageProps<"/blog/[slug]">) {
  const { slug } = await params;
  const article = articleBySlug(slug);
  if (!article) notFound();
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd(article)).replace(/</g, "\\u003c") }}
      />
      <BlogArticleView article={article} />
    </>
  );
}
