import { BREAK_ACTIVITIES, ENCOURAGEMENT } from "@/lib/focus/activities";

/**
 * Data from the "focus" area (Focus & Brain Training) that pages show through `t(value)`.
 * Every text string found in these values must have a translation in catalog/<locale>/focus.json.
 */
const sources: unknown[] = [BREAK_ACTIVITIES, ENCOURAGEMENT];
export default sources;
