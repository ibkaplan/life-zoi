import { midiToHz, notesBetween, type Track } from "@/lib/companion/music";

type AudioWindow = Window & { webkitAudioContext?: typeof AudioContext };

/** Plays one track with the Web Audio API. Nothing leaves the browser. */
export class Synth {
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

  /**
   * Asks the browser to let sound start. Without a recent click or key press,
   * Chrome and Safari keep the context suspended; this never works around that.
   */
  async allowed(waitMs = 700): Promise<boolean> {
    if (this.ctx.state === "running") return true;
    try {
      await Promise.race([this.ctx.resume(), new Promise((resolve) => setTimeout(resolve, waitMs))]);
    } catch {
      return false;
    }
    return (this.ctx.state as string) === "running";
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

  private birdTimer: ReturnType<typeof setTimeout> | null = null;

  /** A short rising-and-falling whistle, like a small bird. Original sound design. */
  private chirp() {
    if (this.ctx.state === "closed") return;
    const start = this.ctx.currentTime + 0.05;
    const notes = 2 + Math.floor(Math.random() * 4);
    const base = 2400 + Math.random() * 1600;
    for (let i = 0; i < notes; i += 1) {
      const at = start + i * (0.11 + Math.random() * 0.06);
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(base, at);
      osc.frequency.exponentialRampToValueAtTime(base * (1.2 + Math.random() * 0.4), at + 0.05);
      osc.frequency.exponentialRampToValueAtTime(base * 0.9, at + 0.09);
      gain.gain.setValueAtTime(0, at);
      gain.gain.linearRampToValueAtTime(0.025, at + 0.015);
      gain.gain.linearRampToValueAtTime(0, at + 0.09);
      osc.connect(gain).connect(this.master);
      osc.start(at);
      osc.stop(at + 0.12);
      this.track(osc);
    }
    this.birdTimer = setTimeout(() => this.chirp(), 1800 + Math.random() * 5000);
  }

  private noise(kind: "rain" | "waves" | "wind" | "birds" | "stream") {
    if (kind === "birds") {
      this.birdTimer = setTimeout(() => this.chirp(), 800);
      kind = "wind";
    }
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
    } else if (kind === "stream") {
      filter.type = "bandpass";
      filter.frequency.value = 1200;
      filter.Q.value = 0.8;
      gain.gain.value = 0.1;
      // Quick, uneven ripples in the filter sound like water over stones.
      for (const [rate, amount] of [[0.7, 350], [2.3, 180]] as const) {
        const lfo = this.ctx.createOscillator();
        const depth = this.ctx.createGain();
        lfo.frequency.value = rate;
        depth.gain.value = amount;
        lfo.connect(depth).connect(filter.frequency);
        lfo.start();
        this.track(lfo);
      }
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
    if (this.birdTimer) clearTimeout(this.birdTimer);
    this.birdTimer = null;
    void this.ctx.close().catch(() => undefined);
  }
}
