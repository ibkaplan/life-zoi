import Link from "next/link";
import { LibraryArt } from "@/components/library/art";
import { LessonCompletion, MissionCard } from "@/components/library/session-tools";
import { LIBRARY_DISCLAIMER } from "@/lib/library/catalog";
import { dailyLessons, lessonBySlug } from "@/lib/library/lessons";

export function LessonsIndex() {
  return (
    <div className="library stack-lg">
      <p className="kicker">Health Library</p>
      <h1>Daily lessons</h1>
      <p className="lede">Short lessons, about two to five minutes. One optional mission. A day you skip is still a fine day.</p>
      <MissionCard />
      <div className="stack">
        {dailyLessons.map((lesson) => (
          <Link key={lesson.slug} className="card learn-link" href={`/library/lessons/${lesson.slug}`}>
            <h2>{lesson.title}</h2>
            <p>{lesson.minutes}</p>
          </Link>
        ))}
      </div>
      <p>
        <Link href="/library/moments">Having a hard moment?</Link>
      </p>
    </div>
  );
}

export function LessonView({ slug }: { slug: string }) {
  const lesson = lessonBySlug(slug);
  if (!lesson) return null;
  return (
    <article className="library library-sheet stack-lg">
      <p className="kicker">Daily lesson · {lesson.minutes}</p>
      <h1>{lesson.title}</h1>
      <LibraryArt name={lesson.art} label={`Illustration for ${lesson.title}`} />
      {lesson.explanation.map((paragraph) => (
        <p key={paragraph}>{paragraph}</p>
      ))}
      <section className="card stack">
        <h2>One action</h2>
        <p>{lesson.action}</p>
      </section>
      <section className="card stack">
        <h2>One reflection</h2>
        <p>{lesson.reflection}</p>
      </section>
      <LessonCompletion slug={lesson.slug} />
      <ul>
        {lesson.related.map((link) => (
          <li key={link.href}>
            <Link href={link.href}>{link.label}</Link>
          </li>
        ))}
      </ul>
      <p className="library-disclaimer">{LIBRARY_DISCLAIMER}</p>
    </article>
  );
}
