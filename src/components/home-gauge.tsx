"use client";

import { useSession } from "@/components/session-provider";
import { homeOutlook } from "@/lib/home-gauge";

export function HomeGauge() {
  const { ready, session, sample } = useSession();
  const hasOwnAssessment = ready && !sample && session.history.length > 0;
  const outlook = homeOutlook(hasOwnAssessment);

  return (
    <section className="page home-gauge-section" aria-labelledby="home-gauge-title">
      <h2 id="home-gauge-title">YOUR LIFE OUTLOOK</h2>
      <p>{outlook.detail}</p>
      <ul className="home-outlook-labels">
        {outlook.labels.map((label) => (
          <li key={label}>{label}</li>
        ))}
      </ul>
      <p className="home-outlook-note">Labels only. No result is shown here.</p>
    </section>
  );
}
