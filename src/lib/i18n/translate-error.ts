import { fmt } from "./config";
import type { Messages } from "./messages";

/**
 * Validation in `src/lib/validation.ts` and `src/lib/health-profile.ts` runs on the
 * server too, so it keeps returning English. This maps those known English messages
 * to the chosen language on the client. An unknown message is shown as it is.
 */
export function translateError(message: string | undefined, m: Messages): string | undefined {
  if (!message) return message;
  const e = m.errors;
  const fixed: Record<string, string> = {
    "Choose the option that fits best.": e.chooseOption,
    "Choose at least one focus.": e.chooseFocus,
    "Sample visitor is reserved for the labeled example.": e.sampleReserved,
    "Enter desired weight in kilograms from 30 to 300, or leave it blank.": e.desiredWeight,
  };
  if (fixed[message]) return fixed[message];

  const field = (raw: string) => (e.fields as Record<string, string>)[raw] ?? raw;
  let match = /^Use (\d+) characters or fewer\.$/.exec(message);
  if (match) return fmt(e.maxChars, { limit: match[1] });
  match = /^Enter (.+) from (-?[\d.]+) to (-?[\d.]+)\.$/.exec(message);
  if (match) return fmt(e.range, { field: field(match[1]), min: match[2], max: match[3] });
  match = /^Enter (.+) as a whole number\.$/.exec(message);
  if (match) return fmt(e.whole, { field: field(match[1]) });
  match = /^Enter (.+) as a number\.$/.exec(message);
  if (match) return fmt(e.number, { field: field(match[1]) });
  match = /^Add (.+)\.$/.exec(message);
  if (match) return fmt(e.add, { field: field(match[1]) });
  return message;
}
