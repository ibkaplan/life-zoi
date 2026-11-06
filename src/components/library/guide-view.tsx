import Link from "next/link";
import { ShareBar } from "@/components/library/share-bar";
import { LIBRARY_BRAND, LIBRARY_DISCLAIMER } from "@/lib/library/catalog";
import { guideBySlug } from "@/lib/library/guides";

export function GuideView({ slug }: { slug: string }) {
  const guide = guideBySlug(slug);
  if (!guide) return null;
  return (
    <article className="library library-sheet stack-lg">
      <p className="kicker">Health Library · {guide.minutes}</p>
      <h1>{guide.title}</h1>
      <p className="lede">{guide.summary}</p>
      <p className="library-brand-ink">{LIBRARY_BRAND}</p>
      <ShareBar title={guide.title} path={`/library/guides/${guide.slug}`} pdfHref={guide.pdfFile} />
      {guide.sections.map((section) => (
        <section key={section.heading} id={section.id} className="stack">
          <h2>{section.heading}</h2>
          {section.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
          {section.bullets && section.bullets.length > 0 ? (
            <ul>
              {section.bullets.map((bullet) => (
                <li key={bullet}>{bullet}</li>
              ))}
            </ul>
          ) : null}
        </section>
      ))}
      <aside className="card stack">
        <h2>Related pages</h2>
        <ul>
          {guide.related.map((link) => (
            <li key={link.href}>
              {link.href.startsWith("http") ? (
                <a href={link.href} target="_blank" rel="noopener noreferrer">
                  {link.label}
                </a>
              ) : (
                <Link href={link.href}>{link.label}</Link>
              )}
            </li>
          ))}
        </ul>
      </aside>
      <p className="library-disclaimer">{LIBRARY_DISCLAIMER}</p>
      <p className="no-print">
        <Link href="/library">Back to the library</Link>
      </p>
    </article>
  );
}
