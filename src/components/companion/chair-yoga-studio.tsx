"use client";

import { SessionMusicControls } from "@/components/background-music/controls";
import { AudioFocusClaim } from "@/components/background-music/use-audio-focus";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { FavoriteButton, SaveNote, SessionPlayer } from "@/components/companion/shared";
import { useProfile } from "@/components/companion/use-profile";
import { addRecent, clearEntry, recordEntry } from "@/lib/companion/state";
import { commitCompanion, useCompanion } from "@/lib/companion/store";
import { formatLongDate, localISODate } from "@/lib/dates";
import {
  activityIdFor,
  alternativeFor,
  AUDIENCE_TEXT,
  CHAIR_YOGA_TEXT as T,
  DURATION_BANDS,
  EMPTY_FILTER,
  filterVideos,
  LEVEL_TEXT,
  lengthLabel,
  libraryVideos,
  POSITION_TEXT,
  recommendToday,
  SECTION_INFO,
  sectionCounts,
  todayPickKey,
  unsafeForProfile,
  videoByYoutubeId,
  weekPractice,
  type StudioFilter,
  type StudioVideo,
} from "@/lib/wellness-library/chair-yoga";
import { STUDIO_SECTIONS, STUDIO_VERIFIED_ON, type StudioSection } from "@/lib/wellness-library/chair-yoga-videos";
import { buildSession, type MoverProfile } from "@/lib/wellness-library/discover";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MINUTE_CHOICES = [5, 10, 15, 20, 25, 30, 35, 45, 60];

function Thumb({ video, onPlay }: { video: StudioVideo; onPlay: () => void }) {
  const [failed, setFailed] = useState(false);
  return (
    <button type="button" className="cy-thumb" data-section={video.studio.section} onClick={onPlay} aria-label={`${T.play}: ${video.title}`}>
      {failed ? (
        <span className="cy-thumb-fallback" aria-hidden="true">
          {video.instructor}
        </span>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element -- official YouTube thumbnail, loaded from i.ytimg.com
        <img src={video.studio.thumbnailUrl} alt="" loading="lazy" width={480} height={360} onError={() => setFailed(true)} />
      )}
      <span className="cy-thumb-play" aria-hidden="true">
        ▶
      </span>
      {video.studio.minutes !== null ? <span className="cy-thumb-time">{video.studio.minutes} min</span> : null}
    </button>
  );
}

function VideoTags({ video }: { video: StudioVideo }) {
  return (
    <ul className="lz-meta" aria-label="Class details">
      <li className="cy-tag-section" data-section={video.studio.section}>
        {SECTION_INFO[video.studio.section].title}
      </li>
      <li>{POSITION_TEXT[video.studio.position]}</li>
      <li>{LEVEL_TEXT[video.level]}</li>
      <li>{AUDIENCE_TEXT[video.studio.audience]}</li>
      <li>{lengthLabel(video)}</li>
      {video.studio.balance ? <li className="lz-meta-warn">Balance · hold the chair</li> : null}
      {video.studio.position === "mat" ? <li className="lz-meta-warn">Gets down to the floor</li> : null}
    </ul>
  );
}

function CareNote({ video, profile }: { video: StudioVideo; profile: MoverProfile }) {
  const reason = unsafeForProfile(video, profile);
  const seated = video.studio.position !== "seated" ? alternativeFor(video, "seated") : null;
  if (!reason && !video.studio.balance && video.studio.position === "seated") return null;
  return (
    <div className="cy-care" role="note">
      {reason && profile.seatedFirst ? <p>{T.seatedOnlyCare}</p> : null}
      {profile.fallRisk && video.studio.position !== "seated" ? <p>{T.balanceCare}</p> : null}
      {video.studio.balance ? <p>{T.balanceVideo}</p> : null}
      {video.studio.position === "mat" && !profile.fallRisk ? <p>This class may use the floor. Do it on a mat, or skip floor parts and stay seated.</p> : null}
      {seated ? (
        <p>
          {T.seatedAlt}: <strong>{seated.title}</strong>
        </p>
      ) : null}
    </div>
  );
}

function CompleteControls({ video, onDone }: { video: StudioVideo; onDone?: () => void }) {
  const { state } = useCompanion();
  const today = localISODate();
  const id = activityIdFor(video);
  const entry = state.days[today]?.entries[id];
  const [minutes, setMinutes] = useState(video.studio.minutes ?? state.movement.minutes);
  if (entry && entry.status !== "skipped") {
    return (
      <p role="status" className="cy-done">
        ✓ Completed today · {entry.minutes} min{" "}
        <button className="btn btn-ghost" type="button" onClick={() => commitCompanion((current) => clearEntry(current, today, id))}>
          Undo
        </button>
      </p>
    );
  }
  return (
    <div className="inline-form">
      {video.studio.minutes === null ? (
        <label className="hint">
          Minutes you did{" "}
          <select value={minutes} onChange={(event) => setMinutes(Number(event.target.value))}>
            {MINUTE_CHOICES.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
      ) : null}
      <button
        className="btn btn-teal"
        type="button"
        onClick={() => {
          commitCompanion((current) => recordEntry(current, today, id, { status: "done", minutes, replacedWith: "" }, { exerciseMinutes: minutes }));
          onDone?.();
        }}
      >
        ✓ {T.markDone}
      </button>
    </div>
  );
}

function ChooseToday({ video }: { video: StudioVideo }) {
  const { state } = useCompanion();
  const key = todayPickKey(localISODate());
  const chosen = state.customize.picks[key] === video.studio.youtubeId;
  return (
    <button
      className="btn btn-secondary"
      type="button"
      aria-pressed={chosen}
      onClick={() =>
        commitCompanion((current) => {
          const picks = { ...current.customize.picks };
          if (chosen) delete picks[key];
          else picks[key] = video.studio.youtubeId;
          return { ...current, customize: { ...current.customize, picks } };
        })
      }
    >
      {chosen ? `★ ${T.todayChosen}` : T.chooseToday}
    </button>
  );
}

/** The official YouTube player in a full-screen panel with a clear way back. */
function PlayerDialog({ video, onClose }: { video: StudioVideo | null; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (video && !dialog.open) dialog.showModal();
    if (!video && dialog.open) dialog.close();
  }, [video]);
  return (
    <dialog ref={ref} className="cy-dialog" onClose={onClose} aria-label={video ? video.title : T.title}>
      {video ? (
        <div className="stack">
          <div className="cy-dialog-bar">
            <button type="button" className="btn btn-primary cy-back" onClick={onClose}>
              ← {T.back}
            </button>
            <a className="btn btn-secondary" href={video.originalUrl} target="_blank" rel="noopener noreferrer">
              {T.openOnYoutube} ↗
            </a>
          </div>
          <h2 className="cy-dialog-title">{video.title}</h2>
          <p className="hint">
            {video.instructor} · {lengthLabel(video)}
          </p>
          {video.embedUrl ? (
            <div className="video-frame cy-frame">
              <AudioFocusClaim id="video-player" />
              <iframe
                src={`${video.embedUrl}?autoplay=1&rel=0`}
                title={video.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
              />
            </div>
          ) : (
            <p className="alert">This video cannot play inside LifeZoi. Use {T.openOnYoutube}, then come back here to mark it completed.</p>
          )}
          <SessionMusicControls />
          <p className="hint">{T.playerNote}</p>
          <p className="studio-safety-line">
            {T.sturdyChair} {T.stopIf} {video.studio.balance ? T.balanceVideo : ""} {T.notTreatment}
          </p>
          <CompleteControls video={video} />
          <div className="lz-buttons">
            <FavoriteButton id={`video:${video.id}`} label="this class" />
            <ChooseToday video={video} />
          </div>
        </div>
      ) : null}
    </dialog>
  );
}

function VideoCard({ video, profile, onPlay }: { video: StudioVideo; profile: MoverProfile; onPlay: (video: StudioVideo) => void }) {
  return (
    <article className="cy-card" data-section={video.studio.section}>
      <Thumb video={video} onPlay={() => onPlay(video)} />
      <div className="cy-card-body">
        <h3>{video.title}</h3>
        <p className="cy-channel">
          <a href={video.studio.channelUrl} target="_blank" rel="noopener noreferrer">
            {video.instructor}
          </a>
        </p>
        <VideoTags video={video} />
        <p>{video.description}</p>
        <CareNote video={video} profile={profile} />
        {video.embedUrl ? (
          <button type="button" className="btn btn-primary cy-play" onClick={() => onPlay(video)}>
            ▶ {T.play}
          </button>
        ) : (
          <a className="btn btn-primary cy-play" href={video.originalUrl} target="_blank" rel="noopener noreferrer">
            {T.openOnYoutube} ↗
          </a>
        )}
        <div className="lz-buttons">
          <FavoriteButton id={`video:${video.id}`} label="this class" />
          <ChooseToday video={video} />
        </div>
      </div>
    </article>
  );
}

function Toggle({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" className="lz-tab" aria-pressed={on} onClick={onClick}>
      {children}
    </button>
  );
}

function Filters({ filter, setFilter }: { filter: StudioFilter; setFilter: (next: StudioFilter) => void }) {
  const set = <K extends keyof StudioFilter>(key: K, value: StudioFilter[K]) => setFilter({ ...filter, [key]: filter[key] === value ? EMPTY_FILTER[key] : value });
  return (
    <div className="stack cy-filters">
      <label className="stack">
        <strong>{T.search}</strong>
        <input
          type="search"
          className="cy-search"
          value={filter.query}
          placeholder={T.searchHint}
          maxLength={60}
          onChange={(event) => setFilter({ ...filter, query: event.target.value })}
        />
      </label>
      <div className="lz-tabs" role="group" aria-label="Position">
        <Toggle on={filter.position === "seated"} onClick={() => set("position", "seated")}>
          Seated
        </Toggle>
        <Toggle on={filter.position === "standing"} onClick={() => set("position", "standing")}>
          Standing
        </Toggle>
        <Toggle on={filter.level === "beginner"} onClick={() => set("level", "beginner")}>
          Beginner
        </Toggle>
        <Toggle on={filter.level === "intermediate"} onClick={() => set("level", "intermediate")}>
          Intermediate
        </Toggle>
      </div>
      <div className="lz-tabs" role="group" aria-label="Age group">
        <Toggle on={filter.audience === "60+"} onClick={() => set("audience", "60+")}>
          {AUDIENCE_TEXT["60+"]}
        </Toggle>
        <Toggle on={filter.audience === "50+"} onClick={() => set("audience", "50+")}>
          {AUDIENCE_TEXT["50+"]}
        </Toggle>
        <Toggle on={filter.audience === "all"} onClick={() => set("audience", "all")}>
          {AUDIENCE_TEXT.all}
        </Toggle>
      </div>
      <div className="lz-tabs" role="group" aria-label="Length">
        {DURATION_BANDS.map((band) => (
          <Toggle key={band.id} on={filter.duration === band.id} onClick={() => set("duration", band.id)}>
            {band.label}
          </Toggle>
        ))}
      </div>
      {filter.duration ? <p className="hint">Length filters use the minutes written in each title. Classes whose title gives no length are hidden while a length is chosen.</p> : null}
    </div>
  );
}

function WeekPanel({ profile }: { profile: MoverProfile }) {
  const { state } = useCompanion();
  const today = localISODate();
  const week = weekPractice(state, today);
  return (
    <section className="card stack" aria-labelledby="cy-week">
      <h2 id="cy-week">{T.week}</h2>
      <ol className="cy-week">
        {week.days.map((day, index) => (
          <li key={day.date} data-active={day.sessions > 0} data-today={day.date === today} aria-label={`${formatLongDate(day.date)}: ${day.sessions} classes, ${day.minutes} minutes`}>
            <span>{WEEKDAYS[index]}</span>
            <strong>{day.sessions > 0 ? "✓" : "·"}</strong>
            <small>{day.minutes ? `${day.minutes}m` : ""}</small>
          </li>
        ))}
      </ol>
      <p>
        <strong>{week.sessions}</strong> {week.sessions === 1 ? "class" : "classes"} · <strong>{week.minutes}</strong> minutes · <strong>{week.activeDays}</strong>{" "}
        {week.activeDays === 1 ? "day" : "days"} · seated {week.seated}, standing {week.standing}
      </p>
      {!profile.seatedFirst && !profile.fallRisk && week.seated >= 2 && week.standing === 0 ? (
        <p className="hint">All your classes this week were seated. When you feel ready, try one from Standing Chair Yoga, holding the chair.</p>
      ) : null}
      <p className="hint">Completed classes also count toward exercise minutes in My Day and your weekly check-in.</p>
    </section>
  );
}

function TodayPanel({ profile, onPlay }: { profile: MoverProfile; onPlay: (video: StudioVideo) => void }) {
  const { state } = useCompanion();
  const today = localISODate();
  const plan = useMemo(() => recommendToday(profile, state, today), [profile, state, today]);
  const chosen = videoByYoutubeId(state.customize.picks[todayPickKey(today)] ?? "");
  const main = chosen ?? plan.main;
  if (!main) return null;
  return (
    <section className="cy-today" aria-labelledby="cy-today">
      <p className="kicker">{formatLongDate(today)}</p>
      <h2 id="cy-today">{chosen ? `${T.today} · ${T.todayChosen}` : T.today}</h2>
      <div className="cy-today-grid">
        <Thumb video={main} onPlay={() => onPlay(main)} />
        <div className="stack">
          <h3>{main.title}</h3>
          <p className="cy-channel">{main.instructor}</p>
          <VideoTags video={main} />
          {chosen ? <p>You chose this class for today.</p> : (
            <ul className="lz-steps">
              {plan.reasons.map((reason) => (
                <li key={reason}>{reason}</li>
              ))}
            </ul>
          )}
          <button type="button" className="btn btn-primary cy-play" onClick={() => onPlay(main)}>
            ▶ {T.play}
          </button>
          <CompleteControls video={main} />
          <div className="lz-buttons">
            {!chosen ? <ChooseToday video={main} /> : null}
            <FavoriteButton id={`video:${main.id}`} label="this class" />
          </div>
        </div>
      </div>
      <ul className="cy-cautions">
        {plan.cautions.map((caution) => (
          <li key={caution}>{caution}</li>
        ))}
      </ul>
      <div className="cy-alts">
        {[
          { label: T.seatedAlt, video: main.studio.position === "seated" ? plan.seatedAlternative : alternativeFor(main, "seated") },
          { label: T.standingAlt, video: profile.seatedFirst ? null : main.studio.position === "seated" ? plan.standingAlternative ?? alternativeFor(main, "standing") : plan.standingAlternative },
        ].map(({ label, video }) =>
          video ? (
            <button key={label} type="button" className="cy-alt" onClick={() => onPlay(video)}>
              <span className="kicker">{label}</span>
              <strong>{video.title}</strong>
              <span className="hint">
                {video.instructor} · {lengthLabel(video)}
              </span>
            </button>
          ) : null,
        )}
      </div>
    </section>
  );
}

function FallbackPractice({ section, profile }: { section: StudioSection | "all"; profile: MoverProfile }) {
  const { state } = useCompanion();
  const category = SECTION_INFO[section === "all" ? "seated" : section].fallbackCategory;
  const session = buildSession({ category, minutes: Math.min(20, state.movement.minutes) }, profile);
  return (
    <div className="stack cy-empty">
      <p>
        <strong>{T.noMatch}</strong> {T.noMatchHelp}
      </p>
      <h3>LifeZoi written practice: {session.title}, {session.minutes} minutes</h3>
      <SessionPlayer session={session} />
    </div>
  );
}

export function ChairYogaStudioView() {
  const { ready, mover, companion } = useProfile();
  const [filter, setFilter] = useState<StudioFilter>(EMPTY_FILTER);
  const [playing, setPlaying] = useState<StudioVideo | null>(null);
  const all = libraryVideos();
  const counts = sectionCounts(all);
  const shown = filterVideos(filter, all);
  const favorites = all.filter((video) => companion.media.favorites.includes(`video:${video.id}`));

  function play(video: StudioVideo) {
    setPlaying(video);
    commitCompanion((current) => addRecent(current, `video:${video.id}`, new Date().toISOString()));
  }

  if (!ready) return <p className="hint">Loading Chair Yoga Studio…</p>;
  const sections = filter.section === "all" ? STUDIO_SECTIONS : [filter.section];
  return (
    <div className="stack-lg cy-studio">
      <div className="lz-hello cy-hero">
        <p className="kicker">{T.kicker}</p>
        <h1>{T.title}</h1>
        <p>{T.intro}</p>
        <p className="hint">
          {all.length} free classes: {counts.seated} seated, {counts.standing} standing with a chair, {counts.gentle} gentle yoga and mobility.
        </p>
      </div>
      <SaveNote />
      <section className="card stack cy-safety" aria-labelledby="cy-safety">
        <h2 id="cy-safety">Before you start</h2>
        <ul className="lz-steps">
          <li>{T.sturdyChair}</li>
          <li>{T.stopIf}</li>
          <li>{T.balanceCare}</li>
          <li>{T.notTreatment} If you have a health condition, a recent surgery, or an injury, ask a qualified professional first.</li>
        </ul>
      </section>

      <TodayPanel profile={mover} onPlay={play} />
      <WeekPanel profile={mover} />

      <section className="stack" aria-labelledby="cy-library">
        <h2 id="cy-library">Video library</h2>
        <div className="lz-tabs" role="group" aria-label="Category">
          <Toggle on={filter.section === "all"} onClick={() => setFilter({ ...filter, section: "all" })}>
            All ({all.length})
          </Toggle>
          {STUDIO_SECTIONS.map((section) => (
            <Toggle key={section} on={filter.section === section} onClick={() => setFilter({ ...filter, section })}>
              {SECTION_INFO[section].title} ({counts[section]})
            </Toggle>
          ))}
        </div>
        <Filters filter={filter} setFilter={setFilter} />
        <p className="hint">
          {shown.length} of {all.length} classes shown. {T.labelsNote}
        </p>
        {shown.length === 0 ? <FallbackPractice section={filter.section} profile={mover} /> : null}
        {sections.map((section) => {
          const list = shown.filter((video) => video.studio.section === section);
          if (list.length === 0) return null;
          const info = SECTION_INFO[section];
          return (
            <section key={section} className="cy-section stack" data-section={section} aria-labelledby={`cy-${section}`}>
              <div>
                <h3 id={`cy-${section}`} className="cy-section-title">
                  {info.title}
                </h3>
                <p>{info.summary}</p>
                <p className="hint">Includes: {info.includes.join(" · ")}</p>
              </div>
              <div className="cy-grid">
                {list.map((video) => (
                  <VideoCard key={video.id} video={video} profile={mover} onPlay={play} />
                ))}
              </div>
            </section>
          );
        })}
      </section>

      {favorites.length > 0 ? (
        <section className="card stack" aria-labelledby="cy-favorites">
          <h2 id="cy-favorites">{T.favorites}</h2>
          <div className="cy-grid">
            {favorites.map((video) => (
              <VideoCard key={video.id} video={video} profile={mover} onPlay={play} />
            ))}
          </div>
        </section>
      ) : null}

      <section className="card card-quiet stack" aria-labelledby="cy-add">
        <h2 id="cy-add">{T.addVideos}</h2>
        <p>
          Every class here was confirmed public and embeddable through YouTube&apos;s free oEmbed check on {formatLongDate(STUDIO_VERIFIED_ON)}. Titles and
          channels are copied from YouTube. New classes are added by an administrator after the same check.
        </p>
        <p className="hint">
          <Link href="/academy/move/library/manage">Content sources and approvals</Link> · <Link href="/academy/move/library">Wellness Library</Link> ·{" "}
          <Link href="/academy/move/studio/categories/chair">Chair Movement Studio</Link>
        </p>
      </section>

      <PlayerDialog video={playing} onClose={() => setPlaying(null)} />
    </div>
  );
}

/** Small card for My Day: today's class, with a link into the studio. */
export function ChairYogaTodayCard() {
  const { ready, mover, companion } = useProfile();
  if (!ready) return null;
  const today = localISODate();
  const chosen = videoByYoutubeId(companion.customize.picks[todayPickKey(today)] ?? "");
  const main = chosen ?? recommendToday(mover, companion, today).main;
  if (!main) return null;
  const done = companion.days[today]?.entries[activityIdFor(main)];
  return (
    <section className="card stack cy-mini" aria-labelledby="cy-mini">
      <p className="kicker">Chair Yoga Studio</p>
      <h2 id="cy-mini">{chosen ? "Today's class" : "Today's recommended class"}</h2>
      <div className="cy-mini-row">
        {/* eslint-disable-next-line @next/next/no-img-element -- official YouTube thumbnail */}
        <img src={main.studio.thumbnailUrl} alt="" loading="lazy" width={160} height={120} />
        <div className="stack">
          <strong>{main.title}</strong>
          <span className="hint">
            {main.instructor} · {POSITION_TEXT[main.studio.position]} · {lengthLabel(main)}
          </span>
          {done && done.status !== "skipped" ? <span className="cy-done">✓ Completed today</span> : null}
        </div>
      </div>
      <Link className="btn btn-primary" href="/academy/move/studio/chair-yoga">
        ▶ Open Chair Yoga Studio
      </Link>
    </section>
  );
}
