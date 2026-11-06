import { activities } from "@/lib/wellness/academy";

export type SketchKind =
  | "walk"
  | "chair"
  | "balance"
  | "band"
  | "stretch"
  | "breath"
  | "hands"
  | "feet"
  | "neck"
  | "back";

export type LibraryExercise = {
  slug: string;
  title: string;
  group: string;
  duration: string;
  difficulty: "Beginner" | "Gentle";
  equipment: string;
  instructions: string[];
  beginner: string;
  seated: string;
  safety: string;
  sketch: SketchKind;
  academyHref?: string;
  sourceNote: string;
};

export type MovementProgram = {
  slug: string;
  title: string;
  minutes: number;
  summary: string;
  equipment: string;
  blocks: { minutes: number; text: string; seated: string }[];
  safety: string;
};

const sharedSafety =
  "Stop for pain, chest pain, dizziness, or trouble breathing. Urgent symptoms need a clinician or emergency services. This is not a personal exercise prescription, and a missed day is not a failure.";

const existingMeta: Record<
  string,
  Pick<LibraryExercise, "group" | "difficulty" | "equipment" | "sketch">
> = {
  "easy-walk": {
    group: "Walking",
    difficulty: "Beginner",
    equipment: "Comfortable shoes, or a sturdy chair if you march in place.",
    sketch: "walk",
  },
  "short-bouts": {
    group: "Walking",
    difficulty: "Beginner",
    equipment: "None. A sturdy chair for the seated option.",
    sketch: "chair",
  },
  "chair-stand": {
    group: "Beginner strength",
    difficulty: "Beginner",
    equipment: "A sturdy chair that does not roll.",
    sketch: "chair",
  },
  "band-pull": {
    group: "Beginner strength",
    difficulty: "Beginner",
    equipment: "A light band, or a towel.",
    sketch: "band",
  },
  "heel-to-toe": {
    group: "Balance",
    difficulty: "Beginner",
    equipment: "A counter or rail you can hold.",
    sketch: "balance",
  },
  "ankle-circles": {
    group: "Feet and ankles",
    difficulty: "Gentle",
    equipment: "A chair.",
    sketch: "feet",
  },
  "easy-reach": {
    group: "Stretching",
    difficulty: "Gentle",
    equipment: "A chair, or a tabletop for the smaller reach.",
    sketch: "stretch",
  },
  "seated-breath": {
    group: "Breathing",
    difficulty: "Gentle",
    equipment: "A supported seat.",
    sketch: "breath",
  },
};

const fresh: LibraryExercise[] = [
  {
    slug: "chair-yoga",
    title: "Chair yoga flow",
    group: "Chair yoga",
    duration: "About 5 to 15 minutes. Stop earlier if you want.",
    difficulty: "Beginner",
    equipment: "A sturdy chair that does not roll.",
    instructions: [
      "Sit tall with both feet on the floor if that is comfortable.",
      "Roll the shoulders slowly for a few breaths.",
      "Reach one arm up, or forward to your knee. Switch sides.",
      "March the feet slowly, then rest the hands on the thighs and breathe in an ordinary way.",
    ],
    beginner: "Do only the shoulder roll and the breath.",
    seated: "The whole flow stays seated. You do not need to stand.",
    safety: sharedSafety,
    sketch: "chair",
    sourceNote:
      "CDC says some activity is better than none and that it can be split up. This flow is a lifeZoi example, not a published yoga protocol and not a copied video.",
  },
  {
    slug: "gentle-yoga",
    title: "Gentle yoga shapes",
    group: "Gentle yoga",
    duration: "About 10 to 20 minutes, or one shape.",
    difficulty: "Gentle",
    equipment: "A chair or a clear space beside a counter.",
    instructions: [
      "Begin seated. Roll the shoulders and circle the ankles.",
      "If standing feels steady, hold a counter and take a small step back with one foot, heel down only if it does not hurt.",
      "Return to the chair. Turn the chest gently, hands on the chair.",
      "Finish seated with ordinary breathing.",
    ],
    beginner: "Stay seated for every shape.",
    seated: "Skip the standing step. The seated shoulder roll, twist, and breath are the full practice.",
    safety: sharedSafety,
    sketch: "stretch",
    sourceNote:
      "These shapes are original lifeZoi instructions. They are not a studio sequence and not a promise of flexibility.",
  },
  {
    slug: "daily-stretch",
    title: "Easy daily stretch",
    group: "Stretching",
    duration: "About 10 minutes, or any single minute.",
    difficulty: "Gentle",
    equipment: "A chair.",
    instructions: [
      "Sit tall and breathe.",
      "Circle the shoulders.",
      "Turn the head only a little.",
      "Reach one arm, then the other, only as far as is comfortable.",
      "Circle the ankles and open the hands.",
    ],
    beginner: "Keep every motion small.",
    seated: "Do the whole stretch seated. A tabletop reach replaces an upward reach.",
    safety: sharedSafety,
    sketch: "stretch",
    sourceNote: "A comfortable range fits public guidance to match activity to your abilities. The sequence itself is a lifeZoi example.",
  },
  {
    slug: "supported-balance",
    title: "Supported balance practice",
    group: "Balance",
    duration: "A few minutes beside a counter.",
    difficulty: "Beginner",
    equipment: "A counter or heavy chair to hold. Clear floor.",
    instructions: [
      "Stand where both hands can reach the support.",
      "Shift weight from one foot to the other.",
      "Lift one heel if the ankle feels all right.",
      "Take a few small steps with one foot ahead of the other, still holding on.",
    ],
    beginner: "Only the weight shift, with both hands ready.",
    seated: "Sit tall and march slowly, or turn the head a little with your back supported.",
    safety: sharedSafety,
    sketch: "balance",
    sourceNote:
      "CDC gives heel-to-toe walking as a balance example for older adults and says to match effort to your abilities. Holding on is part of this practice.",
  },
  {
    slug: "walking-breaks",
    title: "Short walking breaks",
    group: "Walking",
    duration: "Two or three short bouts, or one.",
    difficulty: "Beginner",
    equipment: "Indoor space, or shoes for a familiar route.",
    instructions: [
      "Walk at a pace where you can still talk.",
      "Stop at the time you chose.",
      "Rest, then repeat once if you feel well.",
    ],
    beginner: "One bout is the whole practice.",
    seated: "March in place while holding a sturdy chair.",
    safety: sharedSafety,
    sketch: "walk",
    sourceNote: "CDC says weekly activity can be split into shorter bouts. The route is your choice.",
  },
  {
    slug: "wall-push",
    title: "Wall or chair push",
    group: "Beginner strength",
    duration: "A few slow pushes, or one.",
    difficulty: "Beginner",
    equipment: "A clear wall, or the arms of a sturdy chair.",
    instructions: [
      "Place your hands on a wall at chest height, or on the chair arms.",
      "Bend the elbows a little and push back to straight, only through a range that does not hurt.",
      "Breathe out as you push. Do not hold your breath.",
    ],
    beginner: "Make the bend very small, or only press the palms together.",
    seated: "Stay seated and press the palms together, then relax. Skip the wall if standing is not available.",
    safety: sharedSafety,
    sketch: "band",
    sourceNote:
      "CDC discusses muscle-strengthening on 2 or more days a week for major muscle groups. This push is a simple example, not a gym plan.",
  },
  {
    slug: "mobility-flow",
    title: "Easy mobility flow",
    group: "Mobility",
    duration: "A few slow repetitions.",
    difficulty: "Gentle",
    equipment: "A chair.",
    instructions: [
      "Sit and circle one ankle, then the other.",
      "Roll the shoulders.",
      "Turn the chest gently.",
      "Open and close the hands.",
    ],
    beginner: "Move only one joint.",
    seated: "The flow is seated. Skip any joint that a clinician has asked you to rest.",
    safety: sharedSafety,
    sketch: "stretch",
    sourceNote: "These circles are a lifeZoi example for a day when a walk is not the right choice. They are not a treatment for a joint condition.",
  },
  {
    slug: "hands-wrists",
    title: "Hands and wrists",
    group: "Hands",
    duration: "About 3 minutes.",
    difficulty: "Gentle",
    equipment: "None.",
    instructions: [
      "Rest the forearms on your thighs or a table.",
      "Open the hands wide, then make a soft fist.",
      "Circle the wrists slowly. Keep the circles small.",
      "Shake the hands loosely and stop.",
    ],
    beginner: "Only open and close the hands.",
    seated: "Do this seated. Skip it if a clinician has limited hand movement.",
    safety: sharedSafety,
    sketch: "hands",
    sourceNote: "A small hand movement is a lifeZoi example. It is not therapy for arthritis or for nerve pain.",
  },
  {
    slug: "feet-ankles",
    title: "Feet and ankles",
    group: "Feet and ankles",
    duration: "About 3 minutes.",
    difficulty: "Gentle",
    equipment: "A chair. Shoes off if that feels safe.",
    instructions: [
      "Sit with the feet supported or resting comfortably.",
      "Point and flex one foot, then the other.",
      "Circle each ankle.",
      "Press the toes into the floor gently, then relax.",
    ],
    beginner: "Only the ankle circles, and keep them small.",
    seated: "Stay seated. Do not stand for this one.",
    safety: sharedSafety,
    sketch: "feet",
    sourceNote: "Seated ankle movement is a lifeZoi option for days when walking is not the plan. Stop for pain.",
  },
  {
    slug: "neck-shoulders",
    title: "Neck and shoulders",
    group: "Neck and shoulders",
    duration: "About 4 minutes.",
    difficulty: "Gentle",
    equipment: "A chair with a back, if you want support.",
    instructions: [
      "Sit tall and look forward.",
      "Turn the head a little to the left, back to center, then a little to the right.",
      "Tip one ear slightly toward the shoulder without pulling it with your hand. Switch sides.",
      "Roll the shoulders back slowly.",
    ],
    beginner: "Only the shoulder roll.",
    seated: "The whole practice is seated. Do not force a stretch, and do not roll the neck in a full circle.",
    safety: sharedSafety,
    sketch: "neck",
    sourceNote: "Small neck and shoulder motion is a lifeZoi example. It is not a treatment for a neck injury.",
  },
  {
    slug: "back-friendly",
    title: "Back-friendly movement",
    group: "Back-friendly",
    duration: "About 5 minutes.",
    difficulty: "Gentle",
    equipment: "A sturdy chair.",
    instructions: [
      "Sit with the feet on the floor and the back supported if the chair has a back.",
      "Tip the chest forward a little from the hips, then return to tall. Keep the motion small.",
      "Turn the chest gently to one side with the hands on the chair. Switch sides.",
      "Stand only if you feel steady, hold a counter, and take a short walk. Otherwise march while seated.",
    ],
    beginner: "Only sit tall and breathe.",
    seated: "Skip standing. The hip hinge, gentle turn, and seated march are enough.",
    safety: `${sharedSafety} A new or severe back symptom belongs with a clinician. This page does not diagnose back pain.`,
    sketch: "back",
    sourceNote: "The movements stay small on purpose. They are not a clinical back protocol.",
  },
  {
    slug: "longer-exhale",
    title: "Longer exhale",
    group: "Breathing",
    duration: "About 2 minutes.",
    difficulty: "Gentle",
    equipment: "A supported seat.",
    instructions: [
      "Breathe in a way that feels ordinary.",
      "If it is easy, let the out-breath last a little longer than the in-breath.",
      "Return to ordinary breathing. One minute is enough.",
    ],
    beginner: "Skip the longer exhale and only sit.",
    seated: "Stay seated. Do not lie down if that makes breathing feel harder.",
    safety:
      "Stop if you feel dizzy or short of breath. This is not treatment for anxiety, lung disease, or a breathing emergency. Trouble breathing needs urgent care.",
    sketch: "breath",
    sourceNote: "NIMH lists relaxation and breathing as coping options. lifeZoi keeps the instruction ordinary.",
  },
  {
    slug: "morning-movement",
    title: "Morning movement",
    group: "Morning movement",
    duration: "About 8 minutes, or the first minute only.",
    difficulty: "Beginner",
    equipment: "The edge of the bed or a chair.",
    instructions: [
      "Sit before you stand.",
      "Circle the ankles and roll the shoulders.",
      "Reach one arm in a comfortable range.",
      "Stand only if you feel steady, holding the bed or a chair.",
      "Walk to another room, or march while seated.",
      "Finish with ordinary breathing.",
    ],
    beginner: "Stay seated for the ankle circles and one breath.",
    seated: "Do not stand. The seated version is complete.",
    safety: `${sharedSafety} If you often feel dizzy when you stand, stay seated and tell a clinician.`,
    sketch: "chair",
    sourceNote: "A short morning start is a lifeZoi example. It does not treat blood pressure or guarantee alertness.",
  },
];

function fromAcademy(): LibraryExercise[] {
  return activities.map((activity) => {
    const meta = existingMeta[activity.slug] ?? {
      group: activity.category,
      difficulty: "Beginner" as const,
      equipment: "See the steps. Use a chair if you want support.",
      sketch: activity.sketch,
    };
    return {
      slug: activity.slug,
      title: activity.title,
      group: meta.group,
      duration: activity.duration,
      difficulty: meta.difficulty,
      equipment: meta.equipment,
      instructions: activity.steps,
      beginner: activity.beginner,
      seated: activity.accessible,
      safety: activity.safety,
      sketch: meta.sketch,
      academyHref: `/academy/move/${activity.slug}`,
      sourceNote: activity.evidenceNote,
    };
  });
}

export const libraryExercises: LibraryExercise[] = [...fromAcademy(), ...fresh];

export function exerciseBySlug(slug: string) {
  return libraryExercises.find((item) => item.slug === slug) ?? null;
}

export const movementPrograms: MovementProgram[] = [
  {
    slug: "chair-yoga-5",
    title: "5-minute chair yoga",
    minutes: 5,
    summary: "Five seated minutes. No standing and no video.",
    equipment: "A sturdy chair.",
    blocks: [
      { minutes: 1, text: "Sit tall, feet on the floor if you can, hands on your thighs.", seated: "This block is seated." },
      { minutes: 1, text: "Roll the shoulders slowly.", seated: "Stay seated." },
      { minutes: 1, text: "Reach one arm forward or up, then the other, only as far as is easy.", seated: "A reach to the knee counts." },
      { minutes: 1, text: "March the feet slowly.", seated: "Keep the march small." },
      { minutes: 1, text: "Rest the hands and breathe in an ordinary way.", seated: "Stay seated." },
    ],
    safety: sharedSafety,
  },
  {
    slug: "chair-yoga-10",
    title: "10-minute chair yoga",
    minutes: 10,
    summary: "The 5-minute flow plus neck, ankles, a gentle turn, and a towel pull.",
    equipment: "A sturdy chair. A towel is optional.",
    blocks: [
      { minutes: 5, text: "Follow the 5-minute chair yoga: sit tall, shoulders, reach, march, breath.", seated: "All seated." },
      { minutes: 1, text: "Turn the head a little each way. Do not roll the neck.", seated: "Seated." },
      { minutes: 1, text: "Circle the ankles.", seated: "Seated." },
      { minutes: 1, text: "Turn the chest gently, hands on the chair. Switch sides.", seated: "Seated." },
      { minutes: 1, text: "Hold a towel and pull it gently apart, or press the palms together.", seated: "Seated. Skip the arms if they should rest." },
      { minutes: 1, text: "Sit quietly and breathe.", seated: "Seated." },
    ],
    safety: sharedSafety,
  },
  {
    slug: "chair-yoga-15",
    title: "15-minute chair yoga",
    minutes: 15,
    summary: "A longer seated practice. Rest between blocks.",
    equipment: "A sturdy chair. A towel is optional.",
    blocks: [
      { minutes: 10, text: "Use the 10-minute chair yoga blocks, resting if you want.", seated: "All seated." },
      { minutes: 1, text: "Sit tall and lean a little to one side, then the other. Keep it small.", seated: "Seated. Skip the lean if the back objects." },
      { minutes: 1, text: "Lift the heels while the toes stay down, or flex and point the feet.", seated: "Seated." },
      { minutes: 1, text: "Circle the wrists and open the hands.", seated: "Seated." },
      { minutes: 1, text: "Press the palms together gently, then relax.", seated: "Seated." },
      { minutes: 1, text: "Finish with ordinary breathing.", seated: "Seated." },
    ],
    safety: sharedSafety,
  },
  {
    slug: "gentle-yoga-20",
    title: "20-minute gentle yoga",
    minutes: 20,
    summary: "Four blocks of five minutes. Standing is optional.",
    equipment: "A chair and, if you stand, a counter.",
    blocks: [
      { minutes: 5, text: "Seated shoulders, ankle circles, and easy breathing.", seated: "Start here even if you plan to stand later." },
      { minutes: 5, text: "Seated reaches and a gentle chest turn.", seated: "Stay seated for this block." },
      {
        minutes: 5,
        text: "If you feel steady, hold a counter and take a small step with one foot, heel down only if it does not hurt. Switch sides.",
        seated: "Skip standing. Repeat the seated reach instead.",
      },
      { minutes: 5, text: "Return to the chair. March slowly, then sit and breathe.", seated: "The ending is seated." },
    ],
    safety: sharedSafety,
  },
  {
    slug: "full-body-25",
    title: "25-minute full-body movement",
    minutes: 25,
    summary: "Five blocks: walk or march, strength, balance, stretch, and breath.",
    equipment: "A chair, a counter, and shoes if you walk.",
    blocks: [
      { minutes: 5, text: "Walk at a talking pace, or march in place.", seated: "Seated march." },
      { minutes: 5, text: "Sit to stand a few times with your hands, or press the palms together.", seated: "Palm press if you stay seated." },
      { minutes: 5, text: "Hold a counter and shift your weight. Stop if you feel unsteady.", seated: "Sit tall and march instead." },
      { minutes: 5, text: "Seated shoulder rolls, ankle circles, and an easy reach.", seated: "This block is seated." },
      { minutes: 5, text: "Sit and breathe in an ordinary way. You can stop before the five minutes.", seated: "Seated." },
    ],
    safety: sharedSafety,
  },
  {
    slug: "walk-30",
    title: "30-minute walk",
    minutes: 30,
    summary: "A talking-pace walk in three parts. Any part can be a seated march.",
    equipment: "A familiar route, or a chair if you stay inside.",
    blocks: [
      {
        minutes: 10,
        text: "Walk where you can still talk. Notice the route. Stop early if you planned a shorter walk.",
        seated: "March in place for any of these minutes.",
      },
      {
        minutes: 10,
        text: "Continue, or sit and rest, then walk again. Rest is allowed in the middle.",
        seated: "Use the chair for the rest or for the whole block.",
      },
      {
        minutes: 10,
        text: "Finish at a pace that still lets you talk. Stop at the time you chose, or sooner.",
        seated: "Seated march, then ordinary breathing.",
      },
    ],
    safety: sharedSafety,
  },
];

export function programBySlug(slug: string) {
  return movementPrograms.find((item) => item.slug === slug) ?? null;
}

export const MOVEMENT_GROUPS = [
  "Chair yoga",
  "Gentle yoga",
  "Stretching",
  "Balance",
  "Walking",
  "Beginner strength",
  "Mobility",
  "Hands",
  "Feet and ankles",
  "Neck and shoulders",
  "Back-friendly",
  "Breathing",
  "Morning movement",
] as const;
