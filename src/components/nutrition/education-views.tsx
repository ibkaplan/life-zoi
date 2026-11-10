"use client";

import { ListenToSteps } from "@/components/voice/read-aloud";
import Image from "next/image";
import Link from "next/link";
import { Fragment, useState } from "react";
import { useWellness } from "@/components/wellness/use-wellness";
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
  return (
    <ul className={"nz-sources"}>
      {items.map((source) => (
        <li key={source.id}>
          <a href={source.url} target="_blank" rel="noopener noreferrer">
            {source.publisher}: {source.name}
          </a>
          . Checked {source.checked}.
        </li>
      ))}
    </ul>
  );
}

function Photo({ card, wide = false }: { card: { image: string; alt: string; width?: number; height?: number }; wide?: boolean }) {
  return (
    <div className={"nz-photoFrame"}>
      <Image
        src={card.image}
        alt={card.alt}
        width={card.width ?? (wide ? 1152 : 1024)}
        height={card.height ?? (wide ? 864 : 1024)}
      />
    </div>
  );
}

function FoodGrid({ foods }: { foods: readonly FoodCard[] }) {
  return (
    <div className={`${"nz-grid"} ${"nz-three"}`}>
      {foods.map((food) => (
        <article key={food.id} className={"nz-panel"}>
          <Photo card={food} />
          <h3 className={"nz-cardTitle"}>{food.name}</h3>
          <p>{food.note}</p>
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
    setStatus("Saved in this browser tab with your other check-ins.");
  }

  return (
    <div className={"nz-panel"}>
      <h3>{title}</h3>
      <p>{help}</p>
      {wellness.readOnlyMessage ? <p role="status">{wellness.readOnlyMessage}</p> : null}
      <label className="field">
        <span>{prompt}</span>
        <textarea value={text} maxLength={280} rows={3} onChange={(event) => setDraft(event.target.value)} />
      </label>
      <div className={"nz-actions"}>
        <button className="btn btn-primary" type="button" onClick={save} disabled={wellness.sample}>
          {labels.saveNote}
        </button>
      </div>
      {status ? <p role="status">{status}</p> : null}
    </div>
  );
}

function LabelQuiz() {
  const [picked, setPicked] = useState<Record<string, string>>({});
  const [shown, setShown] = useState(false);
  const score = labelQuiz.filter((question) => picked[question.id] === question.answer).length;

  return (
    <div className={"nz-panel"} id="label-practice">
      <h3>A short label quiz</h3>
      <p>Four questions about the lines on a label. The score stays in this tab.</p>
      {labelQuiz.map((question) => (
        <fieldset key={question.id} className="field">
          <legend>{question.prompt}</legend>
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
                  <span>{choice.label}</span>
                </label>
              );
            })}
          </div>
          {shown ? <p>{question.because}</p> : null}
        </fieldset>
      ))}
      <div className={"nz-actions"}>
        <button className="btn btn-primary" type="button" onClick={() => setShown(true)}>
          {labels.checkAnswers}
        </button>
        <button
          className="btn btn-secondary"
          type="button"
          onClick={() => {
            setPicked({});
            setShown(false);
          }}
        >
          {labels.tryAgain}
        </button>
      </div>
      {shown ? (
        <p role="status">
          {score} of {labelQuiz.length} match the label lesson. You can change an answer and check again.
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
    setStatus("Reflection saved in this browser tab.");
  }

  const count = gutDays.filter((day) => marked(day.id)).length;

  return (
    <div className={"nz-panel"} id="gut-challenge">
      <h3>{gut.challengeTitle}</h3>
      <p>{gut.challengeIntro}</p>
      {wellness.readOnlyMessage ? <p role="status">{wellness.readOnlyMessage}</p> : null}
      <div className={"nz-grid"}>
        {gutDays.map((day) => (
          <button key={day.id} className={"nz-day"} type="button" aria-pressed={marked(day.id)} onClick={() => toggle(day.id)}>
            <strong>{day.title}</strong>
            <span>{day.text}</span>
            <span>{marked(day.id) ? labels.unmarkDay : labels.markDay}</span>
          </button>
        ))}
      </div>
      <p role="status">
        {count} of {gutDays.length} days marked in this browser tab. Marks are practice, not a result.
      </p>
      <label className="field">
        <span>{gut.reflectionLabel}</span>
        <textarea value={text} maxLength={280} rows={3} onChange={(event) => setDraft(event.target.value)} />
      </label>
      <p className={"nz-note"}>{gut.reflectionHelp}</p>
      <button className="btn btn-primary" type="button" onClick={save} disabled={wellness.sample}>
        {labels.saveReflection}
      </button>
      {status ? <p role="status">{status}</p> : null}
    </div>
  );
}

function GutSketch() {
  return (
    <svg className={"nz-sketch"} viewBox="0 0 320 180" role="img" aria-label={gut.illustrationLabel}>
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
  return (
    <div className={"nz-wrap"}>
      <NutritionStyles />
      <NutritionStudio />
      <section className={"nz-panel"} id="daily-choices">
        <p className={"nz-kicker"}>Added sugar</p>
        <h2>{dailyChoices.title}</h2>
        <p>{dailyChoices.subtitle}</p>
        <p>{dailyChoices.message}</p>
        {dailyChoices.addedVersusNatural.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
        {dailyChoices.sections.map((section) => (
          <article key={section.id} className={"nz-panel"}>
            <h3>{section.title}</h3>
            <p>{section.body}</p>
          </article>
        ))}
        <figure className={"nz-panel"}>
          <figcaption>{dailyChoices.diagram.caption}</figcaption>
          <div className={"nz-flow"}>
            {dailyChoices.diagram.steps.map((step, index) => (
              <Fragment key={step}>
                {index > 0 ? (
                  <p className={"nz-then"} aria-hidden="true">
                    →
                  </p>
                ) : null}
                <p className={"nz-flowStep"}>{step}</p>
              </Fragment>
            ))}
          </div>
          <p>{dailyChoices.diagram.note}</p>
        </figure>
        <h3>{comparison.title}</h3>
        <div className={"nz-compare"}>
          <article className={"nz-panel"}>
            <h3>{comparison.fdaTitle}</h3>
            <p>{comparison.fda}</p>
          </article>
          <article className={"nz-panel"}>
            <h3>{comparison.ahaTitle}</h3>
            <p>{comparison.aha}</p>
          </article>
        </div>
        <p>{comparison.intro}</p>
        <table className={"nz-table"}>
          <caption>{teaspoonNote}</caption>
          <thead>
            <tr>
              <th scope="col">Added sugar</th>
              <th scope="col">Kitchen picture</th>
            </tr>
          </thead>
          <tbody>
            {teaspoons.map((row) => (
              <tr key={row.grams}>
                <td>{row.grams}</td>
                <td>{row.spoons}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p>{dailyChoices.gradual}</p>
        <Sources items={sugarSources} />
      </section>

      <section className={"nz-panel"} id="sugar-hiding">
        <h2>{hiding.title}</h2>
        <p>{hiding.intro}</p>
        <ul>
          {hiding.places.map((place) => (
            <li key={place}>{place}</li>
          ))}
        </ul>
        {hiding.facts.map((fact) => (
          <p key={fact}>{fact}</p>
        ))}
        <h3>Names on the ingredient list</h3>
        <p>{hiding.namesIntro}</p>
        <ul className={"nz-names"}>
          {hiding.names.map((name) => (
            <li key={name}>{name}</li>
          ))}
        </ul>
        <figure className={"nz-labelSheet"} aria-label={sampleLabel.title}>
          <figcaption>{sampleLabel.title}</figcaption>
          <p className={"nz-labelProduct"}>{sampleLabel.product}</p>
          {sampleLabel.rows.map((row) => (
            <p key={row.label} className={row.highlight ? "nz-labelAdded" : "nz-labelRow"}>
              <span>{row.label}</span>
              <span>{row.value}</span>
            </p>
          ))}
          <p>Ingredients: {sampleLabel.ingredients}</p>
          <p>{sampleLabel.disclaimer}</p>
        </figure>
        <p>{sampleLabel.read}</p>
        <p>{hiding.compare}</p>
        <LabelQuiz />
        <NoteBox id="added-sugar-awareness" title={awareness.title} prompt={awareness.prompt} help={awareness.help} />
      </section>

      <section className={"nz-wrap"} id="bake-bread">
        <div className={"nz-panel"}>
          <h2>{breadIntro.title}</h2>
          <p>{breadIntro.body}</p>
          <p>
            {kingArthur.note}{" "}
            <a href={kingArthur.url} target="_blank" rel="noopener noreferrer">
              {kingArthur.name}
            </a>
            .
          </p>
        </div>
        <div className={`${"nz-grid"} ${"nz-three"}`}>
          {breadRecipes.map((recipe) => (
            <article key={recipe.slug} className={"nz-panel"}>
              <Photo card={{ image: recipe.image, alt: recipe.imageAlt, width: recipe.width, height: recipe.height }} wide />
              <h3 className={"nz-cardTitle"}>{recipe.name}</h3>
              <p>{recipe.description}</p>
              <p className={"nz-meta"}>
                <span className={"nz-pill"}>{recipe.difficulty}</span>
                <span className={"nz-pill"}>
                  {labels.addedSugarLabel}: {recipe.addedSugar}
                </span>
              </p>
              <Link className="btn btn-primary" href={`/academy/meals/${recipe.slug}`}>
                {labels.viewRecipe}
              </Link>
              {recipe.starter ? (
                <Link href={`/academy/meals/${recipe.slug}#starter`}>{labels.starterLink}</Link>
              ) : null}
            </article>
          ))}
        </div>
      </section>

      <section className={"nz-wrap"} id="feed-your-gut">
        <div className={"nz-panel"}>
          <p className={"nz-kicker"}>Gut health</p>
          <h2>{gut.title}</h2>
          <p>{gut.message}</p>
          <GutSketch />
          <p className={"nz-note"}>{gut.illustrationLabel}</p>
          {gut.microbiome.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
        <div className={"nz-panel"}>
          <h3>Probiotics</h3>
          <p>{gut.probioticIntro}</p>
          <p>{gut.probioticCaveat}</p>
        </div>
        <FoodGrid foods={probioticFoods} />
        <div className={"nz-panel"}>
          <h3>Prebiotics</h3>
          <p>{gut.prebioticIntro}</p>
          <ul>
            {gut.distinguish.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <FoodGrid foods={prebioticFoods} />
        <div className={"nz-panel"}>
          <h3>Fiber</h3>
          <p>{gut.fiberIntro}</p>
          <p>{gut.fiberReference}</p>
          <h3>{gut.solubleTitle}</h3>
          <p>{gut.solubleNote}</p>
        </div>
        <FoodGrid foods={solubleFoods} />
        <div className={"nz-panel"}>
          <h3>{gut.insolubleTitle}</h3>
          <p>{gut.insolubleNote}</p>
        </div>
        <FoodGrid foods={insolubleFoods} />
        <div className={"nz-panel"}>
          <h3>{gut.habitsTitle}</h3>
          <p>{gut.habitsIntro}</p>
          <ol>
            {gut.habits.map((habit) => (
              <li key={habit}>{habit}</li>
            ))}
          </ol>
        </div>
        <div className={"nz-panel"}>
          <h3>{gut.supplementsTitle}</h3>
          <ul>
            {gut.supplements.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div className={"nz-panel"}>
          <h3>{gut.detoxTitle}</h3>
          <p>{gut.detox}</p>
        </div>
        <GutChallenge />
        <Sources items={gutSources} />
      </section>
      <p className={"nz-note"}>{disclaimer}</p>
    </div>
  );
}

export function BreadRecipePage({ slug }: { slug: string }) {
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
      <p className={"nz-kicker"}>Homemade bread</p>
      <h1>{recipe.name}</h1>
      <Photo card={{ image: recipe.image, alt: recipe.imageAlt, width: recipe.width, height: recipe.height }} wide />
      <p>{recipe.description}</p>
      <p className={"nz-meta"}>
        <span className={"nz-pill"}>{recipe.difficulty}</span>
        <span className={"nz-pill"}>Prep: {recipe.prep}</span>
        <span className={"nz-pill"}>Bake: {recipe.bake}</span>
        <span className={"nz-pill"}>
          {labels.addedSugarLabel}: {recipe.addedSugar}
        </span>
      </p>
      <p>{recipe.makes}</p>
      <p>{labels.weightFirst}</p>
      <details className={"nz-fold"} open>
        <summary>{labels.ingredients}</summary>
        <table className={"nz-table"}>
          <thead>
            <tr>
              <th scope="col">Ingredient</th>
              <th scope="col">US</th>
              <th scope="col">Metric</th>
            </tr>
          </thead>
          <tbody>
            {recipe.ingredients.map((item) => (
              <tr key={item.item}>
                <td>{item.item}</td>
                <td>{item.us}</td>
                <td>{item.metric}</td>
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
        <summary>{labels.steps}</summary>
        <ol>
          {recipe.steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </details>
      <div className={"nz-panel"}>
        <h2>{labels.serving}</h2>
        <ul>
          {recipe.serving.map((idea) => (
            <li key={idea}>{idea}</li>
          ))}
        </ul>
      </div>
      <div className={"nz-panel"}>
        <h2>Nutrition note</h2>
        <p>{recipe.nutritionNote}</p>
      </div>
      {recipe.starter ? (
        <section className={"nz-panel"} id="starter">
          <h2>{recipe.starter.title}</h2>
          <p>{recipe.starter.intro}</p>
          <ol>
            {recipe.starter.steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </section>
      ) : null}
      <p>
        {kingArthur.note}{" "}
        <a href={kingArthur.url} target="_blank" rel="noopener noreferrer">
          {kingArthur.name}
        </a>
        .
      </p>
      <p className={"nz-note"}>{disclaimer}</p>
      <div className={`${"nz-actions"} ${"nz-noPrint"}`}>
        <button className="btn btn-primary" type="button" onClick={printRecipe}>
          {labels.printRecipe}
        </button>
        <Link className="btn btn-secondary" href="/academy/meals#bake-bread">
          {labels.allRecipes}
        </Link>
        <Link href="/academy/meals">{labels.backToMeals}</Link>
      </div>
    </article>
  );
}
