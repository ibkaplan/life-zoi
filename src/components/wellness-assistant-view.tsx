"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import { useLocale } from "@/components/locale-provider";
import { WellnessLivePanel } from "@/components/wellness-live-panel";
import { ReadAloud } from "@/components/voice/read-aloud";
import {
  FEELING_HEADING,
  LIMITED_SET_MESSAGE,
  PREPARED_ANSWERS_REMAIN,
  RECOGNITION_UNSUPPORTED_MESSAGE,
  VOICE_PRIVACY_NOTE,
  WELLNESS_ASSISTANT_EMERGENCY,
  WELLNESS_ASSISTANT_KIND,
  WELLNESS_ASSISTANT_NOTE,
  WELLNESS_ASSISTANT_SUBTITLE,
  WELLNESS_ASSISTANT_TITLE,
  WELLNESS_ASSISTANT_WELCOME,
} from "@/lib/wellness-assistant/copy";
import {
  FEELINGS,
  FEELING_SUPPORT,
  WELLNESS_CATEGORIES,
  WELLNESS_QUESTIONS,
  categoryLabel,
  feelingById,
  popularQuestions,
  questionById,
  questionsInCategory,
  relatedQuestions,
  type WellnessCategoryId,
  type WellnessQuestion,
} from "@/lib/wellness-assistant/library";
import {
  localQuestionText,
  matchPreparedQuestions,
  searchPreparedQuestions,
  type PreparedMatch,
} from "@/lib/wellness-assistant/match";
import {
  getRecentIds,
  getRecentServerIds,
  rememberRecentId,
  subscribeRecent,
} from "@/lib/wellness-assistant/recent";
import {
  recognitionConstructor,
  recognitionFailureMessage,
  recognitionSupportServerSnapshot,
  recognitionSupportSnapshot,
  SPEECH_LANG,
  subscribeEnglishVoices,
  transcriptFromResults,
  voicesForLanguage,
  type RecognitionHandle,
} from "@/lib/wellness-assistant/speech";

const ALLOWED_IDS = WELLNESS_QUESTIONS.map((item) => item.id);

function openQuestion(id: string, select: (id: string) => void) {
  rememberRecentId(id, ALLOWED_IDS);
  select(id);
}

export function WellnessAssistantView() {
  const { t, locale } = useLocale();
  const local = locale === "en" ? undefined : localQuestionText(t);
  const searchId = useId();
  const transcriptId = useId();
  const recent = useSyncExternalStore(subscribeRecent, () => getRecentIds(ALLOWED_IDS), getRecentServerIds);
  const [category, setCategory] = useState<"all" | WellnessCategoryId>("all");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [feelingId, setFeelingId] = useState<string | null>(null);
  const recognitionReady = useSyncExternalStore(
    subscribeEnglishVoices,
    recognitionSupportSnapshot,
    recognitionSupportServerSnapshot,
  );
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [voiceNote, setVoiceNote] = useState("");
  const [voiceMatch, setVoiceMatch] = useState<PreparedMatch | null>(null);
  const recognitionRef = useRef<RecognitionHandle | null>(null);

  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
      recognitionRef.current = null;
    };
  }, []);

  const selected = selectedId ? questionById(selectedId) : null;
  const filtered = questionsInCategory(category).filter((item) => {
    if (!query.trim()) return true;
    return searchPreparedQuestions(query, local).some((found) => found.id === item.id);
  });
  const recentQuestions = recent.flatMap((id) => {
    const item = questionById(id);
    return item ? [item] : [];
  });

  function choose(id: string) {
    openQuestion(id, setSelectedId);
    setVoiceMatch(null);
  }

  const activeFeeling = feelingId ? feelingById(feelingId) : null;

  function startListening() {
    const Ctor = recognitionConstructor();
    if (!Ctor) {
      setVoiceNote(RECOGNITION_UNSUPPORTED_MESSAGE);
      return;
    }
    recognitionRef.current?.abort();
    const recognition = new Ctor();
    recognition.lang = SPEECH_LANG[locale] ?? "en-US";
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.onresult = (event) => {
      setTranscript(transcriptFromResults(event));
    };
    recognition.onerror = (event) => {
      const message = recognitionFailureMessage(event.error ?? "");
      if (message) setVoiceNote(message);
      setListening(false);
    };
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
    setVoiceNote("");
    setVoiceMatch(null);
    setListening(true);
    try {
      recognition.start();
    } catch {
      setListening(false);
      setVoiceNote(RECOGNITION_UNSUPPORTED_MESSAGE);
    }
  }

  function stopListening() {
    recognitionRef.current?.stop();
    setListening(false);
  }

  function confirmTranscript() {
    const result = matchPreparedQuestions(transcript, local);
    setVoiceMatch(result);
    if (result.selectedId) choose(result.selectedId);
  }

  return (
    <div className="wellness-assistant">
      <header className="wellness-intro">
        <p className="wellness-kicker">{t("Prepared educational information")}</p>
        <h1>{t(WELLNESS_ASSISTANT_TITLE)}</h1>
        <p className="wellness-subtitle">{t(WELLNESS_ASSISTANT_SUBTITLE)}</p>
        <p className="wellness-welcome">{t(WELLNESS_ASSISTANT_WELCOME)}</p>
        <p className="wellness-note" role="note">
          {t(WELLNESS_ASSISTANT_NOTE)}
        </p>
      </header>

      <WellnessLivePanel onOpenQuestion={choose} />

      <div className="wellness-filters" role="group" aria-label={t("Question categories")}>
        <button type="button" aria-pressed={category === "all" && !selected} onClick={() => { setCategory("all"); setSelectedId(null); setFeelingId(null); }}>
          {t("All questions")}
        </button>
        {WELLNESS_CATEGORIES.map((item) => (
          <button
            key={item.id}
            type="button"
            aria-pressed={category === item.id && !selected}
            onClick={() => {
              setCategory(item.id);
              setSelectedId(null);
              setFeelingId(null);
              setQuery("");
            }}
          >
            {t(item.label)}
          </button>
        ))}
      </div>

      <section className="wellness-feelings-block" aria-labelledby="feeling-heading">
        <h2 id="feeling-heading">{t(FEELING_HEADING)}</h2>
        <div className="wellness-feelings">
          {FEELINGS.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-pressed={feelingId === item.id}
              onClick={() => {
                setFeelingId(item.id);
                setSelectedId(null);
                setQuery("");
              }}
            >
              {t(item.label)}
            </button>
          ))}
        </div>
        {activeFeeling ? (
          <div className="wellness-feeling-result">
            <p>{t(FEELING_SUPPORT)}</p>
            {activeFeeling.note ? <p>{t(activeFeeling.note)}</p> : null}
            {activeFeeling.prompts ? (
              <div className="wellness-questions">
                {activeFeeling.prompts.map((prompt) => (
                  <button key={prompt.label} type="button" onClick={() => choose(prompt.questionId)}>
                    {t(prompt.label)}
                  </button>
                ))}
              </div>
            ) : (
              <QuestionButtons
                questions={activeFeeling.questionIds.flatMap((id) => {
                  const item = questionById(id);
                  return item ? [item] : [];
                })}
                onChoose={choose}
              />
            )}
          </div>
        ) : null}
      </section>

      {selected ? (
        <AnswerPanel question={selected} onBack={() => setSelectedId(null)} onChoose={choose} />
      ) : (
        <>
          <form
            className="wellness-search"
            role="search"
            onSubmit={(event) => {
              event.preventDefault();
              const found = filtered;
              if (found.length === 1) choose(found[0].id);
            }}
          >
            <label htmlFor={searchId}>{t("Search questions")}</label>
            <input
              id={searchId}
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t("Search prepared questions")}
              autoComplete="off"
            />
          </form>

          <section className="wellness-voice" aria-labelledby="ask-by-voice-title">
            <h2 id="ask-by-voice-title">{t("Ask by voice")}</h2>
            <p>{t(VOICE_PRIVACY_NOTE)}</p>
            {recognitionReady === false ? <p>{t(RECOGNITION_UNSUPPORTED_MESSAGE)}</p> : null}
            {recognitionReady ? (
              <div className="wellness-speech">
                <button className="btn assistant-send" type="button" onClick={startListening}>
                  {t("ASK BY VOICE")}
                </button>
                {listening ? (
                  <button className="btn btn-secondary" type="button" onClick={stopListening}>
                    {t("Stop listening")}
                  </button>
                ) : null}
              </div>
            ) : null}
            {listening ? (
              <p className="wellness-listening" role="status">
                {t("Listening…")}
              </p>
            ) : null}
            <label htmlFor={transcriptId}>{t("Recognized question")}</label>
            <textarea
              id={transcriptId}
              value={transcript}
              onChange={(event) => setTranscript(event.target.value)}
              rows={3}
              maxLength={300}
              placeholder={t("You can type a prepared question here too")}
            />
            <button className="btn btn-secondary" type="button" onClick={confirmTranscript} disabled={!transcript.trim()}>
              {t("Confirm question")}
            </button>
            {voiceNote ? (
              <p role="status">{t(voiceNote)}</p>
            ) : null}
            {voiceMatch && !voiceMatch.confident ? (
              <div className="stack">
                <p role="status">{t(LIMITED_SET_MESSAGE)}</p>
                <QuestionButtons
                  questions={voiceMatch.matches.length > 0 ? voiceMatch.matches : popularQuestions()}
                  onChoose={choose}
                />
              </div>
            ) : null}
            {voiceMatch && voiceMatch.confident && voiceMatch.matches.length > 1 ? (
              <div className="stack">
                <h3>{t("Closest questions")}</h3>
                <QuestionButtons questions={voiceMatch.matches} onChoose={choose} />
              </div>
            ) : null}
          </section>

          {category === "all" && !query.trim() && recentQuestions.length > 0 ? (
            <section aria-labelledby="recent-questions-title">
              <h2 id="recent-questions-title">{t("Recently selected")}</h2>
              <QuestionButtons questions={recentQuestions} onChoose={choose} />
            </section>
          ) : null}

          {category === "all" && !query.trim() ? (
            <section aria-labelledby="popular-questions-title">
              <h2 id="popular-questions-title">{t("Popular questions")}</h2>
              <QuestionButtons questions={popularQuestions()} onChoose={choose} />
            </section>
          ) : null}

          <section aria-labelledby="question-list-title">
            <h2 id="question-list-title">
              {query.trim() ? t("Matching questions") : category === "all" ? t("All questions") : t(categoryLabel(category))}
            </h2>
            {filtered.length === 0 ? (
              <div className="stack">
                <p role="status">{t(LIMITED_SET_MESSAGE)}</p>
                <div className="wellness-filters" role="group" aria-label={t("Topics you can open")}>
                  {WELLNESS_CATEGORIES.map((item) => (
                    <button key={item.id} type="button" onClick={() => { setCategory(item.id); setQuery(""); }}>
                      {t(item.label)}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <QuestionButtons questions={filtered} onChoose={choose} />
            )}
          </section>
          <p className="wellness-kind">{t(WELLNESS_ASSISTANT_KIND)}</p>
          <p className="wellness-emergency" role="note">{t(WELLNESS_ASSISTANT_EMERGENCY)}</p>
          <p className="wellness-source">{t(PREPARED_ANSWERS_REMAIN)}</p>
        </>
      )}
    </div>
  );
}

function QuestionButtons({
  questions,
  onChoose,
}: {
  questions: readonly WellnessQuestion[];
  onChoose: (id: string) => void;
}) {
  const t = useLocale().t;
  return (
    <div className="wellness-questions">
      {questions.map((item) => (
        <button key={item.id} type="button" onClick={() => onChoose(item.id)}>
          {t(item.question)}
        </button>
      ))}
    </div>
  );
}

function AnswerPanel({
  question,
  onBack,
  onChoose,
}: {
  question: WellnessQuestion;
  onBack: () => void;
  onChoose: (id: string) => void;
}) {
  const { t, locale } = useLocale();
  const related = relatedQuestions(question.id);
  const answer = t(question.answer);
  return (
    <article className="wellness-answer-panel stack">
      <button className="btn btn-secondary wellness-back" type="button" onClick={onBack}>
        {t("Back to Questions")}
      </button>
      <p className="wellness-kicker">{t(categoryLabel(question.category))}</p>
      <h2>{t(question.question)}</h2>
      <p className="wellness-answer">{answer}</p>
      <ListenControls key={`${question.id}-${locale}`} text={answer} />
      {question.links.length > 0 ? (
        <nav className="wellness-links" aria-label={t("Related LifeZoi sections")}>
          {question.links.map((link) => (
            <Link key={link.href} href={link.href}>
              {t(link.label)}
            </Link>
          ))}
        </nav>
      ) : null}
      <section aria-labelledby="related-questions-title">
        <h3 id="related-questions-title">{t("Related questions")}</h3>
        <QuestionButtons questions={related} onChoose={onChoose} />
      </section>
    </article>
  );
}

function ListenControls({ text }: { text: string }) {
  const t = useLocale().t;
  // The shared read-aloud player: best device voice, pause, replay, speed, and voice choice.
  return (
    <div className="wellness-listen">
      <ReadAloud text={text} label={t("LISTEN TO ANSWER")} className="wellness-speech-bar" />
    </div>
  );
}
