import Link from "next/link";
import { INSTRUMENTS, NOT_INCLUDED } from "@/lib/mind/assessments";
import { REFLECTION_LABEL, REFLECTIONS } from "@/lib/mind/reflections";

export function MindUnderstand() {
  return (
    <div className="stack-lg">
      <p className="mind-note">
        Every questionnaire here is optional and private. Your answers are worked out in this browser and are not sent to LifeZoi. A questionnaire can help you notice patterns, but it cannot diagnose anything.
      </p>

      <section className="stack" aria-labelledby="validated-title">
        <h2 id="validated-title">Validated screening questionnaires</h2>
        <p>These are widely used, published questionnaires, shown with their original wording, answer choices, time frame, and scoring.</p>
        <div className="mind-grid">
          {INSTRUMENTS.map((instrument) => (
            <Link key={instrument.id} href={`/mind/understand/${instrument.id}`} className="mind-card">
              <span className="mind-tag validated">Validated questionnaire</span>
              <h3>{instrument.topic}</h3>
              <p className="mind-card-meta">
                {instrument.name} · {instrument.items.length} questions · about {instrument.minutes} minutes
              </p>
              <p>{instrument.purpose}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="stack" aria-labelledby="reflection-title">
        <h2 id="reflection-title">Self-reflection on other topics</h2>
        <p>
          <span className="mind-tag reflection">{REFLECTION_LABEL}</span>
        </p>
        <p>These short sets of statements were written by LifeZoi to help you reflect. They give no score or label, only the statements that stood out for you, with ideas to explore.</p>
        <div className="mind-grid">
          {REFLECTIONS.map((reflection) => (
            <Link key={reflection.id} href={`/mind/understand/${reflection.id}`} className="mind-card">
              <span className="mind-tag reflection">Educational self-reflection</span>
              <h3>{reflection.title}</h3>
              <p className="mind-card-meta">{reflection.statements.length} statements · about 2 minutes</p>
              <p>{reflection.intro}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="card stack" aria-labelledby="not-included-title">
        <h2 id="not-included-title">Questionnaires that are not included yet</h2>
        <p>LifeZoi only shows a validated questionnaire when it has confirmed it may be used. These two could not be confirmed:</p>
        <ul className="mind-list">
          {NOT_INCLUDED.map((entry) => (
            <li key={entry.name}>
              <strong>{entry.name}.</strong> {entry.reason}{" "}
              <a href={entry.url} target="_blank" rel="noreferrer">
                Licensing information
              </a>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
