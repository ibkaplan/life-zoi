import type { ContextId } from "@/lib/emotional-wellness/types";
import { msg } from "@/lib/i18n/translate";

export const EMOTIONAL_ROUTE = "/emotional-wellness";

export const PAGE_TITLE = "Emotional Wellness";

export const FEATURE_NAME = "LifeZoi Emotional Companion";

export const HEADLINE = "You don't have to go through this alone.";

export const SUPPORTING_LINE =
  "You deserve to be heard, supported, and treated with kindness. Whatever you are facing, we can take one small step at a time.";

export const CLINICAL_REVIEW_NOTICE =
  "This page has not been reviewed by a licensed clinician. It must not be called clinically validated.";

export const COMPANION_IDENTITY =
  "LifeZoi Emotional Companion is a rules-based support tool. It is not a person, a therapist, a doctor, or a crisis counselor. It does not love you or need you. It uses written replies, it is not a generative model, and the paid-model seam stays off.";

export const COMPANION_OPENING = `${COMPANION_IDENTITY} Would you like to be listened to, or to look at one small step?`;

export const PAGE_DESCRIPTION =
  "A rules-based emotional support page with a separate crisis check, short optional exercises, and private notes. Not clinical care.";

export const JOURNAL_PRIVACY =
  "Your journal stays in this browser’s local storage. It is not shown to other people, it is not sent to an account by this page, and it is not a diagnosis. Signing out hides it until this same account signs in again.";

export const JOY_NOTE =
  "Small joys are optional. Skip this if naming one feels wrong today. These notes stay in this browser and are not a diagnosis.";

export const CAREGIVER_NOTE =
  "Caregiver notes are private to this browser. They are not a diagnosis of you or of the person you care for, and they are not shown to other people.";

export const EXERCISE_INTRO =
  "These short exercises are optional. Stop at any step. Skipping one is a complete choice. The wording is original and is not a clinical protocol.";

export const CONTEXT_NOTE =
  "Context chips are optional and changeable. Choosing one does not diagnose a condition, and this page will not infer a diagnosis from what you write.";

export const CONTEXT_OPTIONS: { id: ContextId; label: string; phrase: string }[] = [
  { id: "cancer", label: "Cancer", phrase: msg("cancer") },
  { id: "treatment", label: "Treatment", phrase: msg("treatment") },
  { id: "diabetes", label: "Diabetes", phrase: msg("diabetes") },
  { id: "chronic", label: "Chronic condition", phrase: msg("a chronic condition") },
  { id: "pain", label: "Pain", phrase: msg("pain") },
  { id: "recovery", label: "Recovery", phrase: msg("recovery") },
  { id: "caregiver", label: "Caregiver", phrase: msg("caregiving") },
  { id: "loneliness", label: "Loneliness", phrase: msg("loneliness") },
  { id: "general", label: "General", phrase: msg("general") },
];

export function contextPhrase(context: ContextId): string {
  return CONTEXT_OPTIONS.find((item) => item.id === context)?.phrase ?? "general";
}
