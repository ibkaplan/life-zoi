/**
 * Site navigation. The public links are the same on every page, signed in or not.
 * Signed-in people also see the "My space" row.
 */
export type NavLink = { href: string; label: string };

export const PUBLIC_LINKS: readonly NavLink[] = [
  { href: "/", label: "Home" },
  { href: "/outlook", label: "Life outlook" },
  { href: "/what-if", label: "WHAT IF?" },
  { href: "/academy/meals", label: "Nutrition" },
  { href: "/academy/move", label: "Movement" },
];

export const MEMBER_LINKS: readonly NavLink[] = [
  { href: "/my-day", label: "My Day" },
  { href: "/plan", label: "My Plan" },
  { href: "/progress", label: "Progress" },
  { href: "/food-plan", label: "Food & Wellness" },
  { href: "/library", label: "Health Library" },
  { href: "/nature", label: "Nature" },
  { href: "/habit-transformation", label: "Habit Transformation" },
];

/** True when `pathname` is the link's page or a page inside it. Home matches only itself. */
export function isCurrentLink(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Every other page, listed in the footer so nothing becomes unreachable without a menu. */
export const FOOTER_LINKS: readonly NavLink[] = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/assessment", label: "Lifestyle assessment" },
  { href: "/academy/move/library", label: "Wellness Library" },
  { href: "/academy/move/studio/chair-yoga", label: "Chair Yoga Studio" },
  { href: "/library/music", label: "Relaxing music" },
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
  { href: "/settings", label: "Settings" },
  { href: "/privacy", label: "Privacy" },
];
