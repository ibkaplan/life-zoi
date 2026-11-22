import type { TableSex } from "@/lib/types";

/**
 * Page backgrounds ("looks"). Each is a soft, light backdrop behind the white cards; text colours
 * stay the same so contrast does not change. Classic Ivory is the original lifeZoi background.
 */
export const LOOKS = ["ivory", "blue", "rose"] as const;
export type Look = (typeof LOOKS)[number];

/** "auto" follows the sex the person chose in their own saved questionnaire, and nothing else. */
export type LookChoice = Look | "auto";

export const LOOK_CHOICES: readonly LookChoice[] = ["auto", ...LOOKS];

/** The person's own choice, saved in this browser only. */
export const LOOK_STORAGE_KEY = "lifezoi-look";
/** The last look shown, so the page paints the right background before React starts. */
export const LOOK_SHOWN_KEY = "lifezoi-look-shown";

export function parseLookChoice(raw: string | null | undefined): LookChoice {
  return raw === "auto" || (LOOKS as readonly string[]).includes(raw ?? "") ? (raw as LookChoice) : "auto";
}

export function isLook(raw: string | null | undefined): raw is Look {
  return (LOOKS as readonly string[]).includes(raw ?? "");
}

/**
 * The automatic look. Only an answer of female or male in a saved questionnaire changes it.
 * Another answer, a skipped answer, sample data, or no questionnaire keeps Classic Ivory.
 */
export function autoLook(tableSex: TableSex | "" | null | undefined): Look {
  if (tableSex === "male") return "blue";
  if (tableSex === "female") return "rose";
  return "ivory";
}

export function resolveLook(choice: LookChoice, tableSex: TableSex | "" | null | undefined): Look {
  return choice === "auto" ? autoLook(tableSex) : choice;
}

/** Sets `<html data-look>` before the page paints, from the look shown last time. */
export const LOOK_BOOT_SCRIPT = `(function(){try{var s=localStorage.getItem(${JSON.stringify(
  LOOK_SHOWN_KEY,
)});if(${JSON.stringify(LOOKS)}.indexOf(s)>=0)document.documentElement.setAttribute("data-look",s);}catch(e){}})();`;
