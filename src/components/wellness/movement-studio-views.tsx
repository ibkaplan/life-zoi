"use client";

import { AudioFocusClaim } from "@/components/background-music/use-audio-focus";
import Link from "next/link";
import { STUDIO_PATH } from "@/lib/wellness-library/chair-yoga";
import { useState, useSyncExternalStore } from "react";
import { useLocale, useT } from "@/components/locale-provider";
import { msg } from "@/lib/i18n/translate";
import {
  ASK_FIRST,
  DURATION_CHOICES,
  FALL_SUPPORT,
  FILTER_GOALS,
  FILTER_POSITIONS,
  LEVELS,
  SAFETY_LINE,
  STUDIO_HERO,
  STUDIO_SECTION,
  categoryBySlug,
  embedSrc,
  filterLessons,
  formatDuration,
  goalLabel,
  lessonById,
  lessonTimeLabel,
  lessonsInCategory,
  levelLabel,
  positionLabel,
  studioCategories,
  studioLessons,
  type FilterGoal,
  type FilterPosition,
  type LessonFilters,
  type Level,
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
  const t = useT();
  return (
    <aside className="studio-safety" role="note">
      <h2>{t("Safety")}</h2>
      <p>{t(SAFETY_LINE)}</p>
      <p>{t(FALL_SUPPORT)}</p>
      <p>{t(ASK_FIRST)}</p>
    </aside>
  );
}

/** Time label for a lesson card: a film's player length, or a script's planned minutes. */
function timeLabel(t: ReturnType<typeof useT>, lesson: StudioLesson): string {
  if (lesson.kind === "video") return lessonTimeLabel(lesson);
  return t("About {minutes} minutes of written practice", { minutes: lesson.practiceMinutes });
}

export function LessonCard({ lesson }: { lesson: StudioLesson }) {
  const t = useT();
  const { locale } = useLocale();
  const studio = useStudioProgress();
  const [playing, setPlaying] = useState(false);
  const src = embedSrc(lesson);
  const done = studio.progress.completedLessonIds.includes(lesson.id);
  const category = categoryBySlug(lesson.categorySlug);

  return (
    <article className="card studio-card stack" id={lesson.id}>
      <p className="kicker">{category ? t(category.title) : null}</p>
      <h3>
        <Link href={`/academy/move/studio/lessons/${lesson.id}`}>{t(lesson.title)}</Link>
      </h3>
      <p>
        <strong>{t("Time.")}</strong> {timeLabel(t, lesson)}
      </p>
      <p>
        <strong>{t("Level.")}</strong> {t(levelLabel[lesson.level])}
      </p>
      <p>
        <strong>{t("Position.")}</strong> {t(positionLabel[lesson.position])}
      </p>
      <p>
        <strong>{t("Goal.")}</strong> {t(goalLabel[lesson.goal])}
      </p>
      <p>{t(lesson.summary)}</p>
      {lesson.kind === "script" ? (
        <>
          <p className="studio-soon">{t("Coming Soon")}</p>
          <p>{t(SCRIPT_LABEL)}</p>
          <ol className="studio-steps">
            {lesson.script.cues.map((cue) => (
              <li key={cue.heading}>
                <strong>{t(cue.heading)}.</strong> {t(cue.words)}
              </li>
            ))}
          </ol>
        </>
      ) : (
        <>
          <p>
            {lesson.license.attribution}. {t(lesson.license.license)} {t("Embed allowed. The file is not copied onto lifeZoi.")}
            {locale !== "en" ? ` ${t("Film in English.")}` : null}
          </p>
          <p>
            <a href={lesson.license.sourceUrl} target="_blank" rel="noopener noreferrer">
              {t("Original film")}
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
              {t("Play")}
            </button>
          )}
        </>
      )}
      <p className="studio-safety-line">{t(lesson.safety)}</p>
      <button type="button" className="btn btn-secondary" disabled={done} onClick={() => studio.completeLesson(lesson.id)}>
        {done ? t("Lesson marked complete") : t("Mark lesson complete")}
      </button>
    </article>
  );
}

function ToolCard({ slug }: { slug: string }) {
  const t = useT();
  const category = categoryBySlug(slug);
  if (!category) return null;
  return (
    <article className="card studio-card stack">
      <h3>{t(category.title)}</h3>
      <p>{t(category.summary)}</p>
      <Link className="btn btn-secondary" href={category.href}>
        {t("Open")}
      </Link>
    </article>
  );
}

/** Entry to the Chair Yoga Studio video library. */
export function ChairYogaBanner() {
  const t = useT();
  return (
    <section className="cy-banner" aria-labelledby="cy-banner">
      <div>
        <p className="kicker">{t("New · Video library")}</p>
        <h2 id="cy-banner">{t("Chair Yoga Studio")}</h2>
        <p>{t("Free seated and standing chair yoga classes, plus gentle yoga and mobility. Press PLAY VIDEO and start.")}</p>
      </div>
      <Link className="btn btn-primary" href={STUDIO_PATH}>
        ▶ {t("Open Chair Yoga Studio")}
      </Link>
    </section>
  );
}

export function MovementStudioHome() {
  const t = useT();
  return (
    <div className="studio stack-lg" id="movement-studio">
      <p className="kicker">{t("Movement Studio")}</p>
      <h1>{t(STUDIO_HERO)}</h1>
      <p className="lede">
        {t("Official films play here only when the player and the length were checked. Everything else stays written, with Coming Soon, until a real recording exists.")}
      </p>
      <SafetyNote />
      <ChairYogaBanner />
      <section className="stack-lg" aria-labelledby="choose-movement">
        <h2 id="choose-movement">{t(STUDIO_SECTION)}</h2>
        {studioCategories.map((category) => (
          <section key={category.slug} className="stack" aria-labelledby={`studio-${category.slug}`}>
            <h3 id={`studio-${category.slug}`}>
              <Link href={category.href}>{t(category.title)}</Link>
            </h3>
            <p>{t(category.summary)}</p>
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
        <Link href="/academy/move/resources">{t("Free exercise resources and printable guides")}</Link>
      </p>
    </div>
  );
}

export function StudioCategory({ slug }: { slug: string }) {
  const t = useT();
  const category = categoryBySlug(slug);
  if (!category) return null;
  return (
    <div className="studio stack-lg">
      <p className="kicker">{t("Movement Studio")}</p>
      <h1>{t(category.title)}</h1>
      <p className="lede">{t(category.summary)}</p>
      <SafetyNote />
      {slug === "chair" || slug === "balance" || slug === "mobility" ? <ChairYogaBanner /> : null}
      <div className="studio-grid">
        {lessonsInCategory(slug).map((lesson) => (
          <LessonCard key={lesson.id} lesson={lesson} />
        ))}
      </div>
      <Link href="/academy/move">{t("All movement")}</Link>
    </div>
  );
}

export function StudioLessonPage({ slug }: { slug: string }) {
  const t = useT();
  const lesson = lessonById(slug);
  if (!lesson) return null;
  return (
    <div className="studio stack-lg">
      <p className="kicker">{t("Movement Studio")}</p>
      <LessonCard lesson={lesson} />
      <Link href={`/academy/move/studio/categories/${lesson.categorySlug}`}>{t("Back to the category")}</Link>
    </div>
  );
}

const emptyFilters: LessonFilters = { minutes: "any", position: "any", goal: "any", level: "any" };

export function FindMyMovement() {
  const t = useT();
  const [filters, setFilters] = useState<LessonFilters>(emptyFilters);
  const results = filterLessons(studioLessons, filters);

  return (
    <div className="studio stack-lg">
      <p className="kicker">{t("Movement Studio")}</p>
      <h1>{t("Find My Movement")}</h1>
      <p className="lede">
        {t("Choose minutes, position, goal, and level. The matches come from the list on this page. Nothing is generated.")}
      </p>
      <p>
        {t("A film appears under a minute choice when its player length is within a minute and a half of that choice. A written practice appears only under its planned minutes. Short films stay under Any.")}
      </p>
      <SafetyNote />
      <div className="studio-filters">
        <FilterGroup
          label={msg("Minutes")}
          value={String(filters.minutes)}
          options={[{ value: "any", label: t("Any") }, ...DURATION_CHOICES.map((minutes) => ({ value: String(minutes), label: String(minutes) }))]}
          onChange={(value) =>
            setFilters((current) => ({
              ...current,
              minutes: value === "any" ? "any" : (Number(value) as (typeof DURATION_CHOICES)[number]),
            }))
          }
        />
        <FilterGroup
          label={msg("Position")}
          value={filters.position}
          options={[
            { value: "any", label: t("Any") },
            ...FILTER_POSITIONS.map((position) => ({ value: position, label: t(positionLabel[position]) })),
          ]}
          onChange={(value) => setFilters((current) => ({ ...current, position: value as FilterPosition | "any" }))}
        />
        <FilterGroup
          label={msg("Goal")}
          value={filters.goal}
          options={[{ value: "any", label: t("Any") }, ...FILTER_GOALS.map((goal) => ({ value: goal, label: t(goalLabel[goal]) }))]}
          onChange={(value) => setFilters((current) => ({ ...current, goal: value as FilterGoal | "any" }))}
        />
        <FilterGroup
          label={msg("Level")}
          value={filters.level}
          options={[{ value: "any", label: t("Any") }, ...LEVELS.map((level) => ({ value: level, label: t(levelLabel[level]) }))]}
          onChange={(value) => setFilters((current) => ({ ...current, level: value as Level | "any" }))}
        />
      </div>
      <p>
        {results.length === 0 ? t("Nothing in the studio matches those filters.") : t("Matches: {count}.", { count: results.length })}
      </p>
      <div className="studio-grid">
        {results.map((lesson) => (
          <LessonCard key={lesson.id} lesson={lesson} />
        ))}
      </div>
      <Link href="/academy/move">{t("All movement")}</Link>
    </div>
  );
}

function FilterGroup({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}) {
  const t = useT();
  return (
    <div className="studio-filter" role="group" aria-label={t(label)}>
      <p>{t(label)}</p>
      <div className="studio-filter-row">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            className="btn btn-secondary"
            aria-pressed={value === option.value}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function DailyMission() {
  const t = useT();
  const studio = useStudioProgress();
  const todayDay = studio.today ? missionDayForDate(studio.today) : null;
  const marked = studio.today ? missionsMarked(studio.progress, studio.today) : 0;

  return (
    <div className="studio stack-lg">
      <p className="kicker">{t("Movement Studio")}</p>
      <h1>{t("Daily Movement Mission")}</h1>
      <p className="lede">
        {t("Monday hands, Tuesday balance, Wednesday legs, Thursday back, Friday a 10-minute walk, Saturday gentle yoga, and Sunday breathe.")}
      </p>
      <p>{t("Marking the mission checks that day. It does not mark the lesson. Pressing play does not check the day.")}</p>
      <p>
        <strong>{t(PROGRESS_COPY.week)}.</strong> {t("Missions marked: {count} of 7.", { count: marked })}
      </p>
      <SafetyNote />
      {missionPlan.map((mission) => {
        const lesson = lessonById(mission.lessonId);
        const checked = studio.today ? isMissionMarked(studio.progress, mission.day, studio.today) : false;
        return (
          <section key={mission.day} className="stack" aria-labelledby={`mission-${mission.day}`}>
            <h2 id={`mission-${mission.day}`}>
              {t(mission.label)}: {t(mission.focus)}
              {todayDay === mission.day ? ` ${t("(today)")}` : ""}
            </h2>
            <button
              type="button"
              className="btn btn-primary"
              disabled={!studio.today || checked}
              onClick={() => studio.completeMission(mission.day)}
            >
              {checked ? t("Mission marked complete") : t("Mark mission complete")}
            </button>
            {lesson ? <LessonCard lesson={lesson} /> : null}
          </section>
        );
      })}
      <button type="button" className="btn btn-secondary" disabled={!studio.today} onClick={() => studio.restart()}>
        {t("Restart this week")}
      </button>
      <p>{t(PROGRESS_COPY.restart)}</p>
      <Link href="/academy/move">{t("All movement")}</Link>
    </div>
  );
}

export function MovementProgress() {
  const t = useT();
  const studio = useStudioProgress();
  const seconds = videoSecondsCompleted(studio.progress);
  const week = studio.today ? weekStartMonday(studio.today) : null;
  const marked = studio.today ? missionsMarked(studio.progress, studio.today) : 0;

  return (
    <div className="studio stack-lg">
      <p className="kicker">{t("Movement Studio")}</p>
      <h1>{t("My Movement Progress")}</h1>
      <p className="lede">{t(PROGRESS_COPY.storage)}</p>
      <SafetyNote />
      <dl className="studio-stats">
        <div>
          <dt>{t(PROGRESS_COPY.lessons)}</dt>
          <dd>{completedLessonCount(studio.progress)}</dd>
        </div>
        <div>
          <dt>{t(PROGRESS_COPY.minutes)}</dt>
          <dd>{formatDuration(seconds)}</dd>
        </div>
        <div>
          <dt>{t(PROGRESS_COPY.week)}</dt>
          <dd>{week ? t("Week of {date}", { date: week }) : t("This tab is still opening.")}</dd>
        </div>
        <div>
          <dt>{t(PROGRESS_COPY.categories)}</dt>
          <dd>{completedCategoryCount(studio.progress)}</dd>
        </div>
        <div>
          <dt>{t(PROGRESS_COPY.missions)}</dt>
          <dd>{t("{count} of 7", { count: marked })}</dd>
        </div>
      </dl>
      <p>{t(PROGRESS_COPY.minutesNote)}</p>
      {studio.progress.completedLessonIds.length > 0 ? (
        <ul className="studio-steps">
          {studio.progress.completedLessonIds.map((id) => {
            const lesson = lessonById(id);
            return <li key={id}>{lesson ? t(lesson.title) : id}</li>;
          })}
        </ul>
      ) : (
        <p>{t("No lesson is marked complete yet.")}</p>
      )}
      <button type="button" className="btn btn-secondary" disabled={!studio.today} onClick={() => studio.restart()}>
        {t("Restart this week")}
      </button>
      <p>{t(PROGRESS_COPY.restart)}</p>
      <Link href="/academy/move/studio/mission">{t("Daily Movement Mission")}</Link>
    </div>
  );
}
