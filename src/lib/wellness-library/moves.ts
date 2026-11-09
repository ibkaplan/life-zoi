/**
 * Original LifeZoi move descriptions used to build guided sessions.
 * Written for this app; they are general exercise cues, not treatment.
 */

export const LIBRARY_CATEGORIES = [
  "pilates",
  "yoga",
  "aerobics",
  "dance",
  "home-cardio",
  "strength",
  "chair",
  "stretching",
  "tai-chi",
  "qigong",
  "balance",
  "breathing",
  "brain-training",
  "meditation",
] as const;
export type LibraryCategory = (typeof LIBRARY_CATEGORIES)[number];

export const CATEGORY_INFO: Record<LibraryCategory, { title: string; summary: string }> = {
  pilates: { title: "Pilates", summary: "Slow, controlled moves for core strength, posture, and steady breathing." },
  yoga: { title: "Yoga", summary: "Gentle postures and breathing for flexibility and calm." },
  aerobics: { title: "Aerobics", summary: "Rhythmic moves that raise your heart rate. Low-impact versions keep one foot on the floor." },
  dance: { title: "Dance Fitness", summary: "Simple steps to music. Move in your own style." },
  "home-cardio": { title: "Home Cardio", summary: "Indoor moves to warm you up and get your heart working, without equipment." },
  strength: { title: "Strength Training", summary: "Body-weight and light-weight moves for muscles and bones." },
  chair: { title: "Chair Exercises", summary: "Everything done seated or holding a sturdy chair." },
  stretching: { title: "Stretching", summary: "Easy stretches to loosen stiff muscles and joints." },
  "tai-chi": { title: "Tai Chi", summary: "Flowing, slow movements with weight shifts. Good for balance and calm." },
  qigong: { title: "Qigong", summary: "Gentle standing or seated movements paired with slow breathing." },
  balance: { title: "Balance Training", summary: "Short balance practice with a chair or counter for support." },
  breathing: { title: "Breathing and Relaxation", summary: "Paced breathing and muscle relaxation to settle the body." },
  "brain-training": { title: "Brain Training", summary: "Puzzles and games for enjoyment and focus. Not a medical test." },
  meditation: { title: "Meditation", summary: "Quiet guided attention practices." },
};

export type Position = "seated" | "standing" | "floor";
export type Intensity = "very-light" | "light" | "moderate" | "vigorous";

export type Move = {
  id: string;
  name: string;
  cue: string;
  position: Position;
  /** Feet leave the floor, or a fast jump. Never offered with a joint limit. */
  highImpact: boolean;
  /** Kneeling or deep knee bending. */
  kneeLoad: boolean;
  intensity: Intensity;
  /** A gentler way to do it. */
  easier: string;
  /** Minimum level. */
  level: 0 | 1 | 2;
};

function m(
  id: string,
  name: string,
  cue: string,
  options: Partial<Pick<Move, "position" | "highImpact" | "kneeLoad" | "intensity" | "level">> & { easier?: string } = {},
): Move {
  return {
    id,
    name,
    cue,
    position: options.position ?? "standing",
    highImpact: options.highImpact ?? false,
    kneeLoad: options.kneeLoad ?? false,
    intensity: options.intensity ?? "light",
    easier: options.easier ?? "Make the movement smaller and slower.",
    level: options.level ?? 0,
  };
}

const WARM = [
  m("warm-march", "Gentle march", "March on the spot, swinging your arms easily. Breathe normally.", { easier: "March while sitting in a chair." }),
  m("warm-shoulders", "Shoulder rolls", "Roll your shoulders slowly backward five times, then forward five times.", { easier: "Do this seated." }),
  m("warm-reach", "Side reaches", "Reach one arm up and over to the side, then the other.", { easier: "Reach only to shoulder height." }),
];

const COOL = [
  m("cool-breathe", "Slow breathing", "Breathe in through your nose for four counts, out for six. Let your shoulders drop.", { intensity: "very-light", position: "seated", easier: "Breathe at any slow pace that feels easy." }),
  m("cool-calf", "Calf stretch", "Hold a chair. Step one foot back, heel down, and feel a gentle stretch in the calf. Switch sides.", { intensity: "very-light", easier: "Point and flex your feet while seated." }),
  m("cool-neck", "Neck release", "Tilt your ear toward one shoulder, hold for a few breaths, then switch.", { intensity: "very-light", position: "seated", easier: "Look slowly left and right instead." }),
];

export const MOVES: Record<LibraryCategory, Move[]> = {
  pilates: [
    m("pil-breath", "Pilates breathing", "Sit or lie comfortably. Breathe into the sides of your ribs, then breathe out and gently draw your belly in.", { position: "seated", intensity: "very-light" }),
    m("pil-pelvic-tilt", "Pelvic tilts", "Lie on your back, knees bent. Gently flatten your lower back, then return. Keep it small.", { position: "floor", easier: "Do the tilt sitting tall on a chair." }),
    m("pil-bridge", "Bridge", "Lying with knees bent, press through your heels and lift your hips a little. Lower slowly.", { position: "floor", intensity: "moderate", easier: "Lift only a few centimeters." }),
    m("pil-knee-fold", "Knee folds", "Lying down, lift one bent knee toward you, lower it, then the other. Keep your back steady.", { position: "floor" }),
    m("pil-standing-roll", "Standing roll-down", "Stand tall, soften your knees, and slowly curl your head and shoulders down a little. Roll back up.", { easier: "Only nod the chin to the chest." }),
    m("pil-seated-twist", "Seated twist", "Sit tall, cross your arms, and turn your upper body gently to one side, then the other.", { position: "seated" }),
    m("pil-chair-leg-lift", "Chair leg lifts", "Sit tall. Straighten one knee and hold for three breaths. Lower and switch.", { position: "seated" }),
    m("pil-side-leg", "Side-lying leg lift", "Lie on your side, knees soft. Lift the top leg a little and lower with control.", { position: "floor", level: 1 }),
    m("pil-hundred-prep", "Hundred preparation", "Lying on your back, knees bent, lift your head slightly and pulse your arms by your sides for ten breaths.", { position: "floor", intensity: "moderate", level: 1, easier: "Keep your head down and only pulse the arms." }),
    m("pil-plank", "Forearm plank", "On forearms and knees, hold a straight line from head to knees for a few breaths.", { position: "floor", intensity: "moderate", kneeLoad: true, level: 2, easier: "Press your hands into a wall at a slant instead." }),
    m("pil-swimming", "Swimming", "Lying face down, lift the opposite arm and leg a little. Switch slowly.", { position: "floor", intensity: "moderate", level: 2 }),
  ],
  yoga: [
    m("yoga-mountain", "Mountain pose", "Stand tall, feet hip-width, arms by your sides. Breathe slowly.", { intensity: "very-light", easier: "Sit tall instead." }),
    m("yoga-tree", "Supported tree", "Hold a chair. Rest one foot on the other ankle and hold for a few breaths. Switch.", { easier: "Keep both feet on the floor and shift your weight." }),
    m("yoga-cat-cow-seated", "Seated cat and cow", "Sitting, round your back as you breathe out, then lift your chest as you breathe in.", { position: "seated" }),
    m("yoga-warrior", "Warrior two", "Step your feet wide, turn one foot out, bend that knee a little, and reach your arms wide.", { intensity: "moderate", kneeLoad: true, level: 1, easier: "Keep the knee almost straight and hold a chair." }),
    m("yoga-child", "Child's pose", "Kneel and fold forward to rest your chest toward your thighs.", { position: "floor", intensity: "very-light", kneeLoad: true, easier: "Sit and fold forward over a pillow on your lap." }),
    m("yoga-forward-fold", "Chair forward fold", "Sitting, let your upper body fold forward slowly over your thighs. Breathe.", { position: "seated", intensity: "very-light" }),
    m("yoga-down-dog", "Wall downward dog", "Hands on a wall, walk back until your back is long and flat. Hold for a few breaths.", { level: 1 }),
    m("yoga-chair-pose", "Chair pose", "Feet together, bend the knees and sit back a little as if toward a chair. Arms up.", { intensity: "moderate", kneeLoad: true, level: 2, easier: "Do a small sit-to-stand from a chair instead." }),
  ],
  aerobics: [
    m("aer-step-touch", "Step touch", "Step to the side, bring the other foot in. Add arm swings.", { intensity: "moderate", easier: "Tap your feet side to side while seated." }),
    m("aer-heel-dig", "Heel digs", "Tap one heel forward, then the other, with arms pushing forward.", { intensity: "moderate" }),
    m("aer-knee-lift", "Knee lifts", "Lift one knee, then the other, at a steady pace.", { intensity: "moderate", easier: "Lift the knee only a little, or march seated." }),
    m("aer-grapevine", "Grapevine", "Step to the side, cross behind, step to the side, and tap. Go back the other way.", { intensity: "moderate", level: 1, easier: "Do step touches instead." }),
    m("aer-box-step", "Box step", "Step forward right, forward left, back right, back left, in a square.", { intensity: "moderate" }),
    m("aer-jacks", "Jumping jacks", "Jump your feet out and in while lifting your arms.", { intensity: "vigorous", highImpact: true, level: 2, easier: "Step one foot out at a time with no jump." }),
    m("aer-skip", "Skips on the spot", "Light skips on the balls of your feet.", { intensity: "vigorous", highImpact: true, level: 2, easier: "Fast marching instead." }),
  ],
  dance: [
    m("dance-sway", "Sway and clap", "Sway side to side to the beat and clap on every second step.", { intensity: "light", easier: "Sway and clap while seated." }),
    m("dance-cha", "Cha-cha step", "Step forward, back, then three small steps in place.", { intensity: "moderate", level: 1 }),
    m("dance-arm-wave", "Arm waves", "Make big slow waves with your arms in time with the music.", { position: "seated", intensity: "light" }),
    m("dance-twist", "Gentle twist", "Turn your heels and hips side to side with soft knees.", { intensity: "moderate", kneeLoad: false, easier: "Twist only the upper body." }),
    m("dance-freestyle", "Freestyle", "Move any way you enjoy to the music for one song.", { intensity: "moderate" }),
    m("dance-hop", "Hop and turn", "Small hops with a quarter turn each time.", { intensity: "vigorous", highImpact: true, level: 2, easier: "Step and turn without hopping." }),
  ],
  "home-cardio": [
    m("hc-march-fast", "Fast march", "March quickly on the spot with strong arm swings.", { intensity: "moderate", easier: "March seated." }),
    m("hc-shadow-box", "Shadow boxing", "Punch gently forward with alternate arms. Keep your knees soft.", { intensity: "moderate", position: "standing", easier: "Punch while seated." }),
    m("hc-stair", "Stair steps", "Step up and down on the bottom stair, holding the rail.", { intensity: "moderate", kneeLoad: true, level: 1, easier: "March in place instead." }),
    m("hc-side-step", "Side steps", "Two steps to the right, two steps to the left.", { intensity: "moderate" }),
    m("hc-squat-reach", "Squat and reach", "Bend the knees a little, then stand and reach up.", { intensity: "moderate", kneeLoad: true, level: 1, easier: "Sit-to-stand from a chair." }),
    m("hc-high-knees", "High knees", "Run on the spot lifting your knees high.", { intensity: "vigorous", highImpact: true, level: 2, easier: "Fast march." }),
    m("hc-burpee-step", "Step-back burpee", "Hands on a sturdy table, step back one foot at a time, then return and stand.", { intensity: "vigorous", level: 2 }),
  ],
  strength: [
    m("str-sit-stand", "Sit to stand", "From a sturdy chair, stand up and sit down slowly, using your hands if you need.", { intensity: "moderate", kneeLoad: true, easier: "Use a higher chair or push with your hands." }),
    m("str-wall-push", "Wall push-ups", "Hands on a wall at shoulder height, bend your elbows to bring your chest closer, then push back.", { intensity: "moderate" }),
    m("str-heel-raise", "Heel raises", "Hold a chair. Rise onto your toes, then lower slowly.", { intensity: "light" }),
    m("str-bicep", "Arm curls", "Holding two water bottles or cans, bend your elbows to lift them, then lower.", { position: "seated", intensity: "light" }),
    m("str-overhead", "Overhead press", "Lift light weights or bottles from shoulders to overhead and back.", { position: "seated", intensity: "moderate", easier: "Lift to shoulder height only." }),
    m("str-side-leg", "Side leg raise", "Hold a chair, lift one straight leg out to the side and lower. Switch.", { intensity: "light" }),
    m("str-lunge", "Supported split squat", "Hold a chair, one foot back, bend both knees a little and rise.", { intensity: "vigorous", kneeLoad: true, level: 2, easier: "Do sit to stand instead." }),
    m("str-row", "Bent-over row", "Hand on a table, pull a bottle or light weight toward your hip, then lower.", { intensity: "moderate", level: 1 }),
  ],
  chair: [
    m("ch-march", "Seated march", "Sit tall and lift your knees one at a time, swinging your arms.", { position: "seated", intensity: "light" }),
    m("ch-arm-raise", "Arm raises", "Raise both arms forward to shoulder height, then lower.", { position: "seated" }),
    m("ch-knee-extend", "Knee extensions", "Straighten one knee, hold, then lower. Switch.", { position: "seated" }),
    m("ch-toe-tap", "Toe taps", "Tap your toes forward and back, alternating feet.", { position: "seated" }),
    m("ch-punch", "Seated punches", "Punch gently forward, alternating arms, for a steady rhythm.", { position: "seated", intensity: "moderate" }),
    m("ch-twist", "Seated twist", "Hands on your knees, turn your upper body gently to each side.", { position: "seated" }),
    m("ch-ankle", "Ankle circles", "Lift one foot a little and draw circles with your ankle. Switch.", { position: "seated", intensity: "very-light" }),
    m("ch-squeeze", "Shoulder blade squeeze", "Squeeze your shoulder blades together, hold, then relax.", { position: "seated" }),
  ],
  stretching: [
    m("st-hamstring", "Seated hamstring stretch", "Sit near the chair edge, one leg straight, heel down. Lean forward a little with a straight back.", { position: "seated", intensity: "very-light" }),
    m("st-chest", "Chest opener", "Clasp your hands behind you or hold the chair and open your chest gently.", { position: "seated", intensity: "very-light" }),
    m("st-side", "Side stretch", "Reach one arm overhead and lean gently to the other side.", { intensity: "very-light" }),
    m("st-quad", "Supported thigh stretch", "Hold a chair, bend one knee and hold your ankle or trousers behind you.", { intensity: "very-light", kneeLoad: true, level: 1, easier: "Slide one foot back under the chair while seated." }),
    m("st-hip", "Seated hip stretch", "Rest one ankle on the other knee if comfortable and lean forward slightly.", { position: "seated", intensity: "very-light", easier: "Keep both feet down and open the knees a little." }),
    m("st-upper-back", "Upper back stretch", "Reach your arms forward and round your upper back like hugging a ball.", { position: "seated", intensity: "very-light" }),
  ],
  "tai-chi": [
    m("tc-commence", "Commencement", "Feet shoulder-width, raise your arms slowly to shoulder height as you breathe in, lower as you breathe out.", { intensity: "very-light", easier: "Do this seated." }),
    m("tc-shift", "Weight shifts", "Shift your weight slowly from one foot to the other, knees soft.", { intensity: "light" }),
    m("tc-cloud", "Cloud hands", "Turn your waist slowly, letting your hands float across your body like clouds.", { intensity: "light", easier: "Seated, move only the arms." }),
    m("tc-push", "Push", "Step forward slightly and push your palms forward slowly, then draw back.", { intensity: "light", level: 1 }),
    m("tc-stork", "Supported stork", "Hold a chair and lift one heel, then the knee a little. Lower slowly.", { intensity: "light", level: 1, easier: "Lift only the heel." }),
  ],
  qigong: [
    m("qg-lift-sky", "Lift the sky", "Breathe in as you raise your palms overhead, breathe out as you lower them.", { intensity: "very-light", easier: "Raise to shoulder height." }),
    m("qg-shake", "Gentle shaking", "Let your arms and body shake loosely for a minute.", { intensity: "light" }),
    m("qg-ball", "Holding the ball", "Hold your hands as if around a large ball in front of your chest. Breathe slowly.", { intensity: "very-light", position: "seated" }),
    m("qg-turn", "Turning the waist", "Let your arms swing loosely as you turn your waist side to side.", { intensity: "light" }),
    m("qg-tap", "Body tapping", "Tap gently down your arms, shoulders, and legs with loose hands.", { intensity: "very-light", position: "seated" }),
  ],
  balance: [
    m("bal-wide", "Supported stance", "Hold a counter, feet together, and stand tall for ten breaths.", { intensity: "very-light" }),
    m("bal-heel-toe", "Heel-to-toe stand", "Hold a counter and place one foot in front of the other, heel to toe. Hold, then switch.", { intensity: "light", level: 1 }),
    m("bal-one-leg", "Supported one-leg stand", "Hold a counter with both hands and lift one foot slightly. Hold, then switch.", { intensity: "light", level: 1, easier: "Lift only the heel." }),
    m("bal-side-walk", "Side walking", "Hold the counter and take small side steps along it.", { intensity: "light" }),
    m("bal-clock", "Clock reach", "Hold a counter with one hand and reach the other arm forward, to the side, and back like clock hands.", { intensity: "light", level: 1 }),
    m("bal-seated", "Seated weight shift", "Sitting tall, lean slowly to one side, the middle, and the other side.", { position: "seated", intensity: "very-light" }),
  ],
  breathing: [
    m("br-box", "Box breathing", "Breathe in for four, hold for four, out for four, hold for four.", { position: "seated", intensity: "very-light", easier: "Leave out the holds." }),
    m("br-46", "Longer out-breath", "Breathe in for four counts, out for six.", { position: "seated", intensity: "very-light" }),
    m("br-pmr", "Muscle relaxation", "Tense your hands for five seconds, then let go. Move up to arms, shoulders, face, legs.", { position: "seated", intensity: "very-light" }),
    m("br-belly", "Belly breathing", "One hand on your belly, breathe so the hand rises and falls.", { position: "seated", intensity: "very-light" }),
    m("br-sigh", "Gentle sigh", "Breathe in, then let the breath out with a soft sigh. Repeat.", { position: "seated", intensity: "very-light" }),
  ],
  "brain-training": [],
  meditation: [
    m("med-body-scan", "Body scan", "Notice each part of your body from feet to head without changing anything.", { position: "seated", intensity: "very-light" }),
    m("med-senses", "Five senses", "Notice five things you see, four you hear, three you can touch.", { position: "seated", intensity: "very-light" }),
    m("med-breath", "Counting breaths", "Count each out-breath up to ten, then start again. If you lose count, simply begin again.", { position: "seated", intensity: "very-light" }),
    m("med-kind", "Kind wishes", "Silently wish yourself, then someone you love, a calm and safe day.", { position: "seated", intensity: "very-light" }),
  ],
};

export const WARM_UP = WARM;
export const COOL_DOWN = COOL;
