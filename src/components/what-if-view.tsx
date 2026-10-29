"use client";

import Link from "next/link";
import { useState } from "react";
import { latestAssessment } from "@/lib/user-data";
import { getScenario, scenarios } from "@/lib/scenarios";
import { removeScenario, saveGoal, saveScenario } from "@/lib/user-data";
import { Alert, Button, Card, PageHeader, SourceList, TextAreaField } from "@/components/ui";
import { DataGate, postValidation } from "@/components/user-data-provider";

export function WhatIfList() {
  return (
    <DataGate>
      {(ready) => {
        const assessment = latestAssessment(ready.data);
        return (
          <div className="grid gap-6">
            <PageHeader
              eyebrow="WHAT IF?"
              title="Explore a change before you commit to it"
              lede="Pick a habit, compare it with what you reported, and read benefits, challenges, and next steps. These are illustrations, not medical predictions."
            />
            <Alert title="How to read this">
              Established guidance is linked to a public source. Anything that depends on your body is labeled as varying by person. lifeZoi does not calculate years of life or a personal risk figure.
            </Alert>
            {!assessment ? (
              <p className="text-muted">
                You can explore without an assessment. Complete the{" "}
                <Link className="font-semibold text-forest underline-offset-4 hover:underline" href="/assessment">
                  lifestyle assessment
                </Link>{" "}
                if you want the current routine to use your own answers.
              </p>
            ) : null}
            <ul className="grid gap-4 md:grid-cols-2">
              {scenarios.map((scenario) => (
                <li key={scenario.id}>
                  <Card className="h-full">
                    <h2 className="font-display text-3xl">{scenario.title}</h2>
                    <p className="mt-2 text-muted">{scenario.lead}</p>
                    <Link href={`/what-if/${scenario.id}`} className="mt-4 inline-flex min-h-11 items-center font-semibold text-forest underline-offset-4 hover:underline">
                      Open this scenario
                    </Link>
                  </Card>
                </li>
              ))}
            </ul>
            <Card>
              <h2 className="font-display text-3xl">Saved scenarios</h2>
              {ready.data.scenarios.length === 0 ? (
                <p className="mt-2 text-muted">None yet. Saving keeps a scenario in this browser so you can revisit it.</p>
              ) : (
                <ul className="mt-4 grid gap-3">
                  {ready.data.scenarios.map((saved) => {
                    const scenario = getScenario(saved.scenarioId);
                    return (
                      <li key={saved.id} className="flex flex-col gap-2 rounded-2xl bg-sage px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="font-semibold">{scenario?.title ?? "Saved scenario"}</p>
                          <p className="text-sm text-muted">{scenario?.options.find((option) => option.id === saved.optionId)?.label}</p>
                        </div>
                        <Link href={`/what-if/${saved.scenarioId}`} className="font-semibold text-forest">
                          Revisit
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </Card>
          </div>
        );
      }}
    </DataGate>
  );
}

export function ScenarioExplorer({ scenarioId }: { scenarioId: string }) {
  const scenario = getScenario(scenarioId);
  if (!scenario) {
    return (
      <PageHeader eyebrow="WHAT IF?" title="That scenario is not available" lede="Choose one of the listed habit changes." />
    );
  }
  return (
    <DataGate>
      {(ready) => <ScenarioBody scenarioId={scenario.id} data={ready.data} commit={ready.commit} />}
    </DataGate>
  );
}

function ScenarioBody({
  scenarioId,
  data,
  commit,
}: {
  scenarioId: string;
  data: import("@/lib/user-data").UserData;
  commit: (next: import("@/lib/user-data").UserData) => string | null;
}) {
  const scenario = getScenario(scenarioId);
  const existing = data.scenarios.find((item) => item.scenarioId === scenarioId);
  const [optionId, setOptionId] = useState(existing?.optionId ?? scenario?.options[0]?.id ?? "");
  const [note, setNote] = useState(existing?.note ?? "");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  if (!scenario) return null;
  const answers = latestAssessment(data)?.answers ?? null;

  async function save() {
    setError("");
    const server = await postValidation("/api/validate/scenario", { scenarioId, optionId, note });
    if (!server.ok) {
      setError(server.errors?.[0]?.message ?? server.message);
      return;
    }
    const result = saveScenario(data, { id: existing?.id ?? crypto.randomUUID(), scenarioId, optionId, note, now: new Date().toISOString() });
    if (!result.ok) {
      setError(result.errors[0]?.message ?? "Nothing was saved.");
      return;
    }
    const failure = commit(result.data);
    setMessage(failure ?? "Saved in this browser. This is not secure cloud storage.");
  }

  function track() {
    const option = scenario?.options.find((item) => item.id === optionId);
    if (!scenario || !option) return;
    const result = saveGoal(data, {
      id: crypto.randomUUID(),
      title: option.label,
      detail: option.detail,
      cadence: "most-days",
      sourceScenarioId: scenario.id,
      now: new Date().toISOString(),
    });
    if (!result.ok) {
      setError(result.errors[0]?.message ?? "The habit was not added.");
      return;
    }
    const failure = commit(result.data);
    setMessage(failure ?? "Added to Progress. No check-ins were invented.");
  }

  function remove() {
    if (!existing) return;
    commit(removeScenario(data, existing.id));
    setMessage("Removed from this browser.");
  }

  return (
    <div className="grid gap-6">
      <PageHeader eyebrow="WHAT IF?" title={scenario.title} lede={scenario.lead} />
      <Alert title="Educational illustration">
        Compare the routine on file with a proposed change. Sources are listed below. Uncertain outcomes stay qualitative.
      </Alert>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <h2 className="font-display text-2xl">Current routine</h2>
          <p className="mt-3 leading-relaxed">{scenario.currentRoutine(answers)}</p>
        </Card>
        <Card>
          <h2 className="font-display text-2xl">Proposed change</h2>
          <p className="mt-3 leading-relaxed">{scenario.proposedRoutine(optionId)}</p>
        </Card>
      </div>
      <fieldset>
        <legend className="text-lg font-semibold">Choose a version of this change</legend>
        <div className="mt-3 grid gap-2">
          {scenario.options.map((option) => (
            <label key={option.id} className={`block rounded-2xl border px-4 py-3 ${optionId === option.id ? "border-forest bg-sage" : "border-line bg-surface"}`}>
              <span className="flex items-start gap-3">
                <input type="radio" name="option" value={option.id} checked={optionId === option.id} onChange={() => setOptionId(option.id)} className="mt-1 size-4 accent-forest" />
                <span>
                  <span className="block font-semibold">{option.label}</span>
                  <span className="mt-1 block text-muted">{option.detail}</span>
                </span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      <Card>
        <h2 className="font-display text-2xl">What is reasonably established</h2>
        <ul className="mt-3 space-y-3">
          {scenario.benefits.filter((benefit) => benefit.kind === "established").map((benefit) => (
            <li key={benefit.text}>
              <span className="mr-2 rounded-full bg-sage px-2 py-1 text-xs font-semibold tracking-wide uppercase">Guidance</span>
              {benefit.text}
            </li>
          ))}
        </ul>
        <h2 className="mt-6 font-display text-2xl">What varies by person</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5">
          {scenario.benefits.filter((benefit) => benefit.kind === "varies").map((benefit) => (
            <li key={benefit.text}>{benefit.text}</li>
          ))}
          {scenario.uncertain.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </Card>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <h2 className="font-display text-2xl">Practical challenges</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            {scenario.challenges.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </Card>
        <Card>
          <h2 className="font-display text-2xl">Suggested next steps</h2>
          <ol className="mt-3 list-decimal space-y-2 pl-5">
            {scenario.nextSteps.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ol>
        </Card>
      </div>
      <Card>
        <h2 className="font-display text-2xl">Sources</h2>
        <SourceList ids={scenario.sourceIds} />
      </Card>
      <Card>
        <TextAreaField id="scenario-note" label="Your note" hint="Optional. Saved only on this device." value={note} maxLength={280} onChange={(event) => setNote(event.target.value)} />
        <div className="mt-4 flex flex-wrap gap-3">
          <Button type="button" onClick={save}>
            Save scenario
          </Button>
          <Button type="button" variant="secondary" onClick={track}>
            Track this as a habit
          </Button>
          {existing ? (
            <Button type="button" variant="quiet" onClick={remove}>
              Remove saved scenario
            </Button>
          ) : null}
        </div>
        {error ? <p role="alert" className="mt-3 font-semibold text-danger">{error}</p> : null}
        {message ? <p role="status" className="mt-3 text-muted">{message}</p> : null}
      </Card>
    </div>
  );
}
