"use client";

import { SessionMusicControls } from "@/components/background-music/controls";
import { AudioFocusClaim } from "@/components/background-music/use-audio-focus";
import Link from "next/link";
import { STUDIO_PATH } from "@/lib/wellness-library/chair-yoga";
import { useState, useSyncExternalStore } from "react";
import {
  ASK_FIRST,
  FALL_SUPPORT,
  SAFETY_LINE,
  STUDIO_HERO,
  STUDIO_SECTION,
  categoryBySlug,
  embedSrc,
  formatDuration,
  goalLabel,
  lessonById,
  lessonTimeLabel,
  lessonsInCategory,
  levelLabel,
  positionLabel,
  studioCategories,
  type StudioLesson,
} from "@/lib/wellness/movement-studio/catalog";
import {
  PROGRESS_COPY,
  completedCategoryCount,
  completedLessonCount,
  isMissionMarked,
  missionDayForDate,
  missionPlan,
  missionsMarked,
  videoSecondsCompleted,
  weekStartMonday,
} from "@/lib/wellness/movement-studio/progress";
import { SCRIPT_LABEL } from "@/lib/wellness/movement-studio/scripts";
import {
  completeStudioLesson,
  getStudioServerSnapshot,
  getStudioSnapshot,
  markStudioMission,
  noteStudioPlay,
  restartStudioWeek,
  subscribeStudio,
} from "@/lib/wellness/movement-studio/studio-store";

function useStudioProgress() {
  const snapshot = useSyncExternalStore(subscribeStudio, getStudioSnapshot, getStudioServerSnapshot);
  return {
    progress: snapshot.progress,
    today: snapshot.today,
    completeLesson: completeStudioLesson,
    completeMission(day: (typeof missionPlan)[number]["day"]) {
      if (!snapshot.today) return;
      markStudioMission(day, snapshot.today);
    },
    notePlay: noteStudioPlay,
    restart() {
      if (!snapshot.today) return;
      restartStudioWeek(snapshot.today);
    },
  };
}

function SafetyNote() {
  return (
    <aside className="studio-safety" role="note">
      <h2>Safety</h2>
      <p>{SAFETY_LINE}</p>
      <p>{FALL_SUPPORT}</p>
      <p>{ASK_FIRST}</p>
    </aside>
  );
}

export function LessonCard({ lesson }: { lesson: StudioLesson }) {
  const studio = useStudioProgress();
  const [playing, setPlaying] = useState(false);
  const src = embedSrc(lesson);
  const done = studio.progress.completedLessonIds.includes(lesson.id);
  const category = categoryBySlug(lesson.categorySlug);

  return (
    <article className="card studio-card stack" id={lesson.id}>
      <p className="kicker">{category?.title}</p>
      <h3>
        <Link href={`/academy/move/studio/lessons/${lesson.id}`}>{lesson.title}</Link>
      </h3>
      <p>
        <strong>Time.</strong> {lessonTimeLabel(lesson)}
      </p>
      <p>
        <strong>Level.</strong> {levelLabel[lesson.level]}
      </p>
      <p>
        <strong>Position.</strong> {positionLabel[lesson.position]}
      </p>
      <p>
        <strong>Goal.</strong> {goalLabel[lesson.goal]}
      </p>
      <p>{lesson.summary}</p>
      {lesson.kind === "script" ? (
        <>
          <p className="studio-soon">Coming Soon</p>
          <p>{SCRIPT_LABEL}</p>
          <ol className="studio-steps">
            {lesson.script.cues.map((cue) => (
              <li key={cue.heading}>
                <strong>{cue.heading}.</strong> {cue.words}
              </li>
            ))}
          </ol>
        </>
      ) : (
        <>
          <p>
            {lesson.license.attribution}. {lesson.license.license} Embed allowed. The file is not copied onto lifeZoi.
          </p>
          <p>
            <a href={lesson.license.sourceUrl} target="_blank" rel="noopener noreferrer">
              Original film
            </a>
          </p>
          {playing && src ? (
            <div className="video-frame">
              <AudioFocusClaim id="video-player" />
              <iframe
                src={src}
                title={lesson.title}
                allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
              />
            </div>
          ) : (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                setPlaying(true);
                studio.notePlay(lesson.id);
              }}
            >
              Play
            </button>
          )}
        </>
      )}
      {lesson.kind !== "script" && playing && src ? <SessionMusicControls /> : null}
      <p className="studio-safety-line">{lesson.safety}</p>
      <button type="button" className="btn btn-secondary" disabled={done} onClick={() => studio.completeLesson(lesson.id)}>
        {done ? "Lesson marked complete" : "Mark lesson complete"}
      </button>
    </article>
  );
}

function ToolCard({ slug }: { slug: string }) {
  const category = categoryBySlug(slug);
  if (!category) return null;
  return (
    <article className="card studio-card stack">
      <h3>{category.title}</h3>
      <p>{category.summary}</p>
      <Link className="btn btn-secondary" href={category.href}>
        Open
      </Link>
    </article>
  );
}

/** Entry to the Chair Yoga Studio video library. */
export function ChairYogaBanner() {
  return (
    <section className="cy-banner" aria-labelledby="cy-banner">
      <div>
        <p className="kicker">New · Video library</p>
        <h2 id="cy-banner">Chair Yoga Studio</h2>
        <p>Free seated and standing chair yoga classes, plus gentle yoga and mobility. Press PLAY VIDEO and start.</p>
      </div>
      <Link className="btn btn-primary" href={STUDIO_PATH}>
        ▶ Open Chair Yoga Studio
      </Link>
    </section>
  );
}

export function MovementStudioHome() {
  return (
    <div className="studio stack-lg" id="movement-studio">
      <p className="kicker">Movement Studio</p>
      <h1>{STUDIO_HERO}</h1>
      <p className="lede">
        Official films play here only when the player and the length were checked. Everything else stays written, with Coming Soon, until a real recording exists.
      </p>
      <SafetyNote />
      <ChairYogaBanner />
      <section className="stack-lg" aria-labelledby="choose-movement">
        <h2 id="choose-movement">{STUDIO_SECTION}</h2>
        {studioCategories.map((category) => (
          <section key={category.slug} className="stack" aria-labelledby={`studio-${category.slug}`}>
            <h3 id={`studio-${category.slug}`}>
              <Link href={category.href}>{category.title}</Link>
            </h3>
            <p>{category.summary}</p>
            {category.kind === "tool" ? (
              <ToolCard slug={category.slug} />
            ) : (
              <div className="studio-grid">
                {lessonsInCategory(category.slug).map((lesson) => (
                  <LessonCard key={lesson.id} lesson={lesson} />
                ))}
              </div>
            )}
          </section>
        ))}
      </section>
      <p>
        <Link href="/academy/move/resources">Free exercise resources and printable guides</Link>
      </p>
    </div>
  );
}

export function StudioCategory({ slug }: { slug: string }) {
  const category = categoryBySlug(slug);
  if (!category) return null;
  return (
    <div className="studio stack-lg">
      <p className="kicker">Movement Studio</p>
      <h1>{category.title}</h1>
      <p className="lede">{category.summary}</p>
      <SafetyNote />
      {slug === "chair" || slug === "balance" || slug === "mobility" ? <ChairYogaBanner /> : null}
      <div className="studio-grid">
        {lessonsInCategory(slug).map((lesson) => (
          <LessonCard key={lesson.id} lesson={lesson} />
        ))}
      </div>
      <Link href="/academy/move">All movement</Link>
    </div>
  );
}

export function StudioLessonPage({ slug }: { slug: string }) {
  const lesson = lessonById(slug);
  if (!lesson) return null;
  return (
    <div className="studio stack-lg">
      <p className="kicker">Movement Studio</p>
      <LessonCard lesson={lesson} />
      <Link href={`/academy/move/studio/categories/${lesson.categorySlug}`}>Back to the category</Link>
    </div>
  );
}

export function DailyMission() {
  const studio = useStudioProgress();
  const todayDay = studio.today ? missionDayForDate(studio.today) : null;
  const marked = studio.today ? missionsMarked(studio.progress, studio.today) : 0;

  return (
    <div className="studio stack-lg">
      <p className="kicker">Movement Studio</p>
      <h1>Daily Movement Mission</h1>
      <p className="lede">
        Monday hands, Tuesday balance, Wednesday legs, Thursday back, Friday a 10-minute walk, Saturday gentle yoga, and Sunday breathe.
      </p>
      <p>Marking the mission checks that day. It does not mark the lesson. Pressing play does not check the day.</p>
      <p>
        <strong>{PROGRESS_COPY.week}.</strong> {marked} of 7 missions marked.
      </p>
      <SafetyNote />
      {missionPlan.map((mission) => {
        const lesson = lessonById(mission.lessonId);
        const checked = studio.today ? isMissionMarked(studio.progress, mission.day, studio.today) : false;
        return (
          <section key={mission.day} className="stack" aria-labelledby={`mission-${mission.day}`}>
            <h2 id={`mission-${mission.day}`}>
              {mission.label}: {mission.focus}
              {todayDay === mission.day ? " (today)" : ""}
            </h2>
            <button
              type="button"
              className="btn btn-primary"
              disabled={!studio.today || checked}
              onClick={() => studio.completeMission(mission.day)}
            >
              {checked ? "Mission marked complete" : "Mark mission complete"}
            </button>
            {lesson ? <LessonCard lesson={lesson} /> : null}
          </section>
        );
      })}
      <button type="button" className="btn btn-secondary" disabled={!studio.today} onClick={() => studio.restart()}>
        Restart this week
      </button>
      <p>{PROGRESS_COPY.restart}</p>
      <Link href="/academy/move">All movement</Link>
    </div>
  );
}

export function MovementProgress() {
  const studio = useStudioProgress();
  const seconds = videoSecondsCompleted(studio.progress);
  const week = studio.today ? weekStartMonday(studio.today) : null;
  const marked = studio.today ? missionsMarked(studio.progress, studio.today) : 0;

  return (
    <div className="studio stack-lg">
      <p className="kicker">Movement Studio</p>
      <h1>My Movement Progress</h1>
      <p className="lede">{PROGRESS_COPY.storage}</p>
      <SafetyNote />
      <dl className="studio-stats">
        <div>
          <dt>{PROGRESS_COPY.lessons}</dt>
          <dd>{completedLessonCount(studio.progress)}</dd>
        </div>
        <div>
          <dt>{PROGRESS_COPY.minutes}</dt>
          <dd>{formatDuration(seconds)}</dd>
        </div>
        <div>
          <dt>{PROGRESS_COPY.week}</dt>
          <dd>{week ? `Week of ${week}` : "This tab is still opening."}</dd>
        </div>
        <div>
          <dt>{PROGRESS_COPY.categories}</dt>
          <dd>{completedCategoryCount(studio.progress)}</dd>
        </div>
        <div>
          <dt>{PROGRESS_COPY.missions}</dt>
          <dd>{marked} of 7</dd>
        </div>
      </dl>
      <p>{PROGRESS_COPY.minutesNote}</p>
      {studio.progress.completedLessonIds.length > 0 ? (
        <ul className="studio-steps">
          {studio.progress.completedLessonIds.map((id) => {
            const lesson = lessonById(id);
            return <li key={id}>{lesson?.title ?? id}</li>;
          })}
        </ul>
      ) : (
        <p>No lesson is marked complete yet.</p>
      )}
      <button type="button" className="btn btn-secondary" disabled={!studio.today} onClick={() => studio.restart()}>
        Restart this week
      </button>
      <p>{PROGRESS_COPY.restart}</p>
      <Link href="/academy/move/studio/mission">Daily Movement Mission</Link>
    </div>
  );
}
