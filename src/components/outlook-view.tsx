"use client";

import Link from "next/link";
import { usePageFormat } from "@/components/page-format";
import { PagePhoto } from "@/components/page-photo";
import { useSession } from "@/components/session-provider";
import { LoadingState } from "@/components/sources";
import { SSA_LIFE_TABLE_URL, SSA_TABLE_META } from "@/lib/life-table";
import { OUTLOOK_LABEL_TEXT, personalProfile, populationBlock, POPULATION_LABEL } from "@/lib/outlook";
import { validateComplete } from "@/lib/validation";

export function OutlookView() {
  const { ready, session, sample } = useSession();
  const { t, locale } = usePageFormat();
  if (!ready) return <LoadingState label={t("Loading your outlook…")} />;
  const answers = session.history[0]?.answers ?? null;
  const parsed = answers ? validateComplete(answers) : null;
  const normalized = parsed && parsed.ok ? parsed.value : null;
  const population = populationBlock(normalized, t);
  const profile = personalProfile(normalized, t);

  return (
    <div className="learn stack-lg">
      <PagePhoto id="outlook" />
      <p className="kicker">{t("Life outlook")}</p>
      <h1>{t("Your future is not a fixed number")}</h1>
      <p className="lede">
        {t("LifeZoi provides educational information and statistical estimates. It cannot predict your exact lifespan, diagnose medical conditions, or replace professional medical advice.")}
      </p>
      <p>{t("Your health gives you possibilities. Your choices give your life direction. Your kindness gives the world something valuable. Disability or illness does not make a life less valuable.")}</p>
      <section className="card stack" aria-labelledby="population-estimate">
        <h2 id="population-estimate">{t("A. Population table")}</h2>
        <p><strong>{t(POPULATION_LABEL)}</strong></p>
        <p>{population.text}</p>
        <p>
          <strong>{t("Source.")}</strong> {t("Social Security Administration. {table}.", { table: t(SSA_TABLE_META.name) })}
        </p>
        <p>
          <strong>{t("Year of the rates.")}</strong> {t("{year}. Used in the {report}.", { year: SSA_TABLE_META.year, report: t(SSA_TABLE_META.report) })}
        </p>
        <p>
          <a href={SSA_LIFE_TABLE_URL}>{t("Official SSA period life table")}</a>
          {locale !== "en" ? <span className="hint"> {t("(in English)")}</span> : null}
        </p>
        {sample ? <p className="hint">{t("Sample data is not a real person, so a blank table is expected unless the sample includes an age and column.")}</p> : null}
      </section>
      <section className="card stack" aria-labelledby="personal-profile">
        <h2 id="personal-profile">{t("B. Personal profile")}</h2>
        <p>{profile.modelNote}</p>
        {profile.items.length === 0 ? <p>{t("Complete the assessment to see a profile.")}</p> : null}
        <ul className="record-list">
          {profile.items.map((item) => (
            <li key={item.topic}>
              <strong>{item.topic}</strong>
              <p>
                {t("{label}. {note}", { label: t(OUTLOOK_LABEL_TEXT[item.label]), note: item.note })}
              </p>
              <p className="hint">{t("Kind: {kind}. Not a measured clinic result.", { kind: t(item.kind) })}</p>
            </li>
          ))}
        </ul>
        <h3>{t("Missing information")}</h3>
        <ul>{profile.missing.map((item) => <li key={item}>{item}</li>)}</ul>
        <h3>{t("Practical opportunities")}</h3>
        <ul>{profile.opportunities.map((item) => <li key={item}>{item}</li>)}</ul>
        <h3>{t("Next chapter")}</h3>
        <p>{profile.nextChapter}</p>
      </section>
      <div className="actions">
        <Link className="btn btn-primary" href="/plan">{t("My Life Improvement Plan")}</Link>
        <Link className="btn btn-secondary" href="/what-if">{t("Open a hypothetical WHAT IF?")}</Link>
      </div>
    </div>
  );
}
