import { MIND_AREAS } from "@/lib/mind/areas";
import { compareResults, INSTRUMENTS, PHQ9 } from "@/lib/mind/assessments";
import { EVIDENCE_LABELS } from "@/lib/mind/evidence";
import { MIND_EXERCISES } from "@/lib/mind/exercises";
import { PLAN_DAYS, PLAN_GOALS, PLAN_NOTICE } from "@/lib/mind/plan";
import { EVALUATED_PROVIDERS, NOT_SUITABLE_NOTE, RULES_PROVIDER } from "@/lib/mind/provider";
import { REFLECTIONS } from "@/lib/mind/reflections";
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
  EVALUATED_PROVIDERS.map((provider) => [provider.label, provider.runsWhere, provider.cost, provider.notes]),
  NOT_SUITABLE_NOTE,
  PLAN_GOALS.map((goal) => goal.label),
  PLAN_DAYS.map((day) => [day.theme, day.intro, day.reflection]),
  PLAN_NOTICE,
  // Score band names and reflection titles appear on My progress. The questionnaires themselves are not listed.
  INSTRUMENTS.map((instrument) => instrument.bands.map((band) => band.label)),
  REFLECTIONS.map((reflection) => reflection.title),
  comparisonText(),
  LISTEN_ERRORS.map((error) => listenErrorMessage(error)),
  MIND_AREAS,
];
export default sources;

/** The sentences `compareResults` can show, collected by running it once for each case. */
function comparisonText(): string[] {
  const out: string[] = [];
  const collect = (english: string) => {
    out.push(english);
    return english;
  };
  for (const [earlier, later] of [[5, 5], [5, 6], [20, 2], [2, 20]]) compareResults(PHQ9, earlier, later, collect);
  return out;
}
