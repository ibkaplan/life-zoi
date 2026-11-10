"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { BreatheHeroArt, VesselArt } from "@/components/breathe/art";
import { ConsistencyStrip, LifeChangesPanel, WeekCalendar } from "@/components/breathe/calendar";
import { BreathingPlayer } from "@/components/breathe/player";
import { BreatheNav, EvidenceBadge, EvidenceLegend, SafetyCard, SourcesList } from "@/components/breathe/shared";
import { useBreathe } from "@/components/breathe/use-breathe";
import { SaveNote } from "@/components/companion/shared";
import {
  AGING_INFLAMMATION,
  AGING_NUANCE,
  AGING_STEPS,
  BREATHE_DISCLAIMER,
  BREATHE_SUBTITLE,
  BREATHE_TITLE,
  FOOD_TIPS,
  FOODS,
  MEDICINE_NOTE,
  NO_FACTORS,
  NO_INTRO,
  NO_LOW,
  NO_ROLES,
  NOT_A_CURE,
  ORAL_BACTERIA,
  PATHWAYS,
  RECIPES,
  SUPPLEMENT_NOTE,
  TECHNIQUES,
} from "@/lib/breathe/content";
import { challengeSummary } from "@/lib/breathe/program";
import { localISODate } from "@/lib/dates";
import { useT } from "@/components/locale-provider";
import { Rich } from "@/components/companion/i18n";

function Header({ kicker, title, lede }: { kicker: string; title: string; lede: string }) {
  const t = useT();
  return (
    <>
      <div className="lz-hero-row bf-hero">
        <div className="lz-hello">
          <p className="kicker">{kicker}</p>
          <h1>{title}</h1>
          <p className="script brand-line">{t("Breathe gently. Live better.")}</p>
          <p>{lede}</p>
        </div>
        <BreatheHeroArt />
      </div>
      <BreatheNav />
    </>
  );
}

// ---------- overview ----------

export function BreatheHome() {
  const { ready, breathe, breathless } = useBreathe();
  const t = useT();
  if (!ready) return <p className="hint">{t("Loading Breathe for Life…")}</p>;
  const summary = challengeSummary(breathe, localISODate());
  return (
    <div className="stack-lg bf">
      <Header
        kicker={`${t(BREATHE_TITLE)} · ${t(BREATHE_SUBTITLE)}`}
        title={t("Support your natural nitric oxide pathways")}
        lede={t("Gentle breathing, colorful vegetables, and regular walks work with the ways your body makes nitric oxide, a small molecule that helps blood vessels relax. A few calm minutes, four times a week.")}
      />
      <SaveNote />
      <div className="bf-actions">
        <Link className="btn btn-primary bf-big" href="/breathe/practice">
          {t("Start Breathing Session")}
        </Link>
        <Link className="btn btn-teal bf-big" href="/breathe/challenge">
          {breathe.challenge && !summary?.ended ? t("Challenge: day {day} of 30", { day: summary?.day ?? 1 }) : t("30-day challenge")}
        </Link>
        <Link className="btn btn-secondary bf-big" href="/breathe/learn">
          {t("What is nitric oxide?")}
        </Link>
        <Link className="btn btn-secondary bf-big" href="/breathe/foods">
          {t("Foods for the nitrate pathway")}
        </Link>
      </div>
      <div className="bf-grid">
        <WeekCalendar />
        <ConsistencyStrip />
      </div>
      <section className="card stack">
        <h2>{t("Your weekly program")}</h2>
        <p>
          <Rich
            text={t("At least <0>four sessions a week</0>, about <1>5 to 10 minutes</1> each. Practice every day if you enjoy it.")}
            parts={[(label) => <strong>{label}</strong>, (label) => <strong>{label}</strong>]}
          />
        </p>
        <ol className="bf-steps">
          <li>
            <strong>{t("Relaxed nasal breathing")}</strong> · {t("2 minutes")}
          </li>
          <li>
            <strong>{t("Bhramari humming")}</strong> · {t("2 minutes")}
          </li>
          <li>
            <strong>{t("Gentle diaphragmatic breathing")}</strong> · {t("3 minutes")}
          </li>
          <li>
            <strong>{t("Relaxation and normal breathing")}</strong> · {t("1 to 2 minutes")}
          </li>
        </ol>
        <p className="hint">{t("Written for adults of every age, including people over 50. Sit in a supportive chair. Nothing here asks you to hold your breath.")}</p>
      </section>
      <LifeChangesPanel />
      <SafetyCard breathless={breathless} compact />
      <p className="library-disclaimer">{t(BREATHE_DISCLAIMER)}</p>
    </div>
  );
}

// ---------- learn ----------

export function BreatheLearn() {
  const t = useT();
  return (
    <div className="stack-lg bf">
      <Header kicker={`${t(BREATHE_TITLE)} · ${t("Learn")}`} title={t("What is nitric oxide?")} lede={t(NO_INTRO[0] as string)} />
      <section className="stack" aria-labelledby="bf-roles">
        <p>{t(NO_INTRO[1] as string)}</p>
        <h2 id="bf-roles">{t("What nitric oxide does")}</h2>
        <div className="bf-cards">
          {NO_ROLES.map((role) => (
            <article key={role.title} className="card stack">
              <h3>{t(role.title)}</h3>
              <p>{t(role.text)}</p>
              <EvidenceBadge level={role.level} />
            </article>
          ))}
        </div>
      </section>
      <section className="card stack">
        <h2>{t(NO_LOW.title)}</h2>
        <p>{t(NO_LOW.text)}</p>
        <h3>{t("Things that can affect how much NO is available")}</h3>
        <ul className="bf-chips">
          {NO_FACTORS.map((factor) => (
            <li key={factor}>{t(factor)}</li>
          ))}
        </ul>
      </section>
      <section className="stack" aria-labelledby="bf-paths">
        <h2 id="bf-paths">{t("Two ways your body makes nitric oxide")}</h2>
        <div className="bf-cards bf-cards-2">
          {PATHWAYS.map((path) => (
            <article key={path.id} className="card stack" data-path={path.id}>
              <h3>{t(path.title)}</h3>
              <ol className="bf-flow">
                {path.steps.map((step) => (
                  <li key={step}>{t(step)}</li>
                ))}
              </ol>
              <p>{t(path.text)}</p>
              <EvidenceBadge level={path.level} />
            </article>
          ))}
        </div>
        <p className="alert">{t(NOT_A_CURE)}</p>
      </section>
      <section className="stack" aria-labelledby="bf-age">
        <h2 id="bf-age">{t("Why nitric oxide changes with age")}</h2>
        <div className="lz-hero-row">
          <ol className="bf-aging">
            {AGING_STEPS.map((step) => (
              <li key={step.title}>
                <strong>{t(step.title)}</strong>
                <p>{t(step.text)}</p>
              </li>
            ))}
          </ol>
          <VesselArt />
        </div>
        <div className="card stack">
          <h3>{t("Inflammation and vascular aging")}</h3>
          <p>{t(AGING_INFLAMMATION)}</p>
          <h3>{t("Production, availability, and use are different")}</h3>
          <p>{t(AGING_NUANCE)}</p>
          <EvidenceBadge level="established" />
        </div>
      </section>
      <EvidenceLegend />
      <SourcesList />
      <p className="library-disclaimer">{t(BREATHE_DISCLAIMER)}</p>
    </div>
  );
}

// ---------- practice ----------

export function BreathePractice() {
  const { ready, breathless } = useBreathe();
  const t = useT();
  if (!ready) return <p className="hint">{t("Loading the breathing guide…")}</p>;
  return (
    <div className="stack-lg bf">
      <Header
        kicker={`${t(BREATHE_TITLE)} · ${t("Breathe")}`}
        title={t("Your breathing session")}
        lede={t("Follow the circle: it grows as you breathe in and gets smaller as you breathe out or hum. Stay comfortable, and stop whenever you want.")}
      />
      <SaveNote />
      <SafetyCard breathless={breathless} compact />
      <BreathingPlayer />
      <WeekCalendar />
      <section className="stack" aria-labelledby="bf-tech">
        <h2 id="bf-tech">{t("The techniques")}</h2>
        {TECHNIQUES.map((technique) => (
          <details key={technique.id} className="lz-section">
            <summary>
              <span>{t(technique.title)}</span>
            </summary>
            <div className="lz-section-body">
              <p>{t(technique.subtitle)}</p>
              <ol>
                {technique.steps.map((step) => (
                  <li key={step}>{t(step)}</li>
                ))}
              </ol>
              <ul className="bf-science">
                {technique.science.map((item) => (
                  <li key={item.text}>
                    <EvidenceBadge level={item.level} /> {t(item.text)}
                  </li>
                ))}
              </ul>
            </div>
          </details>
        ))}
      </section>
      <SafetyCard breathless={breathless} />
      <p className="library-disclaimer">{t(BREATHE_DISCLAIMER)}</p>
    </div>
  );
}

// ---------- foods ----------

export function BreatheFoods() {
  const { ready, companion } = useBreathe();
  const [chosen, setChosen] = useState<string | null>(null);
  const t = useT();
  const exclusions = useMemo(() => [...companion.food.exclusions, ...companion.food.disliked], [companion.food]);
  if (!ready) return <p className="hint">{t("Loading foods…")}</p>;
  const food = FOODS.find((item) => item.id === chosen) ?? null;
  const recipes = chosen ? RECIPES.filter((recipe) => recipe.foods.includes(chosen)) : RECIPES;
  // Exclusions may be typed in any language, so they are checked against the English and the translated ingredients.
  const flagged = (ingredients: string[]) =>
    exclusions.filter((word) => [...ingredients, ...ingredients.map((item) => t(item))].join(" ").toLowerCase().includes(word));
  return (
    <div className="stack-lg bf">
      <Header
        kicker={`${t(BREATHE_TITLE)} · ${t("Foods")}`}
        title={t("Foods for the nitrate pathway")}
        lede={t("Many vegetables, especially leafy greens and beetroot, contain nitrate. Your body can turn it into nitric oxide with help from friendly bacteria in your mouth.")}
      />
      <section className="stack" aria-labelledby="bf-foods">
        <h2 id="bf-foods">{t("Tap a vegetable")}</h2>
        <div className="bf-foods" role="group" aria-label={t("Nitrate-rich vegetables")}>
          {FOODS.map((item) => (
            <button key={item.id} type="button" className="bf-food" data-group={item.group} aria-pressed={chosen === item.id} onClick={() => setChosen(chosen === item.id ? null : item.id)}>
              {t(item.name)}
            </button>
          ))}
        </div>
        {food ? (
          <div className="card stack" role="status">
            <h3>{t(food.name)}</h3>
            <p>{t(food.tip)}</p>
          </div>
        ) : (
          <p className="hint">{t("Other good choices include mustard greens, chicory, carrots, and cauliflower.")}</p>
        )}
        <ul>
          {FOOD_TIPS.map((tip) => (
            <li key={tip}>{t(tip)}</li>
          ))}
        </ul>
      </section>
      <section className="stack" aria-labelledby="bf-recipes">
        <h2 id="bf-recipes">{food ? t("Simple ideas with {food}", { food: t(food.name).toLowerCase() }) : t("Simple meal ideas")}</h2>
        {recipes.length === 0 ? <p>{t("No recipe here uses this one yet. Add it to a salad, soup, or sandwich.")}</p> : null}
        <div className="bf-cards">
          {recipes.map((recipe) => {
            const hits = flagged(recipe.ingredients);
            return (
              <article key={recipe.id} className="card stack">
                <h3>{t(recipe.title)}</h3>
                <p className="hint">{t("About {minutes} minutes", { minutes: recipe.minutes })}</p>
                {hits.length > 0 ? <p className="alert">{t("Contains something you excluded or dislike ({list}). Swap it or skip this one.", { list: hits.join(", ") })}</p> : null}
                <h4>{t("You need")}</h4>
                <ul>
                  {recipe.ingredients.map((item) => (
                    <li key={item}>{t(item)}</li>
                  ))}
                </ul>
                <h4>{t("Steps")}</h4>
                <ol>
                  {recipe.steps.map((step) => (
                    <li key={step}>{t(step)}</li>
                  ))}
                </ol>
              </article>
            );
          })}
        </div>
        <p className="hint">
          <Rich
            text={t("Check every recipe against your own allergies. Your saved food choices are in <0>Food & Wellness</0>.")}
            parts={[(label) => <Link href="/food-plan/preferences">{label}</Link>]}
          />
        </p>
      </section>
      <section className="card stack">
        <h2>{t(ORAL_BACTERIA.title)}</h2>
        <p>{t(ORAL_BACTERIA.text)}</p>
        <p>
          <EvidenceBadge level={ORAL_BACTERIA.level} /> {t(ORAL_BACTERIA.mouthwash)}
        </p>
      </section>
      <section className="card stack">
        <h2>{t("Supplements and medicines")}</h2>
        <p>{t(SUPPLEMENT_NOTE)}</p>
        <p>{t(MEDICINE_NOTE)}</p>
      </section>
      <p className="library-disclaimer">{t(BREATHE_DISCLAIMER)}</p>
    </div>
  );
}
