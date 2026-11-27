/**
 * Reading comfort: a larger text size and a calmer, simpler layout, for anyone who finds the
 * pages small or busy (often older members). Both only change how pages look. No content,
 * page, or feature is removed, and text keeps the same colours, so contrast does not drop.
 *
 * The choice is saved in this browser (so the next page paints at the right size before React
 * starts) and, for a signed-in member, in the account's companion_state row, so it follows them
 * to another device.
 */

export const TEXT_SIZES = ["normal", "large", "extra"] as const;
export type TextSize = (typeof TEXT_SIZES)[number];

/** Root font size for each choice. Everything sized in rem grows with it. */
export const TEXT_SCALE: Record<TextSize, string> = {
  normal: "100%",
  large: "112.5%",
  extra: "125%",
};

export type DisplayPrefs = {
  textSize: TextSize;
  calm: boolean;
  /** When the person last changed it (ISO time). Empty means never chosen. */
  updatedAt: string;
};

export const DISPLAY_STORAGE_KEY = "lifezoi-display";

export function defaultDisplay(): DisplayPrefs {
  return { textSize: "normal", calm: false, updatedAt: "" };
}

export function isTextSize(value: unknown): value is TextSize {
  return typeof value === "string" && (TEXT_SIZES as readonly string[]).includes(value);
}

export function sanitizeDisplay(value: unknown): DisplayPrefs {
  const record = value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
  const updatedAt =
    typeof record.updatedAt === "string" && record.updatedAt.length <= 40 && !Number.isNaN(Date.parse(record.updatedAt))
      ? record.updatedAt
      : "";
  return {
    textSize: isTextSize(record.textSize) ? record.textSize : "normal",
    calm: record.calm === true,
    updatedAt,
  };
}

export function parseDisplay(raw: string | null | undefined): DisplayPrefs {
  if (!raw) return defaultDisplay();
  try {
    return sanitizeDisplay(JSON.parse(raw) as unknown);
  } catch {
    return defaultDisplay();
  }
}

/** The copy changed most recently wins. A copy that was never chosen never replaces one that was. */
export function newerDisplay(device: DisplayPrefs, account: DisplayPrefs | null | undefined): DisplayPrefs {
  if (!account || !account.updatedAt) return device;
  if (!device.updatedAt) return account;
  return account.updatedAt > device.updatedAt ? account : device;
}

export function sameDisplay(a: DisplayPrefs, b: DisplayPrefs): boolean {
  return a.textSize === b.textSize && a.calm === b.calm && a.updatedAt === b.updatedAt;
}

/**
 * Sets `<html data-text>` and `<html data-calm>` before the page paints, from this browser's copy.
 * Only known values are written, so a tampered entry cannot inject anything.
 */
export const DISPLAY_BOOT_SCRIPT = `(function(){try{var d=JSON.parse(localStorage.getItem(${JSON.stringify(
  DISPLAY_STORAGE_KEY,
)})||"{}"),e=document.documentElement;if(d&&(d.textSize==="large"||d.textSize==="extra"))e.setAttribute("data-text",d.textSize);if(d&&d.calm===true)e.setAttribute("data-calm","on");}catch(x){}})();`;
