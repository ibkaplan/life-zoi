"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { useDeviceVoices, useSpeechSupport, useVoicePrefs, useVoiceState, VoiceChoices } from "@/components/voice/read-aloud";
import { ArticleLinks, ExerciseLinks, SafetyActions } from "@/components/mind/shared";
import { initialConversation, OPENING_TEXT, OPENING_TOPICS, resultOpening, spokenReply, type ConversationState, type MindReply } from "@/lib/mind/conversation";
import { clearConversation, readConversation, writeConversation, type MindTurn } from "@/lib/mind/conversation-store";
import { newId } from "@/lib/mind/progress";
import { activeProvider } from "@/lib/mind/provider";
import { listenErrorMessage, listeningSupported, listenOnce, onDeviceRecognition, type Listener } from "@/lib/mind/speech";
import { player } from "@/lib/voice/engine";
import { segmentsFromText } from "@/lib/voice/voices";

const OWNER = "lifezoi-mind-talk";
const VOICE_CONSENT_KEY = "lifezoi.mind.voice-consent.v1";
const SPEAK_KEY = "lifezoi.mind.speak-replies.v1";
const LANG = "en-US";

type VoiceConsent = "none" | "local" | "browser";

function readLocal(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeLocal(key: string, value: string | null) {
  try {
    if (value === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, value);
  } catch {
    // Private mode: the choice lasts for this visit only.
  }
}

function openingTurn(): MindTurn {
  return { id: "opening", role: "mind", text: OPENING_TEXT, reply: { text: OPENING_TEXT, kind: "reply", quickReplies: OPENING_TOPICS, exercises: [], exerciseWhy: null, articles: [], distress: false, crisisKinds: [] } };
}

function MicIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <rect x="9" y="3" width="6" height="11" rx="3" fill="currentColor" />
      <path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21M8.5 21h7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function StopIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor" />
    </svg>
  );
}

function Wave() {
  return (
    <span className="mind-wave" aria-hidden="true">
      <span />
      <span />
      <span />
      <span />
    </span>
  );
}

function ReplyBody({ reply }: { reply: MindReply }) {
  return (
    <>
      {reply.kind === "crisis" ? <SafetyActions /> : null}
      <ExerciseLinks ids={reply.exercises} why={reply.exerciseWhy} />
      <ArticleLinks slugs={reply.articles} title="Related articles (they open without losing this conversation)" />
    </>
  );
}

export function MindTalk() {
  const [turns, setTurns] = useState<MindTurn[]>(() => [openingTurn()]);
  const [state, setState] = useState<ConversationState>(() => initialConversation());
  const [draft, setDraft] = useState("");
  const [hydrated, setHydrated] = useState(false);
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState("");
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [consent, setConsent] = useState<VoiceConsent>("none");
  const [asking, setAsking] = useState(false);
  const [localAvailable, setLocalAvailable] = useState<boolean | null>(null);
  const [speakReplies, setSpeakReplies] = useState(true);
  const [handsFree, setHandsFree] = useState(false);
  const [showVoices, setShowVoices] = useState(false);
  const listenerRef = useRef<Listener | null>(null);
  const threadRef = useRef<HTMLDivElement | null>(null);
  const handsFreeRef = useRef(false);
  /** Set when the person stops the voice, so stopping does not start listening again. */
  const userStopped = useRef(false);
  /** The latest send function, for the speech callbacks. */
  const sendRef = useRef<(text: string, via: "voice" | "text") => Promise<void>>(async () => undefined);
  const voice = useVoiceState();
  const prefs = useVoicePrefs();
  const voices = useDeviceVoices();
  const canSpeak = useSpeechSupport();
  const [canListen, setCanListen] = useState<boolean | null>(null);
  const speaking = voice.owner === OWNER && voice.status !== "idle";
  const provider = activeProvider();

  // Restore this tab's conversation, and a result handed over from a questionnaire.
  useEffect(() => {
    userStopped.current = false;
    const stored = readConversation();
    /* eslint-disable react-hooks/set-state-in-effect -- reading browser-only storage once after hydration */
    if (stored) {
      const base = stored.turns.length > 0 ? stored.turns : [openingTurn()];
      setState(stored.state);
      if (stored.state.result && stored.state.resultStep === 0 && base[base.length - 1]?.id !== "result-opening") {
        const opening = resultOpening(stored.state.result);
        setTurns([...base.filter((turn) => turn.id !== "result-opening"), { id: "result-opening", role: "mind", text: opening.text, reply: opening }]);
      } else {
        setTurns(base);
      }
    }
    const saved = readLocal(VOICE_CONSENT_KEY);
    setConsent(saved === "local" || saved === "browser" ? saved : "none");
    setSpeakReplies(readLocal(SPEAK_KEY) !== "off");
    setCanListen(listeningSupported());
    setHydrated(true);
    /* eslint-enable react-hooks/set-state-in-effect */
    void onDeviceRecognition(LANG).then((result) => setLocalAvailable(result === "available"));
    return () => {
      listenerRef.current?.abort();
      handsFreeRef.current = false;
      userStopped.current = true;
      player.stop(OWNER);
    };
  }, []);

  useEffect(() => {
    if (hydrated) writeConversation({ turns, state });
  }, [turns, state, hydrated]);

  useEffect(() => {
    const thread = threadRef.current;
    if (thread) thread.scrollTop = thread.scrollHeight;
  }, [turns, interim]);

  useEffect(() => {
    handsFreeRef.current = handsFree;
  }, [handsFree]);

  const startListening = useCallback(
    (mode: VoiceConsent) => {
      if (mode === "none") return;
      userStopped.current = true;
      player.stop(OWNER);
      userStopped.current = false;
      listenerRef.current?.abort();
      setVoiceError(null);
      setInterim("");
      const listener = listenOnce({
        lang: LANG,
        local: mode === "local",
        onStart: () => setListening(true),
        onInterim: (text) => setInterim(text),
        onFinal: (text) => {
          setInterim("");
          sendRef.current(text, "voice");
        },
        onError: (error) => {
          setInterim("");
          if (error === "no-speech" && handsFreeRef.current) {
            setVoiceError("I didn't hear anything, so I've stopped listening. Tap the microphone when you're ready.");
          } else {
            setVoiceError(listenErrorMessage(error));
          }
          if (error === "denied" || error === "site-blocked" || error === "service-blocked") setHandsFree(false);
        },
        onEnd: () => {
          setListening(false);
          listenerRef.current = null;
        },
      });
      listenerRef.current = listener;
      if (!listener) setVoiceError(listenErrorMessage("other"));
    },
    [],
  );

  const speak = useCallback(
    (reply: MindReply) => {
      if (!speakReplies || canSpeak === false) {
        if (handsFreeRef.current && consent !== "none") startListening(consent);
        return;
      }
      player.play(OWNER, segmentsFromText(spokenReply(reply), "en"), {
        stepWait: 0,
        localOnly: true,
        onEnd: () => {
          if (userStopped.current) return;
          if (handsFreeRef.current && consent !== "none" && reply.kind !== "crisis") startListening(consent);
        },
      });
    },
    [speakReplies, canSpeak, consent, startListening],
  );

  const send = useCallback(
    async (text: string, via: "voice" | "text") => {
      const message = text.trim();
      if (!message) return;
      const turn = await provider.respond(state, message);
      setState(turn.state);
      setTurns((current) => [
        ...current,
        { id: newId(), role: "person", text: message, via },
        { id: newId(), role: "mind", text: turn.reply.text, reply: turn.reply },
      ]);
      if (turn.reply.kind === "crisis") setHandsFree(false);
      if (via === "voice" || speakReplies) speak(turn.reply);
    },
    [provider, state, speak, speakReplies],
  );

  useEffect(() => {
    sendRef.current = send;
  }, [send]);

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const text = draft;
    setDraft("");
    void send(text, "text");
  }

  function onMic() {
    if (listening) {
      listenerRef.current?.stop();
      return;
    }
    if (consent === "none") {
      setAsking(true);
      return;
    }
    startListening(consent);
  }

  function chooseConsent(mode: VoiceConsent) {
    setConsent(mode);
    writeLocal(VOICE_CONSENT_KEY, mode === "none" ? null : mode);
    setAsking(false);
    if (mode !== "none") startListening(mode);
  }

  function restart() {
    listenerRef.current?.abort();
    userStopped.current = true;
    player.stop(OWNER);
    userStopped.current = false;
    clearConversation();
    setState(initialConversation());
    setTurns([openingTurn()]);
    setHandsFree(false);
  }

  const last = turns[turns.length - 1];
  const quick = last?.role === "mind" ? (last.reply?.quickReplies ?? []) : [];
  const micState = listening ? "listening" : speaking ? "speaking" : "idle";
  const micLabel = listening ? "Stop listening and send" : speaking ? "Interrupt and speak" : "Speak to LifeZoi Mind";

  return (
    <section className="mind-talk" aria-labelledby="mind-talk-title">
      <div className="stack">
        <h2 id="mind-talk-title">Talk with LifeZoi Mind</h2>
        <p className="hint">
          {provider.info.label}: {provider.info.notes} Your words stay in this browser tab and are cleared when you close it.{" "}
          <Link href="/mind/privacy">How this works</Link>
        </p>
      </div>

      <div className="mind-thread" ref={threadRef} role="log" aria-live="polite" aria-label="Conversation">
        {turns.map((turn) => (
          <div
            key={turn.id}
            className={`mind-bubble ${turn.role === "person" ? "mind-bubble-person" : "mind-bubble-mind"}${turn.reply?.kind === "crisis" ? " mind-bubble-crisis" : ""}`}
          >
            <span className="mind-bubble-who">{turn.role === "person" ? (turn.via === "voice" ? "You (spoken)" : "You") : "LifeZoi Mind"}</span>
            <p>{turn.text}</p>
            {turn.reply ? <ReplyBody reply={turn.reply} /> : null}
          </div>
        ))}
        {listening && interim ? (
          <div className="mind-bubble mind-bubble-person" aria-live="off">
            <span className="mind-bubble-who">You (listening…)</span>
            <p className="mind-interim">{interim}</p>
          </div>
        ) : null}
      </div>

      {quick.length > 0 ? (
        <div className="mind-chips" role="group" aria-label="Suggested replies">
          {quick.map((option) => (
            <button key={option} type="button" className="mind-chip" onClick={() => void send(option, "text")}>
              {option}
            </button>
          ))}
        </div>
      ) : null}

      <div className="mind-voicebar">
        <button
          type="button"
          className="mind-mic"
          data-state={micState}
          onClick={onMic}
          disabled={canListen === false}
          aria-label={micLabel}
          aria-pressed={listening}
        >
          {listening ? <StopIcon /> : <MicIcon />}
        </button>
        <div className="mind-voicebar-status" aria-live="polite">
          {listening ? (
            <>
              <span className="mind-status-label">
                <Wave /> Listening…
              </span>
              <span className="mind-status-detail">Speak naturally. Tap the button again when you have finished.</span>
            </>
          ) : speaking ? (
            <>
              <span className="mind-status-label">
                <Wave /> LifeZoi Mind is speaking
              </span>
              <span className="mind-status-detail">Tap the microphone to interrupt and speak, or use the buttons to pause.</span>
            </>
          ) : canListen === false ? (
            <>
              <span className="mind-status-label">Voice input is not available in this browser</span>
              <span className="mind-status-detail">You can type below. Chrome, Edge, and Safari support speaking to the page.</span>
            </>
          ) : (
            <>
              <span className="mind-status-label">Tap the microphone to speak</span>
              <span className="mind-status-detail">Or type your message below. You can switch at any time.</span>
            </>
          )}
        </div>
        {speaking ? (
          <div className="actions">
            {voice.status === "paused" ? (
              <button type="button" className="btn btn-secondary btn-small" onClick={() => player.resume()}>
                Resume
              </button>
            ) : (
              <button type="button" className="btn btn-secondary btn-small" onClick={() => player.pause()}>
                Pause
              </button>
            )}
            <button
              type="button"
              className="btn btn-secondary btn-small"
              onClick={() => {
                userStopped.current = true;
                player.stop(OWNER);
                userStopped.current = false;
              }}
            >
              Stop speaking
            </button>
          </div>
        ) : null}
      </div>

      {voiceError ? (
        <p className="alert alert-error" role="alert">
          {voiceError}
        </p>
      ) : null}
      {voice.owner === OWNER && voice.problem === "no-voice" ? (
        <p className="mind-note" role="alert">
          This device has no English voice that runs on the device itself, so replies are shown as text only. LifeZoi Mind only uses on-device voices to read your conversation aloud.
        </p>
      ) : null}

      {asking ? (
        <div className="mind-dialog" role="dialog" aria-labelledby="mind-voice-consent-title">
          <h3 id="mind-voice-consent-title">Before you use the microphone</h3>
          <p>
            LifeZoi Mind uses your browser&apos;s built-in speech recognition, which is free. LifeZoi does not record or store your voice. But depending on your browser, the sound of your voice may be sent to the browser maker&apos;s speech service to be turned into text (for example Google for Chrome, or Apple for Safari), under their privacy terms.
          </p>
          {localAvailable ? (
            <p>
              <strong>Good news:</strong> this browser can turn speech into text on your device, so your voice does not have to leave it.
            </p>
          ) : (
            <p>This browser did not report on-device speech recognition, so it may send your audio to its speech service.</p>
          )}
          <div className="actions">
            {localAvailable ? (
              <button type="button" className="btn btn-primary" onClick={() => chooseConsent("local")}>
                Use on-device recognition only
              </button>
            ) : null}
            <button type="button" className={localAvailable ? "btn btn-secondary" : "btn btn-primary"} onClick={() => chooseConsent("browser")}>
              {localAvailable ? "Let the browser decide" : "I understand, use the microphone"}
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => setAsking(false)}>
              No thanks, I&apos;ll type
            </button>
          </div>
        </div>
      ) : null}

      <form className="mind-compose" onSubmit={onSubmit}>
        <label htmlFor="mind-draft" className="mind-sr">
          Your message
        </label>
        <textarea
          id="mind-draft"
          value={draft}
          placeholder="Type what's on your mind…"
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              const text = draft;
              setDraft("");
              void send(text, "text");
            }
          }}
          maxLength={2000}
        />
        <div className="mind-compose-row">
          <button type="submit" className="btn btn-primary" disabled={!draft.trim()}>
            Send
          </button>
          <button type="button" className="btn btn-ghost" onClick={restart}>
            Start a new conversation
          </button>
        </div>
      </form>

      <details className="card stack">
        <summary>
          <strong>Voice settings</strong>
        </summary>
        <label className="mind-toggle">
          <input
            type="checkbox"
            checked={speakReplies}
            disabled={canSpeak === false}
            onChange={(event) => {
              setSpeakReplies(event.target.checked);
              writeLocal(SPEAK_KEY, event.target.checked ? null : "off");
              if (!event.target.checked) {
                userStopped.current = true;
                player.stop(OWNER);
                userStopped.current = false;
              }
            }}
          />
          Read replies aloud
        </label>
        <label className="mind-toggle">
          <input type="checkbox" checked={handsFree} disabled={canListen === false} onChange={(event) => setHandsFree(event.target.checked)} />
          Continuous voice conversation: listen again after each reply
        </label>
        {canSpeak === false ? <p className="hint">This browser cannot read aloud. Replies are shown as text.</p> : null}
        <p className="hint">
          Voices come from your device, so the choice depends on your phone or computer. Devices do not tell web pages whether a voice is male or female, so try a few and choose one that sounds warm and calm to you. Only voices that run on your device are used for your conversation.
        </p>
        <button type="button" className="btn btn-secondary btn-small" onClick={() => setShowVoices((value) => !value)} aria-expanded={showVoices}>
          {showVoices ? "Hide voice choice" : "Choose a voice and speed"}
        </button>
        {showVoices ? (
          <div className="stack">
            <VoiceChoices lang="en" steps={false} rate={prefs.rate} stepWait={prefs.stepWait} />
            <button
              type="button"
              className="btn btn-secondary btn-small"
              disabled={voices.length === 0}
              onClick={() => player.play(OWNER, segmentsFromText("Hello. I'm here to listen. Take a slow breath, and tell me what's on your mind.", "en"), { stepWait: 0, localOnly: true })}
            >
              Try this voice
            </button>
          </div>
        ) : null}
        {consent !== "none" ? (
          <p className="hint">
            Microphone choice: {consent === "local" ? "on-device recognition only" : "the browser decides where speech is recognized"}.{" "}
            <button type="button" className="btn btn-ghost btn-small" onClick={() => chooseConsent("none")}>
              Reset
            </button>
          </p>
        ) : null}
      </details>
    </section>
  );
}
