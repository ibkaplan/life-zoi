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
import { useLocale, useT } from "@/components/locale-provider";
import { LOCALE_META } from "@/lib/i18n/config";
import { msg } from "@/lib/i18n/translate";

const READ_ONLY = msg("Sample data is read-only. Turn off the sample to record your own notes.");

type CompanionRequest = Omit<Parameters<typeof respondToCompanion>[0], "t">;

type Turn = {
  id: string;
  role: "visitor" | "companion";
  text: string;
  crisis: boolean;
  /** What the reply was written from, so it can be shown again in the chosen language. */
  request?: CompanionRequest;
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
  const t = useT();
  const { locale } = useLocale();
  if (notes.length === 0) return <p className="hint">{t(empty)}</p>;
  const day = (iso: string) => {
    const date = new Date(iso);
    return Number.isNaN(date.getTime())
      ? iso.slice(0, 10)
      : date.toLocaleDateString(LOCALE_META[locale].htmlLang, { year: "numeric", month: "long", day: "numeric" });
  };
  return (
    <ul className="stack">
      {notes.map((note) => (
        <li key={note.id} className="card card-quiet stack">
          <p>{note.text}</p>
          <p className="hint">{day(note.createdAt)}</p>
          <button className="btn btn-danger" type="button" onClick={() => onDelete(note.id)}>
            {t("Delete this note")}
          </button>
        </li>
      ))}
    </ul>
  );
}

export function EmotionalWellnessView() {
  const { sample } = useSession();
  const t = useT();
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
    const request: CompanionRequest = {
      message: text,
      context: stored.context,
      country: stored.country,
      mode,
      companionEnabled: repliesOn,
    };
    const result = respondToCompanion(request);
    setMode(result.mode);
    setMessage("");
    setTurns((current) =>
      [
        ...current,
        { id: `${createNoteId()}v`, role: "visitor" as const, text, crisis: false },
        { id: `${createNoteId()}c`, role: "companion" as const, text: result.text, crisis: result.crisis, request },
      ].slice(-40),
    );
  }

  const usNumbers = showEmergencyNumbers(stored.country);

  return (
    <div className="stack-lg">
      <header className="stack">
        <p className="kicker">{t(FEATURE_NAME)}</p>
        <h1>{t(HEADLINE)}</h1>
        <p className="lede">{t(SUPPORTING_LINE)}</p>
      </header>

      <section className="card stack" aria-labelledby="ew-limits">
        <h2 id="ew-limits">{t("What this page is")}</h2>
        <p>{t(COMPANION_OPENING)}</p>
        <p className="alert alert-error">{t(CLINICAL_REVIEW_NOTICE)}</p>
        <p className="banner" role="note">
          {standingCrisisNotice(stored.country, t)}
        </p>
      </section>

      <section className="card stack" aria-labelledby="ew-context">
        <h2 id="ew-context">{t("Optional context")}</h2>
        <p className="hint">{t(CONTEXT_NOTE)}</p>
        <div className="ew-chips" role="group" aria-label={t("Optional context")}>
          {CONTEXT_OPTIONS.map((option) => (
            <button
              key={option.id}
              className="btn btn-secondary ew-chip"
              type="button"
              aria-pressed={stored.context === option.id}
              onClick={() => setContext(option.id)}
            >
              {t(option.label)}
            </button>
          ))}
        </div>
        <fieldset className="stack">
          <legend>{t("Country for crisis numbers")}</legend>
          <p className="hint">
            {t(
              "Call, text, and immediate-danger numbers for the United States are shown when the country is the United States or not set. Another country does not add a guessed local number.",
            )}
          </p>
          {(
            [
              ["unset", t("Not set")],
              ["us", t("United States")],
              ["other", t("Another country")],
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
            <span>{t("Country name")}</span>
            <input
              value={stored.countryNote}
              maxLength={80}
              onChange={(event) => save((current) => ({ ...current, countryNote: event.target.value }))}
            />
          </label>
        ) : null}
      </section>

      <section className="card stack" id="companion" aria-labelledby="ew-companion">
        <h2 id="ew-companion">{t("Companion")}</h2>
        <p className="hint">
          {t(
            "One question at a time. Written replies can be paused. The crisis check keeps running, and no paid model is called either way.",
          )}
        </p>
        <div className="actions">
          <button
            className="btn btn-secondary"
            type="button"
            aria-pressed={!repliesOn}
            onClick={() => setRepliesOn((on) => !on)}
          >
            {repliesOn ? t("Pause written replies") : t("Resume written replies")}
          </button>
        </div>
        <div className="ew-log" aria-live="polite">
          {turns.map((turn) => (
            <p
              key={turn.id}
              className={turn.crisis ? "ew-bubble ew-bubble-crisis" : turn.role === "companion" ? "ew-bubble ew-bubble-companion" : "ew-bubble"}
              role={turn.crisis ? "alert" : undefined}
            >
              <strong>{turn.role === "visitor" ? t("You") : t("Companion")}: </strong>
              {turn.role === "visitor"
                ? turn.text
                : turn.request
                  ? respondToCompanion({ ...turn.request, t }).text
                  : t(turn.text)}
            </p>
          ))}
        </div>
        <form className="stack" onSubmit={onTalk}>
          <label className="field" htmlFor="ew-message">
            <span>{t("Message")}</span>
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
              {t("Send")}
            </button>
          </div>
        </form>
      </section>

      <section className="stack" id="exercises" aria-labelledby="ew-exercises">
        <h2 id="ew-exercises">{t("Short exercises")}</h2>
        <p className="hint">{t(EXERCISE_INTRO)}</p>
        {EXERCISES.map((item) => {
          const session = exercise?.id === item.id ? exercise : null;
          return (
            <article key={item.id} className="card stack">
              <h3>{t(item.title)}</h3>
              <p>{t(item.summary)}</p>
              {session ? (
                <>
                  <p className="hint">
                    {t("Step {current} of {total}", { current: session.stepIndex + 1, total: item.steps.length })}
                  </p>
                  <p className="ew-step">{t(item.steps[session.stepIndex])}</p>
                  <div className="actions">
                    {session.stepIndex < item.steps.length - 1 ? (
                      <button className="btn btn-primary" type="button" onClick={() => setExercise(nextExerciseStep(session))}>
                        {t("Next")}
                      </button>
                    ) : null}
                    <button className="btn btn-secondary" type="button" onClick={() => setExercise(stopExercise())}>
                      {t("Stop")}
                    </button>
                  </div>
                </>
              ) : (
                <div className="actions">
                  <button className="btn btn-secondary" type="button" onClick={() => setExercise(startExercise(item.id))}>
                    {item.optional ? t("Start if you want") : t("Start")}
                  </button>
                </div>
              )}
            </article>
          );
        })}
      </section>

      <section className="card stack" id="journal" aria-labelledby="ew-journal">
        <h2 id="ew-journal">{t("Private journal")}</h2>
        <p className="hint">{t(JOURNAL_PRIVACY)}</p>
        {notice ? <p role="status">{t(notice)}</p> : null}
        <form
          className="stack"
          onSubmit={(event) => {
            event.preventDefault();
            addNote("journal", journalDraft, () => setJournalDraft(""));
          }}
        >
          <label className="field" htmlFor="ew-journal-entry">
            <span>{t("Journal entry")}</span>
            <textarea
              id="ew-journal-entry"
              value={journalDraft}
              maxLength={1000}
              onChange={(event) => setJournalDraft(event.target.value)}
            />
          </label>
          <div className="actions">
            <button className="btn btn-primary" type="submit">
              {t("Save journal entry")}
            </button>
            <button className="btn btn-danger" type="button" onClick={() => save((current) => clearNoteBucket(current, "journal"))}>
              {t("Delete all journal entries")}
            </button>
          </div>
        </form>
        <NoteList
          notes={stored.journal}
          empty={msg("No journal entries yet.")}
          onDelete={(id) => save((current) => removePrivateNote(current, "journal", id))}
        />
      </section>

      <section className="card stack" id="joys" aria-labelledby="ew-joys">
        <h2 id="ew-joys">{t("Small joys")}</h2>
        <p className="hint">{t(JOY_NOTE)}</p>
        <form
          className="stack"
          onSubmit={(event) => {
            event.preventDefault();
            addNote("joys", joyDraft, () => setJoyDraft(""));
          }}
        >
          <label className="field" htmlFor="ew-joy">
            <span>{t("A small joy")}</span>
            <input id="ew-joy" value={joyDraft} maxLength={1000} onChange={(event) => setJoyDraft(event.target.value)} />
          </label>
          <div className="actions">
            <button className="btn btn-primary" type="submit">
              {t("Save a small joy")}
            </button>
            <button className="btn btn-danger" type="button" onClick={() => save((current) => clearNoteBucket(current, "joys"))}>
              {t("Delete all small joys")}
            </button>
          </div>
        </form>
        <NoteList
          notes={stored.joys}
          empty={msg("No small joys saved. Skipping this is fine.")}
          onDelete={(id) => save((current) => removePrivateNote(current, "joys", id))}
        />
      </section>

      <section className="card stack" id="caregiver" aria-labelledby="ew-care">
        <h2 id="ew-care">{t("Caregiver notes")}</h2>
        <p className="hint">{t(CAREGIVER_NOTE)}</p>
        <form
          className="stack"
          onSubmit={(event) => {
            event.preventDefault();
            addNote("caregiverNotes", careDraft, () => setCareDraft(""));
          }}
        >
          <label className="field" htmlFor="ew-care-note">
            <span>{t("Note")}</span>
            <textarea
              id="ew-care-note"
              value={careDraft}
              maxLength={1000}
              onChange={(event) => setCareDraft(event.target.value)}
            />
          </label>
          <div className="actions">
            <button className="btn btn-primary" type="submit">
              {t("Save caregiver note")}
            </button>
            <button
              className="btn btn-danger"
              type="button"
              onClick={() => save((current) => clearNoteBucket(current, "caregiverNotes"))}
            >
              {t("Delete all caregiver notes")}
            </button>
          </div>
        </form>
        <NoteList
          notes={stored.caregiverNotes}
          empty={msg("No caregiver notes yet.")}
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
                setNotice(msg("Emotional wellness notes in this browser were deleted."));
              }}
            >
              {t("Confirm delete of all notes in this browser")}
            </button>
          ) : (
            <button className="btn btn-danger" type="button" onClick={() => setConfirmWipe(true)}>
              {t("Delete all emotional wellness data in this browser")}
            </button>
          )}
        </div>
      </section>

      <section className="card stack" id="real-person" aria-labelledby="ew-real">
        <h2 id="ew-real">{t("Talk to a real person")}</h2>
        <p className="hint">
          {t("These are published organizations. This page does not invent phone numbers.")}{" "}
          {usNumbers
            ? t("United States crisis numbers are included because a country is not set or is the United States.")
            : t("United States crisis numbers are hidden because a different country is set.")}
        </p>
        <ul className="stack">
          {REAL_ORGS.filter((org) => org.id !== "lifeline" || usNumbers).map((org) => {
            const phone = orgPhone(org, stored.country);
            return (
              <li key={org.id} className="card card-quiet stack">
                <h3>{org.name}</h3>
                <p>{t(org.detail)}</p>
                <p>
                  <a href={org.url} target="_blank" rel="noopener noreferrer">
                    {t("{name} website", { name: org.name })}
                  </a>
                </p>
                {phone ? (
                  <p>
                    <a href={phoneHref(phone)}>
                      {phone === "988" ? t("Call or text 988") : t("Phone listed by the organization: {phone}", { phone })}
                    </a>
                  </p>
                ) : (
                  <p className="hint">{t("No phone number is shown here for this country.")}</p>
                )}
                {org.id === "lifeline" && usNumbers ? (
                  <p>
                    <a href="tel:911">{t("Call 911 for immediate danger")}</a>
                  </p>
                ) : null}
              </li>
            );
          })}
        </ul>
      </section>

      <section className="card stack" aria-labelledby="ew-sources">
        <h2 id="ew-sources">{t("Sources")}</h2>
        <p className="hint">
          {t(
            "The words on this page are original. The sources below are named so the ideas can be checked. They are not a claim that this page was clinically validated.",
          )}
        </p>
        <ul className="source-list">
          {ATTRIBUTIONS.map((source) => (
            <li key={source.id}>
              <a href={source.url} target="_blank" rel="noopener noreferrer" lang="en">
                {source.name}: {source.title}
              </a>
              <span> {t(source.note)}</span>
            </li>
          ))}
        </ul>
        <p>{t(CLINICAL_REVIEW_NOTICE)}</p>
      </section>
    </div>
  );
}
