import type { Metadata } from "next";
import { ArticlePage } from "@/components/encyclopedia/pages-view";
import { BUILT_IN_ARTICLES } from "@/lib/encyclopedia/articles";

export async function generateMetadata({ params }: PageProps<"/encyclopedia/articles/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const article = BUILT_IN_ARTICLES.find((item) => item.slug === slug);
  return { title: article?.title ?? "Health Encyclopedia", description: article?.summary ?? "A LifeZoi Health Encyclopedia article." };
}

/** Built-in and editor-published articles both open here; the page looks the slug up in the browser. */
export default async function EncyclopediaArticlePage({ params }: PageProps<"/encyclopedia/articles/[slug]">) {
  const { slug } = await params;
  return <ArticlePage slug={slug} />;
}
