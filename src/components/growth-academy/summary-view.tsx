"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { useT } from "@/components/locale-provider";
import { LoadingState } from "@/components/sources";
import { courseStyle } from "@/components/growth-academy/course-cover";
import { AcademyLinks, formatDay, ProgressBar, useAcademyReady } from "@/components/growth-academy/shared";
import { ACADEMY_NOTE, coursePath, GROWTH_COURSES, growthCourse, lessonPath } from "@/lib/growth-academy/catalog";
import { courseProgress, isCourseComplete, type AcademyState } from "@/lib/growth-academy/progress";
import type { GrowthCourse } from "@/lib/growth-academy/types";
import type { Translate } from "@/lib/i18n/translate";

/**
 * Course completion summary: a certificate-style page that prints or saves as
 * PDF from the browser, and a plain-text download. The name is typed here and
 * is not saved anywhere.
 */
export function SummaryView({ courseId }: { courseId: string }) {
  const t = useT();
  const id = useId();
  const { ready, academy, locale } = useAcademyReady();
  const [name, setName] = useState("");
  const [withNotes, setWithNotes] = useState(false);
  const course = growthCourse(courseId);
  if (!course) return null;
  if (!ready) return <LoadingState label={t("Loading your learning record…")} />;

  const state = academy.state;
  const progress = courseProgress(state, course);
  const complete = isCourseComplete(state, course);
  const next = GROWTH_COURSES.find((item) => item.id !== course.id && courseProgress(state, item).remaining > 0);

  if (!complete) {
    return (
      <div className="ga stack-lg" style={courseStyle(course)}>
        <AcademyLinks />
        <h1>{t("Course completion summary")}</h1>
        <p>{t("Your summary for {course} will be ready when every lesson is completed.", { course: t(course.title) })}</p>
        <ProgressBar completed={progress.completed} total={progress.total} />
        <div className="ga-row">
          <Link className="btn btn-primary" href={lessonPath(course, progress.next)}>
            {t("Continue with lesson {number}", { number: progress.next.number })}
          </Link>
        </div>
      </div>
    );
  }

  const download = () => {
    const text = summaryText(t, course, state, name.trim(), withNotes, locale);
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `lifezoi-${course.id}-summary.txt`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="ga stack-lg" style={courseStyle(course)}>
      <AcademyLinks />
      <section className="ga-card ga-no-print" aria-labelledby="ga-s-opts">
        <h1 id="ga-s-opts">{t("Course completion summary")}</h1>
        <div className="ga-field">
          <label htmlFor={`${id}-name`}>{t("Name to show on the summary (optional, not saved)")}</label>
          <input id={`${id}-name`} type="text" maxLength={80} value={name} onChange={(event) => setName(event.target.value)} />
        </div>
        <label className="ga-check">
          <input type="checkbox" checked={withNotes} onChange={(event) => setWithNotes(event.target.checked)} />
          <span>{t("Include my saved reflections in the download")}</span>
        </label>
        <div className="ga-row">
          <button className="btn btn-primary" type="button" onClick={() => window.print()}>
            {t("Print or save as PDF")}
          </button>
          <button className="btn btn-secondary" type="button" onClick={download}>
            {t("Download as a text file")}
          </button>
        </div>
      </section>

      <section className="ga-certificate" aria-labelledby="ga-cert">
        <p className="ga-kicker">{t("LifeZoi Training Academy")}</p>
        <h2 id="ga-cert">{t("Certificate of completion")}</h2>
        {name.trim() ? <p className="ga-tagline">{name.trim()}</p> : null}
        <p>{t("has completed all {count} lessons of", { count: course.lessons.length })}</p>
        <p className="ga-tagline">{t(course.title)}</p>
        <p>{t("Completed {date}", { date: formatDay(progress.completedOn || state.courses[course.id]?.completedOn || "", locale) })}</p>
        <p>🏅 {t(course.achievement.title)}</p>
        <ol className="ga-lessons-done">
          {course.lessons.map((lesson) => (
            <li key={lesson.id}>{t(lesson.title)}</li>
          ))}
        </ol>
        <p className="ga-note">{t(ACADEMY_NOTE)}</p>
      </section>

      <section className="ga-celebrate ga-no-print">
        <h2>{t("What next?")}</h2>
        {next ? (
          <p>
            {t("Ready for more? Try {course} next.", { course: t(next.shortTitle) })} <Link href={coursePath(next)}>{t("Open the course")}</Link>
          </p>
        ) : (
          <p>{t("You have completed every course in the Academy. You can review any lesson at any time.")}</p>
        )}
      </section>
    </div>
  );
}

export function summaryText(t: Translate, course: GrowthCourse, state: AcademyState, name: string, withNotes: boolean, locale: string): string {
  const lines: string[] = [];
  lines.push(t("LifeZoi Training Academy"), t("Course completion summary"), "");
  if (name) lines.push(name);
  lines.push(t(course.title));
  const done = state.courses[course.id]?.completedOn ?? "";
  if (done) lines.push(t("Completed {date}", { date: formatDay(done, locale) }));
  lines.push(t("Achievement earned: {name}", { name: t(course.achievement.title) }), "");
  for (const lesson of course.lessons) {
    const record = state.lessons[lesson.id];
    lines.push(`${lesson.number}. ${t(lesson.title)}${record?.completedOn ? ` (${formatDay(record.completedOn, locale)})` : ""}`);
    if (withNotes && record) {
      for (const field of lesson.exercise.fields) if (record.answers[field.id]) lines.push(`   ${t(field.label)}: ${record.answers[field.id]}`);
      for (const text of record.practice) lines.push(`   ${t("Practice answer")}: ${text}`);
      lesson.reflection.forEach((question, index) => {
        if (record.reflections[index]) lines.push(`   ${t(question)} ${record.reflections[index]}`);
      });
    }
  }
  lines.push("", t(ACADEMY_NOTE));
  return lines.join("\n");
}
