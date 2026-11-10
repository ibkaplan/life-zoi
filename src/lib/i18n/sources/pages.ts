import { SYNTHETIC_REPORT } from "@/lib/lab-report";
import { SSA_TABLE_META } from "@/lib/life-table";
import { HEALTH_REFERENCES } from "@/lib/references/library";
import { scenarioCatalogText } from "@/lib/scenarios";
import { FEELINGS, FEELING_SUPPORT, TIRED_EXPLORE, WELLNESS_CATEGORIES, WELLNESS_QUESTIONS } from "@/lib/wellness-assistant/library";

/**
 * Data from the "pages" area that pages show through `t(value)`, for example a list of lessons.
 * Every text string found in these values must have a translation in catalog/<locale>/pages.json.
 * Organization names and the titles of published pages stay as published, so they are not listed.
 */
const sources: unknown[] = [
  scenarioCatalogText(),
  {
    title: SYNTHETIC_REPORT.title,
    person: SYNTHETIC_REPORT.person,
    laboratory: SYNTHETIC_REPORT.laboratory,
    notice: SYNTHETIC_REPORT.notice,
    results: SYNTHETIC_REPORT.results.map(({ name, unit, measures, whyItMatters, questions }) => ({
      name,
      unit,
      measures,
      whyItMatters,
      questions,
    })),
  },
  HEALTH_REFERENCES.map(({ explanation }) => explanation),
  {
    name: SSA_TABLE_META.name,
    report: SSA_TABLE_META.report,
    population: SSA_TABLE_META.population,
    assumptions: SSA_TABLE_META.assumptions,
  },
  WELLNESS_CATEGORIES.map(({ label }) => label),
  WELLNESS_QUESTIONS.map(({ question, answer, links }) => ({ question, answer, links: links.map(({ label }) => label) })),
  FEELINGS.map(({ label, note, prompts }) => ({ label, note, prompts: prompts?.map((prompt) => prompt.label) })),
  [FEELING_SUPPORT, TIRED_EXPLORE],
];
export default sources;
