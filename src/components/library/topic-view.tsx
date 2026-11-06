import Link from "next/link";
import { LibraryArt } from "@/components/library/art";
import { LIBRARY_DISCLAIMER, categoryBySlug } from "@/lib/library/catalog";

export function TopicView({ slug }: { slug: string }) {
  const category = categoryBySlug(slug);
  if (!category) return null;
  return (
    <div className="library stack-lg">
      <LibraryArt name={category.art} label={`Illustration for ${category.title}`} />
      <p className="kicker">Health Library</p>
      <h1>{category.title}</h1>
      <p className="lede">{category.description}</p>
      <ul className="stack">
        {category.links.map((link) => (
          <li key={link.href} className="card">
            <Link href={link.href}>{link.label}</Link>
          </li>
        ))}
      </ul>
      <p className="library-disclaimer">{LIBRARY_DISCLAIMER}</p>
      <p>
        <Link href="/library">All categories</Link>
      </p>
    </div>
  );
}
