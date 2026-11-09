"use client";

import { useEffect, useRef, useState } from "react";
import { Art } from "@/components/companion/art";
import { FavoriteButton, formatClock, SaveNote } from "@/components/companion/shared";
import { useProfile } from "@/components/companion/use-profile";
import { commitCompanion } from "@/lib/companion/store";
import { addRecent, withDay } from "@/lib/companion/state";
import { breathPhase, midiToHz, MUSIC_CATEGORIES, MUSIC_CATEGORY_LABEL, notesBetween, TRACKS, trackById, type MusicCategory, type Track } from "@/lib/companion/music";
import { localISODate } from "@/lib/dates";

type AudioWindow = Window & { webkitAudioContext?: typeof AudioContext };

/** Plays one track with the Web Audio API. Nothing leaves the browser. */
class Synth {
  private ctx: AudioContext;
  private master: GainNode;
  private timer: ReturnType<typeof setInterval> | null = null;
  private startedAt = 0;
  private offset = 0;
  private until = 0;
  private sources: AudioScheduledSourceNode[] = [];

  constructor(volume: number) {
    const Ctor = window.AudioContext ?? (window as AudioWindow).webkitAudioContext;
    if (!Ctor) throw new Error("no-audio");
    this.ctx = new Ctor();
    this.master = this.ctx.createGain();
    this.master.gain.value = volume;
    this.master.connect(this.ctx.destination);
  }

  setVolume(volume: number) {
    this.master.gain.setTargetAtTime(volume, this.ctx.currentTime, 0.05);
  }

  position(): number {
    return this.ctx.currentTime - this.startedAt + this.offset;
  }

  start(track: Track, from: number) {
    this.offset = from;
    this.startedAt = this.ctx.currentTime + 0.05;
    this.until = from;
    if (track.noise) this.noise(track.noise);
    if (track.breath) this.breathTone(track);
    const tick = () => {
      const target = this.position() + 1.5;
      if (track.breath) this.breathRamps(track.breath, this.until, target);
      for (const event of notesBetween(track, this.until, target)) this.note(track, event.at, event.midi, event.seconds, event.voice);
      this.until = target;
    };
    tick();
    this.timer = setInterval(tick, 300);
  }

  private when(at: number): number {
    return this.startedAt + (at - this.offset);
  }

  private note(track: Track, at: number, midi: number, seconds: number, voice: "pad" | "melody") {
    const start = Math.max(this.ctx.currentTime, this.when(at));
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = voice === "pad" ? "sine" : track.wave;
    osc.frequency.value = midiToHz(midi);
    const peak = voice === "pad" ? 0.05 : 0.09;
    const attack = voice === "pad" ? Math.min(1.5, seconds / 3) : 0.04;
    const release = voice === "pad" ? Math.min(2, seconds / 2) : Math.min(0.8, seconds);
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(peak, start + attack);
    gain.gain.setTargetAtTime(0, start + Math.max(attack, seconds - release / 2), release / 3);
    osc.connect(gain).connect(this.master);
    osc.start(start);
    osc.stop(start + seconds + release);
    this.track(osc);
  }

  private breathGain: GainNode | null = null;

  private breathTone(track: Track) {
    const osc = this.ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.value = midiToHz(track.chords[0]?.[2] ?? 57);
    this.breathGain = this.ctx.createGain();
    this.breathGain.gain.value = 0.02;
    osc.connect(this.breathGain).connect(this.master);
    osc.start();
    this.track(osc);
  }

  private breathRamps(breath: [number, number, number], from: number, to: number) {
    if (!this.breathGain) return;
    const [inhale, hold, exhale] = breath;
    const cycle = inhale + hold + exhale;
    for (let start = Math.ceil(from / cycle) * cycle; start < to; start += cycle) {
      const t = Math.max(this.ctx.currentTime, this.when(start));
      const g = this.breathGain.gain;
      g.setValueAtTime(0.02, t);
      g.linearRampToValueAtTime(0.16, t + inhale);
      g.setValueAtTime(0.16, t + inhale + hold);
      g.linearRampToValueAtTime(0.02, t + cycle);
    }
  }

  private noise(kind: "rain" | "waves" | "wind") {
    const length = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, length, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i += 1) data[i] = Math.random() * 2 - 1;
    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();
    if (kind === "rain") {
      filter.type = "bandpass";
      filter.frequency.value = 2500;
      filter.Q.value = 0.4;
      gain.gain.value = 0.12;
    } else {
      filter.type = "lowpass";
      filter.frequency.value = kind === "waves" ? 700 : 450;
      gain.gain.value = kind === "waves" ? 0.12 : 0.08;
      const lfo = this.ctx.createOscillator();
      const depth = this.ctx.createGain();
      lfo.frequency.value = kind === "waves" ? 0.1 : 0.05;
      depth.gain.value = kind === "waves" ? 0.1 : 0.05;
      lfo.connect(depth).connect(gain.gain);
      lfo.start();
      this.track(lfo);
    }
    source.connect(filter).connect(gain).connect(this.master);
    source.start();
    this.track(source);
  }

  private track(node: AudioScheduledSourceNode) {
    this.sources.push(node);
    if (this.sources.length > 400) this.sources = this.sources.slice(-200);
  }

  stop() {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
    void this.ctx.close().catch(() => undefined);
  }
}

function saveListening(trackId: string, seconds: number, position: number) {
  const minutes = Math.round(seconds / 60);
  commitCompanion((state) => {
    const today = localISODate();
    const withMinutes = minutes > 0 ? withDay(state, today, (day) => ({ ...day, listeningMinutes: day.listeningMinutes + minutes })) : state;
    return { ...withMinutes, media: { ...withMinutes.media, positions: { ...withMinutes.media.positions, [`music:${trackId}`]: Math.floor(position) } } };
  });
}

export function MusicPlayer({ track }: { track: Track }) {
  const { companion, sample } = useProfile();
  const saved = companion.media.positions[`music:${track.id}`] ?? 0;
  const total = track.minutes * 60;
  const synth = useRef<Synth | null>(null);
  const listened = useRef(0);
  const [playing, setPlaying] = useState(false);
  const [position, setPosition] = useState(saved < total ? saved : 0);
  const [volume, setVolume] = useState(0.6);
  const [error, setError] = useState("");

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
      setError("This browser cannot play sound from LifeZoi. Try another browser.");
    }
  }

  const guide = track.breath && playing ? breathPhase(track.breath, position) : null;
  return (
    <div className="lz-player stack" role="region" aria-label={`Player: ${track.title}`}>
      <h3>{track.title}</h3>
      <p>{track.description}</p>
      <p className="hint">{track.credit}</p>
      {guide ? (
        <p className="lz-breath" aria-live="polite">
          {guide.phase === "in" ? "Breathe in" : guide.phase === "hold" ? "Hold" : "Breathe out"} · {guide.left}
        </p>
      ) : null}
      <div className="lz-buttons">
        {playing ? (
          <button className="btn btn-primary" type="button" onClick={() => stop()}>
            Pause
          </button>
        ) : (
          <button className="btn btn-primary" type="button" onClick={play}>
            {position > 0 ? "Resume" : "Play"}
          </button>
        )}
        {position > 0 && !playing ? (
          <button className="btn btn-ghost" type="button" onClick={() => setPosition(0)}>
            Start again
          </button>
        ) : null}
        <FavoriteButton id={`music:${track.id}`} label="this track" />
      </div>
      <p>
        <span aria-label="Time played">{formatClock(Math.floor(position))}</span> / <span aria-label="Length">{formatClock(total)}</span>
      </p>
      <progress max={total} value={Math.min(total, position)} aria-label="Progress" />
      <label className="field">
        <span>Volume</span>
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
  const { ready, companion } = useProfile();
  const [category, setCategory] = useState<MusicCategory>("relaxation");
  const [trackId, setTrackId] = useState<string>("soft-evening");
  if (!ready) return <p className="hint">Loading music…</p>;
  const list = TRACKS.filter((track) => track.category === category);
  const current = trackById(trackId) ?? list[0] ?? null;
  const favorites = companion.media.favorites.filter((id) => id.startsWith("music:")).map((id) => trackById(id.slice(6))).filter((track): track is Track => Boolean(track));
  const recent = companion.media.recent.filter((item) => item.id.startsWith("music:")).slice(0, 5);
  const today = companion.days[localISODate()];
  return (
    <div className="stack-lg">
      <div className="lz-hero-row">
        <div className="lz-hello">
          <p className="kicker">Health Library · Music</p>
          <h1>Relaxing music</h1>
          <p className="script brand-line">Breathe. Listen. Rest.</p>
          <p>Calm sounds for relaxation, sleep, focus, and breathing. Everything plays inside LifeZoi.</p>
        </div>
        <Art name="music" />
      </div>
      <SaveNote />
      {today?.listeningMinutes ? <p className="alert alert-ok">You have listened for {today.listeningMinutes} minutes today.</p> : null}
      <div className="lz-tabs" role="group" aria-label="Music category">
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
            {MUSIC_CATEGORY_LABEL[value]}
          </button>
        ))}
      </div>
      <section className="card stack">
        <h2>{MUSIC_CATEGORY_LABEL[category]}</h2>
        <ul className="record-list">
          {list.map((track) => (
            <li key={track.id}>
              <button type="button" className="lz-tab" aria-pressed={track.id === current?.id} onClick={() => setTrackId(track.id)}>
                {track.title} · {track.minutes} min
              </button>
            </li>
          ))}
        </ul>
        {current ? <MusicPlayer key={current.id} track={current} /> : null}
        <p className="hint">Keep the volume comfortable. Stop if a sound is unpleasant. Sleep sounds are not a treatment for a sleep problem.</p>
      </section>
      {favorites.length > 0 ? (
        <section className="card stack">
          <h2>My favorite tracks</h2>
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
                {track.title}
              </button>
            ))}
          </div>
        </section>
      ) : null}
      {recent.length > 0 ? (
        <section className="card stack">
          <h2>Recently played</h2>
          <ul>
            {recent.map((item) => (
              <li key={item.id}>{trackById(item.id.slice(6))?.title ?? item.id}</li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
