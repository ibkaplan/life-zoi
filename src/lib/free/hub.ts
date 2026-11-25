import { msg } from "@/lib/i18n/translate";

/**
 * Free tools anyone can open without signing in. Every page lives under `/free`,
 * which `src/lib/auth/public-paths.ts` keeps public (PUBLIC_PREFIXES).
 *
 * The hub page at `/free`, the landing page, and the members' My Health menu all
 * read this list, so a new free tool needs one entry here and nothing else.
 * Write `title` and `summary` in English with `msg("…")`; the translations go in
 * the tool's own file in `src/lib/i18n/catalog/<locale>/`.
 */
export type HubGroup = "calculators" | "discover";

export type HubEntry = {
  /** Page address, always under /free. */
  href: `/free/${string}`;
  /** Short name, English, wrapped in msg(). */
  title: string;
  /** One sentence on what the tool does, English, wrapped in msg(). */
  summary: string;
  /** A single emoji shown on the card. */
  icon: string;
  /** Which row of the hub the card sits in. */
  group: HubGroup;
};

export const HUB_GROUPS: readonly { key: HubGroup; title: string }[] = [
  { key: "calculators", title: msg("Health calculators") },
  { key: "discover", title: msg("Try LifeZoi") },
];

export const FREE_HUB: readonly HubEntry[] = [
  {
    href: "/free/calorie-calculator",
    title: msg("Daily calorie calculator"),
    summary: msg("An estimate of the energy your body uses in a day, from a published formula."),
    icon: "🍎",
    group: "calculators",
  },
  {
    href: "/free/water-calculator",
    title: msg("Water intake guide"),
    summary: msg("How much water public guidance suggests for adults, in litres and glasses."),
    icon: "💧",
    group: "calculators",
  },
  {
    href: "/free/sleep-calculator",
    title: msg("Sleep and bedtime calculator"),
    summary: msg("Recommended hours for your age and the bedtime that fits your wake-up time."),
    icon: "🌙",
    group: "calculators",
  },
  {
    href: "/free/blood-pressure",
    title: msg("Blood pressure ranges"),
    summary: msg("See which general range a reading falls in, with the safety notes that go with it."),
    icon: "❤️",
    group: "calculators",
  },
  {
    href: "/free/health-age",
    title: msg("How young are your habits?"),
    summary: msg("A 2-minute check of seven everyday habits, with a result card you can share."),
    icon: "🌱",
    group: "discover",
  },
];

export function hubGroup(group: HubGroup): HubEntry[] {
  return FREE_HUB.filter((entry) => entry.group === group);
}
