export const HABIT_IDS = [
  "sugar",
  "unhealthy-food",
  "emotional-eating",
  "water",
  "sleep",
  "exercise",
  "sitting",
  "smoking",
  "alcohol",
  "stress",
  "motivation",
  "screens",
  "other",
] as const;

export type HabitId = (typeof HABIT_IDS)[number];
export type CombPart = "capability" | "opportunity" | "motivation";

export type Choice = { id: string; label: string; cue?: string };

export const TITLE = "Small Steps. Real Changes. A Healthier Life.";
export const KICKER = "LIFEZOI HABIT TRANSFORMATION";
export const DIFFICULT_LINE = "Here is what may be making this habit difficult to change.";
export const RESTART_LINE = "Every day is a new opportunity. Would you like to try a smaller step today?";
export const NOTICE =
  "LifeZoi Habit Transformation is an educational wellness tool informed by behavior-change research. It is not a medical or psychological diagnostic tool. Individual results vary, and no specific health outcome is guaranteed.";
export const LOCAL_NOTE = "Your habit journey stays in this browser.";
export const HABIT_STORAGE_KEY = "lifezoi.habit-transformation.v1";
export const MICHIE_URL = "https://pmc.ncbi.nlm.nih.gov/articles/PMC3096582/";
export const FOGG_URL = "https://behaviordesign.stanford.edu/resources/fogg-behavior-model";
export const WELLNESS_COACH_PATH = "/api/ai-assistant/wellness";

export const SECTIONS = [
  { href: "/habit-transformation", label: "Intro" },
  { href: "/habit-transformation/journey", label: "Start My Habit Journey" },
  { href: "/habit-transformation/habits", label: "My Current Habits" },
  { href: "/habit-transformation/plan", label: "My Personal Action Plan" },
  { href: "/habit-transformation/progress", label: "My Progress" },
  { href: "/habit-transformation/achievements", label: "My Achievements" },
  { href: "/habit-transformation/check-in", label: "Daily Check-In" },
  { href: "/habit-transformation/actions", label: "My Tiny Daily Actions" },
  { href: "/habit-transformation/library", label: "Habit library" },
  { href: "/habit-transformation/science", label: "The Science Behind" },
] as const;

export const HABITS: { id: HabitId; label: string; short: string }[] = [
  { id: "sugar", label: "Sweet drinks or sugary snacks", short: "Sugar" },
  { id: "unhealthy-food", label: "Food that leaves me less steady", short: "Food" },
  { id: "emotional-eating", label: "Eating when feelings are loud", short: "Emotional eating" },
  { id: "water", label: "Drinking water", short: "Water" },
  { id: "sleep", label: "Sleep", short: "Sleep" },
  { id: "exercise", label: "Moving my body", short: "Movement" },
  { id: "sitting", label: "Long stretches of sitting", short: "Sitting" },
  { id: "smoking", label: "Smoking or nicotine", short: "Smoking" },
  { id: "alcohol", label: "Alcohol", short: "Alcohol" },
  { id: "stress", label: "Stress that sticks around", short: "Stress" },
  { id: "motivation", label: "Getting started", short: "Motivation" },
  { id: "screens", label: "Screens", short: "Screens" },
  { id: "other", label: "Something else", short: "Other" },
];

export const DURATION: Choice[] = [
  { id: "weeks", label: "A few weeks" },
  { id: "months", label: "A few months" },
  { id: "years", label: "More than a year" },
  { id: "unsure", label: "I am not sure" },
];

export const MOTIVATION: Choice[] = [
  { id: "steadier", label: "I want to feel a bit steadier" },
  { id: "someone", label: "Someone I care about is on my mind" },
  { id: "clinician", label: "A clinician suggested I look at daily habits" },
  { id: "curious", label: "I am curious, and I am not sure yet" },
];

export const CONFIDENCE: Choice[] = [
  { id: "possible", label: "A small step feels possible" },
  { id: "unsure", label: "I am unsure" },
  { id: "heavy", label: "This feels heavy right now" },
];

export const SUPPORT: Choice[] = [
  { id: "minutes", label: "I have a few quiet minutes" },
  { id: "packed", label: "My day is packed" },
  { id: "person", label: "Someone can remind me" },
  { id: "alone", label: "I am mostly on my own" },
];

export const HARD: (Choice & { part: CombPart })[] = [
  { id: "unsure-step", part: "capability", label: "I am not sure what a small enough step is" },
  { id: "forget", part: "capability", label: "I forget once the day starts" },
  { id: "no-time", part: "opportunity", label: "The day does not leave room" },
  { id: "people-place", part: "opportunity", label: "People or places pull the other way" },
  { id: "moment-pull", part: "motivation", label: "In the moment the old habit feels easier" },
  { id: "feeling", part: "motivation", label: "A feeling shows up and the habit follows" },
];

export const EASIER: Choice[] = [
  { id: "reminder", label: "A reminder where I already look" },
  { id: "smaller", label: "An even smaller step" },
  { id: "time", label: "A different time of day" },
  { id: "someone", label: "Someone with me" },
  { id: "nearby", label: "Having what I need close by" },
];

export const HELPED: Choice[] = [
  { id: "prompt", label: "The prompt tied to a routine" },
  { id: "person", label: "A person" },
  { id: "smaller", label: "Making the step smaller" },
  { id: "quiet", label: "A quiet minute" },
  { id: "unsure", label: "I am not sure" },
];

export const IN_THE_WAY: Choice[] = [
  { id: "time", label: "Time" },
  { id: "place", label: "The place" },
  { id: "feeling", label: "A feeling" },
  { id: "forgot", label: "I forgot" },
  { id: "unsure", label: "I am not sure" },
];

const WHEN: Record<HabitId, Choice[]> = {
  sugar: [
    { id: "morning", label: "With a morning drink", cue: "pour a morning drink" },
    { id: "afternoon", label: "In the afternoon", cue: "notice the afternoon lull" },
    { id: "evening", label: "In the evening", cue: "sit down after dinner" },
    { id: "people", label: "When I am with people", cue: "notice I am with other people" },
    { id: "unsure", label: "I am not sure", cue: "take the first quiet minute I get" },
  ],
  "unhealthy-food": [
    { id: "meal", label: "At a meal", cue: "sit down to eat" },
    { id: "snack", label: "Between meals", cue: "go looking for a snack" },
    { id: "evening", label: "In the evening", cue: "sit down after dinner" },
    { id: "out", label: "When I am away from home", cue: "leave my usual kitchen" },
    { id: "unsure", label: "I am not sure", cue: "take the first quiet minute I get" },
  ],
  "emotional-eating": [
    { id: "stress", label: "When I feel stressed", cue: "notice a strong feeling" },
    { id: "bored", label: "When I feel restless", cue: "notice I am restless" },
    { id: "evening", label: "In the evening", cue: "sit down after dinner" },
    { id: "alone", label: "When I am alone", cue: "find myself alone for a moment" },
    { id: "unsure", label: "I am not sure", cue: "take the first quiet minute I get" },
  ],
  water: [
    { id: "morning", label: "In the morning", cue: "get up" },
    { id: "meals", label: "At meals", cue: "sit down to eat" },
    { id: "afternoon", label: "In the afternoon", cue: "finish lunch" },
    { id: "forget", label: "I notice only late in the day", cue: "walk into the kitchen" },
    { id: "unsure", label: "I am not sure", cue: "take the first quiet minute I get" },
  ],
  sleep: [
    { id: "bedtime", label: "At bedtime", cue: "start getting ready for bed" },
    { id: "night", label: "When I wake at night", cue: "notice I am awake" },
    { id: "morning", label: "Early in the morning", cue: "wake up" },
    { id: "wind", label: "In the hour before bed", cue: "finish the evening" },
    { id: "unsure", label: "I am not sure", cue: "take the first quiet minute I get" },
  ],
  exercise: [
    { id: "morning", label: "In the morning", cue: "finish getting dressed" },
    { id: "lunch", label: "Around lunch", cue: "finish lunch" },
    { id: "evening", label: "In the evening", cue: "get home" },
    { id: "dayoff", label: "On a day off", cue: "finish breakfast" },
    { id: "unsure", label: "I am not sure", cue: "take the first quiet minute I get" },
  ],
  sitting: [
    { id: "tasks", label: "During a long task", cue: "have been sitting for a while" },
    { id: "evening", label: "In the evening", cue: "sit down after dinner" },
    { id: "screens", label: "While I am on a screen", cue: "open a screen" },
    { id: "travel", label: "While traveling", cue: "have been sitting for a while" },
    { id: "unsure", label: "I am not sure", cue: "take the first quiet minute I get" },
  ],
  smoking: [
    { id: "morning", label: "In the morning", cue: "pour a morning drink" },
    { id: "meal", label: "After a meal", cue: "finish a meal" },
    { id: "stress", label: "When I feel stressed", cue: "notice a strong feeling" },
    { id: "people", label: "With other people", cue: "notice I am with other people" },
    { id: "unsure", label: "I am not sure", cue: "take the first quiet minute I get" },
  ],
  alcohol: [
    { id: "evening", label: "In the evening", cue: "sit down after dinner" },
    { id: "meal", label: "With a meal", cue: "sit down to eat" },
    { id: "people", label: "With other people", cue: "notice I am with other people" },
    { id: "stress", label: "When I feel stressed", cue: "notice a strong feeling" },
    { id: "unsure", label: "I am not sure", cue: "take the first quiet minute I get" },
  ],
  stress: [
    { id: "morning", label: "In the morning", cue: "start the day" },
    { id: "task", label: "During a busy task", cue: "notice my shoulders are tight" },
    { id: "evening", label: "In the evening", cue: "sit down after dinner" },
    { id: "night", label: "At night", cue: "start getting ready for bed" },
    { id: "unsure", label: "I am not sure", cue: "take the first quiet minute I get" },
  ],
  motivation: [
    { id: "start", label: "When I need to begin", cue: "sit down to begin" },
    { id: "afternoon", label: "In the afternoon", cue: "finish lunch" },
    { id: "morning", label: "In the morning", cue: "finish getting dressed" },
    { id: "avoid", label: "When I keep putting it off", cue: "notice I am putting it off" },
    { id: "unsure", label: "I am not sure", cue: "take the first quiet minute I get" },
  ],
  screens: [
    { id: "morning", label: "First thing in the day", cue: "wake up" },
    { id: "meals", label: "At meals", cue: "sit down to eat" },
    { id: "evening", label: "In the evening", cue: "sit down after dinner" },
    { id: "bed", label: "Near bedtime", cue: "start getting ready for bed" },
    { id: "unsure", label: "I am not sure", cue: "take the first quiet minute I get" },
  ],
  other: [
    { id: "morning", label: "In the morning", cue: "finish getting dressed" },
    { id: "afternoon", label: "In the afternoon", cue: "finish lunch" },
    { id: "evening", label: "In the evening", cue: "sit down after dinner" },
    { id: "people", label: "With other people", cue: "notice I am with other people" },
    { id: "unsure", label: "I am not sure", cue: "take the first quiet minute I get" },
  ],
};

const TRIGGER: Record<HabitId, Choice[]> = {
  sugar: [
    { id: "tired", label: "Feeling tired" },
    { id: "stress", label: "A stressful moment" },
    { id: "see", label: "Seeing the food or drink" },
    { id: "offer", label: "Someone offers it" },
    { id: "unsure", label: "I am not sure" },
  ],
  "unhealthy-food": [
    { id: "hungry", label: "Strong hunger" },
    { id: "easy", label: "The easiest option nearby" },
    { id: "rush", label: "Being in a rush" },
    { id: "mood", label: "A mood" },
    { id: "unsure", label: "I am not sure" },
  ],
  "emotional-eating": [
    { id: "feeling", label: "A feeling I can name" },
    { id: "numb", label: "Feeling flat or numb" },
    { id: "people", label: "Being around other people" },
    { id: "quiet", label: "A quiet house" },
    { id: "unsure", label: "I am not sure" },
  ],
  water: [
    { id: "busy", label: "A busy stretch" },
    { id: "drinks", label: "Reaching for another drink first" },
    { id: "forget", label: "Simply forgetting" },
    { id: "out", label: "Being away from a glass" },
    { id: "unsure", label: "I am not sure" },
  ],
  sleep: [
    { id: "mind", label: "A busy mind" },
    { id: "screens", label: "A screen" },
    { id: "late", label: "A late drink or meal" },
    { id: "noise", label: "Light or noise" },
    { id: "unsure", label: "I am not sure" },
  ],
  exercise: [
    { id: "time", label: "The clock looks full" },
    { id: "weather", label: "Weather or the place" },
    { id: "tired", label: "Feeling tired" },
    { id: "alone", label: "Having no one to go with" },
    { id: "unsure", label: "I am not sure" },
  ],
  sitting: [
    { id: "task", label: "A task that keeps me seated" },
    { id: "screen", label: "A screen" },
    { id: "comfort", label: "The chair is comfortable" },
    { id: "forget", label: "Forgetting to stand" },
    { id: "unsure", label: "I am not sure" },
  ],
  smoking: [
    { id: "crave", label: "A craving" },
    { id: "place", label: "A usual place" },
    { id: "feeling", label: "A feeling" },
    { id: "routine", label: "A routine, such as coffee or a meal" },
    { id: "unsure", label: "I am not sure" },
  ],
  alcohol: [
    { id: "time", label: "The time of day" },
    { id: "people", label: "Other people drinking" },
    { id: "feeling", label: "A feeling" },
    { id: "reward", label: "Marking the end of the day" },
    { id: "unsure", label: "I am not sure" },
  ],
  stress: [
    { id: "news", label: "News or messages" },
    { id: "task", label: "A task" },
    { id: "people", label: "A conversation" },
    { id: "body", label: "A tight body" },
    { id: "unsure", label: "I am not sure" },
  ],
  motivation: [
    { id: "big", label: "The task looks too big" },
    { id: "unclear", label: "Not knowing the first move" },
    { id: "mood", label: "A low mood" },
    { id: "interrupt", label: "Interruptions" },
    { id: "unsure", label: "I am not sure" },
  ],
  screens: [
    { id: "bored", label: "Looking for something to do" },
    { id: "habit", label: "Picking it up without thinking" },
    { id: "people", label: "A message from someone" },
    { id: "bed", label: "Being in bed" },
    { id: "unsure", label: "I am not sure" },
  ],
  other: [
    { id: "time", label: "A time of day" },
    { id: "feeling", label: "A feeling" },
    { id: "people", label: "Other people" },
    { id: "place", label: "A place" },
    { id: "unsure", label: "I am not sure" },
  ],
};

const TRIED: Record<HabitId, Choice[]> = {
  sugar: [
    { id: "swap", label: "Swapping one drink" },
    { id: "move", label: "Moving snacks out of sight" },
    { id: "note", label: "A reminder" },
    { id: "nothing", label: "Nothing yet" },
  ],
  "unhealthy-food": [
    { id: "plant", label: "Adding a vegetable or fruit" },
    { id: "home", label: "Cooking one meal at home" },
    { id: "label", label: "Looking at a label" },
    { id: "nothing", label: "Nothing yet" },
  ],
  "emotional-eating": [
    { id: "pause", label: "Pausing before eating" },
    { id: "name", label: "Naming the feeling" },
    { id: "walk", label: "A short walk" },
    { id: "nothing", label: "Nothing yet" },
  ],
  water: [
    { id: "glass", label: "Keeping a glass nearby" },
    { id: "meal", label: "Drinking with a meal" },
    { id: "note", label: "A reminder" },
    { id: "nothing", label: "Nothing yet" },
  ],
  sleep: [
    { id: "wind", label: "A short wind-down" },
    { id: "screen", label: "Moving a screen away" },
    { id: "earlier", label: "Starting the evening a little earlier" },
    { id: "nothing", label: "Nothing yet" },
  ],
  exercise: [
    { id: "walk", label: "A short walk" },
    { id: "home", label: "Moving at home" },
    { id: "with", label: "Going with someone" },
    { id: "nothing", label: "Nothing yet" },
  ],
  sitting: [
    { id: "stand", label: "Standing up once" },
    { id: "timer", label: "A timer" },
    { id: "walk", label: "A short walk" },
    { id: "nothing", label: "Nothing yet" },
  ],
  smoking: [
    { id: "wait", label: "Waiting a few minutes" },
    { id: "hands", label: "Giving my hands something else" },
    { id: "line", label: "Looking up a public quitline" },
    { id: "nothing", label: "Nothing yet" },
  ],
  alcohol: [
    { id: "free", label: "A non-alcoholic drink" },
    { id: "pause", label: "A pause before the next drink" },
    { id: "day", label: "One evening without alcohol" },
    { id: "nothing", label: "Nothing yet" },
  ],
  stress: [
    { id: "breath", label: "A slow breath" },
    { id: "outside", label: "A minute outside or at a window" },
    { id: "talk", label: "Telling someone" },
    { id: "nothing", label: "Nothing yet" },
  ],
  motivation: [
    { id: "minute", label: "Doing one minute" },
    { id: "list", label: "Writing the first step" },
    { id: "with", label: "Starting with someone" },
    { id: "nothing", label: "Nothing yet" },
  ],
  screens: [
    { id: "down", label: "Putting the phone face down" },
    { id: "room", label: "Leaving it in another room" },
    { id: "alarm", label: "An alarm" },
    { id: "nothing", label: "Nothing yet" },
  ],
  other: [
    { id: "small", label: "A smaller version" },
    { id: "note", label: "A reminder" },
    { id: "with", label: "Asking someone for company" },
    { id: "nothing", label: "Nothing yet" },
  ],
};

const PROMPTS: Record<HabitId, { when: string; trigger: string; tried: string }> = {
  sugar: {
    when: "When do sweet drinks or snacks usually show up?",
    trigger: "What tends to come just before?",
    tried: "What have you already tried with sweet drinks or snacks?",
  },
  "unhealthy-food": {
    when: "When does the food pattern usually show up?",
    trigger: "What tends to come just before?",
    tried: "What have you already tried with meals or snacks?",
  },
  "emotional-eating": {
    when: "When does eating with a feeling usually show up?",
    trigger: "What tends to come just before?",
    tried: "What have you already tried in those moments?",
  },
  water: {
    when: "When do you notice water slipping?",
    trigger: "What tends to come just before?",
    tried: "What have you already tried?",
  },
  sleep: {
    when: "When does sleep get difficult?",
    trigger: "What tends to come just before?",
    tried: "What have you already tried around sleep?",
  },
  exercise: {
    when: "When would a little movement most naturally fit?",
    trigger: "What tends to get in the way of moving?",
    tried: "What have you already tried?",
  },
  sitting: {
    when: "When do the long sitting stretches happen?",
    trigger: "What tends to keep you seated?",
    tried: "What have you already tried?",
  },
  smoking: {
    when: "When does smoking or nicotine usually show up?",
    trigger: "What tends to come just before?",
    tried: "What have you already tried?",
  },
  alcohol: {
    when: "When does alcohol usually show up?",
    trigger: "What tends to come just before?",
    tried: "What have you already tried?",
  },
  stress: {
    when: "When does stress tend to stick?",
    trigger: "What tends to come just before?",
    tried: "What have you already tried?",
  },
  motivation: {
    when: "When does getting started feel hardest?",
    trigger: "What tends to come just before?",
    tried: "What have you already tried?",
  },
  screens: {
    when: "When do screens pull you in?",
    trigger: "What tends to come just before?",
    tried: "What have you already tried?",
  },
  other: {
    when: "When does this habit usually show up?",
    trigger: "What tends to come just before?",
    tried: "What have you already tried?",
  },
};

export const TINY: Record<HabitId, { action: string; easier: string }> = {
  sugar: {
    action: "swap one evening snack or sweet drink for fruit or water",
    easier: "drink a glass of water before that snack",
  },
  "unhealthy-food": {
    action: "add one piece of fruit or a handful of vegetables to one meal",
    easier: "put one piece of fruit where I will see it",
  },
  "emotional-eating": {
    action: "name the feeling in a few words before I eat",
    easier: "take one slow breath and notice whether I am hungry or feeling something else",
  },
  water: {
    action: "drink one glass of water",
    easier: "take three sips of water",
  },
  sleep: {
    action: "start a 10-minute wind-down",
    easier: "dim one light and set the phone down for two minutes",
  },
  exercise: {
    action: "take a five-minute walk",
    easier: "stand and take ten slow steps",
  },
  sitting: {
    action: "stand and roll my shoulders for one minute",
    easier: "stand up once, then sit back down",
  },
  smoking: {
    action: "wait five minutes and sip water before the next cigarette",
    easier: "step away from the usual spot for one minute",
  },
  alcohol: {
    action: "choose one non-alcoholic drink in place of one drink",
    easier: "pause for a glass of water before deciding",
  },
  stress: {
    action: "look out a window or step outside for two minutes",
    easier: "unclench my jaw and take one slow breath",
  },
  motivation: {
    action: "do only the first minute of the thing I keep postponing",
    easier: "set out what I need, then stop",
  },
  screens: {
    action: "set the phone face down for ten minutes",
    easier: "put the phone in another room while I make a drink",
  },
  other: {
    action: "do a two-minute version of the change I described",
    easier: "do a one-minute version, then stop",
  },
};

export type LibraryEntry = {
  slug: string;
  title: string;
  explanation: string;
  example: string;
  action: string;
  barrier: CombPart;
  barrierPlain: string;
  sourceName: string;
  sourceTitle: string;
  sourceUrl: string;
};

export const LIBRARY: LibraryEntry[] = [
  {
    slug: "nutrition",
    title: "Nutrition",
    explanation:
      "Food habits are often about the next meal, not a new identity. A plate can shift by one familiar food. LifeZoi keeps that shift small so it can fit a real day.",
    example: "One evening snack becomes a piece of fruit, or a sweet drink becomes water once.",
    action: "Swap one evening snack or sweet drink for fruit or water.",
    barrier: "opportunity",
    barrierPlain: "Opportunity: what is closest at the moment you eat.",
    sourceName: "Centers for Disease Control and Prevention",
    sourceTitle: "Tips for Healthy Eating for a Healthy Weight",
    sourceUrl: "https://www.cdc.gov/healthy-weight-growth/healthy-eating/index.html",
  },
  {
    slug: "movement",
    title: "Movement",
    explanation:
      "Movement can start smaller than a workout. A few minutes still counts as practice. The point is to make the first move easy enough to repeat.",
    example: "A five-minute walk after lunch, indoors or outside.",
    action: "Take a five-minute walk.",
    barrier: "capability",
    barrierPlain: "Capability: a step small enough to picture and do.",
    sourceName: "Centers for Disease Control and Prevention",
    sourceTitle: "Adult Activity: An Overview",
    sourceUrl: "https://www.cdc.gov/physical-activity-basics/guidelines/adults.html",
  },
  {
    slug: "sleep",
    title: "Sleep",
    explanation:
      "Sleep responds to the last part of the evening more kindly than to a perfect schedule. A short wind-down is a place to begin. It does not promise a full night.",
    example: "A 10-minute wind-down when the evening ends.",
    action: "Start a 10-minute wind-down.",
    barrier: "opportunity",
    barrierPlain: "Opportunity: a pocket of time before bed.",
    sourceName: "National Heart, Lung, and Blood Institute",
    sourceTitle: "How much sleep is enough?",
    sourceUrl: "https://www.nhlbi.nih.gov/health/sleep/how-much-sleep",
  },
  {
    slug: "stress",
    title: "Stress",
    explanation:
      "Stress is a signal, not a personal flaw. A two-minute pause does not erase the cause. It gives the body one smaller place to land.",
    example: "Look out a window, or step outside, for two minutes.",
    action: "Look out a window or step outside for two minutes.",
    barrier: "motivation",
    barrierPlain: "Motivation: the pull to keep pushing past the moment.",
    sourceName: "National Institute of Mental Health",
    sourceTitle: "I'm So Stressed Out! Fact Sheet",
    sourceUrl: "https://www.nimh.nih.gov/health/publications/so-stressed-out-fact-sheet",
  },
  {
    slug: "smoking",
    title: "Smoking",
    explanation:
      "Nicotine habits often attach to a place, a drink, or a feeling. A five-minute wait is a pause, not a treatment plan. A clinician or a public quitline can help with stopping. This page does not give a medical plan.",
    example: "Wait five minutes and sip water before the next cigarette.",
    action: "Wait five minutes and sip water before the next cigarette.",
    barrier: "motivation",
    barrierPlain: "Motivation: the in-the-moment pull of the usual cigarette.",
    sourceName: "Centers for Disease Control and Prevention",
    sourceTitle: "Cigarette Smoking",
    sourceUrl: "https://www.cdc.gov/tobacco/about/index.html",
  },
  {
    slug: "alcohol",
    title: "Alcohol",
    explanation:
      "One drink can be swapped for something without alcohol. That is an educational idea, not a withdrawal plan. If cutting back feels unsafe, a clinician is the right person to talk with before changing how much you drink.",
    example: "Choose one non-alcoholic drink in place of one drink.",
    action: "Choose one non-alcoholic drink in place of one drink.",
    barrier: "opportunity",
    barrierPlain: "Opportunity: what is in your hand and who is around you.",
    sourceName: "National Institute on Alcohol Abuse and Alcoholism",
    sourceTitle: "Alcohol's effects on health",
    sourceUrl: "https://www.niaaa.nih.gov/alcohols-effects-health",
  },
  {
    slug: "hydration",
    title: "Hydration",
    explanation:
      "Water is easier when the glass is already there. One glass tied to something you already do is enough for a practice day. Thirst and health needs differ from person to person.",
    example: "Drink one glass of water with a meal you already eat.",
    action: "Drink one glass of water.",
    barrier: "opportunity",
    barrierPlain: "Opportunity: water close to a routine you already keep.",
    sourceName: "Centers for Disease Control and Prevention",
    sourceTitle: "About Water and Healthier Drinks",
    sourceUrl: "https://www.cdc.gov/healthy-weight-growth/water-healthy-drinks/index.html",
  },
  {
    slug: "healthy-aging",
    title: "Healthy Aging",
    explanation:
      "Later life still has room for small daily practices. A short walk, a regular meal, or a wind-down can sit beside the abilities you have today. Nothing here measures aging or promises a longer life.",
    example: "A five-minute walk, or ten slow steps if a walk is not available.",
    action: "Take a five-minute walk, or ten slow steps.",
    barrier: "capability",
    barrierPlain: "Capability: matching the step to the energy you have today.",
    sourceName: "National Institute on Aging",
    sourceTitle: "What Do We Know About Healthy Aging?",
    sourceUrl: "https://www.nia.nih.gov/health/healthy-aging/what-do-we-know-about-healthy-aging",
  },
  {
    slug: "digital-habits",
    title: "Digital Habits",
    explanation:
      "Screens often fill a gap: boredom, a message, or the last minutes before sleep. Putting the phone down for a few minutes is a practice, not a verdict on how you spend your time.",
    example: "Set the phone face down for ten minutes after dinner.",
    action: "Set the phone face down for ten minutes.",
    barrier: "opportunity",
    barrierPlain: "Opportunity: where the phone sits during a routine you already have.",
    sourceName: "NHS",
    sourceTitle: "Screen time and mental health",
    sourceUrl: "https://londonwaitingroom.nhs.uk/screen-time",
  },
  {
    slug: "motivation",
    title: "Motivation",
    explanation:
      "Getting started can be hard without meaning you lack character. COM-B treats motivation as one part of a behavior, beside capability and opportunity. A one-minute start is a way to practice, not a test of willpower.",
    example: "Do only the first minute of a task you keep postponing.",
    action: "Do the first minute, then stop.",
    barrier: "motivation",
    barrierPlain: "Motivation: the task feels larger than the reason to begin.",
    sourceName: "Michie, van Stralen, and West",
    sourceTitle: "The behaviour change wheel: a new method for characterising and designing behaviour change interventions (2011)",
    sourceUrl: MICHIE_URL,
  },
];

export function isHabitId(value: unknown): value is HabitId {
  return typeof value === "string" && (HABIT_IDS as readonly string[]).includes(value);
}

export function habitMeta(id: HabitId) {
  const found = HABITS.find((item) => item.id === id);
  if (!found) throw new Error("Unknown habit.");
  return found;
}

export function whenChoices(id: HabitId): Choice[] {
  return WHEN[id];
}

export function triggerChoices(id: HabitId): Choice[] {
  return TRIGGER[id];
}

export function triedChoices(id: HabitId): Choice[] {
  return TRIED[id];
}

export function followPrompts(id: HabitId) {
  return {
    ...PROMPTS[id],
    duration: "How long has this been part of your days?",
    hard: "What makes a change hard right now?",
    motivation: "What is pulling you toward a change?",
    confidence: "How possible does a small step feel?",
    support: "How are time and support looking?",
    easier: "What would make tomorrow easier?",
  };
}

export function choiceLabel(choices: Choice[], id: string): string {
  return choices.find((item) => item.id === id)?.label ?? "";
}

export function libraryBySlug(slug: string): LibraryEntry | undefined {
  return LIBRARY.find((item) => item.slug === slug);
}
