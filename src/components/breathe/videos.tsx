"use client";

import { useState } from "react";
import { AudioFocusClaim } from "@/components/background-music/use-audio-focus";
import { useT } from "@/components/locale-provider";
import { TECHNIQUES } from "@/lib/breathe/content";
import { BREATHE_VIDEO_TEXT as T, BREATHE_VIDEOS_CHECKED_ON, type BreatheVideo, videosForTechnique } from "@/lib/breathe/videos";

function VideoCard({ video, playing, onPlay, onClose }: { video: BreatheVideo; playing: boolean; onPlay: () => void; onClose: () => void }) {
  const [failed, setFailed] = useState(false);
  const t = useT();
  return (
    <article className="card stack bf-video">
      {playing ? (
        <div className="video-frame">
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
        <button type="button" className="cy-thumb" onClick={onPlay} aria-label={`${t(T.play)}: ${video.title}`}>
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
        </button>
      )}
      <h4 className="bf-video-title">{video.title}</h4>
      <p className="cy-channel">
        <a href={video.channelUrl} target="_blank" rel="noopener noreferrer">
          {video.channel}
        </a>
      </p>
      <p>{t(video.note)}</p>
      <div className="lz-buttons">
        {playing ? (
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            {t(T.close)}
          </button>
        ) : (
          <button type="button" className="btn btn-primary" onClick={onPlay}>
            ▶ {t(T.play)}
          </button>
        )}
        <a className="btn btn-secondary" href={video.originalUrl} target="_blank" rel="noopener noreferrer">
          {t(T.openOnYoutube)} ↗
        </a>
      </div>
    </article>
  );
}

/** Guided breathing videos, grouped by the techniques the Breathe for Life program teaches. */
export function BreatheVideos() {
  const t = useT();
  const [playing, setPlaying] = useState<string | null>(null);
  return (
    <section className="stack" id="videos" aria-labelledby="bf-videos">
      <h2 id="bf-videos">{t(T.heading)}</h2>
      <p>{t(T.intro)}</p>
      <p className="alert">{t(T.noHold)}</p>
      {TECHNIQUES.map((technique) => {
        const videos = videosForTechnique(technique.id);
        if (videos.length === 0) return null;
        return (
          <div key={technique.id} className="stack">
            <h3>{t(technique.title)}</h3>
            <div className="bf-cards bf-cards-2">
              {videos.map((video) => (
                <VideoCard
                  key={video.id}
                  video={video}
                  playing={playing === video.id}
                  onPlay={() => setPlaying(video.id)}
                  onClose={() => setPlaying(null)}
                />
              ))}
            </div>
          </div>
        );
      })}
      <p className="hint">{t(T.titleNote)}</p>
      <p className="hint">{t(T.playerNote)}</p>
      <p className="hint">{t(T.checked, { date: BREATHE_VIDEOS_CHECKED_ON })}</p>
    </section>
  );
}
