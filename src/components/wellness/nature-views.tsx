"use client";

import Link from "next/link";
import { useState } from "react";
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
  { href: "/nature/sunlight", title: "Sunlight", text: "Daylight, winter mood education, and sun safety." },
  { href: "/nature/earth", title: "Feel the earth", text: "Green space, plus a clear line around unproven earthing claims." },
  { href: "/nature/trees", title: "Trees", text: "Slow time among trees. Not a workout and not an immune promise." },
  { href: "/nature/outside", title: "Step outside", text: "Walk, roll, sit, stretch, or watch. No required distance." },
  { href: "/nature/food", title: "Real food", text: "Everyday plants, protein, and water. No food is a treatment." },
  { href: "/nature/people", title: "People and place", text: "Inspiration without stereotypes." },
  { href: "/nature/week", title: "7 days closer to nature", text: "A checklist you can change. An optional 30-day journey sits beside it." },
  { href: "/nature/routine", title: "My personal nature routine", text: "Morning, afternoon, and evening ideas you can edit." },
  { href: "/nature/journal", title: "Mood and energy journal", text: "Your notes, kept separate from examples and from clinic measurements." },
];

export function NatureHome() {
  return (
    <div className="learn stack-lg">
      <header className="stack">
        <p className="kicker">The power of nature</p>
        <h1>You are part of nature. Make time to reconnect.</h1>
        <p className="lede">{NATURE_QUOTE}</p>
        <p>
          Nature is not medicine and not a replacement for food, sleep, movement, or professional care. Disability, weather, and the space you have all change what “outside” can mean. A missed day is not a failure.
        </p>
      </header>
      <div className="stack">
        {links.map((item) => (
          <Link key={item.href} className="card learn-link" href={item.href}>
            <h2>{item.title}</h2>
            <p>{item.text}</p>
          </Link>
        ))}
      </div>
      <p>{NATURE_CLOSE}</p>
    </div>
  );
}

export function NatureModuleView({ slug }: { slug: string }) {
  const topic = natureModule(slug);
  if (!topic) return null;
  return (
    <div className="learn stack-lg">
      <p className="kicker">The power of nature</p>
      <h1>{topic.title}</h1>
      <p className="lede">{topic.summary}</p>
      {topic.blocks.map((block) => (
        <section key={block.heading} className="card stack">
          <h2>{block.heading}</h2>
          <p>{block.body}</p>
          <EvidenceLine kind={block.evidence} note={block.evidenceNote} />
          <WellnessSources ids={block.sourceIds} />
        </section>
      ))}
      <Link href="/nature">All nature topics</Link>
    </div>
  );
}

export function NatureWeek() {
  const wellness = useWellness();
  const week = challengeById("nature-7");
  const month = challengeById("nature-30");
  return (
    <div className="learn stack-lg">
      <p className="kicker">7 days closer to nature</p>
      <h1>Choose the moments that fit</h1>
      <p className="lede">
        Select any activities. There is no required distance and no promised medical result. Window time is daylight. It is stored as its own activity, not as outdoor time.
      </p>
      <ReadOnlyNote message={wellness.readOnlyMessage} />
      <fieldset className="card stack">
        <legend>Today’s checklist</legend>
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
                <strong>{item.label}.</strong> {item.text}
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
  morning: "Example: open a curtain, or step to a doorway if that is easy. Not a required time.",
  afternoon: "Example: a bench, a balcony, or a look at trees. Skip it when weather or energy says no.",
  evening: "Example: dim bright overhead light if that feels gentle before sleep. Not an order.",
};

export function NatureRoutineView() {
  const wellness = useWellness();
  const saved = wellness.log.natureRoutine;
  const [draft, setDraft] = useState<NatureRoutine | null>(null);
  const routine = draft ?? saved;
  const [message, setMessage] = useState<string | null>(null);
  return (
    <div className="learn stack-lg">
      <p className="kicker">My personal nature routine</p>
      <h1>Shape the day you actually have</h1>
      <p className="lede">
        Climate, ability, space, and schedule change the routine. These boxes are yours. The hints are examples, not a clock.
      </p>
      <ReadOnlyNote message={wellness.readOnlyMessage} />
      <form
        className="card stack"
        onSubmit={(event) => {
          event.preventDefault();
          const result = wellness.setNatureRoutine(routine);
          setMessage(result ?? "Saved in this browser tab.");
          setDraft(null);
        }}
      >
        {(["morning", "afternoon", "evening"] as const).map((part) => (
          <label key={part} className="field" htmlFor={`routine-${part}`}>
            <span>{part[0].toUpperCase() + part.slice(1)}</span>
            <span className="hint">{routineHints[part]}</span>
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
          Save this routine
        </button>
        {message ? <p role="status">{message}</p> : null}
      </form>
    </div>
  );
}

const weatherOptions: { id: NatureWeather; label: string }[] = [
  { id: "sunny", label: "Sunny" },
  { id: "cloudy", label: "Cloudy" },
  { id: "rainy", label: "Rainy" },
  { id: "window", label: "Window only" },
];

export function NatureJournal() {
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
      <p className="kicker">My nature, mood, and energy journal</p>
      <h1>Your notes stay yours</h1>
      <p className="lede">
        Outdoor time, daylight, mood, energy, and sleep on this page are user-reported. They are not clinic measurements, not estimates from a table, and not hypothetical forecasts.
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
          <span>Outdoor minutes, if you went out</span>
          <span className="hint">Leave blank for a window-only note. This is your estimate, not a device reading.</span>
          <input
            id="outdoor-minutes"
            inputMode="numeric"
            value={draft.outdoorMinutes}
            onChange={(event) => setDraft({ ...draft, outdoorMinutes: event.target.value })}
          />
        </label>
        <fieldset className="field">
          <legend>Weather or place</legend>
          <div className="choices">
            {weatherOptions.map((item) => (
              <label key={item.id} className="choice">
                <input
                  type="radio"
                  name="weather"
                  checked={draft.weather === item.id}
                  onChange={() => setDraft({ ...draft, weather: item.id })}
                />
                <span>{item.label}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <div className="grid-2">
          <ScaleField id="mood-before" label="Mood before, 1 to 5" value={draft.moodBefore} onChange={(moodBefore) => setDraft({ ...draft, moodBefore })} />
          <ScaleField id="mood-after" label="Mood after, 1 to 5" value={draft.moodAfter} onChange={(moodAfter) => setDraft({ ...draft, moodAfter })} />
          <ScaleField id="energy" label="Energy, 1 to 5" value={draft.energy} onChange={(energy) => setDraft({ ...draft, energy })} />
          <ScaleField id="sleep-note" label="Sleep last night, 1 to 5" value={draft.sleep} onChange={(sleep) => setDraft({ ...draft, sleep })} />
        </div>
        <fieldset className="field">
          <legend>Activities</legend>
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
              <span>{item.label}</span>
            </label>
          ))}
        </fieldset>
        <label className="field" htmlFor="movement-note">
          <span>Movement</span>
          <input id="movement-note" maxLength={280} value={draft.movement} onChange={(event) => setDraft({ ...draft, movement: event.target.value })} />
        </label>
        <label className="field" htmlFor="connection-note">
          <span>Social connection</span>
          <input id="connection-note" maxLength={280} value={draft.connection} onChange={(event) => setDraft({ ...draft, connection: event.target.value })} />
        </label>
        <label className="field" htmlFor="nature-reflection">
          <span>Reflection</span>
          <textarea id="nature-reflection" maxLength={280} value={draft.reflection} onChange={(event) => setDraft({ ...draft, reflection: event.target.value })} />
        </label>
        <button className="btn btn-primary" type="submit">Save today’s note</button>
        {message ? <p role="status">{message}</p> : null}
      </form>
      <section className="card stack">
        <h2>Pattern from your notes</h2>
        <p>{outdoorMoodSentence(entries)}</p>
      </section>
      <section className="card stack">
        <h2>This month</h2>
        <p>{monthEntries.length === 0 ? "No notes this month yet." : `${monthEntries.length} notes this month. Kind: user-reported.`}</p>
        <EntryList entries={monthEntries} />
      </section>
      <section className="card stack">
        <h2>Earlier notes</h2>
        <EntryList entries={entries} />
      </section>
      <aside className="card example-only stack">
        <h2>Example only</h2>
        <p>This card is not saved as your record. Example: a cloudy afternoon, ten minutes on a bench, mood marked a little higher afterward.</p>
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
  return (
    <label className="field" htmlFor={id}>
      <span>{label}</span>
      <input id={id} inputMode="numeric" value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function EntryList({ entries }: { entries: NatureEntry[] }) {
  if (entries.length === 0) return <p>Nothing recorded yet.</p>;
  return (
    <ul className="record-list">
      {entries.map((entry) => (
        <li key={entry.id}>
          <strong>{entry.date}</strong>
          <p>
            {entry.outdoorMinutes === null ? "No outdoor minutes entered." : `${entry.outdoorMinutes} outdoor minutes, estimated by you.`}{" "}
            {entry.weather ? `Place: ${entry.weather}.` : ""}
          </p>
          <p className="hint">
            Mood before {entry.moodBefore ?? "blank"}, after {entry.moodAfter ?? "blank"}. Energy {entry.energy ?? "blank"}. Sleep {entry.sleep ?? "blank"}.
          </p>
          {entry.reflection ? <p>{entry.reflection}</p> : null}
        </li>
      ))}
    </ul>
  );
}

export const natureStaticSlugs = natureModules.map((item) => item.slug);
