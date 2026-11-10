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

function Header({ kicker, title, lede }: { kicker: string; title: string; lede: string }) {
  return (
    <>
      <div className="lz-hero-row bf-hero">
        <div className="lz-hello">
          <p className="kicker">{kicker}</p>
          <h1>{title}</h1>
          <p className="script brand-line">Breathe gently. Live better.</p>
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
  if (!ready) return <p className="hint">Loading Breathe for Life…</p>;
  const summary = challengeSummary(breathe, localISODate());
  return (
    <div className="stack-lg bf">
      <Header
        kicker={`${BREATHE_TITLE} · ${BREATHE_SUBTITLE}`}
        title="Support your natural nitric oxide pathways"
        lede="Gentle breathing, colorful vegetables, and regular walks work with the ways your body makes nitric oxide, a small molecule that helps blood vessels relax. A few calm minutes, four times a week."
      />
      <SaveNote />
      <div className="bf-actions">
        <Link className="btn btn-primary bf-big" href="/breathe/practice">
          Start Breathing Session
        </Link>
        <Link className="btn btn-teal bf-big" href="/breathe/challenge">
          {breathe.challenge && !summary?.ended ? `Challenge: day ${summary?.day ?? 1} of 30` : "30-day challenge"}
        </Link>
        <Link className="btn btn-secondary bf-big" href="/breathe/learn">
          What is nitric oxide?
        </Link>
        <Link className="btn btn-secondary bf-big" href="/breathe/foods">
          Foods for the nitrate pathway
        </Link>
      </div>
      <div className="bf-grid">
        <WeekCalendar />
        <ConsistencyStrip />
      </div>
      <section className="card stack">
        <h2>Your weekly program</h2>
        <p>
          At least <strong>four sessions a week</strong>, about <strong>5 to 10 minutes</strong> each. Practice every day if you enjoy it.
        </p>
        <ol className="bf-steps">
          <li>
            <strong>Relaxed nasal breathing</strong> · 2 minutes
          </li>
          <li>
            <strong>Bhramari humming</strong> · 2 minutes
          </li>
          <li>
            <strong>Gentle diaphragmatic breathing</strong> · 3 minutes
          </li>
          <li>
            <strong>Relaxation and normal breathing</strong> · 1 to 2 minutes
          </li>
        </ol>
        <p className="hint">Written for adults of every age, including people over 50. Sit in a supportive chair. Nothing here asks you to hold your breath.</p>
      </section>
      <LifeChangesPanel />
      <SafetyCard breathless={breathless} compact />
      <p className="library-disclaimer">{BREATHE_DISCLAIMER}</p>
    </div>
  );
}

// ---------- learn ----------

export function BreatheLearn() {
  return (
    <div className="stack-lg bf">
      <Header kicker={`${BREATHE_TITLE} · Learn`} title="What is nitric oxide?" lede={NO_INTRO[0] as string} />
      <section className="stack" aria-labelledby="bf-roles">
        <p>{NO_INTRO[1]}</p>
        <h2 id="bf-roles">What nitric oxide does</h2>
        <div className="bf-cards">
          {NO_ROLES.map((role) => (
            <article key={role.title} className="card stack">
              <h3>{role.title}</h3>
              <p>{role.text}</p>
              <EvidenceBadge level={role.level} />
            </article>
          ))}
        </div>
      </section>
      <section className="card stack">
        <h2>{NO_LOW.title}</h2>
        <p>{NO_LOW.text}</p>
        <h3>Things that can affect how much NO is available</h3>
        <ul className="bf-chips">
          {NO_FACTORS.map((factor) => (
            <li key={factor}>{factor}</li>
          ))}
        </ul>
      </section>
      <section className="stack" aria-labelledby="bf-paths">
        <h2 id="bf-paths">Two ways your body makes nitric oxide</h2>
        <div className="bf-cards bf-cards-2">
          {PATHWAYS.map((path) => (
            <article key={path.id} className="card stack" data-path={path.id}>
              <h3>{path.title}</h3>
              <ol className="bf-flow">
                {path.steps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
              <p>{path.text}</p>
              <EvidenceBadge level={path.level} />
            </article>
          ))}
        </div>
        <p className="alert">{NOT_A_CURE}</p>
      </section>
      <section className="stack" aria-labelledby="bf-age">
        <h2 id="bf-age">Why nitric oxide changes with age</h2>
        <div className="lz-hero-row">
          <ol className="bf-aging">
            {AGING_STEPS.map((step) => (
              <li key={step.title}>
                <strong>{step.title}</strong>
                <p>{step.text}</p>
              </li>
            ))}
          </ol>
          <VesselArt />
        </div>
        <div className="card stack">
          <h3>Inflammation and vascular aging</h3>
          <p>{AGING_INFLAMMATION}</p>
          <h3>Production, availability, and use are different</h3>
          <p>{AGING_NUANCE}</p>
          <EvidenceBadge level="established" />
        </div>
      </section>
      <EvidenceLegend />
      <SourcesList />
      <p className="library-disclaimer">{BREATHE_DISCLAIMER}</p>
    </div>
  );
}

// ---------- practice ----------

export function BreathePractice() {
  const { ready, breathless } = useBreathe();
  if (!ready) return <p className="hint">Loading the breathing guide…</p>;
  return (
    <div className="stack-lg bf">
      <Header
        kicker={`${BREATHE_TITLE} · Breathe`}
        title="Your breathing session"
        lede="Follow the circle: it grows as you breathe in and gets smaller as you breathe out or hum. Stay comfortable, and stop whenever you want."
      />
      <SaveNote />
      <SafetyCard breathless={breathless} compact />
      <BreathingPlayer />
      <WeekCalendar />
      <section className="stack" aria-labelledby="bf-tech">
        <h2 id="bf-tech">The techniques</h2>
        {TECHNIQUES.map((technique) => (
          <details key={technique.id} className="lz-section">
            <summary>
              <span>{technique.title}</span>
            </summary>
            <div className="lz-section-body">
              <p>{technique.subtitle}</p>
              <ol>
                {technique.steps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
              <ul className="bf-science">
                {technique.science.map((item) => (
                  <li key={item.text}>
                    <EvidenceBadge level={item.level} /> {item.text}
                  </li>
                ))}
              </ul>
            </div>
          </details>
        ))}
      </section>
      <SafetyCard breathless={breathless} />
      <p className="library-disclaimer">{BREATHE_DISCLAIMER}</p>
    </div>
  );
}

// ---------- foods ----------

export function BreatheFoods() {
  const { ready, companion } = useBreathe();
  const [chosen, setChosen] = useState<string | null>(null);
  const exclusions = useMemo(() => [...companion.food.exclusions, ...companion.food.disliked], [companion.food]);
  if (!ready) return <p className="hint">Loading foods…</p>;
  const food = FOODS.find((item) => item.id === chosen) ?? null;
  const recipes = chosen ? RECIPES.filter((recipe) => recipe.foods.includes(chosen)) : RECIPES;
  const flagged = (ingredients: string[]) => exclusions.filter((word) => ingredients.join(" ").toLowerCase().includes(word));
  return (
    <div className="stack-lg bf">
      <Header
        kicker={`${BREATHE_TITLE} · Foods`}
        title="Foods for the nitrate pathway"
        lede="Many vegetables, especially leafy greens and beetroot, contain nitrate. Your body can turn it into nitric oxide with help from friendly bacteria in your mouth."
      />
      <section className="stack" aria-labelledby="bf-foods">
        <h2 id="bf-foods">Tap a vegetable</h2>
        <div className="bf-foods" role="group" aria-label="Nitrate-rich vegetables">
          {FOODS.map((item) => (
            <button key={item.id} type="button" className="bf-food" data-group={item.group} aria-pressed={chosen === item.id} onClick={() => setChosen(chosen === item.id ? null : item.id)}>
              {item.name}
            </button>
          ))}
        </div>
        {food ? (
          <div className="card stack" role="status">
            <h3>{food.name}</h3>
            <p>{food.tip}</p>
          </div>
        ) : (
          <p className="hint">Other good choices include mustard greens, chicory, carrots, and cauliflower.</p>
        )}
        <ul>
          {FOOD_TIPS.map((tip) => (
            <li key={tip}>{tip}</li>
          ))}
        </ul>
      </section>
      <section className="stack" aria-labelledby="bf-recipes">
        <h2 id="bf-recipes">{food ? `Simple ideas with ${food.name.toLowerCase()}` : "Simple meal ideas"}</h2>
        {recipes.length === 0 ? <p>No recipe here uses this one yet. Add it to a salad, soup, or sandwich.</p> : null}
        <div className="bf-cards">
          {recipes.map((recipe) => {
            const hits = flagged(recipe.ingredients);
            return (
              <article key={recipe.id} className="card stack">
                <h3>{recipe.title}</h3>
                <p className="hint">About {recipe.minutes} minutes</p>
                {hits.length > 0 ? <p className="alert">Contains something you excluded or dislike ({hits.join(", ")}). Swap it or skip this one.</p> : null}
                <h4>You need</h4>
                <ul>
                  {recipe.ingredients.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <h4>Steps</h4>
                <ol>
                  {recipe.steps.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
              </article>
            );
          })}
        </div>
        <p className="hint">
          Check every recipe against your own allergies. Your saved food choices are in <Link href="/food-plan/preferences">Food & Wellness</Link>.
        </p>
      </section>
      <section className="card stack">
        <h2>{ORAL_BACTERIA.title}</h2>
        <p>{ORAL_BACTERIA.text}</p>
        <p>
          <EvidenceBadge level={ORAL_BACTERIA.level} /> {ORAL_BACTERIA.mouthwash}
        </p>
      </section>
      <section className="card stack">
        <h2>Supplements and medicines</h2>
        <p>{SUPPLEMENT_NOTE}</p>
        <p>{MEDICINE_NOTE}</p>
      </section>
      <p className="library-disclaimer">{BREATHE_DISCLAIMER}</p>
    </div>
  );
}
