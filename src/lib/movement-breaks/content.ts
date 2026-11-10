/**
 * Hydration, movement breaks, lymphatic health, and the calf muscle pump.
 *
 * All user-facing English for the feature lives here, in one structured object,
 * so it can be moved to translation keys when four-language support lands.
 * Physiology (how the body works) and suggestions (what to try) are kept apart.
 *
 * Safety rules for this copy:
 * - No fixed water amount for everyone, and no advice to drink extra water.
 * - No claim that water, breaks, or calf raises prevent blood clots or disease.
 * - No detox claims and no promise of more nitric oxide.
 * - Breathing is comfortable, never forced, and never held.
 * - Thirty minutes is a practical reminder, not a medical deadline.
 */

export type ReferenceId = "sedentary-physiology" | "lymph-physiology" | "lymph-biomechanics" | "calf-pump" | "ada-activity" | "breaks-glucose" | "break-frequency";

export type Reference = {
  id: ReferenceId;
  title: string;
  publisher: string;
  url: string;
  /** What LifeZoi uses this source for, in plain words. */
  usedFor: string;
  /**
   * true when the page was opened and read while this feature was written.
   * false when the source was listed by the product owner but could not be opened
   * from the build environment; its use here still needs a person to read it.
   */
  readDuringBuild: boolean;
};

export const REFERENCES: readonly Reference[] = [
  {
    id: "sedentary-physiology",
    title: "Pinto AJ et al. Physiology of sedentary behavior. Physiological Reviews, 2023.",
    publisher: "American Physiological Society (free copy in PubMed Central)",
    url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC10625842/",
    usedFor:
      "Leg muscle activity and leg blood flow are lower while sitting than while standing or walking. Reducing or interrupting sitting has improved after-meal glucose and insulin responses and lower-limb vascular function in short studies.",
    readDuringBuild: true,
  },
  {
    id: "lymph-physiology",
    title: "Physiology, Lymphatic System. StatPearls.",
    publisher: "National Library of Medicine bookshelf",
    url: "https://www.ncbi.nlm.nih.gov/books/NBK557833/",
    usedFor: "How the lymphatic system collects extra fluid from tissues and returns it to the bloodstream.",
    readDuringBuild: false,
  },
  {
    id: "lymph-biomechanics",
    title: "Lymphatic anatomy and biomechanics (PubMed 21486777).",
    publisher: "PubMed",
    url: "https://pubmed.ncbi.nlm.nih.gov/21486777/",
    usedFor: "How surrounding muscle movement and breathing help move lymph, alongside the lymph vessels' own contractions.",
    readDuringBuild: false,
  },
  {
    id: "calf-pump",
    title: "Venous blood pressure and the calf muscle pump. Advances in Physiology Education.",
    publisher: "American Physiological Society",
    url: "https://journals.physiology.org/doi/10.1152/advan.00182.2018",
    usedFor: "How calf muscle contractions and one-way vein valves help blood return from the legs to the heart.",
    readDuringBuild: false,
  },
  {
    id: "ada-activity",
    title: "Colberg SR et al. Physical Activity/Exercise and Diabetes: A Position Statement of the American Diabetes Association. Diabetes Care, 2016.",
    publisher: "American Diabetes Association (free copy in PubMed Central)",
    url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC6908414/",
    usedFor:
      "The statement advises interrupting prolonged sitting with light activity every 30 minutes for blood glucose benefits, at least in adults with type 2 diabetes. It also says the long-term effects are still being studied.",
    readDuringBuild: true,
  },
  {
    id: "breaks-glucose",
    title: "Systematic review of activity breaks and glucose metabolism (PubMed Central PMC6985064).",
    publisher: "PubMed Central",
    url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC6985064/",
    usedFor: "Short activity breaks during sitting and after-meal glucose and insulin.",
    readDuringBuild: false,
  },
  {
    id: "break-frequency",
    title: "Optimal frequency of interrupting prolonged sitting (PubMed 39630056).",
    publisher: "PubMed",
    url: "https://pubmed.ncbi.nlm.nih.gov/39630056/",
    usedFor: "How often to interrupt sitting. LifeZoi does not state an optimal frequency from this study.",
    readDuringBuild: false,
  },
];

export function referenceById(id: ReferenceId): Reference {
  return REFERENCES.find((item) => item.id === id) as Reference;
}

export type BodyTopic = {
  id: "circulation" | "lymph" | "blood-sugar" | "vessels" | "joints";
  title: string;
  /** Established physiology, in plain words. */
  body: string[];
  sources: ReferenceId[];
};

export const MB = {
  page: {
    kicker: "Movement · Daily Wellness",
    title: "Water, movement, and your circulation",
    lede: "Why short movement breaks matter, how your calves help your blood return to your heart, and a 2 to 3 minute break you can do at your desk or in your chair.",
  },
  water: {
    heading: "WATER + MOVEMENT = A HEALTHIER BODY",
    key: "Drinking enough water is important, but water alone cannot replace physical movement. Your muscles, breathing, heart, blood vessels, and lymphatic system all work together to support circulation and fluid balance.",
    points: [
      "Water supports normal hydration and fluid balance, even when you are sitting. Drinking still matters on a quiet day.",
      "Your blood travels through the cardiovascular system: the heart pumps it out through arteries, and veins bring it back.",
      "The lymphatic system collects extra fluid from your tissues and returns it to the bloodstream.",
      "When your muscles contract, they squeeze nearby lymph vessels and help move lymph along.",
      "The movements of breathing also help lymph flow.",
      "Walking and moving your legs help blood in your leg veins return to your heart.",
    ],
    notMore:
      "Extra water does not automatically increase lymph drainage. Drink an amount that suits your own needs, your activity, the weather, and your health. There is no single amount that is right for everyone, and drinking far more than you need is not helpful.",
    fluidCaution:
      "If you have heart failure, kidney disease, or a fluid limit from your healthcare professional, follow their instructions about how much to drink.",
  },
  diagram: {
    title: "Two systems that work together",
    caption:
      "The heart pumps blood out through arteries (red) and it returns through veins (blue). Lymph vessels (green) collect extra fluid from tissues and return it to the bloodstream near the heart. Muscles and breathing help both return paths.",
  },
  why: {
    heading: "WHY YOUR BODY NEEDS A MOVEMENT BREAK",
    key: "Your body was designed to move, not to remain seated for hours. Even if you drink enough water and eat healthy food, prolonged sitting keeps important muscle groups inactive.",
    intro:
      "When you sit for a long time, your leg muscles are barely working. Your calf muscles normally help push blood from your lower legs back toward your heart. When you remain seated, this muscle pump becomes less active.",
    topics: [
      {
        id: "circulation",
        title: "Your blood circulation",
        body: [
          "Your calf muscles help push blood upward through the veins toward your heart.",
          "When you walk, your leg muscles contract and help support venous blood return.",
        ],
        sources: ["calf-pump", "sedentary-physiology"],
      },
      {
        id: "lymph",
        title: "Your lymphatic system",
        body: [
          "Your lymphatic system helps collect excess fluid from body tissues and return it to the bloodstream.",
          "Muscle contractions and breathing movements help support lymph movement.",
        ],
        sources: ["lymph-physiology", "lymph-biomechanics"],
      },
      {
        id: "blood-sugar",
        title: "Your blood sugar",
        body: [
          "When you move, your muscles use glucose for energy.",
          "In research studies, short walking or light activity breaks during long periods of sitting improved blood glucose and insulin after meals. These were short studies, and long-term effects are still being studied.",
        ],
        sources: ["sedentary-physiology", "ada-activity", "breaks-glucose"],
      },
      {
        id: "vessels",
        title: "Your blood vessels",
        body: [
          "Sitting lowers the activity of your leg muscles and the blood flow through them.",
          "In laboratory studies, measures of blood vessel function in the legs changed during long, uninterrupted sitting, and breaking up sitting helped. This does not mean that sitting for 30 minutes causes disease.",
        ],
        sources: ["sedentary-physiology"],
      },
      {
        id: "joints",
        title: "Your back and joints",
        body: [
          "Staying in one position for too long can add to stiffness and discomfort.",
          "Changing position and moving regularly helps your body stay active and comfortable.",
        ],
        sources: [],
      },
    ] satisfies BodyTopic[],
  },
  calves: {
    heading: "YOUR CALVES: THE SECOND HEART",
    key: "The muscles in your lower legs play an important role in helping blood return from your legs to your heart.",
    points: [
      "When you walk, move your ankles, or rise onto your toes, your calf muscles tighten.",
      "As they tighten, they press on the veins that run through them and push blood upward, toward the heart.",
      "Small one-way valves inside the veins close behind the blood, so it does not fall back down.",
      "When the muscles relax, the veins fill again from below, ready for the next squeeze.",
      "This calf muscle pump is part of normal, everyday circulation in your legs.",
    ],
    nickname:
      "“Second heart” is a familiar nickname for the calves' role in returning blood. Your calves do not replace your heart. Your heart does the main pumping. The calves help the return trip from your legs.",
    labels: {
      relaxed: "Relaxed: the veins fill from below",
      squeeze: "Calf tightens: blood is pushed up, the valve below closes",
    },
  },
  rule: {
    heading: "EVERY 30 MINUTES – GET UP AND MOVE!",
    prompt: "HAVE YOU BEEN SITTING FOR 30 MINUTES? TIME TO MOVE!",
    explain:
      "Long periods of uninterrupted sitting reduce the activity of your leg muscles and can affect blood flow in your lower body. A short movement break helps reactivate your muscles.",
    notDeadline:
      "Thirty minutes is a practical reminder, not a medical deadline. Your body does not suddenly become unhealthy after 30 minutes. The goal is to avoid sitting continuously for hours.",
    suggestion: "Try a short 2 to 3 minute movement break about every 30 minutes.",
    walkBetter:
      "Walking, or gentle movement of your legs, is more useful than simply standing still. Choose walking and comfortable muscle movement whenever it is safe and practical.",
  },
  breathing: {
    heading: "Breathing and movement",
    intro:
      "Breathing is part of normal respiratory and lymphatic physiology: the gentle rise and fall of your chest and belly changes the pressure inside your body, which also helps lymph move. Pair breathing with your movement breaks.",
    practices: [
      { title: "Gentle nasal breathing", text: "Breathe in and out through your nose at a slow, easy pace. If your nose is blocked, breathe through your mouth." },
      { title: "Belly (diaphragmatic) breathing", text: "Rest one hand on your belly. Let it rise as you breathe in and fall as you breathe out. Keep your shoulders soft." },
      { title: "Bhramari humming", text: "Breathe in comfortably. As you breathe out, hum softly like a bee for as long as is easy. Then breathe normally. Two or three rounds are enough." },
      { title: "Walking with comfortable breathing", text: "Walk at a pace where you could still talk. Let your breathing follow your steps without counting or forcing it." },
      { title: "Short movement breaks", text: "Finish each movement break with a few slow, comfortable breaths." },
    ],
    safety:
      "Breathing should always feel comfortable. Never hold your breath or force it. Stop and breathe normally if you feel dizzy, light-headed, or short of breath. These exercises do not detox the body, and they are not a guaranteed way to raise nitric oxide.",
    followUp: "More guided breathing sessions are on the way in the Breathe for Life program.",
  },
  principles: {
    heading: "DRINK. BREATHE. MOVE. NOURISH. REST.",
    intro: "These five everyday habits support each other. None of them replaces another.",
    items: [
      { word: "Drink", text: "Hydration supports normal body functions. Drink according to your own needs and any instructions from your healthcare professional." },
      { word: "Breathe", text: "Breathing supports respiratory function and takes part in normal lymph movement." },
      { word: "Move", text: "Movement activates your muscles and supports circulation and the way your body uses glucose." },
      { word: "Nourish", text: "Food supplies the nutrients and energy your body needs." },
      { word: "Rest", text: "Rest and sleep allow your body to recover." },
    ],
  },
  safety: {
    heading: "Stay safe",
    points: [
      "Every step has a seated choice. Use it if standing is hard, if you feel unsteady, or if you have been told to avoid falls.",
      "Hold a desk, counter, or sturdy chair for heel raises. Do not use a chair with wheels.",
      "Nothing here needs to be strenuous. Gentle and comfortable is the goal.",
      "Drinking water and doing calf raises do not prevent blood clots.",
    ],
    dvt:
      "New, unexplained swelling, pain, warmth, or redness in one leg needs prompt medical evaluation. Do not try to exercise it away. Sudden shortness of breath or chest pain is an emergency: call your local emergency number.",
  },
  evidence: {
    heading: "What is established, and what is a suggestion",
    physiology:
      "Established physiology: the calf muscle pump and vein valves help blood return from the legs; the lymphatic system returns tissue fluid to the blood, helped by muscle movement and breathing; leg muscles are much less active while sitting than while walking.",
    suggestions:
      "Suggestions: the 30-minute reminder, the 2 to 3 minute routine, the number of heel raises, and the breathing practices are practical, gentle ideas based on that physiology and on short research studies. They are not a treatment, and studies have not shown that one exact routine is best.",
    unread:
      "Some sources below could not be opened from the build environment when this page was written. They are listed because they were chosen for this topic, and a person should read them before the page is relied on.",
  },
} as const;

export type RoutineStep = {
  id: "stand" | "walk" | "heels" | "ankles" | "breathe" | "return";
  title: string;
  seconds: number;
  standing: string;
  seated: string;
};

/** The 2 to 3 minute break. Seated text is a full alternative for every step. */
export const ROUTINE: readonly RoutineStep[] = [
  {
    id: "stand",
    title: "Stand up",
    seconds: 10,
    standing: "Stand up slowly and comfortably. Use the armrests or desk if that helps.",
    seated: "Stay seated. Sit toward the front of the chair with both feet flat on the floor.",
  },
  {
    id: "walk",
    title: "Walk",
    seconds: 60,
    standing: "Walk around the room or office at an easy pace for about a minute.",
    seated: "March your feet in place while seated: lift one knee a little, then the other.",
  },
  {
    id: "heels",
    title: "Heel raises",
    seconds: 30,
    standing: "Hold a desk or sturdy chair. Slowly rise onto your toes, then lower your heels. Repeat about 10 to 15 times, or for 30 seconds if comfortable.",
    seated: "Keep your toes on the floor and slowly lift both heels, then lower them. Repeat about 10 to 15 times.",
  },
  {
    id: "ankles",
    title: "Ankle movements",
    seconds: 30,
    standing: "Hold your support, or sit down, and gently point and flex one foot at a time, up and down.",
    seated: "Lift your toes toward you, then point them away. Move gently, up and down, one foot or both.",
  },
  {
    id: "breathe",
    title: "Breathing",
    seconds: 30,
    standing: "Take several comfortable breaths through your nose. Do not hold your breath.",
    seated: "Take several comfortable breaths through your nose. Do not hold your breath.",
  },
  {
    id: "return",
    title: "Return to work",
    seconds: 5,
    standing: "Well done. Go back to what you were doing.",
    seated: "Well done. Go back to what you were doing.",
  },
];

export const ROUTINE_SECONDS = ROUTINE.reduce((sum, step) => sum + step.seconds, 0);
