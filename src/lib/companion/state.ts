import { isRealISODate, mondayOf } from "@/lib/dates";
import { emptyBreathe, isEmptyBreathe, sanitizeBreathe, type BreatheState } from "@/lib/breathe/state";

/**
 * Companion state: the guidance mode, preferences, daily logs, weekly
 * reviews, plans, media progress, and game history.
 *
 * It is separate from `profiles.session_state`, which has a 24 KB limit.
 * In the browser it lives in localStorage under a per-account key. When the
 * `companion_state` table from supabase/migrations exists, a signed-in
 * account also saves it there with row level security.
 */

export const GUIDANCE_MODES = ["daily", "weekly", "anytime"] as const;
export type GuidanceMode = (typeof GUIDANCE_MODES)[number];

export const ACTIVITY_KINDS = [
  "walking",
  "pilates",
  "yoga",
  "chair-yoga",
  "chair-exercises",
  "tai-chi",
  "qigong",
  "dancing",
  "aerobics",
  "home-cardio",
  "stretching",
  "strength",
  "balance",
  "breathing",
  "relaxation",
  "meditation",
  "gardening",
] as const;
export type ActivityKind = (typeof ACTIVITY_KINDS)[number];

export const SESSION_MINUTES = [10, 15, 20, 30, 45, 60] as const;
export type SessionMinutes = (typeof SESSION_MINUTES)[number];

export const FITNESS_LEVELS = ["beginner", "intermediate", "advanced"] as const;
export type FitnessLevel = (typeof FITNESS_LEVELS)[number];

export const EXPERIENCE = ["new", "some", "regular"] as const;
export type Experience = (typeof EXPERIENCE)[number];

export const YES_NO = ["yes", "no", "sometimes"] as const;
export type YesNo = (typeof YES_NO)[number];

export const MEAL_STYLES = ["quick", "home-cooked", "light", "hearty", "no-cook", "batch", "warm", "cold"] as const;
export type MealStyle = (typeof MEAL_STYLES)[number];

/**
 * Women's Care (inside Food & Wellness). Every field is the person's own
 * answer. Nothing here is inferred from a name, the assessment, or any other
 * data, and it is never sent to an AI or other outside service.
 */
export const LIFE_STAGES = ["cycle", "perimenopause", "menopause"] as const;
export type LifeStage = (typeof LIFE_STAGES)[number];

export const CYCLE_PHASES = ["period", "follicular", "ovulation", "luteal", "unsure"] as const;
export type CyclePhase = (typeof CYCLE_PHASES)[number];

export const CARE_SYMPTOMS = [
  "tired",
  "cramps",
  "bloating",
  "sweet-cravings",
  "salty-cravings",
  "big-appetite",
  "low-mood",
  "headache",
  "hot-flushes",
  "poor-sleep",
  "heavy-bleeding",
  "severe",
] as const;
export type CareSymptom = (typeof CARE_SYMPTOMS)[number];

export type WomensCarePrefs = {
  /** The person said she identifies as a woman. Never set automatically. */
  identifiesAsWoman: boolean;
  /** The person said cycle or menopause nutrition is relevant to her. Never set automatically. */
  relevant: boolean;
  stage: LifeStage | "";
  /** Only used when stage is "cycle". */
  phase: CyclePhase | "";
  symptoms: CareSymptom[];
  /** The person is worried about low iron. Shown as a reason to see a clinician, not a diagnosis. */
  ironConcern: boolean;
  updatedOn: string;
};

export type MovementPrefs = {
  enjoyed: ActivityKind[];
  disliked: ActivityKind[];
  minutes: SessionMinutes;
  level: FitnessLevel | "";
  experience: Experience | "";
  /** The person asked for harder sessions. Never set automatically. */
  wantsChallenge: boolean;
};

export type FoodPrefs = {
  /** Foods the person enjoys, chosen in the searchable selector or typed. */
  liked: string[];
  /** Foods the person dislikes. Left out of suggestions; a swap may be used. */
  disliked: string[];
  /** Permanent exclusions: never in a suggested meal, sauce, topping, or swap. */
  exclusions: string[];
  eatsMeat: YesNo | "";
  eatsFish: YesNo | "";
  eatsDairy: YesNo | "";
  cuisines: string[];
  mealStyles: MealStyle[];
  calorieTracking: boolean;
};

export type PersonalGoal = {
  id: string;
  text: string;
  createdOn: string;
  updatedOn: string;
  archivedOn: string;
};

export const ENTRY_STATUSES = ["done", "partial", "skipped"] as const;
export type EntryStatus = (typeof ENTRY_STATUSES)[number];

export type ActivityEntry = {
  status: EntryStatus;
  minutes: number;
  /** An activity id chosen instead of the suggested one. */
  replacedWith: string;
};

export type DayLog = {
  date: string;
  entries: Record<string, ActivityEntry>;
  walkingMinutes: number;
  exerciseMinutes: number;
  readingPages: number;
  listeningMinutes: number;
  brainGames: number;
  nutritionHabits: number;
  sleepHours: number | null;
  mood: number | null;
  energy: number | null;
  /** The person declined the outdoor walk today. */
  stayInside: boolean;
};

export type WeeklyReview = {
  id: string;
  weekStart: string;
  savedAt: string;
  feeling: number | null;
  energy: number | null;
  exerciseDays: number | null;
  walkingMinutes: number | null;
  booksRead: number | null;
  pagesRead: number | null;
  brainGames: number | null;
  nutrition: "" | "mostly" | "sometimes" | "rarely" | "not-tried";
  weightKg: number | null;
  bloodSugar: string;
  bloodPressure: string;
  cholesterol: string;
  difficult: string;
  improveNext: string;
  disliked: ActivityKind[];
  goalsChanged: boolean | null;
};

export const SUGGESTION_STATUSES = ["proposed", "accepted", "modified", "rejected"] as const;
export type SuggestionStatus = (typeof SUGGESTION_STATUSES)[number];

export type PlanSuggestion = {
  id: string;
  area: string;
  text: string;
  reason: string;
  status: SuggestionStatus;
  edited: string;
};

export type WeeklyPlan = {
  weekStart: string;
  createdOn: string;
  basedOn: string;
  suggestions: PlanSuggestion[];
};

export type GameRecord = {
  id: string;
  game: string;
  date: string;
  seconds: number;
  completed: boolean;
};

export type MediaState = {
  favorites: string[];
  recent: { id: string; at: string }[];
  /** Seconds for audio and video, paragraph index for books. */
  positions: Record<string, number>;
  bookmarks: Record<string, number[]>;
  ratings: Record<string, number>;
};

export type DayCustomization = {
  hidden: string[];
  times: Record<string, string>;
  /** Chosen replacements for a slot, by slot id. */
  picks: Record<string, string>;
};

export type CompanionState = {
  version: 1;
  updatedAt: string;
  mode: GuidanceMode | "";
  modeChosenOn: string;
  movement: MovementPrefs;
  food: FoodPrefs;
  goals: PersonalGoal[];
  days: Record<string, DayLog>;
  customize: DayCustomization;
  reviews: WeeklyReview[];
  plans: WeeklyPlan[];
  media: MediaState;
  games: GameRecord[];
  /** Breathe for Life sessions, weekly days, and the 30-day challenge. */
  breathe: BreatheState;
  womensCare: WomensCarePrefs;
};

export const LIMITS = {
  days: 200,
  reviews: 80,
  plans: 30,
  games: 400,
  recent: 30,
  favorites: 200,
  goals: 30,
  exclusions: 60,
  text: 280,
  word: 40,
} as const;

export function emptyMovementPrefs(): MovementPrefs {
  return { enjoyed: [], disliked: [], minutes: 20, level: "", experience: "", wantsChallenge: false };
}

export function emptyFoodPrefs(): FoodPrefs {
  return {
    liked: [],
    disliked: [],
    exclusions: [],
    eatsMeat: "",
    eatsFish: "",
    eatsDairy: "",
    cuisines: [],
    mealStyles: [],
    calorieTracking: false,
  };
}

export function emptyWomensCare(): WomensCarePrefs {
  return { identifiesAsWoman: false, relevant: false, stage: "", phase: "", symptoms: [], ironConcern: false, updatedOn: "" };
}

export function emptyCompanion(): CompanionState {
  return {
    version: 1,
    updatedAt: "",
    mode: "",
    modeChosenOn: "",
    movement: emptyMovementPrefs(),
    food: emptyFoodPrefs(),
    goals: [],
    days: {},
    customize: { hidden: [], times: {}, picks: {} },
    reviews: [],
    plans: [],
    media: { favorites: [], recent: [], positions: {}, bookmarks: {}, ratings: {} },
    games: [],
    breathe: emptyBreathe(),
    womensCare: emptyWomensCare(),
  };
}

export function emptyDay(date: string): DayLog {
  return {
    date,
    entries: {},
    walkingMinutes: 0,
    exerciseMinutes: 0,
    readingPages: 0,
    listeningMinutes: 0,
    brainGames: 0,
    nutritionHabits: 0,
    sleepHours: null,
    mood: null,
    energy: null,
    stayInside: false,
  };
}

export function isEmptyCompanion(state: CompanionState): boolean {
  return (
    !state.mode &&
    state.goals.length === 0 &&
    Object.keys(state.days).length === 0 &&
    state.reviews.length === 0 &&
    state.plans.length === 0 &&
    state.games.length === 0 &&
    state.media.favorites.length === 0 &&
    state.media.recent.length === 0 &&
    state.movement.enjoyed.length === 0 &&
    state.food.exclusions.length === 0 &&
    state.food.liked.length === 0 &&
    state.food.disliked.length === 0 &&
    isEmptyBreathe(state.breathe) &&
    !state.womensCare.identifiesAsWoman &&
    !state.womensCare.relevant
  );
}

// ---------- sanitizing ----------

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

export function cleanText(value: unknown, limit: number = LIMITS.text): string {
  if (typeof value !== "string") return "";
  return value.replace(/[\u0000-\u001F\u007F]/g, " ").replace(/\s+/g, " ").trim().slice(0, limit);
}

function oneOf<T extends string>(value: unknown, allowed: readonly T[]): T | "" {
  return typeof value === "string" && allowed.includes(value as T) ? (value as T) : "";
}

function listOf<T extends string>(value: unknown, allowed: readonly T[]): T[] {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter((item): item is T => typeof item === "string" && allowed.includes(item as T)))];
}

function count(value: unknown, max: number): number {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) return 0;
  return Math.min(Math.round(value), max);
}

function maybe(value: unknown, min: number, max: number, decimals = 0): number | null {
  if (typeof value !== "number" || !Number.isFinite(value) || value < min || value > max) return null;
  const f = 10 ** decimals;
  return Math.round(value * f) / f;
}

const ID = /^[A-Za-z0-9:_-]{1,80}$/;

export function cleanId(value: unknown): string {
  return typeof value === "string" && ID.test(value) ? value : "";
}

/** Food words for an exclusion list: lowercase, short, no duplicates. */
export function cleanFoodWords(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  const words: string[] = [];
  for (const item of value) {
    const word = cleanText(item, LIMITS.word).toLowerCase();
    if (word && !words.includes(word)) words.push(word);
  }
  return words.slice(0, LIMITS.exclusions);
}

/** Split typed text such as "avocado, mushrooms and olives" into food words. */
export function splitFoods(text: string): string[] {
  return cleanFoodWords(
    text
      .split(/,|;|\band\b|\n/i)
      .map((part) => part.trim())
      .filter(Boolean),
  );
}

function sanitizeEntry(value: unknown): ActivityEntry | null {
  const row = asRecord(value);
  const status = oneOf(row.status, ENTRY_STATUSES);
  if (!status) return null;
  return { status, minutes: count(row.minutes, 600), replacedWith: cleanId(row.replacedWith) };
}

function sanitizeDay(date: string, value: unknown): DayLog | null {
  if (!isRealISODate(date)) return null;
  const row = asRecord(value);
  const entries: Record<string, ActivityEntry> = {};
  for (const [key, entry] of Object.entries(asRecord(row.entries)).slice(0, 40)) {
    const id = cleanId(key);
    const clean = sanitizeEntry(entry);
    if (id && clean) entries[id] = clean;
  }
  return {
    date,
    entries,
    walkingMinutes: count(row.walkingMinutes, 1440),
    exerciseMinutes: count(row.exerciseMinutes, 1440),
    readingPages: count(row.readingPages, 2000),
    listeningMinutes: count(row.listeningMinutes, 1440),
    brainGames: count(row.brainGames, 200),
    nutritionHabits: count(row.nutritionHabits, 10),
    sleepHours: maybe(row.sleepHours, 0, 24, 1),
    mood: maybe(row.mood, 1, 5),
    energy: maybe(row.energy, 1, 5),
    stayInside: row.stayInside === true,
  };
}

function sanitizeReview(value: unknown): WeeklyReview | null {
  const row = asRecord(value);
  const id = cleanId(row.id);
  const weekStart = typeof row.weekStart === "string" ? mondayOf(row.weekStart) : "";
  const savedAt = typeof row.savedAt === "string" && !Number.isNaN(Date.parse(row.savedAt)) ? row.savedAt : "";
  if (!id || !weekStart || !savedAt) return null;
  return {
    id,
    weekStart,
    savedAt,
    feeling: maybe(row.feeling, 1, 5),
    energy: maybe(row.energy, 1, 5),
    exerciseDays: maybe(row.exerciseDays, 0, 7),
    walkingMinutes: maybe(row.walkingMinutes, 0, 5000),
    booksRead: maybe(row.booksRead, 0, 50),
    pagesRead: maybe(row.pagesRead, 0, 5000),
    brainGames: maybe(row.brainGames, 0, 500),
    nutrition: oneOf(row.nutrition, ["mostly", "sometimes", "rarely", "not-tried"] as const),
    weightKg: maybe(row.weightKg, 30, 300, 1),
    bloodSugar: cleanText(row.bloodSugar, 60),
    bloodPressure: cleanText(row.bloodPressure, 60),
    cholesterol: cleanText(row.cholesterol, 60),
    difficult: cleanText(row.difficult),
    improveNext: cleanText(row.improveNext),
    disliked: listOf(row.disliked, ACTIVITY_KINDS),
    goalsChanged: typeof row.goalsChanged === "boolean" ? row.goalsChanged : null,
  };
}

function sanitizePlan(value: unknown): WeeklyPlan | null {
  const row = asRecord(value);
  const weekStart = typeof row.weekStart === "string" ? mondayOf(row.weekStart) : "";
  const createdOn = typeof row.createdOn === "string" && isRealISODate(row.createdOn) ? row.createdOn : "";
  if (!weekStart || !createdOn) return null;
  const suggestions = (Array.isArray(row.suggestions) ? row.suggestions : [])
    .map((item): PlanSuggestion | null => {
      const s = asRecord(item);
      const id = cleanId(s.id);
      const text = cleanText(s.text);
      const status = oneOf(s.status, SUGGESTION_STATUSES);
      if (!id || !text || !status) return null;
      return { id, area: cleanText(s.area, 60), text, reason: cleanText(s.reason), status, edited: cleanText(s.edited) };
    })
    .filter((item): item is PlanSuggestion => item !== null)
    .slice(0, 20);
  return { weekStart, createdOn, basedOn: cleanId(row.basedOn), suggestions };
}

function sanitizeNumberMap(value: unknown, max: number): Record<string, number> {
  const out: Record<string, number> = {};
  for (const [key, raw] of Object.entries(asRecord(value)).slice(0, 300)) {
    const id = cleanId(key);
    const n = maybe(raw, 0, max);
    if (id && n !== null) out[id] = n;
  }
  return out;
}

export function sanitizeWomensCare(value: unknown): WomensCarePrefs {
  const row = asRecord(value);
  const stage = oneOf(row.stage, LIFE_STAGES);
  return {
    identifiesAsWoman: row.identifiesAsWoman === true,
    relevant: row.relevant === true,
    stage,
    phase: stage === "cycle" ? oneOf(row.phase, CYCLE_PHASES) : "",
    symptoms: listOf(row.symptoms, CARE_SYMPTOMS),
    ironConcern: row.ironConcern === true,
    updatedOn: typeof row.updatedOn === "string" && isRealISODate(row.updatedOn) ? row.updatedOn : "",
  };
}

export function sanitizeCompanion(input: unknown): CompanionState {
  const record = asRecord(input);
  const movement = asRecord(record.movement);
  const food = asRecord(record.food);
  const media = asRecord(record.media);
  const customize = asRecord(record.customize);
  const minutes = SESSION_MINUTES.find((value) => value === movement.minutes) ?? 20;

  const days: Record<string, DayLog> = {};
  const dayKeys = Object.keys(asRecord(record.days)).sort().slice(-LIMITS.days);
  for (const key of dayKeys) {
    const day = sanitizeDay(key, asRecord(record.days)[key]);
    if (day) days[key] = day;
  }

  const goals = (Array.isArray(record.goals) ? record.goals : [])
    .map((item): PersonalGoal | null => {
      const row = asRecord(item);
      const id = cleanId(row.id);
      const text = cleanText(row.text, 160);
      const createdOn = typeof row.createdOn === "string" && isRealISODate(row.createdOn) ? row.createdOn : "";
      if (!id || !text || !createdOn) return null;
      const updatedOn = typeof row.updatedOn === "string" && isRealISODate(row.updatedOn) ? row.updatedOn : createdOn;
      const archivedOn = typeof row.archivedOn === "string" && isRealISODate(row.archivedOn) ? row.archivedOn : "";
      return { id, text, createdOn, updatedOn, archivedOn };
    })
    .filter((item): item is PersonalGoal => item !== null)
    .slice(0, LIMITS.goals);

  const bookmarks: Record<string, number[]> = {};
  for (const [key, raw] of Object.entries(asRecord(media.bookmarks)).slice(0, 100)) {
    const id = cleanId(key);
    if (!id || !Array.isArray(raw)) continue;
    bookmarks[id] = [...new Set(raw.filter((n): n is number => Number.isInteger(n) && n >= 0 && n < 10000))].slice(0, 50);
  }

  const times: Record<string, string> = {};
  for (const [key, raw] of Object.entries(asRecord(customize.times)).slice(0, 30)) {
    const id = cleanId(key);
    if (id && typeof raw === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(raw)) times[id] = raw;
  }
  const picks: Record<string, string> = {};
  for (const [key, raw] of Object.entries(asRecord(customize.picks)).slice(0, 30)) {
    const id = cleanId(key);
    const value = cleanId(raw);
    if (id && value) picks[id] = value;
  }

  return {
    version: 1,
    updatedAt: typeof record.updatedAt === "string" && !Number.isNaN(Date.parse(record.updatedAt)) ? record.updatedAt : "",
    mode: oneOf(record.mode, GUIDANCE_MODES),
    modeChosenOn: typeof record.modeChosenOn === "string" && isRealISODate(record.modeChosenOn) ? record.modeChosenOn : "",
    movement: {
      enjoyed: listOf(movement.enjoyed, ACTIVITY_KINDS),
      disliked: listOf(movement.disliked, ACTIVITY_KINDS),
      minutes,
      level: oneOf(movement.level, FITNESS_LEVELS),
      experience: oneOf(movement.experience, EXPERIENCE),
      wantsChallenge: movement.wantsChallenge === true,
    },
    food: {
      liked: cleanFoodWords(food.liked),
      disliked: cleanFoodWords(food.disliked),
      exclusions: cleanFoodWords(food.exclusions),
      eatsMeat: oneOf(food.eatsMeat, YES_NO),
      eatsFish: oneOf(food.eatsFish, YES_NO),
      eatsDairy: oneOf(food.eatsDairy, YES_NO),
      cuisines: cleanFoodWords(food.cuisines).slice(0, 20),
      mealStyles: listOf(food.mealStyles, MEAL_STYLES),
      calorieTracking: food.calorieTracking === true,
    },
    goals,
    days,
    customize: {
      hidden: (Array.isArray(customize.hidden) ? customize.hidden : []).map(cleanId).filter(Boolean).slice(0, 30),
      times,
      picks,
    },
    reviews: (Array.isArray(record.reviews) ? record.reviews : [])
      .map(sanitizeReview)
      .filter((item): item is WeeklyReview => item !== null)
      .filter((item, index, all) => all.findIndex((other) => other.weekStart === item.weekStart) === index)
      .sort((a, b) => b.weekStart.localeCompare(a.weekStart))
      .slice(0, LIMITS.reviews),
    plans: (Array.isArray(record.plans) ? record.plans : [])
      .map(sanitizePlan)
      .filter((item): item is WeeklyPlan => item !== null)
      .filter((item, index, all) => all.findIndex((other) => other.weekStart === item.weekStart) === index)
      .sort((a, b) => b.weekStart.localeCompare(a.weekStart))
      .slice(0, LIMITS.plans),
    media: {
      favorites: (Array.isArray(media.favorites) ? media.favorites : []).map(cleanId).filter(Boolean).filter((id, i, all) => all.indexOf(id) === i).slice(0, LIMITS.favorites),
      recent: (Array.isArray(media.recent) ? media.recent : [])
        .map((item) => {
          const row = asRecord(item);
          const id = cleanId(row.id);
          const at = typeof row.at === "string" && !Number.isNaN(Date.parse(row.at)) ? row.at : "";
          return id && at ? { id, at } : null;
        })
        .filter((item): item is { id: string; at: string } => item !== null)
        .slice(0, LIMITS.recent),
      positions: sanitizeNumberMap(media.positions, 100000),
      bookmarks,
      ratings: Object.fromEntries(Object.entries(sanitizeNumberMap(media.ratings, 5)).filter(([, n]) => n >= 1)),
    },
    games: (Array.isArray(record.games) ? record.games : [])
      .map((item): GameRecord | null => {
        const row = asRecord(item);
        const id = cleanId(row.id);
        const game = cleanId(row.game);
        const date = typeof row.date === "string" && isRealISODate(row.date) ? row.date : "";
        if (!id || !game || !date) return null;
        return { id, game, date, seconds: count(row.seconds, 36000), completed: row.completed === true };
      })
      .filter((item): item is GameRecord => item !== null)
      .slice(0, LIMITS.games),
    breathe: sanitizeBreathe(record.breathe),
    womensCare: sanitizeWomensCare(record.womensCare),
  };
}

// ---------- updates (pure) ----------

export function withDay(state: CompanionState, date: string, change: (day: DayLog) => DayLog): CompanionState {
  const current = state.days[date] ?? emptyDay(date);
  const days = { ...state.days, [date]: change(current) };
  const keys = Object.keys(days).sort();
  while (keys.length > LIMITS.days) delete days[keys.shift() as string];
  return { ...state, days };
}

export function recordEntry(
  state: CompanionState,
  date: string,
  activityId: string,
  entry: ActivityEntry,
  counts: Partial<Pick<DayLog, "walkingMinutes" | "exerciseMinutes" | "readingPages" | "listeningMinutes" | "brainGames" | "nutritionHabits">> = {},
): CompanionState {
  return withDay(state, date, (day) => {
    const previous = day.entries[activityId];
    const next = { ...day, entries: { ...day.entries, [activityId]: entry } };
    // Counts are added only the first time an activity is marked done or partly done.
    if (previous && previous.status !== "skipped") return next;
    if (entry.status === "skipped") return next;
    for (const [key, value] of Object.entries(counts) as [keyof typeof counts, number][]) {
      next[key] = (next[key] ?? 0) + Math.max(0, Math.round(value));
    }
    return next;
  });
}

export function clearEntry(state: CompanionState, date: string, activityId: string): CompanionState {
  return withDay(state, date, (day) => {
    const entries = { ...day.entries };
    delete entries[activityId];
    return { ...day, entries };
  });
}

export function addRecent(state: CompanionState, id: string, at: string): CompanionState {
  const recent = [{ id, at }, ...state.media.recent.filter((item) => item.id !== id)].slice(0, LIMITS.recent);
  return { ...state, media: { ...state.media, recent } };
}

export function toggleFavorite(state: CompanionState, id: string): CompanionState {
  const has = state.media.favorites.includes(id);
  const favorites = has ? state.media.favorites.filter((item) => item !== id) : [id, ...state.media.favorites].slice(0, LIMITS.favorites);
  return { ...state, media: { ...state.media, favorites } };
}

export function upsertReview(state: CompanionState, review: WeeklyReview): CompanionState {
  const reviews = [review, ...state.reviews.filter((item) => item.weekStart !== review.weekStart)]
    .sort((a, b) => b.weekStart.localeCompare(a.weekStart))
    .slice(0, LIMITS.reviews);
  return { ...state, reviews };
}

export function upsertPlan(state: CompanionState, plan: WeeklyPlan): CompanionState {
  const plans = [plan, ...state.plans.filter((item) => item.weekStart !== plan.weekStart)]
    .sort((a, b) => b.weekStart.localeCompare(a.weekStart))
    .slice(0, LIMITS.plans);
  return { ...state, plans };
}

export function addGame(state: CompanionState, record: GameRecord): CompanionState {
  const games = [record, ...state.games].slice(0, LIMITS.games);
  return withDay({ ...state, games }, record.date, (day) => ({
    ...day,
    brainGames: day.brainGames + (record.completed ? 1 : 0),
  }));
}
