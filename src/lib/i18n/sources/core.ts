import * as labels from "@/lib/labels";
import * as health from "@/lib/health-profile";
import { ASSESSMENT_FIELDS } from "@/lib/assessment-fields";

/**
 * Data from the "core" area that pages show through `t(value)`: answer labels and question names.
 * Every text string found in these values must have a translation in catalog/<locale>/core.json.
 */
const sources: unknown[] = [
  Object.entries(labels).filter(([name]) => name.endsWith("Labels")).map(([, value]) => value),
  Object.entries(health).filter(([name]) => name.endsWith("Labels")).map(([, value]) => value),
  Object.values(ASSESSMENT_FIELDS).map(({ label, noun }) => [label, noun]),
];
export default sources;
