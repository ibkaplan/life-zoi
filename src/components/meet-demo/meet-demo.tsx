"use client";

import "./meet-demo.css";
import Link from "next/link";
import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import { useLocale } from "@/components/locale-provider";
import { useSpeechSupport } from "@/components/voice/read-aloud";
import { captionMs, MEET_DEMO, progressLabel, type DemoTurn } from "@/lib/meet-demo/script";
import type { Locale } from "@/lib/i18n/config";
import { player, primeSpeech } from "@/lib/voice/engine";
import { segmentsFromText } from "@/lib/voice/voices";

const OWNER = "meet-demo";

type State = { phase: "idle" | "playing" | "done"; index: number };
type Action = { type: "start" } | { type: "advance"; total: number } | { type: "stop" } | { type: "reset" };

function reduce(state: State, action: Action): State {
  switch (action.type) {
    case "start":
      return { phase: "playing", index: 0 };
    case "advance":
      if (state.phase !== "playing") return state;
      return state.index + 1 >= action.total ? { phase: "done", index: state.index } : { phase: "playing", index: state.index + 1 };
    case "stop":
      return state.phase === "playing" ? { ...state, phase: "done" } : state;
    case "reset":
      return { phase: "idle", index: -1 };
  }
}

function Bubble({ turn, current, you, zoi, action }: { turn: DemoTurn; current: boolean; you: string; zoi: string; action?: string }) {
  return (
    <li className={`md-bubble md-${turn.speaker}${current ? " md-current" : ""}`}>
      <span className="md-who">{turn.speaker === "zoi" ? zoi : you}</span>
      <p>{turn.text}</p>
      {action ? <span className="md-chip">{action}</span> : null}
    </li>
  );
}

/**
 * The public voice demo: a scripted conversation shown as chat bubbles and large
 * captions. LifeZoi's lines are read by the site's shared read-aloud player (the
 * browser's own speech); the visitor's lines are only shown. No microphone, no network.
 */
export function MeetDemo() {
  const { locale } = useLocale();
  // A new language means a new script: start over.
  return <Demo key={locale} locale={locale} />;
}

function Demo({ locale }: { locale: Locale }) {
  const copy = MEET_DEMO[locale];
  const total = copy.turns.length;
  const supported = useSpeechSupport();
  const [state, dispatch] = useReducer(reduce, { phase: "idle", index: -1 });
  const [sound, setSound] = useState(true);
  const [noVoice, setNoVoice] = useState(false);
  const [shared, setShared] = useState(false);
  const listRef = useRef<HTMLOListElement>(null);

  const captionsOnly = !sound || supported === false || noVoice;
  const turn = state.index >= 0 ? copy.turns[state.index] : null;
  // LifeZoi's turn: the orb moves whether the line is spoken or shown as captions.
  const speaking = state.phase === "playing" && turn?.speaker === "zoi";
  const listening = state.phase === "playing" && turn?.speaker === "you";

  const advance = useCallback(() => dispatch({ type: "advance", total }), [total]);

  // Play the current line: speak LifeZoi's lines, show the visitor's for a reading pause.
  useEffect(() => {
    if (state.phase !== "playing" || !turn) return;
    let live = true;
    const next = () => {
      if (live) advance();
    };
    const timers: ReturnType<typeof setTimeout>[] = [];
    if (turn.speaker === "you" || captionsOnly) {
      timers.push(setTimeout(next, captionMs(turn.text)));
    } else {
      player.play(OWNER, segmentsFromText(turn.text, locale), {
        stepWait: 0,
        onEnd: (reason) => {
          if (reason === "done") setTimeout(next, 450);
        },
      });
      // A safety net for browsers that never report the end of speech.
      timers.push(setTimeout(next, captionMs(turn.text) * 2 + 6000));
    }
    return () => {
      live = false;
      for (const timer of timers) clearTimeout(timer);
    };
  }, [state.phase, state.index, turn, captionsOnly, locale, advance]);

  // No voice for this language on the device: carry on with captions.
  useEffect(
    () =>
      player.subscribe(() => {
        const now = player.state();
        if (now.owner === OWNER && (now.problem === "no-voice" || now.problem === "unsupported")) {
          setNoVoice(true);
          player.clearProblem();
        }
      }),
    [],
  );

  // Captions only, Stop, or the end: silence the voice.
  useEffect(() => {
    if (state.phase !== "playing" || captionsOnly) player.stop(OWNER);
  }, [state.phase, captionsOnly]);

  useEffect(() => () => player.stop(OWNER), []);

  // Keep the newest line in view inside the chat, without moving the page.
  useEffect(() => {
    const list = listRef.current;
    if (list) list.scrollTo({ top: list.scrollHeight, behavior: "smooth" });
  }, [state.index]);

  function start() {
    if (sound && supported) primeSpeech();
    dispatch({ type: "start" });
  }

  function skip() {
    player.stop(OWNER);
    advance();
  }

  async function share() {
    const url = window.location.href;
    try {
      if (typeof navigator.share === "function") {
        await navigator.share({ title: copy.pageTitle, text: copy.shareText, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setShared(true);
      setTimeout(() => setShared(false), 2500);
    } catch {
      // The visitor closed the share sheet, or the clipboard is blocked.
    }
  }

  const shown = state.index >= 0 ? copy.turns.slice(0, state.index + 1) : [];
  const status =
    state.phase === "done" ? copy.finished : listening ? copy.listening : speaking ? copy.speaking : copy.ready;

  return (
    <div className="meet-demo">
      <section className="md-hero">
        <div className="md-hero-copy">
          <p className="kicker">{copy.kicker}</p>
          <h1>{copy.title}</h1>
          <p className="md-lead">{copy.lead}</p>
          <p className="md-sample" role="note">
            {copy.sampleNote}
          </p>
        </div>

        <div className={`md-stage md-${state.phase}${speaking ? " md-speaking" : ""}${listening ? " md-listening" : ""}`}>
          <div className="md-orb-wrap" aria-hidden="true">
            <span className="md-ring md-ring-1" />
            <span className="md-ring md-ring-2" />
            <span className="md-orb">
              {listening ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <rect x="9" y="3" width="6" height="11" rx="3" />
                  <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
                </svg>
              ) : (
                <span className="md-bars">
                  <i />
                  <i />
                  <i />
                  <i />
                  <i />
                </span>
              )}
            </span>
          </div>
          <p className="md-status">{status}</p>

          <div className="md-caption" aria-live={captionsOnly ? "polite" : "off"}>
            {turn ? (
              <>
                <span className="md-caption-who">{turn.speaker === "zoi" ? copy.zoi : copy.you}</span>
                <span className="md-caption-text">{turn.text}</span>
              </>
            ) : (
              <span className="md-caption-text md-caption-wait">“{copy.turns[0].text}”</span>
            )}
          </div>

          <div className="md-controls">
            {state.phase === "playing" ? (
              <>
                <button className="md-btn md-btn-main" type="button" onClick={() => dispatch({ type: "stop" })}>
                  <span aria-hidden="true">■</span> {copy.stop}
                </button>
                <button className="md-btn" type="button" onClick={skip}>
                  {copy.next} <span aria-hidden="true">→</span>
                </button>
              </>
            ) : (
              <button className="md-btn md-btn-main" type="button" onClick={start}>
                <span aria-hidden="true">▶</span> {state.phase === "done" ? copy.replay : copy.play}
              </button>
            )}
            {supported !== false && !noVoice ? (
              <label className="md-toggle">
                <input type="checkbox" checked={!sound} onChange={(event) => setSound(!event.target.checked)} />
                <span>{copy.soundOff}</span>
              </label>
            ) : null}
          </div>
          {state.index >= 0 ? (
            <div className="md-progress" aria-hidden="true">
              <span style={{ width: `${((state.index + 1) / total) * 100}%` }} />
            </div>
          ) : null}
          {state.index >= 0 ? <p className="md-count">{progressLabel(copy, state.index + 1)}</p> : null}
          {supported === false ? <p className="md-note">{copy.unsupported}</p> : noVoice ? <p className="md-note">{copy.noVoice}</p> : null}
        </div>
      </section>

      {shown.length > 0 ? (
        <section className="md-chat card" aria-label={copy.kicker}>
          <ol className="md-list" ref={listRef}>
            {shown.map((item, index) => (
              <Bubble
                key={index}
                turn={item}
                current={index === state.index && state.phase === "playing"}
                you={copy.you}
                zoi={copy.zoi}
                action={item.action ? copy.actions[item.action] : undefined}
              />
            ))}
          </ol>
        </section>
      ) : null}

      <section className="md-features" aria-labelledby="md-features-title">
        <h2 id="md-features-title">{copy.featuresTitle}</h2>
        <ul>
          {copy.features.map((feature) => (
            <li key={feature.title} className="card">
              <h3>{feature.title}</h3>
              <p>{feature.text}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="md-about card" aria-labelledby="md-about-title">
        <h2 id="md-about-title">{copy.privacyTitle}</h2>
        <ul>
          {copy.privacy.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </section>

      <section className="md-join hero-panel" aria-labelledby="md-join-title">
        <h2 id="md-join-title">{copy.joinTitle}</h2>
        <p>{copy.joinText}</p>
        <div className="md-join-actions">
          <Link className="btn btn-primary" href="/#invitation">
            {copy.haveInvitation}
          </Link>
          <Link className="btn btn-secondary" href="/sign-in">
            {copy.logIn}
          </Link>
          <button className="btn btn-secondary" type="button" onClick={() => void share()}>
            {shared ? copy.shared : copy.share}
          </button>
        </div>
      </section>
    </div>
  );
}
