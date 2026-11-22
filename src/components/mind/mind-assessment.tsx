"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { ArticleLinks, ExerciseLinks, formatDate, SafetyActions, useMindStore } from "@/components/mind/shared";
import { compareResults, instrumentById, ITEM9_MESSAGE, PHQ9_SAFETY_ITEM, scoreInstrument, type Instrument, type ScoreResult } from "@/lib/mind/assessments";
import { initialConversation } from "@/lib/mind/conversation";
import { readConversation, writeConversation } from "@/lib/mind/conversation-store";
import { daysUntilRepeat, newId, resultsFor } from "@/lib/mind/progress";
import { reflectionById, REFLECTION_LABEL, REFLECTION_SCALE, summarizeReflection, type Reflection } from "@/lib/mind/reflections";
import { updateMindProgress } from "@/lib/mind/store";

function Item9Panel() {
  return (
    <section className="mind-safety" role="alert" aria-labelledby="item9-title">
      <h2 id="item9-title">{ITEM9_MESSAGE.title}</h2>
      {ITEM9_MESSAGE.paragraphs.map((text) => (
        <p key={text}>{text}</p>
      ))}
      <SafetyActions />
    </section>
  );
}

function InstrumentRunner({ instrument }: { instrument: Instrument }) {
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
          <span className="mind-tag validated">Validated questionnaire</span>
          <h2>About the {instrument.shortName}</h2>
          <p>{instrument.purpose}</p>
          <p>
            It has {instrument.items.length} questions about <strong>{instrument.timeFrame}</strong>, and takes about {instrument.minutes} minutes. Answer privately and honestly. There are no right or wrong answers, and you can stop at any time.
          </p>
          <div className="mind-grid">
            <div className="stack">
              <h3>What it can tell you</h3>
              <ul className="mind-list">
                {instrument.canTell.map((text) => (
                  <li key={text}>{text}</li>
                ))}
              </ul>
            </div>
            <div className="stack">
              <h3>What it cannot tell you</h3>
              <ul className="mind-list">
                {instrument.cannotTell.map((text) => (
                  <li key={text}>{text}</li>
                ))}
              </ul>
            </div>
          </div>
          {repeatIn > 0 ? (
            <p className="mind-note">
              You saved a result {formatDate(previous[0].date)}. Because this questionnaire asks about two weeks, it is most useful to repeat it in about {repeatIn} day{repeatIn === 1 ? "" : "s"}. You can still take it now.
            </p>
          ) : null}
          <div className="actions">
            <button type="button" className="btn btn-primary" onClick={() => setStarted(true)}>
              Begin
            </button>
            <Link className="btn btn-ghost" href="/mind/understand">
              Back to all questionnaires
            </Link>
          </div>
          <p className="hint">
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
          Question {Math.min(index + 1, total)} of {total}
        </p>
        <div className="mind-progressbar" aria-hidden="true">
          <span style={{ width: `${(index / total) * 100}%` }} />
        </div>
        <p>{onDifficulty ? "One last question." : instrument.stem}</p>
        <p id="question-title" className="mind-question">
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
                I have read this. Continue the questionnaire
              </button>
            </div>
          </>
        ) : (
          <div className="mind-options" role="group" aria-labelledby="question-title">
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
              Back
            </button>
          ) : null}
          {onDifficulty ? (
            <button type="button" className="btn btn-ghost" onClick={() => setFinished(true)}>
              Skip this question
            </button>
          ) : null}
        </div>
      </section>
    );
  }

  if (!result) {
    return (
      <section className="card stack">
        <p>Some questions were not answered, so no score can be worked out. The scoring only works when every question is answered.</p>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            setFinished(false);
            setIndex(answers.findIndex((value) => value === null));
          }}
        >
          Go to the unanswered question
        </button>
      </section>
    );
  }

  return (
    <div className="stack-lg">
      {result.item9Positive ? <Item9Panel /> : null}
      <section className="card stack" aria-labelledby="result-title">
        <h2 id="result-title">Your {instrument.shortName} result</h2>
        <div className="mind-score">
          <span className="mind-score-number">
            {result.total} <span className="hint">out of {result.maxScore}</span>
          </span>
          <span className="mind-tag">{result.band.label} range</span>
        </div>
        <p>{result.band.meaning}</p>
        <div className="mind-scale" aria-label="Score ranges">
          {instrument.bands.map((band) => (
            <div key={band.label} className="mind-scale-row" data-current={band.label === result.band.label}>
              <span>
                {band.min}–{band.max}
              </span>
              <span>
                {band.label}
                {band.label === result.band.label ? " (your result)" : ""}
              </span>
            </div>
          ))}
        </div>
        {result.difficulty ? <p>You said these problems made daily life: {result.difficulty.toLowerCase()}.</p> : null}
        <p className="mind-note">
          <strong>This is not a diagnosis.</strong> A score shows how often you were bothered by these symptoms over the last two weeks. It cannot tell you whether you have a condition or what is causing how you feel. {result.suggestFollowUp ? "At this level, the questionnaire's developers suggest talking with a doctor or mental health professional." : "If you are worried about how you feel, a doctor or mental health professional can help, whatever the score."}
        </p>
        <h3>What this result cannot tell you</h3>
        <ul className="mind-list">
          {instrument.cannotTell.map((text) => (
            <li key={text}>{text}</li>
          ))}
        </ul>
        {previous[0] ? (
          <p>
            <strong>Compared with {formatDate(previous[0].date)} ({previous[0].total}):</strong> {compareResults(instrument, previous[0].total, result.total)}
          </p>
        ) : null}
        <div className="actions">
          <button type="button" className="btn btn-primary" onClick={talkAboutIt}>
            Talk about this result with LifeZoi Mind
          </button>
          {savedId ? (
            <span className="mind-tag validated" role="status">
              Saved to My progress
            </span>
          ) : store.consent ? (
            <button type="button" className="btn btn-secondary" onClick={save}>
              Save this result
            </button>
          ) : (
            <Link className="btn btn-secondary" href="/mind/progress">
              Turn on saving to keep results
            </Link>
          )}
        </div>
        <p className="hint">Your individual answers are never saved. If you save, only the total, the range, the date, and whether the safety question was answered are kept, in this browser.</p>
      </section>
      <section className="card stack">
        <ExerciseLinks ids={instrument.exercises} why="These exercises are commonly used to manage the symptoms this questionnaire asks about. They are optional and are not a treatment." />
        <ArticleLinks slugs={instrument.articles} />
        <p className="hint">Sources:</p>
        <ul className="mind-refs">
          {instrument.sources.map((source) => (
            <li key={source.url}>
              <a href={source.url} target="_blank" rel="noreferrer">
                {source.label}
              </a>
            </li>
          ))}
        </ul>
        <p className="hint">
          {instrument.credit} {instrument.permission}
        </p>
      </section>
    </div>
  );
}

function ReflectionRunner({ reflection }: { reflection: Reflection }) {
  const store = useMindStore();
  const [answers, setAnswers] = useState<(number | null)[]>(() => reflection.statements.map(() => null));
  const [done, setDone] = useState(false);
  const [saved, setSaved] = useState(false);
  const summary = useMemo(() => summarizeReflection(reflection, answers), [reflection, answers]);

  return (
    <div className="stack-lg">
      <section className="card stack" aria-labelledby="reflection-title">
        <span className="mind-tag reflection">{REFLECTION_LABEL}</span>
        <h2 id="reflection-title">{reflection.title}</h2>
        <p>{reflection.intro}</p>
        <p>For each statement, choose how often it feels true for you lately.</p>
        {reflection.statements.map((statement, index) => (
          <fieldset key={statement} className="stack">
            <legend className="mind-question" style={{ fontSize: "1.2rem" }}>
              {index + 1}. {statement}
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
                  {label}
                </button>
              ))}
            </div>
          </fieldset>
        ))}
        <div className="actions">
          <button type="button" className="btn btn-primary" disabled={!summary.complete} onClick={() => setDone(true)}>
            See my reflection
          </button>
        </div>
      </section>
      {done ? (
        <section className="card stack" aria-live="polite">
          <h2>Your reflection</h2>
          <p className="mind-note">This is not a score or a test result. It only gathers what stood out in your own answers, so you can decide what to explore.</p>
          {summary.worthAttention.length ? (
            <>
              <h3>Worth paying attention to</h3>
              <ul className="mind-list">
                {summary.worthAttention.map((text) => (
                  <li key={text}>{text}</li>
                ))}
              </ul>
            </>
          ) : (
            <p>None of the statements stood out as a concern for you right now.</p>
          )}
          {summary.strengths.length ? (
            <>
              <h3>Strengths you mentioned</h3>
              <ul className="mind-list">
                {summary.strengths.map((text) => (
                  <li key={text}>{text}</li>
                ))}
              </ul>
            </>
          ) : null}
          <ExerciseLinks ids={reflection.exercises} />
          <ArticleLinks slugs={reflection.articles} />
          <div className="actions">
            <Link className="btn btn-secondary" href="/mind">
              Talk it through with LifeZoi Mind
            </Link>
            {store.consent ? (
              saved ? (
                <span className="mind-tag validated" role="status">
                  Saved
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
                  Note that I did this reflection
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
  return <p>This questionnaire was not found.</p>;
}
