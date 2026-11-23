"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useLocale, useT } from "@/components/locale-provider";
import { ArticleLinks, ExerciseLinks, formatDate, SafetyActions, useMindStore } from "@/components/mind/shared";
import { compareResults, instrumentById, ITEM9_MESSAGE, PHQ9_SAFETY_ITEM, scoreInstrument, type Instrument, type ScoreResult } from "@/lib/mind/assessments";
import { initialConversation } from "@/lib/mind/conversation";
import { readConversation, writeConversation } from "@/lib/mind/conversation-store";
import { daysUntilRepeat, newId, resultsFor } from "@/lib/mind/progress";
import { reflectionById, REFLECTION_LABEL, REFLECTION_SCALE, summarizeReflection, type Reflection } from "@/lib/mind/reflections";
import { updateMindProgress } from "@/lib/mind/store";

function Item9Panel() {
  const t = useT();
  return (
    <section className="mind-safety" role="alert" aria-labelledby="item9-title">
      <h2 id="item9-title">{t(ITEM9_MESSAGE.title)}</h2>
      {ITEM9_MESSAGE.paragraphs.map((text) => (
        <p key={text}>{t(text)}</p>
      ))}
      <SafetyActions />
    </section>
  );
}

/** Shown when the site is not in English: the validated wording stays in its original language. */
const ORIGINAL_WORDING =
  "The questions and answer choices are shown in English, in their original validated wording. LifeZoi Mind will show them in another language only in the developers' official translation.";

function InstrumentRunner({ instrument }: { instrument: Instrument }) {
  const t = useT();
  const { locale } = useLocale();
  const router = useRouter();
  const store = useMindStore();
  const [started, setStarted] = useState(false);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(() => instrument.items.map(() => null));
  const [difficulty, setDifficulty] = useState<number | null>(null);
  const [finished, setFinished] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [item9Acknowledged, setItem9Acknowledged] = useState(false);
  const total = instrument.items.length + 1;
  const result: ScoreResult | null = finished ? scoreInstrument(instrument, answers, difficulty) : null;
  const previous = resultsFor(store.progress, instrument.id).filter((entry) => entry.id !== savedId);
  const repeatIn = previous[0] ? daysUntilRepeat(previous[0].date, instrument.repeatAfterDays) : 0;
  const item9Now = instrument.id === "phq9" && (answers[PHQ9_SAFETY_ITEM] ?? 0) > 0;

  function answer(value: number) {
    const next = [...answers];
    next[index] = value;
    setAnswers(next);
    if (instrument.id === "phq9" && index === PHQ9_SAFETY_ITEM && value > 0 && !item9Acknowledged) return;
    setIndex(index + 1);
  }

  function save() {
    if (!result) return;
    const id = newId();
    updateMindProgress((current) => ({
      ...current,
      results: [...current.results, { id, instrument: instrument.id, total: result.total, band: result.band.label, date: new Date().toISOString(), item9Positive: result.item9Positive }],
    }));
    setSavedId(id);
  }

  function talkAboutIt() {
    if (!result) return;
    const stored = readConversation();
    const context = { instrument: instrument.id, band: result.band.label, total: result.total, suggestFollowUp: result.suggestFollowUp, item9Positive: result.item9Positive };
    writeConversation({ turns: stored?.turns ?? [], state: { ...(stored?.state ?? initialConversation()), result: context, resultStep: 0 } });
    router.push("/mind");
  }

  if (!started) {
    return (
      <div className="stack-lg">
        <section className="card stack">
          <span className="mind-tag validated">{t("Validated questionnaire")}</span>
          <h2>{t("About the {name}", { name: instrument.shortName })}</h2>
          <p>{t(instrument.purpose)}</p>
          <p>
            {t("It has {count} questions about {timeFrame}, and takes about {minutes} minutes. Answer privately and honestly. There are no right or wrong answers, and you can stop at any time.", { count: instrument.items.length, timeFrame: t(instrument.timeFrame), minutes: instrument.minutes })}
          </p>
          {locale !== "en" ? <p className="mind-note">{t(ORIGINAL_WORDING)}</p> : null}
          <div className="mind-grid">
            <div className="stack">
              <h3>{t("What it can tell you")}</h3>
              <ul className="mind-list">
                {instrument.canTell.map((text) => (
                  <li key={text}>{t(text)}</li>
                ))}
              </ul>
            </div>
            <div className="stack">
              <h3>{t("What it cannot tell you")}</h3>
              <ul className="mind-list">
                {instrument.cannotTell.map((text) => (
                  <li key={text}>{t(text)}</li>
                ))}
              </ul>
            </div>
          </div>
          {repeatIn > 0 ? (
            <p className="mind-note">
              {locale === "en"
                ? `You saved a result ${formatDate(previous[0].date)}. Because this questionnaire asks about two weeks, it is most useful to repeat it in about ${repeatIn} day${repeatIn === 1 ? "" : "s"}. You can still take it now.`
                : t("You saved a result {date}. Because this questionnaire asks about two weeks, it is most useful to repeat it in about {days} days. You can still take it now.", { date: formatDate(previous[0].date, locale), days: repeatIn })}
            </p>
          ) : null}
          <div className="actions">
            <button type="button" className="btn btn-primary" onClick={() => setStarted(true)}>
              {t("Begin")}
            </button>
            <Link className="btn btn-ghost" href="/mind/understand">
              {t("Back to all questionnaires")}
            </Link>
          </div>
          <p className="hint" lang="en">
            {instrument.credit} {instrument.permission}
          </p>
        </section>
      </div>
    );
  }

  if (!finished) {
    const onDifficulty = index === instrument.items.length;
    const showItem9 = item9Now && index === PHQ9_SAFETY_ITEM && !item9Acknowledged;
    return (
      <section className="card stack" aria-labelledby="question-title">
        <p className="hint">
          {t("Question {number} of {total}", { number: Math.min(index + 1, total), total })}
        </p>
        <div className="mind-progressbar" aria-hidden="true">
          <span style={{ width: `${(index / total) * 100}%` }} />
        </div>
        {onDifficulty ? <p>{t("One last question.")}</p> : <p lang="en">{instrument.stem}</p>}
        <p id="question-title" className="mind-question" lang="en">
          {onDifficulty ? instrument.difficulty.question : instrument.items[index]}
        </p>
        {showItem9 ? (
          <>
            <Item9Panel />
            <div className="actions">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  setItem9Acknowledged(true);
                  setIndex(index + 1);
                }}
              >
                {t("I have read this. Continue the questionnaire")}
              </button>
            </div>
          </>
        ) : (
          <div className="mind-options" role="group" aria-labelledby="question-title" lang="en">
            {(onDifficulty ? instrument.difficulty.options.map((label, value) => ({ label, value })) : instrument.options).map((option) => (
              <button
                key={option.label}
                type="button"
                className="mind-option"
                aria-pressed={onDifficulty ? difficulty === option.value : answers[index] === option.value}
                onClick={() => {
                  if (onDifficulty) {
                    setDifficulty(option.value);
                    setFinished(true);
                  } else answer(option.value);
                }}
              >
                <span>{option.label}</span>
                {onDifficulty ? null : <span aria-hidden="true">{option.value}</span>}
              </button>
            ))}
          </div>
        )}
        <div className="actions">
          {index > 0 ? (
            <button type="button" className="btn btn-secondary" onClick={() => setIndex(index - 1)}>
              {t("Back")}
            </button>
          ) : null}
          {onDifficulty ? (
            <button type="button" className="btn btn-ghost" onClick={() => setFinished(true)}>
              {t("Skip this question")}
            </button>
          ) : null}
        </div>
      </section>
    );
  }

  if (!result) {
    return (
      <section className="card stack">
        <p>{t("Some questions were not answered, so no score can be worked out. The scoring only works when every question is answered.")}</p>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            setFinished(false);
            setIndex(answers.findIndex((value) => value === null));
          }}
        >
          {t("Go to the unanswered question")}
        </button>
      </section>
    );
  }

  return (
    <div className="stack-lg">
      {result.item9Positive ? <Item9Panel /> : null}
      <section className="card stack" aria-labelledby="result-title">
        <h2 id="result-title">{t("Your {name} result", { name: instrument.shortName })}</h2>
        <div className="mind-score">
          <span className="mind-score-number">
            {result.total} <span className="hint">{t("out of {max}", { max: result.maxScore })}</span>
          </span>
          <span className="mind-tag">{t("Range: {band}", { band: t(result.band.label) })}</span>
        </div>
        <p>{t(result.band.meaning)}</p>
        <div className="mind-scale" aria-label={t("Score ranges")}>
          {instrument.bands.map((band) => (
            <div key={band.label} className="mind-scale-row" data-current={band.label === result.band.label}>
              <span>
                {band.min}–{band.max}
              </span>
              <span>
                {t(band.label)}
                {band.label === result.band.label ? ` (${t("your result")})` : ""}
              </span>
            </div>
          ))}
        </div>
        {result.difficulty ? (
          <p>
            {t("You said how difficult these problems made daily life:")} <span lang="en">{result.difficulty}</span>
          </p>
        ) : null}
        <p className="mind-note">
          <strong>{t("This is not a diagnosis.")}</strong> {t("A score shows how often you were bothered by these symptoms over the last two weeks. It cannot tell you whether you have a condition or what is causing how you feel.")}{" "}
          {result.suggestFollowUp ? t("At this level, the questionnaire's developers suggest talking with a doctor or mental health professional.") : t("If you are worried about how you feel, a doctor or mental health professional can help, whatever the score.")}
        </p>
        <h3>{t("What this result cannot tell you")}</h3>
        <ul className="mind-list">
          {instrument.cannotTell.map((text) => (
            <li key={text}>{t(text)}</li>
          ))}
        </ul>
        {previous[0] ? (
          <p>
            <strong>{t("Compared with {date} ({total}):", { date: formatDate(previous[0].date, locale), total: previous[0].total })}</strong> {compareResults(instrument, previous[0].total, result.total, t)}
          </p>
        ) : null}
        <div className="actions">
          <button type="button" className="btn btn-primary" onClick={talkAboutIt}>
            {t("Talk about this result with LifeZoi Mind")}
          </button>
          {savedId ? (
            <span className="mind-tag validated" role="status">
              {t("Saved to My progress")}
            </span>
          ) : store.consent ? (
            <button type="button" className="btn btn-secondary" onClick={save}>
              {t("Save this result")}
            </button>
          ) : (
            <Link className="btn btn-secondary" href="/mind/progress">
              {t("Turn on saving to keep results")}
            </Link>
          )}
        </div>
        <p className="hint">{t("Your individual answers are never saved. If you save, only the total, the range, the date, and whether the safety question was answered are kept, in this browser.")}</p>
      </section>
      <section className="card stack">
        <ExerciseLinks ids={instrument.exercises} why={t("These exercises are commonly used to manage the symptoms this questionnaire asks about. They are optional and are not a treatment.")} />
        <ArticleLinks slugs={instrument.articles} />
        <p className="hint">{t("Sources:")}</p>
        <ul className="mind-refs" lang="en">
          {instrument.sources.map((source) => (
            <li key={source.url}>
              <a href={source.url} target="_blank" rel="noreferrer">
                {source.label}
              </a>
            </li>
          ))}
        </ul>
        <p className="hint" lang="en">
          {instrument.credit} {instrument.permission}
        </p>
      </section>
    </div>
  );
}

function ReflectionRunner({ reflection }: { reflection: Reflection }) {
  const t = useT();
  const store = useMindStore();
  const [answers, setAnswers] = useState<(number | null)[]>(() => reflection.statements.map(() => null));
  const [done, setDone] = useState(false);
  const [saved, setSaved] = useState(false);
  const summary = useMemo(() => summarizeReflection(reflection, answers), [reflection, answers]);

  return (
    <div className="stack-lg">
      <section className="card stack" aria-labelledby="reflection-title">
        <span className="mind-tag reflection">{t(REFLECTION_LABEL)}</span>
        <h2 id="reflection-title">{t(reflection.title)}</h2>
        <p>{t(reflection.intro)}</p>
        <p>{t("For each statement, choose how often it feels true for you lately.")}</p>
        {reflection.statements.map((statement, index) => (
          <fieldset key={statement} className="stack">
            <legend className="mind-question" style={{ fontSize: "1.2rem" }}>
              {index + 1}. {t(statement)}
            </legend>
            <div className="mind-chips">
              {REFLECTION_SCALE.map((label, value) => (
                <button
                  key={label}
                  type="button"
                  className="mind-option"
                  style={{ minWidth: "8rem" }}
                  aria-pressed={answers[index] === value}
                  onClick={() => {
                    const next = [...answers];
                    next[index] = value;
                    setAnswers(next);
                  }}
                >
                  {t(label)}
                </button>
              ))}
            </div>
          </fieldset>
        ))}
        <div className="actions">
          <button type="button" className="btn btn-primary" disabled={!summary.complete} onClick={() => setDone(true)}>
            {t("See my reflection")}
          </button>
        </div>
      </section>
      {done ? (
        <section className="card stack" aria-live="polite">
          <h2>{t("Your reflection")}</h2>
          <p className="mind-note">{t("This is not a score or a test result. It only gathers what stood out in your own answers, so you can decide what to explore.")}</p>
          {summary.worthAttention.length ? (
            <>
              <h3>{t("Worth paying attention to")}</h3>
              <ul className="mind-list">
                {summary.worthAttention.map((text) => (
                  <li key={text}>{t(text)}</li>
                ))}
              </ul>
            </>
          ) : (
            <p>{t("None of the statements stood out as a concern for you right now.")}</p>
          )}
          {summary.strengths.length ? (
            <>
              <h3>{t("Strengths you mentioned")}</h3>
              <ul className="mind-list">
                {summary.strengths.map((text) => (
                  <li key={text}>{t(text)}</li>
                ))}
              </ul>
            </>
          ) : null}
          <ExerciseLinks ids={reflection.exercises} />
          <ArticleLinks slugs={reflection.articles} />
          <div className="actions">
            <Link className="btn btn-secondary" href="/mind">
              {t("Talk it through with LifeZoi Mind")}
            </Link>
            {store.consent ? (
              saved ? (
                <span className="mind-tag validated" role="status">
                  {t("Saved")}
                </span>
              ) : (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    updateMindProgress((current) => ({
                      ...current,
                      reflections: [...current.reflections, { id: newId(), reflection: reflection.id, date: new Date().toISOString(), worthAttention: summary.worthAttention.length, strengths: summary.strengths.length }],
                    }));
                    setSaved(true);
                  }}
                >
                  {t("Note that I did this reflection")}
                </button>
              )
            ) : null}
          </div>
        </section>
      ) : null}
    </div>
  );
}

export function MindAssessment({ id }: { id: string }) {
  const instrument = instrumentById(id);
  if (instrument) return <InstrumentRunner instrument={instrument} />;
  const reflection = reflectionById(id);
  if (reflection) return <ReflectionRunner reflection={reflection} />;
  return <NotFound />;
}

function NotFound() {
  return <p>{useT()("This questionnaire was not found.")}</p>;
}
