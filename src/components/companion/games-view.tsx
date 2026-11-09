"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Art } from "@/components/companion/art";
import { SaveNote } from "@/components/companion/shared";
import { useProfile } from "@/components/companion/use-profile";
import { commitCompanion } from "@/lib/companion/store";
import { addGame } from "@/lib/companion/state";
import {
  GAME_IDS,
  GAME_INFO,
  GAME_NOTICE,
  logicQuestion,
  makeSudoku,
  memoryDeck,
  oddOneRound,
  sudokuValid,
  wordRound,
  type GameId,
  type SudokuSize,
} from "@/lib/companion/games";
import { localISODate } from "@/lib/dates";

/** Records a finished or stopped game once. Nothing is scored against the person. */
function useRecorder(game: GameId) {
  const { sample } = useProfile();
  const started = useRef<number>(0);
  const saved = useRef(false);
  useEffect(() => {
    started.current = Date.now();
  }, []);
  return (completed: boolean) => {
    if (saved.current || sample) return;
    saved.current = true;
    const seconds = Math.round((Date.now() - started.current) / 1000);
    const date = localISODate();
    // addGame also counts a finished game in today's log.
    commitCompanion((state) => addGame(state, { id: `${game}-${Date.now()}`, game, date, seconds, completed }));
  };
}

function Done({ text, onAgain }: { text: string; onAgain: () => void }) {
  return (
    <div className="alert alert-ok stack" role="status">
      <p>{text}</p>
      <button className="btn btn-primary" type="button" onClick={onAgain}>
        Play again
      </button>
    </div>
  );
}

function SudokuGame({ seed, onAgain }: { seed: string; onAgain: () => void }) {
  const [size, setSize] = useState<SudokuSize>(4);
  const game = makeSudoku(`${seed}:${size}`, size);
  const [grid, setGrid] = useState<(number | null)[]>(game.puzzle);
  const record = useRecorder("sudoku");
  const solved = grid.every((cell) => cell !== null) && sudokuValid(grid, size);
  useEffect(() => {
    if (solved) record(true);
  }, [solved, record]);
  return (
    <div className="stack">
      <div className="lz-tabs" role="group" aria-label="Grid size">
        {([4, 6, 9] as const).map((value) => (
          <button
            key={value}
            type="button"
            className="lz-tab"
            aria-pressed={value === size}
            onClick={() => {
              setSize(value);
              setGrid(makeSudoku(`${seed}:${value}`, value).puzzle);
            }}
          >
            {value === 4 ? "Easy 4×4" : value === 6 ? "Medium 6×6" : "Classic 9×9"}
          </button>
        ))}
      </div>
      <div className="lz-sudoku" style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}>
        {grid.map((cell, index) => {
          const fixed = game.puzzle[index] !== null;
          const row = Math.floor(index / size);
          const col = index % size;
          const wrong = cell !== null && !fixed && cell !== game.solution[index];
          return (
            <input
              key={`${size}-${index}`}
              aria-label={`Row ${row + 1}, column ${col + 1}`}
              inputMode="numeric"
              maxLength={1}
              readOnly={fixed}
              aria-invalid={wrong}
              value={cell ?? ""}
              style={{
                borderRight: (col + 1) % game.boxCols === 0 && col < size - 1 ? "3px solid var(--deep)" : undefined,
                borderBottom: (row + 1) % game.boxRows === 0 && row < size - 1 ? "3px solid var(--deep)" : undefined,
              }}
              onChange={(event) => {
                if (fixed) return;
                const value = Number(event.target.value.slice(-1));
                const next = [...grid];
                next[index] = value >= 1 && value <= size ? value : null;
                setGrid(next);
              }}
            />
          );
        })}
      </div>
      <p className="hint">Numbers that do not fit turn pink. There is no time limit.</p>
      {solved ? <Done text="Well done. The grid is complete." onAgain={onAgain} /> : null}
    </div>
  );
}

function MemoryGame({ seed, onAgain }: { seed: string; onAgain: () => void }) {
  const deck = memoryDeck(seed, 6);
  const [open, setOpen] = useState<number[]>([]);
  const [found, setFound] = useState<number[]>([]);
  const [turns, setTurns] = useState(0);
  const record = useRecorder("memory");
  const finished = found.length === deck.length;
  useEffect(() => {
    if (finished) record(true);
  }, [finished, record]);
  function flip(index: number) {
    if (open.includes(index) || found.includes(index)) return;
    if (open.length === 2) {
      setOpen([index]);
      return;
    }
    const next = [...open, index];
    setOpen(next);
    if (next.length === 2) {
      setTurns(turns + 1);
      const [a, b] = next as [number, number];
      if (deck[a] === deck[b]) {
        setFound([...found, a, b]);
        setOpen([]);
      }
    }
  }
  return (
    <div className="stack">
      <div className="lz-cards">
        {deck.map((symbol, index) => {
          const shown = open.includes(index) || found.includes(index);
          return (
            <button key={index} type="button" data-open={shown} aria-label={shown ? symbol : `Card ${index + 1}, face down`} onClick={() => flip(index)}>
              {shown ? symbol : "?"}
            </button>
          );
        })}
      </div>
      <p className="hint">
        Pairs found: {found.length / 2} of {deck.length / 2} · turns: {turns}
      </p>
      {finished ? <Done text={`All pairs found in ${turns} turns.`} onAgain={onAgain} /> : null}
    </div>
  );
}

function WordGame({ seed, onAgain }: { seed: string; onAgain: () => void }) {
  const round = wordRound(seed, 5);
  const [index, setIndex] = useState(0);
  const [guess, setGuess] = useState("");
  const [shownAnswer, setShownAnswer] = useState(false);
  const record = useRecorder("words");
  const current = round[index];
  useEffect(() => {
    if (!current) record(true);
  }, [current, record]);
  if (!current) {
    return <Done text="That is all five words." onAgain={onAgain} />;
  }
  const right = guess.trim().toLowerCase() === current.word;
  return (
    <div className="stack">
      <p className="lz-breath" aria-label={`Letters: ${current.mixed.split("").join(" ")}`}>
        {current.mixed.toUpperCase().split("").join(" ")}
      </p>
      <label className="field">
        <span>Your word</span>
        <input value={guess} onChange={(event) => setGuess(event.target.value)} autoComplete="off" />
      </label>
      {right ? <p className="alert alert-ok">Yes, {current.word}.</p> : null}
      {shownAnswer && !right ? <p className="hint">The word was {current.word}.</p> : null}
      <div className="lz-buttons">
        <button
          className="btn btn-primary"
          type="button"
          onClick={() => {
            setIndex(index + 1);
            setGuess("");
            setShownAnswer(false);
          }}
        >
          Next word
        </button>
        {!right ? (
          <button className="btn btn-ghost" type="button" onClick={() => setShownAnswer(true)}>
            Show the word
          </button>
        ) : null}
      </div>
      <p className="hint">
        Word {index + 1} of {round.length}. Hint: it starts with “{current.word[0]?.toUpperCase()}”.
      </p>
    </div>
  );
}

function AttentionGame({ seed, onAgain }: { seed: string; onAgain: () => void }) {
  const [round, setRound] = useState(0);
  const [miss, setMiss] = useState<number | null>(null);
  const record = useRecorder("attention");
  useEffect(() => {
    if (round >= 5) record(true);
  }, [round, record]);
  if (round >= 5) {
    return <Done text="Five rounds done." onAgain={onAgain} />;
  }
  const { symbols, odd } = oddOneRound(seed, round);
  return (
    <div className="stack">
      <p>Round {round + 1} of 5. Which one is different?</p>
      <div className="lz-cards" style={{ gridTemplateColumns: "repeat(5, minmax(0, 1fr))" }}>
        {symbols.map((symbol, index) => (
          <button
            key={index}
            type="button"
            data-open="true"
            aria-label={`Symbol ${index + 1}: ${symbol}`}
            onClick={() => {
              if (index === odd) {
                setRound(round + 1);
                setMiss(null);
              } else setMiss(index);
            }}
          >
            {symbol}
          </button>
        ))}
      </div>
      {miss !== null ? <p className="hint">Not that one. Take your time and look again.</p> : null}
    </div>
  );
}

function LogicGame({ seed, onAgain }: { seed: string; onAgain: () => void }) {
  const [round, setRound] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const record = useRecorder("logic");
  useEffect(() => {
    if (round >= 5) record(true);
  }, [round, record]);
  if (round >= 5) {
    return <Done text="Five patterns done." onAgain={onAgain} />;
  }
  const question = logicQuestion(seed, round);
  return (
    <div className="stack">
      <p className="lz-breath">{question.shown.join(", ")}, ?</p>
      <div className="lz-buttons">
        {question.choices.map((choice) => (
          <button key={choice} className={choice === picked ? "btn btn-primary" : "btn btn-secondary"} type="button" onClick={() => setPicked(choice)}>
            {choice}
          </button>
        ))}
      </div>
      {picked !== null ? (
        <div className="stack" role="status">
          <p>{picked === question.answer ? "Yes." : `The answer is ${question.answer}.`} {question.rule}</p>
          <button
            className="btn btn-primary"
            type="button"
            onClick={() => {
              setRound(round + 1);
              setPicked(null);
            }}
          >
            Next pattern
          </button>
        </div>
      ) : null}
    </div>
  );
}

export function GamesView() {
  const { ready, companion } = useProfile();
  const [game, setGame] = useState<GameId>("sudoku");
  const [play, setPlay] = useState(0);
  if (!ready) return <p className="hint">Loading games…</p>;
  const today = localISODate();
  const seed = `${today}:${play}`;
  const again = () => setPlay(play + 1);
  const history = companion.games.slice(0, 8);
  const props = { seed, onAgain: again };
  return (
    <div className="stack-lg">
      <div className="lz-hero-row">
        <div className="lz-hello">
          <p className="kicker">Brain &amp; Habit Quiz · Games</p>
          <h1>Brain games</h1>
          <p className="script brand-line">Play, puzzle, smile.</p>
          <p>New puzzles every day. Play at your own pace.</p>
        </div>
        <Art name="brain" />
      </div>
      <p className="quiz-notice">{GAME_NOTICE}</p>
      <SaveNote />
      <div className="lz-tabs" role="group" aria-label="Game">
        {GAME_IDS.map((id) => (
          <button key={id} type="button" className="lz-tab" aria-pressed={id === game} onClick={() => setGame(id)}>
            {GAME_INFO[id].title}
          </button>
        ))}
      </div>
      <section className="card stack" key={`${game}-${play}`}>
        <h2>{GAME_INFO[game].title}</h2>
        <p>{GAME_INFO[game].blurb}</p>
        {game === "sudoku" ? <SudokuGame {...props} /> : null}
        {game === "memory" ? <MemoryGame {...props} /> : null}
        {game === "words" ? <WordGame {...props} /> : null}
        {game === "attention" ? <AttentionGame {...props} /> : null}
        {game === "logic" ? <LogicGame {...props} /> : null}
      </section>
      <p>
        Crosswords, word search, and more memory games are in the <Link href="/brain-quiz">Brain &amp; Habit Quiz</Link>.
      </p>
      {history.length > 0 ? (
        <section className="card stack">
          <h2>Games you played</h2>
          <ul className="record-list">
            {history.map((item) => (
              <li key={item.id}>
                {GAME_INFO[item.game as GameId]?.title ?? item.game} · {item.date} · {Math.max(1, Math.round(item.seconds / 60))} min
                {item.completed ? " · finished" : ""}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
