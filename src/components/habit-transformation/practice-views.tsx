"use client";

import Link from "next/link";
import { useState } from "react";
import { HabitFrame } from "@/components/habit-transformation/frame";
import { useHabitJourney } from "@/components/habit-transformation/use-habit-journey";
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

export function HabitsView() {
  const { journey, ready } = useHabitJourney();
  if (!ready) return <HabitFrame><p className="card">Loading your habit journey…</p></HabitFrame>;
  return (
    <HabitFrame>
      <section className="stack">
        <h1>My Current Habits</h1>
        <p>These are the habits you chose to look at. Nothing here is a diagnosis.</p>
      </section>
      {journey.picks.length === 0 ? (
        <section className="card stack">
          <p>No habits are saved yet.</p>
          <Link className="btn btn-primary" href="/habit-transformation/journey">Start My Habit Journey</Link>
        </section>
      ) : (
        journey.picks.map((pick) => (
          <section className="card stack" key={pick.habitId}>
            <h2>{habitName(pick)}</h2>
            <dl className="review-list stack">
              {answerLines(pick).map((line) => (
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
        <p><Link href="/habit-transformation/journey">Change my answers</Link></p>
      ) : null}
    </HabitFrame>
  );
}

export function PlanView() {
  const { journey, ready } = useHabitJourney();
  if (!ready) return <HabitFrame><p className="card">Loading your habit journey…</p></HabitFrame>;
  const plans = plansFor(journey);
  return (
    <HabitFrame>
      <section className="stack">
        <h1>My Personal Action Plan</h1>
        <p>Each plan stays small. A five-minute walk, one evening snack swap, or a 10-minute wind-down is the size of a practice, not a test.</p>
        <p className="hint">Not a diagnosis. Not clinically validated. No specific health outcome is guaranteed.</p>
      </section>
      {plans.length === 0 ? (
        <section className="card stack">
          <p>A plan appears after you answer the short journey questions.</p>
          <Link className="btn btn-primary" href="/habit-transformation/journey">Start My Habit Journey</Link>
        </section>
      ) : (
        plans.map((plan) => (
          <article className="card stack" key={plan.habitId}>
            <h2>{plan.name}</h2>
            <h3>Why it continues</h3>
            <p>{plan.why}</p>
            <h3>Capability, Opportunity, Motivation, Behavior</h3>
            <p>
              Michie, van Stralen, and West (2011) described COM-B.{" "}
              <a href={MICHIE_URL}>Read the paper</a>.
            </p>
            <p><strong>{plan.difficultLine}</strong></p>
            <p><strong>{plan.reading.partLabel}.</strong> {plan.reading.barrier}</p>
            <p>{plan.reading.strategy}</p>
            {plan.reading.extra ? <p>{plan.reading.extra}</p> : null}
            <p>Behavior is the habit you chose. This reading is one possible way to look at it.</p>
            <h3>One small action</h3>
            <p>{plan.smallAction}</p>
            <h3>A daily routine</h3>
            <p className="habit-quote">{plan.routine}</p>
            <h3>A prompt</h3>
            <p>{plan.prompt}</p>
            <h3>An easier hard-day alternative</h3>
            <p>{plan.easierAction}</p>
            <h3>How to notice progress</h3>
            <p>{plan.notice}</p>
            <h3>A weekly review</h3>
            <p>{plan.weekly}</p>
            {plan.safety ? <p>{plan.safety}</p> : null}
            <p className="hint">
              {ruleCoachNote({
                habitId: plan.habitId,
                habitName: plan.name,
                barrier: plan.reading.part,
                barrierLabel: plan.reading.partLabel,
                smallAction: plan.smallAction,
                easierAction: plan.easierAction,
              })}
            </p>
          </article>
        ))
      )}
    </HabitFrame>
  );
}

export function ActionsView() {
  const { journey, ready, sample, save } = useHabitJourney();
  const today = localISODate();
  if (!ready) return <HabitFrame><p className="card">Loading your habit journey…</p></HabitFrame>;
  const restart = showRestart(journey, today);
  return (
    <HabitFrame>
      <section className="stack">
        <h1>My Tiny Daily Actions</h1>
        <p>After I [existing routine], I will [small new action].</p>
      </section>
      {restart ? (
        <p className="banner" role="status">
          {RESTART_LINE} A missed day is not a failure. Achievements stay.
        </p>
      ) : null}
      {journey.picks.length === 0 ? (
        <section className="card stack">
          <p>Tiny actions appear after you save a journey.</p>
          <Link className="btn btn-primary" href="/habit-transformation/journey">Start My Habit Journey</Link>
        </section>
      ) : (
        journey.picks.map((pick) => (
          <ActionCard
            key={pick.habitId}
            habitId={pick.habitId}
            card={actionCard(journey, pick, today)}
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
  const [editing, setEditing] = useState(false);
  const [cue, setCue] = useState(card.cue);
  const [action, setAction] = useState(card.smallAction);
  const [note, setNote] = useState(card.acknowledgment);

  return (
    <article className="card stack">
      <h2>{card.name}</h2>
      <p className="habit-quote">{card.routine}</p>
      <dl className="review-list stack">
        <div><dt>What</dt><dd>{card.smallAction}</dd></div>
        <div><dt>When</dt><dd>{card.whenLabel}</dd></div>
        <div><dt>Trigger</dt><dd>{card.triggerLabel}</dd></div>
        <div><dt>Why</dt><dd>{card.personalWhy}</dd></div>
      </dl>
      <label className="stack">
        <span>Acknowledgment, if you want one</span>
        <input type="text" value={note} maxLength={160} onChange={(event) => setNote(event.target.value)} />
      </label>
      <p>{statusCopy(card.todayStatus)}</p>
      {editing ? (
        <div className="stack">
          <label className="stack">
            <span>Existing routine</span>
            <input type="text" value={cue} maxLength={160} onChange={(event) => setCue(event.target.value)} />
          </label>
          <label className="stack">
            <span>Small new action</span>
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
            Save this wording
          </button>
        </div>
      ) : null}
      <div className="actions">
        <button className="btn btn-primary" type="button" disabled={disabled} onClick={() => onLog("accepted", { acknowledgment: note })}>Accept</button>
        <button className="btn btn-secondary" type="button" disabled={disabled} onClick={() => setEditing(true)}>Change</button>
        <button className="btn btn-secondary" type="button" disabled={disabled} onClick={() => onLog("easier", { acknowledgment: note })}>Make easier</button>
        <button className="btn btn-secondary" type="button" disabled={disabled} onClick={() => onLog("skipped", { acknowledgment: note })}>Skip</button>
        <button className="btn btn-secondary" type="button" disabled={disabled} onClick={() => onLog("complete", { acknowledgment: note })}>Mark complete</button>
        <button className="btn btn-ghost" type="button" disabled={disabled} onClick={() => onNote(note)}>Save acknowledgment</button>
      </div>
      <p className="hint" id={`${habitId}-skip`}>Skipping today is allowed. It does not wipe what you have already done.</p>
    </article>
  );
}

export function CheckInView() {
  const { journey, ready, sample, save } = useHabitJourney();
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
  const [offer, setOffer] = useState<{ kind: "smaller" | "same"; text: string; habitId: HabitId } | null>(null);

  if (!ready) return <HabitFrame><p className="card">Loading your habit journey…</p></HabitFrame>;
  const selected = habitId || journey.picks[0]?.habitId || "";
  const pick = journey.picks.find((item) => item.habitId === selected);

  function submit() {
    if (!pick || !completed || !difficulty || !feeling || !helpedId || !wayId) {
      setError("Answer each question. The extra lines can stay blank.");
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
    setOffer({ ...step, habitId: pick.habitId });
    setError("");
  }

  return (
    <HabitFrame>
      <section className="stack">
        <h1>Daily Check-In</h1>
        <p>A few questions about today. The answers can suggest a smaller next step. They do not judge the day.</p>
      </section>
      {journey.picks.length === 0 ? (
        <section className="card stack">
          <p>Choose a habit before the check-in.</p>
          <Link className="btn btn-primary" href="/habit-transformation/journey">Start My Habit Journey</Link>
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
            <legend>Which habit is this check-in for?</legend>
            <div className="choices">
              {journey.picks.map((item) => (
                <label className="choice" key={item.habitId}>
                  <input
                    type="radio"
                    name="check-habit"
                    checked={selected === item.habitId}
                    onChange={() => setHabitId(item.habitId)}
                  />
                  <span>{habitName(item)}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <Radio legend="Did you complete the tiny action?" name="completed" value={completed} onChange={setCompleted} options={[
            ["yes", "Yes"],
            ["partly", "Partly"],
            ["not-today", "Not today"],
          ]} />
          <Radio legend="How difficult did it feel?" name="difficulty" value={difficulty} onChange={setDifficulty} options={[
            ["light", "Light"],
            ["mixed", "Mixed"],
            ["heavy", "Heavy"],
          ]} />
          <Radio legend="How did you feel afterward?" name="feeling" value={feeling} onChange={setFeeling} options={[
            ["settled", "A bit more settled"],
            ["same", "About the same"],
            ["tender", "Tender"],
          ]} />
          <Radio legend="What helped?" name="helped" value={helpedId} onChange={setHelpedId} options={HELPED.map((item) => [item.id, item.label])} />
          <label className="stack">
            <span>Anything else that helped</span>
            <input type="text" value={helpedNote} maxLength={160} onChange={(event) => setHelpedNote(event.target.value)} />
          </label>
          <Radio legend="What got in the way?" name="way" value={wayId} onChange={setWayId} options={IN_THE_WAY.map((item) => [item.id, item.label])} />
          <label className="stack">
            <span>Anything else that got in the way</span>
            <input type="text" value={wayNote} maxLength={160} onChange={(event) => setWayNote(event.target.value)} />
          </label>
          {error ? <p role="alert">{error}</p> : null}
          <button className="btn btn-primary" type="submit" disabled={sample}>Save check-in</button>
        </form>
      )}
      {offer ? (
        <section className="card stack" role="status">
          <h2>{offer.kind === "smaller" ? "A smaller next step" : "Keep the same step"}</h2>
          <p>{offer.text}</p>
          {offer.kind === "smaller" ? (
            <button
              className="btn btn-secondary"
              type="button"
              disabled={sample}
              onClick={() => save(logAction(journey, offer.habitId, today, "easier"))}
            >
              Use the smaller step
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
