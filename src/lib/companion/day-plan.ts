import type { ArtName } from "@/components/companion/art";
import type { ActivityKind, CompanionState, DayLog, PersonalGoal } from "@/lib/companion/state";
import { rng } from "@/lib/companion/games";
import type { LibraryCategory } from "@/lib/wellness-library/moves";
import type { SafetyFlags } from "@/lib/health-profile";

/**
 * My Life Improvement Plan and My Day: activities, sections, and the daily schedule.
 * Everything is a suggestion the person can complete, partly complete, skip, or replace.
 */

export type ActivityView =
  | { type: "steps" }
  | { type: "movement"; category: LibraryCategory }
  | { type: "walk" }
  | { type: "meal"; slot: "breakfast" | "lunch" | "dinner" | "snack" }
  | { type: "music"; trackId: string }
  | { type: "book"; bookId: string }
  | { type: "game"; href: string }
  | { type: "link"; href: string; label: string };

export type PlanActivity = {
  id: string;
  title: string;
  minutes: number;
  instructions: string[];
  view: ActivityView;
  /** Which daily total a completed activity adds to. */
  counts: "walkingMinutes" | "exerciseMinutes" | "readingPages" | "listeningMinutes" | "brainGames" | "nutritionHabits" | null;
  /** Activity kinds this suggestion belongs to, so disliked ones can be left out. */
  kinds: ActivityKind[];
};

export const SECTION_IDS = ["eating", "movement", "brain", "outdoors", "music", "books", "sleep", "emotional", "goals"] as const;
export type SectionId = (typeof SECTION_IDS)[number];

export const SECTION_INFO: Record<SectionId, { title: string; art: ArtName; intro: string }> = {
  eating: { title: "Healthy Eating", art: "meal", intro: "Meals and small food habits that follow your allergies, requirements, and tastes." },
  movement: { title: "Movement & Fitness", art: "yoga", intro: "Sessions matched to your level, mobility, and the time you have." },
  brain: { title: "Brain & Memory", art: "brain", intro: "Puzzles and games for enjoyment and focus." },
  outdoors: { title: "Outdoors & Nature", art: "walk", intro: "Fresh air, daylight, and time near green spaces when you can." },
  music: { title: "Music & Relaxation", art: "music", intro: "Calm sounds and breathing to settle the body." },
  books: { title: "Books & Audiobooks", art: "book", intro: "A few pages to read or listen to." },
  sleep: { title: "Sleep & Recovery", art: "sleep", intro: "A gentle evening and a regular rhythm." },
  emotional: { title: "Emotional Wellness", art: "checkin", intro: "Small moments of calm, connection, and kindness to yourself." },
  goals: { title: "Personal Goals", art: "plan", intro: "Your goals, in your own words, turned into small daily steps." },
};

const A = {
  morningStretch: {
    id: "morning-stretch",
    title: "Morning stretch and glass of water",
    minutes: 5,
    instructions: [
      "Drink a glass of water, or the fluids you are allowed.",
      "Sitting or standing, roll your shoulders slowly five times.",
      "Reach both arms up, then let them float down. Repeat three times.",
      "Turn your head gently to each side. Move only as far as is comfortable.",
    ],
    view: { type: "steps" },
    counts: "exerciseMinutes",
    kinds: ["stretching"],
  },
  morningLight: {
    id: "morning-light",
    title: "A few minutes of morning daylight",
    minutes: 5,
    instructions: ["Open the curtains or step outside.", "Look at the sky for a few minutes. Daylight in the morning helps many people feel awake.", "Notice three things you can see or hear."],
    view: { type: "steps" },
    counts: null,
    kinds: [],
  },
  breakfast: { id: "breakfast", title: "Breakfast", minutes: 15, instructions: ["A breakfast idea that follows your food choices."], view: { type: "meal", slot: "breakfast" }, counts: "nutritionHabits", kinds: [] },
  lunch: { id: "lunch", title: "Lunch", minutes: 20, instructions: ["A lunch idea that follows your food choices."], view: { type: "meal", slot: "lunch" }, counts: "nutritionHabits", kinds: [] },
  dinner: { id: "dinner", title: "Dinner", minutes: 30, instructions: ["A dinner idea that follows your food choices."], view: { type: "meal", slot: "dinner" }, counts: "nutritionHabits", kinds: [] },
  snack: { id: "snack", title: "A snack idea", minutes: 5, instructions: ["A snack idea that follows your food choices."], view: { type: "meal", slot: "snack" }, counts: "nutritionHabits", kinds: [] },
  vegetables: {
    id: "add-vegetable",
    title: "Add one vegetable or fruit you like",
    minutes: 5,
    instructions: ["Choose a vegetable or fruit you already enjoy and are allowed to eat.", "Add it to one meal today."],
    view: { type: "steps" },
    counts: "nutritionHabits",
    kinds: [],
  },
  walk: {
    id: "walk",
    title: "A gentle walk outside",
    minutes: 15,
    instructions: ["Wear comfortable shoes and take water.", "Walk at a pace where you can still talk.", "Turn back whenever you want. Any walk counts."],
    view: { type: "walk" },
    counts: "walkingMinutes",
    kinds: ["walking"],
  },
  natureSit: {
    id: "nature-sit",
    title: "Sit near something green",
    minutes: 10,
    instructions: ["Sit in a garden, park, balcony, or by a window with a plant or tree in view.", "Breathe slowly and notice colours, sounds, and the air."],
    view: { type: "link", href: "/nature", label: "More nature ideas" },
    counts: null,
    kinds: ["gardening"],
  },
  gardening: {
    id: "gardening",
    title: "A little gardening or plant care",
    minutes: 15,
    instructions: ["Water a plant, pull a few weeds, or repot a herb.", "Kneel on a cushion or sit on a stool if bending is hard."],
    view: { type: "book", bookId: "window-garden" },
    counts: "exerciseMinutes",
    kinds: ["gardening"],
  },
  sudoku: { id: "brain-games", title: "A brain game", minutes: 10, instructions: ["Sudoku, memory match, word scramble, spot the odd one, or a number pattern."], view: { type: "game", href: "/brain-quiz/games" }, counts: "brainGames", kinds: [] },
  dailyQuiz: { id: "brain-daily", title: "The daily brain challenge", minutes: 10, instructions: ["Five short questions, a new set each day."], view: { type: "game", href: "/brain-quiz/daily" }, counts: "brainGames", kinds: [] },
  relaxMusic: { id: "music-relax", title: "Relaxing music", minutes: 10, instructions: ["Sit comfortably, press Play, and let your shoulders drop."], view: { type: "music", trackId: "soft-evening" }, counts: "listeningMinutes", kinds: ["relaxation"] },
  breathing: { id: "breathing", title: "Breathing: in for 4, out for 6", minutes: 5, instructions: ["Follow the tone: breathe in as it rises, out as it falls. Stop if you feel dizzy."], view: { type: "music", trackId: "breath-four-six" }, counts: "listeningMinutes", kinds: ["breathing"] },
  positiveMusic: { id: "music-positive", title: "Cheerful music", minutes: 5, instructions: ["Play something bright. Tap your feet or sway if you like."], view: { type: "music", trackId: "morning-steps" }, counts: "listeningMinutes", kinds: [] },
  reading: { id: "reading", title: "A few pages of reading", minutes: 15, instructions: ["Read a page or two, or press Listen to hear it."], view: { type: "book", bookId: "walk-around-the-block" }, counts: "readingPages", kinds: [] },
  readingGuide: { id: "reading-guide", title: "Read a gentle guide", minutes: 10, instructions: ["A short guide about small habits."], view: { type: "book", bookId: "gentle-days" }, counts: "readingPages", kinds: [] },
  windDown: {
    id: "wind-down",
    title: "Wind-down hour",
    minutes: 15,
    instructions: ["Lower the lights.", "Put the phone or tablet in another room if you can.", "Choose something calm: a warm caffeine-free drink, soft music, or a few pages of a book."],
    view: { type: "book", bookId: "rest-and-sleep" },
    counts: null,
    kinds: ["relaxation"],
  },
  sleepSounds: { id: "sleep-sounds", title: "Sleep sounds", minutes: 30, instructions: ["Start the sounds in bed at a low volume. They stop on their own."], view: { type: "music", trackId: "night-harbour" }, counts: "listeningMinutes", kinds: ["relaxation"] },
  eveningReview: {
    id: "evening-review",
    title: "Three good things",
    minutes: 5,
    instructions: ["Think of three things that went well today, however small.", "Write them down or say them aloud.", "If today was hard, that is allowed too. Name one thing you got through."],
    view: { type: "steps" },
    counts: null,
    kinds: [],
  },
  connect: {
    id: "connect",
    title: "Reach out to someone",
    minutes: 10,
    instructions: ["Send a message, make a short call, or say hello to a neighbour.", "It does not need to be long."],
    view: { type: "steps" },
    counts: null,
    kinds: [],
  },
  calmMoment: { id: "calm-moment", title: "A calm moment", minutes: 5, instructions: ["Sit, place a hand on your chest, and breathe slowly for a few breaths."], view: { type: "link", href: "/emotional-wellness", label: "Open Emotional Wellness" }, counts: null, kinds: ["relaxation"] },
  meditation: { id: "meditation", title: "Quiet meditation", minutes: 10, instructions: ["Sit comfortably. Let the tone and slow bell keep you company."], view: { type: "music", trackId: "still-point" }, counts: "listeningMinutes", kinds: ["meditation"] },
  breatheSession: {
    id: "breathe-for-life",
    title: "Breathe for Life session",
    minutes: 9,
    instructions: [
      "Relaxed nasal breathing, soft Bhramari humming, and gentle belly breathing, with an animated guide.",
      "Keep it comfortable. No breath holding. Stop if you feel dizzy or unwell.",
    ],
    view: { type: "link", href: "/breathe/practice", label: "Open the breathing guide" },
    counts: null,
    kinds: ["breathing"],
  },
} satisfies Record<string, PlanActivity>;

function movement(category: LibraryCategory, title: string, minutes: number, kinds: ActivityKind[]): PlanActivity {
  return {
    id: `move-${category}`,
    title,
    minutes,
    instructions: ["Choose how long you have. The session plays here, step by step."],
    view: { type: "movement", category },
    counts: "exerciseMinutes",
    kinds,
  };
}

const MOVES: PlanActivity[] = [
  movement("chair", "Chair exercises", 10, ["chair-exercises", "chair-yoga"]),
  movement("pilates", "Beginner Pilates", 20, ["pilates"]),
  movement("yoga", "Gentle yoga", 20, ["yoga"]),
  movement("stretching", "Stretching", 10, ["stretching"]),
  movement("tai-chi", "Tai chi", 15, ["tai-chi"]),
  movement("balance", "Balance practice", 10, ["balance"]),
  movement("strength", "Strength training", 15, ["strength"]),
  movement("dance", "Dance at home", 15, ["dancing"]),
  movement("qigong", "Qigong", 10, ["qigong"]),
  movement("aerobics", "Low-impact aerobics", 15, ["aerobics"]),
];

export type PlanContext = {
  flags: SafetyFlags | null;
  enjoyed: ActivityKind[];
  disliked: ActivityKind[];
  minutes: number;
  goals: PersonalGoal[];
  wantsSleep: boolean;
  wantsMemory: boolean;
  wantsStress: boolean;
};

export function planContext(state: CompanionState, flags: SafetyFlags | null, wellnessGoals: string[]): PlanContext {
  return {
    flags,
    enjoyed: state.movement.enjoyed,
    disliked: state.movement.disliked,
    minutes: state.movement.minutes,
    goals: state.goals.filter((goal) => !goal.archivedOn),
    wantsSleep: wellnessGoals.includes("sleep"),
    wantsMemory: wellnessGoals.includes("memory"),
    wantsStress: wellnessGoals.includes("stress"),
  };
}

function allowed(activity: PlanActivity, ctx: PlanContext): boolean {
  if (activity.kinds.length > 0 && activity.kinds.every((kind) => ctx.disliked.includes(kind))) return false;
  if (ctx.flags?.seatedFirst && activity.view.type === "movement" && !["chair", "stretching", "breathing", "qigong"].includes(activity.view.category)) return false;
  return true;
}

function preferred(list: PlanActivity[], ctx: PlanContext): PlanActivity[] {
  const ok = list.filter((item) => allowed(item, ctx));
  const liked = ok.filter((item) => item.kinds.some((kind) => ctx.enjoyed.includes(kind)));
  return [...liked, ...ok.filter((item) => !liked.includes(item))];
}

function movesFor(ctx: PlanContext): PlanActivity[] {
  const list = preferred(MOVES, ctx).map((item) => ({ ...item, minutes: item.view.type === "movement" ? ctx.minutes : item.minutes }));
  return list.length > 0 ? list : [movement("chair", "Chair exercises", 10, ["chair-exercises"])];
}

/** Turns a goal written in the person's own words into a small daily step. */
export function goalActivity(goal: PersonalGoal): PlanActivity {
  const text = goal.text.toLowerCase();
  const base = { id: `goal-${goal.id}`, counts: null, kinds: [] as ActivityKind[] };
  if (/\bwalk|steps|outside|park/.test(text)) return { ...A.walk, ...base, counts: "walkingMinutes", title: `Toward “${goal.text}”: a short walk`, minutes: 10 };
  if (/\bread|book|library/.test(text)) return { ...A.reading, ...base, counts: "readingPages", title: `Toward “${goal.text}”: read a few pages` };
  if (/\bsleep|bed|rest|tired/.test(text)) return { ...A.windDown, ...base, title: `Toward “${goal.text}”: a calm evening` };
  if (/\bstress|calm|anx|relax|worry/.test(text)) return { ...A.breathing, ...base, counts: "listeningMinutes", title: `Toward “${goal.text}”: five slow breaths` };
  if (/\bmemory|brain|focus|puzzle/.test(text)) return { ...A.sudoku, ...base, counts: "brainGames", title: `Toward “${goal.text}”: a brain game` };
  if (/\beat|food|vegetable|fruit|cook|weight|sugar|water|drink/.test(text)) return { ...A.vegetables, ...base, counts: "nutritionHabits", title: `Toward “${goal.text}”: one small food step` };
  if (/\bfriend|family|grand|call|lonely|people/.test(text)) return { ...A.connect, ...base, title: `Toward “${goal.text}”: reach out to someone` };
  if (/\bexercise|fit|strong|move|yoga|pilates|dance|balance|flexib/.test(text)) {
    return { ...movement("stretching", `Toward “${goal.text}”: a short session`, 10, []), id: base.id };
  }
  return {
    ...base,
    title: `Toward “${goal.text}”`,
    minutes: 10,
    instructions: ["Choose one small step toward this goal that you can do in about ten minutes today.", "Write it down, do it, and notice how it felt."],
    view: { type: "steps" },
  };
}

/** The nine plan sections and their activities. */
export function planSections(ctx: PlanContext): Record<SectionId, PlanActivity[]> {
  const moves = movesFor(ctx);
  const outdoors = ctx.flags?.seatedFirst ? [A.natureSit, A.gardening, A.morningLight] : [A.walk, A.natureSit, A.gardening, A.morningLight];
  return {
    eating: [A.breakfast, A.lunch, A.dinner, A.snack, A.vegetables],
    movement: moves.slice(0, 4),
    brain: [A.sudoku, A.dailyQuiz],
    outdoors: preferred(outdoors, ctx),
    music: preferred([A.relaxMusic, A.breathing, A.positiveMusic, A.meditation, A.breatheSession], ctx),
    books: [A.reading, A.readingGuide],
    sleep: [A.windDown, A.sleepSounds],
    emotional: preferred([A.eveningReview, A.connect, A.calmMoment], ctx),
    goals: ctx.goals.map(goalActivity),
  };
}

export const DAY_SLOTS = [
  "morning-routine",
  "breakfast",
  "activity",
  "brain",
  "music",
  "reading",
  "lunch",
  "dinner",
  "relaxation",
  "evening-routine",
  "sleep-prep",
] as const;
export type DaySlot = (typeof DAY_SLOTS)[number];

export const SLOT_INFO: Record<DaySlot, { label: string; time: string }> = {
  "morning-routine": { label: "Morning routine", time: "08:00" },
  breakfast: { label: "Breakfast", time: "08:30" },
  activity: { label: "Activity", time: "10:00" },
  brain: { label: "Brain activity", time: "11:00" },
  music: { label: "Music", time: "12:00" },
  reading: { label: "Reading", time: "15:00" },
  lunch: { label: "Lunch", time: "13:00" },
  dinner: { label: "Dinner", time: "18:30" },
  relaxation: { label: "Relaxation", time: "17:00" },
  "evening-routine": { label: "Evening routine", time: "20:30" },
  "sleep-prep": { label: "Sleep preparation", time: "21:30" },
};

export function slotOptions(slot: DaySlot, ctx: PlanContext): PlanActivity[] {
  const sections = planSections(ctx);
  switch (slot) {
    case "morning-routine":
      return [A.morningStretch, A.morningLight];
    case "breakfast":
      return [A.breakfast];
    case "activity":
      return [...(ctx.flags?.seatedFirst ? [] : [A.walk]), ...sections.movement, ...sections.goals.filter((item) => item.counts === "exerciseMinutes" || item.counts === "walkingMinutes")];
    case "brain":
      return sections.brain;
    case "music":
      return sections.music;
    case "reading":
      return sections.books;
    case "lunch":
      return [A.lunch];
    case "dinner":
      return [A.dinner];
    case "relaxation":
      return preferred([A.calmMoment, A.breathing, A.meditation, A.natureSit, A.connect, A.breatheSession], ctx);
    case "evening-routine":
      return [A.eveningReview, A.connect];
    case "sleep-prep":
      return [A.windDown, A.sleepSounds];
  }
}

export type ScheduledItem = { slot: DaySlot; time: string; activity: PlanActivity; options: PlanActivity[] };

/** Today's schedule. The date seeds the choices, so the day changes without a new assessment. */
export function daySchedule(date: string, ctx: PlanContext, customize: CompanionState["customize"], day: DayLog | null): ScheduledItem[] {
  const random = rng(`day:${date}`);
  const items: ScheduledItem[] = [];
  for (const slot of DAY_SLOTS) {
    if (customize.hidden.includes(slot)) continue;
    const options = slotOptions(slot, ctx);
    if (options.length === 0) continue;
    const pickId = customize.picks[`${date}:${slot}`];
    const seeded = options[Math.floor(random() * Math.min(options.length, 3))] as PlanActivity;
    let activity = options.find((item) => item.id === pickId) ?? seeded;
    if (slot === "activity" && day?.stayInside && activity.view.type === "walk") {
      activity = options.find((item) => item.view.type === "movement") ?? activity;
    }
    items.push({ slot, time: customize.times[slot] ?? SLOT_INFO[slot].time, activity, options });
  }
  if (ctx.wantsSleep && !items.some((item) => item.slot === "sleep-prep") && !customize.hidden.includes("sleep-prep")) {
    items.push({ slot: "sleep-prep", time: SLOT_INFO["sleep-prep"].time, activity: A.windDown, options: [A.windDown] });
  }
  return items.sort((a, b) => a.time.localeCompare(b.time));
}

/** A next option for Replace, cycling through the slot's choices. */
export function nextOption(item: ScheduledItem): PlanActivity {
  const index = item.options.findIndex((option) => option.id === item.activity.id);
  return item.options[(index + 1) % item.options.length] as PlanActivity;
}

export const WEEKLY_TARGETS: Record<SectionId, string> = {
  eating: "Try a new meal idea on three days, and add a vegetable or fruit you like on most days.",
  movement: "Three movement sessions this week, at a length that suits you.",
  brain: "A brain game on three days.",
  outdoors: "Time outside or near something green on three days.",
  music: "Relaxing music or slow breathing on four days.",
  books: "A few pages or a short listen on four days.",
  sleep: "A wind-down routine on four evenings.",
  emotional: "Reach out to someone once, and note three good things twice.",
  goals: "One small step toward each of your goals on three days.",
};
