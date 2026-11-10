"use client";

import { useEffect, useMemo, useState } from "react";
import type { MemoryActivity } from "@/lib/brain-quiz/activities";
import {
  buildDigits,
  buildOrder,
  buildPairs,
  buildSequence,
  buildWordRecall,
  TILE_COLORS,
} from "@/lib/brain-quiz/engines";
import { Icon } from "@/components/brain-quiz/icons";
import { useLocale, useT } from "@/components/locale-provider";
import { listText, memoryWordsFor, noteText } from "@/lib/brain-quiz/localize";
import { msg } from "@/lib/i18n/translate";

function same(left: readonly string[], right: readonly string[]) {
  return left.length === right.length && left.every((item, index) => item === right[index]);
}

export function MemoryPlay({ activity, onResult }: { activity: MemoryActivity; onResult: (correct: boolean, note: string) => void }) {
  if (activity.mode === "sequence") return <SequencePlay activity={activity} onResult={onResult} />;
  if (activity.mode === "numbers") return <NumberPlay activity={activity} onResult={onResult} />;
  if (activity.mode === "words") return <WordMemory activity={activity} onResult={onResult} />;
  if (activity.mode === "pairs") return <PairPlay activity={activity} onResult={onResult} />;
  return <OrderPlay activity={activity} onResult={onResult} />;
}

function SequencePlay({ activity, onResult }: { activity: MemoryActivity; onResult: (correct: boolean, note: string) => void }) {
  const t = useT();
  const sequence = useMemo(() => buildSequence(activity.id, activity.difficulty), [activity.id, activity.difficulty]);
  const [phase, setPhase] = useState<"watch" | "play" | "done">("watch");
  const [lit, setLit] = useState(-1);
  const [guess, setGuess] = useState<string[]>([]);
  const [note, setNote] = useState("");

  useEffect(() => {
    const timers: number[] = [];
    sequence.forEach((_, index) => {
      timers.push(window.setTimeout(() => setLit(index), 500 + index * 700));
      timers.push(window.setTimeout(() => setLit(-1), 500 + index * 700 + 420));
    });
    timers.push(window.setTimeout(() => setPhase("play"), 500 + sequence.length * 700));
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [activity.id, sequence]);

  function tap(color: string) {
    if (phase !== "play") return;
    const next = [...guess, color];
    setGuess(next);
    if (sequence[next.length - 1] !== color || next.length === sequence.length) {
      const correct = same(next, sequence);
      const text = correct ? msg("You repeated the color sequence.") : `The sequence was ${sequence.join(", ")}.`;
      setNote(text);
      setPhase("done");
      onResult(correct, text);
    }
  }

  return (
    <div className="stack">
      <p>{t(activity.prompt)}</p>
      <p className="hint">{phase === "watch" ? t("Watch") : phase === "play" ? t("Your turn") : noteText(note, t)}</p>
      <div className={"quiz-pads"}>
        {TILE_COLORS.map((color) => (
          <button
            key={color}
            type="button"
            className={`quiz-pad quiz-${color}`}
            aria-label={t(color)}
            aria-pressed={sequence[lit] === color}
            onClick={() => tap(color)}
            disabled={phase !== "play"}
          >
            {t(color).charAt(0).toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  );
}

function NumberPlay({ activity, onResult }: { activity: MemoryActivity; onResult: (correct: boolean, note: string) => void }) {
  const t = useT();
  const digits = useMemo(() => buildDigits(activity.id, activity.difficulty), [activity.id, activity.difficulty]);
  const [phase, setPhase] = useState<"watch" | "play" | "done">("watch");
  const [shown, setShown] = useState("");
  const [guess, setGuess] = useState("");

  useEffect(() => {
    const timers: number[] = [];
    digits.split("").forEach((digit, index) => {
      timers.push(window.setTimeout(() => setShown(digit), 400 + index * 700));
      timers.push(window.setTimeout(() => setShown(""), 400 + index * 700 + 420));
    });
    timers.push(window.setTimeout(() => setPhase("play"), 400 + digits.length * 700));
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [activity.id, digits]);

  function add(digit: string) {
    if (phase !== "play" || guess.length >= digits.length) return;
    const next = guess + digit;
    setGuess(next);
    if (next.length === digits.length) {
      const correct = next === digits;
      const text = correct ? msg("You entered the digits in order.") : `The digits were ${digits}.`;
      setPhase("done");
      onResult(correct, text);
    }
  }

  return (
    <div className="stack">
      <p>{t(activity.prompt)}</p>
      <p className="hint" aria-live="polite">{phase === "watch" ? shown || t("Watch") : phase === "play" ? guess || t("Your turn") : guess}</p>
      <div className={"quiz-keys"}>
        {Array.from({ length: 10 }, (_, digit) => (
          <button key={digit} type="button" className={"quiz-key"} onClick={() => add(String(digit))} disabled={phase !== "play"}>
            {digit}
          </button>
        ))}
      </div>
    </div>
  );
}

function WordMemory({ activity, onResult }: { activity: MemoryActivity; onResult: (correct: boolean, note: string) => void }) {
  const { locale, t } = useLocale();
  const round = useMemo(
    () => buildWordRecall(activity.id, activity.difficulty, memoryWordsFor(locale)),
    [activity.id, activity.difficulty, locale],
  );
  const [phase, setPhase] = useState<"study" | "pick" | "done">("study");
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    const timer = window.setTimeout(() => setPhase("pick"), activity.difficulty === "hard" ? 7000 : 4500);
    return () => window.clearTimeout(timer);
  }, [activity.difficulty, activity.id]);

  function toggle(word: string) {
    if (phase !== "pick") return;
    setSelected((current) => (current.includes(word) ? current.filter((item) => item !== word) : [...current, word]));
  }

  function submit() {
    const correct = same([...round.shown].sort(), [...selected].sort());
    const text = correct ? msg("You selected the full word set.") : `The words were ${round.shown.join(", ")}.`;
    setPhase("done");
    onResult(correct, text);
  }

  return (
    <div className="stack">
      <p>{t(activity.prompt)}</p>
      {phase === "study" ? (
        <div className={"quiz-iconGrid"}>
          {round.shown.map((word) => <p key={word} className="card">{word}</p>)}
        </div>
      ) : (
        <>
          <div className={"quiz-iconGrid"}>
            {round.options.map((word) => (
              <button key={word} type="button" className={"quiz-cardBtn"} aria-pressed={selected.includes(word)} onClick={() => toggle(word)} disabled={phase === "done"}>
                {word}
              </button>
            ))}
          </div>
          {phase === "pick" ? <button className="btn btn-primary" type="button" onClick={submit}>{t("Check the set")}</button> : <p>{t("The words were {items}.", { items: listText(round.shown, t) })}</p>}
        </>
      )}
    </div>
  );
}

function PairPlay({ activity, onResult }: { activity: MemoryActivity; onResult: (correct: boolean, note: string) => void }) {
  const t = useT();
  const deck = useMemo(() => buildPairs(activity.id, activity.difficulty), [activity.id, activity.difficulty]);
  const [open, setOpen] = useState<number[]>([]);
  const [matched, setMatched] = useState<string[]>([]);
  const [done, setDone] = useState(false);

  function tap(index: number) {
    if (done || open.length >= 2 || open.includes(index) || matched.includes(deck[index] ?? "")) return;
    const next = [...open, index];
    if (next.length < 2) {
      setOpen(next);
      return;
    }
    const [first] = next;
    if (deck[first ?? -1] === deck[index]) {
      const icon = deck[index] ?? "";
      const found = [...matched, icon];
      setMatched(found);
      setOpen([]);
      const pairCount = new Set(deck).size;
      if (found.length === pairCount) {
        setDone(true);
        onResult(true, msg("You matched every pair."));
      }
      return;
    }
    setOpen(next);
    window.setTimeout(() => setOpen([]), 700);
  }

  return (
    <div className="stack">
      <p>{t(activity.prompt)}</p>
      <div className={"quiz-iconGrid"}>
        {deck.map((icon, index) => {
          const show = open.includes(index) || matched.includes(icon);
          return (
            <button key={`${icon}-${index}`} type="button" className={"quiz-cardBtn"} data-open={show} data-matched={matched.includes(icon)} onClick={() => tap(index)} aria-label={show ? t(icon) : t("Hidden card")}>
              {show ? <Icon name={icon} /> : "?"}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function OrderPlay({ activity, onResult }: { activity: MemoryActivity; onResult: (correct: boolean, note: string) => void }) {
  const t = useT();
  const order = useMemo(() => buildOrder(activity.id, activity.difficulty), [activity.id, activity.difficulty]);
  const [phase, setPhase] = useState<"show" | "play" | "done">("show");
  const [guess, setGuess] = useState<string[]>([]);
  const mixed = [...order].reverse();

  function tap(icon: string) {
    if (phase !== "play" || guess.includes(icon)) return;
    const next = [...guess, icon];
    setGuess(next);
    if (next.length === order.length) {
      const correct = same(next, order);
      const text = correct ? msg("You tapped the pictures in order.") : `The order was ${order.join(", ")}.`;
      setPhase("done");
      onResult(correct, text);
    }
  }

  return (
    <div className="stack">
      <p>{t(activity.prompt)}</p>
      {phase === "show" ? (
        <>
          <div className={"quiz-row"}>
            {order.map((icon, index) => (
              <div key={icon} className="card">
                <span>{index + 1}</span>
                <Icon name={icon} />
              </div>
            ))}
          </div>
          <button className="btn btn-primary" type="button" onClick={() => setPhase("play")}>{t("Hide and mix")}</button>
        </>
      ) : (
        <div className={"quiz-iconGrid"}>
          {mixed.map((icon) => (
            <button key={icon} type="button" className={"quiz-cardBtn"} onClick={() => tap(icon)} disabled={guess.includes(icon) || phase === "done"}>
              <Icon name={icon} />
            </button>
          ))}
        </div>
      )}
      {phase === "done" ? <p>{same(guess, order) ? t("The order matched.") : t("The order was {items}.", { items: listText(order, t) })}</p> : null}
    </div>
  );
}
