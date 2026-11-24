"use client";

import Link from "next/link";
import { useT } from "@/components/locale-provider";
import { LoadingState } from "@/components/sources";
import { courseStyle } from "@/components/growth-academy/course-cover";
import { AcademyLinks, AcademyNote, formatDay, formatDuration, ProgressBar, SaveNote, useAcademyReady, useToday } from "@/components/growth-academy/shared";
import { allAchievements } from "@/lib/growth-academy/achievements";
import { challengeById } from "@/lib/growth-academy/challenges";
import { ACADEMY_BASE, coursePath, GROWTH_COURSES, lessonById, lessonPath, summaryPath } from "@/lib/growth-academy/catalog";
import { clearSavedText, courseProgress, journeySummary, lessonStatus, savedEntries, type HistoryEntry } from "@/lib/growth-academy/progress";
import { commitAcademy } from "@/lib/growth-academy/store";
import type { Translate } from "@/lib/i18n/translate";

/** My Growth Journey: every course, completed lessons, achievements, history, saved reflections, and Continue shortcuts. */
export function JourneyView() {
  const t = useT();
  const today = useToday();
  const { ready, academy, locale } = useAcademyReady();
  if (!ready) return <LoadingState label={t("Loading your learning record…")} />;

  const state = academy.state;
  const summary = journeySummary(state, GROWTH_COURSES, today);
  const achievements = allAchievements(GROWTH_COURSES);
  const saved = savedEntries(state, GROWTH_COURSES);

  return (
    <div className="ga stack-lg">
      <AcademyLinks />
      <section className="ga-hero" aria-labelledby="ga-j-title">
        <p className="ga-kicker">{t("Training Academy")}</p>
        <h1 id="ga-j-title">{t("My Growth Journey")}</h1>
        <p className="ga-welcome">{t("Your personal learning record: what you have completed, what you have saved, and where to pick up again.")}</p>
        <dl className="ga-stats">
          <Stat label={t("Lessons completed")} value={summary.lessonsCompleted} />
          <Stat label={t("Courses completed")} value={summary.coursesCompleted} />
          <Stat label={t("Total learning time")} value={formatDuration(t, summary.seconds)} />
          <Stat label={t("Achievements earned")} value={summary.achievements} />
        </dl>
        <div className="ga-row">
          {summary.continueAt ? (
            <Link className="btn btn-primary" href={lessonPath(summary.continueAt.course, summary.continueAt.lesson)}>
              {t("Continue Learning")}
            </Link>
          ) : (
            <Link className="btn btn-primary" href={ACADEMY_BASE}>
              {t("Choose a course")}
            </Link>
          )}
        </div>
      </section>

      <section className="stack" aria-labelledby="ga-j-courses">
        <h2 id="ga-j-courses">{t("Courses")}</h2>
        {GROWTH_COURSES.map((course) => {
          const progress = courseProgress(state, course);
          const done = course.lessons.filter((lesson) => lessonStatus(state, lesson.id) === "completed");
          return (
            <article key={course.id} className="ga-card" style={courseStyle(course)} aria-labelledby={`ga-j-${course.id}`}>
              <div className="ga-section-head">
                <h3 id={`ga-j-${course.id}`}>{t(course.title)}</h3>
                <Link href={coursePath(course)}>{t("Open the course")}</Link>
              </div>
              <ProgressBar completed={progress.completed} total={progress.total} />
              <p className="ga-note">
                {progress.startedOn ? t("Started {date}", { date: formatDay(progress.startedOn, locale) }) : t("Not started yet")}
                {progress.lastOn ? ` · ${t("Last activity {date}", { date: formatDay(progress.lastOn, locale) })}` : ""}
                {progress.completedOn ? ` · ${t("Completed {date}", { date: formatDay(progress.completedOn, locale) })}` : ""}
                {progress.started ? ` · ${t("Exercises done: {done} of {total}", { done: progress.exercisesDone, total: progress.exercisesTotal })}` : ""}
              </p>
              {done.length > 0 ? (
                <details>
                  <summary>{t("Completed lessons ({count})", { count: done.length })}</summary>
                  <ul>
                    {done.map((lesson) => (
                      <li key={lesson.id}>
                        <Link href={lessonPath(course, lesson)}>{t("Lesson {number}: {title}", { number: lesson.number, title: t(lesson.title) })}</Link>
                        {state.lessons[lesson.id]?.completedOn ? ` · ${formatDay(state.lessons[lesson.id]!.completedOn, locale)}` : ""}
                      </li>
                    ))}
                  </ul>
                </details>
              ) : null}
              <div className="ga-row">
                {progress.remaining === 0 ? (
                  <Link className="btn btn-secondary" href={summaryPath(course)}>
                    {t("See your completion summary")}
                  </Link>
                ) : (
                  <Link className="btn btn-secondary" href={lessonPath(course, progress.next)}>
                    {progress.started ? t("Continue with lesson {number}", { number: progress.next.number }) : t("Start lesson 1")}
                  </Link>
                )}
              </div>
            </article>
          );
        })}
      </section>

      <section className="stack" aria-labelledby="achievements" id="achievements-section">
        <h2 id="achievements">{t("Achievements")}</h2>
        <p className="ga-note">{t("Each achievement is given once, when you reach it. Nothing is taken away for a day you miss.")}</p>
        <ul className="ga-awards">
          {achievements.map((item) => {
            const date = state.achievements[item.id];
            return (
              <li key={item.id} className="ga-award" data-earned={Boolean(date)}>
                <span className="ga-award-icon" aria-hidden="true">
                  {date ? "🏅" : "○"}
                </span>
                <h3>{t(item.title)}</h3>
                <p>{t(item.text)}</p>
                <p>{date ? t("Earned {date}", { date: formatDay(date, locale) }) : t("Not yet")}</p>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="ga-card" aria-labelledby="ga-j-history">
        <h2 id="ga-j-history">{t("Learning history")}</h2>
        {state.history.length === 0 ? (
          <p>{t("Nothing here yet. Your lessons, challenges, and achievements will appear here.")}</p>
        ) : (
          <ul className="ga-history">
            {state.history.slice(0, 40).map((entry, index) => (
              <li key={`${entry.date}-${entry.kind}-${entry.lesson}-${entry.ref}-${index}`}>
                <time dateTime={entry.date}>{formatDay(entry.date, locale)}</time>
                <span>{historyText(t, entry)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="ga-card" aria-labelledby="ga-j-saved">
        <h2 id="ga-j-saved">{t("Saved reflections")}</h2>
        <p className="ga-note">{t("Only you can see these. They are saved only when you press Save in a lesson.")}</p>
        {saved.length === 0 ? (
          <p>{t("You have not saved any answers or reflections yet.")}</p>
        ) : (
          saved.map(({ course, lesson, record }) => (
            <details key={lesson.id}>
              <summary>
                {t(course.shortTitle)} · {t("Lesson {number}: {title}", { number: lesson.number, title: t(lesson.title) })}
              </summary>
              <div className="stack">
                {lesson.exercise.fields
                  .filter((field) => record.answers[field.id])
                  .map((field) => (
                    <div key={field.id}>
                      <p>
                        <strong>{field.label}</strong>
                      </p>
                      <p className="ga-saved">{record.answers[field.id]}</p>
                    </div>
                  ))}
                {record.practice.map((text, index) => (
                  <div key={`p-${index}`}>
                    <p>
                      <strong>{t("Practice answer")}</strong>
                    </p>
                    <p className="ga-saved">{text}</p>
                  </div>
                ))}
                {lesson.reflection.map((question, index) =>
                  record.reflections[index] ? (
                    <div key={question}>
                      <p>
                        <strong>{question}</strong>
                      </p>
                      <p className="ga-saved">{record.reflections[index]}</p>
                    </div>
                  ) : null,
                )}
                <div className="ga-row">
                  <Link href={lessonPath(course, lesson)}>{t("Open the lesson")}</Link>
                  <button className="btn btn-secondary" type="button" onClick={() => commitAcademy((s) => clearSavedText(s, lesson.id))}>
                    {t("Delete what I saved for this lesson")}
                  </button>
                </div>
              </div>
            </details>
          ))
        )}
      </section>
      <SaveNote />
      <AcademyNote />
    </div>
  );
}

function historyText(t: Translate, entry: HistoryEntry): string {
  const found = entry.lesson ? lessonById(entry.lesson) : undefined;
  const lessonName = found ? t("Lesson {number}: {title}", { number: found.lesson.number, title: t(found.lesson.title) }) : "";
  const course = GROWTH_COURSES.find((item) => item.id === entry.course);
  switch (entry.kind) {
    case "started-lesson":
      return t("Started {lesson}", { lesson: lessonName });
    case "completed-lesson":
      return t("Completed {lesson}", { lesson: lessonName });
    case "completed-course":
      return t("Completed the course {course}", { course: course ? t(course.title) : "" });
    case "challenge": {
      const challenge = challengeById(entry.ref);
      return t("Daily Growth Challenge: {text}", { text: challenge ? t(challenge.text) : "" });
    }
    case "achievement": {
      const item = allAchievements(GROWTH_COURSES).find((a) => a.id === entry.ref);
      return t("Achievement earned: {name}", { name: item ? t(item.title) : "" });
    }
    default:
      return t("Saved an answer in {lesson}", { lesson: lessonName });
  }
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="ga-stat">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
