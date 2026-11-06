"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PagePhoto } from "@/components/page-photo";
import { useSession } from "@/components/session-provider";
import { SourceList, LoadingState } from "@/components/sources";
import { formatTimestamp } from "@/lib/dates";
import { habitLabels } from "@/lib/labels";
import { buildCombination, type ScenarioIllustration } from "@/lib/scenarios";
import { HABIT_IDS, type Assessment, type HabitId } from "@/lib/types";

type Combination = ReturnType<typeof buildCombination>;

const presetIds = HABIT_IDS.filter((id) => id !== "custom");

const examples: { habitId: HabitId; label: string; note: string }[] = [
  { habitId: "walk", label: "What if I walk 30 minutes daily?", note: "A daily 30-minute walk, on days that feel workable." },
  { habitId: "eating", label: "What if I reduce added sugar?", note: "Fewer sugary drinks and sweets, without an all-or-nothing diet." },
  { habitId: "sleep", label: "What if I improve my sleep?", note: "A steadier sleep window." },
  { habitId: "balance", label: "What if I practice balance exercises?", note: "Balance practice near a sturdy support." },
  { habitId: "eating", label: "What if I increase fiber?", note: "More beans, oats, vegetables, or fruit." },
  { habitId: "strength", label: "What if I add strength training twice a week?", note: "Two days of familiar strength movements." },
];

export function WhatIfView({ scenarioId }: { scenarioId?: string }) {
  const { ready, sample, session, saveScenario } = useSession();
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
                    : "The illustration could not be prepared.",
              },
        );
      });
    return () => controller.abort();
  }, [saved, savedKey, latest]);

  const manual = request?.key === "manual" ? request : null;
  const savedResult = request?.key === savedKey ? request : null;
  const visible = manual ?? savedResult;
  const status = visible?.status ?? (savedKey ? "loading" : "idle");
  const result = visible?.status === "ready" ? visible.result : null;
  const formError = manual?.status === "error" ? manual.error : "";

  if (!ready) return <LoadingState label="Loading WHAT IF?…" />;

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
        combo = buildCombination(illustration, other);
      }
      setRequest({ key: "manual", status: "ready", result: illustration, combo, error: "" });
    } catch (error: unknown) {
      const message =
        error instanceof Error && error.message
          ? error.message
          : "The illustration could not be prepared.";
      setRequest({ key: "manual", status: "error", result: null, combo: null, error: message });
    }
  }

  return (
    <div className="stack-lg">
      <PagePhoto id="what-if" />
      <div className="narrow stack">
        <p className="kicker">WHAT IF?</p>
        <h1>Explore one change</h1>
        <p className="lede">
          Pick a habit, or describe your own. Add a second habit if you want a hypothetical combination. lifeZoi compares it with your latest completed assessment when you have one, and keeps established guidance separate from what is uncertain. Every comparison is hypothetical.
        </p>
      </div>
      {scenarioId && !saved ? (
        <section className="card empty">
          <h2>That scenario is not in this tab</h2>
          <p>It may have been cleared with the session, or it belongs to sample data you are not viewing.</p>
          <Link className="btn btn-secondary" href="/what-if">Back to WHAT IF?</Link>
        </section>
      ) : null}
      <form className="card stack" onSubmit={showIllustration}>
        <fieldset className="field">
          <legend>Try a question</legend>
          <div className="choices">
            {examples.map((example) => (
              <button
                key={example.label}
                className="btn btn-secondary"
                type="button"
                onClick={() => setOverride({ scenarioId: formKey, habitId: example.habitId, note: example.note })}
              >
                {example.label}
              </button>
            ))}
          </div>
          <p className="hint">
            These questions fill the form. The illustration cites public sources and does not estimate a personal disease risk.
          </p>
        </fieldset>
        <fieldset className="field">
          <legend>Habit</legend>
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
                <span>{habitLabels[id]}</span>
                <span className="choice-mark">{habitId === id ? "Selected" : ""}</span>
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
              <span>A change in your own words</span>
              <span className="choice-mark">{habitId === "custom" ? "Selected" : ""}</span>
            </label>
          </div>
        </fieldset>
        <label className="field" htmlFor="scenario-note">
          <span>{habitId === "custom" ? "Describe the change" : "Optional note"}</span>
          <span className="hint">
            {habitId === "custom"
              ? "Required for a custom scenario. lifeZoi will not invent evidence for it."
              : "Saved with the scenario. It is not treated as a medical fact."}
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
          <legend>Optional second habit</legend>
          <p className="hint">Compare your current routine, one change, and a combination. The combination is hypothetical and is not merged into a personal forecast.</p>
          <div className="choices">
            <label className="choice">
              <input type="radio" name="second-habit" checked={secondHabit === ""} onChange={() => setSecondHabit("")} />
              <span>No second habit</span>
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
                <span>{habitLabels[id]}</span>
              </label>
            ))}
          </div>
        </fieldset>
        {formError ? (
          <p className="field-error" role="alert">
            {formError}
          </p>
        ) : null}
        <button className="btn btn-primary" type="submit">
          Show this illustration
        </button>
      </form>
      {status === "loading" ? <LoadingState label="Preparing the illustration…" /> : null}
      {status === "error" && !formError ? (
        <p className="alert alert-error" role="alert">
          The illustration could not be prepared.
        </p>
      ) : null}
      {status === "ready" && result ? (
        <>
          <Illustration
            result={result}
            onSave={() => {
              const error = saveScenario(result.habitId, result.yourNote || note);
              setSavedMessage(error ?? "Saved in this browser tab.");
            }}
            savedMessage={savedMessage}
            sample={sample}
          />
          {visible?.combo ? <CombinationView combo={visible.combo} /> : null}
        </>
      ) : null}
      <section className="stack">
        <h2>Saved in this tab</h2>
        {session.scenarios.length === 0 ? (
          <div className="card empty">
            <p>Saved scenarios will appear here. Nothing is stored on a server.</p>
          </div>
        ) : (
          <ul className="record-list">
            {session.scenarios.map((item) => (
              <li key={item.id}>
                <strong>{habitLabels[item.habitId]}</strong>
                <p className="hint">{formatTimestamp(item.savedAt)}</p>
                {item.note ? <p>{item.note}</p> : null}
                <Link href={`/what-if/${item.id}`}>Revisit</Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function CombinationView({ combo }: { combo: Combination }) {
  return (
    <article className="card stack">
      <p className="kicker">{combo.label}</p>
      <h2>Current, one change, and a combination</h2>
      <section>
        <h3>Current</h3>
        <p>{combo.current}</p>
      </section>
      <section>
        <h3>One change</h3>
        <p>{combo.oneChange}</p>
      </section>
      <section>
        <h3>Combination</h3>
        <p>{combo.together}</p>
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
  return (
    <article className="card stack">
      <p className="kicker">Illustration</p>
      <h2>{result.title}</h2>
      {result.yourNote ? (
        <p>
          <strong>Your note:</strong> {result.yourNote}
        </p>
      ) : null}
      {result.currentRoutine ? (
        <section>
          <h3>Current routine</h3>
          <p>{result.currentRoutine}</p>
        </section>
      ) : null}
      {result.proposedChange ? (
        <section>
          <h3>Proposed change</h3>
          <p>{result.proposedChange}</p>
        </section>
      ) : null}
      {result.likelyBenefits.length > 0 ? (
        <section>
          <h3>Likely benefits described by the sources</h3>
          <ul>
            {result.likelyBenefits.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      ) : null}
      {result.challenges.length > 0 ? (
        <section>
          <h3>Practical challenges</h3>
          <ul>
            {result.challenges.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      ) : null}
      {result.nextSteps.length > 0 ? (
        <section>
          <h3>Possible next steps</h3>
          <ul>
            {result.nextSteps.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      ) : null}
      {result.established ? (
        <p>
          <strong>What the sources support: </strong>
          {result.established}
        </p>
      ) : null}
      {result.uncertain ? <p>{result.uncertain}</p> : null}
      <SourceList sources={result.sources} />
      <p>{result.notice}</p>
      {sample ? (
        <p>Sample mode cannot save a new scenario.</p>
      ) : (
        <button className="btn btn-secondary" type="button" onClick={onSave}>
          Save in this session
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
    throw new Error(fieldMessage || payload?.error || "The illustration could not be prepared.");
  }
  if (!payload) throw new Error("The illustration could not be prepared.");
  return payload;
}
