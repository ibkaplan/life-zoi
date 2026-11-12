"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AudioFocusClaim } from "@/components/background-music/use-audio-focus";
import { useLocale, useT } from "@/components/locale-provider";
import { addRecent, clearEntry, recordEntry } from "@/lib/companion/state";
import { commitCompanion, useCompanion } from "@/lib/companion/store";
import { localISODate } from "@/lib/dates";
import { FALL_SUPPORT, SAFETY_LINE } from "@/lib/wellness/movement-studio/catalog";
import { CATEGORY_INFO, LIBRARY_CATEGORIES, type LibraryCategory } from "@/lib/wellness-library/moves";
import {
  EQUIPMENT_LABEL,
  LEVEL_LABEL,
  LIBRARY_VIDEOS,
  POSITION_LABEL,
  slotsFor,
  VIDEO_LEVELS,
  videoCount,
  type LibrarySlot,
  type LibraryVideo,
  type VideoLevel,
} from "@/lib/wellness-library/video-library";

const ICONS: Record<LibraryCategory, string> = {
  pilates: "🧘‍♀️",
  yoga: "🪷",
  aerobics: "🏃",
  dance: "💃",
  "home-cardio": "❤️",
  strength: "💪",
  chair: "🪑",
  stretching: "🤸",
  "tai-chi": "☯️",
  qigong: "🌿",
  balance: "⚖️",
  breathing: "🌬️",
  "brain-training": "🧠",
  meditation: "🕯️",
};

const BALANCE_CATEGORIES: ReadonlySet<LibraryCategory> = new Set(["balance", "tai-chi", "qigong", "chair", "yoga"]);

/** Picks the video for a slot that matches the chosen level, or the slot's main video. */
function pick(slot: LibrarySlot, level: VideoLevel | "all"): { video: LibraryVideo | null; matchesLevel: boolean } {
  const all = slot.video ? [slot.video, ...slot.alternatives] : [];
  if (level === "all") return { video: all[0] ?? null, matchesLevel: true };
  const match = all.find((video) => video.level === level);
  return { video: match ?? all[0] ?? null, matchesLevel: Boolean(match) };
}

function formatClock(seconds: number): string {
  const total = Math.max(0, Math.floor(seconds));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = String(total % 60).padStart(2, "0");
  return h > 0 ? `${h}:${String(m).padStart(2, "0")}:${s}` : `${m}:${s}`;
}

type PlayerInfo = { state: "loading" | "playing" | "paused" | "ended"; time: number; duration: number; volume: number; muted: boolean };

/**
 * YouTube's official embedded player, driven by its documented postMessage
 * commands (enablejsapi=1). No YouTube script and no API key are loaded. The
 * player's own controls stay visible too, so it still works if a command fails.
 */
function VideoPlayerPanel({ video, activity }: { video: LibraryVideo; activity: string }) {
  const t = useT();
  const frameRef = useRef<HTMLIFrameElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const [info, setInfo] = useState<PlayerInfo>({ state: "loading", time: 0, duration: 0, volume: 100, muted: false });
  // Rendered only after a person presses play, so the browser origin is known.
  const origin = typeof window === "undefined" ? "" : window.location.origin;

  const send = useCallback((func: string, args: unknown[] = []) => {
    frameRef.current?.contentWindow?.postMessage(JSON.stringify({ event: "command", func, args }), "*");
  }, []);

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (!/^https:\/\/www\.youtube(-nocookie)?\.com$/.test(event.origin)) return;
      if (event.source !== frameRef.current?.contentWindow) return;
      type PlayerMessage = { event?: string; info?: unknown };
      let data: PlayerMessage | null = null;
      try {
        data = typeof event.data === "string" ? (JSON.parse(event.data) as PlayerMessage) : null;
      } catch {
        return;
      }
      if (!data) return;
      if (data.event === "onStateChange" && typeof data.info === "number") {
        const code = data.info;
        setInfo((current) => ({ ...current, state: code === 1 ? "playing" : code === 0 ? "ended" : code === 2 ? "paused" : current.state }));
      }
      if (data.event === "infoDelivery" && data.info && typeof data.info === "object") {
        const next = data.info as { currentTime?: number; duration?: number; playerState?: number; volume?: number; muted?: boolean };
        setInfo((current) => ({
          state:
            next.playerState === 1 ? "playing" : next.playerState === 2 ? "paused" : next.playerState === 0 ? "ended" : current.state,
          time: typeof next.currentTime === "number" ? next.currentTime : current.time,
          duration: typeof next.duration === "number" && next.duration > 0 ? next.duration : current.duration,
          volume: typeof next.volume === "number" ? next.volume : current.volume,
          muted: typeof next.muted === "boolean" ? next.muted : current.muted,
        }));
      }
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  const listen = () => {
    frameRef.current?.contentWindow?.postMessage(JSON.stringify({ event: "listening", id: video.youtubeId, channel: "widget" }), "*");
  };

  const fullscreen = () => {
    const box = boxRef.current;
    if (!box) return;
    if (document.fullscreenElement) void document.exitFullscreen();
    else if (box.requestFullscreen) void box.requestFullscreen().catch(() => frameRef.current?.requestFullscreen?.());
  };

  const playing = info.state === "playing";
  const src = origin ? `${video.embedUrl}?enablejsapi=1&autoplay=1&rel=0&playsinline=1&origin=${encodeURIComponent(origin)}` : "";

  return (
    <div className="vl-player stack">
      <div ref={boxRef} className="vl-player-box">
        <div className="video-frame vl-frame">
          <AudioFocusClaim id="video-player" />
          {src ? (
            <iframe
              ref={frameRef}
              src={src}
              title={`${activity}: ${video.title}`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
              onLoad={listen}
            />
          ) : null}
        </div>
        <div className="vl-controls" role="group" aria-label={t("Video controls")}>
          <div className="vl-buttons">
            {playing ? (
              <button type="button" className="btn btn-primary vl-big" onClick={() => send("pauseVideo")}>
                ❚❚ {t("Pause")}
              </button>
            ) : (
              <button type="button" className="btn btn-primary vl-big" onClick={() => send("playVideo")}>
                ▶ {info.state === "paused" ? t("Resume") : t("Play")}
              </button>
            )}
            <button
              type="button"
              className="btn btn-secondary vl-big"
              onClick={() => {
                send("seekTo", [0, true]);
                send("playVideo");
              }}
            >
              ↺ {t("Restart")}
            </button>
            <button type="button" className="btn btn-secondary vl-big" onClick={fullscreen}>
              ⛶ {t("Full screen")}
            </button>
          </div>
          <label className="vl-range">
            <span>
              {t("Progress")} · {formatClock(info.time)}
              {info.duration > 0 ? ` / ${formatClock(info.duration)}` : ""}
            </span>
            <input
              type="range"
              min={0}
              max={Math.max(1, Math.round(info.duration))}
              step={1}
              value={Math.round(info.time)}
              disabled={info.duration <= 0}
              onChange={(event) => {
                const to = Number(event.target.value);
                setInfo((current) => ({ ...current, time: to }));
                send("seekTo", [to, true]);
              }}
            />
          </label>
          <label className="vl-range">
            <span>
              {t("Volume")} · {info.muted ? t("Muted") : `${info.volume}%`}
            </span>
            <span className="vl-volume">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => {
                  send(info.muted ? "unMute" : "mute");
                  setInfo((current) => ({ ...current, muted: !current.muted }));
                }}
              >
                {info.muted ? `🔈 ${t("Unmute")}` : `🔇 ${t("Mute")}`}
              </button>
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={info.volume}
                aria-label={t("Volume")}
                onChange={(event) => {
                  const volume = Number(event.target.value);
                  send("setVolume", [volume]);
                  if (info.muted) send("unMute");
                  setInfo((current) => ({ ...current, volume, muted: false }));
                }}
              />
            </span>
          </label>
        </div>
      </div>
      <p className="hint">{t("The player's own buttons also work: tap the video to play or pause, and use the bar under it to move through the class.")}</p>
    </div>
  );
}

function DoneButton({ video }: { video: LibraryVideo }) {
  const t = useT();
  const { state } = useCompanion();
  const today = localISODate();
  const id = `vl-${video.youtubeId}`;
  const entry = state.days[today]?.entries[id];
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
      className="btn btn-teal vl-big"
      type="button"
      onClick={() =>
        commitCompanion((current) =>
          recordEntry(current, today, id, { status: "done", minutes: video.minutes, replacedWith: "" }, { exerciseMinutes: video.minutes }),
        )
      }
    >
      ✓ {t("I finished this class")}
    </button>
  );
}

function PlayerDialog({ video, onClose }: { video: LibraryVideo | null; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const t = useT();
  const { locale } = useLocale();
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (video && !dialog.open) dialog.showModal();
    if (!video && dialog.open) dialog.close();
  }, [video]);
  const activity = video ? t(CATEGORY_INFO[video.category].title) : "";
  return (
    <dialog ref={ref} className="cy-dialog vl-dialog" onClose={onClose} aria-label={video ? video.title : t("Wellness Library")}>
      {video ? (
        <div className="stack">
          <div className="cy-dialog-bar">
            <button type="button" className="btn btn-primary cy-back" onClick={onClose}>
              ← {t("Back to the library")}
            </button>
            <a className="btn btn-secondary" href={video.originalUrl} target="_blank" rel="noopener noreferrer">
              {t("Open on YouTube")} ↗
            </a>
          </div>
          <p className="kicker">
            {t("{minutes}-minute {activity}", { minutes: video.minutes, activity })}
          </p>
          <h2 className="cy-dialog-title">{video.title}</h2>
          <ul className="lz-meta" aria-label={t("Class details")}>
            <li>{t(LEVEL_LABEL[video.level])}</li>
            <li>{t(POSITION_LABEL[video.position])}</li>
            <li>{t("{minutes} min (from the title)", { minutes: video.minutes })}</li>
            {video.equipment.length > 0 ? <li>{t("Equipment: {list}", { list: video.equipment.map((item) => t(EQUIPMENT_LABEL[item])).join(", ") })}</li> : null}
            {locale !== "en" ? <li>{t("Video in English")}</li> : null}
          </ul>
          <VideoPlayerPanel key={video.id} video={video} activity={activity} />
          <DoneButton video={video} />
          <p className="studio-safety-line">{t(SAFETY_LINE)}</p>
          {BALANCE_CATEGORIES.has(video.category) ? <p className="studio-safety-line">{t(FALL_SUPPORT)}</p> : null}
          <p className="hint">
            {t("Instructor: {name}.", { name: video.instructor })}{" "}
            <a href={video.channelUrl} target="_blank" rel="noopener noreferrer">
              {t("Visit the channel")}
            </a>
            {" · "}
            {t("Shown with YouTube's official player under YouTube's standard license. LifeZoi does not copy or store the video.")}
          </p>
        </div>
      ) : null}
    </dialog>
  );
}

function SlotCard({ slot, level, activity, onPlay }: { slot: LibrarySlot; level: VideoLevel | "all"; activity: string; onPlay: (video: LibraryVideo) => void }) {
  const t = useT();
  const [failed, setFailed] = useState(false);
  const { video, matchesLevel } = pick(slot, level);
  const heading = t("{minutes}-minute {activity}", { minutes: slot.minutes, activity });
  if (!video) {
    return (
      <article className="vl-card vl-card-missing" aria-label={heading}>
        <div className="vl-missing-time" aria-hidden="true">
          {slot.minutes}
          <small>{t("min")}</small>
        </div>
        <h3>{heading}</h3>
        <p className="hint">{t("Not available yet. No checked video for this length has been added.")}</p>
      </article>
    );
  }
  return (
    <article className="vl-card">
      <button type="button" className="cy-thumb vl-thumb" onClick={() => onPlay(video)} aria-label={`${t("Play video")}: ${heading}`}>
        {failed ? (
          <span className="cy-thumb-fallback" aria-hidden="true">
            {video.instructor}
          </span>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element -- official YouTube thumbnail, loaded from i.ytimg.com
          <img src={video.thumbnailUrl} alt="" loading="lazy" width={480} height={360} onError={() => setFailed(true)} />
        )}
        <span className="cy-thumb-play" aria-hidden="true">
          ▶
        </span>
        <span className="cy-thumb-time">{t("{minutes} min", { minutes: slot.minutes })}</span>
      </button>
      <h3>{heading}</h3>
      <p className="vl-title">{video.title}</p>
      <ul className="lz-meta" aria-label={t("Class details")}>
        <li className={`vl-level vl-level-${video.level}`}>{t(LEVEL_LABEL[video.level])}</li>
        <li>{t(POSITION_LABEL[video.position])}</li>
      </ul>
      <p className="hint">
        {t("Instructor: {name}.", { name: video.instructor })}
        {!matchesLevel ? ` ${t("No class at your chosen level for this length yet, so this one is shown.")}` : ""}
      </p>
      <button type="button" className="btn btn-primary vl-big vl-play" onClick={() => onPlay(video)}>
        ▶ {t("PLAY VIDEO")}
      </button>
    </article>
  );
}

/** The Wellness Library's video collection: pick an activity, pick a length, play. */
export function VideoLibrary({ initialCategory = "pilates" }: { initialCategory?: LibraryCategory }) {
  const t = useT();
  const [category, setCategory] = useState<LibraryCategory>(initialCategory);
  const [level, setLevel] = useState<VideoLevel | "all">("all");
  const [playing, setPlaying] = useState<LibraryVideo | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const info = CATEGORY_INFO[category];
  const activity = t(info.title);
  const slots = slotsFor(category);
  const ready = slots.filter((slot) => slot.video).length;

  const play = (video: LibraryVideo) => {
    setPlaying(video);
    commitCompanion((current) => addRecent(current, `libvideo:${video.youtubeId}`, new Date().toISOString()));
  };

  return (
    <div className="stack-lg">
      <section className="card stack" aria-labelledby="vl-step-1">
        <h2 id="vl-step-1">{t("Step 1: Choose an activity")}</h2>
        <div className="vl-categories" role="group" aria-label={t("Library category")}>
          {LIBRARY_CATEGORIES.map((value) => (
            <button
              key={value}
              type="button"
              className={`vl-category vl-cat-${value}`}
              aria-pressed={value === category}
              onClick={() => {
                setCategory(value);
                window.requestAnimationFrame(() => sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
              }}
            >
              <span className="vl-category-icon" aria-hidden="true">
                {ICONS[value]}
              </span>
              <span className="vl-category-name">{t(CATEGORY_INFO[value].title)}</span>
              <span className="vl-category-count">{t("{count} of 6 lengths", { count: videoCount(value) })}</span>
            </button>
          ))}
        </div>
      </section>

      <section ref={sectionRef} className="card stack vl-section" aria-labelledby="vl-step-2">
        <p className="kicker">
          {ICONS[category]} {activity}
        </p>
        <h2 id="vl-step-2">{t("Step 2: Choose how long")}</h2>
        <p>{t(info.summary)}</p>
        <p className="hint">
          {t("{ready} of 6 lengths have a checked video. Lengths without one say so; LifeZoi does not replace them with a text routine.", { ready })}
        </p>
        <div className="lz-tabs" role="group" aria-label={t("Level")}>
          <button type="button" className="lz-tab" aria-pressed={level === "all"} onClick={() => setLevel("all")}>
            {t("All levels")}
          </button>
          {VIDEO_LEVELS.map((value) => (
            <button key={value} type="button" className="lz-tab" aria-pressed={level === value} onClick={() => setLevel(value)}>
              {t(LEVEL_LABEL[value])}
            </button>
          ))}
        </div>
        <p className="hint">{t("Choose the level that fits how you move today. LifeZoi never makes a class harder because of age.")}</p>
        <div className="vl-grid">
          {slots.map((slot) => (
            <SlotCard key={`${slot.category}-${slot.minutes}`} slot={slot} level={level} activity={activity} onPlay={play} />
          ))}
        </div>
        <p className="hint">{t("Step 3: Press PLAY VIDEO. The class opens and plays here in LifeZoi.")}</p>
      </section>
      <PlayerDialog video={playing} onClose={() => setPlaying(null)} />
    </div>
  );
}

/** Total checked videos, for headings. */
export const LIBRARY_VIDEO_TOTAL = LIBRARY_VIDEOS.length;
