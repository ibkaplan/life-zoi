"use client";

import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import { useLocale, useT } from "@/components/locale-provider";
import type { Translate } from "@/lib/i18n/translate";
import { blocksFromElement, VOICE_SKIP_ATTR } from "@/lib/voice/dom";
import {
  deviceVoices,
  player,
  readVoicePrefs,
  saveVoicePrefs,
  serverVoicePrefs,
  serverVoices,
  serverVoiceState,
  speechSupported,
  subscribeVoicePrefs,
  subscribeVoices,
  type PlayOptions,
  type VoiceState,
} from "@/lib/voice/engine";
import {
  buildSegments,
  chooseVoice,
  RATE_CHOICES,
  rankVoices,
  segmentsFromText,
  STEP_WAIT_CHOICES,
  voiceLabel,
  type Block,
  type Segment,
  type StepWait,
  type VoiceLang,
} from "@/lib/voice/voices";

const subscribeNothing = () => () => undefined;

export function useVoiceState(): VoiceState {
  return useSyncExternalStore(player.subscribe, player.state, serverVoiceState);
}

export function useVoicePrefs() {
  return useSyncExternalStore(subscribeVoicePrefs, readVoicePrefs, serverVoicePrefs);
}

export function useDeviceVoices() {
  return useSyncExternalStore(subscribeVoices, deviceVoices, serverVoices);
}

/** True once the page knows whether this browser can speak. Null while the server page hydrates. */
export function useSpeechSupport(): boolean | null {
  return useSyncExternalStore(subscribeNothing, speechSupported, () => null);
}

export function languageName(t: Translate, lang: VoiceLang): string {
  if (lang === "uk") return t("Ukrainian");
  if (lang === "ru") return t("Russian");
  if (lang === "el") return t("Greek");
  return t("English");
}

function SpeakerIcon() {
  return (
    <svg className="voice-icon" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false">
      <path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" fill="currentColor" />
      <path d="M15.5 8.5a5 5 0 0 1 0 7M18 6a8.5 8.5 0 0 1 0 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

type Source =
  /** Read the visible text of the element with this id. */
  | { target: string; text?: never; blocks?: never }
  /** Read these paragraphs. */
  | { text: string | readonly string[]; target?: never; blocks?: never }
  /** Read these blocks, for example numbered steps. */
  | { blocks: readonly Block[]; target?: never; text?: never };

export type ReadAloudProps = Source & {
  /** Button text, already translated. Defaults to "Listen". */
  label?: string;
  /** Numbered items are steps: shows Next step and Previous step, and the wait between steps. */
  steps?: boolean;
  /** Smaller bar for use inside a card. */
  compact?: boolean;
  rateFactor?: number;
  onActiveChange?: (active: boolean) => void;
  className?: string;
  /** The text may include the person's own information: only voices that run on the device are used. */
  privateText?: boolean;
};

/**
 * A Listen button with Pause, Resume, Stop, Replay, speed, and voice choice.
 * Use one wherever a person might want instructions read to them. All Listen
 * buttons share one player, so starting one stops any other.
 */
export function ReadAloud(props: ReadAloudProps) {
  const { label, steps = false, compact = false, rateFactor, onActiveChange, className, privateText = false } = props;
  const t = useT();
  const { locale } = useLocale();
  const owner = useId();
  const state = useVoiceState();
  const prefs = useVoicePrefs();
  const supported = useSpeechSupport();
  const mine = state.owner === owner;
  const active = mine && state.status !== "idle";
  const [list, setList] = useState<Segment[]>([]);
  const activeRef = useRef(false);

  const onActiveRef = useRef(onActiveChange);
  useEffect(() => {
    onActiveRef.current = onActiveChange;
  }, [onActiveChange]);

  // Stop this reading when the button leaves the page.
  useEffect(
    () => () => {
      player.stop(owner);
      if (activeRef.current) {
        activeRef.current = false;
        onActiveRef.current?.(false);
      }
    },
    [owner],
  );

  // Tell the parent when listening starts and ends (the book reader counts listening minutes).
  useEffect(() => {
    if (activeRef.current === active) return;
    activeRef.current = active;
    onActiveRef.current?.(active);
  }, [active]);

  // A new site language means new text on screen: stop, so English is never read for a Russian page.
  const lastLocale = useRef(locale);
  useEffect(() => {
    if (lastLocale.current === locale) return;
    lastLocale.current = locale;
    player.stop(owner);
  }, [locale, owner]);

  function segments(): Segment[] {
    if ("target" in props && props.target) {
      const root = document.getElementById(props.target);
      return root ? buildSegments(blocksFromElement(root, steps), locale) : [];
    }
    if ("blocks" in props && props.blocks) return buildSegments(props.blocks, locale);
    if ("text" in props && props.text !== undefined) return segmentsFromText(props.text, locale);
    return [];
  }

  function play() {
    const next = segments();
    setList(next);
    const options: PlayOptions = { rateFactor, localOnly: privateText };
    if (!steps) options.stepWait = 0;
    player.play(owner, next, options);
  }

  if (supported === false) {
    return (
      <p className={`voice-note hint ${className ?? ""}`} {...{ [VOICE_SKIP_ATTR]: "" }}>
        {t("This browser cannot read aloud. The written instructions are all here.")}
      </p>
    );
  }

  const stepBlocks = steps ? [...new Set(list.filter((segment) => segment.endsStep).map((segment) => segment.block))] : [];
  const currentBlock = list[state.index]?.block ?? 0;
  const stepTotal = stepBlocks.length;
  const stepNumber = stepBlocks.filter((block) => block <= currentBlock).length;
  const readingLang = mine && state.lang ? state.lang : locale;
  const untranslated = mine && active && state.lang && state.lang !== locale;

  return (
    <div
      className={`voice-bar${compact ? " voice-bar-compact" : ""}${active ? " voice-bar-active" : ""} ${className ?? ""}`}
      role="group"
      aria-label={label ?? t("Listen")}
      {...{ [VOICE_SKIP_ATTR]: "" }}
    >
      <div className="voice-buttons">
        {!active ? (
          <button className="btn voice-play" type="button" onClick={play} disabled={supported === null}>
            <SpeakerIcon />
            {label ?? t("Listen")}
          </button>
        ) : (
          <>
            {state.status === "paused" ? (
              <button className="btn voice-play" type="button" onClick={() => player.resume()}>
                {t("Resume")}
              </button>
            ) : (
              <button className="btn voice-play" type="button" onClick={() => player.pause()}>
                {t("Pause")}
              </button>
            )}
            {steps && stepTotal > 0 ? (
              <>
                <button className="btn btn-secondary" type="button" onClick={() => player.skip(-1)}>
                  {t("Previous step")}
                </button>
                <button className="btn btn-secondary" type="button" onClick={() => player.skip(1)}>
                  {t("Next step")}
                </button>
              </>
            ) : null}
            <button className="btn btn-secondary" type="button" onClick={() => player.replay()}>
              {t("Replay")}
            </button>
            <button className="btn btn-secondary" type="button" onClick={() => player.stop(owner)}>
              {t("Stop")}
            </button>
          </>
        )}
      </div>
      <details className="voice-options">
        <summary>{t("Voice and speed")}</summary>
        <VoiceChoices lang={readingLang} steps={steps} rate={prefs.rate} stepWait={prefs.stepWait} />
      </details>
      <p className="voice-status" role="status" aria-live="polite">
        {mine ? statusText(t, state, steps ? stepNumber : 0, stepTotal) : ""}
      </p>
      {mine && state.problem === "no-voice" && state.problemLang ? (
        <p className="voice-note" role="alert">
          {t("This device has no {language} voice, so lifeZoi will not read this aloud with a voice for another language. You can add a voice in your device's speech or accessibility settings.", {
            language: languageName(t, state.problemLang),
          })}
        </p>
      ) : null}
      {mine && state.problem === "unsupported" ? <p className="voice-note">{t("This browser cannot read aloud. The written instructions are all here.")}</p> : null}
      {mine && state.problem === "failed" ? <p className="voice-note">{t("The voice could not start. Try again, or choose another voice.")}</p> : null}
      {untranslated ? (
        <p className="voice-note">
          {t("This part of lifeZoi is not translated yet, so it is read with a {language} voice.", { language: languageName(t, state.lang!) })}
        </p>
      ) : null}
    </div>
  );
}

function statusText(t: Translate, state: VoiceState, step: number, steps: number): string {
  if (state.status === "waiting") {
    if (state.waitLeft === null) return t("Take your time. Tap Next step when you are ready.");
    return t("Next step in {seconds} seconds.", { seconds: state.waitLeft });
  }
  if (state.status === "paused") return t("Paused. Resume starts this sentence again.");
  if (state.status === "playing") {
    if (steps > 0 && step > 0) return t("Reading step {step} of {steps}.", { step, steps });
    return t("Reading aloud.");
  }
  return "";
}

/** Speed, voice, and (for steps) the wait between steps. Choices are saved in this browser. */
export function VoiceChoices({ lang, steps, rate, stepWait }: { lang: VoiceLang; steps: boolean; rate: number; stepWait: StepWait }) {
  const t = useT();
  const id = useId();
  const voices = useDeviceVoices();
  const prefs = useVoicePrefs();
  const ranked = rankVoices(voices, lang);
  const chosen = chooseVoice(voices, lang, prefs.voices[lang]);
  return (
    <div className="voice-choices">
      <label htmlFor={`${id}-rate`}>
        {t("Speaking speed")}
        <select id={`${id}-rate`} value={String(rate)} onChange={(event) => saveVoicePrefs({ rate: Number(event.target.value) })}>
          {(RATE_CHOICES.includes(rate as (typeof RATE_CHOICES)[number]) ? RATE_CHOICES : [...RATE_CHOICES, rate].sort()).map((choice) => (
            <option key={choice} value={String(choice)}>
              {rateLabel(t, choice)}
            </option>
          ))}
        </select>
      </label>
      {ranked.length > 0 ? (
        <label htmlFor={`${id}-voice`}>
          {t("{language} voice", { language: languageName(t, lang) })}
          <select
            id={`${id}-voice`}
            value={chosen?.name ?? ""}
            onChange={(event) => saveVoicePrefs({ voices: { [lang]: event.target.value } })}
          >
            {ranked.map((voice, index) => (
              <option key={`${voice.name}-${voice.lang}`} value={voice.name}>
                {optionLabel(t, voice, index === 0)}
              </option>
            ))}
          </select>
        </label>
      ) : voices.length > 0 ? (
        <p className="hint">{t("This device has no {language} voice yet.", { language: languageName(t, lang) })}</p>
      ) : null}
      {steps ? (
        <label htmlFor={`${id}-wait`}>
          {t("Time between steps")}
          <select
            id={`${id}-wait`}
            value={stepWait === null ? "tap" : String(stepWait)}
            onChange={(event) => saveVoicePrefs({ stepWait: event.target.value === "tap" ? null : (Number(event.target.value) as StepWait) })}
          >
            {STEP_WAIT_CHOICES.map((choice) => (
              <option key={String(choice)} value={choice === null ? "tap" : String(choice)}>
                {choice === null ? t("Wait until I tap Next step") : choice === 0 ? t("A short pause") : t("{seconds} seconds", { seconds: choice })}
              </option>
            ))}
          </select>
        </label>
      ) : null}
      <p className="hint">
        {t("Voices come from your device or browser. A voice marked online is made by your browser's provider over the internet, so the words being read go to that provider. lifeZoi does not send them anywhere itself.")}
      </p>
    </div>
  );
}

function optionLabel(t: Translate, voice: SpeechSynthesisVoice, best: boolean): string {
  const name = voice.localService === false ? t("{voice}, online", { voice: voiceLabel(voice) }) : voiceLabel(voice);
  return best ? t("{voice} (sounds most natural)", { voice: name }) : name;
}

function rateLabel(t: Translate, rate: number): string {
  if (rate < 0.8) return t("Slow");
  if (rate < 0.9) return t("A little slower");
  if (rate < 0.98) return t("Calm (recommended)");
  if (rate < 1.05) return t("Usual");
  if (rate < 1.2) return t("A little faster");
  return t("Fast");
}

/**
 * Reads a recipe, exercise, or routine step by step. Between steps it can wait
 * (10 to 60 seconds, or until the person taps Next step), so someone cooking or
 * moving does not have to look at the screen.
 */
export function ListenToSteps({
  title,
  intro,
  list,
  steps,
  closing,
  label,
  compact,
}: {
  title?: string;
  intro?: string | readonly string[];
  /** A short list read before the steps, for example the ingredients: a heading and its items. */
  list?: { heading: string; items: readonly string[] };
  steps: readonly string[];
  closing?: readonly string[];
  label?: string;
  compact?: boolean;
}) {
  const t = useT();
  const blocks: Block[] = [];
  if (title) blocks.push({ text: title, kind: "heading" });
  for (const text of typeof intro === "string" ? [intro] : (intro ?? [])) if (text) blocks.push({ text, kind: "paragraph" });
  if (list && list.items.length > 0) {
    blocks.push({ text: list.heading, kind: "heading" });
    for (const item of list.items) blocks.push({ text: item, kind: "item" });
  }
  for (const step of steps) blocks.push({ text: step, kind: "step" });
  for (const text of closing ?? []) if (text) blocks.push({ text, kind: "paragraph" });
  return <ReadAloud blocks={blocks} steps label={label ?? t("Read the steps aloud")} compact={compact} />;
}
