export const WELLNESS_CATEGORIES = [
  { id: "energy", label: "Energy & Daily Wellness" },
  { id: "sleep", label: "Sleep & Relaxation" },
  { id: "nutrition", label: "Nutrition & Sugar" },
  { id: "movement", label: "Movement & Fitness" },
  { id: "weight", label: "Weight & Body Wellness" },
  { id: "motivation", label: "Motivation & Personal Progress" },
  { id: "awareness", label: "Health Awareness" },
] as const;

export type WellnessCategoryId = (typeof WELLNESS_CATEGORIES)[number]["id"];

export type WellnessLink = {
  href: string;
  label: string;
};

export type WellnessQuestion = {
  id: string;
  category: WellnessCategoryId;
  question: string;
  answer: string;
  relatedIds: readonly string[];
  links: readonly WellnessLink[];
};

export const POPULAR_IDS = [
  "tired-day",
  "sleep-better",
  "crave-sweets",
  "beginner-exercises",
  "improve-balance",
  "weight-not-changing",
  "stay-motivated",
  "blood-pressure",
] as const;

const nutrition = { href: "/academy/meals", label: "Nutrition" } as const;
const movement = { href: "/academy/move/resources", label: "Movement" } as const;
const progress = { href: "/progress", label: "Progress" } as const;
const sleep = { href: "/library/guides/better-sleep", label: "Sleep" } as const;
const labs = { href: "/lab-results", label: "Health tracking" } as const;
const walking = {
  href: "/academy/move/resources/categories/walking-and-daily-movement",
  label: "Walking",
} as const;
const chairYoga = {
  href: "/academy/move/resources/categories/chair-yoga",
  label: "Chair yoga",
} as const;
const balance = {
  href: "/academy/move/resources/categories/balance-and-stability",
  label: "Balance and stability",
} as const;
const beginners = {
  href: "/academy/move/resources/categories/strength-for-beginners",
  label: "Movement for beginners",
} as const;
const breathing = {
  href: "/academy/move/resources/categories/breathing-and-relaxation",
  label: "Breathing and relaxation",
} as const;
const stretch = {
  href: "/academy/move/resources/categories/gentle-stretching",
  label: "Gentle stretching",
} as const;

export const WELLNESS_QUESTIONS: readonly WellnessQuestion[] = [
  {
    id: "tired-day",
    category: "energy",
    question: "Why am I tired during the day?",
    answer:
      "Feeling tired can have many possible causes, including poor sleep, stress, dehydration, irregular meals, or not getting enough physical activity. Try keeping a regular sleep schedule, drinking enough water, eating balanced meals, and taking short movement breaks. If tiredness is persistent, severe, or unusual for you, speak with a healthcare professional.",
    relatedIds: ["energy-naturally", "sleep-better", "walking-feel-better"],
    links: [sleep, movement, nutrition],
  },
  {
    id: "energy-naturally",
    category: "energy",
    question: "How can I improve my energy naturally?",
    answer:
      "Start with small everyday habits. Get enough sleep, drink water regularly, eat balanced meals, enjoy daylight, and move your body in a way that feels comfortable. Short walks and gentle stretching can help you feel more active. Remember that energy levels can change from day to day.",
    relatedIds: ["tired-day", "water-amount", "walking-feel-better"],
    links: [walking, sleep, nutrition],
  },
  {
    id: "sleepy-after-eating",
    category: "energy",
    question: "Why do I feel sleepy after eating?",
    answer:
      "Feeling sleepy after a meal can happen for several reasons, including meal size, sleep quality, and normal changes in alertness during the day. Try balanced meals with vegetables, protein, and fiber-rich foods. Notice whether very large meals make you feel more tired.",
    relatedIds: ["healthy-breakfast", "walk-after-dinner", "gut-health"],
    links: [nutrition, sleep],
  },
  {
    id: "walking-feel-better",
    category: "energy",
    question: "Can walking help me feel better?",
    answer:
      "Regular walking can support heart health, muscle function, mood, and general fitness. You do not have to walk for a long time at first. Even a short, comfortable walk can be a good starting point. Gradually increase your activity as you feel able.",
    relatedIds: ["beginner-exercises", "walk-after-dinner", "energy-naturally"],
    links: [walking, movement],
  },
  {
    id: "healthier-habits",
    category: "energy",
    question: "How can I build healthier daily habits?",
    answer:
      "Choose one small habit and practice it regularly. For example, take a short walk, add vegetables to one meal, or go to bed at a consistent time. Make your goals realistic. Small steps that you can repeat are often easier to maintain than major changes all at once.",
    relatedIds: ["realistic-goals", "missed-day", "stay-motivated"],
    links: [progress, movement, nutrition],
  },
  {
    id: "water-amount",
    category: "energy",
    question: "How much water should I drink?",
    answer:
      "Water needs vary depending on your activity, climate, health, and other factors. Drink regularly throughout the day and pay attention to thirst. Foods such as fruits and vegetables also provide water. If you have been advised to limit fluids because of a medical condition, follow your healthcare professional's guidance.",
    relatedIds: ["energy-naturally", "gut-health", "healthy-breakfast"],
    links: [nutrition],
  },
  {
    id: "sluggish-morning",
    category: "energy",
    question: "Why do I feel sluggish in the morning?",
    answer:
      "Morning energy can be affected by sleep quality, sleep timing, stress, and daily routines. Try getting up at a consistent time, opening the curtains for daylight, drinking some water, and doing a few gentle movements. Notice which habits help you start the day comfortably.",
    relatedIds: ["sleep-better", "energy-naturally", "walking-feel-better"],
    links: [sleep, movement],
  },
  {
    id: "active-older",
    category: "energy",
    question: "How can I feel more active as I get older?",
    answer:
      "Stay curious and keep moving in ways that suit your abilities. Walking, gentle strength exercises, balance practice, stretching, social activities, and hobbies can all contribute to an active lifestyle. Start at a comfortable level and build gradually.",
    relatedIds: ["beginner-exercises", "improve-balance", "exercise-often"],
    links: [movement, beginners, progress],
  },
  {
    id: "sleep-better",
    category: "sleep",
    question: "How can I sleep better?",
    answer:
      "Try going to bed and waking up at similar times each day. Keep your bedroom comfortable and quiet, reduce bright screens before bedtime, and create a relaxing evening routine. Avoid excessive caffeine late in the day. If sleep problems continue, talk with a healthcare professional.",
    relatedIds: ["wake-at-night", "evening-routine", "tired-day"],
    links: [sleep, { href: "/choices/sleep", label: "Sleep and wellness" }],
  },
  {
    id: "wake-at-night",
    category: "sleep",
    question: "Why do I wake up during the night?",
    answer:
      "Nighttime waking can be related to stress, noise, temperature, caffeine, medications, or health conditions. Try noticing patterns in your sleep diary. If waking frequently affects your daily life, consider discussing it with your healthcare professional.",
    relatedIds: ["sleep-better", "feel-stressed", "evening-routine"],
    links: [sleep],
  },
  {
    id: "gentle-exercise-relax",
    category: "sleep",
    question: "Can gentle exercise help me relax?",
    answer:
      "Many people find gentle stretching, slow walking, yoga, or breathing exercises relaxing. Choose movements that feel comfortable. You can try a short evening routine and notice how you feel afterward.",
    relatedIds: ["feel-stressed", "evening-routine", "chair-yoga"],
    links: [breathing, movement],
  },
  {
    id: "feel-stressed",
    category: "sleep",
    question: "What can I do when I feel stressed?",
    answer:
      "Try taking a few slow, comfortable breaths, stepping outside, listening to calming music, or talking with someone you trust. Gentle movement and a regular daily routine can also help. If stress feels overwhelming or continues for a long time, professional support may help.",
    relatedIds: ["gentle-exercise-relax", "sleep-better", "evening-routine"],
    links: [{ href: "/library/guides/stress-relief", label: "Stress relief" }, breathing],
  },
  {
    id: "walk-after-dinner",
    category: "sleep",
    question: "Is it good to take a short walk after dinner?",
    answer:
      "For many people, a comfortable walk after dinner can be a pleasant way to add movement to the day. Start gently and choose a pace that feels right. If walking after meals causes discomfort or you have medical restrictions, choose another time or ask your healthcare professional.",
    relatedIds: ["walking-feel-better", "sleepy-after-eating", "beginner-exercises"],
    links: [walking, movement],
  },
  {
    id: "evening-routine",
    category: "sleep",
    question: "How can I create a relaxing evening routine?",
    answer:
      "Choose a few simple activities that help you slow down. You might dim the lights, listen to quiet music, read, stretch gently, or prepare for the next morning. Try to keep your bedtime consistent.",
    relatedIds: ["sleep-better", "gentle-exercise-relax", "feel-stressed"],
    links: [sleep, breathing],
  },
  {
    id: "crave-sweets",
    category: "nutrition",
    question: "Why do I crave sweets?",
    answer:
      "Sweet cravings can be influenced by habits, stress, sleep, hunger, and food availability. Try eating regular balanced meals with protein and fiber. You can also enjoy naturally sweet foods such as whole fruit. You do not need to feel guilty about enjoying something sweet.",
    relatedIds: ["reduce-added-sugar", "sugar-energy", "healthy-breakfast"],
    links: [nutrition, { href: "/library/guides/hidden-sugar", label: "Hidden sugar" }],
  },
  {
    id: "sugar-energy",
    category: "nutrition",
    question: "Does sugar give me energy?",
    answer:
      "Sugar provides carbohydrates that the body can use for energy. However, sugary drinks and snacks may provide little lasting fullness or nutritional value. Some people notice changes in hunger or energy after consuming sweet foods. Try balanced meals and notice how different choices make you feel.",
    relatedIds: ["crave-sweets", "reduce-added-sugar", "fruit-vs-added-sugar"],
    links: [nutrition],
  },
  {
    id: "fruit-vs-added-sugar",
    category: "nutrition",
    question: "Is fruit sugar the same as added sugar?",
    answer:
      "Whole fruit contains naturally occurring sugars along with water, fiber, vitamins, and other nutrients. Added sugar is put into foods or drinks during preparation or processing. Whole fruit is generally a nutritious choice. Check food labels to identify added sugars.",
    relatedIds: ["reduce-added-sugar", "crave-sweets", "gut-health"],
    links: [nutrition],
  },
  {
    id: "reduce-added-sugar",
    category: "nutrition",
    question: "How can I reduce added sugar?",
    answer:
      "Start by checking labels on drinks, yogurt, cereals, sauces, and packaged foods. Try gradually reducing sugar in coffee and tea. Choose water more often and enjoy whole fruit when you want something sweet. Small changes can become easier with practice.",
    relatedIds: ["crave-sweets", "fruit-vs-added-sugar", "healthy-breakfast"],
    links: [nutrition],
  },
  {
    id: "healthy-breakfast",
    category: "nutrition",
    question: "What is a healthy breakfast?",
    answer:
      "A balanced breakfast can include protein, fiber, and fruit or vegetables. Examples include eggs with whole-grain toast, plain Greek yogurt with berries and nuts, or oatmeal with seeds. Choose foods that fit your preferences and needs.",
    relatedIds: ["more-protein", "reduce-added-sugar", "gut-health"],
    links: [nutrition, { href: "/library/guides/healthy-breakfast", label: "Healthy breakfast" }],
  },
  {
    id: "gut-health",
    category: "nutrition",
    question: "What foods support gut health?",
    answer:
      "Fiber-rich foods such as vegetables, fruits, beans, lentils, oats, nuts, and whole grains can support digestive health. Yogurt with live cultures and some fermented foods may also be useful. Increase fiber gradually and drink enough water.",
    relatedIds: ["bloated", "water-amount", "healthy-breakfast"],
    links: [nutrition, { href: "/library/guides/gut-basics", label: "Gut health" }],
  },
  {
    id: "more-protein",
    category: "nutrition",
    question: "How can I eat more protein?",
    answer:
      "Include protein-rich foods throughout the day. Examples include eggs, fish, chicken, Greek yogurt, cottage cheese, beans, lentils, tofu, nuts, and seeds. Try adding one protein-rich food to breakfast, lunch, and dinner. Individual protein needs vary.",
    relatedIds: ["healthy-breakfast", "supermarket", "carbohydrates"],
    links: [nutrition],
  },
  {
    id: "carbohydrates",
    category: "nutrition",
    question: "Are carbohydrates bad for me?",
    answer:
      "No. Carbohydrates are an important source of energy. Foods such as whole grains, beans, fruits, and vegetables also provide fiber and nutrients. Instead of avoiding all carbohydrates, focus on food quality, portions, and balanced meals.",
    relatedIds: ["sugar-energy", "healthy-breakfast", "supermarket"],
    links: [nutrition],
  },
  {
    id: "supermarket",
    category: "nutrition",
    question: "How can I make healthier food choices at the supermarket?",
    answer:
      "Compare Nutrition Facts labels. Look at added sugars, sodium, fiber, protein, and serving sizes. Compare similar products rather than relying only on front-of-package claims. Choose foods that fit your needs, preferences, and budget.",
    relatedIds: ["healthy-fats", "reduce-added-sugar", "more-protein"],
    links: [nutrition],
  },
  {
    id: "healthy-fats",
    category: "nutrition",
    question: "What are healthy fats?",
    answer:
      "Unsaturated fats are found in foods such as olive oil, avocados, walnuts, seeds, and fatty fish. Replacing some saturated fats with unsaturated fats can support heart health. Fats are still energy-rich, so enjoy them in appropriate amounts.",
    relatedIds: ["supermarket", "heart-habits", "carbohydrates"],
    links: [nutrition],
  },
  {
    id: "beginner-exercises",
    category: "movement",
    question: "What exercises are good for beginners?",
    answer:
      "Good starting activities may include gentle walking, chair exercises, easy stretching, and supported balance movements. Begin with a comfortable amount of activity and increase gradually. Choose exercises that match your abilities.",
    relatedIds: ["chair-yoga", "restart-activity", "walking-feel-better"],
    links: [movement, beginners],
  },
  {
    id: "chair-yoga",
    category: "movement",
    question: "Is chair yoga useful?",
    answer:
      "Chair yoga offers gentle movements and stretches that can be adapted for people who prefer exercising while seated. It can help practice flexibility, mobility, and body awareness. Choose a stable chair and avoid movements that cause pain.",
    relatedIds: ["beginner-exercises", "flexibility", "improve-balance"],
    links: [movement, chairYoga],
  },
  {
    id: "improve-balance",
    category: "movement",
    question: "How can I improve my balance?",
    answer:
      "Balance practice can include supported standing, gentle weight shifting, heel raises, and controlled side steps. Use a sturdy support when needed. Start slowly and practice in a safe area. If you have frequent falls or significant balance problems, seek professional guidance.",
    relatedIds: ["beginner-exercises", "chair-yoga", "strength-training"],
    links: [movement, balance],
  },
  {
    id: "exercise-often",
    category: "movement",
    question: "How often should I exercise?",
    answer:
      "Many adults can work toward 150 minutes of moderate aerobic activity per week, along with muscle-strengthening activities on at least two days. Activity needs vary by age, health, and ability. If you are new to exercise, start gradually.",
    relatedIds: ["beginner-exercises", "strength-training", "walking-feel-better"],
    links: [movement],
  },
  {
    id: "restart-activity",
    category: "movement",
    question: "Can I exercise if I have not been active for a long time?",
    answer:
      "Yes, many people can begin with gentle activities such as short walks or chair exercises. Start with a comfortable duration and increase slowly. If you have health concerns or physical limitations, ask a healthcare professional about a suitable starting plan.",
    relatedIds: ["beginner-exercises", "walking-feel-better", "exercise-often"],
    links: [movement, beginners],
  },
  {
    id: "strength-training",
    category: "movement",
    question: "Why is strength training important?",
    answer:
      "Strength exercises help maintain muscle function and support everyday activities such as standing up, carrying groceries, and climbing stairs. You can begin with gentle bodyweight exercises or suitable resistance bands. Choose a safe level for your abilities.",
    relatedIds: ["beginner-exercises", "exercise-often", "improve-balance"],
    links: [movement, beginners],
  },
  {
    id: "flexibility",
    category: "movement",
    question: "How can I improve my flexibility?",
    answer:
      "Gentle stretching and regular mobility exercises can help you practice comfortable movement. Move slowly, avoid bouncing, and do not force a stretch. Consistency matters more than stretching as far as possible.",
    relatedIds: ["chair-yoga", "gentle-exercise-relax", "beginner-exercises"],
    links: [movement, stretch],
  },
  {
    id: "sit-all-day",
    category: "movement",
    question: "What can I do if I sit all day?",
    answer:
      "Try taking regular movement breaks. Stand up if you can, walk around briefly, stretch your shoulders, or try gentle seated exercises. Small movement breaks can help reduce long periods of uninterrupted sitting.",
    relatedIds: ["walking-feel-better", "beginner-exercises", "flexibility"],
    links: [movement, walking],
  },
  {
    id: "weight-not-changing",
    category: "weight",
    question: "Why is my weight not changing?",
    answer:
      "Body weight can be influenced by food intake, activity, sleep, stress, medications, hormones, and fluid changes. Weight can fluctuate naturally. Consider tracking other aspects of progress, such as movement, sleep, strength, energy, and waist measurements if you choose.",
    relatedIds: ["health-without-weight-loss", "measure-progress", "clothes-fit"],
    links: [progress, movement],
  },
  {
    id: "health-without-weight-loss",
    category: "weight",
    question: "Can I improve my health without losing weight?",
    answer:
      "Absolutely. Regular movement, balanced meals, better sleep, improved strength, and stress management can all support health, even when your weight stays the same. Your progress is about more than a number on a scale.",
    relatedIds: ["weight-not-changing", "measure-progress", "non-scale"],
    links: [progress, movement, nutrition],
  },
  {
    id: "measure-progress",
    category: "weight",
    question: "How can I measure my progress besides weight?",
    answer:
      "You can track your movement minutes, exercise sessions, sleep, energy, mood, waist measurements, and personal achievements. You might notice that walking feels easier or that you have more confidence with everyday activities. Choose the measurements that matter to you.",
    relatedIds: ["non-scale", "recognize-improvements", "weight-not-changing"],
    links: [progress],
  },
  {
    id: "bloated",
    category: "weight",
    question: "Why does my stomach feel bloated?",
    answer:
      "Bloating can have many possible causes, including eating patterns, certain foods, constipation, and digestive conditions. Eating slowly, drinking enough water, and increasing fiber gradually may help some people. If bloating is persistent, painful, or accompanied by concerning symptoms, seek medical advice.",
    relatedIds: ["gut-health", "water-amount", "sleepy-after-eating"],
    links: [nutrition, progress],
  },
  {
    id: "clothes-fit",
    category: "weight",
    question: "Can my clothes fit differently even if my weight stays the same?",
    answer:
      "Yes. Clothing fit can change for several reasons, including body measurements, fluid changes, and how your body composition changes. Weight alone does not tell the whole story. If you choose, track waist or other measurements over time using consistent methods.",
    relatedIds: ["weight-not-changing", "measure-progress", "health-without-weight-loss"],
    links: [progress],
  },
  {
    id: "notice-changes",
    category: "motivation",
    question: "How long does it take to notice lifestyle changes?",
    answer:
      "Everyone is different. Some people notice changes in sleep, energy, mood, or daily routines within days or weeks. Other changes take longer. There is no guaranteed timeline. Focus on your habits and your own observations rather than comparing yourself with others.",
    relatedIds: ["stay-motivated", "recognize-improvements", "missed-day"],
    links: [progress],
  },
  {
    id: "missed-day",
    category: "motivation",
    question: "What if I miss a day of my healthy routine?",
    answer:
      "That is completely normal. One missed day does not erase your progress. Simply return to your routine when you are ready. Focus on consistency over time, not perfection.",
    relatedIds: ["stay-motivated", "healthier-habits", "notice-changes"],
    links: [progress],
  },
  {
    id: "stay-motivated",
    category: "motivation",
    question: "How can I stay motivated?",
    answer:
      "Choose goals that matter to you. Keep them small and realistic. Celebrate everyday achievements, such as completing a walk, trying a new healthy meal, or going to bed on time. Record what makes you feel proud. Progress is personal.",
    relatedIds: ["missed-day", "realistic-goals", "non-scale"],
    links: [progress],
  },
  {
    id: "non-scale",
    category: "motivation",
    question: "What are non-scale victories?",
    answer:
      "Non-scale victories are positive changes that are not measured by body weight. Examples include sleeping better, feeling stronger, walking farther, having more energy, or feeling more confident. These achievements are important parts of your personal wellness journey.",
    relatedIds: ["measure-progress", "recognize-improvements", "health-without-weight-loss"],
    links: [progress],
  },
  {
    id: "realistic-goals",
    category: "motivation",
    question: "How can I set realistic health goals?",
    answer:
      "Choose one or two changes that feel manageable. Make your goal specific and practical. For example, walk for ten minutes three times this week or add vegetables to lunch each day. Review your progress and adjust your goals when needed.",
    relatedIds: ["healthier-habits", "first-week", "stay-motivated"],
    links: [progress],
  },
  {
    id: "first-week",
    category: "motivation",
    question: "What should I do after completing my first week?",
    answer:
      "Take a moment to recognize what you accomplished. Review your movement, nutrition, sleep, and personal observations. Choose one habit you would like to continue and one small new goal for the next week.",
    relatedIds: ["realistic-goals", "recognize-improvements", "stay-motivated"],
    links: [progress],
  },
  {
    id: "recognize-improvements",
    category: "motivation",
    question: "How can I recognize my personal improvements?",
    answer:
      "Look at your own records over time. You may notice better sleep, more regular movement, improved confidence, or easier everyday activities. Write down what you observe. Your progress does not need to look like anyone else's.",
    relatedIds: ["non-scale", "measure-progress", "notice-changes"],
    links: [progress],
  },
  {
    id: "blood-pressure",
    category: "awareness",
    question: "Why is checking my blood pressure important?",
    answer:
      "Blood pressure measurements can help you understand an important part of your cardiovascular health. High blood pressure often has no noticeable symptoms, so regular measurement may be useful. Discuss your readings and any concerns with your healthcare professional.",
    relatedIds: ["checkups", "heart-habits", "when-to-talk"],
    links: [labs],
  },
  {
    id: "blood-sugar",
    category: "awareness",
    question: "What is blood sugar?",
    answer:
      "Blood sugar, also called blood glucose, is the amount of glucose in your blood. Your body uses glucose as an energy source. Blood glucose can change after meals, activity, stress, and during illness. Your healthcare professional can explain your personal test results.",
    relatedIds: ["hba1c", "checkups", "when-to-talk"],
    links: [labs],
  },
  {
    id: "hba1c",
    category: "awareness",
    question: "What is HbA1c?",
    answer:
      "HbA1c is a blood test that reflects your average blood glucose over approximately the previous three months. It is used by healthcare professionals to assess blood sugar levels and help evaluate diabetes risk or management. Your result should be interpreted using appropriate clinical guidance.",
    relatedIds: ["blood-sugar", "checkups", "when-to-talk"],
    links: [labs],
  },
  {
    id: "checkups",
    category: "awareness",
    question: "Why are regular health checkups important?",
    answer:
      "Regular checkups give you an opportunity to discuss your health, review medications, ask questions, and understand which screening tests may be appropriate for your age and personal history. Your healthcare professional can help determine what you need.",
    relatedIds: ["when-to-talk", "blood-pressure", "hba1c"],
    links: [labs],
  },
  {
    id: "heart-habits",
    category: "awareness",
    question: "Can lifestyle habits support heart health?",
    answer:
      "Healthy habits such as regular physical activity, balanced meals, not smoking, sufficient sleep, and managing stress can support cardiovascular health. Small, consistent choices can contribute to a healthier lifestyle. Your personal health needs may require additional medical guidance.",
    relatedIds: ["exercise-often", "healthy-fats", "blood-pressure"],
    links: [movement, nutrition, labs],
  },
  {
    id: "when-to-talk",
    category: "awareness",
    question: "When should I talk to a healthcare professional?",
    answer:
      "Speak with a healthcare professional if you have persistent symptoms, unexplained changes in your health, or questions about medications or test results. Seek urgent help for severe or sudden symptoms such as chest pain, severe difficulty breathing, fainting, or signs of stroke.",
    relatedIds: ["checkups", "blood-pressure", "blood-sugar"],
    links: [labs],
  },
];

export const FEELING_SUPPORT =
  "Thank you for sharing. Let's explore a few simple ideas that may help.";

export const TIRED_EXPLORE = "Let's explore a few simple areas that may affect your energy.";

export type FeelingPrompt = { label: string; questionId: string };

export type FeelingChoice = {
  id: string;
  label: string;
  questionIds: readonly string[];
  note?: string;
  prompts?: readonly FeelingPrompt[];
};

export const FEELINGS: readonly FeelingChoice[] = [
  {
    id: "tired",
    label: "I feel tired",
    note: TIRED_EXPLORE,
    questionIds: ["tired-day", "energy-naturally", "sleep-better"],
    prompts: [
      { label: "How well have you been sleeping?", questionId: "sleep-better" },
      { label: "How often do you move during the day?", questionId: "walking-feel-better" },
      { label: "Are you eating regular balanced meals?", questionId: "healthy-breakfast" },
    ],
  },
  {
    id: "sleeping",
    label: "I am having trouble sleeping",
    questionIds: ["sleep-better", "wake-at-night", "evening-routine"],
  },
  {
    id: "sweets",
    label: "I crave sweets",
    questionIds: ["crave-sweets", "reduce-added-sugar", "sugar-energy"],
  },
  {
    id: "lose-weight",
    label: "I want to lose weight",
    questionIds: ["health-without-weight-loss", "weight-not-changing", "measure-progress"],
  },
  {
    id: "motivation",
    label: "I have no motivation",
    questionIds: ["stay-motivated", "missed-day", "realistic-goals"],
  },
  {
    id: "stronger",
    label: "I want to become stronger",
    questionIds: ["strength-training", "beginner-exercises", "exercise-often"],
  },
  {
    id: "stressed",
    label: "I feel stressed",
    questionIds: ["feel-stressed", "gentle-exercise-relax", "evening-routine"],
  },
  {
    id: "eat-healthier",
    label: "I want to eat healthier",
    questionIds: ["healthy-breakfast", "supermarket", "more-protein"],
  },
  {
    id: "move-more",
    label: "I want to move more",
    questionIds: ["walking-feel-better", "beginner-exercises", "sit-all-day"],
  },
  {
    id: "daily-habits",
    label: "I want to improve my daily habits",
    questionIds: ["healthier-habits", "realistic-goals", "first-week"],
  },
  {
    id: "bloated",
    label: "I feel bloated",
    questionIds: ["bloated", "gut-health", "water-amount"],
  },
  {
    id: "balance",
    label: "I want to improve my balance",
    questionIds: ["improve-balance", "beginner-exercises", "chair-yoga"],
  },
  {
    id: "feel-good",
    label: "I feel good and want to improve further",
    questionIds: ["non-scale", "recognize-improvements", "stay-motivated"],
  },
];

const byId = new Map(WELLNESS_QUESTIONS.map((item) => [item.id, item]));

export function questionById(id: string): WellnessQuestion | null {
  return byId.get(id) ?? null;
}

export function categoryLabel(id: WellnessCategoryId): string {
  return WELLNESS_CATEGORIES.find((category) => category.id === id)?.label ?? id;
}

export function questionsInCategory(category: "all" | WellnessCategoryId): WellnessQuestion[] {
  if (category === "all") return [...WELLNESS_QUESTIONS];
  return WELLNESS_QUESTIONS.filter((item) => item.category === category);
}

export function relatedQuestions(id: string): WellnessQuestion[] {
  const item = questionById(id);
  if (!item) return [];
  return item.relatedIds.flatMap((relatedId) => {
    const related = questionById(relatedId);
    return related ? [related] : [];
  });
}

export function popularQuestions(): WellnessQuestion[] {
  return POPULAR_IDS.flatMap((id) => {
    const item = questionById(id);
    return item ? [item] : [];
  });
}

export function isPopular(id: string): boolean {
  return (POPULAR_IDS as readonly string[]).includes(id);
}

export function feelingById(id: string): FeelingChoice | null {
  return FEELINGS.find((item) => item.id === id) ?? null;
}
