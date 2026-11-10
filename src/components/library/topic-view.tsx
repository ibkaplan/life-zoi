"use client";

import Link from "next/link";
import { useT } from "@/components/locale-provider";
import { LibraryArt } from "@/components/library/art";
import { LIBRARY_DISCLAIMER, categoryBySlug } from "@/lib/library/catalog";

export function TopicView({ slug }: { slug: string }) {
  const t = useT();
  const category = categoryBySlug(slug);
  if (!category) return null;
  return (
    <div className="library stack-lg">
      <LibraryArt name={category.art} label={t("Illustration for {title}", { title: t(category.title) })} />
      <p className="kicker">{t("Health Library")}</p>
      <h1>{t(category.title)}</h1>
      <p className="lede">{t(category.description)}</p>
      <ul className="stack">
        {category.links.map((link) => (
          <li key={link.href} className="card">
            <Link href={link.href}>{t(link.label)}</Link>
          </li>
        ))}
      </ul>
      <p className="library-disclaimer">{t(LIBRARY_DISCLAIMER)}</p>
      <p>
        <Link href="/library">{t("All categories")}</Link>
      </p>
    </div>
  );
}
