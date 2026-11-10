"use client";

import { useState } from "react";
import { usePageFormat } from "@/components/page-format";
import { msg } from "@/lib/i18n/translate";
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

/** Messages the MedlinePlus route can return. They are shown in the chosen language. */
export const REFERENCE_MESSAGES = [
  msg("MedlinePlus Connect did not return a page for this code. The code may still be a real LOINC code."),
  msg("MedlinePlus Connect responded, but the page link was not usable."),
  msg("Educational reference only. It does not interpret this person's result."),
  msg("lifeZoi does not look up codes it has not verified. No request was sent."),
  msg("lifeZoi paused new MedlinePlus requests to stay inside the published rate guidance. Try again shortly."),
  msg("MedlinePlus Connect did not answer successfully. The saved library links are still available."),
  msg("MedlinePlus Connect could not be reached. No personal result was sent."),
  msg("Information from MedlinePlus.gov, a service of the National Library of Medicine."),
] as const;

export function LabResultsView() {
  const { t, locale, longDate } = usePageFormat();
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
        <p className="kicker">{t("Understand my lab results")}</p>
        <h1>{t("A development preview with an example report")}</h1>
        <p className="lede">
          {t("This screen explains a fictional laboratory report and can ask MedlinePlus about the test code. It does not read a real document, and it does not send a personal result anywhere.")}
        </p>
      </div>
      <p className="banner" role="status">{t(SYNTHETIC_REPORT.notice)}</p>
      <section className="card stack">
        <h2>{t(SYNTHETIC_REPORT.title)}</h2>
        <p>
          <strong>{t(SYNTHETIC_REPORT.person)}</strong> · {t(SYNTHETIC_REPORT.laboratory)}
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
              {t(result.name)}
            </button>
          ))}
        </div>
        <dl className="review-list">
          <div><dt>{t("Test")}</dt><dd>{t(selected.name)}</dd></div>
          <div><dt>LOINC</dt><dd>{selected.loinc}</dd></div>
          <div><dt>{t("Value")}</dt><dd>{selected.value.toLocaleString(locale === "en" ? "en-US" : locale)} {t(selected.unit)}</dd></div>
          <div>
            <dt>{t("Range on this example report")}</dt>
            <dd>
              {selected.rangeLow.toLocaleString(locale === "en" ? "en-US" : locale)}–{selected.rangeHigh.toLocaleString(locale === "en" ? "en-US" : locale)} {t(selected.unit)}
            </dd>
          </div>
          <div><dt>{t("Date on the example")}</dt><dd>{locale === "en" ? selected.measuredOn : longDate(selected.measuredOn)}</dd></div>
          <div><dt>{t("Compared with that printed range")}</dt><dd>{t(rangeSentence(mark))}</dd></div>
        </dl>
        <h3>{t("What the test generally measures")}</h3>
        <p>{t(selected.measures)}</p>
        <h3>{t("Why people look at it")}</h3>
        <p>{t(selected.whyItMatters)}</p>
        <h3>{t("Questions for a healthcare professional")}</h3>
        <ul>
          {selected.questions.map((question) => (
            <li key={question}>{t(question)}</li>
          ))}
        </ul>
        <button className="btn btn-primary" type="button" onClick={() => void loadReference(selected)}>
          {status === "loading" ? t("Contacting MedlinePlus…") : t("Load the MedlinePlus reference")}
        </button>
        {status === "loading" ? <p role="status">{t("Asking MedlinePlus Connect for this LOINC code only.")}</p> : null}
        {status === "error" ? (
          <p className="alert alert-error" role="alert">
            {t(live?.message ?? "The reference could not be loaded. The library links below are still available. No personal result was sent.")}
          </p>
        ) : null}
        {status === "ready" && live ? (
          <article className="card stack">
            <h3>{live.matched ? live.title : t("No MedlinePlus page")}</h3>
            {live.message ? <p>{t(live.message)}</p> : null}
            {live.excerpt ? <p lang={locale === "en" ? undefined : "en"}>{live.excerpt}</p> : null}
            {locale !== "en" && (live.excerpt || live.url) ? <p className="hint">{t("MedlinePlus text and pages are in English.")}</p> : null}
            {live.url ? (
              <a href={live.url}>{t("Open the MedlinePlus page")}</a>
            ) : null}
            <p className="hint">
              {live.attribution ? t(live.attribution) : null}
              {live.cached ? ` ${t("Loaded from lifeZoi’s 12-hour cache.")}` : ""}
            </p>
          </article>
        ) : null}
      </section>
      <section className="card stack">
        <h2>{t("Saved reference library")}</h2>
        <ul className="record-list">
          {(library.length > 0 ? library : HEALTH_REFERENCES).map((item) => (
            <li key={item.id}>
              <strong>{item.title}</strong>
              <p>
                {item.organization}
                {item.updated ? ` · ${t("Reviewed {date}", { date: item.updated })}` : ""}
              </p>
              <p>{t(item.explanation)}</p>
              <a href={item.url}>{t("Open the original page")}</a>
              {locale !== "en" ? <span className="hint"> {t("(in English)")}</span> : null}
            </li>
          ))}
        </ul>
      </section>
      <section className="card stack">
        <h2>{t("Future document upload")}</h2>
        <p>
          {t("Upload is turned off. A file chosen here is not accepted, not stored, and not sent to MedlinePlus or an AI service. Real document reading waits for authentication, consent, encryption, access control, retention, and deletion review.")}
        </p>
        <label className="field">
          <span>{t("Example file picker, disabled")}</span>
          <input type="file" disabled aria-describedby="upload-off" />
        </label>
        <p id="upload-off" className="hint">{t("Real document analysis is not active.")}</p>
      </section>
    </div>
  );
}
