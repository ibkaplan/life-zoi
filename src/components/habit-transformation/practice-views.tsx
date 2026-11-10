"use client";

import Link from "next/link";
import { useState } from "react";
import { HabitFrame } from "@/components/habit-transformation/frame";
import { useHabitJourney } from "@/components/habit-transformation/use-habit-journey";
import { useT } from "@/components/locale-provider";
import { HELPED, IN_THE_WAY, MICHIE_URL, RESTART_LINE, type HabitId } from "@/lib/habit-transformation/catalog";
import { ruleCoachNote } from "@/lib/habit-transformation/coach";
import {
  actionCard,
  answerLines,
  plansFor,
  showRestart,
  smallerNextStep,
  statusCopy,
} from "@/lib/habit-transformation/engine";
import {
  habitName,
  logAction,
  saveAcknowledgment,
  saveCheck,
  type ActionStatus,
  type CompletedAnswer,
  type DifficultyAnswer,
  type FeelingAnswer,
} from "@/lib/habit-transformation/model";
import { localISODate } from "@/lib/dates";

function Loading() {
  const t = useT();
  return (
    <HabitFrame>
      <p className="card">{t("Loading your habit journey…")}</p>
    </HabitFrame>
  );
}

export function HabitsView() {
  const { journey, ready } = useHabitJourney();
  const t = useT();
  if (!ready) return <Loading />;
  return (
    <HabitFrame>
      <section className="stack">
        <h1>{t("My Current Habits")}</h1>
        <p>{t("These are the habits you chose to look at. Nothing here is a diagnosis.")}</p>
      </section>
      {journey.picks.length === 0 ? (
        <section className="card stack">
          <p>{t("No habits are saved yet.")}</p>
          <Link className="btn btn-primary" href="/habit-transformation/journey">{t("Start My Habit Journey")}</Link>
        </section>
      ) : (
        journey.picks.map((pick) => (
          <section className="card stack" key={pick.habitId}>
            <h2>{habitName(pick, t)}</h2>
            <dl className="review-list stack">
              {answerLines(pick, t).map((line) => (
                <div key={line.label}>
                  <dt>{line.label}</dt>
                  <dd>{line.value}</dd>
                </div>
              ))}
            </dl>
          </section>
        ))
      )}
      {journey.picks.length > 0 ? (
        <p><Link href="/habit-transformation/journey">{t("Change my answers")}</Link></p>
      ) : null}
    </HabitFrame>
  );
}

export function PlanView() {
  const { journey, ready } = useHabitJourney();
  const t = useT();
  if (!ready) return <Loading />;
  const plans = plansFor(journey, t);
  return (
    <HabitFrame>
      <section className="stack">
        <h1>{t("My Personal Action Plan")}</h1>
        <p>{t("Each plan stays small. A five-minute walk, one evening snack swap, or a 10-minute wind-down is the size of a practice, not a test.")}</p>
        <p className="hint">{t("Not a diagnosis. Not clinically validated. No specific health outcome is guaranteed.")}</p>
      </section>
      {plans.length === 0 ? (
        <section className="card stack">
          <p>{t("A plan appears after you answer the short journey questions.")}</p>
          <Link className="btn btn-primary" href="/habit-transformation/journey">{t("Start My Habit Journey")}</Link>
        </section>
      ) : (
        plans.map((plan) => (
          <article className="card stack" key={plan.habitId}>
            <h2>{plan.name}</h2>
            <h3>{t("Why it continues")}</h3>
            <p>{plan.why}</p>
            <h3>{t("Capability, Opportunity, Motivation, Behavior")}</h3>
            <p>
              {t("Michie, van Stralen, and West (2011) described COM-B.")}{" "}
              <a href={MICHIE_URL}>{t("Read the paper")}</a>.
            </p>
            <p><strong>{plan.difficultLine}</strong></p>
            <p><strong>{plan.reading.partLabel}.</strong> {plan.reading.barrier}</p>
            <p>{plan.reading.strategy}</p>
            {plan.reading.extra ? <p>{plan.reading.extra}</p> : null}
            <p>{t("Behavior is the habit you chose. This reading is one possible way to look at it.")}</p>
            <h3>{t("One small action")}</h3>
            <p>{plan.smallAction}</p>
            <h3>{t("A daily routine")}</h3>
            <p className="habit-quote">{plan.routine}</p>
            <h3>{t("A prompt")}</h3>
            <p>{plan.prompt}</p>
            <h3>{t("An easier hard-day alternative")}</h3>
            <p>{plan.easierAction}</p>
            <h3>{t("How to notice progress")}</h3>
            <p>{plan.notice}</p>
            <h3>{t("A weekly review")}</h3>
            <p>{plan.weekly}</p>
            {plan.safety ? <p>{plan.safety}</p> : null}
            <p className="hint">
              {ruleCoachNote(
                {
                  habitId: plan.habitId,
                  habitName: plan.name,
                  barrier: plan.reading.part,
                  barrierLabel: plan.reading.partLabel,
                  smallAction: plan.smallAction,
                  easierAction: plan.easierAction,
                },
                t,
              )}
            </p>
          </article>
        ))
      )}
    </HabitFrame>
  );
}

export function ActionsView() {
  const { journey, ready, sample, save } = useHabitJourney();
  const t = useT();
  const today = localISODate();
  if (!ready) return <Loading />;
  const restart = showRestart(journey, today);
  return (
    <HabitFrame>
      <section className="stack">
        <h1>{t("My Tiny Daily Actions")}</h1>
        <p>{t("After I [existing routine], I will [small new action].")}</p>
      </section>
      {restart ? (
        <p className="banner" role="status">
          {t(RESTART_LINE)} {t("A missed day is not a failure. Achievements stay.")}
        </p>
      ) : null}
      {journey.picks.length === 0 ? (
        <section className="card stack">
          <p>{t("Tiny actions appear after you save a journey.")}</p>
          <Link className="btn btn-primary" href="/habit-transformation/journey">{t("Start My Habit Journey")}</Link>
        </section>
      ) : (
        journey.picks.map((pick) => (
          <ActionCard
            key={pick.habitId}
            habitId={pick.habitId}
            card={actionCard(journey, pick, today, t)}
            disabled={sample}
            onLog={(status, patch) => save(logAction(journey, pick.habitId, today, status, patch))}
            onNote={(acknowledgment) => save(saveAcknowledgment(journey, pick.habitId, acknowledgment))}
          />
        ))
      )}
    </HabitFrame>
  );
}

function ActionCard({
  habitId,
  card,
  disabled,
  onLog,
  onNote,
}: {
  habitId: HabitId;
  card: ReturnType<typeof actionCard>;
  disabled: boolean;
  onLog: (status: ActionStatus, patch?: { cue?: string; action?: string; acknowledgment?: string; usingEasier?: boolean }) => void;
  onNote: (acknowledgment: string) => void;
}) {
  const t = useT();
  const [editing, setEditing] = useState(false);
  const [cue, setCue] = useState(card.cue);
  const [action, setAction] = useState(card.smallAction);
  const [note, setNote] = useState(card.acknowledgment);

  return (
    <article className="card stack">
      <h2>{card.name}</h2>
      <p className="habit-quote">{card.routine}</p>
      <dl className="review-list stack">
        <div><dt>{t("What")}</dt><dd>{card.smallAction}</dd></div>
        <div><dt>{t("When")}</dt><dd>{card.whenLabel}</dd></div>
        <div><dt>{t("Trigger")}</dt><dd>{card.triggerLabel}</dd></div>
        <div><dt>{t("Why")}</dt><dd>{card.personalWhy}</dd></div>
      </dl>
      <label className="stack">
        <span>{t("Acknowledgment, if you want one")}</span>
        <input type="text" value={note} maxLength={160} onChange={(event) => setNote(event.target.value)} />
      </label>
      <p>{statusCopy(card.todayStatus, t)}</p>
      {editing ? (
        <div className="stack">
          <label className="stack">
            <span>{t("Existing routine")}</span>
            <input type="text" value={cue} maxLength={160} onChange={(event) => setCue(event.target.value)} />
          </label>
          <label className="stack">
            <span>{t("Small new action")}</span>
            <input type="text" value={action} maxLength={160} onChange={(event) => setAction(event.target.value)} />
          </label>
          <button
            className="btn btn-primary"
            type="button"
            disabled={disabled || cue.trim().length === 0 || action.trim().length === 0}
            onClick={() => {
              onLog("changed", { cue: cue.trim(), action: action.trim(), acknowledgment: note, usingEasier: false });
              setEditing(false);
            }}
          >
            {t("Save this wording")}
          </button>
        </div>
      ) : null}
      <div className="actions">
        <button className="btn btn-primary" type="button" disabled={disabled} onClick={() => onLog("accepted", { acknowledgment: note })}>{t("Accept")}</button>
        <button
          className="btn btn-secondary"
          type="button"
          disabled={disabled}
          onClick={() => {
            // The wording fields start with the text as it is shown now, in the chosen language.
            setCue(card.cue);
            setAction(card.smallAction);
            setEditing(true);
          }}
        >
          {t("Change")}
        </button>
        <button className="btn btn-secondary" type="button" disabled={disabled} onClick={() => onLog("easier", { acknowledgment: note })}>{t("Make easier")}</button>
        <button className="btn btn-secondary" type="button" disabled={disabled} onClick={() => onLog("skipped", { acknowledgment: note })}>{t("Skip")}</button>
        <button className="btn btn-secondary" type="button" disabled={disabled} onClick={() => onLog("complete", { acknowledgment: note })}>{t("Mark complete")}</button>
        <button className="btn btn-ghost" type="button" disabled={disabled} onClick={() => onNote(note)}>{t("Save acknowledgment")}</button>
      </div>
      <p className="hint" id={`${habitId}-skip`}>{t("Skipping today is allowed. It does not wipe what you have already done.")}</p>
    </article>
  );
}

export function CheckInView() {
  const { journey, ready, sample, save } = useHabitJourney();
  const t = useT();
  const today = localISODate();
  const [habitId, setHabitId] = useState<HabitId | "">("");
  const [completed, setCompleted] = useState<CompletedAnswer | "">("");
  const [difficulty, setDifficulty] = useState<DifficultyAnswer | "">("");
  const [feeling, setFeeling] = useState<FeelingAnswer | "">("");
  const [helpedId, setHelpedId] = useState("");
  const [helpedNote, setHelpedNote] = useState("");
  const [wayId, setWayId] = useState("");
  const [wayNote, setWayNote] = useState("");
  const [error, setError] = useState("");
  const [offer, setOffer] = useState<{ kind: "smaller" | "same"; check: Parameters<typeof smallerNextStep>[0]; habitId: HabitId } | null>(null);

  if (!ready) return <Loading />;
  const selected = habitId || journey.picks[0]?.habitId || "";
  const pick = journey.picks.find((item) => item.habitId === selected);

  function submit() {
    if (!pick || !completed || !difficulty || !feeling || !helpedId || !wayId) {
      setError(t("Answer each question. The extra lines can stay blank."));
      return;
    }
    const check = {
      date: today,
      habitId: pick.habitId,
      completed,
      difficulty,
      feeling,
      helpedId,
      helpedNote: helpedNote.trim(),
      wayId,
      wayNote: wayNote.trim(),
    };
    const next = saveCheck(journey, check);
    save(next);
    const card = actionCard(next, pick, today);
    const step = smallerNextStep(check, card.easierAction);
    setOffer({ kind: step.kind, check, habitId: pick.habitId });
    setError("");
  }

  // The offer is worded at render time, so it follows the chosen language.
  const offerPick = offer ? journey.picks.find((item) => item.habitId === offer.habitId) : undefined;
  const offerText =
    offer && offerPick ? smallerNextStep(offer.check, actionCard(journey, offerPick, today, t).easierAction, t).text : "";

  return (
    <HabitFrame>
      <section className="stack">
        <h1>{t("Daily Check-In")}</h1>
        <p>{t("A few questions about today. The answers can suggest a smaller next step. They do not judge the day.")}</p>
      </section>
      {journey.picks.length === 0 ? (
        <section className="card stack">
          <p>{t("Choose a habit before the check-in.")}</p>
          <Link className="btn btn-primary" href="/habit-transformation/journey">{t("Start My Habit Journey")}</Link>
        </section>
      ) : (
        <form
          className="card stack"
          onSubmit={(event) => {
            event.preventDefault();
            if (!sample) submit();
          }}
        >
          <fieldset className="stack">
            <legend>{t("Which habit is this check-in for?")}</legend>
            <div className="choices">
              {journey.picks.map((item) => (
                <label className="choice" key={item.habitId}>
                  <input
                    type="radio"
                    name="check-habit"
                    checked={selected === item.habitId}
                    onChange={() => setHabitId(item.habitId)}
                  />
                  <span>{habitName(item, t)}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <Radio legend={t("Did you complete the tiny action?")} name="completed" value={completed} onChange={setCompleted} options={[
            ["yes", t("Yes")],
            ["partly", t("Partly")],
            ["not-today", t("Not today")],
          ]} />
          <Radio legend={t("How difficult did it feel?")} name="difficulty" value={difficulty} onChange={setDifficulty} options={[
            ["light", t("Light")],
            ["mixed", t("Mixed")],
            ["heavy", t("Heavy")],
          ]} />
          <Radio legend={t("How did you feel afterward?")} name="feeling" value={feeling} onChange={setFeeling} options={[
            ["settled", t("A bit more settled")],
            ["same", t("About the same")],
            ["tender", t("Tender")],
          ]} />
          <Radio legend={t("What helped?")} name="helped" value={helpedId} onChange={setHelpedId} options={HELPED.map((item) => [item.id, t(item.label)])} />
          <label className="stack">
            <span>{t("Anything else that helped")}</span>
            <input type="text" value={helpedNote} maxLength={160} onChange={(event) => setHelpedNote(event.target.value)} />
          </label>
          <Radio legend={t("What got in the way?")} name="way" value={wayId} onChange={setWayId} options={IN_THE_WAY.map((item) => [item.id, t(item.label)])} />
          <label className="stack">
            <span>{t("Anything else that got in the way")}</span>
            <input type="text" value={wayNote} maxLength={160} onChange={(event) => setWayNote(event.target.value)} />
          </label>
          {error ? <p role="alert">{error}</p> : null}
          <button className="btn btn-primary" type="submit" disabled={sample}>{t("Save check-in")}</button>
        </form>
      )}
      {offer ? (
        <section className="card stack" role="status">
          <h2>{offer.kind === "smaller" ? t("A smaller next step") : t("Keep the same step")}</h2>
          <p>{offerText}</p>
          {offer.kind === "smaller" ? (
            <button
              className="btn btn-secondary"
              type="button"
              disabled={sample}
              onClick={() => save(logAction(journey, offer.habitId, today, "easier"))}
            >
              {t("Use the smaller step")}
            </button>
          ) : null}
        </section>
      ) : null}
    </HabitFrame>
  );
}

function Radio<T extends string>({
  legend,
  name,
  value,
  onChange,
  options,
}: {
  legend: string;
  name: string;
  value: T | "";
  onChange: (value: T) => void;
  options: [T, string][];
}) {
  return (
    <fieldset className="stack">
      <legend>{legend}</legend>
      <div className="choices">
        {options.map(([id, label]) => (
          <label className="choice" key={id}>
            <input type="radio" name={name} checked={value === id} onChange={() => onChange(id)} />
            <span>{label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
