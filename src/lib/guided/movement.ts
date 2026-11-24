import { msg } from "@/lib/i18n/translate";
import { beatsOf, plannedSeconds } from "@/lib/guided/timeline";
import type { Cue, GuidedSession, GuidedStep } from "@/lib/guided/types";

/**
 * Voice-guided movement and breathing sessions, written for LifeZoi.
 * Gentle, general instructions for adults. They never ask anyone to hold the
 * breath, push through pain, or reach a number, and every session says to stop
 * if anything hurts. Timing is in the quiet `hold` after each cue.
 */

const c = (say: string, hold = 0): Cue => ({ say, hold });
const step = (title: string, cues: Cue[], rest = false): GuidedStep => (rest ? { title, cues, rest } : { title, cues });

// Shared lines, so they are translated once.
const REST = msg("Rest");
const AND_REST = msg("And rest. Let your breath settle.");
const KEEP_BREATHING = msg("Keep breathing comfortably.");
const AT_YOUR_PACE = msg("Continue at your own pace. Smaller movements are fine.");
const OTHER_SIDE = msg("Now the other side.");
const WELL_DONE = msg("Well done. Let's continue.");

export const MOVE_CARE = msg(
  "Move gently and stay within what feels comfortable. Stop if anything hurts, or if you feel dizzy, faint, or short of breath. If you have a health condition, an injury, are pregnant, or had recent surgery, check with a health professional first.",
);
export const BREATH_CARE = msg(
  "Breathe softly and never force or hold your breath. If you feel lightheaded or uncomfortable, stop and breathe normally.",
);
export const REST_CARE = msg(
  "Do not listen while driving or doing anything that needs your full attention. If a practice brings up difficult feelings, open your eyes and stop. You can come back another time.",
);

export const PILATES: GuidedSession = {
  id: "pilates-gentle",
  kind: "pilates",
  title: msg("Gentle Pilates on the mat"),
  summary: msg("Breathing, pelvic tilts, toe taps, bridges, and clams, lying on a mat at a calm pace."),
  minutes: 12,
  position: msg("On a mat"),
  care: MOVE_CARE,
  complete: msg("Wonderful job! You completed your Pilates session."),
  rateFactor: 1,
  parts: ["morning"],
  steps: [
    step(msg("Getting ready"), [
      c(msg("Welcome to your Pilates session. Let's begin."), 1),
      c(msg("Lie comfortably on your back on your mat. Bend your knees and place your feet flat on the floor, about hip width apart."), 5),
      c(msg("Rest your arms by your sides. Relax your shoulders away from your ears."), 3),
      c(msg("Let your lower back rest naturally. There is a small, soft curve under it. You do not need to press it flat."), 4),
    ]),
    step(msg("Breathing"), [
      c(msg("Place your hands on the sides of your lower ribs."), 2),
      c(msg("Take a slow breath in through your nose, and feel your ribs widen into your hands."), 4),
      c(msg("And slowly breathe out through your mouth. Feel the ribs soften."), 5),
      c(msg("Again. Breathe in, wide through the ribs."), 4),
      c(msg("Breathe out, and gently engage your abdominal muscles, as if you were drawing your belly button a little towards your spine."), 5),
      c(msg("Two more breaths like this, at your own pace."), 14),
      c(msg("Lovely. Rest your arms back by your sides."), 2),
    ]),
    step(msg("Pelvic tilts"), [
      c(msg("Now, pelvic tilts. Breathe in to prepare."), 3),
      c(msg("Breathe out, and gently tilt your pelvis so your lower back moves softly towards the mat."), 4),
      c(msg("Breathe in, and return to your natural curve."), 4),
      c(msg("Breathe out, tilt. Keep your shoulders and your neck relaxed."), 4),
      c(msg("Breathe in, and return."), 4),
      c(AT_YOUR_PACE), c(msg("Six more tilts, moving with your breath."), 40),
      c(AND_REST, 6),
    ]),
    step(msg("Toe taps"), [
      c(msg("Now, toe taps. Gently engage your abdominal muscles."), 2),
      c(msg("Breathe out, and lift one leg gently, until the knee is above your hip, with the knee bent."), 4),
      c(msg("Breathe in, and lower the foot slowly, until the toes touch the mat."), 4),
      c(msg("Keep your movements controlled. Your back stays still and your shoulders stay soft."), 3),
      c(msg("Lift the other leg. And lower."), 6),
      c(msg("Keep alternating, one leg, then the other. Eight on each side, or fewer."), 50),
      c(msg("Excellent! Both feet down. Let's continue."), 6),
    ]),
    step(REST, [c(AND_REST, 10)], true),
    step(msg("Bridge"), [
      c(msg("Now, the bridge. Feet flat, hip width apart, arms by your sides."), 2),
      c(msg("Breathe out, tilt the pelvis, and slowly lift your hips off the mat, only as high as is comfortable."), 5),
      c(msg("Breathe in at the top. Keep your weight on your shoulders, not on your neck."), 4),
      c(msg("Breathe out, and slowly lower your back to the mat, one part at a time."), 6),
      c(msg("Again. Breathe out, and lift."), 5),
      c(msg("Breathe in. And breathe out, lowering slowly."), 6),
      c(AT_YOUR_PACE), c(msg("Four more bridges."), 42),
      c(AND_REST, 6),
    ]),
    step(msg("Heel slides"), [
      c(msg("Now, heel slides. Breathe out, and slowly slide one heel along the mat, straightening the leg."), 5),
      c(msg("Breathe in, and slide it back."), 4),
      c(msg("Other leg. Breathe out, slide. Breathe in, return."), 8),
      c(msg("Keep alternating, slow and smooth. Your hips stay level."), 36),
      c(WELL_DONE, 3),
    ]),
    step(msg("Clams"), [
      c(msg("Now, roll onto your side, with your knees bent and stacked. Rest your head on your arm or a cushion."), 6),
      c(msg("Keep your feet together. Breathe out, and lift your top knee, like a clam shell opening. Keep your hips still."), 4),
      c(msg("Breathe in, and lower the knee."), 4),
      c(msg("Continue for eight, or fewer. A small lift is enough."), 32),
      c(msg("Now roll gently onto your other side, with your knees bent."), 6),
      c(msg("Breathe out, open. Breathe in, close."), 6),
      c(msg("Continue for eight, at your own pace."), 32),
      c(msg("Roll slowly onto your back again."), 5),
    ]),
    step(msg("Closing"), [
      c(msg("Hug your knees gently towards your chest, and rock a little from side to side, if that feels good."), 12),
      c(msg("Place your feet back on the mat. Take a slow breath in, and a long breath out."), 8),
      c(msg("Before you get up, roll onto your side, and use your hands to push yourself up slowly."), 4),
    ]),
  ],
};

export const MORNING_YOGA: GuidedSession = {
  id: "yoga-morning",
  kind: "yoga",
  title: msg("Morning yoga"),
  summary: msg("A gentle wake-up: breathing, neck and shoulder movement, cat and cow, a standing reach, and side bends."),
  minutes: 8,
  position: msg("On a mat, then standing"),
  care: MOVE_CARE,
  complete: msg("Lovely work. You have started your day by taking care of yourself."),
  rateFactor: 1,
  parts: ["morning"],
  steps: [
    step(msg("Arrive"), [
      c(msg("Good morning, and welcome to your morning yoga. Let's begin."), 1),
      c(msg("Sit comfortably on your mat, with your legs crossed, or on a chair with your feet on the floor."), 4),
      c(msg("Sit tall, and let your hands rest on your knees."), 3),
      c(msg("Breathe in slowly through your nose. And breathe out, letting your shoulders drop."), 6),
      c(msg("Two more slow breaths, waking up gently."), 12),
    ]),
    step(msg("Neck and shoulders"), [
      c(msg("Slowly tip your right ear towards your right shoulder. Only go as far as is comfortable."), 8),
      c(msg("Bring your head back to the middle. And tip the left ear towards the left shoulder."), 8),
      c(msg("Back to the middle. Now roll your shoulders up, back, and down, slowly."), 4),
      c(msg("Keep rolling your shoulders, five more times."), 14),
      c(KEEP_BREATHING, 2),
    ]),
    step(msg("Cat and cow"), [
      c(msg("Come onto your hands and knees. Hands under your shoulders, knees under your hips. Use a folded blanket under your knees if you like."), 6),
      c(msg("Breathe in, let your belly soften towards the floor, and look slightly forward. This is cow."), 4),
      c(msg("Breathe out, round your back towards the ceiling, and let your head drop. This is cat."), 4),
      c(msg("Breathe in, cow. Breathe out, cat."), 8),
      c(msg("Continue moving with your breath, slowly, for a few more rounds."), 24),
      c(msg("Come back to a flat back."), 2),
    ]),
    step(msg("Child's pose"), [
      c(msg("Sit your hips back towards your heels, and rest your chest towards your thighs, arms forward or by your sides. This is child's pose."), 6),
      c(msg("If your knees do not like this, stay on your hands and knees, or sit back on a chair instead."), 4),
      c(msg("Breathe slowly into your back. Let it widen with each breath in."), 20),
    ], true),
    step(msg("Standing reach"), [
      c(msg("When you are ready, come up slowly and stand, with your feet hip width apart. Take your time."), 8),
      c(msg("Breathe in, and raise your arms out to the sides and up, as high as is comfortable."), 4),
      c(msg("Breathe out, and lower them slowly."), 4),
      c(msg("Breathe in, reach up. Breathe out, lower."), 8),
      c(msg("Three more, moving with your breath."), 20),
    ]),
    step(msg("Side bends"), [
      c(msg("Raise your right arm, and lean gently to the left. Feel the stretch along your right side."), 8),
      c(msg("Breathe in, and come back to the middle."), 3),
      c(msg("Raise your left arm, and lean gently to the right."), 8),
      c(msg("And back to the middle. Lower your arm."), 3),
      c(msg("Once more on each side, slowly."), 18),
    ]),
    step(msg("Closing"), [
      c(msg("Stand tall, with your arms relaxed. Feel your feet on the floor."), 4),
      c(msg("Take a slow breath in. And a long, easy breath out."), 8),
      c(msg("Notice how your body feels now."), 6),
    ]),
  ],
};

export const GENTLE_YOGA: GuidedSession = {
  id: "yoga-gentle",
  kind: "yoga",
  title: msg("Gentle yoga"),
  summary: msg("Slow, supported poses on the mat: knees to chest, a soft twist, a bridge, and a resting pose."),
  minutes: 10,
  position: msg("Lying on a mat"),
  care: MOVE_CARE,
  complete: msg("Take a moment to appreciate yourself. You made time for your well-being today."),
  rateFactor: 0.95,
  parts: ["afternoon", "evening"],
  steps: [
    step(msg("Settle"), [
      c(msg("Welcome to your gentle yoga practice. There is no rush today."), 1),
      c(msg("Lie on your back, with your knees bent and your feet flat on the mat. Rest your arms by your sides, palms facing up."), 6),
      c(msg("Close your eyes, if you like. Breathe in slowly through your nose. And breathe out slowly."), 8),
      c(msg("With each breath out, let your body feel a little heavier on the mat."), 20),
    ]),
    step(msg("Knees to chest"), [
      c(msg("Bring one knee towards your chest, and hold it gently with your hands, behind the thigh or on the shin."), 6),
      c(msg("Breathe slowly here. Keep the other foot on the mat."), 14),
      c(msg("Lower the foot. And bring the other knee in."), 4),
      c(msg("Breathe slowly. There is nothing to force."), 14),
      c(msg("Now, if it feels good, bring both knees in, and rock a little from side to side."), 16),
      c(msg("Place both feet back on the mat."), 3),
    ]),
    step(msg("Supine twist"), [
      c(msg("Stretch your arms out to the sides, at shoulder height."), 3),
      c(msg("Breathe out, and slowly lower both knees to the right, only as far as is comfortable. Turn your head gently to the left, if your neck likes it."), 8),
      c(msg("Breathe softly. Let gravity do the work."), 20),
      c(msg("Breathe in, and bring your knees back to the middle."), 4),
      c(msg("Breathe out, and lower your knees to the left. Turn your head gently to the right."), 8),
      c(msg("Stay here, breathing slowly."), 20),
      c(msg("And bring your knees back to the middle."), 4),
    ]),
    step(msg("Gentle bridge"), [
      c(msg("Feet flat and hip width apart. Breathe out, and slowly lift your hips, a little or a lot."), 6),
      c(msg("Breathe in at the top. Breathe out, and lower slowly."), 8),
      c(msg("Three more slow bridges, moving with your breath."), 30),
      c(AND_REST, 8),
    ]),
    step(msg("Legs up"), [
      c(msg("Slide one leg long on the mat, and raise the other leg towards the ceiling, with the knee as bent as you need. You can hold behind the thigh."), 8),
      c(msg("Breathe slowly. Feel a gentle stretch at the back of the leg, never a pull."), 18),
      c(msg("Bend the knee and lower the foot. Now the other leg."), 8),
      c(msg("Breathe slowly here."), 18),
      c(msg("Lower the foot back to the mat."), 3),
    ]),
    step(msg("Resting pose"), [
      c(msg("Now let both legs stretch out long, or keep your knees bent with a cushion under them. Let your arms rest a little away from your body."), 6),
      c(msg("Let your whole body rest. Your only job now is to breathe."), 40),
      c(msg("Notice the floor supporting you. Notice your breath, slow and easy."), 45),
    ], true),
    step(msg("Closing"), [
      c(msg("Begin to move your fingers and toes."), 5),
      c(msg("Take a deeper breath in. And let it go."), 6),
      c(msg("When you are ready, roll onto your side, and push yourself up slowly with your hands."), 6),
    ]),
  ],
};

export const STRETCHING: GuidedSession = {
  id: "stretch-full-body",
  kind: "stretching",
  title: msg("Full-body stretch"),
  summary: msg("Easy standing and seated stretches for the neck, shoulders, chest, sides, hips, and legs."),
  minutes: 7,
  position: msg("Standing, with a chair nearby"),
  care: MOVE_CARE,
  complete: msg("Well done. Your body thanks you for that stretch."),
  rateFactor: 1,
  parts: ["afternoon", "evening"],
  steps: [
    step(msg("Getting ready"), [
      c(msg("Welcome to your stretching session. Stand tall, with a sturdy chair nearby for support."), 3),
      c(msg("Stretch only to a point of gentle tension, never pain. Breathe slowly through every stretch."), 3),
    ]),
    step(msg("Neck"), [
      c(msg("Slowly turn your head to look over your right shoulder."), 6),
      c(msg("Back to the middle. And look over your left shoulder."), 6),
      c(msg("Back to the middle. Gently bring your chin towards your chest, and feel the back of your neck lengthen."), 10),
      c(msg("Slowly lift your head again."), 2),
    ]),
    step(msg("Shoulders and chest"), [
      c(msg("Bring your right arm across your chest, and hold it gently with your left hand, above the elbow."), 14),
      c(OTHER_SIDE), c(msg("Left arm across the chest."), 14),
      c(msg("Now clasp your hands behind your back, or hold a towel, and gently open your chest. Keep your shoulders down."), 14),
      c(AND_REST, 3),
    ]),
    step(msg("Side stretch"), [
      c(msg("Raise your right arm, and lean gently to the left. Keep both feet planted."), 12),
      c(msg("Back to the middle. Raise your left arm, and lean gently to the right."), 12),
      c(msg("And back to the middle."), 2),
    ]),
    step(msg("Calves"), [
      c(msg("Hold the back of the chair. Step your right foot back, keeping the heel down and the leg straight. Bend the front knee a little."), 16),
      c(OTHER_SIDE), c(msg("Step the left foot back, heel down."), 16),
    ]),
    step(msg("Thighs"), [
      c(msg("Still holding the chair, bend your right knee and bring your heel towards your bottom. Hold your ankle, or a towel around it, if you can. Keep your knees close."), 16),
      c(msg("Lower the foot. Now the left leg."), 16),
      c(msg("Lower the foot."), 2),
    ]),
    step(msg("Seated stretches"), [
      c(msg("Now sit down on the chair."), 4),
      c(msg("Stretch your right leg out in front, with the heel on the floor. Sit tall, and lean forward from your hips a little, until you feel the back of the leg."), 16),
      c(OTHER_SIDE), c(msg("Left leg out, heel down, lean forward a little."), 16),
      c(msg("Cross your right ankle over your left knee, if that is comfortable, and sit tall. Lean forward a little to feel the hip."), 16),
      c(OTHER_SIDE), c(msg("Left ankle over the right knee."), 16),
      c(msg("Both feet on the floor."), 2),
    ]),
    step(msg("Closing"), [
      c(msg("Rest your hands on your thighs. Take a slow breath in, and a long breath out."), 8),
      c(msg("Notice how your body feels after stretching."), 6),
    ]),
  ],
};

export const MOBILITY: GuidedSession = {
  id: "mobility-joints",
  kind: "mobility",
  title: msg("Joint mobility, seated"),
  summary: msg("Gentle circles and movements for every joint, from the neck to the ankles, all in a chair."),
  minutes: 5,
  position: msg("Sitting in a chair"),
  care: MOVE_CARE,
  complete: msg("Nicely done. Your joints have had a gentle wake-up."),
  rateFactor: 1,
  parts: ["morning", "afternoon"],
  steps: [
    step(msg("Getting ready"), [
      c(msg("Welcome to your mobility session. Sit towards the front of a sturdy chair, with your feet flat on the floor."), 3),
      c(msg("Every movement today is small and smooth. Move only in a range that feels easy."), 3),
    ]),
    step(msg("Neck"), [
      c(msg("Slowly nod your head, as if saying yes, a few times."), 8),
      c(msg("Now slowly turn your head from side to side, as if saying no."), 10),
    ]),
    step(msg("Shoulders"), [
      c(msg("Roll your shoulders forward in slow circles."), 10),
      c(msg("And now backwards."), 10),
      c(msg("Lift your shoulders towards your ears, and let them drop. Three times."), 10),
    ]),
    step(msg("Arms and wrists"), [
      c(msg("Bend and straighten your elbows, as if lifting something light."), 10),
      c(msg("Now circle your wrists one way."), 8),
      c(msg("And the other way. Then open and close your hands."), 10),
    ]),
    step(msg("Spine"), [
      c(msg("Hands on your thighs. Gently round your back, and then sit tall again."), 4),
      c(msg("Continue, slowly rounding and lifting."), 14),
      c(msg("Now turn your upper body a little to the right, and back to the middle. Then a little to the left."), 14),
    ]),
    step(msg("Hips and knees"), [
      c(msg("March slowly in your chair, lifting one knee, then the other."), 16),
      c(msg("Now straighten one knee, then lower the foot. Then the other leg."), 16),
    ]),
    step(msg("Ankles"), [
      c(msg("Lift your toes, then lift your heels, rocking your feet slowly."), 12),
      c(msg("Now lift one foot a little and circle the ankle. Then the other foot."), 16),
    ]),
    step(msg("Closing"), [
      c(msg("Both feet on the floor. Take a slow breath in, and a long breath out."), 6),
      c(msg("Notice any warmth or ease in your joints."), 4),
    ]),
  ],
};

export const BREATHING: GuidedSession = {
  id: "breathing-calm",
  kind: "breathing",
  title: msg("Calm breathing"),
  summary: msg("Belly breathing, then a slow pace with a longer breath out. Sitting or lying down."),
  minutes: 5,
  position: msg("Sitting or lying down"),
  care: BREATH_CARE,
  complete: msg("Well done. Take a moment before you get up."),
  rateFactor: 0.9,
  parts: ["afternoon", "evening"],
  steps: [
    step(msg("Arrive"), [
      c(msg("Welcome to your breathing exercise. Sit comfortably, or lie down."), 2),
      c(msg("Place one hand on your chest and one hand on your belly."), 3),
      c(msg("Breathe normally for a moment, and simply notice your breath."), 10),
    ]),
    step(msg("Belly breathing"), [
      c(msg("Now breathe in slowly through your nose, and let your belly rise into your hand."), 3),
      c(msg("Breathe out gently, and feel your belly fall."), 4),
      c(msg("Breathe in, belly rises."), 3),
      c(msg("Breathe out, belly falls. The hand on your chest stays fairly still."), 4),
      c(msg("Continue like this, slow and soft."), 24),
    ]),
    step(msg("A longer breath out"), [
      c(msg("Now we will make the breath out a little longer than the breath in. Breathe in, two, three, four."), 1),
      c(msg("Breathe out, two, three, four, five, six."), 1),
      c(msg("Breathe in, two, three, four."), 1),
      c(msg("Breathe out, two, three, four, five, six."), 1),
      c(msg("Breathe in, two, three, four."), 1),
      c(msg("Breathe out, two, three, four, five, six."), 1),
      c(msg("Continue at this pace by yourself. If the count feels long, make it shorter."), 50),
      c(msg("Breathe in. And a long breath out."), 6),
      c(msg("Keep going at your own pace."), 40),
    ]),
    step(msg("Closing"), [
      c(msg("Now let your breath return to normal."), 10),
      c(msg("Notice how you feel."), 6),
    ]),
  ],
};

export const RELAXATION: GuidedSession = {
  id: "relax-muscles",
  kind: "relaxation",
  title: msg("Progressive muscle relaxation"),
  summary: msg("Gently tense and release one area of the body at a time, from the feet to the face."),
  minutes: 8,
  position: msg("Sitting or lying down"),
  care: msg(
    "Tense each area only gently, never to the point of pain or cramp. Skip any area that is sore or injured. Do not listen while driving or doing anything that needs your full attention.",
  ),
  complete: msg("Take a moment to appreciate yourself. You made time for your well-being today."),
  rateFactor: 0.9,
  parts: ["evening"],
  steps: [
    step(msg("Settle"), [
      c(msg("Welcome to your relaxation session. Sit comfortably, or lie down, and let your body be supported."), 3),
      c(msg("Close your eyes, if you like. Take a slow breath in. And a long breath out."), 8),
      c(msg("We will gently tense each part of the body for a few moments, and then let it go. Tense softly, never to the point of pain."), 4),
    ]),
    step(msg("Feet and legs"), [
      c(msg("Curl your toes and tense your feet gently."), 5),
      c(msg("And let go. Feel the feet soften."), 12),
      c(msg("Now tense the muscles of your lower legs and thighs, pressing your legs gently down."), 5),
      c(msg("And release. Let your legs feel heavy and warm."), 14),
    ]),
    step(msg("Hands and arms"), [
      c(msg("Make soft fists with your hands, and tense your arms a little."), 5),
      c(msg("And let go. Let your fingers uncurl."), 12),
      c(msg("Notice the difference between tension and release."), 10),
    ]),
    step(msg("Belly and back"), [
      c(msg("Gently tighten your belly muscles."), 5),
      c(msg("And release. Let your breath move freely."), 14),
      c(msg("Press your shoulder blades gently towards each other."), 5),
      c(msg("And let go. Feel your back widen."), 14),
    ]),
    step(msg("Shoulders"), [
      c(msg("Lift your shoulders up towards your ears, and hold them there gently."), 5),
      c(msg("And let them drop. Feel the weight leave your shoulders."), 16),
    ]),
    step(msg("Face"), [
      c(msg("Scrunch your face gently: squeeze your eyes, and wrinkle your nose."), 5),
      c(msg("And let go. Let your forehead be smooth, and your jaw loose."), 14),
      c(msg("Let your tongue rest, and your lips part a little."), 10),
    ]),
    step(msg("Whole body"), [
      c(msg("Now feel your whole body, from your feet to the top of your head, soft and relaxed."), 20),
      c(msg("If you notice any tension left anywhere, breathe into it, and let it go on the breath out."), 40),
      c(msg("Rest here. You don't need to do anything right now. Just breathe."), 60),
    ], true),
    step(msg("Closing"), [
      c(msg("Slowly begin to move your fingers and toes."), 6),
      c(msg("Take a deeper breath in. And let it go."), 6),
      c(msg("When you are ready, open your eyes. Take your time before you get up."), 4),
    ]),
  ],
};

/** Holds of this length or longer are the person's own time to move or rest, and are stretched to fit. */
const FLEX_HOLD = 6;

/**
 * Stretches (or shortens) the longer quiet holds so the session's planned
 * length matches its minutes at the default speaking speed. Short gaps and the
 * spoken words stay as written.
 */
export function fitToMinutes(session: GuidedSession): GuidedSession {
  const rate = 0.95 * session.rateFactor;
  const beats = beatsOf(session);
  const flex = beats.reduce((sum, beat) => sum + (beat.hold >= FLEX_HOLD ? beat.hold : 0), 0);
  const fixed = plannedSeconds(beats, rate) - flex;
  if (flex <= 0) return session;
  const scale = Math.min(2.5, Math.max(0.5, (session.minutes * 60 - fixed) / flex));
  return {
    ...session,
    steps: session.steps.map((item) => ({
      ...item,
      cues: item.cues.map((cue) => (cue.hold >= FLEX_HOLD ? { ...cue, hold: Math.min(120, Math.round(cue.hold * scale)) } : cue)),
    })),
  };
}

export const MOVEMENT_SESSIONS: GuidedSession[] = [PILATES, MORNING_YOGA, GENTLE_YOGA, STRETCHING, MOBILITY, BREATHING, RELAXATION].map(fitToMinutes);
