"use client";

import "@/components/dashboard-assistant.css";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useLocale } from "@/components/locale-provider";
import { ReadAloud } from "@/components/voice/read-aloud";
import {
  GUIDE_BACK,
  GUIDE_BACK_TOPICS,
  GUIDE_CARE,
  GUIDE_CHOOSE_QUESTION,
  GUIDE_CHOOSE_TOPIC,
  GUIDE_EMERGENCY,
  GUIDE_EXAMPLE,
  GUIDE_LISTEN,
  GUIDE_MORE,
  GUIDE_NOTE,
  GUIDE_QUESTIONS_COUNT,
  GUIDE_SECTIONS,
  GUIDE_TITLE,
  GUIDE_TOPICS,
  GUIDE_TRY,
  GUIDE_WELCOME,
  PREPARED_SOURCE,
  answerBlocks,
  answersInTopic,
  topicById,
  type GuideAnswer,
  type GuideTopicId,
} from "@/lib/wellness-assistant/guide";

/**
 * A prepared question-and-answer library: choose a topic, choose a question,
 * read or listen to the answer, go back. Nothing is typed and nothing is sent.
 */
export function WellnessAssistantView() {
  const { t } = useLocale();
  const [topicId, setTopicId] = useState<GuideTopicId | null>(null);
  const [answerId, setAnswerId] = useState<string | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const firstRender = useRef(true);

  const topic = topicId ? topicById(topicId) : null;
  const answer = answerId ? PREPARED_SOURCE.answerFor(answerId) : null;
  const view = answer ? "answer" : topic ? "topic" : "home";

  // Each new screen starts at the top, with focus on its heading for keyboard and screen reader users.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const heading = headingRef.current;
    if (!heading) return;
    if (view === "home") window.scrollTo({ top: 0 });
    else heading.closest(".wa-panel")?.scrollIntoView({ block: "start" });
    heading.focus({ preventScroll: true });
  }, [view, answerId, topicId]);

  function openTopic(id: GuideTopicId) {
    setAnswerId(null);
    setTopicId(id);
  }

  function openAnswer(item: GuideAnswer) {
    setTopicId(item.topic);
    setAnswerId(item.id);
  }

  return (
    <div className="wa">
      {view === "home" ? (
        <header className="wa-hero">
          <span className="wa-hero-icon" aria-hidden="true">💬</span>
          <div className="wa-hero-text">
            <p className="wa-kicker">{t("Prepared educational information")}</p>
            <h1 ref={headingRef} tabIndex={-1}>{t(GUIDE_TITLE)}</h1>
            <p className="wa-welcome">{t(GUIDE_WELCOME)}</p>
          </div>
        </header>
      ) : (
        <p className="wa-crumb">
          <span aria-hidden="true">💬 </span>
          {t(GUIDE_TITLE)}
        </p>
      )}

      {view === "home" ? (
        <section className="wa-section" aria-labelledby="wa-topics-title">
          <h2 id="wa-topics-title">{t(GUIDE_CHOOSE_TOPIC)}</h2>
          <div className="wa-topics">
            {GUIDE_TOPICS.map((item) => (
              <button key={item.id} type="button" className={`wa-topic wa-topic-${item.id}`} onClick={() => openTopic(item.id)}>
                <span className="wa-topic-icon" aria-hidden="true">{item.icon}</span>
                <span className="wa-topic-label">{t(item.label)}</span>
                <span className="wa-topic-desc">{t(item.description)}</span>
                <span className="wa-topic-count">{t(GUIDE_QUESTIONS_COUNT, { count: answersInTopic(item.id).length })}</span>
              </button>
            ))}
          </div>
        </section>
      ) : null}

      {view === "topic" && topic ? (
        <section className={`wa-section wa-panel wa-topic-${topic.id}`} aria-labelledby="wa-topic-title">
          <button type="button" className="wa-back" onClick={() => setTopicId(null)}>
            <span aria-hidden="true">←</span> {t(GUIDE_BACK_TOPICS)}
          </button>
          <p className="wa-kicker">
            <span aria-hidden="true">{topic.icon} </span>
            {t(GUIDE_CHOOSE_QUESTION)}
          </p>
          <h1 id="wa-topic-title" ref={headingRef} tabIndex={-1}>{t(topic.label)}</h1>
          <QuestionList items={answersInTopic(topic.id)} onChoose={openAnswer} />
        </section>
      ) : null}

      {view === "answer" && answer && topic ? (
        <article className={`wa-section wa-panel wa-answer wa-topic-${topic.id}`} aria-labelledby="wa-answer-title">
          <button type="button" className="wa-back" onClick={() => setAnswerId(null)}>
            <span aria-hidden="true">←</span> {t(GUIDE_BACK)}
          </button>
          <p className="wa-kicker">
            <span aria-hidden="true">{topic.icon} </span>
            {t(topic.label)}
          </p>
          <h1 id="wa-answer-title" ref={headingRef} tabIndex={-1}>{t(answer.question)}</h1>
          <div className="wa-listen">
            <ReadAloud key={answer.id} blocks={answerBlocks(answer, t)} label={t(GUIDE_LISTEN)} />
          </div>
          <div className="wa-answer-body">
            {answer.intro.map((text) => (
              <p key={text}>{t(text)}</p>
            ))}
            <h2>{t(GUIDE_TRY)}</h2>
            <ul className="wa-tips">
              {answer.tips.map((text) => (
                <li key={text}>{t(text)}</li>
              ))}
            </ul>
            <div className="wa-example">
              <h2>{t(GUIDE_EXAMPLE)}</h2>
              <p>{t(answer.example)}</p>
            </div>
            <div className="wa-care" role="note">
              <h2>{t(GUIDE_CARE)}</h2>
              <p>{t(answer.care)}</p>
            </div>
          </div>
          {answer.links.length > 0 ? (
            <nav className="wa-links" aria-label={t(GUIDE_SECTIONS)}>
              {answer.links.map((link) => (
                <Link key={link.href} href={link.href}>
                  {t(link.label)}
                </Link>
              ))}
            </nav>
          ) : null}
          <button type="button" className="wa-back wa-back-bottom" onClick={() => setAnswerId(null)}>
            <span aria-hidden="true">←</span> {t(GUIDE_BACK)}
          </button>
          <section className="wa-more" aria-labelledby="wa-more-title">
            <h2 id="wa-more-title">{t(GUIDE_MORE)}</h2>
            <QuestionList items={answersInTopic(topic.id).filter((item) => item.id !== answer.id)} onChoose={openAnswer} />
          </section>
        </article>
      ) : null}

      <p className="wa-note" role="note">{t(GUIDE_NOTE)}</p>
      <p className="wa-emergency" role="note">{t(GUIDE_EMERGENCY)}</p>
    </div>
  );
}

function QuestionList({ items, onChoose }: { items: readonly GuideAnswer[]; onChoose: (item: GuideAnswer) => void }) {
  const t = useLocale().t;
  return (
    <ul className="wa-questions">
      {items.map((item) => (
        <li key={item.id}>
          <button type="button" onClick={() => onChoose(item)}>
            <span>{t(item.question)}</span>
            <span className="wa-chevron" aria-hidden="true">›</span>
          </button>
        </li>
      ))}
    </ul>
  );
}
