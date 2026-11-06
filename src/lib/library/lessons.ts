export type DailyLesson = {
  slug: string;
  title: string;
  minutes: string;
  art: "bowl" | "walk" | "moon" | "breath" | "leaf" | "chair" | "mind";
  explanation: string[];
  action: string;
  reflection: string;
  related: { href: string; label: string }[];
};

export type HardMoment = {
  slug: string;
  title: string;
  body: string[];
  next: string;
  related: { href: string; label: string }[];
};

export type DailyMission = {
  id: string;
  text: string;
};

export const dailyLessons: DailyLesson[] = [
  {
    slug: "sugar-cravings",
    title: "Sugar cravings",
    minutes: "About 3 minutes",
    art: "bowl",
    explanation: [
      "A craving can show up when you are hungry, tired, or in a place where a sweet is the usual choice. Naming the moment is a skill. It is not a verdict about your character.",
      "You can eat the food, delay it, or choose something else. None of those is a grade. The Nutrition pages show where added sugar appears on a label if you want to look later.",
    ],
    action: "If a craving shows up today, pause long enough to notice hunger, then decide. Eat if you are hungry.",
    reflection: "What was going on the last time a sweet sounded especially good?",
    related: [
      { href: "/choices/sugar", label: "Daily choice: sugar" },
      { href: "/urges", label: "Urges" },
      { href: "/library/guides/hidden-sugar", label: "Hidden Sugar Guide" },
    ],
  },
  {
    slug: "emotional-eating",
    title: "Emotional eating",
    minutes: "About 4 minutes",
    art: "bowl",
    explanation: [
      "Eating when you feel something is common. Food can be comfort, habit, or hunger that arrived with a feeling. lifeZoi does not label that as a disorder and does not diagnose one.",
      "A useful question is small: am I hungry, comforted by the routine, or both? The answer can be both. You still get to eat.",
    ],
    action: "At the next snack, put it on a plate or in a bowl if you can. That is the whole action.",
    reflection: "Which feeling, if any, was in the room the last time you ate for comfort?",
    related: [
      { href: "/urges/understand", label: "Understand an urge" },
      { href: "/library/moments/emotional-eating", label: "Having a hard moment: emotional eating" },
    ],
  },
  {
    slug: "habits",
    title: "How habits form",
    minutes: "About 3 minutes",
    art: "leaf",
    explanation: [
      "NIH describes a habit as an action tied to a cue you already meet, such as arriving home or sitting down to a meal. A plan helps when it is specific. A missed day is part of changing a habit, not proof that you failed.",
      "lifeZoi does not score streaks. The calendar on the practice page only shows days you chose to record.",
    ],
    action: "Attach one small action to a cue you already have, such as filling a glass when you make coffee, if fluids are allowed.",
    reflection: "Which cue already happens on an ordinary day?",
    related: [
      { href: "/library/practice", label: "Habit picker" },
      { href: "/habits", label: "Shared challenges" },
    ],
  },
  {
    slug: "sleep",
    title: "Sleep",
    minutes: "About 3 minutes",
    art: "moon",
    explanation: [
      "Sleep varies from person to person. A steadier wake time and a dimmer evening are ideas people try. They do not guarantee that you will sleep through the night.",
      "Pain, breathing pauses, or a mood that will not lift are reasons to talk with a clinician. This lesson is not a sleep study.",
    ],
    action: "Choose one cue for tonight: a dimmer lamp, a paper page, or a regular wake time you can keep.",
    reflection: "What usually makes the evening feel finished, even a little?",
    related: [
      { href: "/library/guides/better-sleep", label: "Better Sleep guide" },
      { href: "/choices/sleep", label: "Daily choice: sleep" },
    ],
  },
  {
    slug: "stress",
    title: "Stress",
    minutes: "About 3 minutes",
    art: "breath",
    explanation: [
      "Stress is a signal, not a personal flaw. NIMH lists relaxation, including breathing, among things people can try. A one-minute seated breath is enough for today.",
      "If the stress is about safety, money, or a relationship, a breathing exercise does not fix the situation. It only gives the body a short pause. Distress that feels immediate in the United States can go to 988.",
    ],
    action: "Sit and breathe in an ordinary way for about a minute. Stop if breathing feels difficult.",
    reflection: "What would make the next hour slightly easier, even if the larger problem stays?",
    related: [
      { href: "/library/guides/stress-relief", label: "Five breathing exercises" },
      { href: "/library/moments/stress", label: "Having a hard moment: stress" },
    ],
  },
  {
    slug: "walking",
    title: "Walking",
    minutes: "About 2 minutes",
    art: "walk",
    explanation: [
      "CDC says some activity is better than none and that it can be split into short bouts. A walk where you can still talk is a fine pace. There is no required distance.",
      "If walking is not available, marching in place while you hold a chair is the same idea in a smaller form.",
    ],
    action: "Take a short walk or a seated march. Stop at the time you chose.",
    reflection: "Where is a route, hallway, or chair you could use without a special trip?",
    related: [
      { href: "/academy/move/easy-walk", label: "Easy walk" },
      { href: "/library/programs/walk-30", label: "30-minute walk" },
    ],
  },
  {
    slug: "fiber",
    title: "Fiber",
    minutes: "About 3 minutes",
    art: "leaf",
    explanation: [
      "Fiber is in many ordinary plant foods. Raising it quickly can cause gas and cramps, so a small addition is the point. Fluids you are allowed to drink help. A fluid limit from a clinician comes first.",
      "This lesson does not set a gram goal. The fiber guide names twenty foods and sends you to the label.",
    ],
    action: "Add one plant food you already tolerate to a meal today.",
    reflection: "Which of those foods is already in the kitchen?",
    related: [
      { href: "/library/guides/fiber-foods", label: "Fiber guide" },
      { href: "/academy/meals/fiber", label: "Fiber lesson" },
    ],
  },
  {
    slug: "muscle-with-age",
    title: "Muscle as you get older",
    minutes: "About 4 minutes",
    art: "chair",
    explanation: [
      "Muscle is used when you stand, carry a bag, or press your hands together. CDC discusses muscle-strengthening for major muscle groups on two or more days in a week, matched to what you can do. lifeZoi does not turn that into a required gym plan.",
      "Getting older does not erase the value of a small effort. It also does not mean you must keep up with anyone else. One sit-to-stand, or a palm press if standing is not for today, is a complete action.",
    ],
    action: "Do one sit-to-stand with your hands on the chair, or press your palms together if you stay seated.",
    reflection: "What everyday lift or stand do you already do?",
    related: [
      { href: "/academy/move/chair-stand", label: "Stand from a chair" },
      { href: "/choices/muscles", label: "Daily choice: muscles" },
    ],
  },
  {
    slug: "brain-health",
    title: "Brain health",
    minutes: "About 3 minutes",
    art: "mind",
    explanation: [
      "Attention, sleep, movement, and time with people are everyday topics. This lesson is not a memory test and not a diagnosis. It does not promise a longer life.",
      "A page of a book, a song, or a short conversation counts. You do not need a new app or a score.",
    ],
    action: "Spend a few minutes on something you already like that asks for a little attention: a page, a recipe, or a conversation.",
    reflection: "What held your attention recently in a way that felt pleasant?",
    related: [
      { href: "/library/guides/brain-aging", label: "Brain health and healthy aging" },
      { href: "/balance-challenge", label: "Balance and Brain Challenge" },
    ],
  },
  {
    slug: "small-changes",
    title: "Small changes",
    minutes: "About 2 minutes",
    art: "leaf",
    explanation: [
      "A small change is easier to repeat than a new identity. NIH's habit guidance supports a specific action tied to a cue. You can change the action later.",
      "Nothing in lifeZoi promises a longer life. The point of a small change is a day that is a little more like the one you want.",
    ],
    action: "Pick one action from the 30-day list that would take less than five minutes.",
    reflection: "What would still be worth doing if you only had two minutes?",
    related: [
      { href: "/library/guides/thirty-day-habits", label: "30 days of small habits" },
      { href: "/library/practice", label: "Practice page" },
    ],
  },
];

export const hardMoments: HardMoment[] = [
  {
    slug: "sugar-craving",
    title: "A sugar craving",
    body: [
      "A craving is a moment, not a measure of willpower. You are allowed to eat. You are also allowed to wait a few minutes and see if the urge changes shape.",
      "Hunger is a fair reason to eat. So is wanting the taste. Either way, a plate or a glass can make the portion visible.",
    ],
    next: "Name hunger, habit, or both. Then choose the food, a piece of fruit, or a delay. Any of those is a complete choice.",
    related: [
      { href: "/library/lessons/sugar-cravings", label: "Sugar cravings lesson" },
      { href: "/urges/moment", label: "In the moment" },
    ],
  },
  {
    slug: "emotional-eating",
    title: "Emotional eating",
    body: [
      "Feelings and food often arrive together. That does not make you careless. Comfort is a human use of food.",
      "If the feeling is very heavy, food will not be asked to solve it alone. A person, a pause, or urgent help can sit beside the meal.",
    ],
    next: "If you eat, sit down for it. If you want company for the feeling, send one message or use 988 if you are in immediate distress in the United States.",
    related: [
      { href: "/library/lessons/emotional-eating", label: "Emotional eating lesson" },
      { href: "/urges", label: "Urges" },
    ],
  },
  {
    slug: "low-motivation",
    title: "Low motivation",
    body: [
      "A low day is not laziness, and it is not a broken streak. Motivation often shows up after a tiny start, and sometimes it does not. Both are allowed.",
      "You can do nothing extra today. If you want a start that is almost nothing, pick one minute.",
    ],
    next: "Choose a one-minute version: a seated march, a glass of water if fluids are allowed, or opening a window. Or choose rest.",
    related: [
      { href: "/library/lessons/habits", label: "Habits lesson" },
      { href: "/library/practice", label: "Practice page" },
    ],
  },
  {
    slug: "skipping-movement",
    title: "Skipping movement",
    body: [
      "Skipping a walk is ordinary. Pain, weather, time, and mood are real reasons. lifeZoi does not keep a record of the days you did not move, and it does not scold.",
      "A seated option exists for the movement pages. You can also leave movement for another day.",
    ],
    next: "If you want a smaller version, do one seated movement from the chair list. If you do not, close the page. Tomorrow is not a penalty.",
    related: [
      { href: "/library/move", label: "Movement library" },
      { href: "/library/guides/chair-exercises", label: "Chair exercises" },
    ],
  },
  {
    slug: "stress",
    title: "Stress",
    body: [
      "Stress can be loud in the body. You do not have to perform calm. A short seated breath is available, and so is doing nothing about the breath.",
      "If the stress is an emergency, use local emergency services or 988 in the United States. A guide is not a crisis line.",
    ],
    next: "Sit, feel your feet or the chair, and take three ordinary breaths. Stop if that makes breathing harder.",
    related: [
      { href: "/library/guides/stress-relief", label: "Five breathing exercises" },
      { href: "/choices/stress", label: "Daily choice: stress" },
    ],
  },
  {
    slug: "sleep",
    title: "A hard sleep night",
    body: [
      "A bad night does not decide the next day, and it does not mean you did the evening wrong. Lying awake is miserable. It is also common.",
      "This page will not promise that a trick will make you sleep. If nights like this are frequent, a clinician is the right person to tell.",
    ],
    next: "Dim one light, or get up for a quiet minute and then return. Skip the clock-checking if watching it makes the night louder.",
    related: [
      { href: "/library/guides/better-sleep", label: "Better Sleep" },
      { href: "/library/lessons/sleep", label: "Sleep lesson" },
    ],
  },
];

export const dailyMissions: DailyMission[] = [
  { id: "water", text: "Drink some water with one meal if a clinician has not limited your fluids." },
  { id: "walk", text: "Take a five-minute walk or a seated march." },
  { id: "label", text: "Read the Added Sugars line on one package in the kitchen." },
  { id: "window", text: "Sit by a window or in a doorway for a few minutes." },
  { id: "chair", text: "Do one movement from the chair list." },
  { id: "sentence", text: "Write one sentence about what you want this day to include." },
  { id: "plant", text: "Add one fruit or vegetable you already like." },
  { id: "cue", text: "Set one bedtime cue you can actually keep." },
];

export function itemForDate<T>(isoDate: string, items: readonly T[]): T {
  const [year, month, day] = isoDate.split("-").map(Number);
  const utc = Date.UTC(year, month - 1, day);
  const index = Math.floor(utc / 86400000);
  const safe = ((index % items.length) + items.length) % items.length;
  return items[safe];
}

export function lessonBySlug(slug: string) {
  return dailyLessons.find((item) => item.slug === slug) ?? null;
}

export function momentBySlug(slug: string) {
  return hardMoments.find((item) => item.slug === slug) ?? null;
}

export function monthCells(year: number, month: number) {
  const count = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const start = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
  const cells: { iso: string; day: number | null }[] = [];
  for (let index = 0; index < start; index += 1) cells.push({ iso: `pad-${index}`, day: null });
  for (let day = 1; day <= count; day += 1) {
    const iso = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    cells.push({ iso, day });
  }
  return cells;
}
