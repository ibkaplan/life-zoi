"use client";

import Link from "next/link";
import { useSession } from "@/components/session-provider";
import { SSA_LIFE_TABLE_URL, SSA_TABLE_META } from "@/lib/life-table";
import { homeGauge } from "@/lib/home-gauge";
import { POPULATION_LABEL } from "@/lib/outlook";
import { validateComplete } from "@/lib/validation";

export function HomeGauge() {
  const { ready, session, sample } = useSession();
  const answers = session.history[0]?.answers ?? null;
  const parsed = answers ? validateComplete(answers) : null;
  const normalized = parsed && parsed.ok ? parsed.value : null;
  const gauge = homeGauge(normalized, sample);
  const shown = ready && gauge.shown;
  const detail = ready ? gauge.detail : "Checking this browser tab for a completed assessment.";

  return (
    <section className="page home-gauge-section" aria-labelledby="home-gauge-title">
      <div className="home-gauge">
        <div className="home-gauge-ring" aria-hidden="true">
          <svg viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="46" fill="#fffdf8" stroke="#efe8dc" strokeWidth="12" />
            <circle cx="60" cy="60" r="46" fill="none" stroke="#0f766e" strokeWidth="3" />
          </svg>
          <p className="home-gauge-center">
            <span>{shown ? gauge.figure : "Empty"}</span>
            <small>{shown ? "Published cell" : "No score"}</small>
          </p>
        </div>
        <div className="home-gauge-copy">
          <h2 id="home-gauge-title">Population statistic</h2>
          <p>{POPULATION_LABEL}</p>
          <p>{detail}</p>
          {shown ? <p className="home-gauge-figure">Published cell: {gauge.figure}</p> : null}
          <p>
            <a href={SSA_LIFE_TABLE_URL}>Official SSA period life table</a>
            {" · "}
            {SSA_TABLE_META.name}.
          </p>
          <p>
            <Link href="/outlook">Read the longer explanation on Life outlook</Link>
          </p>
        </div>
      </div>
    </section>
  );
}
