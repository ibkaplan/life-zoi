export const WELLNESS_CATEGORIES = [
  { id: "energy", label: "Energy & Daily Wellness" },
  { id: "sleep", label: "Sleep & Relaxation" },
  { id: "nutrition", label: "Nutrition & Sugar" },
  { id: "movement", label: "Movement & Fitness" },
  { id: "motivation", label: "Motivation & Personal Progress" },
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
  relatedIds: readonly [string, string, string];
  links: readonly WellnessLink[];
};

export const POPULAR_IDS = [
  "tired-day",
  "energy-naturally",
  "sleep-better",
  "crave-sweets",
  "reduce-added-sugar",
  "beginner-exercises",
  "improve-balance",
  "stay-motivated",
] as const;

const nutrition = { href: "/academy/meals", label: "Nutrition" } as const;
const movement = { href: "/academy/move", label: "Movement" } as const;
const progress = { href: "/progress", label: "Progress" } as const;
const sleep = { href: "/library/guides/better-sleep", label: "Sleep" } as const;
const walking = {
  href: "/academy/move/resources/categories/walking-and-daily-movement",
  label: "Movement",
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
  label: "Movement",
} as const;
const breathing = {
  href: "/academy/move/resources/categories/breathing-and-relaxation",
  label: "Movement",
} as const;
const hiddenSugar = { href: "/library/guides/hidden-sugar", label: "Hidden sugar" } as const;
const breakfast = { href: "/library/guides/healthy-breakfast", label: "Healthy breakfast" } as const;
const gut = { href: "/library/guides/gut-basics", label: "Gut health" } as const;
const stress = { href: "/library/guides/stress-relief", label: "Stress relief" } as const;

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
    relatedIds: ["tired-day", "walking-feel-better", "healthier-habits"],
    links: [walking, sleep, nutrition],
  },
  {
    id: "sleepy-after-eating",
    category: "energy",
    question: "Why do I feel sleepy after eating?",
    answer:
      "Feeling sleepy after a meal can happen for several reasons, including meal size, sleep quality, and normal changes in alertness during the day. Try balanced meals with vegetables, protein, and fiber-rich foods. Notice whether very large meals make you feel more tired.",
    relatedIds: ["healthy-breakfast", "tired-day", "gut-health"],
    links: [nutrition, breakfast, sleep],
  },
  {
    id: "walking-feel-better",
    category: "energy",
    question: "Can walking help me feel better?",
    answer:
      "Yes. Regular walking can support heart health, muscle function, mood, and general fitness. You do not have to walk for a long time at first. Even a short, comfortable walk can be a good starting point. Gradually increase your activity as you feel able.",
    relatedIds: ["beginner-exercises", "energy-naturally", "restart-activity"],
    links: [walking, movement],
  },
  {
    id: "healthier-habits",
    category: "energy",
    question: "How can I build healthier daily habits?",
    answer:
      "Choose one small habit and practice it regularly. For example, take a short walk, add vegetables to one meal, or go to bed at a consistent time. Make your goals realistic. Small steps that you can repeat are often easier to maintain than major changes all at once.",
    relatedIds: ["stay-motivated", "missed-day", "energy-naturally"],
    links: [progress, movement, nutrition],
  },
  {
    id: "sleep-better",
    category: "sleep",
    question: "How can I sleep better?",
    answer:
      "Try going to bed and waking up at similar times each day. Keep your bedroom comfortable and quiet, reduce bright screens before bedtime, and create a relaxing evening routine. Avoid large meals and excessive caffeine late in the day. If sleep problems continue, talk with a healthcare professional.",
    relatedIds: ["wake-at-night", "gentle-exercise-relax", "tired-day"],
    links: [sleep, { href: "/choices/sleep", label: "Sleep and wellness" }],
  },
  {
    id: "wake-at-night",
    category: "sleep",
    question: "Why do I wake up during the night?",
    answer:
      "Nighttime waking can be related to stress, noise, temperature, caffeine, medications, or health conditions. Try noticing patterns in your sleep diary. If waking frequently affects your daily life, consider discussing it with your healthcare professional.",
    relatedIds: ["sleep-better", "feel-stressed", "gentle-exercise-relax"],
    links: [sleep, stress],
  },
  {
    id: "gentle-exercise-relax",
    category: "sleep",
    question: "Can gentle exercise help me relax?",
    answer:
      "Many people find gentle stretching, slow walking, yoga, or breathing exercises relaxing. Choose movements that feel comfortable. You can try a short evening routine and notice how you feel afterward.",
    relatedIds: ["feel-stressed", "sleep-better", "chair-yoga"],
    links: [breathing, movement, stress],
  },
  {
    id: "feel-stressed",
    category: "sleep",
    question: "What can I do when I feel stressed?",
    answer:
      "Try taking a few slow, comfortable breaths, stepping outside, listening to calming music, or talking with someone you trust. Gentle movement and a regular daily routine can also help. If stress feels overwhelming or continues for a long time, professional support may help.",
    relatedIds: ["gentle-exercise-relax", "sleep-better", "stay-motivated"],
    links: [stress, breathing],
  },
  {
    id: "crave-sweets",
    category: "nutrition",
    question: "Why do I crave sweets?",
    answer:
      "Sweet cravings can be influenced by habits, stress, sleep, hunger, and food availability. Try eating regular balanced meals with protein and fiber. You can also enjoy naturally sweet foods such as whole fruit. You do not need to feel guilty about enjoying something sweet.",
    relatedIds: ["reduce-added-sugar", "sugar-energy", "healthy-breakfast"],
    links: [nutrition, hiddenSugar],
  },
  {
    id: "sugar-energy",
    category: "nutrition",
    question: "Does sugar give me energy?",
    answer:
      "Sugar provides carbohydrates that the body can use for energy. However, sugary drinks and snacks may provide little lasting fullness or nutritional value. Some people notice changes in hunger or energy after consuming sweet foods. Try balanced meals and notice how different choices make you feel.",
    relatedIds: ["crave-sweets", "reduce-added-sugar", "fruit-vs-added-sugar"],
    links: [hiddenSugar, nutrition],
  },
  {
    id: "fruit-vs-added-sugar",
    category: "nutrition",
    question: "Is fruit sugar the same as added sugar?",
    answer:
      "Whole fruit contains naturally occurring sugars along with water, fiber, vitamins, and other nutrients. Added sugar is put into foods or drinks during preparation or processing. Whole fruit is generally a nutritious choice. Check food labels to identify added sugars.",
    relatedIds: ["reduce-added-sugar", "crave-sweets", "gut-health"],
    links: [nutrition, hiddenSugar],
  },
  {
    id: "reduce-added-sugar",
    category: "nutrition",
    question: "How can I reduce added sugar?",
    answer:
      "Start by checking labels on drinks, yogurt, cereals, sauces, and packaged foods. Try gradually reducing sugar in coffee and tea. Choose water more often and enjoy whole fruit when you want something sweet. Small changes can become easier with practice.",
    relatedIds: ["crave-sweets", "fruit-vs-added-sugar", "healthy-breakfast"],
    links: [hiddenSugar, nutrition, { href: "/sugar-detective", label: "Sugar detective" }],
  },
  {
    id: "healthy-breakfast",
    category: "nutrition",
    question: "What is a healthy breakfast?",
    answer:
      "A balanced breakfast can include protein, fiber, and fruit or vegetables. Examples include eggs with whole-grain toast, plain Greek yogurt with berries and nuts, or oatmeal with seeds. Choose foods that fit your preferences and needs.",
    relatedIds: ["reduce-added-sugar", "gut-health", "sleepy-after-eating"],
    links: [breakfast, nutrition],
  },
  {
    id: "gut-health",
    category: "nutrition",
    question: "What foods support gut health?",
    answer:
      "Fiber-rich foods such as vegetables, fruits, beans, lentils, oats, nuts, and whole grains can support digestive health. Yogurt with live cultures and some fermented foods may also be useful. Increase fiber gradually and drink enough water.",
    relatedIds: ["healthy-breakfast", "fruit-vs-added-sugar", "reduce-added-sugar"],
    links: [gut, { href: "/library/guides/fiber-foods", label: "Fiber" }, nutrition],
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
    relatedIds: ["beginner-exercises", "gentle-exercise-relax", "improve-balance"],
    links: [chairYoga, { href: "/library/move/chair-yoga", label: "Chair yoga practice" }, movement],
  },
  {
    id: "improve-balance",
    category: "movement",
    question: "How can I improve my balance?",
    answer:
      "Balance practice can include supported standing, gentle weight shifting, heel raises, and controlled side steps. Use a sturdy support when needed. Start slowly and practice in a safe area. If you have frequent falls or significant balance problems, seek professional guidance.",
    relatedIds: ["beginner-exercises", "chair-yoga", "restart-activity"],
    links: [balance, { href: "/library/guides/beginner-balance", label: "Beginner balance" }, { href: "/balance-challenge", label: "Balance challenge" }],
  },
  {
    id: "exercise-often",
    category: "movement",
    question: "How often should I exercise?",
    answer:
      "Activity needs vary by age, health, and ability. Many adults can work toward the public health recommendation of 150 minutes of moderate aerobic activity per week, along with muscle-strengthening activities on at least two days. If you are new to exercise, start gradually. Any movement you can safely add is a useful beginning.",
    relatedIds: ["beginner-exercises", "restart-activity", "walking-feel-better"],
    links: [movement, { href: "/academy/move/resources", label: "Movement resources" }],
  },
  {
    id: "restart-activity",
    category: "movement",
    question: "Can I exercise if I have not been active for a long time?",
    answer:
      "Yes, many people can begin with gentle activities such as short walks or chair exercises. Start with a comfortable duration and increase slowly. If you have health concerns or physical limitations, ask a healthcare professional about a suitable starting plan.",
    relatedIds: ["beginner-exercises", "walking-feel-better", "exercise-often"],
    links: [beginners, walking, movement],
  },
  {
    id: "notice-changes",
    category: "motivation",
    question: "How long does it take to notice lifestyle changes?",
    answer:
      "Everyone is different. Some people notice changes in their sleep, energy, mood, or daily routines within days or weeks. Other changes take longer. There is no guaranteed timeline. Focus on your habits and your own observations rather than comparing yourself with others.",
    relatedIds: ["stay-motivated", "healthier-habits", "missed-day"],
    links: [progress],
  },
  {
    id: "weight-not-changing",
    category: "motivation",
    question: "Why is my weight not changing?",
    answer:
      "Body weight can be influenced by many factors, including food intake, activity, sleep, stress, medications, hormones, and fluid changes. Weight can also fluctuate naturally. Consider tracking other aspects of progress, such as movement, sleep, strength, energy, and waist measurements if you choose.",
    relatedIds: ["health-without-weight-loss", "notice-changes", "stay-motivated"],
    links: [progress, movement],
  },
  {
    id: "health-without-weight-loss",
    category: "motivation",
    question: "Can I improve my health without losing weight?",
    answer:
      "Absolutely. Regular movement, balanced meals, better sleep, improved strength, and stress management can all support health, even when your weight stays the same. Your progress is about more than a number on a scale.",
    relatedIds: ["weight-not-changing", "healthier-habits", "beginner-exercises"],
    links: [progress, movement, nutrition],
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
    relatedIds: ["missed-day", "healthier-habits", "notice-changes"],
    links: [progress, { href: "/library/guides/thirty-day-habits", label: "Habit ideas" }],
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
