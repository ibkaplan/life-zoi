import { dayPart } from "@/lib/companion-voice/commands";
import { msg, type Translate } from "@/lib/i18n/translate";

/**
 * The companion's spoken welcome. It depends only on whether the person has saved a
 * questionnaire and the first name they typed there. It never guesses a name.
 */

const HELLO_NAMED = {
  morning: msg("Good morning, {name}!"),
  afternoon: msg("Good afternoon, {name}!"),
  evening: msg("Good evening, {name}!"),
} as const;

const HELLO = {
  morning: msg("Good morning!"),
  afternoon: msg("Good afternoon!"),
  evening: msg("Good evening!"),
} as const;

/** Said to someone whose profile is not filled in yet. */
export const NEW_WELCOME = msg(
  "Welcome to LifeZoi! I'm your personal wellness companion. I'm so happy you're here. Let's get to know you! Please complete your profile so I can create a personalized wellness experience just for you.",
);

/** Returning visitors hear one of these, so the welcome does not sound the same every day. */
export const RETURNING_LINES: readonly string[] = [
  msg("Welcome back to LifeZoi! Your new day is waiting for you. Would you like to explore My Day, listen to music, do some Pilates, or enjoy a relaxing meditation? What would you like to do today?"),
  msg("It's lovely to see you again. Your day is ready. You could open My Day, try a short breathing exercise, or play some calm music. What would you like to do?"),
  msg("Welcome back! I've got your day ready for you. Shall we look at My Day, start some gentle Pilates, or take a quiet moment to meditate?"),
  msg("Nice to have you back in LifeZoi. What are you in the mood for today: your daily plan, some music, gentle movement, or a meditation?"),
];

export type Greeting = { text: string; variant: number; needsProfile: boolean };

/** A first name safe to say aloud: what the person typed, trimmed, never the sample visitor. */
export function spokenName(name: string | null | undefined): string | null {
  const value = (name ?? "").replace(/\s+/g, " ").trim();
  if (!value || value.toLowerCase() === "sample visitor") return null;
  return value.split(" ")[0].slice(0, 40);
}

/** Picks a different welcome line from last time. */
export function nextVariant(previous: number | null, random: number = Math.random()): number {
  const count = RETURNING_LINES.length;
  const pick = Math.floor(Math.max(0, Math.min(0.9999, random)) * count);
  return previous !== null && pick === previous ? (pick + 1) % count : pick;
}

export function greetingFor(options: { hasProfile: boolean; name: string | null; hour: number; variant: number; t: Translate }): Greeting {
  const { t } = options;
  const part = dayPart(options.hour);
  if (!options.hasProfile) return { text: t(NEW_WELCOME), variant: -1, needsProfile: true };
  const name = spokenName(options.name);
  const hello = name ? t(HELLO_NAMED[part], { name }) : t(HELLO[part]);
  const line = RETURNING_LINES[((options.variant % RETURNING_LINES.length) + RETURNING_LINES.length) % RETURNING_LINES.length];
  return { text: `${hello} ${t(line)}`, variant: options.variant, needsProfile: false };
}

/** The reply to "Good morning, LifeZoi". */
export function helloReply(hour: number, t: Translate): string {
  const part = dayPart(hour);
  return `${t(HELLO[part])} ${t(msg("It's wonderful to see you today. How are you feeling?"))}`;
}
