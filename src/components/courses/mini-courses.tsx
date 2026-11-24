"use client";

import "@/components/courses/courses.css";
import Link from "next/link";
import { useState } from "react";
import { useT } from "@/components/locale-provider";
import { useSession } from "@/components/session-provider";
import { LoadingState } from "@/components/sources";
import { commitCompanion, useCompanion } from "@/lib/companion/store";
import type { CompanionState } from "@/lib/companion/state";
import {
  COURSE_DAYS,
  COURSE_NOTE,
  COURSES,
  courseById,
  markDay,
  pauseCourse,
  restartCourse,
  startCourse,
  summarize,
  type Course,
  type CourseId,
  type CoursesState,
} from "@/lib/courses/courses";
import { localISODate } from "@/lib/dates";
import type { Translate } from "@/lib/i18n/translate";

const ICONS: Record<CourseId, string> = {
  "calm-breathing": "🌬️",
  "gentle-movement": "🚶",
  "rest-and-calm": "🎵",
};

function Dots({ course, done, t }: { course: Course; done: Set<number>; t: Translate }) {
  return (
    <ol className="mc-dots" aria-label={t("Days of {course}", { course: t(course.title) })}>
      {course.days.map((item) => (
        <li
          key={item.day}
          className="mc-dot"
          data-done={done.has(item.day)}
          aria-label={done.has(item.day) ? t("Day {day}: done", { day: item.day }) : t("Day {day}: still ahead", { day: item.day })}
        >
          {item.day}
        </li>
      ))}
    </ol>
  );
}

/**
 * 7-day mini-courses. `variant="dashboard"` shows the course in progress with
 * today's practice, or the courses to choose from. `variant="page"` is /courses,
 * with every day of every course. Progress is saved with the rest of the
 * companion state; nothing is sent to an AI or any outside service.
 */
export function MiniCourses({ variant }: { variant: "dashboard" | "page" }) {
  const { ready, sample } = useSession();
  const companion = useCompanion();
  const t = useT();
  const [notSaved, setNotSaved] = useState(false);
  const [justMarked, setJustMarked] = useState<number | null>(null);

  if (!ready || !companion.ready) return <LoadingState label={t("Loading mini-courses…")} />;

  const today = localISODate();
  const courses = companion.state.courses;
  const save = (change: (state: CoursesState) => CoursesState) => {
    const ok = commitCompanion((state: CompanionState) => ({ ...state, courses: change(state.courses) }));
    setNotSaved(!ok);
    return ok;
  };
  const current = courses.current ? courseById(courses.current) : undefined;
  const sampleNote =
    notSaved && sample ? (
      <p className="mc-note" role="status">
        {t("The sample is on, so nothing is saved.")}
      </p>
    ) : null;

  if (variant === "dashboard") {
    return (
      <section className="mc stack" aria-labelledby="mc-title">
        <div className="mc-head">
          <p className="mc-kicker">{t("7-day mini-courses")}</p>
          <h2 id="mc-title">{current ? t(current.title) : t("Try a gentle 7-day mini-course")}</h2>
          {current ? null : (
            <p>{t("One short practice a day for a week. Go at your own pace: there is no deadline, and you can pause any time.")}</p>
          )}
        </div>
        {current ? (
          <CurrentCourse
            course={current}
            courses={courses}
            today={today}
            t={t}
            justMarked={justMarked}
            onMark={(day) => {
              if (save((state) => markDay(state, current.id, day, today, true))) setJustMarked(day);
            }}
            onPause={() => {
              setJustMarked(null);
              save(pauseCourse);
            }}
            onRestart={() => {
              setJustMarked(null);
              save((state) => restartCourse(state, current.id, today));
            }}
          />
        ) : (
          <div className="mc-grid">
            {COURSES.map((course) => (
              <CourseChoice key={course.id} course={course} courses={courses} today={today} t={t} onStart={() => save((state) => startCourse(state, course.id, today))} />
            ))}
          </div>
        )}
        {sampleNote}
        <p className="mc-note">
          {t(COURSE_NOTE)} <Link href="/courses">{t("See every day of every course")}</Link>
        </p>
      </section>
    );
  }

  return (
    <div className="mc stack-lg">
      <section className="mc-head">
        <p className="mc-kicker">{t("Dashboard")}</p>
        <h1>{t("7-day mini-courses")}</h1>
        <p className="lede">
          {t("One short practice a day for a week. Each day opens a practice that is already in LifeZoi. Go at your own pace: there is no deadline, and a day you skip simply waits for you.")}
        </p>
        <p className="mc-note">{t(COURSE_NOTE)}</p>
      </section>
      {sampleNote}
      {COURSES.map((course) => {
        const progress = courses.progress[course.id];
        const summary = summarize(progress, today);
        const done = new Set((progress?.done ?? []).map((mark) => mark.day));
        const isCurrent = courses.current === course.id;
        return (
          <section key={course.id} id={course.id} className="mc-card" aria-labelledby={`mc-${course.id}`}>
            <div className="mc-head">
              <span className="mc-icon" aria-hidden="true">
                {ICONS[course.id]}
              </span>
              <h2 id={`mc-${course.id}`}>{t(course.title)}</h2>
              <p>{t(course.summary)}</p>
              <p className="mc-care">{t(course.care)}</p>
            </div>
            {progress ? (
              <>
                <Dots course={course} done={done} t={t} />
                <p className="mc-kind">
                  {summary.finished
                    ? t("You finished all 7 days. Well done!")
                    : t("{done} of {total} days done", { done: summary.doneCount, total: COURSE_DAYS })}
                </p>
              </>
            ) : null}
            <div className="mc-actions">
              {!progress ? (
                <button type="button" className="btn btn-primary" onClick={() => save((state) => startCourse(state, course.id, today))}>
                  {t("Start this course")}
                </button>
              ) : isCurrent ? (
                <button type="button" className="btn btn-secondary" onClick={() => save(pauseCourse)}>
                  {t("Pause this course")}
                </button>
              ) : (
                <button type="button" className="btn btn-primary" onClick={() => save((state) => startCourse(state, course.id, today))}>
                  {t("Continue on my dashboard")}
                </button>
              )}
              {progress && summary.doneCount > 0 ? (
                <button type="button" className="btn btn-ghost" onClick={() => save((state) => restartCourse(state, course.id, today))}>
                  {t("Start again from day 1")}
                </button>
              ) : null}
            </div>
            <ol className="mc-days">
              {course.days.map((item) => (
                <li key={item.day} className="mc-day" data-done={done.has(item.day)}>
                  <div className="mc-day-title">
                    <h3>{t("Day {day}: {title}", { day: item.day, title: t(item.title) })}</h3>
                    <span className="mc-minutes">{t("About {minutes} min", { minutes: item.minutes })}</span>
                  </div>
                  <p>{t(item.text)}</p>
                  <div className="mc-link-row">
                    <Link href={item.href}>{t(item.linkLabel)}</Link>
                    <label className="mc-check">
                      <input
                        type="checkbox"
                        checked={done.has(item.day)}
                        onChange={(event) => save((state) => markDay(state, course.id, item.day, today, event.target.checked))}
                      />
                      {t("I did this")}
                    </label>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        );
      })}
      <p>
        <Link href="/dashboard">{t("Back to my Dashboard")}</Link>
      </p>
    </div>
  );
}

function CourseChoice({
  course,
  courses,
  today,
  t,
  onStart,
}: {
  course: Course;
  courses: CoursesState;
  today: string;
  t: Translate;
  onStart: () => void;
}) {
  const progress = courses.progress[course.id];
  const summary = summarize(progress, today);
  return (
    <article className="mc-card mc-choice">
      <span className="mc-icon" aria-hidden="true">
        {ICONS[course.id]}
      </span>
      <h3>{t(course.title)}</h3>
      <p>{t(course.summary)}</p>
      {progress && summary.doneCount > 0 ? (
        <p className="mc-kind">{t("{done} of {total} days done", { done: summary.doneCount, total: COURSE_DAYS })}</p>
      ) : null}
      <div className="mc-actions">
        <button type="button" className="btn btn-primary" onClick={onStart}>
          {progress ? t("Continue this course") : t("Start this course")}
        </button>
      </div>
    </article>
  );
}

function CurrentCourse({
  course,
  courses,
  today,
  t,
  justMarked,
  onMark,
  onPause,
  onRestart,
}: {
  course: Course;
  courses: CoursesState;
  today: string;
  t: Translate;
  justMarked: number | null;
  onMark: (day: number) => void;
  onPause: () => void;
  onRestart: () => void;
}) {
  const progress = courses.progress[course.id];
  const summary = summarize(progress, today);
  const done = new Set((progress?.done ?? []).map((mark) => mark.day));
  const next = summary.nextDay ? course.days[summary.nextDay - 1] : null;
  return (
    <article className="mc-card">
      <Dots course={course} done={done} t={t} />
      <p className="mc-kind">
        {summary.finished
          ? t("You finished all 7 days. Well done!")
          : t("{done} of {total} days done", { done: summary.doneCount, total: COURSE_DAYS })}
      </p>
      {justMarked ? (
        <p className="mc-kind" role="status">
          {t("Nice work. Day {day} is marked done.", { day: justMarked })}{" "}
          {next ? t("The next day is here whenever you are ready. There is no rush.") : null}
        </p>
      ) : summary.doneToday && next ? (
        <p className="mc-note">{t("You already did a practice today. The next one can wait for tomorrow, or go ahead if you feel like it.")}</p>
      ) : null}
      {next ? (
        <div className="mc-today">
          <p className="mc-kicker">{t("Day {day} of 7", { day: next.day })}</p>
          <h3>{t(next.title)}</h3>
          <p>{t(next.text)}</p>
          <p className="mc-minutes">{t("About {minutes} min", { minutes: next.minutes })}</p>
          <p className="mc-care">{t(course.care)}</p>
          <div className="mc-actions">
            <Link className="btn btn-primary" href={next.href}>
              {t(next.linkLabel)}
            </Link>
            <button type="button" className="btn btn-secondary" onClick={() => onMark(next.day)}>
              {t("I did this")}
            </button>
          </div>
        </div>
      ) : (
        <div className="mc-actions">
          <button type="button" className="btn btn-primary" onClick={onPause}>
            {t("Choose another course")}
          </button>
          <button type="button" className="btn btn-secondary" onClick={onRestart}>
            {t("Do this course again")}
          </button>
        </div>
      )}
      <div className="mc-link-row">
        <Link href={`/courses#${course.id}`}>{t("See all 7 days")}</Link>
        {next ? (
          <button type="button" className="btn btn-ghost" onClick={onPause}>
            {t("Pause and choose another course")}
          </button>
        ) : null}
      </div>
    </article>
  );
}
