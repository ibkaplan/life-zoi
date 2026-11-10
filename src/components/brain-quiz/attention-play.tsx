"use client";

import { useMemo, useState } from "react";
import type { AttentionActivity } from "@/lib/brain-quiz/activities";
import {
  buildDifferences,
  buildHidden,
  buildMissing,
  buildMistake,
  buildOdd,
  buildPattern,
} from "@/lib/brain-quiz/engines";
import { Icon, ShapeGlyph } from "@/components/brain-quiz/icons";
import { useT } from "@/components/locale-provider";
import { listText } from "@/lib/brain-quiz/localize";
import { msg } from "@/lib/i18n/translate";

export function AttentionPlay({ activity, onResult }: { activity: AttentionActivity; onResult: (correct: boolean, note: string) => void }) {
  if (activity.mode === "differences") return <DifferencePlay activity={activity} onResult={onResult} />;
  if (activity.mode === "missing") return <MissingPlay activity={activity} onResult={onResult} />;
  if (activity.mode === "odd") return <OddPlay activity={activity} onResult={onResult} />;
  if (activity.mode === "pattern") return <PatternPlay activity={activity} onResult={onResult} />;
  if (activity.mode === "mistake") return <MistakePlay activity={activity} onResult={onResult} />;
  return <HiddenPlay activity={activity} onResult={onResult} />;
}

function Scene({ shapes, interactive, selected, onToggle }: {
  shapes: { id: string; shape: string; x: number; y: number; color: string }[];
  interactive?: boolean;
  selected?: string[];
  onToggle?: (id: string) => void;
}) {
  const t = useT();
  return (
    <div className={"quiz-scene"}>
      {shapes.map((shape) =>
        interactive ? (
          <button
            key={shape.id}
            type="button"
            className={`quiz-spot quiz-shapeBtn`}
            style={{ left: `${shape.x}%`, top: `${shape.y}%` }}
            aria-pressed={selected?.includes(shape.id)}
            aria-label={t("{shape} in the right picture", { shape: t(shape.shape) })}
            onClick={() => onToggle?.(shape.id)}
          >
            <ShapeGlyph shape={shape.shape} color={shape.color} />
          </button>
        ) : (
          <span key={shape.id} className={"quiz-spot"} style={{ left: `${shape.x}%`, top: `${shape.y}%` }}>
            <ShapeGlyph shape={shape.shape} color={shape.color} />
          </span>
        ),
      )}
    </div>
  );
}

function DifferencePlay({ activity, onResult }: { activity: AttentionActivity; onResult: (correct: boolean, note: string) => void }) {
  const t = useT();
  const puzzle = useMemo(() => buildDifferences(activity.id, activity.difficulty), [activity.id, activity.difficulty]);
  const [selected, setSelected] = useState<string[]>([]);
  const [done, setDone] = useState(false);

  function toggle(id: string) {
    if (done) return;
    setSelected((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  }

  function check() {
    const correct = selected.length === puzzle.changedIds.length && puzzle.changedIds.every((id) => selected.includes(id));
    setDone(true);
    onResult(correct, correct ? msg("You found every change.") : `The changed shapes were ${puzzle.changedIds.join(", ")}.`);
  }

  return (
    <div className="stack">
      <p>{t(activity.prompt)}</p>
      <div className={"quiz-sceneRow"}>
        <Scene shapes={puzzle.left} />
        <Scene shapes={puzzle.right} interactive selected={selected} onToggle={toggle} />
      </div>
      {done ? <p>{selected.length === puzzle.changedIds.length && puzzle.changedIds.every((id) => selected.includes(id)) ? t("Every change was selected.") : t("The changed shapes were {items}.", { items: listText(puzzle.changedIds, t) })}</p> : (
        <button className="btn btn-primary" type="button" onClick={check} disabled={selected.length === 0}>{t("Check spots")}</button>
      )}
    </div>
  );
}

function MissingPlay({ activity, onResult }: { activity: AttentionActivity; onResult: (correct: boolean, note: string) => void }) {
  const t = useT();
  const puzzle = useMemo(() => buildMissing(activity.id, activity.difficulty), [activity.id, activity.difficulty]);
  const [phase, setPhase] = useState<"look" | "ask" | "done">("look");
  const [picked, setPicked] = useState("");

  function choose(icon: string) {
    if (phase !== "ask") return;
    const correct = icon === puzzle.correct;
    setPicked(icon);
    setPhase("done");
    onResult(correct, correct ? msg("You found the missing object.") : `The missing object was ${puzzle.correct}.`);
  }

  return (
    <div className="stack">
      <p>{t(activity.prompt)}</p>
      {phase === "look" ? (
        <>
          <div className={"quiz-iconGrid"}>{puzzle.first.map((icon) => <Icon key={icon} name={icon} />)}</div>
          <button className="btn btn-primary" type="button" onClick={() => setPhase("ask")}>{t("Hide one")}</button>
        </>
      ) : (
        <>
          <div className={"quiz-iconGrid"}>{puzzle.second.map((icon) => <Icon key={icon} name={icon} />)}</div>
          <div className={"quiz-iconGrid"}>
            {puzzle.options.map((icon) => (
              <button key={icon} type="button" className={"quiz-cardBtn"} aria-pressed={picked === icon} disabled={phase === "done"} onClick={() => choose(icon)}>
                <Icon name={icon} />
                <span className="sr-only">{t(icon)}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function OddPlay({ activity, onResult }: { activity: AttentionActivity; onResult: (correct: boolean, note: string) => void }) {
  const t = useT();
  const puzzle = useMemo(() => buildOdd(activity.id, activity.difficulty), [activity.id, activity.difficulty]);
  const [done, setDone] = useState(false);
  const oddIndex = puzzle.cells.findIndex((cell) => cell.odd);

  return (
    <div className="stack">
      <p>{t(activity.prompt)}</p>
      <div className={"quiz-iconGrid"}>
        {puzzle.cells.map((cell, index) => (
          <button
            key={index}
            type="button"
            className={"quiz-shapeBtn"}
            disabled={done}
            onClick={() => {
              const correct = cell.odd;
              setDone(true);
              onResult(correct, correct ? msg("You found the odd shape.") : `The odd shape was number ${oddIndex + 1}.`);
            }}
          >
            <ShapeGlyph shape={cell.shape} color={cell.color} />
            <span className="sr-only">{t("Shape {number}", { number: index + 1 })}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function PatternPlay({ activity, onResult }: { activity: AttentionActivity; onResult: (correct: boolean, note: string) => void }) {
  const t = useT();
  const puzzle = useMemo(() => buildPattern(activity.id, activity.difficulty), [activity.id, activity.difficulty]);
  const [done, setDone] = useState(false);
  return (
    <div className="stack">
      <p>{t(activity.prompt)}</p>
      <div className={"quiz-row"}>
        {puzzle.shown.map((token, index) => <ShapeGlyph key={index} shape={token.shape} color={token.color} />)}
        <span className={"quiz-letter"}>?</span>
      </div>
      <div className={"quiz-iconGrid"}>
        {puzzle.options.map((token, index) => (
          <button key={`${token.shape}-${token.color}-${index}`} type="button" className={"quiz-shapeBtn"} disabled={done} onClick={() => {
            const correct = index === puzzle.correctIndex;
            setDone(true);
            onResult(correct, correct ? msg("That shape continues the row.") : msg("Another shape continues the row."));
          }}>
            <ShapeGlyph shape={token.shape} color={token.color} />
          </button>
        ))}
      </div>
    </div>
  );
}

function MistakePlay({ activity, onResult }: { activity: AttentionActivity; onResult: (correct: boolean, note: string) => void }) {
  const t = useT();
  const puzzle = useMemo(() => buildMistake(activity.id, activity.difficulty), [activity.id, activity.difficulty]);
  const [done, setDone] = useState(false);
  return (
    <div className="stack">
      <p>{t(activity.prompt)}</p>
      <p className="hint">{t("The count goes up by {step} each time.", { step: puzzle.step })}</p>
      <div className={"quiz-keys"}>
        {puzzle.values.map((value, index) => (
          <button key={`${value}-${index}`} type="button" className={"quiz-key"} disabled={done} onClick={() => {
            const correct = index === puzzle.wrongIndex;
            setDone(true);
            onResult(correct, correct ? msg("That number breaks the count.") : `The mistake was ${puzzle.values[puzzle.wrongIndex]}.`);
          }}>
            {value}
          </button>
        ))}
      </div>
    </div>
  );
}

function HiddenPlay({ activity, onResult }: { activity: AttentionActivity; onResult: (correct: boolean, note: string) => void }) {
  const t = useT();
  const puzzle = useMemo(() => buildHidden(activity.id, activity.difficulty), [activity.id, activity.difficulty]);
  const [done, setDone] = useState(false);
  return (
    <div className="stack">
      <p>{t(activity.prompt)}</p>
      <p className="hint">{t(puzzle.clue)}</p>
      <div className={"quiz-scene"}>
        {puzzle.items.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`quiz-spot quiz-shapeBtn`}
            style={{ left: `${item.x}%`, top: `${item.y}%` }}
            disabled={done}
            aria-label={t("Shape in the picture")}
            onClick={() => {
              setDone(true);
              onResult(item.target, item.target ? msg("You found the star.") : msg("That was not the star."));
            }}
          >
            <Icon name={item.icon} />
          </button>
        ))}
      </div>
    </div>
  );
}
