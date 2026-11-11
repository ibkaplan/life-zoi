"use client";

import { useEffect, useRef, useState } from "react";
import { AudioFocusClaim } from "@/components/background-music/use-audio-focus";
import { useLocale } from "@/components/locale-provider";
import {
  lengthText,
  NOSTRIL_HANDS,
  PRACTICE_SAFETY,
  PRACTICE_VIDEOS,
  practiceEmbedSrc,
  practiceThumbnail,
  practiceWatchUrl,
  type PracticeVideo,
} from "@/lib/breathe/practice-videos";

/*
 * Explore Breathing Practices. The text in this section is English on purpose
 * (see src/lib/breathe/practice-videos.ts), so it is not passed through t().
 */

function Thumb({ video, onPlay }: { video: PracticeVideo; onPlay: () => void }) {
  const [failed, setFailed] = useState(false);
  return (
    <button type="button" className="cy-thumb bp-thumb" data-tone={video.tone} onClick={onPlay} aria-label={`Play video: ${video.technique}`}>
      {failed ? (
        <span className="cy-thumb-fallback bp-thumb-fallback" aria-hidden="true">
          {video.technique}
        </span>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element -- official YouTube thumbnail, loaded from i.ytimg.com
        <img src={practiceThumbnail(video.youtubeId)} alt="" loading="lazy" width={480} height={360} onError={() => setFailed(true)} />
      )}
      <span className="cy-thumb-play" aria-hidden="true">
        ▶
      </span>
      {video.minutes !== null ? <span className="cy-thumb-time">{video.minutes} min</span> : null}
    </button>
  );
}

function HandSteps({ compact = false }: { compact?: boolean }) {
  return (
    <div className="bp-hands" role="note">
      <p className="bp-hands-title">
        <span aria-hidden="true">✋</span> {compact ? "Hand position for closing one nostril" : "How to close one nostril, step by step"}
      </p>
      <ol>
        {NOSTRIL_HANDS.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
    </div>
  );
}

function PlayerDialog({ video, onClose }: { video: PracticeVideo | null; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (video && !dialog.open) dialog.showModal();
    if (!video && dialog.open) dialog.close();
  }, [video]);
  const src = video ? practiceEmbedSrc(video.youtubeId) : null;
  return (
    <dialog ref={ref} className="cy-dialog bp-dialog" onClose={onClose} aria-label={video ? video.technique : "Breathing practice video"}>
      {video ? (
        <div className="stack">
          <div className="cy-dialog-bar">
            <button type="button" className="btn btn-primary cy-back" onClick={onClose}>
              ← Back to breathing practices
            </button>
            <a className="btn btn-secondary" href={practiceWatchUrl(video.youtubeId)} target="_blank" rel="noopener noreferrer">
              Open on YouTube ↗
            </a>
          </div>
          <h2 className="cy-dialog-title">{video.technique}</h2>
          <p className="hint">
            “{video.title}” · {video.channel} · {lengthText(video)}
          </p>
          {src ? (
            <div className="video-frame cy-frame">
              <AudioFocusClaim id="video-player" />
              <iframe
                src={src}
                title={`${video.technique}: ${video.title}`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
              />
            </div>
          ) : (
            <p className="alert">This video cannot play inside lifeZoi. Use Open on YouTube.</p>
          )}
          <p className="bp-stop" role="note">
            <strong>Stop at once if you feel dizzy or uncomfortable.</strong> You never need to hold your breath. {video.gentle}
          </p>
          <p>
            <strong>How to sit:</strong> {video.sitting}
          </p>
          {video.hands ? <HandSteps compact /> : null}
          <p className="hint">If the video does not start, press its play button. Some videos can only be watched on YouTube; use Open on YouTube, then come back here.</p>
        </div>
      ) : null}
    </dialog>
  );
}

function PracticeCard({ video, onPlay }: { video: PracticeVideo; onPlay: (video: PracticeVideo) => void }) {
  return (
    <article className="cy-card bp-card" data-tone={video.tone}>
      <Thumb video={video} onPlay={() => onPlay(video)} />
      <div className="cy-card-body">
        <h3>{video.technique}</h3>
        <ul className="lz-meta" aria-label="Practice details">
          {video.beginner ? <li className="bp-tag-beginner">Beginner-friendly</li> : null}
          <li>Sitting · chair or mat</li>
          <li>{lengthText(video)}</li>
          <li>No breath holding</li>
        </ul>
        <p>{video.summary}</p>
        <p className="cy-channel">
          {video.channel} · <span className="bp-title">“{video.title}”</span>
        </p>
        <details className="bp-more">
          <summary>How to sit and gentle options</summary>
          <p>{video.sitting}</p>
          <p>{video.gentle}</p>
          {video.hands ? <HandSteps compact /> : null}
        </details>
        <button type="button" className="btn btn-primary cy-play" onClick={() => onPlay(video)}>
          ▶ Play
        </button>
      </div>
    </article>
  );
}

export function PracticeLibrary() {
  const [playing, setPlaying] = useState<PracticeVideo | null>(null);
  const { locale } = useLocale();
  return (
    <section className="stack bp" aria-labelledby="bp-title" lang="en">
      <div className="bp-banner">
        <p className="kicker">Pranayama &amp; breathing practices</p>
        <h2 id="bp-title">Explore Breathing Practices</h2>
        <p>
          Ten guided videos of traditional Indian yoga breathing and simple modern techniques. Every practice can be done sitting comfortably in a chair or on a yoga mat, with no
          complicated movements. Tap a card to watch it here.
        </p>
      </div>
      {locale !== "en" ? <p className="hint">This section and its videos are in English.</p> : null}
      <div className="card stack bp-safety" role="note" aria-label="Safety">
        <h3>Before you start</h3>
        <ul>
          {PRACTICE_SAFETY.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </div>
      <div className="cy-grid">
        {PRACTICE_VIDEOS.map((video) => (
          <PracticeCard key={video.id} video={video} onPlay={setPlaying} />
        ))}
      </div>
      <details className="lz-section">
        <summary>
          <span>Hand positions for alternate nostril breathing (Nadi Shodhana and Anulom Vilom)</span>
        </summary>
        <div className="lz-section-body">
          <HandSteps />
        </div>
      </details>
      <p className="hint">
        Videos are made by the channels named on each card and play through YouTube’s privacy-enhanced player. lifeZoi does not choose what YouTube shows after a video ends. If a
        video asks for something that does not feel right, such as holding your breath or breathing fast, skip that part.
      </p>
      <PlayerDialog video={playing} onClose={() => setPlaying(null)} />
    </section>
  );
}
