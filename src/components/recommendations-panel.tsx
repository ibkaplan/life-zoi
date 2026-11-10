"use client";

import { useEffect, useState } from "react";
import { usePageFormat } from "@/components/page-format";
import { SourceList } from "@/components/sources";
import { localizeRecommendations, type RecommendationResult } from "@/lib/recommendations";
import type { Assessment } from "@/lib/types";

export function RecommendationsPanel({
  answers,
}: {
  answers: Assessment | null;
}) {
  const { t, locale } = usePageFormat();
  const [attempt, setAttempt] = useState(0);
  const key = answers ? `${JSON.stringify(answers)}#${attempt}` : "";
  const [loaded, setLoaded] = useState<{
    key: string;
    result: RecommendationResult | null;
    error: boolean;
  } | null>(null);

  useEffect(() => {
    if (!answers || !key) return;
    const controller = new AbortController();
    const requestKey = key;
    fetch("/api/recommendations", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ assessment: answers }),
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) throw new Error("unavailable");
        const result = (await response.json()) as RecommendationResult;
        setLoaded({ key: requestKey, result, error: false });
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setLoaded({ key: requestKey, result: null, error: true });
      });
    return () => controller.abort();
  }, [answers, key]);

  const status: "idle" | "loading" | "error" | "ready" = !answers
    ? "idle"
    : loaded?.key === key
      ? loaded.error
        ? "error"
        : "ready"
      : "loading";
  const loadedResult = loaded?.key === key ? loaded.result : null;
  const result = loadedResult ? localizeRecommendations(loadedResult, t) : null;

  if (!answers) {
    return (
      <section className="card empty">
        <h2>{t("Suggestions")}</h2>
        <p>{t("Complete the lifestyle assessment before lifeZoi offers suggestions. Nothing is assumed from an empty profile.")}</p>
      </section>
    );
  }
  if (status === "loading") {
    return (
      <section className="card" role="status">
        <h2>{t("Suggestions")}</h2>
        <p>{t("Preparing suggestions from your answers…")}</p>
      </section>
    );
  }
  if (status === "error" || !result) {
    return (
      <section className="card" role="alert">
        <h2>{t("Suggestions")}</h2>
        <p>{t("Suggestions could not be prepared. Nothing was saved.")}</p>
        <button className="btn btn-secondary" type="button" onClick={() => setAttempt((value) => value + 1)}>
          {t("Try again")}
        </button>
      </section>
    );
  }
  if (result.withheld || result.items.length === 0) {
    return (
      <section className="card" role="status">
        <h2>{t("Suggestions")}</h2>
        <p>{t("Suggestions were withheld by an internal wording check. No personal prediction is shown.")}</p>
        <p>{result.notice}</p>
      </section>
    );
  }
  return (
    <section className="stack">
      <div>
        <p className="kicker">{t("Suggestions")}</p>
        <h2>{t("Ideas based on what you entered")}</h2>
      </div>
      {result.items.map((item) => (
        <article className="card stack" key={item.id}>
          <h3>{item.title}</h3>
          <p>{item.why}</p>
          <ul>
            {item.actions.map((action) => (
              <li key={action}>{action}</li>
            ))}
          </ul>
          <SourceList sources={item.sources} />
          {locale !== "en" && item.sources.length > 0 ? <p className="hint">{t("The linked sources are in English.")}</p> : null}
        </article>
      ))}
      <p className="footer-note">{result.notice}</p>
    </section>
  );
}
