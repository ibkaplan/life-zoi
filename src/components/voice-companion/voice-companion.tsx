"use client";

import "@/components/voice-companion/voice-companion.css";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { useBackgroundMusic } from "@/components/background-music/provider";
import { useGuided } from "@/components/guided/guided-provider";
import { useProfile } from "@/components/companion/use-profile";
import { useLocale, useT } from "@/components/locale-provider";
import { MicConsent } from "@/components/voice-companion/mic-consent";
import { useVoiceState } from "@/components/voice/read-aloud";
import { useAccount } from "@/lib/account-store";
import { greetingFor, nextVariant, spokenName } from "@/lib/companion-voice/greeting";
import { companion, companionStatus, GUIDED_OWNER, serverCompanionState, type CompanionStatus } from "@/lib/companion-voice/runtime";
import type { MicChoice } from "@/lib/companion-voice/prefs";
import { listenErrorMessage } from "@/lib/mind/speech";
import { US_CRISIS_ACTIONS } from "@/lib/mind/safety";
import { msg, type Translate } from "@/lib/i18n/translate";

const PANEL_HELLO = msg("Hello! I'm here. Tap Talk to LifeZoi and tell me what you'd like, for example: open My Day.");

/** Set once per tab, so LifeZoi welcomes the person when they open it, not on every page. */
const GREETED_KEY = "lifezoi.voice-companion.greeted";

export function useCompanionVoice() {
  return useSyncExternalStore(companion.subscribe, companion.state, serverCompanionState);
}

function readGreeted(): boolean {
  try {
    return window.sessionStorage.getItem(GREETED_KEY) === "1";
  } catch {
    return false;
  }
}

function markGreeted() {
  try {
    window.sessionStorage.setItem(GREETED_KEY, "1");
  } catch {
    // Storage can be blocked; the welcome may then play again on reload.
  }
}

export function statusLabel(t: Translate, status: CompanionStatus): string {
  switch (status) {
    case "listening":
      return t("Listening now");
    case "thinking":
      return t("Thinking");
    case "speaking":
      return t("Speaking");
    case "paused":
      return t("Paused");
    case "off":
      return t("Voice off");
    default:
      return t("Ready");
  }
}

function OrbIcon({ status }: { status: CompanionStatus }) {
  if (status === "speaking")
    return (
      <span className="vc-bars" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
      </span>
    );
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <rect x="9" y="3" width="6" height="11" rx="3" fill="currentColor" />
      <path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21M8.5 21h7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      {status === "off" || status === "paused" ? <path d="M4 4l16 16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /> : null}
    </svg>
  );
}

/** The welcome for this visit, from the saved questionnaire. Sample data is never treated as the person's own. */
function useWelcome() {
  const t = useT();
  const profile = useProfile();
  const saved = profile.sample ? null : (profile.session.history[0]?.answers ?? null);
  return {
    ready: profile.ready,
    make(variant: number) {
      const name = spokenName(saved?.displayName);
      const hour = new Date().getHours();
      const greeting = greetingFor({ hasProfile: saved !== null, name, hour, variant, t });
      const plain = greetingFor({ hasProfile: saved !== null, name: null, hour, variant, t }).text;
      return { ...greeting, plain, personal: name !== null };
    },
  };
}

/**
 * LifeZoi's voice companion on every members' page: a status button in the corner,
 * the once-only "Meet your voice companion" panel, the welcome, and a small panel
 * with the conversation, hands-free switch, and microphone off.
 */
export function VoiceCompanion() {
  const t = useT();
  const { locale } = useLocale();
  const router = useRouter();
  const pathname = usePathname() ?? "/";
  const music = useBackgroundMusic();
  const account = useAccount();
  const state = useCompanionVoice();
  const voice = useVoiceState();
  const welcome = useWelcome();
  const [open, setOpen] = useState(false);
  const [consent, setConsent] = useState<"setup" | "panel" | null>(null);
  const orbRef = useRef<HTMLButtonElement>(null);
  const speaking = voice.owner === "voice-companion" && (voice.status === "playing" || voice.status === "waiting");
  const status = companionStatus(state, speaking);
  const voiceProblem = voice.owner === "voice-companion" ? voice.problem : null;
  const guided = useGuided();
  const guidedOpen = guided.running !== null || (voice.owner === GUIDED_OWNER && voice.status !== "idle");

  // A guided session speaks and pauses on its own; the companion does not listen over it.
  useEffect(() => {
    if (!guidedOpen) return;
    companion.holdMic(GUIDED_OWNER);
    return () => companion.releaseMic(GUIDED_OWNER);
  }, [guidedOpen]);

  const actions = useMemo(
    () => ({
      navigate: (href: string) => router.push(href),
      back: () => router.back(),
      playMusic: (category: Parameters<typeof music.selectCategory>[0] | null) => {
        if (category) music.selectCategory(category, true);
        else music.play();
      },
      pauseMusic: () => music.pause(),
      t,
      lang: locale,
    }),
    [router, music, t, locale],
  );
  const actionsRef = useRef(actions);
  useEffect(() => {
    actionsRef.current = actions;
    companion.update(actions);
  }, [actions]);
  useEffect(() => companion.attach(actionsRef.current), []);

  // The welcome: once per tab, after the saved profile is known, never over a guided session.
  const signedIn = account.phase === "ready";
  useEffect(() => {
    if (!state.loaded || !welcome.ready || !signedIn) return;
    if (state.prefs.setup === "new" || !state.prefs.autoWelcome || readGreeted() || guidedOpen) return;
    markGreeted();
    const variant = nextVariant(state.prefs.lastVariant);
    const greeting = welcome.make(variant);
    if (!greeting.needsProfile) companion.savePrefs({ lastVariant: variant });
    companion.greet(greeting.text, greeting.needsProfile, greeting.personal, greeting.plain);
  }, [state.loaded, state.prefs.setup, state.prefs.autoWelcome, state.prefs.lastVariant, welcome, signedIn, guidedOpen]);

  // A microphone or voice problem opens the panel, so the message is seen instead of nothing happening.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- shows a problem the runtime reported
    if (state.error || voiceProblem) setOpen(true);
  }, [state.error, voiceProblem]);

  // A new page closes the welcome card; the panel stays as the person left it.
  const lastPath = useRef(pathname);
  useEffect(() => {
    if (lastPath.current === pathname) return;
    lastPath.current = pathname;
    companion.dismissGreeting();
  }, [pathname]);

  // Esc stops LifeZoi speaking and listening at once.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      const current = companion.state();
      if (current.listening || companion.speaking()) companion.interrupt();
      else setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (!state.loaded || !signedIn) return null;

  function greetNow() {
    markGreeted();
    const variant = nextVariant(state.prefs.lastVariant);
    const greeting = welcome.make(variant);
    companion.savePrefs({ lastVariant: greeting.needsProfile ? state.prefs.lastVariant : variant });
    companion.greet(greeting.text, greeting.needsProfile, greeting.personal, greeting.plain);
  }

  function enableVoice() {
    companion.savePrefs({ setup: "done", voiceOutput: true, autoWelcome: true });
    greetNow();
  }

  function chooseMic(choice: MicChoice, from: "setup" | "panel") {
    setConsent(null);
    if (choice === "none") return;
    companion.setMic(choice);
    if (from === "setup") companion.savePrefs({ setup: "done", voiceOutput: true, autoWelcome: true });
    companion.setHandsFree(true);
    if (from === "setup" && !readGreeted()) greetNow();
  }

  function onOrb() {
    if (status === "listening" || status === "speaking") {
      companion.interrupt();
      return;
    }
    if (open) {
      setOpen(false);
      return;
    }
    // One tap does something you can hear: the welcome, listening, or a short hello.
    setOpen(true);
    if (state.greeting?.blocked) companion.replayGreeting();
    else if (state.prefs.mic !== "none" && state.recognitionSupported) companion.talk();
    else if (state.prefs.voiceOutput) companion.sayNow(t(PANEL_HELLO));
  }

  function onTalk() {
    if (state.prefs.mic === "none") {
      setConsent("panel");
      return;
    }
    companion.talk();
  }

  const showSetup = state.prefs.setup === "new" && welcome.ready;
  const greeting = state.greeting;
  const micOn = state.prefs.mic !== "none";
  const orbLabel =
    status === "listening"
      ? t("LifeZoi is listening. Tap to stop.")
      : status === "speaking"
        ? t("LifeZoi is speaking. Tap to stop.")
        : open
          ? t("Close the LifeZoi voice companion")
          : t("Open the LifeZoi voice companion");

  return (
    <div className="vc-root" data-status={status}>
      {showSetup ? (
        <section className="vc-sheet vc-setup" aria-labelledby="vc-setup-title">
          <p className="vc-kicker">{t("New")}</p>
          <h2 id="vc-setup-title">{t("Meet your LifeZoi voice companion")}</h2>
          <p>{t("Let LifeZoi welcome you, listen to you, and guide your wellness journey.")}</p>
          <p className="hint">{t("The microphone is needed only for voice conversations. You can type and tap as usual, and turn every voice feature off in Settings.")}</p>
          {consent === "setup" ? (
            <MicConsent lang={locale} onChoose={(choice) => chooseMic(choice, "setup")} />
          ) : (
            <div className="actions">
              <button type="button" className="btn btn-primary" onClick={enableVoice}>
                {t("Enable voice")}
              </button>
              {state.recognitionSupported ? (
                <button type="button" className="btn btn-secondary" onClick={() => setConsent("setup")}>
                  {t("Enable microphone")}
                </button>
              ) : null}
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => {
                  markGreeted();
                  companion.savePrefs({ setup: "later" });
                }}
              >
                {t("Not now")}
              </button>
            </div>
          )}
        </section>
      ) : greeting && !open ? (
        <section className="vc-sheet vc-greeting" aria-live="polite" aria-label={t("LifeZoi welcome")}>
          <p className="vc-who">LifeZoi</p>
          <p>{greeting.text}</p>
          <div className="actions">
            {greeting.needsProfile ? (
              <Link
                className="btn btn-primary"
                href="/assessment"
                onClick={() => {
                  companion.clearSuggestion();
                  companion.dismissGreeting();
                }}
              >
                {t("Complete my profile")}
              </Link>
            ) : null}
            {greeting.blocked ? (
              <button type="button" className="btn btn-secondary" onClick={() => companion.replayGreeting()}>
                {t("▶ Hear my welcome")}
              </button>
            ) : null}
            {micOn && !state.prefs.handsFree ? (
              <button type="button" className="btn btn-secondary" onClick={onTalk}>
                {t("Talk to LifeZoi")}
              </button>
            ) : null}
            <button type="button" className="btn btn-ghost" onClick={() => companion.dismissGreeting()}>
              {t("Close")}
            </button>
          </div>
          {greeting.blocked ? <p className="hint">{t("Your browser keeps pages quiet until you tap. One tap and LifeZoi will speak.")}</p> : null}
        </section>
      ) : null}

      {open ? (
        <section className="vc-sheet vc-panel" id="vc-panel" aria-labelledby="vc-panel-title">
          <div className="vc-panel-head">
            <h2 id="vc-panel-title">{t("LifeZoi voice companion")}</h2>
            <span className="vc-pill" data-status={status} role="status">
              <span className="vc-dot" aria-hidden="true" /> {statusLabel(t, status)}
            </span>
          </div>
          {state.listening ? (
            <p className="vc-heard" aria-live="off">
              <span className="vc-who">{t("You (listening…)")}</span> {state.interim || "…"}
            </p>
          ) : state.heard ? (
            <p className="vc-heard">
              <span className="vc-who">{t("You said")}</span> {state.heard}
            </p>
          ) : null}
          {state.reply ? (
            <p className="vc-reply" aria-live="polite">
              <span className="vc-who">LifeZoi</span> {state.reply}
            </p>
          ) : (
            <p className="hint">{t("Try saying: “Open My Day”, “Start Pilates”, “Play relaxing music”, or “Show my progress”.")}</p>
          )}
          {state.suggestion?.kind === "ask-ai" ? (
            <p>
              <Link className="btn btn-secondary btn-small" href={`/lifezoi-ai?q=${encodeURIComponent(state.suggestion.question.slice(0, 600))}`} onClick={() => companion.clearSuggestion()}>
                {t("Ask LifeZoi AI this question")}
              </Link>
            </p>
          ) : null}
          {state.suggestion?.kind === "crisis" ? (
            <ul className="vc-crisis">
              {US_CRISIS_ACTIONS.map((action) => (
                <li key={action.href}>
                  <a className="btn btn-primary btn-small" href={action.href}>
                    {t(action.label)}
                  </a>{" "}
                  <span className="hint">{t(action.detail)}</span>
                </li>
              ))}
            </ul>
          ) : null}
          {voiceProblem ? (
            <p className="alert alert-error" role="alert">
              {voiceProblem === "no-voice"
                ? t("This device has no voice for this language, so LifeZoi's replies are shown as text. You can add a voice in your computer's language and speech settings.")
                : voiceProblem === "unsupported"
                  ? t("This browser cannot read aloud, so LifeZoi's replies are shown as text.")
                  : t("The voice could not start. Tap the LifeZoi button to try again.")}
            </p>
          ) : null}
          {state.error ? (
            <p className="alert alert-error" role="alert">
              {t(listenErrorMessage(state.error))}
            </p>
          ) : null}
          {state.micHeldBy === GUIDED_OWNER ? (
            <p className="hint">{t("A guided session is open, so the companion is not listening. It listens again when the session ends.")}</p>
          ) : state.micHeldBy ? (
            <p className="hint">{t("Another LifeZoi microphone on this page is in use, so the companion is paused.")}</p>
          ) : null}
          {status === "paused" && !state.micHeldBy ? <p className="hint">{t("Hands-free is paused. Tap Talk to LifeZoi to start listening again.")}</p> : null}

          {consent === "panel" ? (
            <MicConsent lang={locale} onChoose={(choice) => chooseMic(choice, "panel")} />
          ) : (
            <div className="actions">
              {state.recognitionSupported ? (
                state.listening ? (
                  <button type="button" className="btn btn-primary" onClick={() => companion.interrupt()}>
                    {t("Stop listening")}
                  </button>
                ) : (
                  <button type="button" className="btn btn-primary" onClick={onTalk}>
                    {t("Talk to LifeZoi")}
                  </button>
                )
              ) : null}
              {speaking ? (
                <button type="button" className="btn btn-secondary" onClick={() => companion.interrupt()}>
                  {t("Stop speaking")}
                </button>
              ) : null}
              {micOn ? (
                <button type="button" className="btn btn-ghost" onClick={() => companion.setMic("none")}>
                  {t("Microphone off")}
                </button>
              ) : null}
            </div>
          )}
          {state.recognitionSupported ? (
            micOn ? (
              <label className="vc-switch">
                <input type="checkbox" checked={state.prefs.handsFree} onChange={(event) => companion.setHandsFree(event.target.checked)} />
                {t("Hands-free: keep listening after each reply")}
              </label>
            ) : null
          ) : (
            <p className="hint">{t("Speaking to LifeZoi is not available in this browser. Chrome, Edge, and Safari support it. LifeZoi can still speak to you.")}</p>
          )}
          <p className="hint">
            {micOn ? t("The microphone is on only while the button shows Listening. LifeZoi does not record or store your voice.") : t("The microphone is off.")}{" "}
            <Link href="/settings#voice-companion" onClick={() => setOpen(false)}>
              {t("Voice Companion settings")}
            </Link>
          </p>
        </section>
      ) : null}

      <button
        ref={orbRef}
        type="button"
        className="vc-orb"
        data-status={status}
        onClick={onOrb}
        aria-label={orbLabel}
        aria-expanded={open}
        aria-controls={open ? "vc-panel" : undefined}
        title={statusLabel(t, status)}
      >
        <OrbIcon status={status} />
      </button>
      {status === "listening" || status === "speaking" || status === "thinking" ? (
        <span className="vc-orb-label" aria-hidden="true">
          {statusLabel(t, status)}
        </span>
      ) : null}
      <span className="sr-only" role="status" aria-live="polite">
        {status === "listening" ? t("The microphone is on. LifeZoi is listening.") : ""}
      </span>
    </div>
  );
}
