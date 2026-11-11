/**
 * Healthy break activities for Focus & Brain Training. Each one is gentle,
 * can be done seated, and stops at any discomfort. The text is English and
 * is shown through `t()`; the "focus" catalog area holds the translations.
 */
export type BreakKind = "short" | "long";

export type BreakActivity = {
  id: string;
  icon: string;
  kind: BreakKind;
  title: string;
  /** One line under the title. */
  summary: string;
  steps: string[];
  /** A LifeZoi page with more of the same, if there is one. */
  href?: string;
  linkLabel?: string;
};

export const SHORT_BREAKS: readonly BreakActivity[] = [
  {
    id: "hands",
    icon: "🖐️",
    kind: "short",
    title: "Finger and hand exercises",
    summary: "Wake up your hands after typing or writing.",
    steps: [
      "Open both hands wide and spread your fingers. Hold for three slow breaths.",
      "Make a soft fist, then open again. Repeat five times.",
      "Touch your thumb to each fingertip in turn, then go back the other way.",
      "Gently circle your wrists five times in each direction.",
    ],
  },
  {
    id: "stretch",
    icon: "🙆",
    kind: "short",
    title: "Gentle stretching",
    summary: "Ease your neck, shoulders, and back.",
    steps: [
      "Sit or stand tall and let your shoulders drop away from your ears.",
      "Roll your shoulders slowly backwards five times.",
      "Tilt your ear towards one shoulder, hold for a breath, then change sides.",
      "Lace your fingers and reach your arms forward, rounding your upper back.",
    ],
  },
  {
    id: "chair",
    icon: "🪑",
    kind: "short",
    title: "Chair exercises",
    summary: "Move your legs without leaving your seat.",
    steps: [
      "Sit near the front of a steady chair with your feet flat on the floor.",
      "March your feet in place for thirty seconds.",
      "Straighten one knee, hold for a moment, and lower it. Change legs. Repeat five times.",
      "Lift your heels, then your toes, ten times to help your circulation.",
    ],
    href: "/academy/move/studio/chair-yoga",
    linkLabel: "Open Chair Yoga Studio",
  },
  {
    id: "breathing",
    icon: "🌬️",
    kind: "short",
    title: "Deep breathing",
    summary: "Slow breaths to settle your mind.",
    steps: [
      "Rest one hand on your belly.",
      "Breathe in gently through your nose for a count of four.",
      "Breathe out slowly for a count of six.",
      "Repeat six times. Breathe normally if you feel dizzy.",
    ],
    href: "/breathe/practice",
    linkLabel: "Open Breathe for Life",
  },
  {
    id: "eyes",
    icon: "👀",
    kind: "short",
    title: "Eye relaxation",
    summary: "Give your eyes a rest from the screen.",
    steps: [
      "Look at something far away, such as a window, for twenty seconds.",
      "Blink slowly ten times.",
      "Rub your palms together until they are warm and rest them over your closed eyes.",
      "Look up, down, left, and right slowly, without moving your head.",
    ],
  },
  {
    id: "walk",
    icon: "🚶",
    kind: "short",
    title: "Walking around",
    summary: "A few minutes on your feet.",
    steps: [
      "Stand up slowly and wait a moment before walking.",
      "Walk around your room or down the hall at an easy pace.",
      "Swing your arms gently as you go.",
      "If walking is hard today, march in place while holding a steady surface.",
    ],
    href: "/academy/move/breaks",
    linkLabel: "Open Movement breaks",
  },
  {
    id: "water",
    icon: "💧",
    kind: "short",
    title: "Drink a glass of water",
    summary: "A small refresh for body and mind.",
    steps: [
      "Fill a glass with water.",
      "Sip it slowly, away from your screen.",
      "Notice the temperature and how it feels.",
      "If your doctor limits your fluids, follow their advice.",
    ],
  },
  {
    id: "mindful",
    icon: "🌿",
    kind: "short",
    title: "Short mindfulness exercise",
    summary: "Bring your attention to the present moment.",
    steps: [
      "Name five things you can see.",
      "Name four things you can feel, such as your feet on the floor.",
      "Name three things you can hear.",
      "Take one slow breath and smile, if you like.",
    ],
  },
  {
    id: "memory",
    icon: "🧠",
    kind: "short",
    title: "Memory moment",
    summary: "A tiny game for attention and memory.",
    steps: [
      "Look around and choose five objects near you.",
      "Say their names out loud once.",
      "Close your eyes and name all five again.",
      "For a little more challenge, name them in reverse order.",
    ],
    href: "/brain-quiz/daily",
    linkLabel: "Open the daily brain challenge",
  },
];

export const LONG_BREAKS: readonly BreakActivity[] = [
  {
    id: "long-walk",
    icon: "🌳",
    kind: "long",
    title: "A relaxing walk",
    summary: "You finished four focus sessions. Time for a longer rest.",
    steps: [
      "Step outside or walk somewhere with a view, if you can.",
      "Walk at a comfortable pace for ten to fifteen minutes.",
      "Notice the sky, the trees, or the sounds around you.",
      "Drink some water when you come back.",
    ],
    href: "/nature",
    linkLabel: "Open Nature",
  },
  {
    id: "long-relax",
    icon: "🛋️",
    kind: "long",
    title: "Full body relaxation",
    summary: "Let tension go from head to toe.",
    steps: [
      "Sit or lie down comfortably and close your eyes.",
      "Breathe slowly and relax your face and jaw.",
      "Let your shoulders, arms, and hands become heavy.",
      "Relax your back, your legs, and your feet, one by one.",
      "Rest here with soft music or in quiet for a few minutes.",
    ],
    href: "/library/music",
    linkLabel: "Open Relaxing music",
  },
  {
    id: "long-yoga",
    icon: "🧘",
    kind: "long",
    title: "Gentle chair yoga",
    summary: "Slow movement to refresh body and mind.",
    steps: [
      "Sit tall on a steady chair.",
      "Raise your arms as you breathe in and lower them as you breathe out, five times.",
      "Twist gently to each side, holding the back of the chair.",
      "Finish with three slow breaths and your hands resting in your lap.",
    ],
    href: "/academy/move/studio/chair-yoga",
    linkLabel: "Open Chair Yoga Studio",
  },
  {
    id: "long-brain",
    icon: "🧩",
    kind: "long",
    title: "Play a brain game",
    summary: "Something fun and different for your mind.",
    steps: [
      "Choose a puzzle, a word game, or a memory game.",
      "Play just for enjoyment, with no rush.",
      "Stand up and stretch when you finish.",
    ],
    href: "/brain-quiz/games",
    linkLabel: "Open Brain games",
  },
];

export const BREAK_ACTIVITIES: readonly BreakActivity[] = [...SHORT_BREAKS, ...LONG_BREAKS];

/** A different suggestion each break: it moves along with the round and the day, and `shift` moves it on. */
export function suggestBreak(kind: BreakKind, round: number, dayIndex: number, shift = 0): BreakActivity {
  const list = kind === "long" ? LONG_BREAKS : SHORT_BREAKS;
  const at = (((round - 1 + dayIndex * 3 + shift) % list.length) + list.length) % list.length;
  return list[at];
}

/** Friendly words for the focus screen, by phase. Shown through `t()`. */
export const ENCOURAGEMENT = {
  focus: [
    "One task at a time. You are doing well.",
    "Gentle focus. If your mind wanders, simply come back.",
    "Keep going at your own pace.",
  ],
  short: ["Well done. Rest your mind for a few minutes.", "Nice work. Time to move a little."],
  long: ["Wonderful. Four focus sessions are done. Enjoy a longer rest."],
} as const;
