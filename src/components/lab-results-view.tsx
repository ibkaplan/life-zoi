"use client";

import { useState } from "react";
import { HEALTH_REFERENCES, referencesForLoinc } from "@/lib/references/library";
import { SYNTHETIC_REPORT, markAgainstSuppliedRange, rangeSentence, type SyntheticResult } from "@/lib/lab-report";

type LiveReference = {
  matched?: boolean;
  title?: string | null;
  url?: string | null;
  excerpt?: string | null;
  attribution?: string;
  message?: string;
  cached?: boolean;
};

export function LabResultsView() {
  const [selected, setSelected] = useState<SyntheticResult>(SYNTHETIC_REPORT.results[0]);
  const [live, setLive] = useState<LiveReference | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");

  async function loadReference(result: SyntheticResult) {
    setSelected(result);
    setStatus("loading");
    setLive(null);
    try {
      const response = await fetch(`/api/references?loinc=${encodeURIComponent(result.loinc)}`);
      const body = (await response.json()) as LiveReference;
      setLive(body);
      setStatus(response.ok ? "ready" : "error");
    } catch {
      setStatus("error");
    }
  }

  const mark = markAgainstSuppliedRange(selected.value, selected.rangeLow, selected.rangeHigh);
  const library = referencesForLoinc(selected.loinc);

  return (
    <div className="change-lab stack-lg">
      <div className="stack">
        <p className="kicker">Understand my lab results</p>
        <h1>A development preview with an example report</h1>
        <p className="lede">
          This screen explains a fictional laboratory report and can ask MedlinePlus about the test code. It does not read a real document, and it does not send a personal result anywhere.
        </p>
      </div>
      <p className="banner" role="status">{SYNTHETIC_REPORT.notice}</p>
      <section className="card stack">
        <h2>{SYNTHETIC_REPORT.title}</h2>
        <p>
          <strong>{SYNTHETIC_REPORT.person}</strong> · {SYNTHETIC_REPORT.laboratory}
        </p>
        <div className="choices">
          {SYNTHETIC_REPORT.results.map((result) => (
            <button
              key={result.id}
              className="btn btn-secondary"
              type="button"
              aria-pressed={selected.id === result.id}
              onClick={() => void loadReference(result)}
            >
              {result.name}
            </button>
          ))}
        </div>
        <dl className="review-list">
          <div><dt>Test</dt><dd>{selected.name}</dd></div>
          <div><dt>LOINC</dt><dd>{selected.loinc}</dd></div>
          <div><dt>Value</dt><dd>{selected.value} {selected.unit}</dd></div>
          <div><dt>Range on this example report</dt><dd>{selected.rangeLow}–{selected.rangeHigh} {selected.unit}</dd></div>
          <div><dt>Date on the example</dt><dd>{selected.measuredOn}</dd></div>
          <div><dt>Compared with that printed range</dt><dd>{rangeSentence(mark)}</dd></div>
        </dl>
        <h3>What the test generally measures</h3>
        <p>{selected.measures}</p>
        <h3>Why people look at it</h3>
        <p>{selected.whyItMatters}</p>
        <h3>Questions for a healthcare professional</h3>
        <ul>
          {selected.questions.map((question) => (
            <li key={question}>{question}</li>
          ))}
        </ul>
        <button className="btn btn-primary" type="button" onClick={() => void loadReference(selected)}>
          {status === "loading" ? "Contacting MedlinePlus…" : "Load the MedlinePlus reference"}
        </button>
        {status === "loading" ? <p role="status">Asking MedlinePlus Connect for this LOINC code only.</p> : null}
        {status === "error" ? (
          <p className="alert alert-error" role="alert">
            {live?.message ?? "The reference could not be loaded. The library links below are still available. No personal result was sent."}
          </p>
        ) : null}
        {status === "ready" && live ? (
          <article className="card stack">
            <h3>{live.matched ? live.title : "No MedlinePlus page"}</h3>
            <p>{live.message}</p>
            {live.excerpt ? <p>{live.excerpt}</p> : null}
            {live.url ? (
              <a href={live.url}>Open the MedlinePlus page</a>
            ) : null}
            <p className="hint">{live.attribution}{live.cached ? " Loaded from lifeZoi’s 12-hour cache." : ""}</p>
          </article>
        ) : null}
      </section>
      <section className="card stack">
        <h2>Saved reference library</h2>
        <ul className="record-list">
          {(library.length > 0 ? library : HEALTH_REFERENCES).map((item) => (
            <li key={item.id}>
              <strong>{item.title}</strong>
              <p>{item.organization}{item.updated ? ` · Reviewed ${item.updated}` : ""}</p>
              <p>{item.explanation}</p>
              <a href={item.url}>Open the original page</a>
            </li>
          ))}
        </ul>
      </section>
      <section className="card stack">
        <h2>Future document upload</h2>
        <p>
          Upload is turned off. A file chosen here is not accepted, not stored, and not sent to MedlinePlus or an AI service. Real document reading waits for authentication, consent, encryption, access control, retention, and deletion review.
        </p>
        <label className="field">
          <span>Example file picker, disabled</span>
          <input type="file" disabled aria-describedby="upload-off" />
        </label>
        <p id="upload-off" className="hint">Real document analysis is not active.</p>
      </section>
    </div>
  );
}
