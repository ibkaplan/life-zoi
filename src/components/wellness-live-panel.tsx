"use client";

import { useEffect, useId, useState, useSyncExternalStore, type FormEvent } from "react";
import { useLocale } from "@/components/locale-provider";
import { msg } from "@/lib/i18n/translate";
import { adapterStatusLabel } from "@/lib/wellness-assistant/adapter";
import {
  MODEL_NOT_CONFIGURED,
  MODEL_UNAVAILABLE,
  WELLNESS_ASSISTANT_EMERGENCY,
} from "@/lib/wellness-assistant/copy";
import {
  getLiveServerTurns,
  getLiveTurns,
  loadWellnessMeter,
  setLiveTurns,
  subscribeLive,
  type LiveTurn,
} from "@/lib/wellness-assistant/live-session";
import type { PreparedPointer, WellnessChatBody, WellnessUsageSnapshot } from "@/lib/wellness-assistant/model/types";

const SOURCE_LABEL: Record<string, string> = {
  model: msg("Wellness model"),
  prepared: msg("Prepared answer"),
  quota: msg("Prepared answer"),
  unavailable: msg("Prepared answer"),
  safety: msg("Safety notice"),
  withheld: msg("Reply withheld"),
};

const COUNT_FAILED = msg("This browser session could not be counted. Refresh the page and try again.");

export function WellnessLivePanel({ onOpenQuestion }: { onOpenQuestion: (id: string) => void }) {
  const { t, locale } = useLocale();
  const fieldId = useId();
  const turns = useSyncExternalStore(subscribeLive, getLiveTurns, getLiveServerTurns);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState(MODEL_NOT_CONFIGURED);
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [related, setRelated] = useState<PreparedPointer[]>([]);
  const [preparedId, setPreparedId] = useState<string | null>(null);
  const [usage, setUsage] = useState<WellnessUsageSnapshot | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/ai-assistant/wellness", { signal: controller.signal })
      .then((response) => response.json())
      .then((payload: { configured?: boolean; notice?: string }) => {
        if (typeof payload.notice === "string") setNotice(payload.notice);
        else setNotice(adapterStatusLabel(payload.configured === true));
      })
      .catch(() => setNotice(MODEL_NOT_CONFIGURED));
    return () => controller.abort();
  }, []);

  async function send(event: FormEvent) {
    event.preventDefault();
    const content = draft.trim();
    if (!content || busy) return;
    const meterKey = loadWellnessMeter(window.sessionStorage);
    if (!meterKey) {
      setNotice(COUNT_FAILED);
      return;
    }
    const userTurn: LiveTurn = { id: crypto.randomUUID(), role: "user", content };
    const history = [...turns, userTurn].slice(-8);
    setLiveTurns(history);
    setDraft("");
    setBusy(true);
    setSuggestion(null);
    try {
      const response = await fetch("/api/ai-assistant/wellness", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          meterKey,
          language: locale,
          messages: history.map((turn) => ({ role: turn.role, content: turn.content })),
        }),
      });
      const payload = (await response.json()) as WellnessChatBody & { error?: string };
      if (!response.ok || !payload.reply) {
        setNotice(payload.error || payload.notice || MODEL_UNAVAILABLE);
        return;
      }
      setLiveTurns([
        ...history,
        { id: crypto.randomUUID(), role: "assistant", content: payload.reply, source: payload.source },
      ]);
      setNotice(payload.notice ?? adapterStatusLabel(payload.configured));
      setSuggestion(payload.suggestion);
      setRelated(Array.isArray(payload.related) ? payload.related : []);
      setPreparedId(payload.preparedQuestionId);
      setUsage(payload.usage);
    } catch {
      setNotice(MODEL_UNAVAILABLE);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="wellness-live" aria-labelledby="ask-wellness-title">
      <h2 id="ask-wellness-title">{t("Ask in your own words")}</h2>
      <p className="wellness-source">{t(notice)}</p>
      <p className="wellness-emergency" role="note">
        {t(WELLNESS_ASSISTANT_EMERGENCY)}
      </p>
      {turns.length > 0 ? (
        <div className="wellness-thread" aria-live="polite">
          {turns.map((turn) => (
            <div key={turn.id} className={`wellness-bubble ${turn.role}`}>
              {turn.role === "assistant" && turn.source ? (
                <span className="wellness-kicker">{t(SOURCE_LABEL[turn.source] ?? "Reply")}</span>
              ) : null}
              {turn.role === "assistant" && turn.source !== "model" ? t(turn.content) : turn.content}
            </div>
          ))}
        </div>
      ) : null}
      {suggestion ? (
        <p className="wellness-suggestion" role="status">
          <span className="wellness-kicker">{t("A simple step from this conversation")}</span>
          {t(suggestion)}
        </p>
      ) : null}
      {usage ? (
        <p className="wellness-source">
          {t("{used} of {limit} model replies in this session today.", {
            used: usage.sessionUsed,
            limit: usage.sessionDailyLimit,
          })}
        </p>
      ) : null}
      <form className="wellness-search" onSubmit={send}>
        <label htmlFor={fieldId}>{turns.length > 0 ? t("Follow-up") : t("Your question")}</label>
        <textarea
          id={fieldId}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          maxLength={800}
          rows={3}
          placeholder={turns.length > 0 ? t("Ask a follow-up about what you already said") : t("Ask a general wellness question")}
          autoComplete="off"
        />
        <button className="btn assistant-send" type="submit" disabled={busy || !draft.trim()}>
          {busy ? t("Thinking…") : turns.length > 0 ? t("Send follow-up") : t("Ask")}
        </button>
      </form>
      {preparedId ? (
        <button className="btn btn-secondary" type="button" onClick={() => onOpenQuestion(preparedId)}>
          {t("Open the matching prepared answer")}
        </button>
      ) : null}
      {related.length > 0 ? (
        <div className="stack">
          <h3>{t("Prepared questions you can still open")}</h3>
          <div className="wellness-questions">
            {related.map((item) => (
              <button key={item.id} type="button" onClick={() => onOpenQuestion(item.id)}>
                {t(item.question)}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
