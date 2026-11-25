"use client";

import Link from "next/link";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { useT } from "@/components/locale-provider";
import { LoadingState } from "@/components/sources";
import { courseStyle } from "@/components/growth-academy/course-cover";
import { AcademyLinks, AcademyNote, AchievementToast, formatDay, SaveNote, StatusBadge, useAcademyReady, useToday, VoiceToggle } from "@/components/growth-academy/shared";
import { ReadAloud } from "@/components/voice/read-aloud";
import { coursePath, GROWTH_COURSES, growthCourse, growthLesson, JOURNEY_PATH, lessonPath, summaryPath } from "@/lib/growth-academy/catalog";
import { practiceFeedback, type PracticeFeedback } from "@/lib/growth-academy/feedback";
import {
  addSeconds,
  completeLesson,
  countPracticeTry,
  courseProgress,
  isCourseComplete,
  lessonStatus,
  LESSON_PARTS,
  openLesson,
  saveAnswers,
  savePractice,
  saveReflections,
  setExerciseDone,
  setPart,
  TEXT_LIMIT,
} from "@/lib/growth-academy/progress";
import { commitAcademy } from "@/lib/growth-academy/store";
import type { GrowthCourse, GrowthLesson } from "@/lib/growth-academy/types";
import { msg } from "@/lib/i18n/translate";

const PART_NAMES = [
  msg("Introduction"),
  msg("Learn"),
  msg("Real-life example"),
  msg("Exercise"),
  msg("Practice"),
  msg("Reflect"),
  msg("Key takeaways"),
] as const;

type Draft = { answers: Record<string, string>; practice: string; reflections: string[] };

const draftKey = (lessonId: string) => `lifezoi.academy.draft.${lessonId}`;

/** Unsaved typing stays in this tab only (sessionStorage), so leaving a part or the page does not lose it. */
function readDraft(lessonId: string): Draft | null {
  try {
    const raw = window.sessionStorage.getItem(draftKey(lessonId));
    if (!raw) return null;
    const value = JSON.parse(raw) as Partial<Draft>;
    return {
      answers: value.answers && typeof value.answers === "object" ? (value.answers as Record<string, string>) : {},
      practice: typeof value.practice === "string" ? value.practice : "",
      reflections: Array.isArray(value.reflections) ? value.reflections.map(String) : [],
    };
  } catch {
    return null;
  }
}

function writeDraft(lessonId: string, draft: Draft) {
  try {
    window.sessionStorage.setItem(draftKey(lessonId), JSON.stringify(draft));
  } catch {
    // Storage can be blocked. The page still works.
  }
}

/** Counts time with the lesson open and visible, and saves it about once a minute. */
function useLearningTime(lessonId: string, enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    let pending = 0;
    const flush = () => {
      if (pending > 0) commitAcademy((state) => addSeconds(state, lessonId, pending));
      pending = 0;
    };
    const tick = window.setInterval(() => {
      if (document.visibilityState === "visible") pending += 15;
      if (pending >= 60) flush();
    }, 15_000);
    const hide = () => {
      if (document.visibilityState === "hidden") flush();
    };
    document.addEventListener("visibilitychange", hide);
    return () => {
      window.clearInterval(tick);
      document.removeEventListener("visibilitychange", hide);
      flush();
    };
  }, [lessonId, enabled]);
}

export function LessonView({ courseId, number }: { courseId: string; number: number }) {
  const t = useT();
  const today = useToday();
  const { ready, sample, locale } = useAcademyReady();
  const course = growthCourse(courseId);
  const lesson = course ? growthLesson(course, number) : undefined;
  const opened = useRef(false);
  const [earned, setEarned] = useState<string[]>([]);
  const closeToast = useCallback(() => setEarned([]), []);

  // Opening the lesson marks it started (never completed) and makes it the course's current lesson.
  useEffect(() => {
    if (!ready || !course || !lesson || opened.current) return;
    opened.current = true;
    commitAcademy((state) => openLesson(state, course, lesson, { today }), today);
  }, [ready, course, lesson, today]);

  useLearningTime(lesson?.id ?? "", ready && Boolean(lesson) && !sample);

  if (!course || !lesson) return null;
  if (!ready) return <LoadingState label={t("Loading your lesson…")} />;
  return <LessonBody key={lesson.id} course={course} lesson={lesson} today={today} locale={locale} sample={sample} onEarned={setEarned} earned={earned} closeToast={closeToast} />;
}

function LessonBody({
  course,
  lesson,
  today,
  locale,
  sample,
  earned,
  onEarned,
  closeToast,
}: {
  course: GrowthCourse;
  lesson: GrowthLesson;
  today: string;
  locale: string;
  sample: boolean;
  earned: string[];
  onEarned: (ids: string[]) => void;
  closeToast: () => void;
}) {
  const t = useT();
  const { academy } = useAcademyReady();
  const state = academy.state;
  const record = state.lessons[lesson.id];
  const status = lessonStatus(state, lesson.id);
  const [part, setPartState] = useState(() => record?.part ?? 0);
  const [seen, setSeen] = useState<Set<number>>(() => new Set(Array.from({ length: (record?.part ?? 0) + 1 }, (_, i) => i)));
  const [draft, setDraft] = useState<Draft>(() => {
    const saved: Draft = { answers: { ...(record?.answers ?? {}) }, practice: "", reflections: [...(record?.reflections ?? [])] };
    const stored = typeof window === "undefined" ? null : readDraft(lesson.id);
    return stored ? { answers: { ...saved.answers, ...stored.answers }, practice: stored.practice, reflections: lesson.reflection.map((_, i) => stored.reflections[i] || saved.reflections[i] || "") } : saved;
  });
  const [savedMessage, setSavedMessage] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<PracticeFeedback | null>(null);
  const [justCompleted, setJustCompleted] = useState(false);
  const topRef = useRef<HTMLDivElement>(null);
  const clock = { today };

  const updateDraft = (change: (draft: Draft) => Draft) =>
    setDraft((current) => {
      const next = change(current);
      writeDraft(lesson.id, next);
      return next;
    });

  const commit = (change: Parameters<typeof commitAcademy>[0]) => {
    const got = commitAcademy(change, today);
    if (got && got.length) onEarned(got);
    return got !== null;
  };

  const goTo = (index: number) => {
    const next = Math.min(LESSON_PARTS - 1, Math.max(0, index));
    setPartState(next);
    setSeen((current) => new Set(current).add(next));
    commit((s) => setPart(s, course, lesson, next, clock));
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const flash = (key: string, ok: boolean) =>
    setSavedMessage((current) => ({ ...current, [key]: ok ? t("Saved privately to My Growth Journey.") : sample ? t("The sample is on, so nothing is saved.") : t("This could not be saved.") }));

  const showVoice = state.prefs.voice;
  const courseDone = isCourseComplete(state, course);
  const nextLesson = course.lessons.find((item) => item.number > lesson.number);
  const otherCourse = GROWTH_COURSES.find((item) => item.id !== course.id && courseProgress(state, item).remaining > 0);
  const partId = `ga-part-${lesson.id}`;

  // Feedback cue words in the page's language ("cue: …" entries in the catalog); English cues always apply too.
  const cueLookup = (key: string) => {
    const text = t(key);
    return text === key ? undefined : text;
  };

  const listen = (steps = false) =>
    showVoice ? <ReadAloud target={partId} steps={steps} compact label={t("Listen to this part")} /> : null;

  return (
    <div className="ga stack-lg ga-reading" style={courseStyle(course)} ref={topRef}>
      <AcademyLinks>
        <span aria-hidden="true">·</span>
        <Link href={coursePath(course)}>{t(course.shortTitle)}</Link>
      </AcademyLinks>

      <header className="stack">
        <p className="ga-kicker">{t("{course} · Lesson {number} of {total}", { course: t(course.shortTitle), number: lesson.number, total: course.lessons.length })}</p>
        <h1>{t(lesson.title)}</h1>
        <p className="lede">{t(lesson.skill)}</p>
        <div className="ga-row">
          <StatusBadge status={status} />
          <span className="ga-note">{t("About {minutes} min", { minutes: lesson.minutes })}</span>
          {record?.completedOn ? <span className="ga-note">{t("Completed {date}", { date: formatDay(record.completedOn, locale) })}</span> : null}
        </div>
      </header>

      <nav aria-label={t("Lesson parts")}>
        <ol className="ga-steps">
          {PART_NAMES.map((name, index) => (
            <li key={name}>
              <button type="button" aria-current={index === part ? "step" : undefined} data-seen={seen.has(index)} onClick={() => goTo(index)}>
                {index + 1}. {t(name)}
              </button>
            </li>
          ))}
        </ol>
      </nav>

      <p className="ga-note" aria-live="polite">
        {t("Part {number} of {total}: {name}", { number: part + 1, total: LESSON_PARTS, name: t(PART_NAMES[part] as string) })}
      </p>

      {part === 0 ? (
        <section className="ga-part" aria-labelledby="ga-h">
          {listen()}
          <div id={partId} className="ga-part">
            <h2 id="ga-h">{t("Introduction")}</h2>
            {lesson.intro.map((text) => (
              <p key={text}>{t(text)}</p>
            ))}
            {lesson.care ? <p className="ga-care">{t(lesson.care)}</p> : null}
          </div>
        </section>
      ) : null}

      {part === 1 ? (
        <section className="ga-part" aria-labelledby="ga-h">
          {listen()}
          <div id={partId} className="ga-part">
            <h2 id="ga-h">{t("Learn")}</h2>
            {lesson.learn.map((section) => (
              <div key={section.heading} className="ga-part">
                <h3>{t(section.heading)}</h3>
                {section.paragraphs.map((text) => (
                  <p key={text}>{t(text)}</p>
                ))}
                {section.bullets?.length ? (
                  <ul>
                    {section.bullets.map((text) => (
                      <li key={text}>{t(text)}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {part === 2 ? (
        <section className="ga-part" aria-labelledby="ga-h">
          {listen()}
          <div id={partId} className="ga-part">
            <h2 id="ga-h">{t("Real-life example")}</h2>
            <div className="ga-story">
              <h3>{t(lesson.example.title)}</h3>
              {lesson.example.story.map((text) => (
                <p key={text}>{t(text)}</p>
              ))}
            </div>
            <p>
              <strong>{t("What this shows:")}</strong> {t(lesson.example.point)}
            </p>
          </div>
        </section>
      ) : null}

      {part === 3 ? (
        <section className="ga-part" aria-labelledby="ga-h">
          {listen(true)}
          <div id={partId} className="ga-part">
            <h2 id="ga-h">
              {t("Exercise")}: {t(lesson.exercise.title)}
            </h2>
            <p className="ga-note">{t("About {minutes} min", { minutes: lesson.exercise.minutes })}</p>
            <ol>
              {lesson.exercise.steps.map((text) => (
                <li key={text}>{t(text)}</li>
              ))}
            </ol>
          </div>
          {lesson.exercise.timerSeconds ? <Timer seconds={lesson.exercise.timerSeconds} /> : null}
          <div className="ga-part">
            {lesson.exercise.fields.map((field) => (
              <TextField
                key={field.id}
                label={t(field.label)}
                long={field.kind === "long"}
                placeholder={field.placeholder ? t(field.placeholder) : undefined}
                value={draft.answers[field.id] ?? ""}
                onChange={(value) => updateDraft((d) => ({ ...d, answers: { ...d.answers, [field.id]: value } }))}
              />
            ))}
            <div className="ga-row">
              <button className="btn btn-secondary" type="button" onClick={() => flash("exercise", commit((s) => saveAnswers(s, course, lesson, draft.answers, clock)))}>
                {t("Save my answers privately")}
              </button>
            </div>
            {savedMessage.exercise ? <p role="status" className="ga-note">{savedMessage.exercise}</p> : null}
            <label className="ga-check">
              <input type="checkbox" checked={record?.exerciseDone ?? false} onChange={(event) => commit((s) => setExerciseDone(s, course, lesson, event.target.checked, clock))} />
              <span>{t("I did this exercise")}</span>
            </label>
            <p className="ga-note">{t("Your answers are saved only when you press Save. Until then they stay in this browser tab.")}</p>
          </div>
        </section>
      ) : null}

      {part === 4 ? (
        <section className="ga-part" aria-labelledby="ga-h">
          {listen()}
          <div id={partId} className="ga-part">
            <h2 id="ga-h">{t("Practice")}</h2>
            <p className="ga-challenge-text">{t(lesson.practice.prompt)}</p>
          </div>
          <TextField
            label={t("Your answer")}
            long
            value={draft.practice}
            onChange={(value) => {
              setFeedback(null);
              updateDraft((d) => ({ ...d, practice: value }));
            }}
          />
          <details>
            <summary>{t("See example responses")}</summary>
            <div className="ga-examples">
              {lesson.practice.examples.map((example) => (
                <button
                  key={example.text}
                  type="button"
                  className="ga-example"
                  onClick={() => {
                    setFeedback(null);
                    updateDraft((d) => ({ ...d, practice: t(example.text).replace(/^["«“„]|["»”“]$/g, "") }));
                  }}
                >
                  <span>{t(example.text)}</span>
                  <small>{t(example.why)}</small>
                  <small>{t("Use this example")}</small>
                </button>
              ))}
            </div>
          </details>
          <div className="ga-row">
            <button
              className="btn btn-primary"
              type="button"
              onClick={() => {
                setFeedback(practiceFeedback(draft.practice, lesson.practice, cueLookup));
                if (draft.practice.trim()) commit((s) => countPracticeTry(s, course, lesson, clock));
              }}
            >
              {t("Get feedback")}
            </button>
            <button
              className="btn btn-secondary"
              type="button"
              disabled={!draft.practice.trim()}
              onClick={() => flash("practice", commit((s) => savePractice(s, course, lesson, draft.practice, clock)))}
            >
              {t("Save this answer privately")}
            </button>
            <button
              className="btn btn-secondary"
              type="button"
              onClick={() => {
                setFeedback(null);
                updateDraft((d) => ({ ...d, practice: "" }));
              }}
            >
              {t("Practice again")}
            </button>
          </div>
          {savedMessage.practice ? <p role="status" className="ga-note">{savedMessage.practice}</p> : null}
          {feedback ? (
            <div className="ga-feedback" role="status" aria-live="polite">
              <p>{t(feedback.general)}</p>
              {feedback.notes.length ? (
                <ul>
                  {feedback.notes.map((note) => (
                    <li key={note}>{t(note)}</li>
                  ))}
                </ul>
              ) : null}
              <p>
                <strong>{t("You might check:")}</strong>
              </p>
              <ul>
                {lesson.practice.lookFors.map((item) => (
                  <li key={item}>{t(item)}</li>
                ))}
              </ul>
            </div>
          ) : null}
          <p className="ga-note">
            {t("Feedback here is built into LifeZoi: it looks for helpful phrases from this lesson. No AI is used and nothing you type is sent anywhere. There is no right or wrong answer.")}
            {record?.practiceTries ? ` ${t("You have practiced this {count} times.", { count: record.practiceTries })}` : ""}
          </p>
        </section>
      ) : null}

      {part === 5 ? (
        <section className="ga-part" aria-labelledby="ga-h">
          {listen()}
          <div id={partId} className="ga-part">
            <h2 id="ga-h">{t("Reflect")}</h2>
            <p>{t("Take a moment with each question. Writing is optional.")}</p>
            {lesson.reflection.map((question, index) => (
              <TextField
                key={question}
                speak
                label={t(question)}
                long
                value={draft.reflections[index] ?? ""}
                onChange={(value) =>
                  updateDraft((d) => {
                    const reflections = lesson.reflection.map((_, i) => d.reflections[i] ?? "");
                    reflections[index] = value;
                    return { ...d, reflections };
                  })
                }
              />
            ))}
          </div>
          <div className="ga-row">
            <button className="btn btn-secondary" type="button" onClick={() => flash("reflection", commit((s) => saveReflections(s, course, lesson, draft.reflections, clock)))}>
              {t("Save my reflections privately")}
            </button>
          </div>
          {savedMessage.reflection ? <p role="status" className="ga-note">{savedMessage.reflection}</p> : null}
          <p className="ga-note">{t("Reflections are private. They are saved to your account only when you press Save, and you can delete them in My Growth Journey.")}</p>
        </section>
      ) : null}

      {part === 6 ? (
        <section className="ga-part" aria-labelledby="ga-h">
          {listen()}
          <div id={partId} className="ga-part">
            <h2 id="ga-h">{t("Key takeaways")}</h2>
            <ul className="ga-takeaways">
              {lesson.takeaways.map((text) => (
                <li key={text}>{t(text)}</li>
              ))}
            </ul>
          </div>

          {status === "completed" ? (
            <div className="ga-celebrate" role="status">
              <h2>{justCompleted ? `🎉 ${t("Lesson completed. Well done!")}` : `✓ ${t("You completed this lesson.")}`}</h2>
              {courseDone ? (
                <>
                  <p>
                    <strong>{t("Congratulations! You completed {course}.", { course: t(course.title) })}</strong> {t("Achievement earned: {name}", { name: t(course.achievement.title) })}
                  </p>
                  <div className="ga-row">
                    <Link className="btn btn-primary" href={summaryPath(course)}>
                      {t("See your completion summary")}
                    </Link>
                    {otherCourse ? (
                      <Link className="btn btn-secondary" href={coursePath(otherCourse)}>
                        {t("Continue with {course}", { course: t(otherCourse.shortTitle) })}
                      </Link>
                    ) : null}
                  </div>
                </>
              ) : (
                <div className="ga-row">
                  {nextLesson ? (
                    <Link className="btn btn-primary" href={lessonPath(course, nextLesson)}>
                      {t("Next lesson: {title}", { title: t(nextLesson.title) })}
                    </Link>
                  ) : null}
                  <Link className="btn btn-secondary" href={coursePath(course)}>
                    {t("Back to the course")}
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="ga-complete">
              <h2>{t("Complete lesson")}</h2>
              <p>{t("When you have worked through this lesson, mark it as completed. You can always come back to review it.")}</p>
              <div className="ga-row">
                <button
                  className="btn btn-primary"
                  type="button"
                  onClick={() => {
                    if (commit((s) => completeLesson(s, course, lesson, clock))) setJustCompleted(true);
                    else flash("complete", false);
                  }}
                >
                  ✓ {t("Complete lesson")}
                </button>
              </div>
              {savedMessage.complete ? <p className="ga-note">{savedMessage.complete}</p> : null}
            </div>
          )}
        </section>
      ) : null}

      <div className="ga-pager ga-no-print">
        <button className="btn btn-secondary" type="button" disabled={part === 0} onClick={() => goTo(part - 1)}>
          ← {t("Previous")}
        </button>
        {part < LESSON_PARTS - 1 ? (
          <button className="btn btn-primary" type="button" onClick={() => goTo(part + 1)}>
            {t("Next: {name}", { name: t(PART_NAMES[part + 1] as string) })} →
          </button>
        ) : (
          <Link className="btn btn-secondary" href={JOURNEY_PATH}>
            {t("My Growth Journey")}
          </Link>
        )}
      </div>

      <VoiceToggle />
      <SaveNote />
      <AcademyNote />
      <AchievementToast ids={earned} onClose={closeToast} />
    </div>
  );
}

function TextField({ label, value, onChange, long, placeholder, speak }: { label: string; value: string; onChange: (value: string) => void; long?: boolean; placeholder?: string; speak?: boolean }) {
  const id = useId();
  return (
    <div className="ga-field">
      {/* `data-voice-text` lets Listen read a reflection question; the text box itself is never read. */}
      <label htmlFor={id} {...(speak ? { "data-voice-text": "" } : {})}>
        {label}
      </label>
      {long ? (
        <textarea id={id} value={value} maxLength={TEXT_LIMIT} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} />
      ) : (
        <input id={id} type="text" value={value} maxLength={TEXT_LIMIT} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} />
      )}
    </div>
  );
}

/** An optional countdown for timed practices. It makes no sound and records nothing. */
function Timer({ seconds }: { seconds: number }) {
  const t = useT();
  const [left, setLeft] = useState(seconds);
  const [running, setRunning] = useState(false);
  const active = running && left > 0;
  useEffect(() => {
    if (!active) return;
    const timer = window.setInterval(() => setLeft((value) => (value <= 1 ? 0 : value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [active]);
  const mm = Math.floor(left / 60);
  const ss = String(left % 60).padStart(2, "0");
  return (
    <div className="ga-timer" role="group" aria-label={t("Timer")}>
      <output aria-live="off">
        {mm}:{ss}
      </output>
      {active ? (
        <button className="btn btn-secondary" type="button" onClick={() => setRunning(false)}>
          {t("Pause")}
        </button>
      ) : (
        <button className="btn btn-primary" type="button" disabled={left === 0} onClick={() => setRunning(true)}>
          {left === seconds ? t("Start timer") : t("Resume")}
        </button>
      )}
      <button
        className="btn btn-secondary"
        type="button"
        onClick={() => {
          setRunning(false);
          setLeft(seconds);
        }}
      >
        {t("Reset")}
      </button>
      {left === 0 ? <span role="status">{t("Time is up. Take your time to finish.")}</span> : null}
    </div>
  );
}
