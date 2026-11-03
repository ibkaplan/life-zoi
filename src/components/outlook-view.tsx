"use client";

import Link from "next/link";
import { useSession } from "@/components/session-provider";
import { LoadingState } from "@/components/sources";
import { SSA_LIFE_TABLE_URL, SSA_TABLE_META } from "@/lib/life-table";
import { personalProfile, populationBlock, POPULATION_LABEL } from "@/lib/outlook";
import { validateComplete } from "@/lib/validation";

export function OutlookView() {
  const { ready, session, sample } = useSession();
  if (!ready) return <LoadingState label="Loading your outlook…" />;
  const answers = session.history[0]?.answers ?? null;
  const parsed = answers ? validateComplete(answers) : null;
  const normalized = parsed && parsed.ok ? parsed.value : null;
  const population = populationBlock(normalized);
  const profile = personalProfile(normalized);

  return (
    <div className="learn stack-lg">
      <p className="kicker">Life outlook</p>
      <h1>Your future is not a fixed number</h1>
      <p className="lede">
        LifeZoi provides educational information and statistical estimates. It cannot predict your exact lifespan, diagnose medical conditions, or replace professional medical advice.
      </p>
      <p>Your health gives you possibilities. Your choices give your life direction. Your kindness gives the world something valuable. Disability or illness does not make a life less valuable.</p>
      <section className="card stack" aria-labelledby="population-estimate">
        <h2 id="population-estimate">A. Population table</h2>
        <p><strong>{POPULATION_LABEL}</strong></p>
        <p>{population.text}</p>
        <p><strong>Source.</strong> Social Security Administration. {SSA_TABLE_META.name}.</p>
        <p><strong>Year of the rates.</strong> {SSA_TABLE_META.year}. Used in the {SSA_TABLE_META.report}.</p>
        <p>
          <a href={SSA_LIFE_TABLE_URL}>Official SSA period life table</a>
        </p>
        {sample ? <p className="hint">Sample data is not a real person, so a blank table is expected unless the sample includes an age and column.</p> : null}
      </section>
      <section className="card stack" aria-labelledby="personal-profile">
        <h2 id="personal-profile">B. Personal profile</h2>
        <p>{profile.modelNote}</p>
        {profile.items.length === 0 ? <p>Complete the assessment to see a profile.</p> : null}
        <ul className="record-list">
          {profile.items.map((item) => (
            <li key={item.topic}>
              <strong>{item.topic}</strong>
              <p>{item.label}. {item.note}</p>
              <p className="hint">Kind: {item.kind}. Not a measured clinic result.</p>
            </li>
          ))}
        </ul>
        <h3>Missing information</h3>
        <ul>{profile.missing.map((item) => <li key={item}>{item}</li>)}</ul>
        <h3>Practical opportunities</h3>
        <ul>{profile.opportunities.map((item) => <li key={item}>{item}</li>)}</ul>
        <h3>Next chapter</h3>
        <p>{profile.nextChapter}</p>
      </section>
      <div className="actions">
        <Link className="btn btn-primary" href="/plan">My Life Improvement Plan</Link>
        <Link className="btn btn-secondary" href="/what-if">Open a hypothetical WHAT IF?</Link>
      </div>
    </div>
  );
}
