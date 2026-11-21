"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { useLocale, useT } from "@/components/locale-provider";
import { nutritionCss } from "@/components/nutrition/nutrition-css";
import { calorieCss } from "@/components/nutrition/calorie-css";
import { addIsoDays, localISODate } from "@/lib/dates";
import { LOCALE_META } from "@/lib/i18n/config";
import { searchLocal } from "@/lib/calories/local-foods";
import { parseGrams, scale, totals } from "@/lib/calories/math";
import { addItem, itemsFor, removeItem, updateItem } from "@/lib/calories/storage";
import { getCalorieServerSnapshot, getCalorieSnapshot, subscribeCalories, updateCalories } from "@/lib/calories/store";
import { MEALS, type FoodMatch, type FoodSource, type Meal, type PhotoGuess, type PlateItem, type Totals } from "@/lib/calories/types";

const MEAL_LABEL: Record<Meal, string> = { breakfast: "Breakfast", lunch: "Lunch", dinner: "Dinner", snack: "Snack" };
const SOURCE_LABEL: Record<FoodSource, string> = { "usda-local": "USDA", usda: "USDA", off: "Open Food Facts" };

function newId(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  }
}

function useNumber() {
  const { locale } = useLocale();
  return useMemo(() => {
    const format = new Intl.NumberFormat(LOCALE_META[locale].htmlLang, { maximumFractionDigits: 1 });
    return (value: number) => format.format(value);
  }, [locale]);
}

/** Shrink the photo to at most 1024 px and re-encode it as JPEG, which also drops its metadata such as location. */
async function shrinkPhoto(file: File): Promise<{ data: string; mimeType: "image/jpeg"; preview: string }> {
  const url = URL.createObjectURL(file);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const element = new Image();
      element.onload = () => resolve(element);
      element.onerror = () => reject(new Error("image"));
      element.src = url;
    });
    const ratio = Math.min(1, 1024 / Math.max(image.naturalWidth, image.naturalHeight));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(image.naturalWidth * ratio));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * ratio));
    const context = canvas.getContext("2d");
    if (!context) throw new Error("canvas");
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    const preview = canvas.toDataURL("image/jpeg", 0.8);
    return { data: preview.slice(preview.indexOf(",") + 1), mimeType: "image/jpeg", preview };
  } finally {
    URL.revokeObjectURL(url);
  }
}

function Macros({ value }: { value: Totals }) {
  const t = useT();
  const n = useNumber();
  return (
    <span className="cc-macros">
      <span>{t("Protein {grams} g", { grams: n(value.protein) })}</span>
      <span>{t("Fat {grams} g", { grams: n(value.fat) })}</span>
      <span>{t("Carbs {grams} g", { grams: n(value.carbs) })}</span>
    </span>
  );
}

type Pending = { food: FoodMatch; grams: string; fromPhoto: boolean };

function AddFood({ pending, meal, onCancel, onAdd }: { pending: Pending; meal: Meal; onCancel: () => void; onAdd: (grams: number) => void }) {
  const t = useT();
  const n = useNumber();
  const [grams, setGrams] = useState(pending.grams);
  const parsed = parseGrams(grams);
  const preview = parsed ? scale(pending.food.per100g, parsed) : null;
  const inputId = useId();
  return (
    <div className="cc-add" role="group" aria-label={t("Add a food")}>
      <p className="cc-addName">
        <strong>{pending.food.name}</strong>
        {pending.food.brand ? <span className="cc-muted"> · {pending.food.brand}</span> : null}
      </p>
      <p className="cc-muted">
        {t("{kcal} kcal per 100 g", { kcal: n(pending.food.per100g.kcal) })} · {SOURCE_LABEL[pending.food.source]}
      </p>
      <label className="field" htmlFor={inputId}>
        <span>{t("Grams")}</span>
        <input id={inputId} value={grams} inputMode="decimal" autoComplete="off" onChange={(event) => setGrams(event.target.value)} />
        {parsed === null ? <span className="field-error">{t("Enter grams from 1 to 3000.")}</span> : null}
      </label>
      {preview ? (
        <p className="cc-preview">
          <strong>{t("{kcal} kcal", { kcal: n(preview.kcal) })}</strong> <Macros value={preview} />
        </p>
      ) : null}
      <div className="nz-actions">
        <button className="btn btn-primary" type="button" disabled={parsed === null} onClick={() => parsed && onAdd(parsed)}>
          {t("Add to {meal}", { meal: t(MEAL_LABEL[meal]).toLowerCase() })}
        </button>
        <button className="btn btn-secondary" type="button" onClick={onCancel}>
          {t("Cancel")}
        </button>
      </div>
    </div>
  );
}

function ResultList({ items, onPick }: { items: FoodMatch[]; onPick: (food: FoodMatch) => void }) {
  const t = useT();
  const n = useNumber();
  return (
    <ul className="cc-results">
      {items.map((food) => (
        <li key={`${food.source}-${food.id}`}>
          <button type="button" className="cc-result" onClick={() => onPick(food)}>
            <span className="cc-resultName">
              {t(food.name)}
              {food.brand ? <span className="cc-muted"> · {food.brand}</span> : null}
            </span>
            <span className="cc-muted">
              {t("{kcal} kcal per 100 g", { kcal: n(food.per100g.kcal) })} · {SOURCE_LABEL[food.source]}
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}

type OnlineState =
  | { status: "idle" }
  | { status: "loading"; query: string }
  | { status: "done"; query: string; items: FoodMatch[]; failed: boolean }
  | { status: "error"; query: string; message: string };

function FoodSearch({ meal, query, setQuery, gramsHint, onAdd }: {
  meal: Meal;
  query: string;
  setQuery: (value: string) => void;
  gramsHint: { grams: number; fromPhoto: boolean } | null;
  onAdd: (food: FoodMatch, grams: number, fromPhoto: boolean) => void;
}) {
  const t = useT();
  const { locale } = useLocale();
  const [online, setOnline] = useState<OnlineState>({ status: "idle" });
  const [pending, setPending] = useState<Pending | null>(null);
  const local = useMemo(() => (query.trim().length >= 2 ? searchLocal(query, t, 6) : []), [query, t]);
  const inputId = useId();
  const latest = useRef("");

  const runOnline = useCallback(
    async (value: string) => {
      const q = value.trim();
      if (q.length < 2) return;
      latest.current = q;
      setOnline({ status: "loading", query: q });
      try {
        const response = await fetch(`/api/nutrition/foods?q=${encodeURIComponent(q)}&lang=${locale}`);
        const body = (await response.json()) as { results?: FoodMatch[]; answered?: string[]; error?: string };
        if (latest.current !== q) return;
        if (!response.ok) setOnline({ status: "error", query: q, message: body.error ?? "The request could not be read." });
        else setOnline({ status: "done", query: q, items: body.results ?? [], failed: (body.answered ?? []).length === 0 });
      } catch {
        if (latest.current === q) setOnline({ status: "done", query: q, items: [], failed: true });
      }
    },
    [locale],
  );

  // Search the online databases a moment after typing stops.
  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) return;
    const timer = window.setTimeout(() => void runOnline(q), 700);
    return () => window.clearTimeout(timer);
  }, [query, runOnline]);

  function pick(food: FoodMatch) {
    setPending({ food, grams: String(gramsHint?.grams ?? 100), fromPhoto: gramsHint?.fromPhoto ?? false });
  }

  const onlineItems = online.status === "done" && online.query === query.trim() ? online.items : [];
  const showOnline = query.trim().length >= 2;

  return (
    <div className="cc-box stack">
      <h3>{t("Find a food")}</h3>
      <form
        className="cc-searchRow"
        role="search"
        onSubmit={(event) => {
          event.preventDefault();
          void runOnline(query);
        }}
      >
        <label className="field" htmlFor={inputId}>
          <span>{t("Food name")}</span>
          <input
            id={inputId}
            type="search"
            placeholder={t("For example: avocado, buckwheat")}
            value={query}
            autoComplete="off"
            maxLength={60}
            onChange={(event) => {
              setQuery(event.target.value);
              setPending(null);
            }}
          />
        </label>
        <button className="btn btn-primary" type="submit">
          {t("Search")}
        </button>
      </form>
      {pending ? (
        <AddFood
          key={`${pending.food.source}-${pending.food.id}`}
          pending={pending}
          meal={meal}
          onCancel={() => setPending(null)}
          onAdd={(grams) => {
            onAdd(pending.food, grams, pending.fromPhoto);
            setPending(null);
          }}
        />
      ) : null}
      {showOnline && !pending ? (
        <>
          {local.length > 0 ? (
            <>
              <p className="cc-label">{t("Saved in lifeZoi (USDA, works offline)")}</p>
              <ResultList items={local} onPick={pick} />
            </>
          ) : null}
          <p className="cc-label">{t("Online databases")}</p>
          {online.status === "loading" ? <p className="cc-muted" role="status">{t("Searching…")}</p> : null}
          {online.status === "error" ? <p className="field-error">{t(online.message)}</p> : null}
          {online.status === "done" && online.query === query.trim() && online.failed ? (
            <p className="cc-muted" role="status">
              {t("The online food databases did not answer. You can still use the foods saved in lifeZoi.")}
            </p>
          ) : null}
          {online.status === "done" && online.query === query.trim() && !online.failed && onlineItems.length === 0 ? (
            <p className="cc-muted" role="status">{t("Nothing found online. Try a shorter or English name.")}</p>
          ) : null}
          {onlineItems.length > 0 ? <ResultList items={onlineItems} onPick={pick} /> : null}
        </>
      ) : null}
    </div>
  );
}

type PhotoState =
  | { status: "idle" }
  | { status: "reading"; preview: string | null }
  | { status: "done"; preview: string; rows: Array<PhotoGuess & { gramsText: string; keep: boolean }> }
  | { status: "error"; preview: string | null; message: string };

function PhotoPlate({ meal, enabled, onAddMany, onSearch }: {
  meal: Meal;
  enabled: boolean | null;
  onAddMany: (rows: Array<{ food: FoodMatch; grams: number }>) => void;
  onSearch: (guess: PhotoGuess) => void;
}) {
  const t = useT();
  const n = useNumber();
  const { locale } = useLocale();
  const [state, setState] = useState<PhotoState>({ status: "idle" });
  const cameraRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function read(file: File | undefined) {
    if (!file) return;
    setState({ status: "reading", preview: null });
    let photo: Awaited<ReturnType<typeof shrinkPhoto>>;
    try {
      photo = await shrinkPhoto(file);
    } catch {
      setState({ status: "error", preview: null, message: "Use a JPEG, PNG, or WebP photo." });
      return;
    }
    setState({ status: "reading", preview: photo.preview });
    try {
      const response = await fetch("/api/nutrition/photo", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ data: photo.data, mimeType: photo.mimeType, language: locale }),
      });
      const body = (await response.json()) as { ok?: boolean; guesses?: PhotoGuess[]; message?: string; error?: string };
      if (!response.ok || !body.ok) {
        setState({ status: "error", preview: photo.preview, message: body.message ?? body.error ?? "The photo could not be read just now. Search for each food instead." });
        return;
      }
      const guesses = body.guesses ?? [];
      if (guesses.length === 0) {
        setState({ status: "error", preview: photo.preview, message: "No food was recognised in this photo. Try another photo or search for each food." });
        return;
      }
      setState({
        status: "done",
        preview: photo.preview,
        rows: guesses.map((guess) => ({ ...guess, gramsText: String(guess.grams), keep: guess.match !== null })),
      });
    } catch {
      setState({ status: "error", preview: photo.preview, message: "The photo could not be read just now. Search for each food instead." });
    }
  }

  function change(index: number, patch: Partial<{ gramsText: string; keep: boolean }>) {
    setState((current) =>
      current.status === "done" ? { ...current, rows: current.rows.map((row, i) => (i === index ? { ...row, ...patch } : row)) } : current,
    );
  }

  const ready = state.status === "done" ? state.rows.filter((row) => row.keep && row.match && parseGrams(row.gramsText)) : [];
  const off = enabled === false;

  return (
    <div className="cc-box stack">
      <h3>{t("Photo of your plate")}</h3>
      <p className="cc-muted">
        {t("Take a photo with your phone or choose one from your computer. The free Google Gemini service names the foods and guesses the grams. The calories come from the food database, and you can change everything before it is saved.")}
      </p>
      <p className="cc-warn">
        {t("Photograph only the food: no faces, documents, or screens. Google may use photos sent to its free service to improve its products, and its reviewers may see them. lifeZoi does not save the photo.")}
      </p>
      {off ? <p className="cc-muted" role="status">{t("Photo recognition is not switched on here. Search for each food instead.")}</p> : null}
      <div className="nz-actions">
        <button className="btn btn-primary cc-camera" type="button" disabled={off || state.status === "reading"} onClick={() => cameraRef.current?.click()}>
          {t("Take a photo")}
        </button>
        <button className="btn btn-secondary" type="button" disabled={off || state.status === "reading"} onClick={() => fileRef.current?.click()}>
          {t("Choose a photo")}
        </button>
      </div>
      <input
        ref={cameraRef}
        className="cc-hidden"
        type="file"
        accept="image/*"
        capture="environment"
        tabIndex={-1}
        aria-hidden="true"
        onChange={(event) => {
          void read(event.target.files?.[0]);
          event.target.value = "";
        }}
      />
      <input
        ref={fileRef}
        className="cc-hidden"
        type="file"
        accept="image/jpeg,image/png,image/webp,image/*"
        tabIndex={-1}
        aria-hidden="true"
        onChange={(event) => {
          void read(event.target.files?.[0]);
          event.target.value = "";
        }}
      />
      {state.status !== "idle" && "preview" in state && state.preview ? (
        // A data URL made in this browser; it is not uploaded anywhere else.
        // eslint-disable-next-line @next/next/no-img-element
        <img className="cc-photo" src={state.preview} alt={t("Your photo")} />
      ) : null}
      {state.status === "reading" ? <p role="status">{t("Reading the photo…")}</p> : null}
      {state.status === "error" ? <p className="field-error" role="status">{t(state.message)}</p> : null}
      {state.status === "done" ? (
        <div className="stack">
          <p className="cc-label">{t("Check what was found")}</p>
          <ul className="cc-guesses">
            {state.rows.map((row, index) => {
              const grams = parseGrams(row.gramsText);
              const part = row.match && grams ? scale(row.match.per100g, grams) : null;
              return (
                <li key={`${row.name}-${index}`} className="cc-guess">
                  <label className="cc-check">
                    <input type="checkbox" checked={row.keep} disabled={!row.match} onChange={(event) => change(index, { keep: event.target.checked })} />
                    <span>
                      <strong>{row.label}</strong>
                      <br />
                      {row.match ? (
                        <span className="cc-muted">
                          {t("Matched to {food}", { food: t(row.match.name) })} · {t("{kcal} kcal per 100 g", { kcal: n(row.match.per100g.kcal) })}
                        </span>
                      ) : (
                        <span className="cc-muted">{t("No close match in the saved foods.")}</span>
                      )}
                    </span>
                  </label>
                  <label className="field cc-gramsField">
                    <span>{t("Grams")}</span>
                    <input value={row.gramsText} inputMode="decimal" onChange={(event) => change(index, { gramsText: event.target.value })} />
                    {grams === null ? <span className="field-error">{t("Enter grams from 1 to 3000.")}</span> : null}
                  </label>
                  {part ? <p className="cc-muted">{t("{kcal} kcal", { kcal: n(part.kcal) })}</p> : null}
                  <button className="btn btn-secondary" type="button" onClick={() => onSearch({ ...row, grams: grams ?? row.grams })}>
                    {row.match ? t("Choose another food") : t("Search for this food")}
                  </button>
                </li>
              );
            })}
          </ul>
          <div className="nz-actions">
            <button
              className="btn btn-primary"
              type="button"
              disabled={ready.length === 0}
              onClick={() => {
                onAddMany(ready.flatMap((row) => (row.match ? [{ food: row.match, grams: parseGrams(row.gramsText) ?? row.grams }] : [])));
                setState({ status: "idle" });
              }}
            >
              {t("Add {count} ticked foods to {meal}", { count: ready.length, meal: t(MEAL_LABEL[meal]).toLowerCase() })}
            </button>
            <button className="btn btn-secondary" type="button" onClick={() => setState({ status: "idle" })}>
              {t("Discard photo")}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ItemRow({ item, onGrams, onMeal, onDelete }: {
  item: PlateItem;
  onGrams: (grams: number) => void;
  onMeal: (meal: Meal) => void;
  onDelete: () => void;
}) {
  const t = useT();
  const n = useNumber();
  const [grams, setGrams] = useState(String(item.grams));
  const parsed = parseGrams(grams);
  const part = scale(item.per100g, item.grams);
  const gramsId = useId();
  const mealId = useId();
  return (
    <li className="cc-item">
      <div className="cc-itemHead">
        <p className="cc-itemName">
          <strong>{t(item.name)}</strong>
          {item.fromPhoto ? <span className="nz-pill cc-pill">{t("From photo")}</span> : null}
        </p>
        <p className="cc-itemKcal">{t("{kcal} kcal", { kcal: n(part.kcal) })}</p>
      </div>
      <Macros value={part} />
      <div className="cc-itemEdit">
        <label className="field" htmlFor={gramsId}>
          <span>{t("Grams")}</span>
          <input
            id={gramsId}
            value={grams}
            inputMode="decimal"
            onChange={(event) => {
              setGrams(event.target.value);
              const next = parseGrams(event.target.value);
              if (next) onGrams(next);
            }}
          />
          {parsed === null ? <span className="field-error">{t("Enter grams from 1 to 3000.")}</span> : null}
        </label>
        <label className="field" htmlFor={mealId}>
          <span>{t("Meal")}</span>
          <select id={mealId} value={item.meal} onChange={(event) => onMeal(event.target.value as Meal)}>
            {MEALS.map((meal) => (
              <option key={meal} value={meal}>
                {t(MEAL_LABEL[meal])}
              </option>
            ))}
          </select>
        </label>
        <button className="btn btn-secondary cc-delete" type="button" onClick={onDelete} aria-label={t("Delete {food}", { food: t(item.name) })}>
          {t("Delete")}
        </button>
      </div>
    </li>
  );
}

const noSubscribe = () => () => {};

function mealForNow(): Meal {
  const hour = new Date().getHours();
  return hour < 11 ? "breakfast" : hour < 16 ? "lunch" : hour < 21 ? "dinner" : "snack";
}

export function CalorieCounter() {
  const t = useT();
  const n = useNumber();
  const { locale } = useLocale();
  const log = useSyncExternalStore(subscribeCalories, getCalorieSnapshot, getCalorieServerSnapshot);
  const today = useSyncExternalStore(noSubscribe, localISODate, () => "");
  const defaultMeal = useSyncExternalStore(noSubscribe, mealForNow, () => "breakfast" as Meal);
  const [chosenDay, setDay] = useState<string | null>(null);
  const [chosenMeal, setMeal] = useState<Meal | null>(null);
  const day = chosenDay ?? today;
  const meal = chosenMeal ?? defaultMeal;
  const [query, setQuery] = useState("");
  const [gramsHint, setGramsHint] = useState<{ grams: number; fromPhoto: boolean } | null>(null);
  const [photoEnabled, setPhotoEnabled] = useState<boolean | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/nutrition/photo")
      .then((response) => (response.ok ? response.json() : { configured: false }))
      .then((body: { configured?: boolean }) => active && setPhotoEnabled(Boolean(body.configured)))
      .catch(() => active && setPhotoEnabled(false));
    return () => {
      active = false;
    };
  }, []);

  const items = day ? itemsFor(log, day) : [];
  const dayTotals = totals(items);
  const dayLabel = useMemo(() => {
    if (!day) return "";
    const date = new Date(`${day}T12:00:00`);
    return new Intl.DateTimeFormat(LOCALE_META[locale].htmlLang, { weekday: "long", day: "numeric", month: "long" }).format(date);
  }, [day, locale]);

  function add(food: FoodMatch, grams: number, fromPhoto: boolean) {
    if (!day) return;
    const item: PlateItem = {
      id: newId(),
      meal,
      name: food.brand ? `${food.name} (${food.brand})` : food.name,
      source: food.source,
      sourceRef: food.id,
      sourceUrl: food.url,
      grams,
      per100g: food.per100g,
      fromPhoto,
    };
    updateCalories((current) => addItem(current, day, item));
    setGramsHint(null);
    setQuery("");
  }

  return (
    <section className="nz-panel cc" id="calorie-counter" aria-labelledby="calorie-counter-title">
      <style>{nutritionCss + calorieCss}</style>
      <p className="nz-kicker">{t("Calorie counter")}</p>
      <h2 id="calorie-counter-title">{t("What is on your plate today")}</h2>
      <p>
        {t("Search for each food, or take a photo of your plate, then enter the grams. lifeZoi adds up calories, protein, fat, and carbohydrates for each meal and for the day.")}
      </p>

      <div className="cc-dayBar">
        <button className="btn btn-secondary" type="button" onClick={() => setDay(addIsoDays(day, -1))} aria-label={t("Previous day")}>
          ‹
        </button>
        <p className="cc-day" aria-live="polite">
          <strong>{day === today ? t("Today") : dayLabel}</strong>
          {day === today ? <span className="cc-muted"> · {dayLabel}</span> : null}
        </p>
        <button className="btn btn-secondary" type="button" disabled={!day || day >= today} onClick={() => setDay(addIsoDays(day, 1))} aria-label={t("Next day")}>
          ›
        </button>
      </div>

      <div className="cc-total" role="group" aria-label={t("Daily total")}>
        <p className="cc-label">{t("Daily total")}</p>
        <p className="cc-totalKcal">{t("{kcal} kcal", { kcal: n(dayTotals.kcal) })}</p>
        <Macros value={dayTotals} />
        <p className="cc-muted">{t("{count} foods, {grams} g in all", { count: items.length, grams: n(dayTotals.grams) })}</p>
      </div>

      <fieldset className="cc-meals">
        <legend className="cc-label">{t("Add to which meal?")}</legend>
        <div className="cc-mealButtons">
          {MEALS.map((item) => (
            <button key={item} type="button" className="nz-pick cc-mealPick" aria-pressed={meal === item} onClick={() => setMeal(item)}>
              {t(MEAL_LABEL[item])}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="cc-addArea">
        <div ref={searchRef}>
          <FoodSearch meal={meal} query={query} setQuery={setQuery} gramsHint={gramsHint} onAdd={add} />
        </div>
        <PhotoPlate
          meal={meal}
          enabled={photoEnabled}
          onAddMany={(rows) => rows.forEach((row) => add(row.food, row.grams, true))}
          onSearch={(guess) => {
            setQuery(guess.name);
            setGramsHint({ grams: guess.grams, fromPhoto: true });
            searchRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
          }}
        />
      </div>

      <div className="stack">
        {items.length === 0 ? <p className="cc-empty">{t("Nothing recorded for this day yet.")}</p> : null}
        {MEALS.map((group) => {
          const mealItems = items.filter((item) => item.meal === group);
          if (mealItems.length === 0) return null;
          const sub = totals(mealItems);
          return (
            <div key={group} className="cc-mealBlock">
              <div className="cc-mealHead">
                <h3>{t(MEAL_LABEL[group])}</h3>
                <p>
                  <strong>{t("{kcal} kcal", { kcal: n(sub.kcal) })}</strong>
                </p>
              </div>
              <Macros value={sub} />
              <ul className="cc-items">
                {mealItems.map((item) => (
                  <ItemRow
                    key={item.id}
                    item={item}
                    onGrams={(grams) => updateCalories((current) => updateItem(current, day, item.id, { grams }))}
                    onMeal={(next) => updateCalories((current) => updateItem(current, day, item.id, { meal: next }))}
                    onDelete={() => updateCalories((current) => removeItem(current, day, item.id))}
                  />
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      <p className="nz-note">
        {t("The numbers are each database's published values per 100 g, scaled to your grams. Packaged foods differ by brand, and grams guessed from a photo are rough, so check them. This is a record of what you ate, not a target or medical advice.")}
      </p>
      <p className="nz-note">
        {t("Your food diary is kept in this browser on this device, under your account. It is not sent to the food databases or with the photo.")}
      </p>
      <ul className="nz-sources">
        <li>
          <a href="https://fdc.nal.usda.gov/" target="_blank" rel="noopener noreferrer">
            USDA FoodData Central
          </a>
        </li>
        <li>
          <a href="https://world.openfoodfacts.org/" target="_blank" rel="noopener noreferrer">
            Open Food Facts
          </a>
          {" "}
          {t("(open database, ODbL licence)")}
        </li>
      </ul>
    </section>
  );
}
