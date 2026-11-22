import { msg } from "@/lib/i18n/translate";

/**
 * One place for every people and lifestyle photo the members' pages show.
 *
 * Each photo is stored locally in `public/imagery/` (resized to at most 960 px
 * wide, WebP), so nothing is hotlinked and nothing breaks if a source moves.
 * Every entry records where it came from, who made it, and its license.
 * `docs/IMAGE_CREDITS.md` lists the same credits for people reading the repo.
 *
 * Rules (owner request, 2026-11-22):
 * - LifeZoi is for adults from about 30 onward, not only older people.
 * - No person or photograph is used twice. `registry.test.ts` checks the files.
 * - Only CC0, public domain, or CC BY / CC BY-SA photos. CC BY photos show
 *   their credit next to the image (see `LzPhoto`).
 */

export type License = "CC0" | "Public domain" | "CC BY 2.0" | "CC BY-SA 2.0" | "CC BY-SA 4.0";

export type PhotoCredit = {
  author: string;
  license: License;
  /** The Wikimedia Commons file page, which links on to the original upload. */
  source: string;
};

/** Rough age band of the people shown, used only to check variety. Never shown in the app. */
export type AgeBand = "30s" | "40s" | "50s" | "60s" | "70s+" | "mixed" | "none";

export type Photo = {
  src: string;
  width: number;
  height: number;
  alt: string;
  credit: PhotoCredit;
  ages: AgeBand;
  /** CSS object-position when the photo is cropped, e.g. "50% 30%". */
  focus?: string;
};

const commons = (file: string) => `https://commons.wikimedia.org/wiki/File:${file}`;

export const PHOTOS = {
  "daily-morning": {
    src: "/imagery/daily-morning.webp",
    width: 960,
    height: 641,
    alt: msg("A smiling woman with silver curls stretches on a mat in her bright living room."),
    credit: { author: "Shixart1985", license: "CC BY 2.0", source: commons("Beautiful_senior_woman_with_curly_hair_doing_yoga_at_home.jpg") },
    ages: "60s",
    focus: "60% 40%",
  },
  "daily-calm": {
    src: "/imagery/daily-calm.webp",
    width: 960,
    height: 640,
    alt: msg("An older woman sits calmly on a blanket on the beach with her eyes closed, enjoying the sun."),
    credit: { author: "Amy Serin", license: "CC BY-SA 4.0", source: commons("Peaceful-senior-woman-meditating-outdoors.jpg") },
    ages: "70s+",
    focus: "70% 50%",
  },
  nutrition: {
    src: "/imagery/nutrition.webp",
    width: 960,
    height: 639,
    alt: msg("A woman with grey hair slices fresh peppers and tomatoes by a sunny kitchen window."),
    credit: { author: "Shixart1985", license: "CC BY 2.0", source: commons("Elderly_woman_prepares_vegetables_while_cooking_in_a_home_kitchen_during_the_day.jpg") },
    ages: "60s",
    focus: "65% 45%",
  },
  "change-lab": {
    src: "/imagery/change-lab.webp",
    width: 960,
    height: 640,
    alt: msg("A woman in sunglasses rides a bicycle with a wicker basket down a cobbled street."),
    credit: { author: "Clem Onojeghuo", license: "CC0", source: commons("Lady_on_a_bike_(Unsplash).jpg") },
    ages: "50s",
    focus: "50% 12%",
  },
  assessment: {
    src: "/imagery/assessment.webp",
    width: 960,
    height: 641,
    alt: msg("Seen from above, a hand writes notes beside a bowl of fruit and a glass of juice."),
    credit: { author: "Shixart1985", license: "CC BY 2.0", source: commons("Woman_writing_notes_while_enjoying_a_fresh_fruit_platter_and_juice.jpg") },
    ages: "none",
  },
  "what-if": {
    src: "/imagery/what-if.webp",
    width: 960,
    height: 720,
    alt: msg("An older couple with backpacks walks hand in hand down a city street."),
    credit: { author: "pasja1000 (Pixabay)", license: "CC0", source: commons("Senior-3336451_1920.jpg") },
    ages: "70s+",
    focus: "50% 40%",
  },
  progress: {
    src: "/imagery/progress.webp",
    width: 960,
    height: 640,
    alt: msg("A man and a woman jog side by side along a leafy park path."),
    credit: { author: "Ed Yourdon", license: "CC BY-SA 2.0", source: commons("Jogging_couple.jpg") },
    ages: "40s",
    focus: "55% 45%",
  },
  energy: {
    src: "/imagery/energy.webp",
    width: 800,
    height: 1000,
    alt: msg("A man and a woman in a bright yellow dress dance salsa together at a street festival."),
    credit: { author: "Ryan (Toronto)", license: "CC BY 2.0", source: commons("Salsa_dancing_(7564732146).jpg") },
    ages: "30s",
    focus: "50% 12%",
  },
  "nutrition-topic": {
    src: "/imagery/nutrition-topic.webp",
    width: 960,
    height: 640,
    alt: msg("A woven basket full of avocados, asparagus, peppers and tomatoes."),
    credit: { author: "Leonie Wise", license: "CC0", source: commons("Healthy_Grocery_Shopping_(Unsplash).jpg") },
    ages: "none",
  },
  movement: {
    src: "/imagery/movement.webp",
    width: 960,
    height: 641,
    alt: msg("A woman holds a strong plank on a pink yoga mat at home."),
    credit: { author: "Shixart1985", license: "CC BY 2.0", source: commons("Fitness_enthusiast_performs_plank_exercise_at_home_on_yoga_mat.jpg") },
    ages: "30s",
    focus: "60% 50%",
  },
  sleep: {
    src: "/imagery/sleep.webp",
    width: 800,
    height: 1000,
    alt: msg("Soft pillows on a neatly made bed, with daylight through sheer curtains."),
    credit: { author: "Shixart1985", license: "CC BY 2.0", source: commons("Cozy_modern_bedroom_with_plush_pillows_and_elegant_drapes_in_bright_daylight.jpg") },
    ages: "none",
    focus: "50% 60%",
  },
  brain: {
    src: "/imagery/brain.webp",
    width: 960,
    height: 639,
    alt: msg("A grey-bearded man in a plaid shirt plays an acoustic guitar at home."),
    credit: { author: "Shixart1985", license: "CC BY 2.0", source: commons("Older_man_plays_acoustic_guitar_while_sitting_in_a_chair.jpg") },
    ages: "60s",
    focus: "50% 30%",
  },
  "brain-reading": {
    src: "/imagery/brain-reading.webp",
    width: 960,
    height: 640,
    alt: msg("A smiling man in a cream sweater reads a book outdoors."),
    credit: { author: "Tamarcus Brown", license: "CC0", source: commons("Reading_in_Atlanta_(Unsplash).jpg") },
    ages: "30s",
    focus: "55% 40%",
  },
  heart: {
    src: "/imagery/heart.webp",
    width: 960,
    height: 648,
    alt: msg("A family enjoys an accessible forest trail together, one of them in a wheelchair."),
    credit: { author: "U.S. Forest Service, Pacific Northwest Region", license: "Public domain", source: commons("Latino_Family_using_Accessible_Trail_at_Lost_Lake-Mt_Hood_(26364107981).jpg") },
    ages: "mixed",
    focus: "55% 55%",
  },
  longevity: {
    src: "/imagery/longevity.webp",
    width: 960,
    height: 472,
    alt: msg("People practise tai chi together under palm trees in a city park."),
    credit: { author: "Anna Frodesiak", license: "CC0", source: commons("Haikou_People%27s_Park_-_people_practicing_t%27ai_chi_ch%27uan_(tai_chi)_-_01.jpg") },
    ages: "mixed",
  },
} satisfies Record<string, Photo>;

export type PhotoId = keyof typeof PHOTOS;

export function photo(id: PhotoId): Photo {
  return PHOTOS[id];
}

/** CC0 and public-domain photos need no credit, but LifeZoi still shows one when there is room. */
export function needsAttribution(license: License): boolean {
  return license !== "CC0" && license !== "Public domain";
}

/* ---------- Wellness topics ---------- */

export type TopicId = "energy" | "nutrition" | "movement" | "sleep" | "brain" | "heart" | "longevity";

export type Topic = {
  id: TopicId;
  title: string;
  text: string;
  href: string;
  photo: PhotoId;
};

/** Seven everyday areas, each with its own photo. The links go to pages that already exist. */
export const TOPICS: readonly Topic[] = [
  { id: "energy", title: msg("Energy & wellness"), text: msg("Small daily routines that help you feel like yourself."), href: "/my-day", photo: "energy" },
  { id: "nutrition", title: msg("Nutrition"), text: msg("Colorful plates, simple cooking, food you enjoy."), href: "/food-plan", photo: "nutrition-topic" },
  { id: "movement", title: msg("Fitness & movement"), text: msg("Walking, stretching, dancing and strength, at your pace."), href: "/academy/move", photo: "movement" },
  { id: "sleep", title: msg("Sleep & relaxation"), text: msg("Calm evenings, slow breathing, a restful room."), href: "/breathe", photo: "sleep" },
  { id: "brain", title: msg("Brain health"), text: msg("Music, reading, puzzles and learning something new."), href: "/brain-quiz", photo: "brain-reading" },
  { id: "heart", title: msg("Heart health"), text: msg("Time outdoors and everyday activity with people you like."), href: "/nature", photo: "heart" },
  { id: "longevity", title: msg("Longevity"), text: msg("Friends, hobbies, travel and the things that make life full."), href: "/life-matters", photo: "longevity" },
];

/**
 * Images for the LifeZoi Daily section. The Daily page can render these with
 * `<LzPhoto id={DAILY_PHOTOS.morning} />` without touching the registry.
 */
export const DAILY_PHOTOS = {
  morning: "daily-morning",
  calm: "daily-calm",
  music: "brain",
} as const satisfies Record<string, PhotoId>;
