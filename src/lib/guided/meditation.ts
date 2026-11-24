import { msg } from "@/lib/i18n/translate";
import { REST_CARE } from "@/lib/guided/movement";
import { speechSeconds } from "@/lib/guided/timeline";
import type { Cue, DayPart, GuidedSession } from "@/lib/guided/types";

/**
 * Voice-guided meditations: seven themes, each in five lengths. A theme has an
 * opening, a middle, and a closing. Longer sessions add more of the middle and
 * more quiet. `buildMeditation` stretches the quiet holds so the planned length
 * matches the minutes on the card (the tests check every length).
 */

export const MEDITATION_MINUTES = [3, 5, 10, 15, 20] as const;
export type MeditationMinutes = (typeof MEDITATION_MINUTES)[number];

export const MEDITATION_THEMES = ["relaxation", "mindfulness", "morning", "evening", "stress", "breathing", "sleep"] as const;
export type MeditationTheme = (typeof MEDITATION_THEMES)[number];

type Theme = {
  id: MeditationTheme;
  title: string;
  summary: string;
  complete: string;
  parts: DayPart[];
  open: Cue[];
  middle: string[];
  close: Cue[];
};

const c = (say: string, hold = 0): Cue => ({ say, hold });

const WELCOME = msg("Welcome. Find a comfortable position.");
const CLOSE_EYES = msg("Gently close your eyes, or rest your gaze on the floor in front of you.");
const SLOW_BREATH = msg("Take a slow, deep breath in. And let it go.");

/** Gentle returns to the breath, added to longer sessions. */
const EXTRA = [
  msg("If your mind has wandered, that is completely normal. Gently bring your attention back to your breath."),
  msg("Notice the breath coming in, and the breath going out. There is nothing to change."),
  msg("Let any sounds around you come and go, like waves."),
  msg("If a thought appears, notice it kindly, and let it pass, like a cloud."),
  msg("Feel the places where your body is supported, by the chair, the floor, or the bed."),
  msg("Soften your shoulders, your jaw, and your hands once more."),
  msg("Rest in this quiet for a while. I will be here."),
  msg("Each breath out is a chance to let go a little more."),
];

const THEMES: Theme[] = [
  {
    id: "relaxation",
    title: msg("Guided relaxation"),
    summary: msg("Release tension from the body, one area at a time."),
    complete: msg("Take a moment to appreciate yourself. You made time for your well-being today."),
    parts: ["afternoon", "evening"],
    open: [c(WELCOME, 3), c(CLOSE_EYES, 4), c(SLOW_BREATH, 6)],
    middle: [
      msg("Feel your body relaxing. Let it be heavy and supported."),
      msg("Release the tension in your shoulders. Let them drop away from your ears."),
      msg("Soften the muscles of your face. Your forehead, your eyes, your jaw."),
      msg("Let your arms and hands rest, heavy and still."),
      msg("Let your belly be soft. Each breath moves it gently."),
      msg("Let the relaxation spread down through your legs, all the way to your feet."),
      msg("You don't need to do anything right now. Just breathe."),
    ],
    close: [c(msg("Slowly begin to notice the room around you again."), 4), c(msg("Move your fingers and toes a little. When you are ready, gently open your eyes."), 3)],
  },
  {
    id: "mindfulness",
    title: msg("Mindfulness"),
    summary: msg("Rest your attention on the breath, sounds, and the body, just as they are."),
    complete: msg("Wonderful. You gave yourself a few minutes of quiet attention."),
    parts: ["morning", "afternoon"],
    open: [c(WELCOME, 3), c(msg("Sit upright, but not stiff, with your feet on the floor and your hands resting."), 3), c(CLOSE_EYES, 4)],
    middle: [
      msg("Bring your attention to your breath. Notice where you feel it most: the nose, the chest, or the belly."),
      msg("You don't need to breathe in a special way. Just notice each breath as it comes and goes."),
      msg("Now widen your attention to the sounds around you. Near sounds and far sounds. No need to name them."),
      msg("Bring your attention to your body. Notice the weight of your hands, and the contact of your feet with the floor."),
      msg("Notice any sensations, pleasant, unpleasant, or neutral, without trying to change them."),
      msg("If you notice thinking, that's fine. Say to yourself, thinking, and come back to the breath."),
      msg("Allow your thoughts to settle, like sand settling in water."),
    ],
    close: [c(msg("Let your attention widen to the whole room."), 4), c(msg("Take a slightly deeper breath. When you are ready, open your eyes."), 3)],
  },
  {
    id: "morning",
    title: msg("Morning meditation"),
    summary: msg("A calm, bright start: a few breaths, a body check, and an intention for the day."),
    complete: msg("Lovely. You have started your day with calm and care."),
    parts: ["morning"],
    open: [c(msg("Good morning. Find a comfortable seat, and sit tall."), 3), c(CLOSE_EYES, 4), c(SLOW_BREATH, 6)],
    middle: [
      msg("Notice how your body feels this morning, without judging it."),
      msg("Feel the fresh air coming in through your nose, and the warm air going out."),
      msg("With each breath in, imagine you are breathing in energy and light."),
      msg("With each breath out, let go of any heaviness from the night."),
      msg("Think of one thing you are looking forward to today, however small."),
      msg("Now choose one kind intention for your day. For example: today, I will be patient with myself."),
      msg("Say your intention quietly to yourself, and let it rest in your mind."),
    ],
    close: [c(msg("Take one more full breath in, and stretch gently if you like."), 5), c(msg("Open your eyes, and carry this calm with you into your day."), 2)],
  },
  {
    id: "evening",
    title: msg("Evening meditation"),
    summary: msg("Let the day go: a gentle look back, gratitude, and rest."),
    complete: msg("Well done. You gave yourself a peaceful end to the day."),
    parts: ["evening"],
    open: [c(msg("Good evening. Find a comfortable position, sitting or lying down."), 3), c(CLOSE_EYES, 4), c(SLOW_BREATH, 6)],
    middle: [
      msg("Let your breath slow down a little, at its own pace."),
      msg("The day is done. There is nothing more you need to do right now."),
      msg("Gently look back over your day, without judging it. Just notice what happened."),
      msg("Think of one moment from today that you are grateful for. Stay with it for a few breaths."),
      msg("If something from the day still feels heavy, imagine setting it down beside you for the night."),
      msg("Let your shoulders, your face, and your hands soften."),
      msg("Allow yourself to rest. You did enough today."),
    ],
    close: [c(msg("Take a slow breath in, and a long breath out."), 5), c(msg("When you are ready, open your eyes slowly, and move gently into your evening."), 2)],
  },
  {
    id: "stress",
    title: msg("Stress relief"),
    summary: msg("Slow the breath, ground the body, and give stress a little more space."),
    complete: msg("Well done. Taking a pause like this is a real act of care."),
    parts: ["afternoon"],
    open: [c(WELCOME, 3), c(msg("Place your feet flat on the floor, and rest your hands on your thighs."), 3), c(CLOSE_EYES, 4)],
    middle: [
      msg("Breathe in through your nose. And breathe out slowly, a little longer than the breath in."),
      msg("Feel your feet on the floor. Notice how the ground holds you."),
      msg("Notice where you feel stress in your body. Perhaps your shoulders, your jaw, or your stomach."),
      msg("Breathe gently towards that place, and on the breath out, let it soften a little."),
      msg("Remind yourself: this moment is enough. I can take things one step at a time."),
      msg("Name five things you can hear or feel right now, quietly, to yourself."),
      msg("Let each breath out be slow and easy, like a long sigh."),
    ],
    close: [c(msg("Notice that you can come back to this calm whenever you need it."), 4), c(msg("Take one more slow breath. When you are ready, open your eyes."), 3)],
  },
  {
    id: "breathing",
    title: msg("Breathing meditation"),
    summary: msg("Rest your attention on the natural breath, with gentle counting."),
    complete: msg("Well done. Your breath is always here for you."),
    parts: ["morning", "afternoon", "evening"],
    open: [c(WELCOME, 3), c(CLOSE_EYES, 4), c(msg("Let your breathing be natural. You don't need to control it."), 6)],
    middle: [
      msg("Feel the cool air entering your nose, and the warm air leaving."),
      msg("Now count each breath out. One. And the next, two. Up to five, and then start again at one."),
      msg("If you lose count, that is fine. Simply begin again at one."),
      msg("Notice the small pause at the end of each breath out."),
      msg("Feel your belly rise and fall, gently, like waves."),
      msg("Now let go of the counting, and just feel the breath."),
      msg("Each breath is new. Breathe in, and breathe out."),
    ],
    close: [c(msg("Take a slightly deeper breath, and let it go."), 4), c(msg("When you are ready, gently open your eyes."), 3)],
  },
  {
    id: "sleep",
    title: msg("Sleep preparation"),
    summary: msg("Lying down, slow breathing and a body scan to get ready for sleep."),
    complete: msg("Rest well. You don't need to do anything more tonight."),
    parts: ["evening"],
    open: [c(msg("Welcome. Lie down comfortably in bed, and let the bed hold you."), 4), c(msg("Close your eyes. Let the day be finished."), 4), c(SLOW_BREATH, 8)],
    middle: [
      msg("Let your breath become slow and soft. There is nowhere to go."),
      msg("Bring your attention to your feet. Let them be heavy and warm."),
      msg("Let the heaviness move up through your legs, your hips, and your back."),
      msg("Let your belly and chest rise and fall slowly."),
      msg("Let your arms and hands sink into the bed."),
      msg("Let your face relax. Your eyes are heavy, your jaw is loose."),
      msg("If thoughts come, let them drift by. You can think about them tomorrow."),
    ],
    close: [c(msg("Stay here, resting. You can let yourself drift towards sleep."), 6), c(msg("Goodnight."), 2)],
  },
];

/** How many middle lines each length uses. Longer sessions add the gentle returns. */
const MIDDLE_COUNT: Record<MeditationMinutes, number> = { 3: 4, 5: 6, 10: 9, 15: 12, 20: 15 };

/**
 * Quiet after each middle line, in seconds, chosen so the planned length
 * matches `minutes` at the session's speaking speed.
 */
export function middleHold(theme: Pick<Theme, "open" | "close">, lines: readonly string[], minutes: number, rate: number): number {
  const fixed = [...theme.open, ...theme.close].reduce((sum, cue) => sum + speechSeconds(cue.say, rate) + cue.hold, 0);
  const spoken = lines.reduce((sum, line) => sum + speechSeconds(line, rate), 0);
  return Math.max(2, (minutes * 60 - fixed - spoken) / Math.max(1, lines.length));
}

const MEDITATION_RATE = 0.9;
/** The default speaking speed (0.95) times the meditation factor. Holds are fitted at this speed. */
const FIT_RATE = 0.95 * MEDITATION_RATE;

function middleLines(theme: Theme, minutes: MeditationMinutes): string[] {
  const count = MIDDLE_COUNT[minutes];
  const pool = [...theme.middle];
  // Short sessions keep the first lines and the theme's last line, so each still ends where it should.
  if (count <= theme.middle.length) {
    if (count === theme.middle.length) return pool;
    return [...pool.slice(0, count - 1), pool[pool.length - 1] as string];
  }
  const lines = [...pool];
  // Spread the gentle returns between the theme's lines.
  for (let at = 0; lines.length < count; at += 1) {
    const extra = EXTRA[at % EXTRA.length] as string;
    lines.splice(Math.min(lines.length - 1, 2 + at * 2), 0, extra);
  }
  return lines;
}

export function buildMeditation(themeId: MeditationTheme, minutes: MeditationMinutes): GuidedSession {
  const theme = THEMES.find((item) => item.id === themeId) as Theme;
  const lines = middleLines(theme, minutes);
  const hold = Math.round(middleHold(theme, lines, minutes, FIT_RATE));
  return {
    id: `meditation-${theme.id}-${minutes}`,
    kind: "meditation",
    theme: theme.id,
    title: theme.title,
    summary: theme.summary,
    minutes,
    position: theme.id === "sleep" ? msg("Lying down") : msg("Sitting or lying down"),
    care: REST_CARE,
    complete: theme.complete,
    rateFactor: MEDITATION_RATE,
    parts: theme.parts,
    steps: [
      { title: msg("Arrive"), cues: theme.open },
      { title: msg("Meditation"), cues: lines.map((say) => ({ say, hold })) },
      { title: msg("Closing"), cues: theme.close },
    ],
  };
}

export const MEDITATION_THEME_INFO = THEMES.map(({ id, title, summary }) => ({ id, title, summary }));

export const MEDITATION_SESSIONS: GuidedSession[] = THEMES.flatMap((theme) => MEDITATION_MINUTES.map((minutes) => buildMeditation(theme.id, minutes)));
