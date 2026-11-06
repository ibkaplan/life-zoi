/**
 * Access flag for exercise resources.
 * Everything shipped today is free. A later premium tier can mark an item
 * `tier: "premium"` and teach `isOffered` to recognize it. Do not add billing,
 * a paywall, or a paid download here. See TIER.md in this folder.
 */
export const RESOURCE_TIERS = ["free", "premium"] as const;
export type ResourceTier = (typeof RESOURCE_TIERS)[number];

export const OFFERED_TIER: ResourceTier = "free";

export function isOffered(tier: ResourceTier): boolean {
  return tier === "free";
}

export const FREE_EXERCISE_TITLE = "FREE EXERCISE RESOURCES";
export const FREE_EXERCISE_MESSAGE =
  "Explore free exercise videos, printable guides, and simple movement routines to help you stay active at home.";
export const BRAND_LINE = "LIVE BETTER. MAKE LIFE MATTER.";
export const LIFEZOI_ORIGIN = "https://life-zoi.vercel.app";
export const LINK_CHECKED = "2026-11-06";

export const ASK_A_PROFESSIONAL =
  "If you have a health condition, a recent surgery, an injury, or major limits on mobility, ask a qualified professional before you try these movements.";

export const NOT_TREATMENT =
  "This is general education. It is not treatment, it is not a diagnosis, it is not physical therapy, and it is not a personal exercise plan.";

export const STOP_IF_UNSAFE =
  "Stop if a movement hurts, makes you dizzy, or feels unsafe. A smaller movement is enough.";

export const FALL_RISK =
  "Do not practice balance without support if you are at risk of falling.";

export function safetyNote(extra?: string): string {
  return [ASK_A_PROFESSIONAL, NOT_TREATMENT, STOP_IF_UNSAFE, extra].filter(Boolean).join(" ");
}

export function guidePublicUrl(slug: string): string {
  return `${LIFEZOI_ORIGIN}/academy/move/resources/guides/${slug}`;
}
