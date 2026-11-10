"use client";

import Link from "next/link";
import { useT } from "@/components/locale-provider";
import { LibraryArt } from "@/components/library/art";
import { LessonCompletion, MissionCard } from "@/components/library/session-tools";
import { LIBRARY_DISCLAIMER } from "@/lib/library/catalog";
import { dailyLessons, lessonBySlug } from "@/lib/library/lessons";

export function LessonsIndex() {
  const t = useT();
  return (
    <div className="library stack-lg">
      <p className="kicker">{t("Health Library")}</p>
      <h1>{t("Daily lessons")}</h1>
      <p className="lede">{t("Short lessons, about two to five minutes. One optional mission. A day you skip is still a fine day.")}</p>
      <MissionCard />
      <div className="stack">
        {dailyLessons.map((lesson) => (
          <Link key={lesson.slug} className="card learn-link" href={`/library/lessons/${lesson.slug}`}>
            <h2>{t(lesson.title)}</h2>
            <p>{t(lesson.minutes)}</p>
          </Link>
        ))}
      </div>
      <p>
        <Link href="/library/moments">{t("Having a hard moment?")}</Link>
      </p>
    </div>
  );
}

export function LessonView({ slug }: { slug: string }) {
  const t = useT();
  const lesson = lessonBySlug(slug);
  if (!lesson) return null;
  return (
    <article className="library library-sheet stack-lg">
      <p className="kicker">
        {t("Daily lesson")} · {t(lesson.minutes)}
      </p>
      <h1>{t(lesson.title)}</h1>
      <LibraryArt name={lesson.art} label={t("Illustration for {title}", { title: t(lesson.title) })} />
      {lesson.explanation.map((paragraph) => (
        <p key={paragraph}>{t(paragraph)}</p>
      ))}
      <section className="card stack">
        <h2>{t("One action")}</h2>
        <p>{t(lesson.action)}</p>
      </section>
      <section className="card stack">
        <h2>{t("One reflection")}</h2>
        <p>{t(lesson.reflection)}</p>
      </section>
      <LessonCompletion slug={lesson.slug} />
      <ul>
        {lesson.related.map((link) => (
          <li key={link.href}>
            <Link href={link.href}>{t(link.label)}</Link>
          </li>
        ))}
      </ul>
      <p className="library-disclaimer">{t(LIBRARY_DISCLAIMER)}</p>
    </article>
  );
}
