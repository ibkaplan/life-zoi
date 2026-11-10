"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePageFormat } from "@/components/page-format";
import { PagePhoto } from "@/components/page-photo";
import { useLocale } from "@/components/locale-provider";
import { useSession } from "@/components/session-provider";
import { useAccount } from "@/lib/account-store";
import { SourceList, LoadingState } from "@/components/sources";
import { msg } from "@/lib/i18n/translate";
import { translateError } from "@/lib/i18n/translate-error";
import { habitLabels } from "@/lib/labels";
import { buildCombination, localizeScenario, type ScenarioIllustration } from "@/lib/scenarios";
import { HABIT_IDS, type Assessment, type HabitId } from "@/lib/types";

type Combination = ReturnType<typeof buildCombination> & {
  parts?: { primary: ScenarioIllustration; secondary: ScenarioIllustration };
};

const presetIds = HABIT_IDS.filter((id) => id !== "custom");

const examples: { habitId: HabitId; label: string; note: string }[] = [
  { habitId: "walk", label: msg("What if I walk 30 minutes daily?"), note: msg("A daily 30-minute walk, on days that feel workable.") },
  { habitId: "eating", label: msg("What if I reduce added sugar?"), note: msg("Fewer sugary drinks and sweets, without an all-or-nothing diet.") },
  { habitId: "sleep", label: msg("What if I improve my sleep?"), note: msg("A steadier sleep window.") },
  { habitId: "balance", label: msg("What if I practice balance exercises?"), note: msg("Balance practice near a sturdy support.") },
  { habitId: "eating", label: msg("What if I increase fiber?"), note: msg("More beans, oats, vegetables, or fruit.") },
  { habitId: "strength", label: msg("What if I add strength training twice a week?"), note: msg("Two days of familiar strength movements.") },
];

const PREPARE_FAILED = msg("The illustration could not be prepared.");


export function WhatIfView({ scenarioId }: { scenarioId?: string }) {
  const { ready, sample, session, saveScenario } = useSession();
  const { t, timestamp } = usePageFormat();
  const { messages: m } = useLocale();
  const showError = (text: string) => t(translateError(text, m) ?? text);
  const accountReady = useAccount().phase === "ready";
  const [override, setOverride] = useState<{
    scenarioId: string;
    habitId: HabitId;
    note: string;
  } | null>(null);
  const [secondHabit, setSecondHabit] = useState<HabitId | "">("");
  const [request, setRequest] = useState<{
    key: string;
    status: "loading" | "error" | "ready";
    result: ScenarioIllustration | null;
    combo: Combination | null;
    error: string;
  } | null>(null);
  const [savedMessage, setSavedMessage] = useState("");

  const saved = scenarioId
    ? session.scenarios.find((item) => item.id === scenarioId) ?? null
    : null;
  const latest = session.history[0]?.answers ?? null;
  const formKey = scenarioId ?? "";
  const habitId =
    override && override.scenarioId === formKey ? override.habitId : (saved?.habitId ?? "walk");
  const note = override && override.scenarioId === formKey ? override.note : (saved?.note ?? "");
  const savedKey =
    ready && saved && latest
      ? `saved:${saved.id}:${JSON.stringify(latest)}`
      : ready && saved
        ? `saved:${saved.id}:none`
        : "";

  useEffect(() => {
    if (!saved || !savedKey) return;
    const controller = new AbortController();
    const requestKey = savedKey;
    requestIllustration(saved.habitId, saved.note, latest, controller.signal)
      .then((illustration) => {
        setRequest((current) =>
          current?.key === "manual"
            ? current
            : { key: requestKey, status: "ready", result: illustration, combo: null, error: "" },
        );
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setRequest((current) =>
          current?.key === "manual"
            ? current
            : {
                key: requestKey,
                status: "error",
                result: null,
                combo: null,
                error:
                  error instanceof Error
                    ? error.message
                    : PREPARE_FAILED,
              },
        );
      });
    return () => controller.abort();
  }, [saved, savedKey, latest]);

  const manual = request?.key === "manual" ? request : null;
  const savedResult = request?.key === savedKey ? request : null;
  const visible = manual ?? savedResult;
  const status = visible?.status ?? (savedKey ? "loading" : "idle");
  const result = visible?.status === "ready" && visible.result ? localizeScenario(visible.result, t) : null;
  const formError = manual?.status === "error" ? manual.error : "";

  if (!ready) return <LoadingState label={t("Loading WHAT IF?…")} />;

  function chooseHabit(nextHabit: HabitId) {
    setOverride({ scenarioId: formKey, habitId: nextHabit, note });
  }

  async function showIllustration(event: React.FormEvent) {
    event.preventDefault();
    setSavedMessage("");
    setRequest({ key: "manual", status: "loading", result: null, combo: null, error: "" });
    try {
      const illustration = await requestIllustration(habitId, note, latest, undefined);
      let combo: Combination | null = null;
      if (secondHabit && secondHabit !== habitId) {
        const other = await requestIllustration(secondHabit, "", latest, undefined);
        combo = { ...buildCombination(illustration, other), parts: { primary: illustration, secondary: other } };
      }
      setRequest({ key: "manual", status: "ready", result: illustration, combo, error: "" });
    } catch (error: unknown) {
      const message =
        error instanceof Error && error.message
          ? error.message
          : PREPARE_FAILED;
      setRequest({ key: "manual", status: "error", result: null, combo: null, error: message });
    }
  }

  return (
    <div className="stack-lg">
      <PagePhoto id="what-if" />
      <div className="narrow stack">
        <p className="kicker">WHAT IF?</p>
        <h1>{t("Explore one change")}</h1>
        <p className="lede">
          {t("Pick a habit, or describe your own. Add a second habit if you want a hypothetical combination. lifeZoi compares it with your latest completed assessment when you have one, and keeps established guidance separate from what is uncertain. Every comparison is hypothetical.")}
        </p>
      </div>
      {scenarioId && !saved ? (
        <section className="card empty">
          <h2>{t("That scenario is not in this tab")}</h2>
          <p>{t("It may have been cleared with the session, or it belongs to sample data you are not viewing.")}</p>
          <Link className="btn btn-secondary" href="/what-if">{t("Back to WHAT IF?")}</Link>
        </section>
      ) : null}
      <form className="card stack" onSubmit={showIllustration}>
        <fieldset className="field">
          <legend>{t("Try a question")}</legend>
          <div className="choices">
            {examples.map((example) => (
              <button
                key={example.label}
                className="btn btn-secondary"
                type="button"
                onClick={() => setOverride({ scenarioId: formKey, habitId: example.habitId, note: t(example.note) })}
              >
                {t(example.label)}
              </button>
            ))}
          </div>
          <p className="hint">
            {t("These questions fill the form. The illustration cites public sources and does not estimate a personal disease risk.")}
          </p>
        </fieldset>
        <fieldset className="field">
          <legend>{t("Habit")}</legend>
          <div className="choices">
            {presetIds.map((id) => (
              <label className="choice" key={id}>
                <input
                  type="radio"
                  name="habit"
                  value={id}
                  checked={habitId === id}
                  onChange={() => chooseHabit(id)}
                />
                <span>{t(habitLabels[id])}</span>
                <span className="choice-mark">{habitId === id ? t("Selected") : ""}</span>
              </label>
            ))}
            <label className="choice">
              <input
                type="radio"
                name="habit"
                value="custom"
                checked={habitId === "custom"}
                onChange={() => chooseHabit("custom")}
              />
              <span>{t("A change in your own words")}</span>
              <span className="choice-mark">{habitId === "custom" ? t("Selected") : ""}</span>
            </label>
          </div>
        </fieldset>
        <label className="field" htmlFor="scenario-note">
          <span>{habitId === "custom" ? t("Describe the change") : t("Optional note")}</span>
          <span className="hint">
            {habitId === "custom"
              ? t("Required for a custom scenario. lifeZoi will not invent evidence for it.")
              : t("Saved with the scenario. It is not treated as a medical fact.")}
          </span>
          <textarea
            id="scenario-note"
            maxLength={280}
            value={note}
            onChange={(event) =>
              setOverride({ scenarioId: formKey, habitId, note: event.target.value })
            }
          />
        </label>
        <fieldset className="field">
          <legend>{t("Optional second habit")}</legend>
          <p className="hint">{t("Compare your current routine, one change, and a combination. The combination is hypothetical and is not merged into a personal forecast.")}</p>
          <div className="choices">
            <label className="choice">
              <input type="radio" name="second-habit" checked={secondHabit === ""} onChange={() => setSecondHabit("")} />
              <span>{t("No second habit")}</span>
            </label>
            {presetIds.map((id) => (
              <label className="choice" key={`second-${id}`}>
                <input
                  type="radio"
                  name="second-habit"
                  value={id}
                  checked={secondHabit === id}
                  onChange={() => setSecondHabit(id)}
                />
                <span>{t(habitLabels[id])}</span>
              </label>
            ))}
          </div>
        </fieldset>
        {formError ? (
          <p className="field-error" role="alert">
            {showError(formError)}
          </p>
        ) : null}
        <button className="btn btn-primary" type="submit">
          {t("Show this illustration")}
        </button>
      </form>
      {status === "loading" ? <LoadingState label={t("Preparing the illustration…")} /> : null}
      {status === "error" && !formError ? (
        <p className="alert alert-error" role="alert">
          {t(PREPARE_FAILED)}
        </p>
      ) : null}
      {status === "ready" && result ? (
        <>
          <Illustration
            result={result}
            onSave={() => {
              const error = saveScenario(result.habitId, result.yourNote || note);
              setSavedMessage(error ?? (accountReady ? msg("Saved to your account.") : msg("Saved in this browser tab.")));
            }}
            savedMessage={savedMessage ? showError(savedMessage) : ""}
            sample={sample}
          />
          {visible?.combo ? <CombinationView combo={visible.combo} /> : null}
        </>
      ) : null}
      <section className="stack">
        <h2>{t("Saved in this tab")}</h2>
        {session.scenarios.length === 0 ? (
          <div className="card empty">
            <p>{t("Saved scenarios will appear here. Nothing is stored on a server.")}</p>
          </div>
        ) : (
          <ul className="record-list">
            {session.scenarios.map((item) => (
              <li key={item.id}>
                <strong>{t(habitLabels[item.habitId])}</strong>
                <p className="hint">{timestamp(item.savedAt)}</p>
                {item.note ? <p>{item.note}</p> : null}
                <Link href={`/what-if/${item.id}`}>{t("Revisit")}</Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function CombinationView({ combo }: { combo: Combination }) {
  const t = usePageFormat().t;
  const local = combo.parts
    ? buildCombination(localizeScenario(combo.parts.primary, t), localizeScenario(combo.parts.secondary, t), t)
    : combo;
  return (
    <article className="card stack">
      <p className="kicker">{local.label}</p>
      <h2>{t("Current, one change, and a combination")}</h2>
      <section>
        <h3>{t("Current")}</h3>
        <p>{local.current}</p>
      </section>
      <section>
        <h3>{t("One change")}</h3>
        <p>{local.oneChange}</p>
      </section>
      <section>
        <h3>{t("Combination")}</h3>
        <p>{local.together}</p>
      </section>
    </article>
  );
}

function Illustration({
  result,
  onSave,
  savedMessage,
  sample,
}: {
  result: ScenarioIllustration;
  onSave: () => void;
  savedMessage: string;
  sample: boolean;
}) {
  const { t, locale } = usePageFormat();
  return (
    <article className="card stack">
      <p className="kicker">{t("Illustration")}</p>
      <h2>{result.title}</h2>
      {result.yourNote ? (
        <p>
          <strong>{t("Your note:")}</strong> {result.yourNote}
        </p>
      ) : null}
      {result.currentRoutine ? (
        <section>
          <h3>{t("Current routine")}</h3>
          <p>{result.currentRoutine}</p>
        </section>
      ) : null}
      {result.proposedChange ? (
        <section>
          <h3>{t("Proposed change")}</h3>
          <p>{result.proposedChange}</p>
        </section>
      ) : null}
      {result.likelyBenefits.length > 0 ? (
        <section>
          <h3>{t("Likely benefits described by the sources")}</h3>
          <ul>
            {result.likelyBenefits.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      ) : null}
      {result.challenges.length > 0 ? (
        <section>
          <h3>{t("Practical challenges")}</h3>
          <ul>
            {result.challenges.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      ) : null}
      {result.nextSteps.length > 0 ? (
        <section>
          <h3>{t("Possible next steps")}</h3>
          <ul>
            {result.nextSteps.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      ) : null}
      {result.established ? (
        <p>
          <strong>{t("What the sources support:")} </strong>
          {result.established}
        </p>
      ) : null}
      {result.uncertain ? <p>{result.uncertain}</p> : null}
      <SourceList sources={result.sources} />
      {locale !== "en" && result.sources.length > 0 ? <p className="hint">{t("The linked sources are in English.")}</p> : null}
      <p>{result.notice}</p>
      {sample ? (
        <p>{t("Sample mode cannot save a new scenario.")}</p>
      ) : (
        <button className="btn btn-secondary" type="button" onClick={onSave}>
          {t("Save in this session")}
        </button>
      )}
      {savedMessage ? (
        <p role="status" className="alert alert-ok">
          {savedMessage}
        </p>
      ) : null}
    </article>
  );
}

async function requestIllustration(
  habitId: HabitId,
  note: string,
  assessment: Assessment | null,
  signal: AbortSignal | undefined,
): Promise<ScenarioIllustration> {
  const response = await fetch("/api/what-if", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ habitId, note, assessment }),
    signal,
  });
  const payload = (await response.json().catch(() => null)) as
    | (ScenarioIllustration & { error?: string; fields?: Record<string, string> })
    | null;
  if (!response.ok) {
    const fieldMessage = payload?.fields ? Object.values(payload.fields)[0] : "";
    throw new Error(fieldMessage || payload?.error || PREPARE_FAILED);
  }
  if (!payload) throw new Error(PREPARE_FAILED);
  return payload;
}
