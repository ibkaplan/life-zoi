"use client";

import { useState } from "react";
import type { Activity } from "@/lib/brain-quiz/activities";
import { isLockedKind } from "@/lib/brain-quiz/activities";
import { localISODate } from "@/lib/dates";
import { recordOutcome, saveDailyPick, type DailyPick } from "@/lib/brain-quiz/progress";
import { AttentionPlay } from "@/components/brain-quiz/attention-play";
import { ChoicePlay } from "@/components/brain-quiz/choice-play";
import { MemoryPlay } from "@/components/brain-quiz/memory-play";
import { useBrainProgress } from "@/components/brain-quiz/use-brain-progress";
import { AcrosticPlay, CrosswordPlay, LetterPlay, WordSearchPlay } from "@/components/brain-quiz/word-play";
import { useLocale } from "@/components/locale-provider";
import { localizeActivity, noteText, titleText } from "@/lib/brain-quiz/localize";
import { msg } from "@/lib/i18n/translate";

export function QuizActivity({
  activity: source,
  dailyDate,
  onSaved,
}: {
  activity: Activity;
  dailyDate?: string;
  onSaved?: (pick: DailyPick) => void;
}) {
  const { locale, t } = useLocale();
  const activity = localizeActivity(source, locale);
  const { progress, save, sample } = useBrainProgress();
  const today = dailyDate ?? localISODate();
  const existing = dailyDate && progress.lastDaily?.date === dailyDate
    ? progress.lastDaily.picks.find((pick) => pick.id === activity.id) ?? null
    : null;
  const [local, setLocal] = useState<DailyPick | null>(existing);
  const [attempt, setAttempt] = useState(0);
  const shown = local ?? existing;
  const locked = isLockedKind(activity) && (Boolean(shown) || progress.attempted.includes(activity.id));

  function finish(correct: boolean, note: string, picked: number[] = []) {
    if (isLockedKind(activity) && locked) return;
    if (!isLockedKind(activity) && progress.awarded.includes(activity.id)) return;
    if (sample) {
      const pick = { id: activity.id, correct, note, gained: 0, picked };
      setLocal(pick);
      onSaved?.(pick);
      return;
    }
    const outcome = recordOutcome(progress, {
      today,
      activityId: activity.id,
      category: activity.category,
      difficulty: activity.difficulty,
      correct,
      lock: isLockedKind(activity),
    });
    const pick: DailyPick = { id: activity.id, correct, note, gained: outcome.gained, picked };
    let next = outcome.progress;
    if (dailyDate) next = saveDailyPick(next, dailyDate, pick);
    save(next);
    setLocal(pick);
    onSaved?.(pick);
  }

  const pointsLine = shown
    ? shown.gained > 0
      ? t("{points} points added.", { points: shown.gained })
      : sample
        ? t("Sample data is read-only.")
        : t(correctAlready(shown, progress.awarded.includes(activity.id)))
    : progress.awarded.includes(activity.id)
      ? t("You already scored this one. A repeat does not add points.")
      : "";

  return (
    <div className="stack">
      <p className="kicker">{t(activity.difficulty)} · {t(activity.category)}</p>
      <h2>{titleText(activity.title, t)}</h2>
      {pointsLine ? <p className="hint">{pointsLine}</p> : null}
      {isQuestion(activity) ? (
        <ChoicePlay
          activity={activity}
          revealed={locked}
          picked={shown?.picked ?? []}
          onSubmit={(picked, correct) => finish(correct, correct ? msg("That choice is the right one.") : msg("That choice is not the right one."), picked)}
        />
      ) : null}
      {activity.kind === "memory" ? <MemoryPlay key={attempt} activity={activity} onResult={(correct, note) => finish(correct, note)} /> : null}
      {activity.kind === "attention" ? <AttentionPlay key={attempt} activity={activity} onResult={(correct, note) => finish(correct, note)} /> : null}
      {activity.kind === "word-search" ? <WordSearchPlay key={attempt} activity={activity} onResult={(correct, note) => finish(correct, note)} /> : null}
      {activity.kind === "letters" ? <LetterPlay key={attempt} activity={activity} onResult={(correct, note) => finish(correct, note)} /> : null}
      {activity.kind === "acrostic" ? <AcrosticPlay key={attempt} activity={activity} onResult={(correct, note) => finish(correct, note)} /> : null}
      {activity.kind === "crossword" ? <CrosswordPlay key={attempt} activity={activity} onResult={(correct, note) => finish(correct, note)} /> : null}
      {shown && !isQuestion(activity) ? <p>{noteText(shown.note, t)}</p> : null}
      {!isQuestion(activity) && !progress.awarded.includes(activity.id) ? (
        <div className="actions">
          <button className="btn btn-secondary" type="button" onClick={() => { setLocal(null); setAttempt((value) => value + 1); }}>{t("Try again")}</button>
          <button className="btn btn-ghost" type="button" onClick={() => finish(false, msg("This try ended before it was finished."))}>{t("End this try")}</button>
        </div>
      ) : null}
    </div>
  );
}

function isQuestion(activity: Activity): activity is Activity & { kind: "choice" | "multi" | "rebus" } {
  return activity.kind === "choice" || activity.kind === "multi" || activity.kind === "rebus";
}

function correctAlready(shown: DailyPick, awarded: boolean): string {
  if (shown.correct && awarded) return msg("Already counted. This activity does not score again.");
  if (shown.correct) return msg("Recorded.");
  return msg("No points on this try.");
}
