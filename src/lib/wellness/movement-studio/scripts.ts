export const SCRIPT_LABEL = "Script for later recording. This is not a finished video.";

export type SpokenCue = {
  heading: string;
  words: string;
};

export type RoutineScript = {
  id: string;
  title: string;
  practiceMinutes: 5 | 10;
  cues: SpokenCue[];
};

const pause = "Pause whenever you want. A smaller movement is enough.";

export const routineScripts: RoutineScript[] = [
  {
    id: "script-chair",
    title: "10-Minute Chair Movement",
    practiceMinutes: 10,
    cues: [
      {
        heading: "Open",
        words: "Sit in a sturdy chair with both feet on the floor. Rest your hands on your thighs. This is a spoken script for a later recording. It is not a video.",
      },
      {
        heading: "Seated march",
        words: `Lift one foot a little, then the other. Keep the chair under you. About one minute. ${pause}`,
      },
      {
        heading: "Shoulder rolls",
        words: "Lift the shoulders toward the ears, roll them back, and let them drop. Eight easy rolls.",
      },
      {
        heading: "Gentle arm raises",
        words: "Lift one arm forward only as high as is comfortable, then lower it. Switch arms. Six on each side, or fewer.",
      },
      {
        heading: "Ankles",
        words: "Leave the heel near the floor and circle one ankle one way, then the other way. Switch feet.",
      },
      {
        heading: "Seated knee extensions",
        words: "Straighten one knee, then set the foot down. Switch legs. Hold the chair if you like. Slide the foot along the floor if a lift does not feel right.",
      },
      {
        heading: "Close",
        words: "Sit back. Four ordinary breaths. Do not force the air. Stop for chest pain, dizziness, unusual shortness of breath, or significant pain.",
      },
    ],
  },
  {
    id: "script-morning",
    title: "10-Minute Morning Stretch",
    practiceMinutes: 10,
    cues: [
      {
        heading: "Open",
        words: "Stay seated. Feet on the floor. This written morning stretch is a script for later recording, not a finished video.",
      },
      {
        heading: "Neck",
        words: "Look a short way to one side, return to center, then the other side. Do not tip the head far back. Three slow looks each way.",
      },
      {
        heading: "Shoulders and arms",
        words: "Roll the shoulders back six times. Then reach one arm forward only as far as is comfortable, and switch.",
      },
      {
        heading: "Seated spinal movement",
        words: "Hold the chair. Turn the chest a small amount, come back, and switch sides. Two turns each side is enough.",
      },
      {
        heading: "Ankles",
        words: "Circle one ankle, then the other. Eight circles, or four if you prefer.",
      },
      {
        heading: "Close",
        words: "Let the hands rest. Breathe in an ordinary way for the last minute. Stop if anything hurts.",
      },
    ],
  },
  {
    id: "script-balance",
    title: "Beginner Balance",
    practiceMinutes: 10,
    cues: [
      {
        heading: "Open",
        words: "Put a sturdy chair beside you and keep one hand on it. Do not practice balance without support if you are at risk of falling. This is a script, not a video.",
      },
      {
        heading: "Supported heel raises",
        words: "Hold the chair. Lift both heels a little, then lower them. Eight times, or fewer.",
      },
      {
        heading: "Side steps",
        words: "Hold the chair. Step one foot out to the side and bring it back. Then the other foot. Stay close to the chair.",
      },
      {
        heading: "Weight shift",
        words: "Hold the chair. Move the body a little toward one foot, then the other. Keep both feet easy to reach the floor.",
      },
      {
        heading: "Heel-to-toe with support",
        words: "Hold the chair. Place one heel near the other toe only if that feels steady. Two short passes are enough. Skip this part if it does not.",
      },
      {
        heading: "Seated alternative",
        words: "If standing is not a good fit, sit and march the feet slowly for one minute. That still counts as practice.",
      },
    ],
  },
  {
    id: "script-hands",
    title: "Hand and Finger",
    practiceMinutes: 10,
    cues: [
      {
        heading: "Open",
        words: "Sit in a sturdy chair. This hand and finger script is for a later recording. It is not a video.",
      },
      {
        heading: "Open and close",
        words: "Open both hands, then gently close them. Ten times. Skip a hand that is sore.",
      },
      {
        heading: "Thumb touches",
        words: "Touch the thumb to each fingertip, one at a time, then open the hand. Two rounds on each hand.",
      },
      {
        heading: "Wrist turns",
        words: "Rest a forearm on your thigh. Turn the palm up and down slowly. Six turns each side.",
      },
      {
        heading: "Soft squeeze",
        words: "If you have a soft ball or a folded cloth, give it a gentle squeeze and release. Eight times each hand. A fist without an object is fine.",
      },
      {
        heading: "Close",
        words: "Shake the hands loose only if that feels good. Rest them on your lap.",
      },
    ],
  },
  {
    id: "script-feet",
    title: "Feet and Ankle",
    practiceMinutes: 10,
    cues: [
      {
        heading: "Open",
        words: "Sit tall in a sturdy chair. This feet and ankle script is not a finished video.",
      },
      {
        heading: "Toes",
        words: "Lift the toes, then set them down. Ten times. Shoes can stay on.",
      },
      {
        heading: "Ankle points",
        words: "Slide one foot forward. Point the toes away and then pull them back. Six times each foot.",
      },
      {
        heading: "Circles",
        words: "Circle one ankle slowly each way. Then the other ankle.",
      },
      {
        heading: "Heel press",
        words: "Press one heel gently toward the floor, then the other. Keep the movement small.",
      },
      {
        heading: "Close",
        words: "Place both feet flat. Rest for a few breaths.",
      },
    ],
  },
  {
    id: "script-strength",
    title: "Gentle Strength",
    practiceMinutes: 10,
    cues: [
      {
        heading: "Open",
        words: "Use a sturdy chair. The first movements stay seated. Standing parts are optional. This is a script for later recording, not a video.",
      },
      {
        heading: "Seated arm raises",
        words: "Lift one arm forward to a comfortable height and lower it. Six each side.",
      },
      {
        heading: "Seated knee extensions",
        words: "Straighten one knee and lower the foot. Six each leg. Wednesday can use this part for legs. Slide the foot if a lift does not feel right.",
      },
      {
        heading: "Optional wall push",
        words: "If standing feels steady, face a clear wall, hands on the wall, and bend the elbows a little. Six times. Skip it and stay seated if you prefer.",
      },
      {
        heading: "Optional supported calf raise",
        words: "Hold the chair. Lift the heels a little and lower them. Six times. Skip this if standing is not a good fit.",
      },
      {
        heading: "Optional sit-to-stand",
        words: "Only if it is easy to stand from the chair, stand up and sit back down twice, using your hands. Otherwise stay seated.",
      },
    ],
  },
  {
    id: "script-walk",
    title: "Walk at Home",
    practiceMinutes: 10,
    cues: [
      {
        heading: "Open",
        words: "This is a 10-minute walking script for later recording. It is not a video, and it is not the same as a short balance film.",
      },
      {
        heading: "First piece",
        words: "Walk a clear indoor path, or march in place while holding a sturdy chair. About two minutes. Then rest.",
      },
      {
        heading: "Second piece",
        words: "Walk or march for another two minutes. Keep the steps small enough to talk in a normal voice.",
      },
      {
        heading: "Third piece",
        words: "Another two minutes. Turn slowly. Look at the path.",
      },
      {
        heading: "Last piece",
        words: "A final two minutes, then sit. Seated marching replaces the walk if walking is not a good fit today.",
      },
      {
        heading: "Close",
        words: "Sit and let the breath settle. Stop for chest pain, dizziness, unusual shortness of breath, or significant pain.",
      },
    ],
  },
  {
    id: "script-yoga",
    title: "Gentle Chair Yoga",
    practiceMinutes: 10,
    cues: [
      {
        heading: "Open",
        words: "Sit in a sturdy chair. This is an original lifeZoi script for later recording. It is not a finished yoga video and it is not a class you can press play on.",
      },
      {
        heading: "Seated easy posture",
        words: "Feet on the floor. Hands on the thighs. Lengthen through the chest without forcing it. Stay for three breaths.",
      },
      {
        heading: "Neck look",
        words: "Look gently to one side, then the other. Two looks each way.",
      },
      {
        heading: "Open arms",
        words: "Open the arms out to the sides only as far as is comfortable, then bring the hands back to the thighs. Four times.",
      },
      {
        heading: "Seated side reach",
        words: "One hand holds the chair. The other arm reaches up a little, then comes down. Switch sides. Two each side.",
      },
      {
        heading: "Ankles and rest",
        words: "Circle the ankles slowly. Then rest the hands and breathe in an ordinary way until the ten minutes are done.",
      },
    ],
  },
  {
    id: "script-breathe",
    title: "Evening Breathing",
    practiceMinutes: 10,
    cues: [
      {
        heading: "Open",
        words: "Sit or lie down somewhere you feel supported. This evening breathing script is for later recording. It is not a video.",
      },
      {
        heading: "Notice",
        words: "Notice the breath you already have. Do not try to make it deep.",
      },
      {
        heading: "Easy count",
        words: "Breathe in for a comfortable count and out for a comfortable count. If counting is annoying, drop the count.",
      },
      {
        heading: "Shoulders",
        words: "On the next out-breath, let the shoulders drop. Do that three times.",
      },
      {
        heading: "Hands",
        words: "Rest one hand on the belly or leave both hands in the lap. Either is fine.",
      },
      {
        heading: "Close",
        words: "Stay with quiet breathing until you want to stop. Stop if you feel dizzy or short of breath.",
      },
    ],
  },
  {
    id: "script-shift",
    title: "Supported weight shift",
    practiceMinutes: 10,
    cues: [
      {
        heading: "Open",
        words: "Hold a sturdy chair with one hand. This is a lifeZoi script for a supported side-to-side shift. It is not a tai chi course, not qigong instruction, and not a video.",
      },
      {
        heading: "Stand tall",
        words: "Feet about hip-width apart. Soften the knees. Keep the chair under your hand.",
      },
      {
        heading: "Shift",
        words: "Move a little of your weight toward one foot, then back to the middle, then toward the other foot. The free foot stays easy to put down.",
      },
      {
        heading: "Small circles",
        words: "If the shift feels steady, make a very small circle with the body while the hand stays on the chair. Skip circles if you prefer only the side-to-side shift.",
      },
      {
        heading: "Seated option",
        words: "Sit and rock gently from one sitting bone to the other if standing is not a good fit.",
      },
      {
        heading: "Close",
        words: "Come back to the middle. Sit and rest. Do not practice this without support if you are at risk of falling.",
      },
    ],
  },
  {
    id: "script-back",
    title: "Gentle back comfort",
    practiceMinutes: 5,
    cues: [
      {
        heading: "Open",
        words: "Thursday uses this short written practice. It is a script for later recording, not a video, and it is not treatment for back pain.",
      },
      {
        heading: "Sit tall",
        words: "Sturdy chair. Both feet on the floor. Sit in a way that feels easy, not stiff.",
      },
      {
        heading: "Shoulder blades",
        words: "Draw the shoulder blades gently back, then release. Six times.",
      },
      {
        heading: "Small turn",
        words: "One hand on the thigh. Turn the chest only as far as is comfortable, then come back. Three times each side.",
      },
      {
        heading: "Close",
        words: "Hands on the thighs. Four ordinary breaths. Stop for chest pain, dizziness, unusual shortness of breath, or significant pain.",
      },
    ],
  },
];

export function scriptById(id: string): RoutineScript | undefined {
  return routineScripts.find((script) => script.id === id);
}
