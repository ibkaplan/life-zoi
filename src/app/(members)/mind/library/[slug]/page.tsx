import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MindShell } from "@/components/mind/shared";
import { MindArticle } from "@/components/mind/mind-library";
import { articleBySlug } from "@/lib/mind/articles";


export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = articleBySlug(slug);
  return { title: article?.title ?? "Psychology Encyclopedia", description: article?.summary };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = articleBySlug(slug);
  if (!article) notFound();
  return (
    <MindShell translated title={article.title}>
      <MindArticle article={article} />
    </MindShell>
  );
}
