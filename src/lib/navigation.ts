/**
 * Site navigation.
 *
 * The header shows nine main sections in a fixed order. Each section groups the pages
 * that already exist, so no page is removed or renamed; the section row under the header
 * lists the pages of the section you are in. The footer still lists every page.
 */
export type NavLink = { href: string; label: string };

export type SectionKey =
  | "home"
  | "dashboard"
  | "myHealth"
  | "food"
  | "movement"
  | "library"
  | "brain"
  | "progress"
  | "profile";

export type NavSection = {
  key: SectionKey;
  /** Where the main menu item goes. */
  href: string;
  /** English label; translations live in `messages.sections`. */
  label: string;
  /** Existing pages that belong to this section, the section's own page first. */
  pages: readonly NavLink[];
  /** Other path prefixes that count as being inside this section. */
  also?: readonly string[];
};

export const NAV_SECTIONS: readonly NavSection[] = [
  { key: "home", href: "/", label: "Home", pages: [] },
  {
    key: "dashboard",
    href: "/dashboard",
    label: "Dashboard",
    pages: [
      { href: "/dashboard", label: "Dashboard" },
      { href: "/my-day", label: "My Day" },
      { href: "/plan", label: "My Plan" },
      { href: "/choices", label: "Daily choices" },
    ],
    also: ["/welcome"],
  },
  {
    key: "myHealth",
    href: "/my-health",
    label: "My Health",
    pages: [
      { href: "/my-health", label: "My Health" },
      { href: "/assessment", label: "Lifestyle assessment" },
      { href: "/outlook", label: "Life outlook" },
      { href: "/what-if", label: "WHAT IF?" },
      { href: "/lab-results", label: "Understand My Lab Results" },
      { href: "/change-lab", label: "Change Lab" },
      { href: "/ai-assistant", label: "Wellness Assistant" },
      { href: "/life-matters", label: "Your Life Matters" },
    ],
  },
  {
    key: "food",
    href: "/food-plan",
    label: "Food & Wellness",
    pages: [
      { href: "/food-plan", label: "Food & Wellness" },
      { href: "/food-plan/today", label: "Today's meals" },
      { href: "/academy/meals", label: "Nutrition" },
      { href: "/sugar-detective", label: "Sugar Detective" },
      { href: "/food-labels", label: "Food Intelligence" },
    ],
  },
  {
    key: "movement",
    href: "/academy/move",
    label: "Movement",
    pages: [
      { href: "/academy/move", label: "Movement" },
      { href: "/academy/move/studio/daily-movement", label: "Daily Movement" },
      { href: "/academy/move/studio/chair-yoga", label: "Chair Yoga Studio" },
      { href: "/academy/move/breaks", label: "Movement breaks" },
      { href: "/academy/move/resources", label: "Free exercise resources" },
      { href: "/balance-challenge", label: "Balance and Brain Challenge" },
    ],
  },
  {
    key: "library",
    href: "/academy/move/library",
    label: "Wellness Library",
    pages: [
      { href: "/academy/move/library", label: "Wellness Library" },
      { href: "/breathe", label: "Breathe for Life" },
      { href: "/library/music", label: "My Music" },
      { href: "/library", label: "Health Library" },
      { href: "/library/books", label: "Books and listening" },
      { href: "/nature", label: "Nature" },
      { href: "/academy", label: "Academy" },
    ],
  },
  {
    key: "brain",
    href: "/brain-quiz",
    label: "Brain & Mind",
    pages: [
      { href: "/brain-quiz", label: "Brain & Habit Quiz" },
      { href: "/brain-quiz/games", label: "Brain games" },
      { href: "/focus", label: "Focus & Brain Training" },
      { href: "/emotional-wellness", label: "Emotional Wellness" },
      { href: "/wellness-coach", label: "Wellness coach" },
      { href: "/urges", label: "Urges" },
    ],
  },
  {
    key: "progress",
    href: "/progress",
    label: "Progress",
    pages: [
      { href: "/progress", label: "Progress" },
      { href: "/progress/weekly", label: "Weekly check-in" },
      { href: "/habit-transformation", label: "Habit Transformation" },
      { href: "/habits", label: "Challenges" },
    ],
  },
  {
    key: "profile",
    href: "/profile",
    label: "My Profile",
    pages: [
      { href: "/profile", label: "Profile" },
      { href: "/settings", label: "Settings" },
      { href: "/share-the-care", label: "Share the Care" },
      { href: "/community", label: "Community" },
      { href: "/privacy", label: "Privacy" },
    ],
    also: ["/sign-in", "/reset-password"],
  },
];

/** On phones these stay on screen next to the Menu button. */
export const PHONE_QUICK_SECTIONS: readonly SectionKey[] = ["home", "dashboard", "movement"];

/** True when `pathname` is the link's page or a page inside it. Home matches only itself. */
export function isCurrentLink(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * The section a page belongs to: the section whose page (or extra prefix) is the longest
 * match, so `/academy/move/library` is the Wellness Library, not Movement.
 */
export function sectionFor(pathname: string): NavSection | null {
  let best: NavSection | null = null;
  let bestLength = -1;
  for (const section of NAV_SECTIONS) {
    const prefixes = [section.href, ...section.pages.map((page) => page.href), ...(section.also ?? [])];
    for (const prefix of prefixes) {
      if (isCurrentLink(pathname, prefix) && prefix.length > bestLength) {
        best = section;
        bestLength = prefix.length;
      }
    }
  }
  return best;
}

/** The one page link in a section row that matches the current page best. */
export function currentPageIn(section: NavSection, pathname: string): string | null {
  let best: string | null = null;
  for (const page of section.pages) {
    if (isCurrentLink(pathname, page.href) && (best === null || page.href.length > best.length)) best = page.href;
  }
  return best;
}

/** Every other page, listed in the footer so nothing becomes unreachable without a menu. */
export const FOOTER_LINKS: readonly NavLink[] = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/my-health", label: "My Health" },
  { href: "/assessment", label: "Lifestyle assessment" },
  { href: "/outlook", label: "Life outlook" },
  { href: "/what-if", label: "WHAT IF?" },
  { href: "/my-day", label: "My Day" },
  { href: "/plan", label: "My Plan" },
  { href: "/progress", label: "Progress" },
  { href: "/food-plan", label: "Food & Wellness" },
  { href: "/academy/meals", label: "Nutrition" },
  { href: "/academy/move", label: "Movement" },
  { href: "/library", label: "Health Library" },
  { href: "/nature", label: "Nature" },
  { href: "/habit-transformation", label: "Habit Transformation" },
  { href: "/academy/move/library", label: "Wellness Library" },
  { href: "/breathe", label: "Breathe for Life" },
  { href: "/academy/move/breaks", label: "Movement breaks" },
  { href: "/academy/move/studio/daily-movement", label: "Daily Movement" },
  { href: "/academy/move/studio/chair-yoga", label: "Chair Yoga Studio" },
  { href: "/library/music", label: "My Music" },
  { href: "/library/books", label: "Books and listening" },
  { href: "/brain-quiz/games", label: "Brain games" },
  { href: "/progress/weekly", label: "Weekly check-in" },
  { href: "/food-plan/today", label: "Today's meals" },
  { href: "/profile", label: "Profile" },
  { href: "/life-matters", label: "Your Life Matters" },
  { href: "/wellness-coach", label: "Wellness coach" },
  { href: "/academy", label: "Academy" },
  { href: "/academy/move/resources", label: "Free exercise resources" },
  { href: "/choices", label: "Daily choices" },
  { href: "/urges", label: "Urges" },
  { href: "/habits", label: "Challenges" },
  { href: "/ai-assistant", label: "Wellness Assistant" },
  { href: "/community", label: "Community" },
  { href: "/emotional-wellness", label: "Emotional Wellness" },
  { href: "/share-the-care", label: "Share the Care" },
  { href: "/change-lab", label: "Change Lab" },
  { href: "/lab-results", label: "Understand My Lab Results" },
  { href: "/sugar-detective", label: "Sugar Detective" },
  { href: "/food-labels", label: "Food Intelligence" },
  { href: "/balance-challenge", label: "Balance and Brain Challenge" },
  { href: "/brain-quiz", label: "Brain & Habit Quiz" },
  { href: "/focus", label: "Focus & Brain Training" },
  { href: "/settings", label: "Settings" },
  { href: "/privacy", label: "Privacy" },
];
