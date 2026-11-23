import type { ContextId } from "@/lib/emotional-wellness/types";
import { msg } from "@/lib/i18n/translate";

export const EMOTIONAL_ROUTE = "/emotional-wellness";

export const PAGE_TITLE = "Emotional Wellness";

export const FEATURE_NAME = "LifeZoi Emotional Companion";

export const HEADLINE = "You don't have to go through this alone.";

export const SUPPORTING_LINE =
  "You deserve to be heard, supported, and treated with kindness. Whatever you are facing, we can take one small step at a time.";

export const CLINICAL_REVIEW_NOTICE =
  "This page has not yet been reviewed by a licensed clinician, so please treat it as gentle support, not medical care.";

export const COMPANION_IDENTITY =
  "LifeZoi Emotional Companion is a simple support tool with prepared, caring replies. It is not a person, a therapist, a doctor, or a crisis counselor, but it can help you slow down, put feelings into words, and find one small next step.";

export const COMPANION_OPENING = `${COMPANION_IDENTITY} Would you like to be listened to, or to look at one small step?`;

export const PAGE_DESCRIPTION =
  "Gentle emotional support with prepared replies, short optional exercises, and private notes. Crisis help is always on the page. Not medical care.";

export const JOURNAL_PRIVACY =
  "Your journal is saved only in this browser on this device. No one else can see it, and it is not sent to your account. When you sign out, it is hidden until you sign in again.";

export const JOY_NOTE =
  "Noting a small joy is optional. Skip it if today doesn't feel like that kind of day. These notes stay only in this browser.";

export const CAREGIVER_NOTE =
  "Caregiver notes stay only in this browser, and no one else can see them. They are just for you and say nothing about anyone's health.";

export const EXERCISE_INTRO =
  "These short exercises are optional. You can stop at any step, and skipping one is completely fine.";

export const CONTEXT_NOTE =
  "Choosing a topic is optional, and you can change it at any time. It only helps the replies fit your situation. It never means a diagnosis.";

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
