"use client";

import { useEffect, useRef } from "react";
import { Art } from "@/components/companion/art";
import { useProfile } from "@/components/companion/use-profile";
import { useLocale } from "@/components/locale-provider";
import { isSounding, useBackgroundMusic, useMusicProgress } from "@/components/background-music/provider";
import { MusicOnOffSwitch, MusicProgress, MusicVolume, NowPlaying, TransportControls } from "@/components/background-music/controls";
import { controlProps, pieceArtist, pieceNote, pieceTitle } from "@/components/background-music/shared";
import { commitCompanion } from "@/lib/companion/store";
import { addRecent, toggleFavorite, withDay } from "@/lib/companion/state";
import { breathPhase, type Track } from "@/lib/companion/music";
import { RECORDINGS } from "@/lib/background-music/tracks";
import { localISODate } from "@/lib/dates";
import { fmt } from "@/lib/i18n/config";
import {
  CATEGORY_ICON,
  categoryPlaylist,
  LIBRARY_CATEGORIES,
  PIXABAY_LICENSE_URL,
  PIXABAY_RECORDINGS,
  type LibraryCategory,
  type LibraryPiece,
} from "@/lib/music-library/catalog";

function saveMinutes(minutes: number) {
  commitCompanion((state) => withDay(state, localISODate(), (day) => ({ ...day, listeningMinutes: day.listeningMinutes + minutes })));
}

/** Counts listening time while this page is open, in whole minutes. Nothing is saved for the sample visitor. */
function useListeningMinutes(active: boolean, sample: boolean) {
  const seconds = useRef(0);
  useEffect(() => {
    if (!active || sample) return;
    const timer = setInterval(() => {
      seconds.current += 15;
      if (seconds.current >= 60) {
        seconds.current -= 60;
        saveMinutes(1);
      }
    }, 15000);
    return () => clearInterval(timer);
  }, [active, sample]);
}

function BreathGuide() {
  const { messages: m } = useLocale();
  const music = useBackgroundMusic();
  const { position } = useMusicProgress();
  const piece = music.piece;
  if (piece?.kind !== "synth" || !piece.track.breath || !isSounding(music.status)) return null;
  const guide = breathPhase(piece.track.breath, position);
  const word = guide.phase === "in" ? m.music.library.breatheIn : guide.phase === "hold" ? m.music.library.hold : m.music.library.breatheOut;
  return (
    <p className="lz-breath" aria-live="polite">
      {word} · {guide.left}
    </p>
  );
}

/** The category a built-in piece is listed in first. */
function categoryOf(trackId: string): LibraryCategory {
  return LIBRARY_CATEGORIES.find((value) => categoryPlaylist(value).some((piece) => piece.id === trackId)) ?? LIBRARY_CATEGORIES[0];
}

/** A single piece inside a day-plan activity. It plays through the one site-wide music player. */
export function MusicPlayer({ track }: { track: Track }) {
  const { messages: m } = useLocale();
  const music = useBackgroundMusic();
  const isCurrent = music.piece?.id === track.id;
  const title = pieceTitle(m, { kind: "synth", id: track.id, track });
  if (!music.ready) return null;
  return (
    <div className="lz-player stack" role="region" aria-label={title} {...controlProps}>
      <h3>{title}</h3>
      <p>{pieceNote(m, { kind: "synth", id: track.id, track })}</p>
      {isCurrent ? (
        <>
          <BreathGuide />
          <MusicProgress />
          <TransportControls />
          <MusicVolume session={music.ducked} />
        </>
      ) : (
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            const target = categoryOf(track.id);
            music.selectCategory(target);
            music.playAt(Math.max(0, categoryPlaylist(target).findIndex((piece) => piece.id === track.id)));
          }}
        >
          ▶ {m.music.play}
        </button>
      )}
    </div>
  );
}

function favoriteId(piece: LibraryPiece) {
  return `music:${piece.id}`;
}

export function MusicView() {
  const { messages: m } = useLocale();
  const { ready, companion, sample } = useProfile();
  const music = useBackgroundMusic();
  const sounding = isSounding(music.status);
  useListeningMinutes(sounding, sample);

  const current = music.piece;
  // Note the piece in "Recently played" when it starts.
  const noted = useRef<string | null>(null);
  useEffect(() => {
    if (!sounding || !current || sample || noted.current === current.id) return;
    noted.current = current.id;
    commitCompanion((state) => addRecent(state, favoriteId(current), new Date().toISOString()));
  }, [sounding, current, sample]);

  if (!ready || !music.ready) return <p className="hint">{m.music.library.loading}</p>;

  const category = music.prefs.category;
  const L = m.music.library;
  const today = companion.days[localISODate()];
  const allPieces = new Map<string, { piece: LibraryPiece; category: LibraryCategory }>();
  for (const value of LIBRARY_CATEGORIES)
    for (const piece of categoryPlaylist(value)) if (!allPieces.has(piece.id)) allPieces.set(piece.id, { piece, category: value });
  const favorites = companion.media.favorites
    .filter((id) => id.startsWith("music:"))
    .flatMap((id) => {
      const found = allPieces.get(id.slice(6));
      return found ? [found] : [];
    });
  const recent = companion.media.recent
    .filter((item) => item.id.startsWith("music:"))
    .slice(0, 5)
    .flatMap((item) => {
      const found = allPieces.get(item.id.slice(6));
      return found ? [found] : [];
    });

  const playPiece = (target: LibraryCategory, id: string) => {
    if (target !== category) music.selectCategory(target);
    const list = categoryPlaylist(target);
    music.playAt(Math.max(0, list.findIndex((piece) => piece.id === id)));
  };

  return (
    <div className="stack-lg">
      <div className="lz-hero-row">
        <div className="lz-hello">
          <p className="kicker">{L.kicker}</p>
          <h1>{L.title}</h1>
          <p className="script brand-line">{L.brandLine}</p>
          <p>{L.intro}</p>
        </div>
        <Art name="music" />
      </div>
      {sample ? <p className="hint">{L.sampleNote}</p> : null}
      {today?.listeningMinutes ? <p className="alert alert-ok">{fmt(L.listenedToday, { minutes: today.listeningMinutes })}</p> : null}

      <section className="music-player-card stack" data-category={category} aria-label={m.music.headerLabel} {...controlProps}>
        <div className="music-player-top">
          <span className="music-player-icon" aria-hidden="true">
            {CATEGORY_ICON[category]}
          </span>
          <div className="music-player-info">
            <p className="kicker">{m.music.categories[category].name}</p>
            <NowPlaying />
          </div>
          <MusicOnOffSwitch />
        </div>
        <BreathGuide />
        <MusicProgress />
        <TransportControls />
        <MusicVolume session={music.ducked} />
      </section>

      <section className="stack" aria-labelledby="music-categories">
        <h2 id="music-categories">{L.choose}</h2>
        <div className="music-categories" role="group" aria-label={L.choose}>
          {LIBRARY_CATEGORIES.map((value) => (
            <button
              key={value}
              type="button"
              className="music-category-card"
              data-category={value}
              aria-pressed={value === category}
              onClick={() => music.selectCategory(value)}
              {...controlProps}
            >
              <span className="music-category-icon" aria-hidden="true">
                {CATEGORY_ICON[value]}
              </span>
              <span className="music-category-name">{m.music.categories[value].name}</span>
              <span className="music-category-blurb">{m.music.categories[value].blurb}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="card stack">
        <h2>{fmt(L.listTitle, { category: m.music.categories[category].name })}</h2>
        <ul className="music-list">
          {music.playlist.map((piece, index) => {
            const playing = index === music.index && sounding;
            const title = pieceTitle(m, piece);
            const fav = companion.media.favorites.includes(favoriteId(piece));
            return (
              <li key={piece.id} className="music-list-item" data-current={index === music.index}>
                <button
                  type="button"
                  className="music-list-play"
                  aria-label={fmt(L.playThis, { title })}
                  aria-pressed={playing}
                  onClick={() => (playing ? music.pause() : music.playAt(index))}
                  {...controlProps}
                >
                  <span aria-hidden="true">{playing ? "❚❚" : "▶"}</span>
                </button>
                <div className="music-list-text">
                  <p className="music-list-title">
                    {title} {playing ? <span className="music-badge">{L.nowPlayingBadge}</span> : null}
                  </p>
                  <p className="hint">
                    {pieceArtist(m, piece)}
                    {piece.kind === "synth" ? ` · ${fmt(L.minutes, { minutes: piece.track.minutes })}` : ` · ${L.pixabay}`}
                  </p>
                  {pieceNote(m, piece) ? <p className="music-list-note">{pieceNote(m, piece)}</p> : null}
                </div>
                {sample ? null : (
                  <button
                    type="button"
                    className="btn btn-ghost music-fav"
                    aria-pressed={fav}
                    onClick={() => commitCompanion((state) => toggleFavorite(state, favoriteId(piece)))}
                  >
                    {fav ? L.savedFavorite : L.addFavorite}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
        <p className="hint">{L.safety}</p>
      </section>

      {favorites.length > 0 ? (
        <section className="card stack">
          <h2>{L.favorites}</h2>
          <div className="lz-buttons">
            {favorites.map(({ piece, category: target }) => (
              <button key={piece.id} className="btn btn-secondary" type="button" onClick={() => playPiece(target, piece.id)} {...controlProps}>
                ▶ {pieceTitle(m, piece)}
              </button>
            ))}
          </div>
        </section>
      ) : null}
      {recent.length > 0 ? (
        <section className="card stack">
          <h2>{L.recent}</h2>
          <ul>
            {recent.map(({ piece }) => (
              <li key={piece.id}>{pieceTitle(m, piece)}</li>
            ))}
          </ul>
        </section>
      ) : null}

      <details className="card music-about">
        <summary>{L.aboutTitle}</summary>
        <p>{L.aboutBuiltIn}</p>
        {RECORDINGS.length > 0 ? (
          <>
            <p>{L.aboutRecordings}</p>
            <ul>
              {RECORDINGS.map((recording) => (
                <li key={recording.id}>
                  {recording.title} · {recording.attribution} · {recording.license} ·{" "}
                  <a href={recording.sourceUrl} target="_blank" rel="noopener noreferrer">
                    {L.sourceLink}
                  </a>
                </li>
              ))}
            </ul>
          </>
        ) : null}
        {PIXABAY_RECORDINGS.length > 0 ? (
          <>
            <p>{L.aboutPixabay}</p>
            <ul>
              {PIXABAY_RECORDINGS.map((recording) => (
                <li key={recording.id}>
                  {recording.title} · {recording.artist} ·{" "}
                  <a href={recording.sourceUrl} target="_blank" rel="noopener noreferrer">
                    {L.sourceLink}
                  </a>
                </li>
              ))}
            </ul>
            <p>
              <a href={PIXABAY_LICENSE_URL} target="_blank" rel="noopener noreferrer">
                {L.licenseLink}
              </a>
            </p>
          </>
        ) : null}
        <p className="hint">{m.music.saveNote}</p>
      </details>
    </div>
  );
}
