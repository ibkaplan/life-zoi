"use client";

import { useEffect, useId, useState, useSyncExternalStore } from "react";
import { useSession } from "@/components/session-provider";
import { LoadingState } from "@/components/sources";
import {
  clearAssistantThread,
  DEVELOPMENT_MESSAGE,
  getAssistantServerThread,
  getAssistantThread,
  loadMeterKey,
  setAssistantThread,
  subscribeAssistantThread,
  SUGGESTED_QUESTIONS,
  WELCOME_MESSAGE,
  type StoredAssistantTurn,
} from "@/lib/assistant";

type Availability = {
  mode: "mock" | "disabled";
  detail: string;
  plan?: string;
  model?: string | null;
};

type Usage = {
  dailyUsed: number;
  dailyLimit: number;
  monthlyUsed: number;
  monthlyLimit: number;
  estimatedCostCents: number;
  spendingAlert: string | null;
};

const topics = [
  ["General health questions", "Educational information about wellness, prevention, and healthy aging."],
  ["Personal health analysis", "Not available yet. Assessment answers stay in this browser until privacy review."],
  ["Nutrition and sleep", "Practical education about food, hydration, sleep, and daily habits."],
  ["Movement and fitness", "General ideas for activity, gentle exercise, balance, and mobility."],
  ["Lab results", "Not available yet. File upload waits for a privacy and security review."],
  ["Daily coach", "Small educational ideas. Personal goals are not sent to an AI provider in this stage."],
  ["WHAT IF?", "A place to talk through a possible change, including benefits, challenges, and uncertainty."],
] as const;

export function AiAssistantView() {
  const { ready } = useSession();
  const messages = useSyncExternalStore(subscribeAssistantThread, getAssistantThread, getAssistantServerThread);
  const [draft, setDraft] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [safety, setSafety] = useState("");
  const [usage, setUsage] = useState<Usage | null>(null);
  const [availability, setAvailability] = useState<Availability | null>(null);
  const inputId = useId();

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/ai-assistant", { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error("status");
        setAvailability((await response.json()) as Availability);
      })
      .catch((reason: unknown) => {
        if (reason instanceof DOMException && reason.name === "AbortError") return;
        setAvailability({ mode: "disabled", detail: DEVELOPMENT_MESSAGE });
      });
    return () => controller.abort();
  }, []);

  if (!ready) return <LoadingState label="Loading the assistant…" />;

  async function send(text: string) {
    const content = text.trim();
    if (!content || pending) return;
    const next: StoredAssistantTurn = { id: crypto.randomUUID(), role: "user", content };
    const history = [...messages, next];
    setAssistantThread(history);
    setDraft("");
    setError("");
    setSafety("");
    setPending(true);
    try {
      const response = await fetch("/api/ai-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          meterKey: loadMeterKey(window.sessionStorage),
          messages: history.map(({ role, content: turn }) => ({ role, content: turn })),
        }),
      });
      const payload = (await response.json()) as {
        reply?: string | null;
        error?: string | null;
        safetyNotice?: string | null;
        source?: string;
        usage?: Usage | null;
      };
      if (payload.usage) setUsage(payload.usage);
      if (payload.safetyNotice) setSafety(payload.safetyNotice);
      if (!response.ok || !payload.reply) {
        setError(payload.error || "The development assistant could not reply. No paid AI service was contacted.");
        return;
      }
      const prefix = payload.source === "withheld" ? "lifeZoi withheld the reply. " : "";
      setAssistantThread([
        ...history,
        { id: crypto.randomUUID(), role: "assistant", content: `${prefix}${payload.reply}` },
      ]);
    } catch {
      setError("The assistant could not be reached. No paid AI service was contacted.");
    } finally {
      setPending(false);
    }
  }

  function clearChat() {
    clearAssistantThread(window.sessionStorage);
    setDraft("");
    setError("");
    setSafety("");
    setUsage(null);
  }

  return (
    <div className="assistant stack-lg">
      <div className="assistant-intro">
        <p className="assistant-kicker">AI Health Assistant</p>
        <h1>A conversation about everyday health</h1>
        <p className="assistant-welcome">{WELCOME_MESSAGE}</p>
        <p className="assistant-banner" role="status">
          {availability?.detail ?? "Checking the development assistant…"}
        </p>
      </div>

      <section className="assistant-topics" aria-labelledby="assistant-topics-title">
        <h2 id="assistant-topics-title">What you can ask about</h2>
        <ul>
          {topics.map(([title, text]) => (
            <li key={title}>
              <h3>{title}</h3>
              <p>{text}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="assistant-suggestions" aria-labelledby="assistant-suggestions-title">
        <h2 id="assistant-suggestions-title">Suggested questions</h2>
        <div>
          {SUGGESTED_QUESTIONS.map((question) => (
            <button key={question} type="button" onClick={() => setDraft(question)}>
              {question}
            </button>
          ))}
        </div>
      </section>

      <section className="assistant-thread" aria-labelledby="assistant-thread-title">
        <div className="assistant-thread-head">
          <h2 id="assistant-thread-title">This conversation</h2>
          <button className="btn assistant-clear" type="button" onClick={clearChat}>
            Clear chat
          </button>
        </div>
        {messages.length === 0 ? (
          <p className="assistant-empty">Messages in this tab appear here. They are not stored in a database.</p>
        ) : (
          <ol>
            {messages.map((message) => (
              <li key={message.id} className={message.role === "user" ? "is-user" : "is-assistant"}>
                <span>{message.role === "user" ? "You" : "Development reply"}</span>
                <p>{message.content}</p>
              </li>
            ))}
          </ol>
        )}
        {pending ? <p role="status">Preparing a development reply…</p> : null}
        {usage ? (
          <p className="assistant-usage" role="status">
            Development meter: {usage.dailyUsed} of {usage.dailyLimit} daily requests, and {usage.monthlyUsed} of {usage.monthlyLimit} this month. Estimated planning cost {usage.estimatedCostCents} cents. This is not a charge.
            {usage.spendingAlert ? ` ${usage.spendingAlert}` : ""}
          </p>
        ) : null}
        {safety ? <p className="assistant-safety" role="alert">{safety}</p> : null}
        {error ? <p className="assistant-error" role="alert">{error}</p> : null}
      </section>

      <form
        className="assistant-composer"
        onSubmit={(event) => {
          event.preventDefault();
          void send(draft);
        }}
      >
        <label htmlFor={inputId}>Your message</label>
        <textarea
          id={inputId}
          value={draft}
          maxLength={1500}
          rows={4}
          placeholder="Ask an educational health question"
          onChange={(event) => setDraft(event.target.value)}
        />
        <p className="assistant-consent">
          Personal assessment answers are not sent in this development stage. They stay in this browser until accounts, consent, and a privacy review are in place.
        </p>
        <button className="btn assistant-send" type="submit" disabled={pending || !draft.trim()}>
          Send
        </button>
      </form>
    </div>
  );
}
