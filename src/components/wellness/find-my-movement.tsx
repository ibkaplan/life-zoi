"use client";

import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import { AudioFocusClaim } from "@/components/background-music/use-audio-focus";
import { useLocale, useT } from "@/components/locale-provider";
import { LessonCard } from "@/components/wellness/movement-studio-views";
import { LOCALE_META } from "@/lib/i18n/config";
import type { Translate } from "@/lib/i18n/translate";
import { ASK_FIRST, FALL_SUPPORT, SAFETY_LINE, formatDuration, studioLessons, type ScriptLesson } from "@/lib/wellness/movement-studio/catalog";
import {
  ANY_FILTERS,
  FILTER_KEY_TEXT,
  FIND_DURATIONS,
  FIND_GOALS,
  FIND_GOAL_TEXT,
  FIND_LEVELS,
  FIND_LEVEL_TEXT,
  FIND_POSITIONS,
  FIND_POSITION_TEXT,
  FIND_VIDEOS,
  findVideos,
  relaxSuggestions,
  type FindFilters,
  type FindGoal,
  type FindPosition,
  type FindVideo,
} from "@/lib/wellness/movement-studio/find-videos";
import { guideSpeechSupported, speakGuide, stopGuide } from "@/lib/wellness/movement-studio/voice-guide";

const noop = () => () => undefined;

function useSpeechSupported(): boolean {
  return useSyncExternalStore(noop, guideSpeechSupported, () => false);
}

function lengthText(video: FindVideo, t: Translate): string {
  if (video.durationSeconds === null) return t("Length shown in the player");
  if (video.lengthSource === "title") return t("{minutes} min (from the title)", { minutes: Math.round(video.durationSeconds / 60) });
  return formatDuration(video.durationSeconds);
}

function safetyText(video: FindVideo, t: Translate): string {
  return [t(SAFETY_LINE), video.balance ? t(FALL_SUPPORT) : null].filter(Boolean).join(" ");
}

function Thumb({ video, onPlay, t }: { video: FindVideo; onPlay: () => void; t: Translate }) {
  const [failed, setFailed] = useState(false);
  return (
    <button type="button" className="cy-thumb" onClick={onPlay} aria-label={`${t("Play video")}: ${video.title}`}>
      {failed ? (
        <span className="cy-thumb-fallback" aria-hidden="true">
          {video.license.creator}
        </span>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element -- official YouTube thumbnail, loaded from i.ytimg.com
        <img src={video.thumbnailUrl} alt="" loading="lazy" width={480} height={360} onError={() => setFailed(true)} />
      )}
      <span className="cy-thumb-play" aria-hidden="true">
        ▶
      </span>
      {video.durationSeconds !== null ? <span className="cy-thumb-time">{lengthText(video, t)}</span> : null}
    </button>
  );
}

function FindVideoCard({ video, speaking, onSpeak }: { video: FindVideo; speaking: boolean; onSpeak: (video: FindVideo | null) => void }) {
  const t = useT();
  const [playing, setPlaying] = useState(false);
  const canSpeak = useSpeechSupported();
  const play = () => setPlaying(true);

  return (
    <article className="cy-card find-card" id={video.id} data-section={video.positions.includes("standing") && !video.positions.includes("sitting") ? "standing" : video.floor ? "gentle" : "seated"}>
      {playing ? (
        <div className="video-frame find-player">
          <AudioFocusClaim id="find-video" />
          <iframe
            src={`${video.embedUrl}?autoplay=1&rel=0`}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
        </div>
      ) : (
        <Thumb video={video} onPlay={play} t={t} />
      )}
      <div className="cy-card-body">
        <h3 lang="en">{video.title}</h3>
        <p className="cy-channel">{t("By {creator}", { creator: video.license.creator })}</p>
        <ul className="lz-meta" aria-label={t("Video details")}>
          <li>{lengthText(video, t)}</li>
          {video.positions.map((position) => (
            <li key={position}>{t(FIND_POSITION_TEXT[position])}</li>
          ))}
          {video.levels.map((level) => (
            <li key={level}>{t(FIND_LEVEL_TEXT[level])}</li>
          ))}
        </ul>
        <ul className="lz-meta find-goals" aria-label={t("Goal")}>
          {video.goals.map((goal) => (
            <li key={goal} className="lz-meta-ok">
              {t(FIND_GOAL_TEXT[goal])}
            </li>
          ))}
          {video.balance ? <li className="lz-meta-warn">{t("Balance: hold a sturdy support")}</li> : null}
          {video.floor ? <li className="lz-meta-warn">{t("Uses the floor")}</li> : null}
        </ul>
        <p>{t(video.description)}</p>
        {playing ? null : (
          <button type="button" className="btn btn-primary cy-play" onClick={play}>
            ▶ {t("Play video")}
          </button>
        )}
        {canSpeak ? (
          <button type="button" className="btn btn-secondary" aria-pressed={speaking} onClick={() => onSpeak(speaking ? null : video)}>
            {speaking ? t("Stop reading") : t("Listen to the instructions")}
          </button>
        ) : null}
        <p className="find-safety">{safetyText(video, t)}</p>
        <p className="find-license">
          {t(video.license.terms)} {t("Embedding checked on {date}.", { date: video.license.checkedOn })}{" "}
          <a href={video.license.sourceUrl} target="_blank" rel="noopener noreferrer">
            {t("Source on YouTube")}
          </a>
        </p>
      </div>
    </article>
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
  return (
    <div className="studio-filter" role="group" aria-label={label}>
      <p>{label}</p>
      <div className="studio-filter-row">
        {options.map((option) => (
          <button key={option.value} type="button" className="btn btn-secondary" aria-pressed={value === option.value} onClick={() => onChange(option.value)}>
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/** Written Movement Studio practices that fit the same filters. They are not videos. */
function matchingScripts(filters: FindFilters): ScriptLesson[] {
  return studioLessons.filter((lesson): lesson is ScriptLesson => {
    if (lesson.kind !== "script") return false;
    const positions: FindPosition[] = lesson.position === "sitting" ? ["sitting", "chair"] : lesson.position === "standing" ? ["standing"] : [];
    const goals: string[] = lesson.goal === "chair" ? [] : [lesson.goal];
    return (
      (filters.minutes === "any" || lesson.practiceMinutes === filters.minutes) &&
      (filters.position === "any" || positions.includes(filters.position)) &&
      (filters.goal === "any" || goals.includes(filters.goal)) &&
      (filters.level === "any" || lesson.level === filters.level)
    );
  });
}

export function FindMyMovement() {
  const t = useT();
  const { locale } = useLocale();
  const [filters, setFilters] = useState<FindFilters>(ANY_FILTERS);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const results = findVideos(filters);
  const scripts = matchingScripts(filters);
  const suggestions = results.length === 0 ? relaxSuggestions(filters) : [];
  const anyActive = Object.values(filters).some((value) => value !== "any");

  useEffect(() => () => stopGuide(), []);

  const speak = (video: FindVideo | null) => {
    if (!video) {
      stopGuide();
      setSpeakingId(null);
      return;
    }
    const words = [
      t(video.description),
      video.positions.map((position) => t(FIND_POSITION_TEXT[position])).join(", ") + ".",
      safetyText(video, t),
    ].join(" ");
    if (speakGuide(words, LOCALE_META[locale].htmlLang, () => setSpeakingId((current) => (current === video.id ? null : current)))) setSpeakingId(video.id);
  };

  const set = <K extends keyof FindFilters>(key: K, value: FindFilters[K]) => setFilters((current) => ({ ...current, [key]: value }));
  const any = { value: "any", label: t("Any") };

  return (
    <div className="studio stack-lg">
      <p className="kicker">{t("Movement Studio")}</p>
      <h1>{t("Find My Movement")}</h1>
      <p className="lede">{t("Choose your activity and start moving!")}</p>
      <p>
        {t(
          "Pick minutes, position, goal, and level. Every filter works together, and the videos below change as you choose. Press Play video to start here on LifeZoi.",
        )}
      </p>
      <aside className="studio-safety" role="note">
        <h2>{t("Safety")}</h2>
        <p>{t(SAFETY_LINE)}</p>
        <p>{t(FALL_SUPPORT)}</p>
        <p>{t(ASK_FIRST)}</p>
      </aside>
      <div className="studio-filters">
        <FilterGroup
          label={t(FILTER_KEY_TEXT.minutes)}
          value={String(filters.minutes)}
          options={[any, ...FIND_DURATIONS.map((minutes) => ({ value: String(minutes), label: t("{minutes} min", { minutes }) }))]}
          onChange={(value) => set("minutes", value === "any" ? "any" : (Number(value) as FindFilters["minutes"]))}
        />
        <FilterGroup
          label={t(FILTER_KEY_TEXT.position)}
          value={filters.position}
          options={[any, ...FIND_POSITIONS.map((position) => ({ value: position, label: t(FIND_POSITION_TEXT[position]) }))]}
          onChange={(value) => set("position", value as FindFilters["position"])}
        />
        <FilterGroup
          label={t(FILTER_KEY_TEXT.goal)}
          value={filters.goal}
          options={[any, ...FIND_GOALS.map((goal: FindGoal) => ({ value: goal, label: t(FIND_GOAL_TEXT[goal]) }))]}
          onChange={(value) => set("goal", value as FindFilters["goal"])}
        />
        <FilterGroup
          label={t(FILTER_KEY_TEXT.level)}
          value={filters.level}
          options={[any, ...FIND_LEVELS.map((level) => ({ value: level, label: t(FIND_LEVEL_TEXT[level]) }))]}
          onChange={(value) => set("level", value as FindFilters["level"])}
        />
        {anyActive ? (
          <button type="button" className="btn btn-ghost find-clear" onClick={() => setFilters(ANY_FILTERS)}>
            {t("Clear all filters")}
          </button>
        ) : null}
      </div>

      <section className="stack" aria-labelledby="find-results">
        <h2 id="find-results">{t("Videos for you")}</h2>
        <p role="status">
          {results.length === 0
            ? t("No video matches all four choices yet.")
            : t("{count} of {total} videos match.", { count: results.length, total: FIND_VIDEOS.length })}
        </p>
        {results.length === 0 ? (
          <div className="find-empty" role="note">
            <p>
              {suggestions.length > 0
                ? t("Try changing one filter. These changes would show videos:")
                : t("No single change finds a video for this mix. Clear the filters and start again.")}
            </p>
            <div className="studio-filter-row">
              {suggestions.map((entry) => (
                <button key={entry.key} type="button" className="btn btn-secondary" onClick={() => set(entry.key, "any")}>
                  {t("{filter}: Any ({count} videos)", { filter: t(FILTER_KEY_TEXT[entry.key]), count: entry.count })}
                </button>
              ))}
              <button type="button" className="btn btn-primary" onClick={() => setFilters(ANY_FILTERS)}>
                {t("Show all {total} videos", { total: FIND_VIDEOS.length })}
              </button>
            </div>
          </div>
        ) : (
          <div className="cy-grid">
            {results.map((video) => (
              <FindVideoCard key={video.id} video={video} speaking={speakingId === video.id} onSpeak={speak} />
            ))}
          </div>
        )}
      </section>

      {scripts.length > 0 ? (
        <section className="stack" aria-labelledby="find-scripts">
          <h2 id="find-scripts">{t("Written practice without video")}</h2>
          <p>{t("These LifeZoi practices fit the same choices. They are step-by-step text, not videos.")}</p>
          <div className="studio-grid">
            {scripts.map((lesson) => (
              <LessonCard key={lesson.id} lesson={lesson} />
            ))}
          </div>
        </section>
      ) : null}

      <p className="find-license">
        {t(
          "Videos come from the National Institute on Aging and from yoga and fitness teachers on YouTube who allow embedding. They play in YouTube's own player. LifeZoi does not copy them. Positions, goals, and levels are LifeZoi's reading of each title, and nobody has watched every class, so check the first minutes and adjust.",
        )}
      </p>
      <Link href="/academy/move">{t("All movement")}</Link>
    </div>
  );
}
