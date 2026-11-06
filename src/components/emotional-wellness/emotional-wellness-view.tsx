"use client";

import { useState, useSyncExternalStore, type FormEvent } from "react";
import { respondToCompanion } from "@/lib/emotional-wellness/companion";
import {
  CAREGIVER_NOTE,
  CLINICAL_REVIEW_NOTICE,
  COMPANION_OPENING,
  CONTEXT_NOTE,
  CONTEXT_OPTIONS,
  EXERCISE_INTRO,
  FEATURE_NAME,
  HEADLINE,
  JOURNAL_PRIVACY,
  JOY_NOTE,
  SUPPORTING_LINE,
} from "@/lib/emotional-wellness/copy";
import { standingCrisisNotice } from "@/lib/emotional-wellness/crisis";
import {
  EXERCISES,
  nextExerciseStep,
  startExercise,
  stopExercise,
  type ExerciseSession,
} from "@/lib/emotional-wellness/exercises";
import { ATTRIBUTIONS, orgPhone, REAL_ORGS, showEmergencyNumbers } from "@/lib/emotional-wellness/resources";
import { addPrivateNote, clearNoteBucket, createNoteId, removePrivateNote } from "@/lib/emotional-wellness/storage";
import {
  clearEmotionalStore,
  getEmotionalServerSnapshot,
  getEmotionalStoreSnapshot,
  subscribeEmotionalStore,
  updateEmotionalStore,
} from "@/lib/emotional-wellness/store";
import type { CompanionMode, ContextId, CountryChoice, NoteBucket, PrivateNote } from "@/lib/emotional-wellness/types";
import { useSession } from "@/components/session-provider";

const READ_ONLY = "Sample data is read-only. Turn off the sample to record your own notes.";

type Turn = {
  id: string;
  role: "visitor" | "companion";
  text: string;
  crisis: boolean;
};

const OPENING_TURN: Turn = {
  id: "opening",
  role: "companion",
  text: COMPANION_OPENING,
  crisis: false,
};

function phoneHref(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  return digits.length === 3 ? `tel:${digits}` : `tel:+1${digits}`;
}

function NoteList({
  notes,
  empty,
  onDelete,
}: {
  notes: PrivateNote[];
  empty: string;
  onDelete: (id: string) => void;
}) {
  if (notes.length === 0) return <p className="hint">{empty}</p>;
  return (
    <ul className="stack">
      {notes.map((note) => (
        <li key={note.id} className="card card-quiet stack">
          <p>{note.text}</p>
          <p className="hint">{note.createdAt.slice(0, 10)}</p>
          <button className="btn btn-danger" type="button" onClick={() => onDelete(note.id)}>
            Delete this note
          </button>
        </li>
      ))}
    </ul>
  );
}

export function EmotionalWellnessView() {
  const { sample } = useSession();
  const stored = useSyncExternalStore(subscribeEmotionalStore, getEmotionalStoreSnapshot, getEmotionalServerSnapshot);
  const [turns, setTurns] = useState<Turn[]>([OPENING_TURN]);
  const [mode, setMode] = useState<CompanionMode>("open");
  const [message, setMessage] = useState("");
  const [repliesOn, setRepliesOn] = useState(true);
  const [exercise, setExercise] = useState<ExerciseSession | null>(null);
  const [journalDraft, setJournalDraft] = useState("");
  const [joyDraft, setJoyDraft] = useState("");
  const [careDraft, setCareDraft] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [confirmWipe, setConfirmWipe] = useState(false);

  function save(recipe: (current: typeof stored) => typeof stored) {
    if (sample) {
      setNotice(READ_ONLY);
      return;
    }
    setNotice(null);
    setConfirmWipe(false);
    updateEmotionalStore(recipe);
  }

  function setCountry(country: CountryChoice) {
    save((current) => ({ ...current, country }));
  }

  function setContext(context: ContextId) {
    save((current) => ({ ...current, context }));
  }

  function addNote(bucket: NoteBucket, text: string, clear: () => void) {
    const id = createNoteId();
    const now = new Date().toISOString();
    save((current) => addPrivateNote(current, bucket, text, now, id));
    if (!sample) clear();
  }

  function onTalk(event: FormEvent) {
    event.preventDefault();
    const text = message.trim();
    if (!text) return;
    const result = respondToCompanion({
      message: text,
      context: stored.context,
      country: stored.country,
      mode,
      companionEnabled: repliesOn,
    });
    setMode(result.mode);
    setMessage("");
    setTurns((current) =>
      [
        ...current,
        { id: `${createNoteId()}v`, role: "visitor" as const, text, crisis: false },
        { id: `${createNoteId()}c`, role: "companion" as const, text: result.text, crisis: result.crisis },
      ].slice(-40),
    );
  }

  const usNumbers = showEmergencyNumbers(stored.country);

  return (
    <div className="stack-lg">
      <header className="stack">
        <p className="kicker">{FEATURE_NAME}</p>
        <h1>{HEADLINE}</h1>
        <p className="lede">{SUPPORTING_LINE}</p>
      </header>

      <section className="card stack" aria-labelledby="ew-limits">
        <h2 id="ew-limits">What this page is</h2>
        <p>{COMPANION_OPENING}</p>
        <p className="alert alert-error">{CLINICAL_REVIEW_NOTICE}</p>
        <p className="banner" role="note">
          {standingCrisisNotice(stored.country)}
        </p>
      </section>

      <section className="card stack" aria-labelledby="ew-context">
        <h2 id="ew-context">Optional context</h2>
        <p className="hint">{CONTEXT_NOTE}</p>
        <div className="ew-chips" role="group" aria-label="Optional context">
          {CONTEXT_OPTIONS.map((option) => (
            <button
              key={option.id}
              className="btn btn-secondary ew-chip"
              type="button"
              aria-pressed={stored.context === option.id}
              onClick={() => setContext(option.id)}
            >
              {option.label}
            </button>
          ))}
        </div>
        <fieldset className="stack">
          <legend>Country for crisis numbers</legend>
          <p className="hint">
            Call, text, and immediate-danger numbers for the United States are shown when the country is the United
            States or not set. Another country does not add a guessed local number.
          </p>
          {(
            [
              ["unset", "Not set"],
              ["us", "United States"],
              ["other", "Another country"],
            ] as const
          ).map(([value, label]) => (
            <label key={value} className="choice">
              <input
                type="radio"
                name="emotional-country"
                checked={stored.country === value}
                onChange={() => setCountry(value)}
              />
              <span>{label}</span>
            </label>
          ))}
        </fieldset>
        {stored.country === "other" ? (
          <label className="field">
            <span>Country name</span>
            <input
              value={stored.countryNote}
              maxLength={80}
              onChange={(event) => save((current) => ({ ...current, countryNote: event.target.value }))}
            />
          </label>
        ) : null}
      </section>

      <section className="card stack" id="companion" aria-labelledby="ew-companion">
        <h2 id="ew-companion">Companion</h2>
        <p className="hint">
          One question at a time. Written replies can be paused. The crisis check keeps running, and no paid model is
          called either way.
        </p>
        <div className="actions">
          <button
            className="btn btn-secondary"
            type="button"
            aria-pressed={!repliesOn}
            onClick={() => setRepliesOn((on) => !on)}
          >
            {repliesOn ? "Pause written replies" : "Resume written replies"}
          </button>
        </div>
        <div className="ew-log" aria-live="polite">
          {turns.map((turn) => (
            <p
              key={turn.id}
              className={turn.crisis ? "ew-bubble ew-bubble-crisis" : turn.role === "companion" ? "ew-bubble ew-bubble-companion" : "ew-bubble"}
              role={turn.crisis ? "alert" : undefined}
            >
              <strong>{turn.role === "visitor" ? "You" : "Companion"}: </strong>
              {turn.text}
            </p>
          ))}
        </div>
        <form className="stack" onSubmit={onTalk}>
          <label className="field" htmlFor="ew-message">
            <span>Message</span>
            <textarea
              id="ew-message"
              value={message}
              maxLength={1500}
              rows={4}
              onChange={(event) => setMessage(event.target.value)}
            />
          </label>
          <div className="actions">
            <button className="btn btn-primary" type="submit">
              Send
            </button>
          </div>
        </form>
      </section>

      <section className="stack" id="exercises" aria-labelledby="ew-exercises">
        <h2 id="ew-exercises">Short exercises</h2>
        <p className="hint">{EXERCISE_INTRO}</p>
        {EXERCISES.map((item) => {
          const session = exercise?.id === item.id ? exercise : null;
          return (
            <article key={item.id} className="card stack">
              <h3>{item.title}</h3>
              <p>{item.summary}</p>
              {session ? (
                <>
                  <p className="hint">
                    Step {session.stepIndex + 1} of {item.steps.length}
                  </p>
                  <p className="ew-step">{item.steps[session.stepIndex]}</p>
                  <div className="actions">
                    {session.stepIndex < item.steps.length - 1 ? (
                      <button className="btn btn-primary" type="button" onClick={() => setExercise(nextExerciseStep(session))}>
                        Next
                      </button>
                    ) : null}
                    <button className="btn btn-secondary" type="button" onClick={() => setExercise(stopExercise())}>
                      Stop
                    </button>
                  </div>
                </>
              ) : (
                <div className="actions">
                  <button className="btn btn-secondary" type="button" onClick={() => setExercise(startExercise(item.id))}>
                    {item.optional ? "Start if you want" : "Start"}
                  </button>
                </div>
              )}
            </article>
          );
        })}
      </section>

      <section className="card stack" id="journal" aria-labelledby="ew-journal">
        <h2 id="ew-journal">Private journal</h2>
        <p className="hint">{JOURNAL_PRIVACY}</p>
        {notice ? <p role="status">{notice}</p> : null}
        <form
          className="stack"
          onSubmit={(event) => {
            event.preventDefault();
            addNote("journal", journalDraft, () => setJournalDraft(""));
          }}
        >
          <label className="field" htmlFor="ew-journal-entry">
            <span>Journal entry</span>
            <textarea
              id="ew-journal-entry"
              value={journalDraft}
              maxLength={1000}
              onChange={(event) => setJournalDraft(event.target.value)}
            />
          </label>
          <div className="actions">
            <button className="btn btn-primary" type="submit">
              Save journal entry
            </button>
            <button className="btn btn-danger" type="button" onClick={() => save((current) => clearNoteBucket(current, "journal"))}>
              Delete all journal entries
            </button>
          </div>
        </form>
        <NoteList
          notes={stored.journal}
          empty="No journal entries yet."
          onDelete={(id) => save((current) => removePrivateNote(current, "journal", id))}
        />
      </section>

      <section className="card stack" id="joys" aria-labelledby="ew-joys">
        <h2 id="ew-joys">Small joys</h2>
        <p className="hint">{JOY_NOTE}</p>
        <form
          className="stack"
          onSubmit={(event) => {
            event.preventDefault();
            addNote("joys", joyDraft, () => setJoyDraft(""));
          }}
        >
          <label className="field" htmlFor="ew-joy">
            <span>A small joy</span>
            <input id="ew-joy" value={joyDraft} maxLength={1000} onChange={(event) => setJoyDraft(event.target.value)} />
          </label>
          <div className="actions">
            <button className="btn btn-primary" type="submit">
              Save a small joy
            </button>
            <button className="btn btn-danger" type="button" onClick={() => save((current) => clearNoteBucket(current, "joys"))}>
              Delete all small joys
            </button>
          </div>
        </form>
        <NoteList
          notes={stored.joys}
          empty="No small joys saved. Skipping this is fine."
          onDelete={(id) => save((current) => removePrivateNote(current, "joys", id))}
        />
      </section>

      <section className="card stack" id="caregiver" aria-labelledby="ew-care">
        <h2 id="ew-care">Caregiver notes</h2>
        <p className="hint">{CAREGIVER_NOTE}</p>
        <form
          className="stack"
          onSubmit={(event) => {
            event.preventDefault();
            addNote("caregiverNotes", careDraft, () => setCareDraft(""));
          }}
        >
          <label className="field" htmlFor="ew-care-note">
            <span>Note</span>
            <textarea
              id="ew-care-note"
              value={careDraft}
              maxLength={1000}
              onChange={(event) => setCareDraft(event.target.value)}
            />
          </label>
          <div className="actions">
            <button className="btn btn-primary" type="submit">
              Save caregiver note
            </button>
            <button
              className="btn btn-danger"
              type="button"
              onClick={() => save((current) => clearNoteBucket(current, "caregiverNotes"))}
            >
              Delete all caregiver notes
            </button>
          </div>
        </form>
        <NoteList
          notes={stored.caregiverNotes}
          empty="No caregiver notes yet."
          onDelete={(id) => save((current) => removePrivateNote(current, "caregiverNotes", id))}
        />
        <div className="actions">
          {confirmWipe ? (
            <button
              className="btn btn-danger"
              type="button"
              onClick={() => {
                if (sample) {
                  setNotice(READ_ONLY);
                  return;
                }
                clearEmotionalStore();
                setConfirmWipe(false);
                setNotice("Emotional wellness notes in this browser were deleted.");
              }}
            >
              Confirm delete of all notes in this browser
            </button>
          ) : (
            <button className="btn btn-danger" type="button" onClick={() => setConfirmWipe(true)}>
              Delete all emotional wellness data in this browser
            </button>
          )}
        </div>
      </section>

      <section className="card stack" id="real-person" aria-labelledby="ew-real">
        <h2 id="ew-real">Talk to a real person</h2>
        <p className="hint">
          These are published organizations. This page does not invent phone numbers.{" "}
          {usNumbers
            ? "United States crisis numbers are included because a country is not set or is the United States."
            : "United States crisis numbers are hidden because a different country is set."}
        </p>
        <ul className="stack">
          {REAL_ORGS.filter((org) => org.id !== "lifeline" || usNumbers).map((org) => {
            const phone = orgPhone(org, stored.country);
            return (
              <li key={org.id} className="card card-quiet stack">
                <h3>{org.name}</h3>
                <p>{org.detail}</p>
                <p>
                  <a href={org.url} target="_blank" rel="noopener noreferrer">
                    {org.name} website
                  </a>
                </p>
                {phone ? (
                  <p>
                    <a href={phoneHref(phone)}>{phone === "988" ? "Call or text 988" : `Phone listed by the organization: ${phone}`}</a>
                  </p>
                ) : (
                  <p className="hint">No phone number is shown here for this country.</p>
                )}
                {org.id === "lifeline" && usNumbers ? (
                  <p>
                    <a href="tel:911">Call 911 for immediate danger</a>
                  </p>
                ) : null}
              </li>
            );
          })}
        </ul>
      </section>

      <section className="card stack" aria-labelledby="ew-sources">
        <h2 id="ew-sources">Sources</h2>
        <p className="hint">
          The words on this page are original. The sources below are named so the ideas can be checked. They are not a
          claim that this page was clinically validated.
        </p>
        <ul className="source-list">
          {ATTRIBUTIONS.map((source) => (
            <li key={source.id}>
              <a href={source.url} target="_blank" rel="noopener noreferrer">
                {source.name}: {source.title}
              </a>
              <span> {source.note}</span>
            </li>
          ))}
        </ul>
        <p>{CLINICAL_REVIEW_NOTICE}</p>
      </section>
    </div>
  );
}
