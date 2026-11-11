"use client";

import { ListenToSteps } from "@/components/voice/read-aloud";
import Image from "next/image";
import Link from "next/link";
import { Fragment, useState } from "react";
import { useT } from "@/components/locale-provider";
import { useWellness } from "@/components/wellness/use-wellness";
import { msg } from "@/lib/i18n/translate";
import { commitWellness } from "@/lib/wellness/client-store";
import {
  awareness,
  breadIntro,
  breadRecipe,
  breadRecipes,
  comparison,
  dailyChoices,
  disclaimer,
  gut,
  gutDays,
  gutSources,
  hiding,
  insolubleFoods,
  kingArthur,
  labelQuiz,
  labels,
  prebioticFoods,
  probioticFoods,
  sampleLabel,
  solubleFoods,
  sugarSources,
  teaspoonNote,
  teaspoons,
  type FoodCard,
  type NutritionSource,
} from "@/lib/nutrition/education";
import { upsertCheck } from "@/lib/wellness/storage";
import { NutritionStudio } from "@/components/nutrition/plate-views";
import { nutritionCss } from "@/components/nutrition/nutrition-css";

function NutritionStyles() {
  return <style>{nutritionCss}</style>;
}

function Sources({ items }: { items: readonly NutritionSource[] }) {
  const t = useT();
  return (
    <ul className={"nz-sources"}>
      {items.map((source) => (
        <li key={source.id}>
          <a href={source.url} target="_blank" rel="noopener noreferrer">
            {source.publisher}: {source.name}
          </a>
          . {t("Checked {date}.", { date: source.checked })}
        </li>
      ))}
    </ul>
  );
}

function Photo({ card, wide = false }: { card: { image: string; alt: string; width?: number; height?: number }; wide?: boolean }) {
  const t = useT();
  return (
    <div className={"nz-photoFrame"}>
      <Image
        src={card.image}
        alt={t(card.alt)}
        width={card.width ?? (wide ? 1152 : 1024)}
        height={card.height ?? (wide ? 864 : 1024)}
      />
    </div>
  );
}

function FoodGrid({ foods }: { foods: readonly FoodCard[] }) {
  const t = useT();
  return (
    <div className={`${"nz-grid"} ${"nz-three"}`}>
      {foods.map((food) => (
        <article key={food.id} className={"nz-panel"}>
          <Photo card={food} />
          <h3 className={"nz-cardTitle"}>{t(food.name)}</h3>
          <p>{t(food.note)}</p>
        </article>
      ))}
    </div>
  );
}

function NoteBox({ id, title, prompt, help }: { id: string; title: string; prompt: string; help: string }) {
  const wellness = useWellness();
  const existing = wellness.log.checks.find((item) => item.id === id);
  const [draft, setDraft] = useState<string | null>(null);
  const text = draft ?? existing?.reflection ?? "";
  const [status, setStatus] = useState<string | null>(null);
  const t = useT();

  function save() {
    if (wellness.sample) {
      setStatus(wellness.readOnlyMessage);
      return;
    }
    commitWellness(
      upsertCheck(wellness.log, {
        id,
        date: existing?.date ?? wellness.today,
        done: existing?.done ?? true,
        reflection: text,
      }),
    );
    setStatus(msg("Saved in this browser tab with your other check-ins."));
  }

  return (
    <div className={"nz-panel"}>
      <h3>{t(title)}</h3>
      <p>{t(help)}</p>
      {wellness.readOnlyMessage ? <p role="status">{t(wellness.readOnlyMessage)}</p> : null}
      <label className="field">
        <span>{t(prompt)}</span>
        <textarea value={text} maxLength={280} rows={3} onChange={(event) => setDraft(event.target.value)} />
      </label>
      <div className={"nz-actions"}>
        <button className="btn btn-primary" type="button" onClick={save} disabled={wellness.sample}>
          {t(labels.saveNote)}
        </button>
      </div>
      {status ? <p role="status">{t(status)}</p> : null}
    </div>
  );
}

function LabelQuiz() {
  const [picked, setPicked] = useState<Record<string, string>>({});
  const [shown, setShown] = useState(false);
  const score = labelQuiz.filter((question) => picked[question.id] === question.answer).length;
  const t = useT();

  return (
    <div className={"nz-panel"} id="label-practice">
      <h3>{t("A short label quiz")}</h3>
      <p>{t("Four questions about the lines on a label. The score stays in this tab.")}</p>
      {labelQuiz.map((question) => (
        <fieldset key={question.id} className="field">
          <legend>{t(question.prompt)}</legend>
          <div className={"nz-choices"}>
            {question.choices.map((choice) => {
              const selected = picked[question.id] === choice.id;
              const mark = shown && selected ? (choice.id === question.answer ? "nz-good" : "nz-miss") : "";
              return (
                <label key={choice.id} className={`${"nz-choice"} ${mark}`}>
                  <input
                    type="radio"
                    name={question.id}
                    value={choice.id}
                    checked={selected}
                    onChange={() =>
                      setPicked((current) => ({ ...current, [question.id]: choice.id }))
                    }
                  />
                  <span>{t(choice.label)}</span>
                </label>
              );
            })}
          </div>
          {shown ? <p>{t(question.because)}</p> : null}
        </fieldset>
      ))}
      <div className={"nz-actions"}>
        <button className="btn btn-primary" type="button" onClick={() => setShown(true)}>
          {t(labels.checkAnswers)}
        </button>
        <button
          className="btn btn-secondary"
          type="button"
          onClick={() => {
            setPicked({});
            setShown(false);
          }}
        >
          {t(labels.tryAgain)}
        </button>
      </div>
      {shown ? (
        <p role="status">
          {t("{score} of {total} match the label lesson. You can change an answer and check again.", { score, total: labelQuiz.length })}
        </p>
      ) : null}
    </div>
  );
}

function GutChallenge() {
  const wellness = useWellness();
  const existing = wellness.log.checks.find((item) => item.id === "gut-week-note");
  const [draft, setDraft] = useState<string | null>(null);
  const text = draft ?? existing?.reflection ?? "";
  const [status, setStatus] = useState<string | null>(null);
  const t = useT();

  function marked(id: string) {
    return wellness.log.checks.some((item) => item.id === id && item.done);
  }

  function toggle(id: string) {
    if (wellness.sample) {
      setStatus(wellness.readOnlyMessage);
      return;
    }
    const prior = wellness.log.checks.find((item) => item.id === id);
    commitWellness(
      upsertCheck(wellness.log, {
        id,
        date: prior?.date ?? wellness.today,
        done: prior ? !prior.done : true,
        reflection: prior?.reflection ?? "",
      }),
    );
  }

  function save() {
    if (wellness.sample) {
      setStatus(wellness.readOnlyMessage);
      return;
    }
    commitWellness(
      upsertCheck(wellness.log, {
        id: "gut-week-note",
        date: existing?.date ?? wellness.today,
        done: existing?.done ?? false,
        reflection: text,
      }),
    );
    setStatus(msg("Reflection saved in this browser tab."));
  }

  const count = gutDays.filter((day) => marked(day.id)).length;

  return (
    <div className={"nz-panel"} id="gut-challenge">
      <h3>{t(gut.challengeTitle)}</h3>
      <p>{t(gut.challengeIntro)}</p>
      {wellness.readOnlyMessage ? <p role="status">{t(wellness.readOnlyMessage)}</p> : null}
      <div className={"nz-grid"}>
        {gutDays.map((day) => (
          <button key={day.id} className={"nz-day"} type="button" aria-pressed={marked(day.id)} onClick={() => toggle(day.id)}>
            <strong>{t(day.title)}</strong>
            <span>{t(day.text)}</span>
            <span>{marked(day.id) ? t(labels.unmarkDay) : t(labels.markDay)}</span>
          </button>
        ))}
      </div>
      <p role="status">
        {t("{count} of {total} days marked in this browser tab. Marks are practice, not a result.", { count, total: gutDays.length })}
      </p>
      <label className="field">
        <span>{t(gut.reflectionLabel)}</span>
        <textarea value={text} maxLength={280} rows={3} onChange={(event) => setDraft(event.target.value)} />
      </label>
      <p className={"nz-note"}>{t(gut.reflectionHelp)}</p>
      <button className="btn btn-primary" type="button" onClick={save} disabled={wellness.sample}>
        {t(labels.saveReflection)}
      </button>
      {status ? <p role="status">{t(status)}</p> : null}
    </div>
  );
}

function GutSketch() {
  const t = useT();
  return (
    <svg className={"nz-sketch"} viewBox="0 0 320 180" role="img" aria-label={t(gut.illustrationLabel)}>
      <rect width="320" height="180" rx="24" fill="#f7f8ff" />
      <path
        d="M168 36c22 2 34 18 28 36-6 18-28 20-26 40 2 22 26 28 18 48-10 24-48 28-70 12"
        fill="none"
        stroke="#7136c8"
        strokeWidth="10"
        strokeLinecap="round"
      />
      <path
        d="M118 146c28 18 78 8 104-16 18-16 8-36-12-40"
        fill="none"
        stroke="#4295e8"
        strokeWidth="8"
        strokeLinecap="round"
      />
      <circle cx="186" cy="42" r="8" fill="#5725a8" />
    </svg>
  );
}

export function NutritionEducation() {
  const t = useT();
  return (
    <div className={"nz-wrap"}>
      <NutritionStyles />
      <NutritionStudio />
      <section className={"nz-panel"} id="daily-choices">
        <p className={"nz-kicker"}>{t("Added sugar")}</p>
        <h2>{t(dailyChoices.title)}</h2>
        <p>{t(dailyChoices.subtitle)}</p>
        <p>{t(dailyChoices.message)}</p>
        {dailyChoices.addedVersusNatural.map((paragraph) => (
          <p key={paragraph}>{t(paragraph)}</p>
        ))}
        {dailyChoices.sections.map((section) => (
          <article key={section.id} className={"nz-panel"}>
            <h3>{t(section.title)}</h3>
            <p>{t(section.body)}</p>
          </article>
        ))}
        <figure className={"nz-panel"}>
          <figcaption>{t(dailyChoices.diagram.caption)}</figcaption>
          <div className={"nz-flow"}>
            {dailyChoices.diagram.steps.map((step, index) => (
              <Fragment key={step}>
                {index > 0 ? (
                  <p className={"nz-then"} aria-hidden="true">
                    →
                  </p>
                ) : null}
                <p className={"nz-flowStep"}>{t(step)}</p>
              </Fragment>
            ))}
          </div>
          <p>{t(dailyChoices.diagram.note)}</p>
        </figure>
        <h3>{t(comparison.title)}</h3>
        <div className={"nz-compare"}>
          <article className={"nz-panel"}>
            <h3>{t(comparison.fdaTitle)}</h3>
            <p>{t(comparison.fda)}</p>
          </article>
          <article className={"nz-panel"}>
            <h3>{t(comparison.ahaTitle)}</h3>
            <p>{t(comparison.aha)}</p>
          </article>
        </div>
        <p>{t(comparison.intro)}</p>
        <table className={"nz-table"}>
          <caption>{t(teaspoonNote)}</caption>
          <thead>
            <tr>
              <th scope="col">{t("Added sugar")}</th>
              <th scope="col">{t("Kitchen picture")}</th>
            </tr>
          </thead>
          <tbody>
            {teaspoons.map((row) => (
              <tr key={row.grams}>
                <td>{t("{amount} g", { amount: row.grams.replace(" g", "") })}</td>
                <td>{t(row.spoons)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p>{t(dailyChoices.gradual)}</p>
        <Sources items={sugarSources} />
      </section>

      <section className={"nz-panel"} id="sugar-hiding">
        <h2>{t(hiding.title)}</h2>
        <p>{t(hiding.intro)}</p>
        <ul>
          {hiding.places.map((place) => (
            <li key={place}>{t(place)}</li>
          ))}
        </ul>
        {hiding.facts.map((fact) => (
          <p key={fact}>{t(fact)}</p>
        ))}
        <h3>{t("Names on the ingredient list")}</h3>
        <p>{t(hiding.namesIntro)}</p>
        <ul className={"nz-names"}>
          {hiding.names.map((name) => (
            <li key={name}>{t(name)}</li>
          ))}
        </ul>
        <figure className={"nz-labelSheet"} aria-label={t(sampleLabel.title)}>
          <figcaption>{t(sampleLabel.title)}</figcaption>
          <p className={"nz-labelProduct"}>{t(sampleLabel.product)}</p>
          {sampleLabel.rows.map((row) => (
            <p key={row.label} className={row.highlight ? "nz-labelAdded" : "nz-labelRow"}>
              <span>{t(row.label)}</span>
              <span>{t(row.value)}</span>
            </p>
          ))}
          <p>{t("Ingredients: {list}", { list: t(sampleLabel.ingredients) })}</p>
          <p>{t(sampleLabel.disclaimer)}</p>
        </figure>
        <p>{t(sampleLabel.read)}</p>
        <p>{t(hiding.compare)}</p>
        <LabelQuiz />
        <NoteBox id="added-sugar-awareness" title={awareness.title} prompt={awareness.prompt} help={awareness.help} />
      </section>

      <section className={"nz-wrap"} id="bake-bread">
        <div className={"nz-panel"}>
          <h2>{t(breadIntro.title)}</h2>
          <p>{t(breadIntro.body)}</p>
          <p>
            {t(kingArthur.note)}{" "}
            <a href={kingArthur.url} target="_blank" rel="noopener noreferrer">
              {t(kingArthur.name)}
            </a>
            .
          </p>
        </div>
        <div className={`${"nz-grid"} ${"nz-three"}`}>
          {breadRecipes.map((recipe) => (
            <article key={recipe.slug} className={"nz-panel"}>
              <Photo card={{ image: recipe.image, alt: recipe.imageAlt, width: recipe.width, height: recipe.height }} wide />
              <h3 className={"nz-cardTitle"}>{t(recipe.name)}</h3>
              <p>{t(recipe.description)}</p>
              <p className={"nz-meta"}>
                <span className={"nz-pill"}>{t(recipe.difficulty)}</span>
                <span className={"nz-pill"}>
                  {t(labels.addedSugarLabel)}: {t("{amount} g", { amount: 0 })}
                </span>
              </p>
              <Link className="btn btn-primary" href={`/academy/meals/${recipe.slug}`}>
                {t(labels.viewRecipe)}
              </Link>
              {recipe.starter ? (
                <Link href={`/academy/meals/${recipe.slug}#starter`}>{t(labels.starterLink)}</Link>
              ) : null}
            </article>
          ))}
        </div>
      </section>

      <section className={"nz-wrap"} id="feed-your-gut">
        <div className={"nz-panel"}>
          <p className={"nz-kicker"}>{t("Gut health")}</p>
          <h2>{t(gut.title)}</h2>
          <p>{t(gut.message)}</p>
          <GutSketch />
          <p className={"nz-note"}>{t(gut.illustrationLabel)}</p>
          {gut.microbiome.map((paragraph) => (
            <p key={paragraph}>{t(paragraph)}</p>
          ))}
        </div>
        <div className={"nz-panel"}>
          <h3>{t("Probiotics")}</h3>
          <p>{t(gut.probioticIntro)}</p>
          <p>{t(gut.probioticCaveat)}</p>
        </div>
        <FoodGrid foods={probioticFoods} />
        <div className={"nz-panel"}>
          <h3>{t("Prebiotics")}</h3>
          <p>{t(gut.prebioticIntro)}</p>
          <ul>
            {gut.distinguish.map((item) => (
              <li key={item}>{t(item)}</li>
            ))}
          </ul>
        </div>
        <FoodGrid foods={prebioticFoods} />
        <div className={"nz-panel"}>
          <h3>{t("Fiber")}</h3>
          <p>{t(gut.fiberIntro)}</p>
          <p>{t(gut.fiberReference)}</p>
          <h3>{t(gut.solubleTitle)}</h3>
          <p>{t(gut.solubleNote)}</p>
        </div>
        <FoodGrid foods={solubleFoods} />
        <div className={"nz-panel"}>
          <h3>{t(gut.insolubleTitle)}</h3>
          <p>{t(gut.insolubleNote)}</p>
        </div>
        <FoodGrid foods={insolubleFoods} />
        <div className={"nz-panel"}>
          <h3>{t(gut.habitsTitle)}</h3>
          <p>{t(gut.habitsIntro)}</p>
          <ol>
            {gut.habits.map((habit) => (
              <li key={habit}>{t(habit)}</li>
            ))}
          </ol>
        </div>
        <div className={"nz-panel"}>
          <h3>{t(gut.supplementsTitle)}</h3>
          <ul>
            {gut.supplements.map((item) => (
              <li key={item}>{t(item)}</li>
            ))}
          </ul>
        </div>
        <div className={"nz-panel"}>
          <h3>{t(gut.detoxTitle)}</h3>
          <p>{t(gut.detox)}</p>
        </div>
        <GutChallenge />
        <Sources items={gutSources} />
      </section>
      <p className={"nz-note"}>{t(disclaimer)}</p>
    </div>
  );
}

export function BreadRecipePage({ slug }: { slug: string }) {
  const t = useT();
  const recipe = breadRecipe(slug);
  if (!recipe) return null;

  function printRecipe() {
    document.querySelectorAll("details").forEach((item) => {
      item.open = true;
    });
    document.body.classList.add("nutrition-printing");
    const cleanup = () => {
      document.body.classList.remove("nutrition-printing");
      window.removeEventListener("afterprint", cleanup);
    };
    window.addEventListener("afterprint", cleanup);
    window.print();
  }

  return (
    <article className={"nz-wrap learn"}>
      <NutritionStyles />
      <p className={"nz-kicker"}>{t("Homemade bread")}</p>
      <h1>{t(recipe.name)}</h1>
      <Photo card={{ image: recipe.image, alt: recipe.imageAlt, width: recipe.width, height: recipe.height }} wide />
      <p>{t(recipe.description)}</p>
      <p className={"nz-meta"}>
        <span className={"nz-pill"}>{t(recipe.difficulty)}</span>
        <span className={"nz-pill"}>{t("Prep: {time}", { time: t(recipe.prep) })}</span>
        <span className={"nz-pill"}>{t("Bake: {time}", { time: t(recipe.bake) })}</span>
        <span className={"nz-pill"}>
          {t(labels.addedSugarLabel)}: {t("{amount} g", { amount: 0 })}
        </span>
      </p>
      <p>{t(recipe.makes)}</p>
      <p>{t(labels.weightFirst)}</p>
      <details className={"nz-fold"} open>
        <summary>{t(labels.ingredients)}</summary>
        <table className={"nz-table"}>
          <thead>
            <tr>
              <th scope="col">{t("Ingredient")}</th>
              <th scope="col">{t("US")}</th>
              <th scope="col">{t("Metric")}</th>
            </tr>
          </thead>
          <tbody>
            {recipe.ingredients.map((item) => (
              <tr key={item.item}>
                <td>{t(item.item)}</td>
                <td>{t(item.us)}</td>
                <td>{t(item.metric)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
      <ListenToSteps
        title={recipe.name}
        list={{ heading: "Ingredients", items: recipe.ingredients.map((item) => `${item.us} ${item.item}`) }}
        steps={recipe.steps}
        closing={recipe.serving}
      />
      <details className={"nz-fold"} open>
        <summary>{t(labels.steps)}</summary>
        <ol>
          {recipe.steps.map((step) => (
            <li key={step}>{t(step)}</li>
          ))}
        </ol>
      </details>
      <div className={"nz-panel"}>
        <h2>{t(labels.serving)}</h2>
        <ul>
          {recipe.serving.map((idea) => (
            <li key={idea}>{t(idea)}</li>
          ))}
        </ul>
      </div>
      <div className={"nz-panel"}>
        <h2>{t("Nutrition note")}</h2>
        <p>{t(recipe.nutritionNote)}</p>
      </div>
      {recipe.starter ? (
        <section className={"nz-panel"} id="starter">
          <h2>{t(recipe.starter.title)}</h2>
          <p>{t(recipe.starter.intro)}</p>
          <ol>
            {recipe.starter.steps.map((step) => (
              <li key={step}>{t(step)}</li>
            ))}
          </ol>
        </section>
      ) : null}
      <p>
        {t(kingArthur.note)}{" "}
        <a href={kingArthur.url} target="_blank" rel="noopener noreferrer">
          {t(kingArthur.name)}
        </a>
        .
      </p>
      <p className={"nz-note"}>{t(disclaimer)}</p>
      <div className={`${"nz-actions"} ${"nz-noPrint"}`}>
        <button className="btn btn-primary" type="button" onClick={printRecipe}>
          {t(labels.printRecipe)}
        </button>
        <Link className="btn btn-secondary" href="/academy/meals#bake-bread">
          {t(labels.allRecipes)}
        </Link>
        <Link href="/academy/meals">{t(labels.backToMeals)}</Link>
      </div>
    </article>
  );
}
