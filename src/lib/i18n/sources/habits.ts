/**
 * Data from the "habits" area that pages show through `t(value)`, for example a list of lessons.
 * Every text string found in these values must have a translation in catalog/<locale>/habits.json.
 */
import {
  CONFIDENCE,
  DIFFICULT_LINE,
  DURATION,
  EASIER,
  HABIT_IDS,
  HABITS,
  HARD,
  HELPED,
  IN_THE_WAY,
  KICKER,
  LIBRARY,
  LOCAL_NOTE,
  MOTIVATION,
  NOTICE,
  RESTART_LINE,
  SECTIONS,
  SUPPORT,
  TINY,
  TITLE,
  followPrompts,
  triedChoices,
  triggerChoices,
  whenChoices,
} from "@/lib/habit-transformation/catalog";
import { ACHIEVEMENTS } from "@/lib/habit-transformation/engine";
import {
  CAREGIVER_NOTE,
  CLINICAL_REVIEW_NOTICE,
  COMPANION_OPENING,
  CONTEXT_NOTE,
  CONTEXT_OPTIONS,
  EXERCISE_INTRO,
  FEATURE_NAME,
  HEADLINE,
  JOURNAL_PRIVACY,
  JOY_NOTE,
  SUPPORTING_LINE,
} from "@/lib/emotional-wellness/copy";
import { EXERCISES } from "@/lib/emotional-wellness/exercises";
import { ATTRIBUTIONS, REAL_ORGS } from "@/lib/emotional-wellness/resources";
import { BASELINE_FIELDS, EXPERIMENTS } from "@/lib/change-lab";
import {
  BRAND_LINE,
  BRAND_SUPPORT,
  CENTRAL_MESSAGE,
  DIGNITY_NOTE,
  DIRECTION_LINES,
  ENCOURAGEMENT,
  FOUNDATIONS,
  HEALTH_BRIDGE,
  JOURNEY_STEPS,
  KARMA_NOTE,
  LEGACY_QUESTIONS,
  MILESTONE_KINDS,
  PROMISE_BOUNDARY,
  RIPPLE_KINDS,
  SUPPORTING_MESSAGE,
  healthSupports,
} from "@/lib/purpose";
import {
  APPROVED_NOTICE,
  NOT_CONFIGURED_NOTICE,
  PENDING_NOTICE,
  PRIVACY_NOTICE,
  REJECTION_NOTICE,
  RETENTION_SUMMARY,
} from "@/lib/community/notices";
import { RELATIONSHIP_SUGGESTIONS, SHARE_HEADING, SHARE_INTRO, SHARE_TAGLINE } from "@/lib/share-care";

const choices = (list: { label: string; cue?: string }[]) => list.map(({ label, cue }) => ({ label, cue }));

const sources: unknown[] = [
  // Habit Transformation
  [TITLE, KICKER, DIFFICULT_LINE, RESTART_LINE, NOTICE, LOCAL_NOTE],
  SECTIONS.map(({ label }) => label),
  HABITS.map(({ label, short }) => ({ label, short })),
  [DURATION, MOTIVATION, CONFIDENCE, SUPPORT, HARD, EASIER, HELPED, IN_THE_WAY].map(choices),
  HABIT_IDS.map((id) => [choices(whenChoices(id)), choices(triggerChoices(id)), choices(triedChoices(id)), followPrompts(id)]),
  Object.values(TINY),
  LIBRARY.map(({ title, explanation, example, action, barrierPlain }) => ({ title, explanation, example, action, barrierPlain })),
  ACHIEVEMENTS.map(({ title, detail }) => ({ title, detail })),
  // Emotional Wellness. Organization names and published titles stay as published.
  [
    FEATURE_NAME,
    HEADLINE,
    SUPPORTING_LINE,
    CLINICAL_REVIEW_NOTICE,
    COMPANION_OPENING,
    JOURNAL_PRIVACY,
    JOY_NOTE,
    CAREGIVER_NOTE,
    EXERCISE_INTRO,
    CONTEXT_NOTE,
  ],
  CONTEXT_OPTIONS.map(({ label }) => label),
  EXERCISES.map(({ title, summary, steps }) => ({ title, summary, steps })),
  REAL_ORGS.map(({ detail }) => detail),
  ATTRIBUTIONS.map(({ note }) => note),
  // Change Lab
  EXPERIMENTS.map(({ title, summary }) => ({ title, summary })),
  BASELINE_FIELDS.map(({ label, options }) => ({ label, options: options.map((option) => option[1]) })),
  // Your Life Matters. Every health theme is listed by asking for all of them at once.
  [CENTRAL_MESSAGE, SUPPORTING_MESSAGE, BRAND_LINE, BRAND_SUPPORT, PROMISE_BOUNDARY, HEALTH_BRIDGE, DIGNITY_NOTE, KARMA_NOTE, ENCOURAGEMENT],
  DIRECTION_LINES,
  FOUNDATIONS.map(({ title, text }) => ({ title, text })),
  LEGACY_QUESTIONS.map(({ prompt }) => prompt),
  [MILESTONE_KINDS, RIPPLE_KINDS].map((list) => list.map((item) => item[1])),
  JOURNEY_STEPS.map(({ title, text, linkLabel }) => ({ title, text, linkLabel })),
  healthSupports("travel business community nature").map(({ title, why, actions }) => ({ title, why, actions })),
  healthSupports("something else").map(({ title, why, actions }) => ({ title, why, actions })),
  // Community
  [REJECTION_NOTICE, PENDING_NOTICE, NOT_CONFIGURED_NOTICE, APPROVED_NOTICE, PRIVACY_NOTICE, RETENTION_SUMMARY],
  // Share the Care
  [SHARE_HEADING, SHARE_TAGLINE, SHARE_INTRO],
  [...RELATIONSHIP_SUGGESTIONS],
];
export default sources;
