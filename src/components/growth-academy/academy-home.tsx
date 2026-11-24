"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { useT } from "@/components/locale-provider";
import { LoadingState } from "@/components/sources";
import { CourseCover, courseStyle } from "@/components/growth-academy/course-cover";
import {
  AcademyNote,
  AchievementToast,
  formatDay,
  formatDuration,
  ProgressBar,
  SaveNote,
  useAcademyReady,
  useToday,
  VoiceToggle,
} from "@/components/growth-academy/shared";
import { challengeById, challengeFor } from "@/lib/growth-academy/challenges";
import { coursePath, courseMinutes, DIFFICULTY_LABEL, GROWTH_COURSES, JOURNEY_PATH, lessonPath } from "@/lib/growth-academy/catalog";
import { completeChallenge, courseProgress, journeySummary } from "@/lib/growth-academy/progress";
import { commitAcademy } from "@/lib/growth-academy/store";

/** The Training Academy home: welcome, My Learning Journey, five course cards, and the Daily Growth Challenge. */
export function AcademyHome() {
  const t = useT();
  const today = useToday();
  const { ready, sample, academy, locale } = useAcademyReady();
  const [earned, setEarned] = useState<string[]>([]);
  const [notSaved, setNotSaved] = useState(false);
  const closeToast = useCallback(() => setEarned([]), []);

  const hero = (
    <section className="ga-hero" aria-labelledby="ga-title">
      <p className="ga-kicker">{t("Personal Growth & Training Academy")}</p>
      <h1 id="ga-title">{t("LifeZoi Training Academy")}</h1>
      <p className="ga-tagline">{t("Grow Your Confidence. Strengthen Your Mind. Develop Your Potential.")}</p>
      <p className="ga-welcome">
        {t("Welcome to LifeZoi Training Academy! This is your personal space to learn, practice, grow, and discover new strengths. Take each lesson at your own pace. Every small step brings you closer to becoming the person you want to be.")}
      </p>
      <AcademyNote />
    </section>
  );

  if (!ready) {
    return (
      <div className="ga stack-lg">
        {hero}
        <LoadingState label={t("Loading your learning record…")} />
      </div>
    );
  }

  const state = academy.state;
  const summary = journeySummary(state, GROWTH_COURSES, today);
  const challenge = challengeFor(today);
  const doneToday = state.challenges[today] ? challengeById(state.challenges[today] as string) : undefined;
  const first = GROWTH_COURSES[0];
  const continueHref = summary.continueAt ? lessonPath(summary.continueAt.course, summary.continueAt.lesson) : first ? lessonPath(first, first.lessons[0]!) : JOURNEY_PATH;

  return (
    <div className="ga stack-lg">
      {hero}

      <section className="ga-card" aria-labelledby="ga-journey">
        <div className="ga-section-head">
          <h2 id="ga-journey">{t("My Learning Journey")}</h2>
          <Link href={JOURNEY_PATH}>{t("Open My Growth Journey")}</Link>
        </div>
        <dl className="ga-stats">
          <Stat label={t("Courses started")} value={summary.coursesStarted} />
          <Stat label={t("Courses completed")} value={summary.coursesCompleted} />
          <Stat label={t("Lessons completed")} value={summary.lessonsCompleted} />
          <Stat label={t("Lessons remaining")} value={summary.lessonsRemaining} />
          <Stat label={t("Total learning time")} value={formatDuration(t, summary.seconds)} />
          <Stat label={t("Learning days in a row")} value={summary.streak} />
          <Stat label={t("Achievements earned")} value={summary.achievements} />
          <Stat label={t("Last activity")} value={summary.lastOn ? formatDay(summary.lastOn, locale) : t("Not yet")} />
        </dl>
        {summary.continueAt ? (
          <p>
            {t("Next: {course}, lesson {number}: {lesson}", {
              course: t(summary.continueAt.course.shortTitle),
              number: summary.continueAt.lesson.number,
              lesson: t(summary.continueAt.lesson.title),
            })}
          </p>
        ) : (
          <p>{t("Pick any course below to begin. There is no deadline, and a missed day is never counted against you.")}</p>
        )}
        <div className="ga-row">
          <Link className="btn btn-primary" href={continueHref}>
            {summary.continueAt ? t("Continue Learning") : t("Start your first lesson")}
          </Link>
        </div>
        <SaveNote />
      </section>

      <section className="stack" aria-labelledby="ga-courses">
        <h2 id="ga-courses">{t("Courses")}</h2>
        <div className="ga-courses">
          {GROWTH_COURSES.map((course) => {
            const progress = courseProgress(state, course);
            const complete = progress.completed === progress.total;
            return (
              <article key={course.id} className="ga-course-card" style={courseStyle(course)} aria-labelledby={`ga-c-${course.id}`}>
                <CourseCover course={course} />
                <div className="ga-course-body">
                  <h3 id={`ga-c-${course.id}`}>{t(course.title)}</h3>
                  <p>{t(course.description)}</p>
                  <ul className="ga-meta">
                    <li>{t(DIFFICULTY_LABEL[course.difficulty])}</li>
                    <li>{t("{count} lessons", { count: course.lessons.length })}</li>
                    <li>{t("About {minutes} min in all", { minutes: courseMinutes(course) })}</li>
                  </ul>
                  <ProgressBar completed={progress.completed} total={progress.total} />
                  <div className="ga-row">
                    <Link className="btn btn-primary" href={progress.started && !complete ? lessonPath(course, progress.next) : coursePath(course)}>
                      {complete ? t("Review") : progress.started ? t("Continue") : t("Start")}
                    </Link>
                    <Link className="btn btn-secondary" href={coursePath(course)}>
                      {t("See all lessons")}
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="ga-card ga-challenge" aria-labelledby="ga-challenge">
        <p className="ga-kicker">{t("Optional")}</p>
        <h2 id="ga-challenge">{t("Daily Growth Challenge")}</h2>
        <p className="ga-challenge-text">{t(doneToday?.text ?? challenge.text)}</p>
        {doneToday ? (
          <p role="status">✓ {t("Done for today. A new challenge will be here tomorrow.")}</p>
        ) : (
          <div className="ga-row">
            <button
              className="btn btn-primary"
              type="button"
              onClick={() => {
                const got = commitAcademy((s) => completeChallenge(s, challenge.id, { today }), today);
                setNotSaved(got === null);
                if (got) setEarned(got);
              }}
            >
              {t("I did this today")}
            </button>
          </div>
        )}
        <p className="ga-note">
          {t("Challenges are a small extra. They are never needed to complete a lesson or a course. You have done {count} so far.", { count: summary.challengesDone })}
        </p>
        {notSaved && sample ? <p className="ga-note">{t("The sample is on, so nothing is saved.")}</p> : null}
      </section>

      <section className="ga-card" aria-labelledby="ga-voice">
        <h2 id="ga-voice">{t("Listening")}</h2>
        <p>{t("Every lesson has a Listen button for each part, using the same LifeZoi voice as the rest of the app. You can pause, resume, and replay. Turn it off to simply read.")}</p>
        <VoiceToggle />
      </section>

      <AchievementToast ids={earned} onClose={closeToast} />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="ga-stat">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
