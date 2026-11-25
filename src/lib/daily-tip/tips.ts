import { msg } from "@/lib/i18n/translate";

/**
 * The tip bank for "Daily tip by email or Telegram". Short, general, and
 * qualitative: no numbers about risk, no promises, nothing personal. Each tip
 * is English source text; the catalog test makes sure RU, UK, and EL exist.
 * Adding a tip changes the rotation for everyone, which is fine.
 */
export type TipArea = "movement" | "sleep" | "food" | "water" | "mind" | "people" | "outdoors";

export type DailyTip = { id: string; area: TipArea; text: string };

export const AREA_LABELS: Record<TipArea, string> = {
  movement: msg("Movement"),
  sleep: msg("Sleep"),
  food: msg("Food"),
  water: msg("Water"),
  mind: msg("Mind"),
  people: msg("People"),
  outdoors: msg("Outdoors"),
};

export const TIPS: readonly DailyTip[] = [
  { id: "walk-after-meal", area: "movement", text: msg("After one meal today, take an easy walk, even if it is only around the block or the house.") },
  { id: "stand-and-stretch", area: "movement", text: msg("Every time you finish a task today, stand up, roll your shoulders, and reach your arms up before you sit again.") },
  { id: "stairs", area: "movement", text: msg("If there are stairs where you are, take them once today at a pace that feels comfortable.") },
  { id: "balance-brush", area: "movement", text: msg("While you brush your teeth, hold the edge of the sink and try standing on one foot, then the other.") },
  { id: "music-move", area: "movement", text: msg("Put on one song you like and move to it, sitting or standing, however feels good.") },
  { id: "phone-walk", area: "movement", text: msg("Take your next phone call standing up or walking slowly.") },
  { id: "wind-down", area: "sleep", text: msg("Choose a time tonight to dim the lights and put screens away, and keep it as your wind-down signal.") },
  { id: "same-wake", area: "sleep", text: msg("Try to get up at about the same time tomorrow as today, even if you go to bed a little later.") },
  { id: "cool-dark", area: "sleep", text: msg("Before bed, make your bedroom a little cooler and darker than the rest of the home.") },
  { id: "late-caffeine", area: "sleep", text: msg("Notice when you have your last coffee or tea today, and see whether an earlier one helps your sleep.") },
  { id: "worry-list", area: "sleep", text: msg("If thoughts keep you awake, write them on paper before bed so they can wait until morning.") },
  { id: "half-plate", area: "food", text: msg("At one meal today, fill about half your plate with vegetables or salad.") },
  { id: "fruit-snack", area: "food", text: msg("Keep a piece of fruit where you can see it, and reach for it when you want a snack.") },
  { id: "slow-meal", area: "food", text: msg("Eat one meal today without a screen, and put your fork down between bites.") },
  { id: "label-sugar", area: "food", text: msg("Look at the label of one drink or snack you often buy and check how much sugar it has.") },
  { id: "whole-grain", area: "food", text: msg("Swap one white bread, rice, or pasta today for a whole-grain version.") },
  { id: "beans", area: "food", text: msg("Add beans, lentils, or chickpeas to one dish this week.") },
  { id: "salt-taste", area: "food", text: msg("Taste your food before adding salt, and try herbs, lemon, or pepper instead.") },
  { id: "water-morning", area: "water", text: msg("Start the morning with a glass of water before coffee or tea.") },
  { id: "water-bottle", area: "water", text: msg("Keep a glass or bottle of water within reach while you work or read.") },
  { id: "swap-sweet-drink", area: "water", text: msg("Replace one sweet drink today with water, sparkling water, or unsweetened tea.") },
  { id: "three-breaths", area: "mind", text: msg("Before you open your messages, take three slow breaths, breathing out a little longer than in.") },
  { id: "one-good-thing", area: "mind", text: msg("Tonight, write down one thing that went well today, however small.") },
  { id: "single-task", area: "mind", text: msg("Pick one task and do only that for a while, with notifications off.") },
  { id: "name-feeling", area: "mind", text: msg("When you feel tense today, pause and name the feeling in one word. Naming it often makes it easier to handle.") },
  { id: "kind-voice", area: "mind", text: msg("If you catch yourself being harsh with yourself, ask what you would say to a friend instead.") },
  { id: "new-thing", area: "mind", text: msg("Learn one small new thing today: a word, a recipe, or a fact you look up out of curiosity.") },
  { id: "call-someone", area: "people", text: msg("Call or message someone you have not spoken to in a while, just to say hello.") },
  { id: "thank-you", area: "people", text: msg("Thank someone today for something specific they did.") },
  { id: "shared-meal", area: "people", text: msg("Share a meal or a cup of tea with someone this week, in person or on a call.") },
  { id: "walk-together", area: "people", text: msg("Invite someone to walk with you, even for a short loop.") },
  { id: "morning-light", area: "outdoors", text: msg("Step outside in the morning for a few minutes of daylight.") },
  { id: "look-far", area: "outdoors", text: msg("Every so often today, look out of a window at something far away to rest your eyes.") },
  { id: "green-space", area: "outdoors", text: msg("Spend a few minutes near trees, a park, or plants, and notice what you hear.") },
  { id: "sun-care", area: "outdoors", text: msg("If you will be out in strong sun, bring a hat and sunscreen.") },
];

/** Days since 1970-01-01 for a "YYYY-MM-DD" date, or null. */
export function dayNumber(date: string): number | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (!match) return null;
  const value = Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return Number.isNaN(value) ? null : Math.floor(value / 86_400_000);
}

/**
 * The tip for a calendar day. Everyone gets the same tip on the same local
 * date, and consecutive days never repeat until the bank runs through.
 */
export function tipForDate(date: string): DailyTip {
  const day = dayNumber(date) ?? 0;
  const index = ((day % TIPS.length) + TIPS.length) % TIPS.length;
  return TIPS[index];
}
