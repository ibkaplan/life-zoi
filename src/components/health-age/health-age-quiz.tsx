"use client";

import "@/components/health-age/health-age.css";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useLocale } from "@/components/locale-provider";
import { BAND_MESSAGE, QUIZ_QUESTIONS, quizResult, type QuizAnswers, type QuizResult } from "@/lib/health-age/quiz";
import type { Translate } from "@/lib/i18n/translate";
import { areaById } from "@/lib/wellness-score";

type Stage = "intro" | "quiz" | "result";

const RING = 2 * Math.PI * 52;

/**
 * The free 2-minute habits check. Answers stay in this component's state:
 * nothing is sent to a server or written to browser storage, and the result
 * card is drawn in the browser.
 */
export function HealthAgeQuiz() {
  const { t } = useLocale();
  const [stage, setStage] = useState<Stage>("intro");
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswers>({});
  const headingRef = useRef<HTMLHeadingElement>(null);
  const result = quizResult(answers);

  useEffect(() => {
    if (stage !== "intro") headingRef.current?.focus();
  }, [stage, index]);

  function choose(questionId: string, optionId: string) {
    const next = { ...answers, [questionId]: optionId };
    setAnswers(next);
    if (index < QUIZ_QUESTIONS.length - 1) setIndex(index + 1);
    else setStage("result");
  }

  function restart() {
    setAnswers({});
    setIndex(0);
    setStage("quiz");
  }

  if (stage === "intro") {
    return (
      <div className="ha stack-lg">
        <section className="ha-hero">
          <p className="kicker">{t("Free · 2 minutes · no sign-up")}</p>
          <h1>{t("How young are your habits?")}</h1>
          <p className="lede">
            {t("Seven quick questions about sleep, movement, food, tobacco, alcohol, stress, and the people around you. See which everyday habits already work for you and the one small step that would help most.")}
          </p>
          <button className="btn btn-primary ha-go" type="button" onClick={() => setStage("quiz")}>
            {t("Start the check")} <span aria-hidden="true">→</span>
          </button>
          <ul className="ha-promises">
            <li>{t("Your answers stay on this page. Nothing is sent or saved.")}</li>
            <li>{t("A lifestyle check for education, not a medical test or a diagnosis.")}</li>
          </ul>
        </section>
      </div>
    );
  }

  if (stage === "result" && result) {
    return <ResultView result={result} onRestart={restart} headingRef={headingRef} />;
  }

  const question = QUIZ_QUESTIONS[index];
  const chosen = answers[question.id];
  const step = index + 1;
  return (
    <div className="ha stack-lg">
      <section className="ha-card" aria-labelledby="ha-question">
        <div className="ha-progress-row">
          <p className="ha-step">{t("Question {n} of {total}", { n: step, total: QUIZ_QUESTIONS.length })}</p>
          <p className="ha-area">{t(areaById(question.area).label)}</p>
        </div>
        <div
          className="ha-bar"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={QUIZ_QUESTIONS.length}
          aria-valuenow={index}
          aria-label={t("Progress")}
        >
          <span style={{ width: `${(index / QUIZ_QUESTIONS.length) * 100}%` }} />
        </div>
        <h2 id="ha-question" ref={headingRef} tabIndex={-1}>
          {t(question.question)}
        </h2>
        <div className="ha-options" role="group" aria-labelledby="ha-question">
          {question.options.map((option) => (
            <button
              key={option.id}
              type="button"
              className="ha-option"
              aria-pressed={chosen === option.id}
              onClick={() => choose(question.id, option.id)}
            >
              {t(option.label)}
            </button>
          ))}
        </div>
        <div className="ha-nav">
          {index > 0 ? (
            <button className="btn btn-secondary" type="button" onClick={() => setIndex(index - 1)}>
              <span aria-hidden="true">←</span> {t("Back")}
            </button>
          ) : (
            <button className="btn btn-secondary" type="button" onClick={() => setStage("intro")}>
              <span aria-hidden="true">←</span> {t("Back")}
            </button>
          )}
        </div>
      </section>
    </div>
  );
}

function ResultView({
  result,
  onRestart,
  headingRef,
}: {
  result: QuizResult;
  onRestart: () => void;
  headingRef: React.RefObject<HTMLHeadingElement | null>;
}) {
  const { t } = useLocale();
  const [shareNote, setShareNote] = useState("");
  const share = result.counted === 0 ? 0 : result.met.length / result.counted;
  const countLine = t("{met} of {counted} habit areas on track", { met: result.met.length, counted: result.counted });

  async function shareCard() {
    setShareNote("");
    try {
      const blob = await drawCard(result, t);
      const file = new File([blob], "lifezoi-habits.png", { type: "image/png" });
      const text = `${countLine} · ${t("How young are your habits?")}`;
      const url = `${window.location.origin}/free/health-age`;
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: t("How young are your habits?"), text: `${text} ${url}` });
        return;
      }
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = file.name;
      link.click();
      setTimeout(() => URL.revokeObjectURL(link.href), 1000);
      setShareNote(t("The card was saved as a picture. You can post it anywhere."));
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setShareNote(t("The card could not be made in this browser."));
    }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/free/health-age`);
      setShareNote(t("Link copied. Send it to a friend to try the check."));
    } catch {
      setShareNote(t("Copying is blocked in this browser."));
    }
  }

  return (
    <div className="ha stack-lg">
      <section className="ha-result" aria-labelledby="ha-result-title">
        <p className="ha-result-kicker">{t("Your habits check")}</p>
        <div className="ha-result-main">
          <div className="ha-ring" aria-hidden="true">
            <svg viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="52" className="ha-ring-track" />
              <circle
                cx="60"
                cy="60"
                r="52"
                className="ha-ring-fill"
                strokeDasharray={RING}
                strokeDashoffset={RING * (1 - share)}
              />
            </svg>
            <span>
              {result.met.length}
              <small>/{result.counted}</small>
            </span>
          </div>
          <div className="stack">
            <h1 id="ha-result-title" ref={headingRef} tabIndex={-1}>
              {t(result.band.label)}
            </h1>
            <p className="ha-count">{countLine}</p>
            <p>{t(BAND_MESSAGE[result.band.id])}</p>
          </div>
        </div>
        <ul className="ha-areas" aria-label={t("Habit areas")}>
          {QUIZ_QUESTIONS.map((question) => {
            const state = result.met.includes(question.area) ? "met" : result.attention.includes(question.area) ? "attention" : "skipped";
            return (
              <li key={question.id} data-state={state}>
                <span aria-hidden="true">{state === "met" ? "✓" : state === "attention" ? "○" : "–"}</span>
                {t(areaById(question.area).label)}
                <span className="sr-only">
                  {" "}
                  {state === "met" ? t("On track") : state === "attention" ? t("Room to grow") : t("Not answered")}
                </span>
              </li>
            );
          })}
        </ul>
        <p className="ha-note">{t("A lifestyle check for education, not a medical test or a diagnosis.")}</p>
      </section>

      <div className="ha-actions">
        <button className="btn btn-primary" type="button" onClick={shareCard}>
          {t("Share my result card")}
        </button>
        <button className="btn btn-secondary" type="button" onClick={copyLink}>
          {t("Copy link for a friend")}
        </button>
        <button className="btn btn-secondary" type="button" onClick={onRestart}>
          {t("Take it again")}
        </button>
      </div>
      {shareNote ? (
        <p className="hint" role="status">
          {shareNote}
        </p>
      ) : null}

      {result.nextSteps.length ? (
        <section className="card stack" aria-labelledby="ha-next">
          <h2 id="ha-next">{t("Small next steps")}</h2>
          <ul className="ha-next">
            {result.nextSteps.map((item) => (
              <li key={item.area}>
                <strong>{t(item.label)}</strong>
                <span>{t(item.text)}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="card stack ha-join" aria-labelledby="ha-join">
        <h2 id="ha-join">{t("Turn this into a plan")}</h2>
        <p>
          {t("LifeZoi members get the full lifestyle questionnaire, a personal plan, daily habits, and progress over time. Membership is by invitation: ask a friend who is a member, or open the invitation you received.")}
        </p>
        <div className="actions">
          <Link className="btn btn-primary" href="/#invitation">
            {t("I have an invitation")}
          </Link>
          <Link className="btn btn-secondary" href="/sign-in">
            {t("Log in")}
          </Link>
          <Link className="btn btn-secondary" href="/free">
            {t("More free tools")}
          </Link>
        </div>
      </section>
    </div>
  );
}

/** The shareable picture, drawn in the browser. It shows only the result, never the answers. */
async function drawCard(result: QuizResult, t: Translate): Promise<Blob> {
  const width = 1080;
  const height = 1350;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("no canvas");
  if (document.fonts?.ready) await document.fonts.ready;

  const sans = getComputedStyle(document.body).fontFamily || "sans-serif";
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, "#4A2380");
  gradient.addColorStop(0.55, "#6A3DA8");
  gradient.addColorStop(1, "#1B5E58");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = "rgba(255,255,255,0.08)";
  ctx.beginPath();
  ctx.arc(width - 120, 160, 260, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#ffffff";
  ctx.textBaseline = "alphabetic";
  ctx.font = `700 44px ${sans}`;
  ctx.fillText("LifeZoi", 90, 130);
  ctx.font = `600 36px ${sans}`;
  ctx.fillStyle = "rgba(255,255,255,0.85)";
  ctx.fillText(t("Your habits check"), 90, 190);

  const cx = width / 2;
  const cy = 470;
  const radius = 190;
  const share = result.counted === 0 ? 0 : result.met.length / result.counted;
  ctx.lineWidth = 34;
  ctx.lineCap = "round";
  ctx.strokeStyle = "rgba(255,255,255,0.2)";
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.stroke();
  if (share > 0) {
    ctx.strokeStyle = "#F2B65D";
    ctx.beginPath();
    ctx.arc(cx, cy, radius, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * share);
    ctx.stroke();
  }
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.font = `800 150px ${sans}`;
  ctx.fillText(`${result.met.length}/${result.counted}`, cx, cy + 52);

  ctx.font = `700 64px ${sans}`;
  fitText(ctx, t(result.band.label), cx, 770, width - 160);
  ctx.font = `500 38px ${sans}`;
  ctx.fillStyle = "rgba(255,255,255,0.9)";
  fitText(ctx, t("{met} of {counted} habit areas on track", { met: result.met.length, counted: result.counted }), cx, 835, width - 160);

  ctx.textAlign = "left";
  ctx.font = `600 34px ${sans}`;
  const columnX = [110, width / 2 + 30];
  QUIZ_QUESTIONS.forEach((question, i) => {
    const met = result.met.includes(question.area);
    const skipped = !met && !result.attention.includes(question.area);
    const x = columnX[i % 2];
    const y = 940 + Math.floor(i / 2) * 70;
    ctx.fillStyle = met ? "#F2B65D" : "rgba(255,255,255,0.55)";
    ctx.fillText(met ? "✓" : skipped ? "–" : "○", x, y);
    ctx.fillStyle = "#ffffff";
    fitText(ctx, t(areaById(question.area).label), x + 50, y, width / 2 - 150);
  });

  ctx.textAlign = "center";
  ctx.font = `500 28px ${sans}`;
  ctx.fillStyle = "rgba(255,255,255,0.8)";
  fitText(ctx, t("A lifestyle check for education, not a medical test or a diagnosis."), cx, height - 110, width - 140);
  ctx.font = `700 30px ${sans}`;
  ctx.fillStyle = "#ffffff";
  fitText(ctx, t("Try it free: {url}", { url: `${window.location.host}/free/health-age` }), cx, height - 60, width - 140);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("no blob"))), "image/png");
  });
}

/** Shrinks the font until the line fits. */
function fitText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number) {
  const match = /(\d+)px/.exec(ctx.font);
  let size = match ? Number(match[1]) : 30;
  while (ctx.measureText(text).width > maxWidth && size > 18) {
    size -= 2;
    ctx.font = ctx.font.replace(/\d+px/, `${size}px`);
  }
  ctx.fillText(text, x, y);
}
