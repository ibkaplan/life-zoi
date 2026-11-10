"use client";

import { useMessages } from "@/components/locale-provider";
import { useSession } from "@/components/session-provider";

export function HomeGauge() {
  const { ready, session, sample } = useSession();
  const g = useMessages().gauge;
  const hasOwnAssessment = ready && !sample && session.history.length > 0;
  const labels = [g.labels.positive, g.labels.improve, g.labels.plan];

  return (
    <section className="page home-gauge-section" aria-labelledby="home-gauge-title">
      <h2 id="home-gauge-title">{g.title}</h2>
      <p>{hasOwnAssessment ? g.after : g.before}</p>
      <ul className="home-outlook-labels">
        {labels.map((label) => (
          <li key={label}>{label}</li>
        ))}
      </ul>
      <p className="home-outlook-note">{g.note}</p>
    </section>
  );
}
