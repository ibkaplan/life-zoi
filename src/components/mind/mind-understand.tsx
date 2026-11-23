"use client";

import Link from "next/link";
import { useT } from "@/components/locale-provider";
import { INSTRUMENTS, NOT_INCLUDED } from "@/lib/mind/assessments";
import { REFLECTION_LABEL, REFLECTIONS } from "@/lib/mind/reflections";

export function MindUnderstand() {
  const t = useT();
  return (
    <div className="stack-lg">
      <p className="mind-note">
        {t("Every questionnaire here is optional and private. Your answers are worked out in this browser and are not sent to LifeZoi. A questionnaire can help you notice patterns, but it cannot diagnose anything.")}
      </p>

      <section className="stack" aria-labelledby="validated-title">
        <h2 id="validated-title">{t("Validated screening questionnaires")}</h2>
        <p>{t("These are widely used, published questionnaires, shown with their original wording, answer choices, time frame, and scoring.")}</p>
        <div className="mind-grid">
          {INSTRUMENTS.map((instrument) => (
            <Link key={instrument.id} href={`/mind/understand/${instrument.id}`} className="mind-card">
              <span className="mind-tag validated">{t("Validated questionnaire")}</span>
              <h3>{t(instrument.topic)}</h3>
              <p className="mind-card-meta">
                <span lang="en">{instrument.name}</span> · {t("{count} questions", { count: instrument.items.length })} · {t("about {minutes} min", { minutes: instrument.minutes })}
              </p>
              <p>{t(instrument.purpose)}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="stack" aria-labelledby="reflection-title">
        <h2 id="reflection-title">{t("Self-reflection on other topics")}</h2>
        <p>
          <span className="mind-tag reflection">{t(REFLECTION_LABEL)}</span>
        </p>
        <p>{t("These short sets of statements were written by LifeZoi to help you reflect. They give no score or label, only the statements that stood out for you, with ideas to explore.")}</p>
        <div className="mind-grid">
          {REFLECTIONS.map((reflection) => (
            <Link key={reflection.id} href={`/mind/understand/${reflection.id}`} className="mind-card">
              <span className="mind-tag reflection">{t("Educational self-reflection")}</span>
              <h3>{t(reflection.title)}</h3>
              <p className="mind-card-meta">{t("{count} statements", { count: reflection.statements.length })} · {t("about {minutes} min", { minutes: 2 })}</p>
              <p>{t(reflection.intro)}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="card stack" aria-labelledby="not-included-title">
        <h2 id="not-included-title">{t("Questionnaires that are not included yet")}</h2>
        <p>{t("LifeZoi only shows a validated questionnaire when it has confirmed it may be used. These two could not be confirmed:")}</p>
        <ul className="mind-list">
          {NOT_INCLUDED.map((entry) => (
            <li key={entry.name}>
              <strong lang="en">{entry.name}.</strong> {t(entry.reason)}{" "}
              <a href={entry.url} target="_blank" rel="noreferrer">
                {t("Licensing information")}
              </a>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
