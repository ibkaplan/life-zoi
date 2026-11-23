"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import {
  CAREGIVER_NOTE,
  CLINICAL_REVIEW_NOTICE,
  EXERCISE_INTRO,
  HEADLINE,
  JOURNAL_PRIVACY,
  JOY_NOTE,
  MIND_CARD_BODY,
  MIND_CARD_LANGUAGE,
  PAGE_INTRO,
  PAGE_TITLE,
  SUPPORTING_LINE,
} from "@/lib/emotional-wellness/copy";
import { crisisReply, detectCrisis, standingCrisisNotice } from "@/lib/emotional-wellness/crisis";
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
import type { CountryChoice, NoteBucket, PrivateNote } from "@/lib/emotional-wellness/types";
import { useSession } from "@/components/session-provider";
import { useLocale, useT } from "@/components/locale-provider";
import { LOCALE_META } from "@/lib/i18n/config";
import { msg } from "@/lib/i18n/translate";

const READ_ONLY = msg("Sample data is read-only. Turn off the sample to record your own notes.");

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
  const [crisis, setCrisis] = useState<{ bucket: NoteBucket; text: string } | null>(null);
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

  function addNote(bucket: NoteBucket, text: string, clear: () => void) {
    // The crisis check still reads anything a person writes on this page.
    setCrisis(detectCrisis(text).length > 0 ? { bucket, text } : null);
    const id = createNoteId();
    const now = new Date().toISOString();
    save((current) => addPrivateNote(current, bucket, text, now, id));
    if (!sample) clear();
  }

  const usNumbers = showEmergencyNumbers(stored.country);

  function crisisAlert(bucket: NoteBucket) {
    if (crisis?.bucket !== bucket) return null;
    return (
      <p className="ew-bubble ew-bubble-crisis" role="alert">
        {crisisReply(detectCrisis(crisis.text), stored.country, t)}
      </p>
    );
  }

  return (
    <div className="stack-lg">
      <header className="stack">
        <p className="kicker">{t(PAGE_TITLE)}</p>
        <h1>{t(HEADLINE)}</h1>
        <p className="lede">{t(SUPPORTING_LINE)}</p>
      </header>

      <section className="card stack" aria-labelledby="ew-limits">
        <h2 id="ew-limits">{t("What this page is")}</h2>
        <p>{t(PAGE_INTRO)}</p>
        <p className="alert alert-error">{t(CLINICAL_REVIEW_NOTICE)}</p>
        <p className="banner" role="note">
          {standingCrisisNotice(stored.country, t)}
        </p>
      </section>

      <section className="card stack" aria-labelledby="ew-country">
        <h2 id="ew-country">{t("Country for crisis numbers")}</h2>
        <fieldset className="stack">
          <legend className="sr-only">{t("Country for crisis numbers")}</legend>
          <p className="hint">
            {t(
              "If you are in the United States, or haven't chosen a country, this page shows United States crisis numbers. In another country, please contact your local emergency services.",
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

      <section className="card stack" id="mind" aria-labelledby="ew-mind">
        <h2 id="ew-mind">{t("Talk it through in LifeZoi Mind")}</h2>
        <p>{t(MIND_CARD_BODY)}</p>
        <p className="hint">{t(MIND_CARD_LANGUAGE)}</p>
        <div className="actions">
          <Link className="btn btn-primary" href="/mind">
            {t("Open LifeZoi Mind")}
          </Link>
        </div>
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
        {crisisAlert("journal")}
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
        {crisisAlert("joys")}
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
        {crisisAlert("caregiverNotes")}
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
          {t("These are real organizations with trained people who can help.")}{" "}
          {usNumbers
            ? t("United States crisis numbers are shown below.")
            : t("United States crisis numbers are hidden because you chose another country. Please contact your local emergency services.")}
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
            "The words on this page were written for LifeZoi. The sources below are listed so you can read more about the ideas.",
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
