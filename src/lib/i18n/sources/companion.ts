/**
 * Data from the "companion" area that pages show through `t(value)`, for example a list of lessons.
 * Every text string found in these values must have a translation in catalog/<locale>/companion.json.
 *
 * Covers My Day, the weekly check-in, Women's Care, the Chair Yoga Studio, Breathe for Life,
 * and movement breaks. Only the parts that are shown are listed: ids, links, and YouTube titles
 * (which stay as published) are left out.
 */
import { A, MOVES, SECTION_INFO as PLAN_SECTIONS, SLOT_INFO, WEEKLY_TARGETS, goalActivity } from "@/lib/companion/day-plan";
import { COMPARE_ROWS, NOT_PROOF } from "@/lib/companion/weekly";
import { SAVE_MODE_TEXT } from "@/lib/companion/store";
import { emptyWomensCare, type CareSymptom } from "@/lib/companion/state";
import {
  careClinician,
  careSymptomLabels,
  careTips,
  cyclePhaseLabels,
  FOCUS,
  lifeStageLabels,
  WOMENS_CARE_MESSAGE,
  WOMENS_CARE_NOT_MEDICAL,
  WOMENS_CARE_PRIVACY,
  WOMENS_CARE_RECIPES,
  WOMENS_CARE_SHARE_CARE,
  WOMENS_CARE_TAKE_CARE,
  WOMENS_CARE_TITLE,
} from "@/lib/companion/womens-care";
import {
  AUDIENCE_TEXT,
  CHAIR_YOGA_TEXT,
  DURATION_BANDS,
  LEVEL_TEXT,
  libraryVideos,
  POSITION_TEXT,
  SECTION_INFO as STUDIO_SECTIONS,
} from "@/lib/wellness-library/chair-yoga";
import {
  AGE_FIGURE_NOTE,
  AGING_INFLAMMATION,
  AGING_NUANCE,
  AGING_STEPS,
  BREATHE_DISCLAIMER,
  BREATHE_SOURCES,
  BREATHE_SUBTITLE,
  BREATHE_TITLE,
  EVIDENCE_LABELS,
  FOOD_TIPS,
  FOODS,
  MEDICAL_CAUTION,
  MEDICINE_NOTE,
  NO_FACTORS,
  NO_INTRO,
  NO_LOW,
  NO_ROLES,
  NOT_A_CURE,
  ORAL_BACTERIA,
  PATHWAYS,
  PROGRAM_LIMITS,
  RECIPES as BREATHE_RECIPES,
  REPORTED_BREATHLESSNESS,
  SAFETY_RULES,
  STOP_SIGNS,
  SUPPLEMENT_NOTE,
  TECHNIQUES,
} from "@/lib/breathe/content";
import { CHALLENGE_WEEKS, compareHabits, generalNewLife, HABIT_LABELS, PACES, PHASE_WORD, STEP_TEXT, WEEKDAY_NAMES } from "@/lib/breathe/program";
import { emptyHabits } from "@/lib/breathe/state";
import { MB, REFERENCES, ROUTINE } from "@/lib/movement-breaks/content";
import { sittingProfile, TRACK_ITEMS } from "@/lib/movement-breaks/personal";

const ALL_SYMPTOMS = Object.keys(careSymptomLabels) as CareSymptom[];
const everyCare = { ...emptyWomensCare(), identifiesAsWoman: true, relevant: true, stage: "perimenopause" as const, symptoms: ALL_SYMPTOMS, ironConcern: true };
const studio = libraryVideos();

/** Text that is shown but built in code rather than kept in a data module. */
const SHOWN_TEXT = [
  // My Day classic labels from lib/my-day/plan.ts
  "Suggested time",
  "Your time",
  // Heading that the improvement plan passes to the Breathe for Life panel
  "My current life, my new life: breathing and circulation",
  // Reasons from recommendToday() in the Chair Yoga Studio
  "You mentioned balance concerns or a walking aid, so today starts seated. A standing class with chair support is offered as the alternative.",
  "Most of your classes this week were seated, so today is a standing class with a chair for support.",
  "You practised standing this week, so today is seated.",
  "Today alternates between seated and standing practice so the week includes time on your feet.",
  "It is chosen from classes made for older adults where possible.",
  "Beginner level, because no higher level is saved in your preferences.",
  // Keys that the collector skips because the field is named `key`
  MB.water.key,
  MB.why.key,
  MB.calves.key,
];

const sources: unknown[] = [
  // My Day and the improvement plan
  Object.values(PLAN_SECTIONS).map(({ title, intro }) => ({ title, intro })),
  Object.values(SLOT_INFO).map(({ label }) => label),
  Object.values(A).map(({ title, instructions, view }) => ({ title, instructions, label: "label" in view ? view.label : "" })),
  MOVES.map(({ title, instructions }) => ({ title, instructions })),
  goalActivity({ id: "x", text: "zzz", createdOn: "", updatedOn: "", archivedOn: "" }).instructions,
  Object.values(WEEKLY_TARGETS),
  COMPARE_ROWS.map(({ label }) => label),
  NOT_PROOF,
  Object.values(SAVE_MODE_TEXT),
  // Women's Care
  [WOMENS_CARE_TITLE, WOMENS_CARE_MESSAGE, WOMENS_CARE_TAKE_CARE, WOMENS_CARE_SHARE_CARE, WOMENS_CARE_PRIVACY, WOMENS_CARE_NOT_MEDICAL],
  Object.values(lifeStageLabels),
  Object.values(cyclePhaseLabels),
  Object.values(careSymptomLabels),
  Object.values(FOCUS).map(({ label, why, examples }) => ({ label, why, examples: examples.map((item) => item.name) })),
  careTips(everyCare),
  careTips({ ...everyCare, stage: "cycle" }),
  careClinician(everyCare).lines,
  WOMENS_CARE_RECIPES.map(({ name, summary, steps, ingredients }) => ({
    name,
    summary,
    steps,
    ingredients: ingredients.map((item) => [item.name, item.swap?.name ?? ""]),
  })),
  // Chair Yoga Studio (YouTube titles and channel names stay as published)
  Object.values(CHAIR_YOGA_TEXT),
  Object.values(STUDIO_SECTIONS).map(({ title, summary, includes }) => ({ title, summary, includes })),
  Object.values(POSITION_TEXT),
  Object.values(AUDIENCE_TEXT),
  Object.values(LEVEL_TEXT),
  DURATION_BANDS.map(({ label }) => label),
  studio.map((video) => video.description),
  [...new Set(studio.flatMap((video) => video.studio.topics))],
  // Breathe for Life (study titles and journals stay as published)
  [BREATHE_TITLE, BREATHE_SUBTITLE, BREATHE_DISCLAIMER, NOT_A_CURE, AGING_INFLAMMATION, AGING_NUANCE, STOP_SIGNS, MEDICAL_CAUTION, PROGRAM_LIMITS, REPORTED_BREATHLESSNESS],
  [SUPPLEMENT_NOTE, MEDICINE_NOTE],
  Object.values(EVIDENCE_LABELS),
  BREATHE_SOURCES.map(({ supports }) => supports),
  AGE_FIGURE_NOTE,
  NO_INTRO,
  NO_ROLES.map(({ title, text }) => ({ title, text })),
  NO_LOW,
  NO_FACTORS,
  PATHWAYS.map(({ title, steps, text }) => ({ title, steps, text })),
  AGING_STEPS,
  TECHNIQUES.map(({ title, subtitle, steps, science }) => ({ title, subtitle, steps, science: science.map(({ text }) => text) })),
  SAFETY_RULES,
  FOODS.map(({ name, tip }) => ({ name, tip })),
  FOOD_TIPS,
  { title: ORAL_BACTERIA.title, text: ORAL_BACTERIA.text, mouthwash: ORAL_BACTERIA.mouthwash },
  BREATHE_RECIPES.map(({ title, ingredients, steps }) => ({ title, ingredients, steps })),
  Object.values(PACES).map(({ label }) => label),
  Object.values(STEP_TEXT),
  Object.values(PHASE_WORD),
  [...WEEKDAY_NAMES],
  CHALLENGE_WEEKS.map(({ title, goal }) => ({ title, goal })),
  generalNewLife().map(({ current, next, why }) => ({ current, next, why })),
  Object.values(HABIT_LABELS).map((labels) => Object.values(labels)),
  compareHabits(emptyHabits(), null).map(({ label, before }) => ({ label, before })),
  // Movement breaks (study titles stay as published)
  MB,
  REFERENCES.map(({ publisher, usedFor }) => ({ publisher, usedFor })),
  ROUTINE.map(({ title, standing, seated }) => ({ title, standing, seated })),
  TRACK_ITEMS.map(({ label, hint }) => ({ label, hint })),
  sittingProfile(null).next.map(({ text, why }) => ({ text, why })),
  SHOWN_TEXT,
];
export default sources;
