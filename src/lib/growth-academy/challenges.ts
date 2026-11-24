import { daysBetween } from "@/lib/dates";
import { msg } from "@/lib/i18n/translate";

/**
 * Daily Growth Challenge: one small, optional exercise a day, the same for
 * everyone on a given local date. Doing it is recorded on its own and is never
 * needed to complete a lesson or a course.
 */
export type DailyChallenge = { id: string; course: string; text: string };

export const DAILY_CHALLENGES: readonly DailyChallenge[] = [
  { id: "kind-word-self", course: "confidence", text: msg("Say one kind, true thing about yourself, out loud or in writing.") },
  { id: "three-breaths", course: "mindfulness", text: msg("Take three slow, mindful breaths and notice how your body feels.") },
  { id: "listen-fully", course: "communication", text: msg("Listen to someone without interrupting until they have finished.") },
  { id: "name-emotion", course: "emotional-intelligence", text: msg("Name one emotion you felt today and what may have caused it.") },
  { id: "small-step", course: "resilience", text: msg("Take one small step toward a personal goal, even five minutes.") },
  { id: "notice-strength", course: "confidence", text: msg("Notice one moment today when you used a strength.") },
  { id: "mindful-sip", course: "mindfulness", text: msg("Drink a cup of tea, coffee, or water slowly, noticing taste and warmth.") },
  { id: "open-question", course: "communication", text: msg("Ask someone an open question, such as \"What was the best part of your day?\"") },
  { id: "pause-before", course: "emotional-intelligence", text: msg("Before replying to one message today, pause for one slow breath.") },
  { id: "note-progress", course: "resilience", text: msg("Write down one small sign of progress from this week.") },
  { id: "speak-up-once", course: "confidence", text: msg("Share one opinion or idea you might usually keep to yourself.") },
  { id: "mindful-walk", course: "mindfulness", text: msg("Walk for two minutes noticing your feet, the air, and the sounds around you.") },
  { id: "thank-someone", course: "communication", text: msg("Thank someone for something specific they did.") },
  { id: "i-feel", course: "emotional-intelligence", text: msg("Practice one \"I feel… when… because…\" sentence, even just to yourself.") },
  { id: "reframe-mistake", course: "resilience", text: msg("Think of one recent mistake and name one thing it taught you.") },
  { id: "kind-no", course: "confidence", text: msg("Practice a polite \"no, thank you\" in your head for a request you would like to decline.") },
  { id: "three-good-things", course: "mindfulness", text: msg("Write down three things you appreciated today, big or small.") },
  { id: "summarise-back", course: "communication", text: msg("In one conversation, sum up what the other person said before you reply.") },
  { id: "body-check", course: "emotional-intelligence", text: msg("Notice where in your body you feel tension right now, and soften it a little.") },
  { id: "two-minute-start", course: "resilience", text: msg("Start a task you have been putting off, for just two minutes.") },
  { id: "stand-tall", course: "confidence", text: msg("Stand or sit tall for one minute, shoulders relaxed, and notice how it feels.") },
  { id: "one-thing-mindfully", course: "mindfulness", text: msg("Do one ordinary task, such as washing a cup, with your full attention.") },
  { id: "curious-view", course: "communication", text: msg("When someone disagrees with you today, ask one question to understand their view.") },
  { id: "kind-to-self", course: "emotional-intelligence", text: msg("Speak to yourself about a hard moment the way you would speak to a good friend.") },
  { id: "value-reminder", course: "resilience", text: msg("Write one sentence about why a current goal matters to you.") },
  { id: "accept-compliment", course: "confidence", text: msg("If someone compliments you today, simply say \"thank you\".") },
  { id: "sounds-minute", course: "mindfulness", text: msg("Close your eyes for one minute and count the different sounds you hear.") },
  { id: "check-in-friend", course: "communication", text: msg("Send a short, warm message to someone you have not spoken to for a while.") },
  { id: "empathy-guess", course: "emotional-intelligence", text: msg("Think of someone who annoyed you and imagine one reason they acted that way.") },
  { id: "plan-b", course: "resilience", text: msg("For one plan this week, write a simple back-up plan in case it changes.") },
];

/** The challenge for a local date. Neighbouring days always differ. */
export function challengeFor(today: string): DailyChallenge {
  const n = daysBetween("2026-01-01", today) ?? 0;
  const index = ((n % DAILY_CHALLENGES.length) + DAILY_CHALLENGES.length) % DAILY_CHALLENGES.length;
  return DAILY_CHALLENGES[index] as DailyChallenge;
}

export function challengeById(id: string): DailyChallenge | undefined {
  return DAILY_CHALLENGES.find((item) => item.id === id);
}
