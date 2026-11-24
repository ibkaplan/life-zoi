"use client";

import Link from "next/link";
import { useT } from "@/components/locale-provider";
import { LoadingState } from "@/components/sources";
import { CourseCover, courseStyle } from "@/components/growth-academy/course-cover";
import { AcademyLinks, AcademyNote, formatDay, ProgressBar, SaveNote, StatusBadge, useAcademyReady } from "@/components/growth-academy/shared";
import { courseMinutes, DIFFICULTY_LABEL, GROWTH_COURSES, growthCourse, lessonPath, summaryPath, coursePath } from "@/lib/growth-academy/catalog";
import { courseProgress, lessonStatus } from "@/lib/growth-academy/progress";

/** One course: what it teaches, its progress, and all its lessons with Start, Continue, or Review. */
export function CourseView({ courseId }: { courseId: string }) {
  const t = useT();
  const { ready, academy, locale } = useAcademyReady();
  const course = growthCourse(courseId);
  if (!course) return null;
  if (!ready) return <LoadingState label={t("Loading your learning record…")} />;

  const state = academy.state;
  const progress = courseProgress(state, course);
  const complete = progress.completed === progress.total;
  const others = GROWTH_COURSES.filter((item) => item.id !== course.id && courseProgress(state, item).remaining > 0);

  return (
    <div className="ga stack-lg" style={courseStyle(course)}>
      <AcademyLinks />
      <section className="ga-course-card" aria-labelledby="ga-course-title">
        <CourseCover course={course} />
        <div className="ga-course-body">
          <p className="ga-kicker">{t("Training Academy")}</p>
          <h1 id="ga-course-title">{t(course.title)}</h1>
          <p className="ga-tagline">{t(course.tagline)}</p>
          <p>{t(course.description)}</p>
          <ul className="ga-meta">
            <li>{t(DIFFICULTY_LABEL[course.difficulty])}</li>
            <li>{t("{count} lessons", { count: course.lessons.length })}</li>
            <li>{t("About {minutes} min in all", { minutes: courseMinutes(course) })}</li>
          </ul>
          <ProgressBar completed={progress.completed} total={progress.total} />
          {progress.startedOn ? (
            <p className="ga-note">
              {t("Started {date}", { date: formatDay(progress.startedOn, locale) })}
              {progress.lastOn ? ` · ${t("Last activity {date}", { date: formatDay(progress.lastOn, locale) })}` : ""}
              {progress.completedOn ? ` · ${t("Completed {date}", { date: formatDay(progress.completedOn, locale) })}` : ""}
            </p>
          ) : null}
          <div className="ga-row">
            {complete ? (
              <Link className="btn btn-primary" href={summaryPath(course)}>
                {t("See your completion summary")}
              </Link>
            ) : (
              <Link className="btn btn-primary" href={lessonPath(course, progress.next)}>
                {progress.started ? t("Continue with lesson {number}", { number: progress.next.number }) : t("Start lesson 1")}
              </Link>
            )}
          </div>
        </div>
      </section>

      {complete ? (
        <section className="ga-celebrate" aria-labelledby="ga-done">
          <h2 id="ga-done">🎉 {t("Congratulations! You completed {course}.", { course: t(course.title) })}</h2>
          <p>{t("Achievement earned: {name}", { name: t(course.achievement.title) })}</p>
          {others.length > 0 ? (
            <p>
              {t("Ready for more? Try {course} next.", { course: t(others[0]!.shortTitle) })} <Link href={coursePath(others[0]!)}>{t("Open the course")}</Link>
            </p>
          ) : null}
        </section>
      ) : null}

      <section className="ga-card" aria-labelledby="ga-goal">
        <h2 id="ga-goal">{t("What you will learn")}</h2>
        <p>{t(course.goal)}</p>
        <ul>
          {course.objectives.map((item) => (
            <li key={item}>{t(item)}</li>
          ))}
        </ul>
        <p className="ga-note">{t("A lesson counts as completed only when you press Complete lesson at the end. Opening it is not enough, so your progress always reflects what you actually did.")}</p>
      </section>

      <section className="stack" aria-labelledby="ga-lessons">
        <h2 id="ga-lessons">{t("Lessons")}</h2>
        <ol className="ga-lessons">
          {course.lessons.map((lesson) => {
            const status = lessonStatus(state, lesson.id);
            const isNext = !complete && progress.next.id === lesson.id;
            return (
              <li key={lesson.id} className="ga-lesson-item" data-status={status} data-current={isNext}>
                <span className="ga-num" aria-hidden="true">
                  {status === "completed" ? "✓" : lesson.number}
                </span>
                <div className="ga-lesson-text">
                  <h3>{t("Lesson {number}: {title}", { number: lesson.number, title: t(lesson.title) })}</h3>
                  <p>{t(lesson.skill)}</p>
                  <div className="ga-row">
                    <StatusBadge status={status} />
                    <span className="ga-note">{t("About {minutes} min", { minutes: lesson.minutes })}</span>
                    {state.lessons[lesson.id]?.exerciseDone ? <span className="ga-note">✓ {t("Exercise done")}</span> : null}
                  </div>
                  <div className="ga-row">
                    <Link className={isNext ? "btn btn-primary" : "btn btn-secondary"} href={lessonPath(course, lesson)}>
                      {status === "completed" ? t("Review") : status === "in-progress" ? t("Continue") : t("Start")}
                    </Link>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </section>
      <SaveNote />
      <AcademyNote />
    </div>
  );
}
