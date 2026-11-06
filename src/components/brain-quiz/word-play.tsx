"use client";

import { useMemo, useState } from "react";
import type { AcrosticActivity, CrosswordActivity, LetterActivity, WordSearchActivity } from "@/lib/brain-quiz/activities";
import { lineBetween } from "@/lib/brain-quiz/engines";

export function WordSearchPlay({ activity, onResult }: { activity: WordSearchActivity; onResult: (correct: boolean, note: string) => void }) {
  const [start, setStart] = useState<[number, number] | null>(null);
  const [found, setFound] = useState<string[]>([]);
  const [done, setDone] = useState(false);
  const targets = useMemo(() => activity.words.map((word) => word.toUpperCase()), [activity.words]);

  function tap(x: number, y: number) {
    if (done) return;
    if (!start) {
      setStart([x, y]);
      return;
    }
    const word = lineBetween(activity.rows, start, [x, y]);
    const reversed = word ? [...word].reverse().join("") : "";
    const hit = targets.find((item) => item === word || item === reversed);
    setStart(null);
    if (!hit || found.includes(hit)) return;
    const next = [...found, hit];
    setFound(next);
    if (next.length === targets.length) {
      setDone(true);
      onResult(true, "You found every word.");
    }
  }

  return (
    <div className="stack">
      <p>{activity.prompt}</p>
      <div className={"quiz-board"}>
        {activity.rows.map((row, y) => (
          <div key={row} className={"quiz-boardRow"}>
            {row.split("").map((letter, x) => {
              const on = start?.[0] === x && start[1] === y;
              return (
                <button key={`${x}-${y}`} type="button" className={"quiz-letter"} data-on={on} onClick={() => tap(x, y)}>
                  {letter}
                </button>
              );
            })}
          </div>
        ))}
      </div>
      <p>Found: {found.length ? found.join(", ") : "none yet"}</p>
    </div>
  );
}

export function LetterPlay({ activity, onResult }: { activity: LetterActivity; onResult: (correct: boolean, note: string) => void }) {
  const blanks = activity.pattern.split("").filter((letter) => letter === "_").length;
  const [fills, setFills] = useState<string[]>([]);
  const [done, setDone] = useState(false);

  function tap(letter: string, index: number) {
    if (done || fills.length >= blanks) return;
    const next = [...fills, letter];
    setFills(next);
    if (next.length === blanks) {
      let cursor = 0;
      const built = activity.pattern.split("").map((letter) => (letter === "_" ? next[cursor++] : letter)).join("");
      const correct = built === activity.answer;
      setDone(true);
      onResult(correct, correct ? `The word is ${activity.answer}.` : `The word was ${activity.answer}.`);
    }
    void index;
  }

  let cursor = 0;
  const shown = activity.pattern.split("").map((letter) => (letter === "_" ? fills[cursor++] ?? "_" : letter)).join("");

  return (
    <div className="stack">
      <p>{activity.prompt}</p>
      <p className={"quiz-word"}>{shown}</p>
      <div className={"quiz-keys"}>
        {activity.bank.map((letter, index) => (
          <button key={`${letter}-${index}`} type="button" className={"quiz-key"} disabled={done} onClick={() => tap(letter, index)}>
            {letter}
          </button>
        ))}
      </div>
      {!done && fills.length > 0 ? <button className="btn btn-secondary" type="button" onClick={() => setFills([])}>Clear</button> : null}
    </div>
  );
}

export function AcrosticPlay({ activity, onResult }: { activity: AcrosticActivity; onResult: (correct: boolean, note: string) => void }) {
  const [picked, setPicked] = useState<number[]>([]);
  const [done, setDone] = useState(false);
  const letters = picked.map((index) => activity.words[index]?.[0] ?? "").join("");

  function tap(index: number) {
    if (done || picked.includes(index)) return;
    const next = [...picked, index];
    setPicked(next);
    if (next.length === activity.words.length) {
      const word = next.map((item) => activity.words[item]?.[0] ?? "").join("").toUpperCase();
      const correct = word === activity.answer;
      setDone(true);
      onResult(correct, correct ? `The hidden word is ${activity.answer}.` : `The hidden word was ${activity.answer}.`);
    }
  }

  return (
    <div className="stack">
      <p>{activity.prompt}</p>
      <div className={"quiz-iconGrid"}>
        {activity.words.map((word, index) => (
          <button key={word} type="button" className={"quiz-cardBtn"} aria-pressed={picked.includes(index)} disabled={done} onClick={() => tap(index)}>
            {word}
          </button>
        ))}
      </div>
      <p>Letters: {letters || "—"}</p>
    </div>
  );
}

export function CrosswordPlay({ activity, onResult }: { activity: CrosswordActivity; onResult: (correct: boolean, note: string) => void }) {
  const [rows, setRows] = useState(() => activity.grid.map((row) => row.replace(/[A-Z]/g, " ")));
  const [done, setDone] = useState(false);

  function setCell(y: number, x: number, value: string) {
    const letter = value.toUpperCase().slice(-1);
    setRows((current) => current.map((row, index) => (index === y ? `${row.slice(0, x)}${letter || " "}${row.slice(x + 1)}` : row)));
  }

  function check() {
    const correct = activity.grid.every((row, y) =>
      row.split("").every((letter, x) => letter === "#" || (rows[y]?.[x] ?? "").toUpperCase() === letter),
    );
    setDone(true);
    onResult(correct, correct ? "The crossword matches." : "Some letters still differ from the puzzle.");
  }

  return (
    <div className="stack">
      <p>{activity.prompt}</p>
      <ul>
        {activity.clues.map((clue) => (
          <li key={`${clue.number}-${clue.dir}`}>{clue.number} {clue.dir}: {clue.text}</li>
        ))}
      </ul>
      <div className={"quiz-board"}>
        {activity.grid.map((row, y) => (
          <div key={row} className={"quiz-boardRow"}>
            {row.split("").map((letter, x) => {
              if (letter === "#") return <span key={x} className={`quiz-letter quiz-black`} />;
              const number = activity.numbers[`${y},${x}`];
              return (
                <span key={x} className={"quiz-crossCell"}>
                  {number ? <span className={"quiz-num"}>{number}</span> : null}
                  <input
                    className={"quiz-crossInput"}
                    aria-label={`Row ${y + 1} column ${x + 1}`}
                    maxLength={1}
                    value={(rows[y]?.[x] ?? " ").trim()}
                    disabled={done}
                    onChange={(event) => setCell(y, x, event.target.value)}
                  />
                </span>
              );
            })}
          </div>
        ))}
      </div>
      {done ? null : <button className="btn btn-primary" type="button" onClick={check}>Check crossword</button>}
    </div>
  );
}
