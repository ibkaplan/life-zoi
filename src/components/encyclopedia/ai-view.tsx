"use client";

import "@/components/encyclopedia/encyclopedia.css";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import { useLocale, useT } from "@/components/locale-provider";
import { ArticleBody } from "@/components/encyclopedia/article-body";
import { Illustration } from "@/components/encyclopedia/illustrations";
import { ArticleCard, EvidenceBadge, FavoriteToggle } from "@/components/encyclopedia/parts";
import { useArticles, useRecentArticles } from "@/components/encyclopedia/use-encyclopedia";
import { ReadAloud } from "@/components/voice/read-aloud";
import { useAccount } from "@/lib/account-store";
import type { Answer, AnswerLength } from "@/lib/encyclopedia/ai/answer";
import { findArticle } from "@/lib/encyclopedia/catalog";
import { msg } from "@/lib/i18n/translate";
import { guestStorageKey, userStorageKey } from "@/lib/owned-local";
import type { Article } from "@/lib/encyclopedia/types";

export const AI_INTRO = msg(
  "Hello! I am LifeZoi AI, your free personal health education assistant. Ask me anything about health, wellness, prevention, nutrition, longevity, medical research, or the human body.",
);
export const AI_DISCLAIMER = msg("LifeZoi AI provides educational health information and is not a substitute for professional medical diagnosis, treatment, or advice.");
export const AI_PRIVACY = msg(
  "Your privacy matters to us. Your conversations are not publicly visible or shared with other users. LifeZoi is committed to protecting your information. Please review our Privacy Policy to understand how your information is processed and protected.",
);

/** The suggested topics, each with the question it starts. */
export const AI_TOPICS: readonly { icon: string; label: string; question: string }[] = [
  { icon: "❤️", label: msg("Heart Health"), question: "How can I protect my heart and prevent heart disease?" },
  { icon: "🎗️", label: msg("Cancer Prevention"), question: "How can I lower my risk of cancer?" },
  { icon: "🧠", label: msg("Brain Health and Memory"), question: "How can I protect my memory as I age?" },
  { icon: "♀️", label: msg("Women's Health"), question: "What should women know about cancer screening and prevention?" },
  { icon: "♂️", label: msg("Men's Health"), question: "What should men know about heart disease and cancer screening?" },
  { icon: "🥗", label: msg("Nutrition and Vitamins"), question: "What does research say about healthy eating and vitamin supplements?" },
  { icon: "🌳", label: msg("Longevity and Healthy Aging"), question: "What helps people age in a healthy way?" },
  { icon: "🌙", label: msg("Sleep and Stress"), question: "How much sleep do adults need, and how can I manage stress?" },
  { icon: "🩺", label: msg("Blood Pressure"), question: "What is high blood pressure?" },
  { icon: "🩸", label: msg("Diabetes and Metabolism"), question: "What is insulin resistance?" },
  { icon: "🦠", label: msg("Gut Health"), question: "What is the gut microbiome?" },
  { icon: "⚖️", label: msg("Hormonal Health"), question: "What does insulin do in the body?" },
  { icon: "🛡️", label: msg("Immune System"), question: "How do vaccines and immunotherapy use the immune system?" },
  { icon: "🚶", label: msg("Physical Activity"), question: "How much physical activity do adults need for healthy aging?" },
  { icon: "🔬", label: msg("Latest Medical Discoveries"), question: "What are the latest medical discoveries like gene editing and mRNA?" },
];

type Turn =
  | { id: string; role: "user"; text: string }
  | { id: string; role: "assistant"; answer: Answer }
  | { id: string; role: "notice"; text: string };

type Conversation = { turns: Turn[]; length: AnswerLength };

const KEY = "lifezoi.lifezoi-ai.v1";
const EMPTY: Conversation = { turns: [], length: "short" };

/* The conversation lives in sessionStorage: this tab only, for this account, gone when the tab closes. */
const convoListeners = new Set<() => void>();
const convoCache = new Map<string, { raw: string | null; value: Conversation }>();
function readConvo(key: string): Conversation {
  let raw: string | null = null;
  try {
    raw = window.sessionStorage.getItem(key);
  } catch {
    raw = null;
  }
  const cached = convoCache.get(key);
  if (cached && cached.raw === raw) return cached.value;
  let value = EMPTY;
  try {
    const parsed = raw ? (JSON.parse(raw) as Conversation) : EMPTY;
    value = { turns: Array.isArray(parsed.turns) ? parsed.turns.slice(-40) : [], length: parsed.length === "detailed" ? "detailed" : "short" };
  } catch {
    value = EMPTY;
  }
  convoCache.set(key, { raw, value });
  return value;
}
function writeConvo(key: string, value: Conversation | null) {
  try {
    if (value === null || value.turns.length === 0) window.sessionStorage.removeItem(key);
    else window.sessionStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage can be refused; the conversation then lasts until the page is closed.
  }
  convoListeners.forEach((listener) => listener());
}

function useConversation(): [Conversation, (next: Conversation | null) => void] {
  const account = useAccount();
  const key = account.userId ? userStorageKey(KEY, account.userId) : guestStorageKey(KEY);
  const convo = useSyncExternalStore(
    (listener) => {
      convoListeners.add(listener);
      return () => convoListeners.delete(listener);
    },
    () => readConvo(key),
    () => EMPTY,
  );
  const save = useCallback((next: Conversation | null) => writeConvo(key, next), [key]);
  return [convo, save];
}

const newId = () => Math.random().toString(36).slice(2, 10);

function AnswerView({ answer, onOpen }: { answer: Answer; onOpen: (slug: string) => void }) {
  const t = useT();
  const articles = useArticles();
  const cards = answer.articles.map((card) => findArticle(card.slug, articles)).filter((item): item is Article => Boolean(item));
  const speech = answer.blocks.map((block) => (block.kind === "paragraph" ? t(block.text) : block.kind === "points" ? block.items.join(". ") : `${t(block.label)}: ${block.claim}`));
  return (
    <div className={`ency-ai-answer${answer.safety === "urgent" ? " ency-ai-urgent" : ""}`}>
      {answer.blocks.map((block, index) => {
        if (block.kind === "paragraph") {
          const shown = t(block.text);
          return (
            <p key={index} lang={shown === block.text ? "en" : undefined} className={index === 0 && answer.safety ? "ency-ai-safety" : undefined}>
              {shown}
            </p>
          );
        }
        if (block.kind === "points")
          return (
            <ul key={index} lang="en">
              {block.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          );
        return (
          <p key={index} className="ency-ai-evidence">
            <EvidenceBadge level={block.level} /> <span lang="en">{block.claim}</span>
          </p>
        );
      })}
      {answer.safety === "urgent" ? (
        <p className="hint">{t("LifeZoi AI does not answer health questions that may be emergencies. Please get help now.")}</p>
      ) : null}
      <ReadAloud text={speech} label={t("Listen to this answer")} compact />
      {cards.length > 0 ? (
        <section className="ency-ai-cards" aria-label={t("From the LifeZoi Health Encyclopedia")}>
          <h3>{t("From the LifeZoi Health Encyclopedia")}</h3>
          <div className="ency-grid">
            {cards.map((article) => (
              <ArticleCard key={article.slug} article={article} compact onOpen={onOpen} />
            ))}
          </div>
        </section>
      ) : null}
      {answer.noArticle && answer.safety !== "urgent" ? (
        <p className="hint">
          <Link href="/encyclopedia#ency-browse">{t("Browse all encyclopedia categories")}</Link>
        </p>
      ) : null}
    </div>
  );
}

function Reader({ slug, onBack }: { slug: string; onBack: () => void }) {
  const t = useT();
  const articles = useArticles();
  const article = findArticle(slug, articles);
  const { add } = useRecentArticles();
  const top = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (article) add(article.slug);
    top.current?.focus();
    window.scrollTo({ top: 0 });
  }, [article, add]);
  return (
    <div className="ency-ai-reader stack-lg">
      <button ref={top} type="button" className="btn btn-secondary ency-back" onClick={onBack}>
        ← {t("Back to the conversation")}
      </button>
      {article ? (
        <ArticleBody
          article={article}
          headingLevel={1}
          actions={
            <>
              <FavoriteToggle slug={article.slug} />
              <Link className="btn btn-ghost" href={`/encyclopedia/articles/${article.slug}`}>
                {t("Open in the Encyclopedia")}
              </Link>
            </>
          }
        />
      ) : (
        <p>{t("This article is not available.")}</p>
      )}
      <button type="button" className="btn btn-secondary ency-back" onClick={onBack}>
        ← {t("Back to the conversation")}
      </button>
    </div>
  );
}

function AiInner() {
  const t = useT();
  const { locale } = useLocale();
  const params = useSearchParams();
  const articles = useArticles();
  const [convo, save] = useConversation();
  const [draft, setDraft] = useState(() => params.get("q")?.slice(0, 600) ?? "");
  const [busy, setBusy] = useState(false);
  const [reading, setReading] = useState<string | null>(null);
  const [focus, setFocus] = useState<string | null>(() => params.get("article"));
  const scrollBack = useRef(0);
  const endRef = useRef<HTMLDivElement>(null);
  const inputId = useId();
  const focusArticle = focus ? findArticle(focus, articles) : undefined;

  async function ask(question: string) {
    const text = question.trim().slice(0, 600);
    if (!text || busy) return;
    const userTurn: Turn = { id: newId(), role: "user", text };
    const turns = [...convo.turns, userTurn];
    save({ ...convo, turns });
    setDraft("");
    setBusy(true);
    // Only the words of the conversation are sent: no account details, assessment answers, or lab values.
    const history = turns
      .filter((turn) => turn.role !== "notice")
      .slice(-8)
      .map((turn) => (turn.role === "user" ? { role: "user", text: turn.text } : { role: "assistant", text: turn.role === "assistant" ? turn.answer.topic : "" }));
    try {
      const response = await fetch("/api/lifezoi-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ turns: history, length: convo.length, focus: focusArticle?.slug }),
      });
      const body = (await response.json().catch(() => ({}))) as { answer?: Answer; error?: string };
      const next: Turn = body.answer
        ? { id: newId(), role: "assistant", answer: body.answer }
        : { id: newId(), role: "notice", text: body.error ?? msg("Something went wrong. Please try again.") };
      save({ ...convo, turns: [...turns, next] });
    } catch {
      save({ ...convo, turns: [...turns, { id: newId(), role: "notice", text: msg("LifeZoi AI could not be reached. Check your connection and try again.") }] });
    } finally {
      setBusy(false);
      requestAnimationFrame(() => endRef.current?.scrollIntoView({ block: "end", behavior: "smooth" }));
    }
  }

  function open(slug: string) {
    scrollBack.current = window.scrollY;
    setReading(slug);
  }
  function back() {
    setReading(null);
    requestAnimationFrame(() => window.scrollTo({ top: scrollBack.current }));
  }

  if (reading) return <Reader slug={reading} onBack={back} />;

  return (
    <div className="ency ency-ai stack-lg">
      <header className="ency-ai-hero">
        <Illustration name="ai" className="ency-hero-illustration" />
        <div>
          <p className="ency-kicker">{t("Free health education")}</p>
          <h1>{t("LifeZoi AI — Your Free Personal Health Assistant")}</h1>
          <p className="ency-ai-intro">{t(AI_INTRO)}</p>
        </div>
      </header>

      <p className="ency-ai-mode" role="note">
        <strong>{t("Library mode")}</strong> {t("Answers come only from LifeZoi Health Encyclopedia articles, with their sources. No outside AI service is used, so LifeZoi AI can only answer topics the encyclopedia covers. Answers are in English for now.")}
      </p>

      {focusArticle ? (
        <p className="ency-ai-focus">
          {t("Asking about:")} <strong lang="en">{focusArticle.title}</strong>{" "}
          <button type="button" className="btn btn-ghost" onClick={() => setFocus(null)}>
            {t("Ask about anything")}
          </button>
        </p>
      ) : null}

      <section className="ency-ai-thread" aria-label={t("Conversation")} aria-live="polite">
        {convo.turns.map((turn) =>
          turn.role === "user" ? (
            <div key={turn.id} className="ency-ai-msg ency-ai-user">
              <p className="sr-only">{t("You asked:")}</p>
              <p>{turn.text}</p>
            </div>
          ) : turn.role === "assistant" ? (
            <div key={turn.id} className="ency-ai-msg ency-ai-bot">
              <p className="ency-ai-who">{t("LifeZoi AI")}</p>
              <AnswerView answer={turn.answer} onOpen={open} />
            </div>
          ) : (
            <div key={turn.id} className="ency-ai-msg ency-ai-notice" role="status">
              <p>{t(turn.text)}</p>
            </div>
          ),
        )}
        {busy ? (
          <p className="ency-ai-msg ency-ai-bot hint" role="status">
            {t("LifeZoi AI is looking through the encyclopedia…")}
          </p>
        ) : null}
        <div ref={endRef} />
      </section>

      <form
        className="ency-ai-form"
        onSubmit={(event) => {
          event.preventDefault();
          void ask(draft);
        }}
      >
        <label htmlFor={inputId} className="ency-ai-label">
          {convo.turns.length > 0 ? t("Ask a follow-up question") : t("Ask LifeZoi a health question")}
        </label>
        <textarea
          id={inputId}
          value={draft}
          maxLength={600}
          rows={3}
          placeholder={t("For example: How can I protect my heart?")}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              void ask(draft);
            }
          }}
        />
        <div className="ency-ai-form-row">
          <div className="ency-seg" role="radiogroup" aria-label={t("Answer length")}>
            <button type="button" role="radio" aria-checked={convo.length === "short"} onClick={() => save({ ...convo, length: "short" })}>
              {t("Short answer")}
            </button>
            <button type="button" role="radio" aria-checked={convo.length === "detailed"} onClick={() => save({ ...convo, length: "detailed" })}>
              {t("Detailed answer")}
            </button>
          </div>
          <button className="btn btn-primary ency-ai-ask" type="submit" disabled={busy || !draft.trim()}>
            {t("Ask LifeZoi")}
          </button>
        </div>
        {locale !== "en" ? <p className="hint">{t("Questions work best in English for now, because the articles are in English.")}</p> : null}
      </form>

      {convo.turns.length > 0 ? (
        <div className="ency-ai-controls">
          <button type="button" className="btn btn-secondary" onClick={() => save(null)}>
            {t("New conversation")}
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => save(null)}>
            {t("Delete this conversation")}
          </button>
        </div>
      ) : null}

      <section aria-labelledby="ency-ai-topics">
        <h2 id="ency-ai-topics">{t("Suggested health topics")}</h2>
        <div className="ency-ai-topics">
          {AI_TOPICS.map((topic) => (
            <button key={topic.label} type="button" className="ency-ai-topic" disabled={busy} onClick={() => void ask(topic.question)}>
              <span aria-hidden="true">{topic.icon}</span>
              {t(topic.label)}
            </button>
          ))}
        </div>
      </section>

      <section className="ency-ai-privacy card stack" aria-labelledby="ency-ai-privacy">
        <h2 id="ency-ai-privacy">{t("Privacy")}</h2>
        <p>{t(AI_PRIVACY)}</p>
        <details>
          <summary>{t("How LifeZoi AI handles your questions")}</summary>
          <ul>
            <li>{t("Your question is sent over an encrypted connection to the LifeZoi server, which looks it up in the encyclopedia and sends back an answer.")}</li>
            <li>{t("It is not sent to any outside AI company, and LifeZoi does not store it in a database or use it to train AI.")}</li>
            <li>{t("Our hosting provider may keep short technical request logs, as most websites do.")}</li>
            <li>{t("The conversation is kept only in this browser tab, for your account. It disappears when you close the tab, or right away when you choose Delete this conversation.")}</li>
            <li>{t("Do not type names, addresses, or other details that identify you. They are not needed for an answer.")}</li>
          </ul>
          <p>
            <Link href="/privacy">{t("Privacy Policy")}</Link>
          </p>
        </details>
      </section>

      <p className="ency-disclaimer">{t(AI_DISCLAIMER)}</p>
      <p className="hint">
        <Link href="/encyclopedia">{t("Read the Health Encyclopedia without AI")}</Link>
      </p>
    </div>
  );
}

export function LifeZoiAiView() {
  return (
    <Suspense fallback={null}>
      <AiInner />
    </Suspense>
  );
}
