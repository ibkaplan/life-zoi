"use client";

import { SessionMusicControls } from "@/components/background-music/controls";
import { AudioFocusClaim } from "@/components/background-music/use-audio-focus";
import { ListenToSteps } from "@/components/voice/read-aloud";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { FavoriteButton, SaveNote } from "@/components/companion/shared";
import { useProfile } from "@/components/companion/use-profile";
import { useDates } from "@/components/companion/i18n";
import { useLocale, useT } from "@/components/locale-provider";
import { addRecent, clearEntry, recordEntry } from "@/lib/companion/state";
import { commitCompanion, useCompanion } from "@/lib/companion/store";
import { localISODate } from "@/lib/dates";
import type { Translate } from "@/lib/i18n/translate";
import { DAILY_CATEGORIES, DAILY_VERIFIED_ON, type DailyCategory } from "@/lib/wellness-library/daily-movement-videos";
import {
  activityIdFor,
  AUDIENCE_TEXT,
  CATEGORY_INFO,
  categoryCounts,
  CHAIR_STUDIO_PATH,
  DAILY_TEXT as T,
  dailyProfile,
  dailyVideos,
  LEVEL_TEXT,
  planDay,
  POSITION_TEXT,
  PREFER_CHAIR_KEY,
  videosIn,
  type DailyVideo,
  type PlanItem,
  type Routine,
  type SessionPlan,
} from "@/lib/wellness-library/daily-movement";

function lengthText(video: DailyVideo, t: Translate): string {
  return video.minutes === null ? t(T.lengthUnknown) : t("{minutes} min ({note})", { minutes: video.minutes, note: t(T.lengthFromTitle) });
}

function Thumb({ video, onPlay }: { video: DailyVideo; onPlay: () => void }) {
  const [failed, setFailed] = useState(false);
  const t = useT();
  return (
    <button type="button" className="cy-thumb dm-thumb" onClick={onPlay} aria-label={`${t(T.play)}: ${video.title}`}>
      {failed ? (
        <span className="cy-thumb-fallback" aria-hidden="true">
          {video.channel}
        </span>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element -- official YouTube thumbnail, loaded from i.ytimg.com
        <img src={video.thumbnailUrl} alt="" loading="lazy" width={480} height={360} onError={() => setFailed(true)} />
      )}
      <span className="cy-thumb-play" aria-hidden="true">
        ▶
      </span>
      {video.minutes !== null ? <span className="cy-thumb-time">{t("{minutes} min", { minutes: video.minutes })}</span> : null}
    </button>
  );
}

function VideoTags({ video }: { video: DailyVideo }) {
  const t = useT();
  const { locale } = useLocale();
  return (
    <ul className="lz-meta" aria-label={t("Class details")}>
      <li className="dm-tag">{t(CATEGORY_INFO[video.category].title)}</li>
      <li>{t(POSITION_TEXT[video.position])}</li>
      <li>{t(LEVEL_TEXT[video.level])}</li>
      <li>{t(AUDIENCE_TEXT[video.audience])}</li>
      <li>{lengthText(video, t)}</li>
      {video.balance ? <li className="lz-meta-warn">{t("Balance · keep support nearby")}</li> : null}
      {video.talking === "no" ? <li className="lz-meta-warn">{t(T.noTalking)}</li> : null}
      {locale !== "en" ? <li>{t("Video in English")}</li> : null}
    </ul>
  );
}

function DoneControls({ id, minutes }: { id: string; minutes: number }) {
  const { state } = useCompanion();
  const today = localISODate();
  const entry = state.days[today]?.entries[id];
  const t = useT();
  if (entry && entry.status !== "skipped") {
    return (
      <p role="status" className="cy-done">
        ✓ {t("Completed today")} · {t("{minutes} min", { minutes: entry.minutes })}{" "}
        <button className="btn btn-ghost" type="button" onClick={() => commitCompanion((current) => clearEntry(current, today, id))}>
          {t("Undo")}
        </button>
      </p>
    );
  }
  return (
    <button
      className="btn btn-teal"
      type="button"
      onClick={() => commitCompanion((current) => recordEntry(current, today, id, { status: "done", minutes, replacedWith: "" }, { exerciseMinutes: minutes }))}
    >
      ✓ {t(T.markDone)}
    </button>
  );
}

/** The official YouTube player in a full-screen panel with a clear way back. */
function PlayerDialog({ video, onClose }: { video: DailyVideo | null; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const t = useT();
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (video && !dialog.open) dialog.showModal();
    if (!video && dialog.open) dialog.close();
  }, [video]);
  return (
    <dialog ref={ref} className="cy-dialog" onClose={onClose} aria-label={video ? video.title : t(T.title)}>
      {video ? (
        <div className="stack">
          <div className="cy-dialog-bar">
            <button type="button" className="btn btn-primary cy-back" onClick={onClose}>
              ← {t(T.back)}
            </button>
            <a className="btn btn-secondary" href={video.originalUrl} target="_blank" rel="noopener noreferrer">
              {t(T.openOnYoutube)} ↗
            </a>
          </div>
          <h2 className="cy-dialog-title">{video.title}</h2>
          <p className="hint">
            {video.channel} · {lengthText(video, t)}
          </p>
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
          <SessionMusicControls />
          <p className="hint">{t(T.playerNote)}</p>
          <p className="studio-safety-line">
            {t(T.space)} {t(T.stopIf)} {video.balance ? t(T.balanceCare) : ""} {t(T.notTreatment)}
          </p>
          <DoneControls id={activityIdFor(video)} minutes={video.minutes ?? 15} />
          <FavoriteButton id={`video:${video.id}`} label="this class" />
        </div>
      ) : null}
    </dialog>
  );
}

function RoutineBlock({ routine }: { routine: Routine }) {
  const t = useT();
  const steps = routine.steps.map((step) => t(step));
  return (
    <div className="dm-routine stack">
      <h4>
        {t(routine.title)} · {t("{minutes} min", { minutes: routine.minutes })}
      </h4>
      <ListenToSteps title={t(routine.title)} steps={steps} label={t(T.readSteps)} compact />
      <ol className="lz-steps">
        {steps.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
      <DoneControls id={activityIdFor(routine)} minutes={routine.minutes} />
    </div>
  );
}

function PlanVideo({ item, onPlay, onAnother }: { item: Extract<PlanItem, { kind: "video" }>; onPlay: (video: DailyVideo) => void; onAnother: () => void }) {
  const t = useT();
  const { video } = item;
  return (
    <div className="dm-plan-video">
      <Thumb video={video} onPlay={() => onPlay(video)} />
      <div className="stack">
        <p className="kicker">
          {t(CATEGORY_INFO[item.category].title)} · {t(CATEGORY_INFO[item.category].length)}
        </p>
        <h4>{video.title}</h4>
        <p className="cy-channel">{video.channel}</p>
        <VideoTags video={video} />
        <p>{t(video.note)}</p>
        <button type="button" className="btn btn-primary cy-play" onClick={() => onPlay(video)}>
          ▶ {t(T.play)}
        </button>
        <div className="lz-buttons">
          <button type="button" className="btn btn-ghost" onClick={onAnother}>
            ↻ {t(T.another)}
          </button>
          <FavoriteButton id={`video:${video.id}`} label="this class" />
        </div>
      </div>
    </div>
  );
}

function SessionCard({ plan, onPlay, onAnother }: { plan: SessionPlan; onPlay: (video: DailyVideo) => void; onAnother: () => void }) {
  const t = useT();
  const id = `dm-${plan.slot}`;
  return (
    <section className="dm-session stack" data-slot={plan.slot} aria-labelledby={id}>
      <div>
        <h3 id={id}>
          {plan.slot === "morning" ? "☀ " : "☾ "}
          {t(plan.slot === "morning" ? T.morning : T.evening)}
        </h3>
        {plan.minutes !== null ? <p className="hint">{t(T.total, { minutes: plan.minutes })}</p> : null}
      </div>
      {plan.items.map((item, index) => (
        <div key={item.kind === "video" ? item.video.id : item.routine.id} className="stack">
          {index > 0 ? <p className="dm-then">+ {t(T.then)}</p> : null}
          {item.kind === "video" ? <PlanVideo item={item} onPlay={onPlay} onAnother={onAnother} /> : <RoutineBlock routine={item.routine} />}
        </div>
      ))}
    </section>
  );
}

function VideoCard({ video, onPlay }: { video: DailyVideo; onPlay: (video: DailyVideo) => void }) {
  const t = useT();
  return (
    <article className="cy-card dm-card">
      <Thumb video={video} onPlay={() => onPlay(video)} />
      <div className="cy-card-body">
        <h3>{video.title}</h3>
        <p className="cy-channel">
          <a href={video.channelUrl} target="_blank" rel="noopener noreferrer">
            {video.channel}
          </a>
        </p>
        <VideoTags video={video} />
        <p>{t(video.note)}</p>
        <button type="button" className="btn btn-primary cy-play" onClick={() => onPlay(video)}>
          ▶ {t(T.play)}
        </button>
        <FavoriteButton id={`video:${video.id}`} label="this class" />
      </div>
    </article>
  );
}

function ChairChoice({ chairFirst, prefersChair }: { chairFirst: boolean; prefersChair: boolean }) {
  const t = useT();
  return (
    <section className={`card stack dm-chair${chairFirst ? " is-first" : ""}`} aria-labelledby="dm-chair">
      <h2 id="dm-chair">{t("Chair Yoga Studio")}</h2>
      <p>{t(T.chairInsteadHelp)}</p>
      <div className="lz-buttons">
        <Link className="btn btn-primary" href={CHAIR_STUDIO_PATH}>
          ▶ {t(T.openChair)}
        </Link>
        <button
          type="button"
          className="btn btn-secondary"
          aria-pressed={prefersChair}
          onClick={() =>
            commitCompanion((current) => {
              const picks = { ...current.customize.picks };
              if (prefersChair) delete picks[PREFER_CHAIR_KEY];
              else picks[PREFER_CHAIR_KEY] = "yes";
              return { ...current, customize: { ...current.customize, picks } };
            })
          }
        >
          {prefersChair ? `✓ ${t(T.chairInstead)}` : t(T.chairInstead)}
        </button>
      </div>
    </section>
  );
}

export function DailyMovementView() {
  const { ready, answers, companion } = useProfile();
  const [playing, setPlaying] = useState<DailyVideo | null>(null);
  const [offsets, setOffsets] = useState({ morning: 0, evening: 0, extra: 0 });
  const [category, setCategory] = useState<DailyCategory | "all">("all");
  const t = useT();
  const dates = useDates();
  const { locale } = useLocale();
  const today = localISODate();
  const prefersChair = companion.customize.picks[PREFER_CHAIR_KEY] === "yes";
  const profile = useMemo(() => dailyProfile(answers, companion.movement, prefersChair), [answers, companion.movement, prefersChair]);
  const plan = useMemo(() => planDay(profile, today, offsets), [profile, today, offsets]);
  const counts = categoryCounts();

  function play(video: DailyVideo) {
    setPlaying(video);
    commitCompanion((current) => addRecent(current, `video:${video.id}`, new Date().toISOString()));
  }
  const another = (slot: "morning" | "evening") => () => setOffsets((current) => ({ ...current, [slot]: current[slot] + 1 }));

  if (!ready) return <p className="hint">{t("Loading Daily Movement…")}</p>;
  const shownCategories = category === "all" ? DAILY_CATEGORIES : [category];
  return (
    <div className="stack-lg cy-studio dm-studio">
      <div className="lz-hello dm-hero">
        <p className="kicker">{t(T.kicker)}</p>
        <h1>{t(T.title)}</h1>
        <p>{t(T.intro)}</p>
        <p className="hint">{t("{total} free classes from YouTube instructors in 9 categories.", { total: dailyVideos.length })}</p>
        {locale !== "en" ? <p className="hint">{t("The classes are YouTube videos in English. Their titles are shown as published on YouTube; everything around them is translated.")}</p> : null}
      </div>
      <SaveNote />

      <section className="card stack cy-safety" aria-labelledby="dm-safety">
        <h2 id="dm-safety">{t("Before you start")}</h2>
        <ul className="lz-steps">
          {plan.cautions.map((caution) => (
            <li key={caution}>{t(caution)}</li>
          ))}
          <li>
            {t(T.notTreatment)} {t("If you have a health condition, a recent surgery, or an injury, ask a qualified professional first.")}
          </li>
        </ul>
      </section>

      <section className="dm-today stack" aria-labelledby="dm-today">
        <p className="kicker">{dates.long(today)}</p>
        <h2 id="dm-today">{t("Today's movement plan")}</h2>
        <ul className="lz-steps">
          {plan.reasons.map((reason) => (
            <li key={reason}>{t(reason)}</li>
          ))}
        </ul>
        {!answers ? (
          <p>
            <Link href="/assessment">{t("Answer the questionnaire")}</Link>
          </p>
        ) : null}
        {plan.chairFirst ? null : (
          <>
            <p className="hint">{t(T.talkingNote)}</p>
            <div className="dm-sessions">
              {plan.morning ? <SessionCard plan={plan.morning} onPlay={play} onAnother={another("morning")} /> : null}
              {plan.evening ? <SessionCard plan={plan.evening} onPlay={play} onAnother={another("evening")} /> : null}
            </div>
            {plan.extra ? (
              <div className="cy-alts">
                <button type="button" className="cy-alt" onClick={() => play(plan.extra!.video)}>
                  <span className="kicker">
                    {t(T.extra)} · {t(CATEGORY_INFO[plan.extra.category].title)}
                  </span>
                  <strong>{plan.extra.video.title}</strong>
                  <span className="hint">
                    {plan.extra.video.channel} · {lengthText(plan.extra.video, t)}
                  </span>
                </button>
              </div>
            ) : null}
          </>
        )}
      </section>

      <ChairChoice chairFirst={plan.chairFirst} prefersChair={prefersChair} />

      <section className="stack" aria-labelledby="dm-library">
        <h2 id="dm-library">{t(T.library)}</h2>
        <div className="lz-tabs" role="group" aria-label={t("Category")}>
          <button type="button" className="lz-tab" aria-pressed={category === "all"} onClick={() => setCategory("all")}>
            {t("All ({count})", { count: dailyVideos.length })}
          </button>
          {DAILY_CATEGORIES.map((item) => (
            <button key={item} type="button" className="lz-tab" aria-pressed={category === item} onClick={() => setCategory(item)}>
              {t(CATEGORY_INFO[item].title)} ({counts[item]})
            </button>
          ))}
        </div>
        <p className="hint">{t(T.labelsNote)}</p>
        {shownCategories.map((item) => (
          <section key={item} className="cy-section stack" aria-labelledby={`dm-cat-${item}`}>
            <div>
              <h3 id={`dm-cat-${item}`} className="cy-section-title dm-section-title">
                {t(CATEGORY_INFO[item].title)} · {t(CATEGORY_INFO[item].length)}
              </h3>
              <p>{t(CATEGORY_INFO[item].summary)}</p>
            </div>
            <div className="cy-grid">
              {videosIn(item).map((video) => (
                <VideoCard key={video.id} video={video} onPlay={play} />
              ))}
            </div>
          </section>
        ))}
      </section>

      <section className="card card-quiet stack" aria-labelledby="dm-verified">
        <h2 id="dm-verified">{t(T.verified)}</h2>
        <p>
          {t(
            "Every class here was confirmed public and embeddable through YouTube's free oEmbed check on {date}. Titles and channels are copied from YouTube. LifeZoi has not watched every class or checked each one for spoken instruction.",
            { date: dates.long(DAILY_VERIFIED_ON) },
          )}
        </p>
        <p className="hint">
          <Link href="/academy/move">{t("All movement")}</Link> · <Link href={CHAIR_STUDIO_PATH}>{t("Chair Yoga Studio")}</Link>
        </p>
      </section>

      <PlayerDialog video={playing} onClose={() => setPlaying(null)} />
    </div>
  );
}
