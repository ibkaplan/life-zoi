"use client";

import { useEffect, useRef, useState } from "react";
import { Art } from "@/components/companion/art";
import { useT } from "@/components/locale-provider";
import { msg } from "@/lib/i18n/translate";
import { FavoriteButton, formatClock, SaveNote } from "@/components/companion/shared";
import { useProfile } from "@/components/companion/use-profile";
import { commitCompanion } from "@/lib/companion/store";
import { addRecent, withDay } from "@/lib/companion/state";
import { breathPhase, MUSIC_CATEGORIES, MUSIC_CATEGORY_LABEL, TRACKS, trackById, type MusicCategory, type Track } from "@/lib/companion/music";
import { localISODate } from "@/lib/dates";
import { Synth } from "@/components/companion/synth";
import { useAudioFocus } from "@/components/background-music/use-audio-focus";

function saveListening(trackId: string, seconds: number, position: number) {
  const minutes = Math.round(seconds / 60);
  commitCompanion((state) => {
    const today = localISODate();
    const withMinutes = minutes > 0 ? withDay(state, today, (day) => ({ ...day, listeningMinutes: day.listeningMinutes + minutes })) : state;
    return { ...withMinutes, media: { ...withMinutes.media, positions: { ...withMinutes.media.positions, [`music:${trackId}`]: Math.floor(position) } } };
  });
}

export function MusicPlayer({ track }: { track: Track }) {
  const t = useT();
  const { companion, sample } = useProfile();
  const saved = companion.media.positions[`music:${track.id}`] ?? 0;
  const total = track.minutes * 60;
  const synth = useRef<Synth | null>(null);
  const listened = useRef(0);
  const [playing, setPlaying] = useState(false);
  const [position, setPosition] = useState(saved < total ? saved : 0);
  const [volume, setVolume] = useState(0.6);
  const [error, setError] = useState("");
  // Background music steps aside while this player makes sound.
  useAudioFocus(playing, `library-music:${track.id}`);

  function stop(atEnd = false) {
    const engine = synth.current;
    if (!engine) return;
    const where = atEnd ? 0 : Math.min(total, engine.position());
    engine.stop();
    synth.current = null;
    setPlaying(false);
    setPosition(where);
    if (!sample) saveListening(track.id, listened.current, where);
    listened.current = 0;
  }

  useEffect(() => {
    if (!playing) return;
    let last = synth.current?.position() ?? 0;
    const timer = setInterval(() => {
      const engine = synth.current;
      if (!engine) return;
      const now = engine.position();
      listened.current += Math.max(0, now - last);
      last = now;
      if (now >= total) stop(true);
      else setPosition(now);
    }, 500);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing]);

  useEffect(
    () => () => {
      synth.current?.stop();
    },
    [],
  );

  function play() {
    setError("");
    try {
      const engine = new Synth(volume);
      engine.start(track, position >= total ? 0 : position);
      synth.current = engine;
      setPlaying(true);
      if (!sample) commitCompanion((state) => addRecent(state, `music:${track.id}`, new Date().toISOString()));
    } catch {
      setError(t("This browser cannot play sound from LifeZoi. Try another browser."));
    }
  }

  const guide = track.breath && playing ? breathPhase(track.breath, position) : null;
  return (
    <div className="lz-player stack" role="region" aria-label={t("Player: {title}", { title: t(track.title) })}>
      <h3>{t(track.title)}</h3>
      <p>{t(track.description)}</p>
      <p className="hint">{t(track.credit)}</p>
      {guide ? (
        <p className="lz-breath" aria-live="polite">
          {guide.phase === "in" ? t("Breathe in") : guide.phase === "hold" ? t("Hold") : t("Breathe out")} · {guide.left}
        </p>
      ) : null}
      <div className="lz-buttons">
        {playing ? (
          <button className="btn btn-primary" type="button" onClick={() => stop()}>
            {t("Pause")}
          </button>
        ) : (
          <button className="btn btn-primary" type="button" onClick={play}>
            {position > 0 ? t("Resume") : t("Play")}
          </button>
        )}
        {position > 0 && !playing ? (
          <button className="btn btn-ghost" type="button" onClick={() => setPosition(0)}>
            {t("Start again")}
          </button>
        ) : null}
        <FavoriteButton id={`music:${track.id}`} label={msg("this track")} />
      </div>
      <p>
        <span aria-label={t("Time played")}>{formatClock(Math.floor(position))}</span> / <span aria-label={t("Length")}>{formatClock(total)}</span>
      </p>
      <progress max={total} value={Math.min(total, position)} aria-label={t("Progress")} />
      <label className="field">
        <span>{t("Volume")}</span>
        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={volume}
          onChange={(event) => {
            const next = Number(event.target.value);
            setVolume(next);
            synth.current?.setVolume(next);
          }}
        />
      </label>
      {error ? <p className="alert">{error}</p> : null}
    </div>
  );
}

export function MusicView() {
  const t = useT();
  const { ready, companion } = useProfile();
  const [category, setCategory] = useState<MusicCategory>("relaxation");
  const [trackId, setTrackId] = useState<string>("soft-evening");
  if (!ready) return <p className="hint">{t("Loading music…")}</p>;
  const list = TRACKS.filter((track) => track.category === category);
  const current = trackById(trackId) ?? list[0] ?? null;
  const favorites = companion.media.favorites.filter((id) => id.startsWith("music:")).map((id) => trackById(id.slice(6))).filter((track): track is Track => Boolean(track));
  const recent = companion.media.recent.filter((item) => item.id.startsWith("music:")).slice(0, 5);
  const today = companion.days[localISODate()];
  return (
    <div className="stack-lg">
      <div className="lz-hero-row">
        <div className="lz-hello">
          <p className="kicker">
            {t("Health Library")} · {t("Music")}
          </p>
          <h1>{t("Relaxing music")}</h1>
          <p className="script brand-line">{t("Breathe. Listen. Rest.")}</p>
          <p>{t("Calm sounds for relaxation, sleep, focus, and breathing. Everything plays inside LifeZoi.")}</p>
        </div>
        <Art name="music" />
      </div>
      <SaveNote />
      {today?.listeningMinutes ? <p className="alert alert-ok">{t("You have listened for {minutes} minutes today.", { minutes: today.listeningMinutes })}</p> : null}
      <div className="lz-tabs" role="group" aria-label={t("Music category")}>
        {MUSIC_CATEGORIES.map((value) => (
          <button
            key={value}
            type="button"
            className="lz-tab"
            aria-pressed={value === category}
            onClick={() => {
              setCategory(value);
              const first = TRACKS.find((track) => track.category === value);
              if (first) setTrackId(first.id);
            }}
          >
            {t(MUSIC_CATEGORY_LABEL[value])}
          </button>
        ))}
      </div>
      <section className="card stack">
        <h2>{t(MUSIC_CATEGORY_LABEL[category])}</h2>
        <ul className="record-list">
          {list.map((track) => (
            <li key={track.id}>
              <button type="button" className="lz-tab" aria-pressed={track.id === current?.id} onClick={() => setTrackId(track.id)}>
                {t(track.title)} · {t("{minutes} min", { minutes: track.minutes })}
              </button>
            </li>
          ))}
        </ul>
        {current ? <MusicPlayer key={current.id} track={current} /> : null}
        <p className="hint">{t("Keep the volume comfortable. Stop if a sound is unpleasant. Sleep sounds are not a treatment for a sleep problem.")}</p>
      </section>
      {favorites.length > 0 ? (
        <section className="card stack">
          <h2>{t("My favorite tracks")}</h2>
          <div className="lz-buttons">
            {favorites.map((track) => (
              <button
                key={track.id}
                className="btn btn-secondary"
                type="button"
                onClick={() => {
                  setCategory(track.category);
                  setTrackId(track.id);
                }}
              >
                {t(track.title)}
              </button>
            ))}
          </div>
        </section>
      ) : null}
      {recent.length > 0 ? (
        <section className="card stack">
          <h2>{t("Recently played")}</h2>
          <ul>
            {recent.map((item) => (
              <li key={item.id}>{t(trackById(item.id.slice(6))?.title ?? item.id)}</li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
