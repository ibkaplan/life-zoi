import { GROWTH_COURSES } from "@/lib/growth-academy/catalog";
import { lessonBodyText } from "@/lib/growth-academy/lesson-text";

/**
 * Training Academy lesson bodies, shown through `t(value)` on the lesson page,
 * My Growth Journey, and the completion summary. Every string must have a
 * translation in catalog/<locale>/growth-<course>-lessons.json. Feedback cue
 * words are checked separately in `academy.test.ts` because they are word
 * lists, not sentences.
 */
const sources: unknown[] = GROWTH_COURSES.map((course) => course.lessons.map(lessonBodyText));
export default sources;
