import { msg } from "@/lib/i18n/translate";
import { areaById, SCORE_BANDS, type HabitAreaId, type ScoreBand } from "@/lib/wellness-score";

/**
 * "How young are your habits?" — the free 2-minute check at /free/health-age.
 *
 * Seven questions, one for each habit area that My Wellness Score already uses
 * (`HABIT_AREAS`), judged against the same public guidance. The result is a
 * count of areas on track and a qualitative band. It is never an age in years,
 * a risk, a score of health, or a prediction (owner rule: no invented figures).
 * Answers live only in the page's memory. Nothing is sent or saved.
 */

export type QuizOption = {
  id: string;
  label: string;
  /** true = in line with the guidance, false = needs attention, null = left out of the count. */
  onTrack: boolean | null;
};

export type QuizQuestion = {
  id: string;
  area: HabitAreaId;
  question: string;
  options: readonly QuizOption[];
};

export const QUIZ_QUESTIONS: readonly QuizQuestion[] = [
  {
    id: "sleep",
    area: "sleep",
    question: msg("On most nights, how do you sleep?"),
    options: [
      { id: "good", label: msg("7 to 9 hours, and I usually wake up rested"), onTrack: true },
      { id: "tired", label: msg("7 to 9 hours, but I often wake up tired"), onTrack: false },
      { id: "short", label: msg("Less than 7 hours, or more than 9"), onTrack: false },
    ],
  },
  {
    id: "movement",
    area: "movement",
    question: msg("In a usual week, how long do you move enough to breathe a little faster, such as brisk walking, cycling, or dancing?"),
    options: [
      { id: "150", label: msg("150 minutes or more"), onTrack: true },
      { id: "60", label: msg("About 1 to 2 hours"), onTrack: false },
      { id: "less", label: msg("Less than an hour"), onTrack: false },
    ],
  },
  {
    id: "food",
    area: "food",
    question: msg("How often do you eat vegetables or fruit and drink water during the day?"),
    options: [
      { id: "most", label: msg("Most days, both"), onTrack: true },
      { id: "some", label: msg("Some days"), onTrack: false },
      { id: "rarely", label: msg("Rarely"), onTrack: false },
    ],
  },
  {
    id: "tobacco",
    area: "tobacco",
    question: msg("Do you smoke or use other tobacco or nicotine?"),
    options: [
      { id: "never", label: msg("Never"), onTrack: true },
      { id: "former", label: msg("I used to, and I stopped"), onTrack: true },
      { id: "current", label: msg("Yes, sometimes or every day"), onTrack: false },
      { id: "skip", label: msg("Prefer not to say"), onTrack: null },
    ],
  },
  {
    id: "alcohol",
    area: "alcohol",
    question: msg("How often do you drink alcohol?"),
    options: [
      { id: "rarely", label: msg("Rarely or never"), onTrack: true },
      { id: "some", label: msg("In some weeks"), onTrack: true },
      { id: "most", label: msg("In most weeks"), onTrack: false },
      { id: "skip", label: msg("Prefer not to say"), onTrack: null },
    ],
  },
  {
    id: "stress",
    area: "stress",
    question: msg("Over the last two weeks, how have stress and mood felt?"),
    options: [
      { id: "calm", label: msg("Mostly calm and steady"), onTrack: true },
      { id: "mixed", label: msg("Up and down"), onTrack: false },
      { id: "hard", label: msg("Often stressed or low"), onTrack: false },
    ],
  },
  {
    id: "connection",
    area: "connection",
    question: msg("How often are you in touch with friends, family, or a group you enjoy?"),
    options: [
      { id: "weekly", label: msg("Every week"), onTrack: true },
      { id: "sometimes", label: msg("Now and then"), onTrack: false },
      { id: "rarely", label: msg("Rarely"), onTrack: false },
    ],
  },
];

/** Question id to chosen option id. */
export type QuizAnswers = Partial<Record<string, string>>;

export type QuizResult = {
  met: HabitAreaId[];
  attention: HabitAreaId[];
  /** Areas counted. "Prefer not to say" leaves an area out. */
  counted: number;
  band: ScoreBand;
  /** At most two next steps, in question order. */
  nextSteps: { area: HabitAreaId; label: string; text: string }[];
};

export function optionOf(question: QuizQuestion, answers: QuizAnswers): QuizOption | null {
  const id = answers[question.id];
  return question.options.find((option) => option.id === id) ?? null;
}

export function isComplete(answers: QuizAnswers): boolean {
  return QUIZ_QUESTIONS.every((question) => optionOf(question, answers) !== null);
}

/** The result, or null until every question has a valid answer. */
export function quizResult(answers: QuizAnswers): QuizResult | null {
  if (!isComplete(answers)) return null;
  const met: HabitAreaId[] = [];
  const attention: HabitAreaId[] = [];
  for (const question of QUIZ_QUESTIONS) {
    const option = optionOf(question, answers);
    if (option?.onTrack === true) met.push(question.area);
    else if (option?.onTrack === false) attention.push(question.area);
  }
  const counted = met.length + attention.length;
  const share = counted === 0 ? 0 : met.length / counted;
  let band: ScoreBand = SCORE_BANDS[0];
  for (const item of SCORE_BANDS) if (share >= item.min) band = item;
  const nextSteps = attention.slice(0, 2).map((id) => {
    const area = areaById(id);
    return { area: id, label: area.label, text: area.next };
  });
  return { met, attention, counted, band, nextSteps };
}

/** One warm line per band. Qualitative only. */
export const BAND_MESSAGE: Record<ScoreBand["id"], string> = {
  strong: msg("Your everyday habits are working for you. Keep them steady."),
  way: msg("A good base. One or two small changes would make a real difference."),
  start: msg("Every habit here can start small. Pick one and begin this week."),
};
