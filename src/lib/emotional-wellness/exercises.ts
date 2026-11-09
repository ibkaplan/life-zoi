export type ExerciseId =
  | "calm"
  | "grounding"
  | "name-feeling"
  | "unhook"
  | "kindness"
  | "making-room"
  | "small-step"
  | "one-problem"
  | "sleep"
  | "gratitude";

export type Exercise = {
  id: ExerciseId;
  title: string;
  summary: string;
  steps: string[];
  optional: boolean;
  breath: "none" | "not-required";
};

export const EXERCISES: readonly Exercise[] = [
  {
    id: "calm",
    title: "Calm",
    summary: "A short pause that uses the room around you. You can stop at any step.",
    breath: "not-required",
    optional: false,
    steps: [
      "Let your shoulders drop if that is comfortable. There is nothing you have to force.",
      "Rest your hands on something steady, such as your lap or the arms of a chair.",
      "Look at one ordinary object and name its color and shape to yourself.",
      "When you want to stop, stop. You do not have to feel calm for this to count.",
    ],
  },
  {
    id: "grounding",
    title: "Grounding",
    summary:
      "A non-breath way to notice where you are. This exercise does not ask you to breathe in a special way. If focusing on the breath feels hard, leave it out.",
    breath: "none",
    optional: false,
    steps: [
      "Look around and name five things you can see. This step does not ask you to breathe in a special way.",
      "Press your feet into the floor, or press your hands into the chair, and notice that contact.",
      "Name one sound in the room, then name one thing you can touch.",
      "Stop whenever you want. The breath is not part of this exercise.",
    ],
  },
  {
    id: "name-feeling",
    title: "Name a feeling",
    summary: "Give the moment one word. You do not have to explain it or fix it.",
    breath: "not-required",
    optional: false,
    steps: [
      "Pick one word for what is here, such as sad, angry, afraid, lonely, numb, tired, or a word of your own.",
      "You can say, “A feeling of that word is here.”",
      "If no word fits, “I do not have a word yet” is a complete answer.",
      "Stop whenever you want. Naming a feeling is not a diagnosis.",
    ],
  },
  {
    id: "unhook",
    title: "Unhook",
    summary: "A written way to notice a sticky thought without arguing with it. Stop whenever you want.",
    breath: "not-required",
    optional: false,
    steps: [
      "Notice one sticky thought. You do not have to decide whether it is true.",
      "Put this phrase in front of it: “I am having the thought that…”",
      "Name one thing you can see. The thought can remain while you look.",
      "Stop whenever you want. Unhooking is not a promise that the thought will leave.",
    ],
  },
  {
    id: "kindness",
    title: "Kindness",
    summary: "One ordinary kind sentence. Skip this if kindness toward yourself feels wrong today.",
    breath: "not-required",
    optional: false,
    steps: [
      "Think of one sentence you might offer a friend who felt this way. Keep it ordinary.",
      "If you want, offer that same sentence to yourself.",
      "Skip the second step if it feels false. Kindness does not have to be grand.",
      "Stop whenever you want.",
    ],
  },
  {
    id: "making-room",
    title: "Making room",
    summary: "Let a feeling be here for a minute without having to like it or solve it.",
    breath: "not-required",
    optional: false,
    steps: [
      "You do not have to like this feeling, and you do not have to make it leave.",
      "Say, “There is room for this feeling for this minute.”",
      "If noticing the body feels bad, skip that and keep only the sentence.",
      "Stop whenever you want. Making room is not approval of what happened.",
    ],
  },
  {
    id: "small-step",
    title: "Small step",
    summary: "One action that is smaller than the whole problem. This is not a treatment plan.",
    breath: "not-required",
    optional: false,
    steps: [
      "Name one thing that matters to you today that is smaller than the whole problem.",
      "Pick one action that could take about ten minutes, or less.",
      "If nothing feels possible, the step can be sitting here for one more minute, or asking one person to listen.",
      "Stop whenever you want. This page will not turn the step into medical advice.",
    ],
  },
  {
    id: "one-problem",
    title: "One problem",
    summary: "Set down one problem, not every problem. Illness and medication stay with a clinician.",
    breath: "not-required",
    optional: false,
    steps: [
      "Name one problem. Leave the others for later.",
      "Separate one piece you can influence today from pieces that belong with a clinician or another person.",
      "This page will not solve an illness, change a medication, or promise an outcome.",
      "Stop whenever you want.",
    ],
  },
  {
    id: "sleep",
    title: "Sleep",
    summary: "A few ordinary sleep ideas. Bodies differ, and ongoing trouble is a reason to talk with a clinician.",
    breath: "not-required",
    optional: false,
    steps: [
      "If you can, keep the hour before bed dimmer and quieter than the rest of the evening.",
      "A regular wake time is one place to start. It is not a rule you have failed if you miss it.",
      "If you are awake for a long stretch, a quiet activity in low light is a common suggestion.",
      "Stop whenever you want. This is not a sleep prescription, and it does not promise you will sleep.",
    ],
  },
  {
    id: "gratitude",
    title: "Gratitude",
    summary:
      "Optional. Skip this if gratitude feels false or painful. You do not have to feel grateful about illness, pain, or caregiving.",
    breath: "not-required",
    optional: true,
    steps: [
      "This exercise is optional. Stopping now is a complete choice.",
      "If you continue, name one small thing that was okay, or one comfort. It can be tiny.",
      "You do not have to feel grateful about illness, pain, or caregiving.",
      "Stop whenever you want. Skipping gratitude is allowed.",
    ],
  },
];

export type ExerciseSession = {
  id: ExerciseId;
  stepIndex: number;
};

export function exerciseById(id: ExerciseId): Exercise | null {
  return EXERCISES.find((item) => item.id === id) ?? null;
}

export function startExercise(id: ExerciseId): ExerciseSession | null {
  return exerciseById(id) ? { id, stepIndex: 0 } : null;
}

export function nextExerciseStep(session: ExerciseSession | null): ExerciseSession | null {
  if (!session) return null;
  const exercise = exerciseById(session.id);
  if (!exercise) return null;
  if (session.stepIndex >= exercise.steps.length - 1) return session;
  return { id: session.id, stepIndex: session.stepIndex + 1 };
}

export function stopExercise(): null {
  return null;
}

export function exerciseCopy(): string {
  return EXERCISES.map((item) => [item.title, item.summary, ...item.steps].join(" ")).join("\n");
}
