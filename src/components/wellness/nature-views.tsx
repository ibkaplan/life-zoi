"use client";

import Link from "next/link";
import { useState } from "react";
import { useT } from "@/components/locale-provider";
import { msg } from "@/lib/i18n/translate";
import { PagePhoto } from "@/components/page-photo";
import { EvidenceLine, ReadOnlyNote, WellnessSources } from "@/components/wellness/bits";
import { ChallengePanel } from "@/components/wellness/challenge-panel";
import { useWellness } from "@/components/wellness/use-wellness";
import { monthKey } from "@/lib/dates";
import { challengeById } from "@/lib/wellness/challenges";
import {
  NATURE_ACTIVITIES,
  NATURE_CLOSE,
  NATURE_QUOTE,
  natureModule,
  natureModules,
  outdoorMoodSentence,
} from "@/lib/wellness/nature";
import type { NatureActivityId, NatureEntry, NatureRoutine, NatureWeather } from "@/lib/wellness/types";

const links = [
  { href: "/nature/sunlight", title: msg("Sunlight"), text: msg("Daylight, winter mood education, and sun safety.") },
  { href: "/nature/earth", title: msg("Feel the earth"), text: msg("Green space, plus a clear line around unproven earthing claims.") },
  { href: "/nature/trees", title: msg("Trees"), text: msg("Slow time among trees. Not a workout and not an immune promise.") },
  { href: "/nature/outside", title: msg("Step outside"), text: msg("Walk, roll, sit, stretch, or watch. No required distance.") },
  { href: "/nature/food", title: msg("Real food"), text: msg("Everyday plants, protein, and water. No food is a treatment.") },
  { href: "/nature/people", title: msg("People and place"), text: msg("Inspiration without stereotypes.") },
  { href: "/nature/week", title: msg("7 days closer to nature"), text: msg("A checklist you can change. An optional 30-day journey sits beside it.") },
  { href: "/nature/routine", title: msg("My personal nature routine"), text: msg("Morning, afternoon, and evening ideas you can edit.") },
  { href: "/nature/journal", title: msg("Mood and energy journal"), text: msg("Your notes, kept separate from examples and from clinic measurements.") },
];

export function NatureHome() {
  const t = useT();
  return (
    <div className="learn stack-lg">
      <PagePhoto id="nature" />
      <header className="stack">
        <p className="kicker">{t("The power of nature")}</p>
        <h1>{t("You are part of nature. Make time to reconnect.")}</h1>
        <p className="lede">{t(NATURE_QUOTE)}</p>
        <p>
          {t("Nature is not medicine and not a replacement for food, sleep, movement, or professional care. Disability, weather, and the space you have all change what “outside” can mean. A missed day is not a failure.")}
        </p>
      </header>
      <div className="stack">
        {links.map((item) => (
          <Link key={item.href} className="card learn-link" href={item.href}>
            <h2>{t(item.title)}</h2>
            <p>{t(item.text)}</p>
          </Link>
        ))}
      </div>
      <p>{t(NATURE_CLOSE)}</p>
    </div>
  );
}

export function NatureModuleView({ slug }: { slug: string }) {
  const t = useT();
  const topic = natureModule(slug);
  if (!topic) return null;
  return (
    <div className="learn stack-lg">
      <p className="kicker">{t("The power of nature")}</p>
      <h1>{t(topic.title)}</h1>
      <p className="lede">{t(topic.summary)}</p>
      {topic.blocks.map((block) => (
        <section key={block.heading} className="card stack">
          <h2>{t(block.heading)}</h2>
          <p>{t(block.body)}</p>
          <EvidenceLine kind={block.evidence} note={t(block.evidenceNote)} />
          <WellnessSources ids={block.sourceIds} />
        </section>
      ))}
      <Link href="/nature">{t("All nature topics")}</Link>
    </div>
  );
}

export function NatureWeek() {
  const t = useT();
  const wellness = useWellness();
  const week = challengeById("nature-7");
  const month = challengeById("nature-30");
  return (
    <div className="learn stack-lg">
      <p className="kicker">7 days closer to nature</p>
      <h1>{t("Choose the moments that fit")}</h1>
      <p className="lede">
        {t("Select any activities. There is no required distance and no promised medical result. Window time is daylight. It is stored as its own activity, not as outdoor time.")}
      </p>
      <ReadOnlyNote message={wellness.readOnlyMessage} />
      <fieldset className="card stack">
        <legend>{t("Today’s checklist")}</legend>
        {NATURE_ACTIVITIES.map((item) => {
          const id = `nature-${item.id}`;
          return (
            <label key={item.id} className="choice">
              <input
                type="checkbox"
                checked={wellness.checked(id)}
                onChange={() => wellness.toggleCheck(id)}
              />
              <span>
                <strong>{t(item.label)}.</strong> {t(item.text)}
              </span>
            </label>
          );
        })}
      </fieldset>
      {week ? <ChallengePanel challenge={week} /> : null}
      {month ? <ChallengePanel challenge={month} /> : null}
    </div>
  );
}

const routineHints = {
  morning: msg("Example: open a curtain, or step to a doorway if that is easy. Not a required time."),
  afternoon: msg("Example: a bench, a balcony, or a look at trees. Skip it when weather or energy says no."),
  evening: msg("Example: dim bright overhead light if that feels gentle before sleep. Not an order."),
};

const ROUTINE_PARTS = { morning: msg("Morning"), afternoon: msg("Afternoon"), evening: msg("Evening") };

export function NatureRoutineView() {
  const t = useT();
  const wellness = useWellness();
  const saved = wellness.log.natureRoutine;
  const [draft, setDraft] = useState<NatureRoutine | null>(null);
  const routine = draft ?? saved;
  const [message, setMessage] = useState<string | null>(null);
  return (
    <div className="learn stack-lg">
      <p className="kicker">{t("My personal nature routine")}</p>
      <h1>{t("Shape the day you actually have")}</h1>
      <p className="lede">
        {t("Climate, ability, space, and schedule change the routine. These boxes are yours. The hints are examples, not a clock.")}
      </p>
      <ReadOnlyNote message={wellness.readOnlyMessage} />
      <form
        className="card stack"
        onSubmit={(event) => {
          event.preventDefault();
          const result = wellness.setNatureRoutine(routine);
          setMessage(result ?? msg("Saved in this browser tab."));
          setDraft(null);
        }}
      >
        {(["morning", "afternoon", "evening"] as const).map((part) => (
          <label key={part} className="field" htmlFor={`routine-${part}`}>
            <span>{t(ROUTINE_PARTS[part])}</span>
            <span className="hint">{t(routineHints[part])}</span>
            <textarea
              id={`routine-${part}`}
              maxLength={280}
              value={routine[part]}
              onChange={(event) => {
                setDraft({ ...routine, [part]: event.target.value });
              }}
            />
          </label>
        ))}
        <button className="btn btn-primary" type="submit">
          {t("Save this routine")}
        </button>
        {message ? <p role="status">{t(message)}</p> : null}
      </form>
    </div>
  );
}

const weatherOptions: { id: NatureWeather; label: string }[] = [
  { id: "sunny", label: msg("Sunny") },
  { id: "cloudy", label: msg("Cloudy") },
  { id: "rainy", label: msg("Rainy") },
  { id: "window", label: msg("Window only") },
];

function weatherLabel(id: string): string {
  return weatherOptions.find((item) => item.id === id)?.label ?? id;
}

export function NatureJournal() {
  const t = useT();
  const wellness = useWellness();
  const [draft, setDraft] = useState({
    outdoorMinutes: "",
    weather: "" as NatureWeather | "",
    moodBefore: "",
    moodAfter: "",
    energy: "",
    sleep: "",
    activities: [] as NatureActivityId[],
    movement: "",
    connection: "",
    reflection: "",
  });
  const [message, setMessage] = useState<string | null>(null);
  const entries = wellness.log.natureEntries;
  const month = monthKey(wellness.today);
  const monthEntries = entries.filter((entry) => entry.date.startsWith(month));

  function scale(value: string) {
    if (value === "") return null;
    const number = Number(value);
    return Number.isInteger(number) ? number : null;
  }

  return (
    <div className="learn stack-lg">
      <p className="kicker">{t("My nature, mood, and energy journal")}</p>
      <h1>{t("Your notes stay yours")}</h1>
      <p className="lede">
        {t("Outdoor time, daylight, mood, energy, and sleep on this page are user-reported. They are not clinic measurements, not estimates from a table, and not hypothetical forecasts.")}
      </p>
      <ReadOnlyNote message={wellness.readOnlyMessage} />
      <form
        className="card stack"
        onSubmit={(event) => {
          event.preventDefault();
          const minutes = draft.outdoorMinutes === "" ? null : Number(draft.outdoorMinutes);
          setMessage(
            wellness.saveNatureEntry({
              outdoorMinutes: minutes,
              weather: draft.weather,
              moodBefore: scale(draft.moodBefore),
              moodAfter: scale(draft.moodAfter),
              energy: scale(draft.energy),
              sleep: scale(draft.sleep),
              activities: draft.activities,
              movement: draft.movement,
              connection: draft.connection,
              reflection: draft.reflection,
            }),
          );
        }}
      >
        <label className="field" htmlFor="outdoor-minutes">
          <span>{t("Outdoor minutes, if you went out")}</span>
          <span className="hint">{t("Leave blank for a window-only note. This is your estimate, not a device reading.")}</span>
          <input
            id="outdoor-minutes"
            inputMode="numeric"
            value={draft.outdoorMinutes}
            onChange={(event) => setDraft({ ...draft, outdoorMinutes: event.target.value })}
          />
        </label>
        <fieldset className="field">
          <legend>{t("Weather or place")}</legend>
          <div className="choices">
            {weatherOptions.map((item) => (
              <label key={item.id} className="choice">
                <input
                  type="radio"
                  name="weather"
                  checked={draft.weather === item.id}
                  onChange={() => setDraft({ ...draft, weather: item.id })}
                />
                <span>{t(item.label)}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <div className="grid-2">
          <ScaleField id="mood-before" label={msg("Mood before, 1 to 5")} value={draft.moodBefore} onChange={(moodBefore) => setDraft({ ...draft, moodBefore })} />
          <ScaleField id="mood-after" label={msg("Mood after, 1 to 5")} value={draft.moodAfter} onChange={(moodAfter) => setDraft({ ...draft, moodAfter })} />
          <ScaleField id="energy" label={msg("Energy, 1 to 5")} value={draft.energy} onChange={(energy) => setDraft({ ...draft, energy })} />
          <ScaleField id="sleep-note" label={msg("Sleep last night, 1 to 5")} value={draft.sleep} onChange={(sleep) => setDraft({ ...draft, sleep })} />
        </div>
        <fieldset className="field">
          <legend>{t("Activities")}</legend>
          {NATURE_ACTIVITIES.map((item) => (
            <label key={item.id} className="choice">
              <input
                type="checkbox"
                checked={draft.activities.includes(item.id)}
                onChange={() =>
                  setDraft({
                    ...draft,
                    activities: draft.activities.includes(item.id)
                      ? draft.activities.filter((id) => id !== item.id)
                      : [...draft.activities, item.id],
                  })
                }
              />
              <span>{t(item.label)}</span>
            </label>
          ))}
        </fieldset>
        <label className="field" htmlFor="movement-note">
          <span>{t("Movement")}</span>
          <input id="movement-note" maxLength={280} value={draft.movement} onChange={(event) => setDraft({ ...draft, movement: event.target.value })} />
        </label>
        <label className="field" htmlFor="connection-note">
          <span>{t("Social connection")}</span>
          <input id="connection-note" maxLength={280} value={draft.connection} onChange={(event) => setDraft({ ...draft, connection: event.target.value })} />
        </label>
        <label className="field" htmlFor="nature-reflection">
          <span>{t("Reflection")}</span>
          <textarea id="nature-reflection" maxLength={280} value={draft.reflection} onChange={(event) => setDraft({ ...draft, reflection: event.target.value })} />
        </label>
        <button className="btn btn-primary" type="submit">{t("Save today’s note")}</button>
        {message ? <p role="status">{t(message)}</p> : null}
      </form>
      <section className="card stack">
        <h2>{t("Pattern from your notes")}</h2>
        <p>{t(outdoorMoodSentence(entries))}</p>
      </section>
      <section className="card stack">
        <h2>{t("This month")}</h2>
        <p>{monthEntries.length === 0 ? t("No notes this month yet.") : t("Notes this month: {count}. Kind: user-reported.", { count: monthEntries.length })}</p>
        <EntryList entries={monthEntries} />
      </section>
      <section className="card stack">
        <h2>{t("Earlier notes")}</h2>
        <EntryList entries={entries} />
      </section>
      <aside className="card example-only stack">
        <h2>{t("Example only")}</h2>
        <p>{t("This card is not saved as your record. Example: a cloudy afternoon, ten minutes on a bench, mood marked a little higher afterward.")}</p>
      </aside>
    </div>
  );
}

function ScaleField({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const t = useT();
  return (
    <label className="field" htmlFor={id}>
      <span>{t(label)}</span>
      <input id={id} inputMode="numeric" value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function EntryList({ entries }: { entries: NatureEntry[] }) {
  const t = useT();
  if (entries.length === 0) return <p>{t("Nothing recorded yet.")}</p>;
  return (
    <ul className="record-list">
      {entries.map((entry) => (
        <li key={entry.id}>
          <strong>{entry.date}</strong>
          <p>
            {entry.outdoorMinutes === null
              ? t("No outdoor minutes entered.")
              : t("Outdoor minutes, estimated by you: {minutes}.", { minutes: entry.outdoorMinutes })}{" "}
            {entry.weather ? t("Place: {place}.", { place: t(weatherLabel(entry.weather)) }) : ""}
          </p>
          <p className="hint">
            {t("Mood before {before}, after {after}. Energy {energy}. Sleep {sleep}.", {
              before: entry.moodBefore ?? t("blank"),
              after: entry.moodAfter ?? t("blank"),
              energy: entry.energy ?? t("blank"),
              sleep: entry.sleep ?? t("blank"),
            })}
          </p>
          {entry.reflection ? <p>{entry.reflection}</p> : null}
        </li>
      ))}
    </ul>
  );
}

export const natureStaticSlugs = natureModules.map((item) => item.slug);
