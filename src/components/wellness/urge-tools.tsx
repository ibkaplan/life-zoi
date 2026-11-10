"use client";

import { useState } from "react";
import { useT } from "@/components/locale-provider";
import { msg } from "@/lib/i18n/translate";
import { ReadOnlyNote, WellnessSources } from "@/components/wellness/bits";
import { SupportNotice } from "@/components/wellness/urge-bits";
import { useWellness } from "@/components/wellness/use-wellness";
import { EXAMPLE_MOMENT_STORY, MOMENT_CATEGORY_COPY, MOMENT_FILTER_COPY, MOMENT_IDEAS, buildMomentPlan } from "@/lib/wellness/moments";
import type { Translate } from "@/lib/i18n/translate";
import {
  CHOICE_LABELS,
  FACTOR_LABELS,
  SUPPORT_LABELS,
} from "@/lib/wellness/urges";
import type {
  MomentCategory,
  MomentFilter,
  MomentMinutes,
  MomentStatus,
  NextChoice,
  SupportFlag,
  UrgeFactor,
} from "@/lib/wellness/types";
import { MOMENT_FILTERS, MOMENT_MINUTES, NEXT_CHOICES, SUPPORT_FLAGS, URGE_FACTORS } from "@/lib/wellness/types";

const MOMENT_STATUS_LABELS: Record<string, string> = {
  started: msg("started"),
  done: msg("done"),
  postponed: msg("postponed"),
};

/** A plan's detail joins several ideas as "Title. Detail." Each idea is translated in place. */
function momentDetail(t: Translate, detail: string): string {
  return MOMENT_IDEAS.reduce(
    (text, idea) => text.replace(`${idea.title}. ${idea.detail}`, `${t(idea.title)}. ${t(idea.detail)}`),
    detail,
  );
}

/** The generated prompt is a list of chosen labels joined by commas. */
function momentPrompt(t: Translate, prompt: string): string {
  return prompt
    .split(", ")
    .map((part) => t(part))
    .join(", ");
}

const emptyUrge = {
  time: "",
  want: "",
  feeling: "",
  before: "",
  intensity: "5",
  factors: [] as UrgeFactor[],
  choice: "" as NextChoice | "",
  choiceNote: "",
  breaths: false,
  pauseMinutes: 0 as 0 | 5 | 10,
  outcome: "",
  supportFlags: [] as SupportFlag[],
};

export function UnderstandView() {
  const t = useT();
  return (
    <UrgeCapture
      kicker={t("Understand your urge")}
      title={t("Name what is happening")}
      lede={t("Record the want, the time, the feeling, what happened before, how strong it feels from 1 to 10, and what you chose. A record is not a diagnosis, and one note is not labeled emotional eating for you.")}
    />
  );
}

export function PauseView() {
  const t = useT();
  return (
    <UrgeCapture
      kicker={t("Pause — breathe — choose")}
      title={t("A short pause, only when it is safe")}
      lede={t("Name the craving and the trigger, rate the intensity, take a few slow breaths if you want, and pause 5 or 10 minutes only when waiting is safe. Do not delay food you need. Then choose the next action and, if you want, record what happened.")}
      emphasizePause
    />
  );
}

function UrgeCapture({
  kicker,
  title,
  lede,
  emphasizePause = false,
}: {
  kicker: string;
  title: string;
  lede: string;
  emphasizePause?: boolean;
}) {
  const t = useT();
  const wellness = useWellness();
  const [draft, setDraft] = useState(emptyUrge);
  const [message, setMessage] = useState<string | null>(null);
  const intensity = Number(draft.intensity);

  return (
    <div className="learn stack-lg">
      <p className="kicker">{kicker}</p>
      <h1>{title}</h1>
      <p className="lede">{lede}</p>
      <ReadOnlyNote message={wellness.readOnlyMessage} />
      <form
        className="card stack"
        onSubmit={(event) => {
          event.preventDefault();
          if (!Number.isInteger(intensity) || intensity < 1 || intensity > 10) {
            setMessage(t("Intensity is a whole number from 1 to 10."));
            return;
          }
          setMessage(
            wellness.saveUrge({
              time: draft.time,
              want: draft.want,
              feeling: draft.feeling,
              before: draft.before,
              intensity,
              factors: draft.factors,
              choice: draft.choice,
              choiceNote: draft.choiceNote,
              breaths: draft.breaths,
              pauseMinutes: draft.pauseMinutes,
              outcome: draft.outcome,
              supportFlags: draft.supportFlags,
            }),
          );
        }}
      >
        <TextField id="urge-time" label={t("Time")} hint={t("A clock time or a word such as evening.")} value={draft.time} onChange={(time) => setDraft({ ...draft, time })} />
        <TextField id="urge-want" label={t("What you want")} hint={t("Food, a drink, a cigarette, a scroll, or something else.")} value={draft.want} onChange={(want) => setDraft({ ...draft, want })} />
        <TextField id="urge-feeling" label={t("Feeling")} value={draft.feeling} onChange={(feeling) => setDraft({ ...draft, feeling })} />
        <TextField id="urge-before" label={t("What happened just before")} value={draft.before} onChange={(before) => setDraft({ ...draft, before })} />
        <label className="field" htmlFor="urge-intensity">
          <span>{t("Intensity, 1 to 10")}</span>
          <input id="urge-intensity" inputMode="numeric" value={draft.intensity} onChange={(event) => setDraft({ ...draft, intensity: event.target.value })} />
        </label>
        <CheckGroup
          legend={t("What may be part of this moment")}
          options={URGE_FACTORS.map((id) => ({ id, label: t(FACTOR_LABELS[id]) }))}
          selected={draft.factors}
          onToggle={(id) =>
            setDraft({
              ...draft,
              factors: draft.factors.includes(id) ? draft.factors.filter((item) => item !== id) : [...draft.factors, id],
            })
          }
        />
        {emphasizePause ? (
          <>
            <label className="choice">
              <input type="checkbox" checked={draft.breaths} onChange={() => setDraft({ ...draft, breaths: !draft.breaths })} />
              <span>{t("I took a few slow breaths")}</span>
            </label>
            <fieldset className="field">
              <legend>{t("Optional pause")}</legend>
              <p className="hint">{t("Use 5 or 10 minutes only when waiting is safe. Choose 0 if you need to eat or leave a situation.")}</p>
              {[0, 5, 10].map((minutes) => (
                <label key={minutes} className="choice">
                  <input
                    type="radio"
                    name="pause"
                    checked={draft.pauseMinutes === minutes}
                    onChange={() => setDraft({ ...draft, pauseMinutes: minutes as 0 | 5 | 10 })}
                  />
                  <span>{minutes === 0 ? t("No pause") : t("{minutes} minutes", { minutes })}</span>
                </label>
              ))}
            </fieldset>
          </>
        ) : null}
        <fieldset className="field">
          <legend>{t("What you chose")}</legend>
          {NEXT_CHOICES.map((id) => (
            <label key={id} className="choice">
              <input type="radio" name="choice" checked={draft.choice === id} onChange={() => setDraft({ ...draft, choice: id })} />
              <span>{t(CHOICE_LABELS[id])}</span>
            </label>
          ))}
        </fieldset>
        <TextField id="urge-note" label={t("Choice note")} value={draft.choiceNote} onChange={(choiceNote) => setDraft({ ...draft, choiceNote })} />
        <TextField id="urge-outcome" label={t("What happened after, if you want to record it")} value={draft.outcome} onChange={(outcome) => setDraft({ ...draft, outcome })} />
        <CheckGroup
          legend={t("Optional support flags")}
          options={SUPPORT_FLAGS.map((id) => ({ id, label: t(SUPPORT_LABELS[id]) }))}
          selected={draft.supportFlags}
          onToggle={(id) =>
            setDraft({
              ...draft,
              supportFlags: draft.supportFlags.includes(id)
                ? draft.supportFlags.filter((item) => item !== id)
                : [...draft.supportFlags, id],
            })
          }
        />
        <button className="btn btn-primary" type="submit">{t("Save this record")}</button>
        {message ? <p role="status">{t(message)}</p> : null}
      </form>
      <SupportNotice show={draft.supportFlags.length > 0 || wellness.log.urges.some((item) => item.supportFlags.length > 0)} />
      <WellnessSources ids={["medlineplus-emotional-eating", "nccih-mindfulness", "nci-if-then"]} />
    </div>
  );
}

export function MomentView() {
  const t = useT();
  const wellness = useWellness();
  const [minutes, setMinutes] = useState<MomentMinutes>(10);
  const [filters, setFilters] = useState<MomentFilter[]>([]);
  const [categories, setCategories] = useState<MomentCategory[]>([]);
  const [prompt, setPrompt] = useState("");
  const [plan, setPlan] = useState<{ title: string; detail: string; prompt: string } | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  function toggle<T extends string>(list: T[], id: T) {
    return list.includes(id) ? list.filter((item) => item !== id) : [...list, id];
  }

  return (
    <div className="learn stack-lg">
      <p className="kicker">{t("Choose your moment")}</p>
      <h1>{t("Your time is valuable. Choose something that makes your life better.")}</h1>
      <p className="lede">
        {t("If a snack is not physical hunger, you can spend the next few minutes on something else. Rest counts. If you are hungry, eat. This tool does not delay necessary food.")}
      </p>
      <ReadOnlyNote message={wellness.readOnlyMessage} />
      <form
        className="card stack"
        onSubmit={(event) => {
          event.preventDefault();
          const next = buildMomentPlan({ minutes, filters, categories });
          setPlan({ ...next, prompt: prompt || next.prompt });
          setActiveId(null);
        }}
      >
        <label className="field" htmlFor="moment-prompt">
          <span>{t("What would make your day better right now?")}</span>
          <textarea id="moment-prompt" maxLength={280} value={prompt} onChange={(event) => setPrompt(event.target.value)} />
        </label>
        <fieldset className="field">
          <legend>{t("How many minutes")}</legend>
          {MOMENT_MINUTES.map((value) => (
            <label key={value} className="choice">
              <input type="radio" name="minutes" checked={minutes === value} onChange={() => setMinutes(value)} />
              <span>{t("{minutes} minutes", { minutes: value })}</span>
            </label>
          ))}
        </fieldset>
        <CheckGroup
          legend={t("What kind of moment")}
          options={MOMENT_FILTERS.map((id) => ({ id, label: t(MOMENT_FILTER_COPY.find((item) => item.id === id)?.label ?? id) }))}
          selected={filters}
          onToggle={(id) => setFilters(toggle(filters, id))}
        />
        <section className="stack">
          <h2>{t("When a snack is not physical hunger")}</h2>
          {MOMENT_CATEGORY_COPY.map((item) => (
            <label key={item.id} className="choice">
              <input
                type="checkbox"
                checked={categories.includes(item.id)}
                onChange={() => setCategories(toggle(categories, item.id))}
              />
              <span>
                <strong>{t(item.label)}.</strong> {t(item.text)}
              </span>
            </label>
          ))}
        </section>
        <button className="btn btn-primary" type="submit">{t("Generate a plan")}</button>
      </form>
      {plan ? (
        <section className="card stack">
          <h2>{t(plan.title)}</h2>
          <p>{momentDetail(t, plan.detail)}</p>
          {plan.prompt ? <p className="hint">{t("Your prompt: {prompt}", { prompt: momentPrompt(t, plan.prompt) })}</p> : null}
          <div className="actions">
            {(["started", "done", "postponed"] as MomentStatus[]).map((status) => (
              <button
                key={status}
                className="btn btn-secondary"
                type="button"
                onClick={() => {
                  const id = activeId ?? undefined;
                  setMessage(
                    wellness.saveMoment({
                      id,
                      minutes,
                      filters,
                      categories,
                      prompt: plan.prompt,
                      title: plan.title,
                      detail: plan.detail,
                      status,
                    }),
                  );
                }}
              >
                {status === "started" ? t("Start") : status === "done" ? t("Complete") : t("Postpone")}
              </button>
            ))}
            <button className="btn btn-ghost" type="button" onClick={() => setPlan(null)}>
              {t("Change the plan")}
            </button>
          </div>
          {message ? <p role="status">{t(message)}</p> : null}
        </section>
      ) : null}
      <aside className="card example-only stack">
        <h2>{t("Example only")}</h2>
        <p>{t(EXAMPLE_MOMENT_STORY)}</p>
      </aside>
      <section className="card stack">
        <h2>{t("Your saved moments")}</h2>
        {wellness.log.moments.length === 0 ? <p>{t("None yet. The example above is not in this list.")}</p> : null}
        <ul className="record-list">
          {wellness.log.moments.map((item) => (
            <li key={item.id}>
              <strong>{t(item.title)}</strong>
              <p>{t("{date}. Status: {status}. {minutes} minutes.", { date: item.date, status: t(MOMENT_STATUS_LABELS[item.status] ?? item.status), minutes: item.minutes })}</p>
              <button className="btn btn-ghost" type="button" onClick={() => setActiveId(item.id)}>
                {t("Update this one next")}
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function TextField({
  id,
  label,
  hint,
  value,
  onChange,
}: {
  id: string;
  label: string;
  hint?: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="field" htmlFor={id}>
      <span>{label}</span>
      {hint ? <span className="hint">{hint}</span> : null}
      <input id={id} maxLength={280} value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function CheckGroup<T extends string>({
  legend,
  options,
  selected,
  onToggle,
}: {
  legend: string;
  options: { id: T; label: string }[];
  selected: T[];
  onToggle: (id: T) => void;
}) {
  return (
    <fieldset className="field">
      <legend>{legend}</legend>
      {options.map((option) => (
        <label key={option.id} className="choice">
          <input type="checkbox" checked={selected.includes(option.id)} onChange={() => onToggle(option.id)} />
          <span>{option.label}</span>
        </label>
      ))}
    </fieldset>
  );
}
