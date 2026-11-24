"use client";

import "@/components/encyclopedia/encyclopedia.css";
import "@/components/encyclopedia/fact-quiz.css";
import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import { useLocale } from "@/components/locale-provider";
import { Illustration } from "@/components/encyclopedia/illustrations";
import { FactEvidenceBadge } from "@/components/encyclopedia/facts-view";
import { useArticles } from "@/components/encyclopedia/use-encyclopedia";
import { findArticle } from "@/lib/encyclopedia/catalog";
import { buildRound, FACT_QUESTIONS, questionFact, questionFor, quizCategories, ROUND_SIZE, scoreMessage, type RoundQuestion } from "@/lib/encyclopedia/fact-quiz";
import { factCategory } from "@/lib/encyclopedia/facts";

type Answer = { question: RoundQuestion; picked: number; correct: boolean };

const noSubscribe = () => () => {};

/** `?fact=<id>` or `?category=<slug>` from the address, read in the browser only. */
function useLinked(): string {
  return useSyncExternalStore(
    noSubscribe,
    () => {
      const params = new URLSearchParams(window.location.search);
      const fact = params.get("fact");
      if (fact && questionFor(fact)) return `fact:${fact}`;
      const category = params.get("category");
      if (category && quizCategories().includes(category as never)) return `category:${category}`;
      return "";
    },
    () => "",
  );
}

export function FactQuizView() {
  const { t, locale } = useLocale();
  const linked = useLinked();
  const linkedFact = linked.startsWith("fact:") ? linked.slice(5) : null;
  const linkedCategory = linked.startsWith("category:") ? linked.slice(9) : null;
  const [picked, setPicked] = useState<string | null | undefined>(undefined);
  const category = picked === undefined ? linkedCategory : picked;
  const [round, setRound] = useState<RoundQuestion[] | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [choice, setChoice] = useState<number | null>(null);

  function start(firstFact: string | null = null) {
    setRound(buildRound({ category: firstFact ? null : category, firstFact }));
    setAnswers([]);
    setChoice(null);
  }

  const englishNote =
    locale === "en" ? null : <p className="ency-lang-note" role="note">{t("Questions are translated. The fact pages and sources they link to are in English for now.")}</p>;

  if (!round) {
    const linkedQuestion = linkedFact ? questionFor(linkedFact) : undefined;
    const count = FACT_QUESTIONS.filter((question) => !category || questionFact(question).category === category).length;
    return (
      <div className="ency stack-lg">
        <Crumbs />
        <header className="ency-hero ency-hero-small">
          <div className="ency-hero-text">
            <p className="ency-kicker">{t("Did You Know?")}</p>
            <h1>{t("Health Facts Quiz")}</h1>
            <p>{t("Short questions built on the Did You Know? facts. After each answer you see the fact behind it, its source, and a link to read more.")}</p>
          </div>
          <Illustration name="magnifier" className="ency-hero-illustration" />
        </header>
        {englishNote}
        {linkedQuestion ? (
          <section className="ency-block card stack">
            <h2>{t("Test yourself on this fact")}</h2>
            <p lang="en">{questionFact(linkedQuestion).headline}</p>
            <div className="fact-actions">
              <button type="button" className="btn btn-primary" onClick={() => start(linkedQuestion.fact)}>
                {t("Start with this fact")}
              </button>
            </div>
          </section>
        ) : null}
        <section className="ency-block card stack" aria-labelledby="fq-topic">
          <h2 id="fq-topic">{t("Choose a topic")}</h2>
          <div className="ency-chips" role="group" aria-label={t("Filter by category")}>
            <button type="button" className="ency-chip" aria-pressed={!category} onClick={() => setPicked(null)}>
              {t("All categories")}
            </button>
            {quizCategories().map((slug) => {
              const item = factCategory(slug);
              return (
                <button key={slug} type="button" className="ency-chip" aria-pressed={category === slug} onClick={() => setPicked(slug)}>
                  {item ? t(item.title) : slug}
                </button>
              );
            })}
          </div>
          <p className="hint">{t("{count} questions in this round", { count: Math.min(count, ROUND_SIZE) })}</p>
          <div className="fact-actions">
            <button type="button" className="btn btn-primary" onClick={() => start()}>
              {t("Start the quiz")}
            </button>
            <Link className="fact-see-all" href="/encyclopedia/facts">
              {t("See All Facts")}
            </Link>
          </div>
        </section>
        <p className="hint">{t("This quiz is for learning and fun. It is not a medical test, and your answers are not saved.")}</p>
      </div>
    );
  }

  const done = answers.length === round.length;
  const score = answers.filter((answer) => answer.correct).length;

  if (done) {
    return (
      <div className="ency stack-lg">
        <Crumbs />
        <section className="ency-block card stack fq-result" aria-live="polite">
          <p className="ency-kicker">{t("Health Facts Quiz")}</p>
          <h1>{t("You scored {score} of {total}", { score, total: round.length })}</h1>
          <p>{t(scoreMessage(score, round.length))}</p>
          <div className="fact-actions">
            <button type="button" className="btn btn-primary" onClick={() => start()}>
              {t("Play another round")}
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => setRound(null)}>
              {t("Choose a topic")}
            </button>
            <Link className="btn btn-secondary" href="/encyclopedia/facts">
              {t("See All Facts")}
            </Link>
          </div>
        </section>
        <section className="ency-block stack">
          <h2>{t("Your answers")}</h2>
          <ol className="fq-review">
            {answers.map((answer) => {
              const fact = questionFact(answer.question);
              return (
                <li key={answer.question.fact} className={answer.correct ? "fq-right" : "fq-wrong"}>
                  <span className="fq-mark" aria-hidden="true">
                    {answer.correct ? "✓" : "✗"}
                  </span>
                  <span className="fq-review-text">
                    <strong>{t(answer.question.question)}</strong>
                    <span>
                      <span className="sr-only">{answer.correct ? t("Correct") : t("Not quite")}. </span>
                      {t("Answer: {answer}", { answer: t(answer.question.choices[0]) })}
                    </span>
                    <Link href={`/encyclopedia/facts/${fact.id}`}>{t("Read the full fact")}</Link>
                  </span>
                </li>
              );
            })}
          </ol>
        </section>
        {englishNote}
      </div>
    );
  }

  const current = round[answers.length];
  return (
    <div className="ency stack-lg">
      <Crumbs />
      <QuestionCard
        key={current.fact}
        question={current}
        number={answers.length + 1}
        total={round.length}
        score={score}
        choice={choice}
        onChoose={setChoice}
        onNext={() => {
          if (choice === null) return;
          setAnswers((list) => [...list, { question: current, picked: choice, correct: choice === 0 }]);
          setChoice(null);
        }}
      />
      {englishNote}
      <button type="button" className="fq-quit" onClick={() => setRound(null)}>
        {t("Stop this round")}
      </button>
    </div>
  );
}

function QuestionCard({
  question,
  number,
  total,
  score,
  choice,
  onChoose,
  onNext,
}: {
  question: RoundQuestion;
  number: number;
  total: number;
  score: number;
  choice: number | null;
  onChoose: (index: number) => void;
  onNext: () => void;
}) {
  const { t } = useLocale();
  const articles = useArticles();
  const fact = questionFact(question);
  const category = factCategory(fact.category);
  const article = fact.articles?.[0] ? findArticle(fact.articles[0], articles) : undefined;
  const source = fact.sources[0];
  const answered = choice !== null;
  const right = choice === 0;
  return (
    <section className={`ency-block card stack fq-card fact-cat-${fact.category}`} aria-labelledby="fq-question">
      <div className="fq-top">
        <span>{t("Question {number} of {total}", { number, total })}</span>
        <span>{t("Score: {score}", { score: score + (answered && right ? 1 : 0) })}</span>
      </div>
      <div className="fq-progress" aria-hidden="true">
        <span style={{ width: `${((number - (answered ? 0 : 1)) / total) * 100}%` }} />
      </div>
      {category ? <p className="ency-kicker">{t(category.title)}</p> : null}
      <h1 id="fq-question" className="fq-question">
        {t(question.question)}
      </h1>
      <div className="fq-choices" role="group" aria-label={t("Choices")}>
        {question.order.map((index) => {
          const state = !answered ? "" : index === 0 ? "right" : index === choice ? "wrong" : "other";
          return (
            <button
              key={index}
              type="button"
              className="fq-choice"
              data-state={state || undefined}
              aria-pressed={choice === index}
              disabled={answered}
              onClick={() => onChoose(index)}
            >
              <span>{t(question.choices[index])}</span>
              {state === "right" ? <span className="fq-tag">{t("Correct answer")}</span> : null}
              {state === "wrong" ? <span className="fq-tag">{t("Your answer")}</span> : null}
            </button>
          );
        })}
      </div>
      {answered ? (
        <div className={`fq-explain ${right ? "fq-explain-right" : "fq-explain-wrong"}`} role="status">
          <p className="fq-verdict">{right ? t("Correct!") : t("Not quite.")}</p>
          <p>{t(question.explanation)}</p>
          <p>
            <FactEvidenceBadge level={fact.evidence} />
          </p>
          {source ? (
            <p className="hint">
              {t("Source")}:{" "}
              <a href={source.url} target="_blank" rel="noopener noreferrer" lang="en">
                {source.title}
              </a>{" "}
              <span lang="en">({source.publisher})</span>
            </p>
          ) : null}
          <div className="fact-actions">
            <Link className="btn btn-secondary" href={`/encyclopedia/facts/${fact.id}`}>
              {t("Read the full fact")}
            </Link>
            {article ? (
              <Link className="btn btn-secondary" href={`/encyclopedia/articles/${article.slug}`}>
                {t("Read the full article")}
              </Link>
            ) : null}
          </div>
          <button type="button" className="btn btn-primary fq-next" onClick={onNext}>
            {number === total ? t("See my score") : t("Next question")}
          </button>
        </div>
      ) : null}
    </section>
  );
}

function Crumbs() {
  const { t } = useLocale();
  return (
    <nav className="ency-crumbs" aria-label={t("Breadcrumb")}>
      <Link href="/brain-quiz">{t("Brain & Habit Quiz")}</Link>
      <span aria-hidden="true"> / </span>
      <Link href="/encyclopedia/facts">{t("Did You Know?")}</Link>
      <span aria-hidden="true"> / </span>
      <span>{t("Health Facts Quiz")}</span>
    </nav>
  );
}
