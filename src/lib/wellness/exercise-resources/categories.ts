import { FALL_RISK, safetyNote, type ResourceTier } from "@/lib/wellness/exercise-resources/copy";
import type { ExternalLinkId } from "@/lib/wellness/exercise-resources/links";

export type ExerciseCategory = {
  slug: string;
  title: string;
  intro: string;
  steps: string[];
  safety: string;
  linkIds: ExternalLinkId[];
  tier: ResourceTier;
};

const free = "free" as const;

export const categories: ExerciseCategory[] = [
  {
    slug: "chair-exercises",
    title: "Chair Exercises for Seniors",
    intro: "A stable chair is enough for a short bout of movement. These steps were written for lifeZoi. They are not a copied class.",
    steps: [
      "Choose a sturdy chair that does not roll. Sit with both feet on the floor.",
      "March in place while seated for about one minute.",
      "Roll the shoulders slowly 8 times.",
      "Raise one arm only as high as is comfortable, then the other, 6 times each if that feels all right.",
      "Rest. Repeat a smaller version only if you want to.",
    ],
    safety: safetyNote("Stay seated unless a later step says a supported stand is optional, and skip that stand if you feel unsteady."),
    linkIds: ["nia-toolkit", "medlineplus-older", "nutrition-gov-videos", "cdc-older"],
    tier: free,
  },
  {
    slug: "chair-yoga",
    title: "Chair Yoga",
    intro: "This is a simple seated movement idea, not a yoga class and not a copied pose sequence. An outside app is optional.",
    steps: [
      "Sit on a sturdy chair with both feet on the floor.",
      "Rest the hands on the thighs and take 4 ordinary breaths.",
      "Circle the shoulders backward 6 times.",
      "Reach one hand upward only as high as is comfortable, then switch hands. Do 3 on each side.",
      "Hold the chair and turn the chest a small amount, 2 times each side.",
      "Circle each ankle 6 times, then rest for 4 breaths.",
    ],
    safety: safetyNote(
      "Chair Yoga Fit is an optional outside app. A free download is not the same as fully free functionality. Check the app for optional paid features. lifeZoi does not depend on that app, and this page works without it.",
    ),
    linkIds: ["nccih-yoga", "chair-yoga-fit", "nia-toolkit"],
    tier: free,
  },
  {
    slug: "gentle-stretching",
    title: "Gentle Stretching",
    intro: "Move only until you feel a mild pull. Do not bounce, and do not try to copy a video stretch you have not checked for yourself.",
    steps: [
      "Sit tall in a stable chair.",
      "Turn the head a short way, 3 times each side. Do not tip the head far back.",
      "Roll the shoulders 6 times.",
      "Reach one arm forward for 3 easy breaths, then switch.",
      "Circle the ankles 8 times each.",
    ],
    safety: safetyNote("A longer or painful reach is not better. Skip any joint that is sore."),
    linkIds: ["nia-flexibility-video", "nia-flex6-video", "nia-shoulder-video"],
    tier: free,
  },
  {
    slug: "balance-and-stability",
    title: "Balance and Stability",
    intro: "Practice balance beside a stable chair. lifeZoi's beginner routine keeps a hand on that chair and includes a seated version.",
    steps: [
      "Put a sturdy chair next to you before you stand.",
      "Hold the chair for heel raises, side steps, and weight shifts.",
      "If you try heel-to-toe steps, keep holding the chair.",
      "If standing feels unsteady, stay seated and march the feet instead.",
    ],
    safety: safetyNote(FALL_RISK),
    linkIds: ["cdc-older", "nia-balance-video", "nia-heel-video", "liveup"],
    tier: free,
  },
  {
    slug: "strength-for-beginners",
    title: "Strength for Beginners",
    intro: "Start with seated arm and leg movements. Add a wall or a chair only when standing already feels steady.",
    steps: [
      "Do seated arm raises and seated knee extensions first.",
      "Try a small wall push-up only if standing at a wall feels steady.",
      "Hold a chair for calf raises.",
      "Use sit-to-stand only when it feels safe, with your hands on the chair or a counter.",
    ],
    safety: safetyNote("Skip sit-to-stand if you are unsure. These ideas are not a personal strength prescription."),
    linkIds: ["nia-strength-video", "nia-wall-pushup-video", "cdc-older", "liveup"],
    tier: free,
  },
  {
    slug: "walking-and-daily-movement",
    title: "Walking and Daily Movement",
    intro: "A short walk on a route you already know can be the day's movement. The walking sheet in the guides is a blank note, not a step target.",
    steps: [
      "Pick a familiar path, hallway, or room.",
      "Use a cane, a walker, or a companion if that is how you usually walk.",
      "Walk for a length of time you choose, then rest.",
      "Write the minutes only if you want a record. lifeZoi does not set a step goal.",
    ],
    safety: safetyNote("Stop if you feel unwell, chest discomfort, or strong shortness of breath, and get local urgent help for urgent symptoms."),
    linkIds: ["nia-outdoor", "cdc-older", "medlineplus-how-much", "nia-tips"],
    tier: free,
  },
  {
    slug: "hand-and-finger",
    title: "Hand and Finger Exercises",
    intro: "Hands can move while you sit. Keep the range easy and skip any finger that objects.",
    steps: [
      "Open the hand and make a soft fist, 8 times if that feels all right.",
      "Spread the fingers and bring them together, 6 times.",
      "Touch the thumb to each fingertip.",
      "Circle the wrists slowly, then rest the hands.",
    ],
    safety: safetyNote("Stop for pain, swelling, or numbness. This is not treatment for a hand or wrist condition."),
    linkIds: ["nia-hand-grip-video", "medlineplus-older"],
    tier: free,
  },
  {
    slug: "feet-and-ankle",
    title: "Feet and Ankle Mobility",
    intro: "Most of this practice stays in the chair. Standing is optional and uses a chair for support.",
    steps: [
      "Circle each ankle while seated.",
      "Lift the toes, then the heels, while the rest of the foot stays down.",
      "Point and flex each foot through an easy range.",
      "Hold a stable chair for a few heel raises only if you feel steady. Otherwise stay seated.",
    ],
    safety: safetyNote("Skip standing if balance is uncertain. Stop for sharp foot or ankle pain."),
    linkIds: ["nia-ankle-video", "nia-three-types", "cdc-older"],
    tier: free,
  },
  {
    slug: "neck-and-shoulder",
    title: "Neck and Shoulder Mobility",
    intro: "Small neck and shoulder movements can be done in a chair. Keep the head upright.",
    steps: [
      "Turn the head a short way, 3 times each side.",
      "Do not tip the head far back.",
      "Roll the shoulders 6 times.",
      "Reach one arm up only as far as is comfortable, then switch.",
    ],
    safety: safetyNote("Stop for pain, dizziness, or numbness. Do not use these moves as care for a neck injury."),
    linkIds: ["nia-shoulder-video", "nia-flexibility-video"],
    tier: free,
  },
  {
    slug: "breathing-and-relaxation",
    title: "Breathing and Relaxation",
    intro: "An ordinary breath, taken while you are supported, is enough. This is not a breathing treatment.",
    steps: [
      "Sit in a supported chair.",
      "Breathe in and out in a way that feels ordinary.",
      "Do that for 4 breaths, then rest.",
      "Stop if breathing feels difficult.",
    ],
    safety: safetyNote(
      "Trouble breathing needs urgent care, not this page. This is not treatment for anxiety or a lung condition. NIMH describes relaxation as one way people cope. lifeZoi does not copy that fact sheet.",
    ),
    linkIds: ["nimh-stress", "nia-tips", "medlineplus-older"],
    tier: free,
  },
  {
    slug: "tai-chi-and-gentle-movement",
    title: "Tai Chi and Gentle Movement",
    intro: "lifeZoi does not teach a tai chi form. The movement below is a slow weight shift with support. Public information about tai chi is on the NCCIH page.",
    steps: [
      "Stand beside a stable chair and keep one hand on it. If that is not safe, stay seated.",
      "Shift your weight slowly from one foot to the other, 6 times, with both feet on the floor.",
      "Or, seated, move both arms in a slow small circle, 4 times.",
      "Read the NCCIH page if you want their summary of tai chi. That page is theirs.",
    ],
    safety: safetyNote(`${FALL_RISK} This page is not a tai chi course and it does not promise a result.`),
    linkIds: ["nccih-tai-chi", "cdc-older", "nia-three-types"],
    tier: free,
  },
  {
    slug: "morning-movement",
    title: "Morning Movement",
    intro: "A short seated stretch can be the first movement of the day. You can do it in a chair. Skip any part.",
    steps: [
      "Sit up only when that feels steady.",
      "Move the neck, shoulders, arms, and ankles through a small range.",
      "Turn the chest only a little, while holding the chair.",
      "Finish with a few ordinary breaths.",
    ],
    safety: safetyNote("Do not force a morning stretch. Pain is a reason to stop, not a reason to go further."),
    linkIds: ["nia-flexibility-video", "nia-tips", "medlineplus-older"],
    tier: free,
  },
];

export function categoryBySlug(slug: string): ExerciseCategory | null {
  return categories.find((item) => item.slug === slug) ?? null;
}
