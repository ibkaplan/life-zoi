import type { MomentCategory, MomentFilter, MomentMinutes, MomentPlan } from "@/lib/wellness/types";
import { makeTranslate, msg, type Translate } from "@/lib/i18n/translate";

/** English with placeholders filled. Pages pass their own `t` to get the chosen language. */
const ENGLISH: Translate = makeTranslate(null);

export type MomentIdea = {
  id: string;
  title: string;
  detail: string;
  minutes: MomentMinutes;
  filters: MomentFilter[];
  category: MomentCategory;
};

export const MOMENT_CATEGORY_COPY: { id: MomentCategory; label: string; text: string }[] = [
  {
    id: "important",
    label: "Something important",
    text: "A small step on a task that matters to you.",
  },
  {
    id: "body",
    label: "Body care",
    text: "Movement or comfort you can do seated, standing, or lying down. Skip anything that hurts.",
  },
  {
    id: "mind",
    label: "Mind",
    text: "A few minutes of learning, reading, or quiet attention.",
  },
  {
    id: "people",
    label: "People you love",
    text: "A message, a call, or a moment with someone you care about.",
  },
  {
    id: "create",
    label: "Create something",
    text: "Write, draw, hum, cook one simple thing, or make a corner feel cared for.",
  },
  {
    id: "rest",
    label: "Rest",
    text: "Rest counts as meaningful. Sit, lie down, or close your eyes.",
  },
];

export const MOMENT_FILTER_COPY: { id: MomentFilter; label: string }[] = [
  { id: "move", label: "Move" },
  { id: "relax", label: "Relax" },
  { id: "learn", label: "Learn" },
  { id: "accomplish", label: "Accomplish" },
  { id: "connect", label: "Connect" },
  { id: "create", label: "Create" },
];

export const MOMENT_IDEAS: MomentIdea[] = [
  {
    id: "english-words",
    title: "Learn five English words",
    detail: "Write five words you want and one short sentence for each.",
    minutes: 10,
    filters: ["learn"],
    category: "mind",
  },
  {
    id: "one-page",
    title: "Read one page",
    detail: "Read a page of something you already enjoy. Stop when the time is up.",
    minutes: 10,
    filters: ["learn", "relax"],
    category: "mind",
  },
  {
    id: "seated-roll",
    title: "Roll your shoulders",
    detail: "While seated, roll your shoulders slowly. Stop if it hurts. A smaller movement is enough.",
    minutes: 5,
    filters: ["move"],
    category: "body",
  },
  {
    id: "ankle-circles",
    title: "Circle your ankles",
    detail: "Sit and circle each ankle a few times. Hold a stable surface if you stand.",
    minutes: 5,
    filters: ["move"],
    category: "body",
  },
  {
    id: "short-walk",
    title: "Walk to one landmark",
    detail: "Walk to the door, the window, or the end of the block, then come back. Use a chair break if walking is not available.",
    minutes: 10,
    filters: ["move"],
    category: "body",
  },
  {
    id: "hands-warm",
    title: "Warm your hands",
    detail: "Wash your hands or hold a warm mug. This is comfort, not a treatment.",
    minutes: 5,
    filters: ["relax"],
    category: "body",
  },
  {
    id: "quiet-rest",
    title: "Rest with your eyes closed",
    detail: "Sit or lie down. Rest is a complete choice. You do not have to be productive.",
    minutes: 10,
    filters: ["relax"],
    category: "rest",
  },
  {
    id: "longer-rest",
    title: "A longer rest",
    detail: "Set a 20-minute rest. A timer can end it. You can stop earlier.",
    minutes: 20,
    filters: ["relax"],
    category: "rest",
  },
  {
    id: "one-task",
    title: "Finish one tiny task",
    detail: "Pick one thing that would make the day feel lighter: a message, a dish, or a paper.",
    minutes: 10,
    filters: ["accomplish"],
    category: "important",
  },
  {
    id: "plan-tomorrow",
    title: "Write tomorrow’s first step",
    detail: "Write one step for tomorrow. Keep it small enough for a tired day.",
    minutes: 10,
    filters: ["accomplish"],
    category: "important",
  },
  {
    id: "longer-task",
    title: "Work on something that matters",
    detail: "Give 30 minutes to a project, a form, or a hobby step. Stop when the time ends.",
    minutes: 30,
    filters: ["accomplish", "learn"],
    category: "important",
  },
  {
    id: "send-note",
    title: "Send a kind note",
    detail: "Text or write to someone you love. One sentence is enough.",
    minutes: 5,
    filters: ["connect"],
    category: "people",
  },
  {
    id: "call",
    title: "A short call or voice note",
    detail: "Call someone, or record a voice note if a live call is too much.",
    minutes: 10,
    filters: ["connect"],
    category: "people",
  },
  {
    id: "photo",
    title: "Look at one photo",
    detail: "Look at a photo of a person, place, or day you care about. Name one detail you like.",
    minutes: 5,
    filters: ["connect", "relax"],
    category: "people",
  },
  {
    id: "doodle",
    title: "Draw for a few minutes",
    detail: "Draw anything. Skill is not the point.",
    minutes: 10,
    filters: ["create"],
    category: "create",
  },
  {
    id: "three-lines",
    title: "Write three lines",
    detail: "Write three lines about the day, a memory, or a story. They can be ordinary.",
    minutes: 10,
    filters: ["create", "learn"],
    category: "create",
  },
  {
    id: "music",
    title: "Make a small sound",
    detail: "Hum, sing, or tap a rhythm. Headphones are fine if you want privacy.",
    minutes: 5,
    filters: ["create", "relax"],
    category: "create",
  },
];

export const EXAMPLE_MOMENT_STORY =
  "Example only, not your record: felt bored, wanted chocolate, chose learning, 10 minutes on five English words.";

/** With `t`, the plan text is written in the chosen language before it is saved. */
export function buildMomentPlan(
  input: {
    minutes: MomentMinutes;
    filters: MomentFilter[];
    categories: MomentCategory[];
  },
  t: Translate = ENGLISH,
): { title: string; detail: string; prompt: string } {
  const filters = input.filters.length > 0 ? input.filters : MOMENT_FILTER_COPY.map((item) => item.id);
  const categories = input.categories;
  const matches = MOMENT_IDEAS.filter((idea) => {
    const timeOk = idea.minutes <= input.minutes;
    const filterOk = idea.filters.some((filter) => filters.includes(filter));
    const categoryOk = categories.length === 0 || categories.includes(idea.category);
    return timeOk && filterOk && categoryOk;
  }).slice(0, 3);

  const chosen = matches.length > 0 ? matches : [MOMENT_IDEAS.find((idea) => idea.id === "quiet-rest")!];
  const labels = [
    ...input.categories.map((id) => {
      const label = MOMENT_CATEGORY_COPY.find((item) => item.id === id)?.label;
      return label ? t(label) : id;
    }),
    ...input.filters.map((id) => {
      const label = MOMENT_FILTER_COPY.find((item) => item.id === id)?.label;
      return label ? t(label) : id;
    }),
  ];
  return {
    title: t(chosen[0]?.title ?? msg("A short rest")),
    detail: chosen.map((idea) => `${t(idea.title)}. ${t(idea.detail)}`).join(" "),
    prompt: labels.join(", "),
  };
}

export function momentDraft(input: {
  id: string;
  date: string;
  minutes: MomentMinutes;
  filters: MomentFilter[];
  categories: MomentCategory[];
  title: string;
  detail: string;
  prompt: string;
  status: MomentPlan["status"];
}): MomentPlan {
  return { ...input };
}
