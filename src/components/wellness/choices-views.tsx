"use client";

import Link from "next/link";
import { useState } from "react";
import { useT } from "@/components/locale-provider";
import { EvidenceLine, ReadOnlyNote, WellnessSources } from "@/components/wellness/bits";
import { ChallengePanel } from "@/components/wellness/challenge-panel";
import { useWellness } from "@/components/wellness/use-wellness";
import { msg } from "@/lib/i18n/translate";
import { ACID_BASE_NOTE, CHOICE_CATEGORIES, choiceTopics } from "@/lib/wellness/choices";
import { challengeById } from "@/lib/wellness/challenges";
import { MOTIVATION_EXAMPLES, motivationSuggestions } from "@/lib/wellness/motivation";
import type { ChoiceTopic, WellnessMotivation } from "@/lib/wellness/types";

export function ChoicesHome() {
  const t = useT();
  return (
    <div className="learn stack-lg">
      <p className="kicker">{t("Why Your Daily Choices Matter")}</p>
      <h1>{t("Understand your body. Discover better habits. Make your life matter.")}</h1>
      <p className="lede">
        {t(
          "Curiosity is welcome here. A person’s worth does not depend on health, weight, or physical ability. Disability, illness, money, and time are real limits, and the steps stay small.",
        )}
      </p>
      <section className="card stack">
        <h2>{t("How to read the research lines")}</h2>
        <p>
          {t(
            "Established public guidance is what an agency page recommends. Emerging research is still being studied. An observational association is a link in a population, not proof about you. Your notes are your own experience. A product claim, including a cleanse or a plan that says it will change blood acidity, is a belief and is not taught as science.",
          )}
        </p>
        <EvidenceLine kind={ACID_BASE_NOTE.evidence} note={t(ACID_BASE_NOTE.evidenceNote)} />
        <p>{t(ACID_BASE_NOTE.text)}</p>
        <WellnessSources ids={ACID_BASE_NOTE.sourceIds} />
      </section>
      <section className="card stack">
        <h2>{t("Topics")}</h2>
        {CHOICE_CATEGORIES.map((category) => (
          <div key={category}>
            <h3>{t(category)}</h3>
            <ul>
              {choiceTopics
                .filter((topic) => topic.categories.includes(category))
                .map((topic) => (
                  <li key={topic.slug}>
                    <Link href={`/choices/${topic.slug}`}>{t(topic.title)}</Link>
                  </li>
                ))}
              {category === "Personal motivation and habit formation" ? (
                <li>
                  <Link href="/choices/motivation">{t("Your personal motivation")}</Link>
                </li>
              ) : null}
              {category === "Longevity and healthy aging" ? (
                <li>{t("lifeZoi does not predict how long a person will live. The muscle and movement notes are about daily tasks.")}</li>
              ) : null}
            </ul>
          </div>
        ))}
      </section>
      <Link className="btn btn-primary" href="/choices/motivation">
        {t("Write what you want to experience")}
      </Link>
    </div>
  );
}

export function ChoiceDetail({ topic }: { topic: ChoiceTopic }) {
  const wellness = useWellness();
  const t = useT();
  const challenge = challengeById(topic.challengeId);
  const id = `topic-${topic.slug}`;
  const [note, setNote] = useState(wellness.reflection(id));
  const [message, setMessage] = useState<string | null>(null);
  const done = wellness.checked(id);

  return (
    <div className="learn stack-lg">
      <p className="kicker">Why Your Daily Choices Matter</p>
      <h1>{t(topic.title)}</h1>
      <p>{topic.categories.map((category) => t(category)).join(" · ")}</p>
      <section className="card stack">
        <h2>{t("Why it matters")}</h2>
        <p>{t(topic.why.text)}</p>
        <EvidenceLine kind={topic.why.evidence} note={t(topic.why.evidenceNote)} />
        <WellnessSources ids={topic.why.sourceIds} />
      </section>
      <section className="card stack">
        <h2>{t("What happens in the body")}</h2>
        <p>{t(topic.body.text)}</p>
        <EvidenceLine kind={topic.body.evidence} note={t(topic.body.evidenceNote)} />
        <WellnessSources ids={topic.body.sourceIds} />
      </section>
      <section className="card stack">
        <h2>{t("What research says")}</h2>
        {topic.research.map((item) => (
          <div key={item.text.slice(0, 40)} className="stack">
            <p>{t(item.text)}</p>
            <EvidenceLine kind={item.evidence} note={t(item.evidenceNote)} />
            <WellnessSources ids={item.sourceIds} />
          </div>
        ))}
      </section>
      <section className="card stack">
        <h2>{t("What you can do today")}</h2>
        <ol>
          {topic.actions.map((action) => (
            <li key={action}>{t(action)}</li>
          ))}
        </ol>
        <WellnessSources ids={topic.actionSourceIds} />
      </section>
      {challenge ? (
        <section className="card stack">
          <h2>{t("Your small challenge")}</h2>
          <ChallengePanel challenge={challenge} />
        </section>
      ) : null}
      <section className="card stack">
        <h2>{t("Track your progress")}</h2>
        <ReadOnlyNote message={wellness.readOnlyMessage} />
        {message ? <p role="status">{t(message)}</p> : null}
        <button className="btn btn-primary" type="button" aria-pressed={done} onClick={() => setMessage(wellness.toggleCheck(id, note))}>
          {done ? t("Today is marked") : t("Mark today")}
        </button>
        <label className="field">
          <span>{t("Short reflection")}</span>
          <textarea value={note} maxLength={280} rows={4} onChange={(event) => setNote(event.target.value)} />
        </label>
        <button className="btn btn-secondary" type="button" onClick={() => setMessage(wellness.saveReflection(id, note))}>
          {t("Save reflection")}
        </button>
      </section>
      <p>
        <Link href="/choices/motivation">{t("Tie this to what you want from your days")}</Link>
      </p>
    </div>
  );
}

export function MotivationView() {
  const wellness = useWellness();
  const t = useT();
  const [form, setForm] = useState<WellnessMotivation>(wellness.log.motivation);
  const [message, setMessage] = useState<string | null>(null);
  const ideas = motivationSuggestions(wellness.log.motivation);

  function setField(key: keyof WellnessMotivation, value: string) {
    setForm({ ...form, [key]: value });
  }

  return (
    <div className="learn stack-lg">
      <p className="kicker">{t("Why Your Daily Choices Matter")}</p>
      <h1>{t("Your personal motivation")}</h1>
      <p className="lede">
        {t(
          "Write what you want to experience, who you want time with, what you want to do, and what energy or mobility would help. Examples include a trip, more energy for a hobby, or staying able to do a daily task. They are examples, not assumptions about your family or your body.",
        )}
      </p>
      <ul>
        {MOTIVATION_EXAMPLES.map((example) => (
          <li key={example}>{t(example)}</li>
        ))}
      </ul>
      <ReadOnlyNote message={wellness.readOnlyMessage} />
      {message ? <p role="status">{t(message)}</p> : null}
      {(
        [
          ["experience", msg("What do you want to experience?")],
          ["people", msg("Who do you want time with?")],
          ["activities", msg("What activities matter to you?")],
          ["accomplishments", msg("What would you like to finish or keep doing?")],
          ["energyFor", msg("What would more energy or easier movement help you do?")],
        ] as const
      ).map(([key, label]) => (
        <label key={key} className="field">
          <span>{t(label)}</span>
          <textarea value={form[key]} maxLength={280} rows={3} onChange={(event) => setField(key, event.target.value)} />
        </label>
      ))}
      <button className="btn btn-primary" type="button" onClick={() => setMessage(wellness.setMotivation(form))}>
        {t("Save motivation in this tab")}
      </button>
      <section className="stack">
        <h2>{t("Related lessons")}</h2>
        {ideas.map((idea) => (
          <Link key={idea.href + idea.title} className="card learn-link" href={idea.href}>
            <h3>{t(idea.title)}</h3>
            <p>{t(idea.reason)}</p>
          </Link>
        ))}
      </section>
    </div>
  );
}
