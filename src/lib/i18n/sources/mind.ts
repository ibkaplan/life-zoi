import { MIND_AREAS } from "@/lib/mind/areas";
import { EVIDENCE_LABELS } from "@/lib/mind/evidence";
import { MIND_EXERCISES } from "@/lib/mind/exercises";
import { RULES_PROVIDER } from "@/lib/mind/provider";
import { LISTEN_ERRORS, listenErrorMessage } from "@/lib/mind/speech";

/**
 * Data from the "mind" area (LifeZoi Mind) that pages show through `t(value)`.
 * Every text string found in these values must have a translation in catalog/<locale>/mind.json.
 * Source titles stay in their original language, so they are not listed here.
 */
const sources: unknown[] = [
  MIND_EXERCISES.map((exercise) => [exercise.title, exercise.summary, exercise.why, exercise.caution ?? [], exercise.steps.map((step) => step.text), exercise.writing ?? []]),
  Object.values(EVIDENCE_LABELS).map((entry) => [entry.label, entry.meaning]),
  [RULES_PROVIDER.info.label, RULES_PROVIDER.info.notes],
  LISTEN_ERRORS.map((error) => listenErrorMessage(error)),
  MIND_AREAS,
];
export default sources;
