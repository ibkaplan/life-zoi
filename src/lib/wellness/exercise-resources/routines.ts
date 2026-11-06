import { FALL_RISK, safetyNote, type ResourceTier } from "@/lib/wellness/exercise-resources/copy";
import type { ExternalLinkId } from "@/lib/wellness/exercise-resources/links";

export type SketchKind = "chair" | "morning" | "balance" | "hands" | "feet" | "strength";

export type RoutineMove = {
  name: string;
  how: string;
  dose: string;
  easier: string;
};

export type Routine = {
  slug: string;
  title: string;
  minutes: string;
  sketch: SketchKind;
  categorySlug: string;
  guideSlug: string;
  summary: string;
  moves: RoutineMove[];
  safety: string;
  linkIds: ExternalLinkId[];
  tier: ResourceTier;
};

const free = "free" as const;

export const routines: Routine[] = [
  {
    slug: "ten-minute-chair",
    title: "10-Minute Chair Movement",
    minutes: "About 10 minutes, with rest whenever you want it.",
    sketch: "chair",
    categorySlug: "chair-exercises",
    guideSlug: "chair-exercise",
    summary: "Six seated movements you can do at home in a stable chair. The words were written for lifeZoi.",
    moves: [
      {
        name: "Seated march",
        how: "Sit tall with both feet on the floor. Lift one foot, then the other, and keep the lift small.",
        dose: "About 60 seconds.",
        easier: "March more slowly, or rest a hand on your lap and lift the feet only a little.",
      },
      {
        name: "Shoulder rolls",
        how: "Lift both shoulders toward the ears, roll them back, and let them drop.",
        dose: "8 rolls.",
        easier: "Do 4 smaller rolls.",
      },
      {
        name: "Gentle arm raises",
        how: "Lift one arm forward only as high as is comfortable, then lower it. Switch arms.",
        dose: "6 raises on each arm.",
        easier: "Lift only to chest height, or do 3 raises.",
      },
      {
        name: "Ankle movements",
        how: "Lift one foot slightly and circle the ankle one way, then the other. Switch feet.",
        dose: "8 circles each way, each foot.",
        easier: "Do 4 small circles.",
      },
      {
        name: "Seated knee extensions",
        how: "Straighten one knee, then lower the foot. Switch legs. Hold the chair if you like.",
        dose: "6 on each leg.",
        easier: "Slide the foot forward on the floor instead of lifting it.",
      },
      {
        name: "Gentle breathing",
        how: "Sit back and breathe in a way that feels ordinary. Do not force a deep breath.",
        dose: "4 easy breaths.",
        easier: "Two breaths, then stop.",
      },
    ],
    safety: safetyNote("Stay seated for the whole routine. Skip any part that does not feel right."),
    linkIds: ["nia-toolkit", "medlineplus-older", "cdc-older"],
    tier: free,
  },
  {
    slug: "ten-minute-morning",
    title: "10-Minute Morning Stretch",
    minutes: "About 10 minutes. Each part can be shorter.",
    sketch: "morning",
    categorySlug: "morning-movement",
    guideSlug: "morning-stretch",
    summary: "A seated start to the day for the neck, shoulders, arms, back, and ankles.",
    moves: [
      {
        name: "Neck",
        how: "Turn the head a short way to one side, return to the center, then turn the other way. Do not tip the head far back.",
        dose: "3 turns each side.",
        easier: "Look only a little to the side.",
      },
      {
        name: "Shoulders",
        how: "Roll both shoulders slowly backward.",
        dose: "6 rolls.",
        easier: "Do 3 rolls.",
      },
      {
        name: "Arms",
        how: "Reach one arm forward only as far as is comfortable, then the other arm.",
        dose: "3 reaches each side.",
        easier: "Reach toward a table instead of out into the air.",
      },
      {
        name: "Seated spinal movement",
        how: "Hold the side of the chair. Turn the chest a small amount, then come back. Switch sides.",
        dose: "2 turns each side.",
        easier: "Turn only the head and leave the chest still.",
      },
      {
        name: "Ankles",
        how: "Circle one ankle slowly, then the other.",
        dose: "8 circles each foot.",
        easier: "Do 4 circles.",
      },
      {
        name: "Relaxation",
        how: "Rest the hands on the thighs and breathe in an ordinary way.",
        dose: "4 easy breaths.",
        easier: "Stop after one breath.",
      },
    ],
    safety: safetyNote("Do not force a stretch. A mild easy range is the goal. Skip the neck if turning the head feels wrong."),
    linkIds: ["nia-flexibility-video", "nia-shoulder-video", "medlineplus-older"],
    tier: free,
  },
  {
    slug: "beginner-balance",
    title: "Beginner Balance",
    minutes: "About 10 minutes beside a stable chair. Stop sooner if you feel unsteady.",
    sketch: "balance",
    categorySlug: "balance-and-stability",
    guideSlug: "beginner-balance",
    summary: "Supported balance practice. Every standing part uses a stable chair. A seated version is included.",
    moves: [
      {
        name: "Set up near a stable chair",
        how: "Stand beside a sturdy chair and keep one hand on the back of it. If standing does not feel safe, stay seated.",
        dose: "Take a moment before you move.",
        easier: "Use the seated alternative for the whole routine.",
      },
      {
        name: "Supported heel raises",
        how: "Hold the chair. Lift both heels a little, then lower them.",
        dose: "6 raises.",
        easier: "Do 3 small lifts, or do the lifts while seated.",
      },
      {
        name: "Supported side steps",
        how: "Hold the chair. Step one foot out to the side and bring it back. Switch sides.",
        dose: "4 steps each side.",
        easier: "Take 2 smaller steps.",
      },
      {
        name: "Gentle weight shifts",
        how: "Hold the chair. Shift a little of your weight toward one foot, then the other. Keep both feet on the floor.",
        dose: "6 shifts.",
        easier: "Make the shift smaller, or stay seated and rock gently from side to side.",
      },
      {
        name: "Heel-to-toe with support",
        how: "Keep holding the chair. Place one foot ahead, heel toward the other toe, and take a few short steps.",
        dose: "A few supported steps.",
        easier: "Skip the steps and only shift your weight while holding the chair.",
      },
      {
        name: "Seated alternative",
        how: "If you are at risk of falling, or standing does not feel safe, stay in the chair. March the feet and circle the ankles.",
        dose: "About 1 minute.",
        easier: "Make the movement even smaller.",
      },
    ],
    safety: safetyNote(FALL_RISK),
    linkIds: ["cdc-older", "nia-balance-video", "nia-heel-video", "liveup"],
    tier: free,
  },
  {
    slug: "hand-and-finger",
    title: "Hand and Finger",
    minutes: "About 10 minutes, with rests.",
    sketch: "hands",
    categorySlug: "hand-and-finger",
    guideSlug: "hand-and-finger",
    summary: "Small hand movements you can do seated. This is not care for a joint condition.",
    moves: [
      {
        name: "Open and close",
        how: "Open the hand, then make a soft fist. Keep the movement easy.",
        dose: "8 times each hand.",
        easier: "Do 4 times with one hand only.",
      },
      {
        name: "Finger spread",
        how: "Spread the fingers, then bring them back together.",
        dose: "6 times each hand.",
        easier: "Do 3 smaller spreads.",
      },
      {
        name: "Thumb touches",
        how: "Touch the thumb to each fingertip, one finger at a time.",
        dose: "1 round each hand.",
        easier: "Skip any finger that hurts.",
      },
      {
        name: "Wrist circles",
        how: "Circle the wrist slowly one way, then the other.",
        dose: "6 each way, each wrist.",
        easier: "Do 3 small circles.",
      },
      {
        name: "Rest",
        how: "Rest the hands on the lap, or shake them gently.",
        dose: "4 easy breaths.",
        easier: "Rest as soon as you want to.",
      },
    ],
    safety: safetyNote("Stop for pain, swelling, or numbness. These movements are not treatment for arthritis or an injury."),
    linkIds: ["nia-hand-grip-video", "medlineplus-older"],
    tier: free,
  },
  {
    slug: "feet-and-ankle",
    title: "Feet and Ankle",
    minutes: "About 10 minutes. The standing part is optional.",
    sketch: "feet",
    categorySlug: "feet-and-ankle",
    guideSlug: "feet-and-ankle",
    summary: "Seated ankle and foot movements, plus one supported heel raise you can skip.",
    moves: [
      {
        name: "Ankle circles",
        how: "Stay seated. Circle one ankle, then the other.",
        dose: "8 each way, each foot.",
        easier: "Do 4 small circles.",
      },
      {
        name: "Toe raises",
        how: "Stay seated. Lift the toes and keep the heels down, then lower the toes.",
        dose: "8 times.",
        easier: "Do 4 smaller lifts.",
      },
      {
        name: "Seated heel raises",
        how: "Stay seated. Lift the heels and keep the toes down, then lower the heels.",
        dose: "8 times.",
        easier: "Do 4 smaller lifts.",
      },
      {
        name: "Point and flex",
        how: "Stay seated. Point one foot gently, then flex it.",
        dose: "6 each foot.",
        easier: "Use a smaller range.",
      },
      {
        name: "Supported standing heel raise",
        how: "Only if you feel steady. Hold a stable chair. Lift the heels a little, then lower them.",
        dose: "4 raises.",
        easier: "Skip this and stay seated.",
      },
    ],
    safety: safetyNote("Do the routine seated unless the last part feels steady. Skip anything that hurts a foot or ankle."),
    linkIds: ["nia-ankle-video", "nia-three-types"],
    tier: free,
  },
  {
    slug: "gentle-strength",
    title: "Gentle Strength",
    minutes: "About 10 minutes. Skip every standing part that does not feel safe.",
    sketch: "strength",
    categorySlug: "strength-for-beginners",
    guideSlug: "gentle-strength",
    summary: "Seated arm and knee movements, with wall and chair options only when they feel safe.",
    moves: [
      {
        name: "Seated arm raises",
        how: "Lift one arm only as high as is comfortable, then lower it. Switch arms.",
        dose: "6 each arm.",
        easier: "Do 3 raises, only to chest height.",
      },
      {
        name: "Seated knee extensions",
        how: "Straighten one knee, then lower the foot. Switch legs.",
        dose: "6 each leg.",
        easier: "Slide the foot along the floor.",
      },
      {
        name: "Wall push-ups",
        how: "Only if standing at a wall feels steady. Place both hands on the wall, bend the elbows a little, then push back.",
        dose: "5 times.",
        easier: "Stand closer to the wall and bend less, or skip this and stay seated.",
      },
      {
        name: "Supported calf raises",
        how: "Hold a stable chair. Lift the heels a little, then lower them.",
        dose: "6 times.",
        easier: "Do the heel lifts seated.",
      },
      {
        name: "Sit-to-stand only when safe",
        how: "Use a sturdy chair. Put your hands on the chair or a counter. Stand up and sit down with control. Skip this if it does not feel safe.",
        dose: "3 times, or none.",
        easier: "Stay seated and press your feet into the floor instead.",
      },
    ],
    safety: safetyNote("Sit-to-stand is only for a moment that already feels safe. Use your hands. This is not a strength program for a medical condition."),
    linkIds: ["nia-strength-video", "nia-wall-pushup-video", "cdc-older"],
    tier: free,
  },
];

export function routineBySlug(slug: string): Routine | null {
  return routines.find((item) => item.slug === slug) ?? null;
}
