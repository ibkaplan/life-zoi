"use client";

import Link from "next/link";
import { useLocale } from "@/components/locale-provider";
import { ShareBar } from "@/components/library/share-bar";
import { LIBRARY_BRAND, LIBRARY_DISCLAIMER } from "@/lib/library/catalog";
import { guideBySlug, type GuideSection, type ShortRecipe } from "@/lib/library/guides";
import type { Translate } from "@/lib/i18n/translate";

/** Recipe sections are built from pieces in English, so they are rebuilt here from the translated pieces. */
function translatedSection(section: GuideSection, recipes: ShortRecipe[], t: Translate): GuideSection {
  const recipe = recipes.find((item) => item.id === section.id);
  if (!recipe) {
    return {
      ...section,
      heading: t(section.heading),
      paragraphs: section.paragraphs.map((paragraph) => t(paragraph)),
      bullets: section.bullets?.map((bullet) => t(bullet)),
    };
  }
  return {
    ...section,
    heading: t(recipe.title),
    paragraphs: [t("Added sugar in this recipe: {amount}. {note}", { amount: t(recipe.addedSugar), note: t(recipe.note) })],
    bullets: [
      ...recipe.ingredients.map((item) => t("Ingredient: {item}", { item: t(item) })),
      ...recipe.steps.map((step, index) => t("Step {number}. {step}", { number: index + 1, step: t(step) })),
    ],
  };
}

export function GuideView({ slug }: { slug: string }) {
  const { t, locale } = useLocale();
  const guide = guideBySlug(slug);
  if (!guide) return null;
  const sections = guide.sections.map((section) => translatedSection(section, guide.recipes ?? [], t));
  return (
    <article className="library library-sheet stack-lg">
      <p className="kicker">
        {t("Health Library")} · {t(guide.minutes)}
      </p>
      <h1>{t(guide.title)}</h1>
      <p className="lede">{t(guide.summary)}</p>
      <p className="library-brand-ink">{t(LIBRARY_BRAND)}</p>
      <ShareBar title={t(guide.title)} path={`/library/guides/${guide.slug}`} pdfHref={guide.pdfFile} />
      {locale !== "en" ? <p className="hint no-print">{t("The PDF file is in English. The page above is the translated version.")}</p> : null}
      {sections.map((section) => (
        <section key={section.id ?? section.heading} id={section.id} className="stack">
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
        <h2>{t("Related pages")}</h2>
        <ul>
          {guide.related.map((link) => (
            <li key={link.href}>
              {link.href.startsWith("http") ? (
                <a href={link.href} target="_blank" rel="noopener noreferrer">
                  {t(link.label)}
                </a>
              ) : (
                <Link href={link.href}>{t(link.label)}</Link>
              )}
            </li>
          ))}
        </ul>
      </aside>
      <p className="library-disclaimer">{t(LIBRARY_DISCLAIMER)}</p>
      <p className="no-print">
        <Link href="/library">{t("Back to the library")}</Link>
      </p>
    </article>
  );
}
