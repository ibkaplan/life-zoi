/**
 * Optional seven-day educational wellness plan. It is not a treatment program and it
 * does not promise any result. Every day can be changed, skipped, or repeated.
 */

export const PLAN_GOALS = [
  { id: "stress", label: "Handle everyday stress" },
  { id: "worry", label: "Worry less" },
  { id: "mood", label: "Lift my mood" },
  { id: "sleep", label: "Sleep better" },
  { id: "relationships", label: "Get along better with people" },
  { id: "self-esteem", label: "Be kinder to myself" },
] as const;

export type PlanGoal = (typeof PLAN_GOALS)[number]["id"];

export type PlanDayTemplate = {
  day: number;
  theme: string;
  intro: string;
  /** Activities to choose from. The first one suited to the person's goals is chosen first. */
  options: readonly { exercise: string; goals: readonly PlanGoal[] }[];
  article: string;
  reflection: string;
};

export const PLAN_DAYS: readonly PlanDayTemplate[] = [
  {
    day: 1,
    theme: "Recognizing emotional triggers",
    intro: "Notice which situations bring up strong feelings, without judging them.",
    options: [
      { exercise: "name-the-feeling", goals: ["stress", "worry", "mood", "relationships", "self-esteem", "sleep"] },
      { exercise: "journaling", goals: ["mood", "relationships"] },
    ],
    article: "understanding-emotions",
    reflection: "When did I feel a strong emotion today, and what was happening just before?",
  },
  {
    day: 2,
    theme: "Practicing relaxation",
    intro: "Give your body a chance to settle, even for a few minutes.",
    options: [
      { exercise: "paced-breathing", goals: ["stress", "worry"] },
      { exercise: "progressive-muscle-relaxation", goals: ["stress", "sleep"] },
      { exercise: "guided-relaxation", goals: ["mood", "relationships", "self-esteem", "sleep"] },
    ],
    article: "how-the-brain-processes-emotions",
    reflection: "How did my body feel before and after relaxing?",
  },
  {
    day: 3,
    theme: "Understanding negative thought patterns",
    intro: "Learn to spot common thinking traps.",
    options: [
      { exercise: "thinking-traps", goals: ["worry", "mood", "self-esteem", "stress"] },
      { exercise: "worry-time", goals: ["worry", "sleep"] },
    ],
    article: "cognitive-behavioral-therapy",
    reflection: "Which thinking trap do I fall into most often?",
  },
  {
    day: 4,
    theme: "Improving emotional regulation",
    intro: "Practice a way to steady yourself when feelings run high.",
    options: [
      { exercise: "grounding-54321", goals: ["worry", "stress"] },
      { exercise: "thought-reframing", goals: ["mood", "self-esteem", "relationships"] },
      { exercise: "self-compassion", goals: ["self-esteem", "mood"] },
    ],
    article: "emotional-intelligence",
    reflection: "What helped me feel steadier today?",
  },
  {
    day: 5,
    theme: "Practicing healthy personal boundaries",
    intro: "Think about one place where a kind, clear limit would help.",
    options: [
      { exercise: "boundary-script", goals: ["relationships", "stress", "self-esteem", "worry", "mood", "sleep"] },
      { exercise: "i-statements", goals: ["relationships"] },
    ],
    article: "relationships-and-communication",
    reflection: "Where could I ask for what I need this week?",
  },
  {
    day: 6,
    theme: "Building a better sleep routine",
    intro: "Try a calm wind-down that tells your body it is time to rest.",
    options: [
      { exercise: "sleep-wind-down", goals: ["sleep", "stress", "worry", "mood", "relationships", "self-esteem"] },
      { exercise: "body-scan", goals: ["sleep", "worry"] },
    ],
    article: "sleep-and-mental-health",
    reflection: "What helps me wind down at night?",
  },
  {
    day: 7,
    theme: "Reflecting on progress",
    intro: "Look back on the week and notice which practices helped.",
    options: [
      { exercise: "gratitude", goals: ["mood", "self-esteem", "stress", "worry", "sleep", "relationships"] },
      { exercise: "behavioral-activation", goals: ["mood"] },
    ],
    article: "motivation-and-personal-growth",
    reflection: "Which practice would I like to keep using, and when?",
  },
];

export type PlanDayState = { exercise: string; status: "todo" | "done" | "skipped"; doneCount: number };

export type PlanState = { goals: PlanGoal[]; startedAt: string; days: PlanDayState[] };

export function buildPlan(goals: readonly PlanGoal[], startedAt: string): PlanState {
  const chosen = goals.length ? [...goals] : (["stress"] as PlanGoal[]);
  return {
    goals: chosen,
    startedAt,
    days: PLAN_DAYS.map((template) => {
      const match = template.options.find((option) => option.goals.some((goal) => chosen.includes(goal))) ?? template.options[0];
      return { exercise: match.exercise, status: "todo", doneCount: 0 };
    }),
  };
}

export function updatePlanDay(plan: PlanState, index: number, change: Partial<PlanDayState> | "done" | "skip" | "repeat" | "reset"): PlanState {
  if (index < 0 || index >= plan.days.length) return plan;
  const days = plan.days.map((day, at) => {
    if (at !== index) return day;
    if (change === "done") return { ...day, status: "done" as const, doneCount: day.doneCount + 1 };
    if (change === "repeat") return { ...day, status: "done" as const, doneCount: day.doneCount + 1 };
    if (change === "skip") return { ...day, status: "skipped" as const };
    if (change === "reset") return { ...day, status: "todo" as const };
    const allowed = PLAN_DAYS[index].options.map((option) => option.exercise);
    const exercise = change.exercise && allowed.includes(change.exercise) ? change.exercise : day.exercise;
    return { ...day, ...change, exercise };
  });
  return { ...plan, days };
}

export function planSummary(plan: PlanState): { done: number; skipped: number; left: number } {
  return {
    done: plan.days.filter((day) => day.status === "done").length,
    skipped: plan.days.filter((day) => day.status === "skipped").length,
    left: plan.days.filter((day) => day.status === "todo").length,
  };
}

export const PLAN_NOTICE =
  "This is an educational wellness plan, not a treatment program. It cannot cure anxiety, depression, or any other condition. Do as much or as little as you like.";
