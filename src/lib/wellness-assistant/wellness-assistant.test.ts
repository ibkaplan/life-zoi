import { afterEach, describe, expect, it, vi } from "vitest";
import { adapterStatusLabel, completeWithModel, PREPARED_LIBRARY_ADAPTER } from "@/lib/wellness-assistant/adapter";
import {
  LIMITED_SET_MESSAGE,
  SPEECH_STARTS_ONLY_FROM_CLICK,
  WELLNESS_ASSISTANT_EMERGENCY,
  WELLNESS_ASSISTANT_NOTE,
  WELLNESS_ASSISTANT_SUBTITLE,
  WELLNESS_ASSISTANT_TITLE,
  WELLNESS_ASSISTANT_WELCOME,
} from "@/lib/wellness-assistant/copy";
import {
  FEELINGS,
  FEELING_SUPPORT,
  POPULAR_IDS,
  TIRED_EXPLORE,
  WELLNESS_CATEGORIES,
  WELLNESS_QUESTIONS,
  isPopular,
  popularQuestions,
  questionById,
  questionsInCategory,
  relatedQuestions,
} from "@/lib/wellness-assistant/library";
import { matchPreparedQuestions, searchPreparedQuestions } from "@/lib/wellness-assistant/match";
import { clearRecentQuestions, readRecentIds, resetRecentForTests, writeRecentIds } from "@/lib/wellness-assistant/recent";
import {
  SLOWER_SPEECH_RATE,
  USUAL_SPEECH_RATE,
  englishVoices,
  pauseAndResumeSupported,
  recognitionConstructor,
  recognitionFailureMessage,
  speechUnavailableMessage,
  transcriptFromResults,
} from "@/lib/wellness-assistant/speech";
import { categoryBySlug } from "@/lib/wellness/exercise-resources/categories";
import { guideBySlug } from "@/lib/library/guides";
import { exerciseBySlug } from "@/lib/library/movement";

const EXACT_ANSWERS: Record<string, string> = {
  "tired-day":
    "Feeling tired can have many possible causes, including poor sleep, stress, dehydration, irregular meals, or not getting enough physical activity. Try keeping a regular sleep schedule, drinking enough water, eating balanced meals, and taking short movement breaks. If tiredness is persistent, severe, or unusual for you, speak with a healthcare professional.",
  "energy-naturally":
    "Start with small everyday habits. Get enough sleep, drink water regularly, eat balanced meals, enjoy daylight, and move your body in a way that feels comfortable. Short walks and gentle stretching can help you feel more active. Remember that energy levels can change from day to day.",
  "sleepy-after-eating":
    "Feeling sleepy after a meal can happen for several reasons, including meal size, sleep quality, and normal changes in alertness during the day. Try balanced meals with vegetables, protein, and fiber-rich foods. Notice whether very large meals make you feel more tired.",
  "walking-feel-better":
    "Regular walking can support heart health, muscle function, mood, and general fitness. You do not have to walk for a long time at first. Even a short, comfortable walk can be a good starting point. Gradually increase your activity as you feel able.",
  "healthier-habits":
    "Choose one small habit and practice it regularly. For example, take a short walk, add vegetables to one meal, or go to bed at a consistent time. Make your goals realistic. Small steps that you can repeat are often easier to maintain than major changes all at once.",
  "sleep-better":
    "Try going to bed and waking up at similar times each day. Keep your bedroom comfortable and quiet, reduce bright screens before bedtime, and create a relaxing evening routine. Avoid excessive caffeine late in the day. If sleep problems continue, talk with a healthcare professional.",
  "wake-at-night":
    "Nighttime waking can be related to stress, noise, temperature, caffeine, medications, or health conditions. Try noticing patterns in your sleep diary. If waking frequently affects your daily life, consider discussing it with your healthcare professional.",
  "gentle-exercise-relax":
    "Many people find gentle stretching, slow walking, yoga, or breathing exercises relaxing. Choose movements that feel comfortable. You can try a short evening routine and notice how you feel afterward.",
  "feel-stressed":
    "Try taking a few slow, comfortable breaths, stepping outside, listening to calming music, or talking with someone you trust. Gentle movement and a regular daily routine can also help. If stress feels overwhelming or continues for a long time, professional support may help.",
  "crave-sweets":
    "Sweet cravings can be influenced by habits, stress, sleep, hunger, and food availability. Try eating regular balanced meals with protein and fiber. You can also enjoy naturally sweet foods such as whole fruit. You do not need to feel guilty about enjoying something sweet.",
  "sugar-energy":
    "Sugar provides carbohydrates that the body can use for energy. However, sugary drinks and snacks may provide little lasting fullness or nutritional value. Some people notice changes in hunger or energy after consuming sweet foods. Try balanced meals and notice how different choices make you feel.",
  "fruit-vs-added-sugar":
    "Whole fruit contains naturally occurring sugars along with water, fiber, vitamins, and other nutrients. Added sugar is put into foods or drinks during preparation or processing. Whole fruit is generally a nutritious choice. Check food labels to identify added sugars.",
  "reduce-added-sugar":
    "Start by checking labels on drinks, yogurt, cereals, sauces, and packaged foods. Try gradually reducing sugar in coffee and tea. Choose water more often and enjoy whole fruit when you want something sweet. Small changes can become easier with practice.",
  "healthy-breakfast":
    "A balanced breakfast can include protein, fiber, and fruit or vegetables. Examples include eggs with whole-grain toast, plain Greek yogurt with berries and nuts, or oatmeal with seeds. Choose foods that fit your preferences and needs.",
  "gut-health":
    "Fiber-rich foods such as vegetables, fruits, beans, lentils, oats, nuts, and whole grains can support digestive health. Yogurt with live cultures and some fermented foods may also be useful. Increase fiber gradually and drink enough water.",
  "beginner-exercises":
    "Good starting activities may include gentle walking, chair exercises, easy stretching, and supported balance movements. Begin with a comfortable amount of activity and increase gradually. Choose exercises that match your abilities.",
  "chair-yoga":
    "Chair yoga offers gentle movements and stretches that can be adapted for people who prefer exercising while seated. It can help practice flexibility, mobility, and body awareness. Choose a stable chair and avoid movements that cause pain.",
  "improve-balance":
    "Balance practice can include supported standing, gentle weight shifting, heel raises, and controlled side steps. Use a sturdy support when needed. Start slowly and practice in a safe area. If you have frequent falls or significant balance problems, seek professional guidance.",
  "exercise-often":
    "Many adults can work toward 150 minutes of moderate aerobic activity per week, along with muscle-strengthening activities on at least two days. Activity needs vary by age, health, and ability. If you are new to exercise, start gradually.",
  "restart-activity":
    "Yes, many people can begin with gentle activities such as short walks or chair exercises. Start with a comfortable duration and increase slowly. If you have health concerns or physical limitations, ask a healthcare professional about a suitable starting plan.",
  "notice-changes":
    "Everyone is different. Some people notice changes in sleep, energy, mood, or daily routines within days or weeks. Other changes take longer. There is no guaranteed timeline. Focus on your habits and your own observations rather than comparing yourself with others.",
  "weight-not-changing":
    "Body weight can be influenced by food intake, activity, sleep, stress, medications, hormones, and fluid changes. Weight can fluctuate naturally. Consider tracking other aspects of progress, such as movement, sleep, strength, energy, and waist measurements if you choose.",
  "health-without-weight-loss":
    "Absolutely. Regular movement, balanced meals, better sleep, improved strength, and stress management can all support health, even when your weight stays the same. Your progress is about more than a number on a scale.",
  "missed-day":
    "That is completely normal. One missed day does not erase your progress. Simply return to your routine when you are ready. Focus on consistency over time, not perfection.",
  "stay-motivated":
    "Choose goals that matter to you. Keep them small and realistic. Celebrate everyday achievements, such as completing a walk, trying a new healthy meal, or going to bed on time. Record what makes you feel proud. Progress is personal.",
  "water-amount":
    "Water needs vary depending on your activity, climate, health, and other factors. Drink regularly throughout the day and pay attention to thirst. Foods such as fruits and vegetables also provide water. If you have been advised to limit fluids because of a medical condition, follow your healthcare professional's guidance.",
  "sluggish-morning":
    "Morning energy can be affected by sleep quality, sleep timing, stress, and daily routines. Try getting up at a consistent time, opening the curtains for daylight, drinking some water, and doing a few gentle movements. Notice which habits help you start the day comfortably.",
  "active-older":
    "Stay curious and keep moving in ways that suit your abilities. Walking, gentle strength exercises, balance practice, stretching, social activities, and hobbies can all contribute to an active lifestyle. Start at a comfortable level and build gradually.",
  "walk-after-dinner":
    "For many people, a comfortable walk after dinner can be a pleasant way to add movement to the day. Start gently and choose a pace that feels right. If walking after meals causes discomfort or you have medical restrictions, choose another time or ask your healthcare professional.",
  "evening-routine":
    "Choose a few simple activities that help you slow down. You might dim the lights, listen to quiet music, read, stretch gently, or prepare for the next morning. Try to keep your bedtime consistent.",
  "more-protein":
    "Include protein-rich foods throughout the day. Examples include eggs, fish, chicken, Greek yogurt, cottage cheese, beans, lentils, tofu, nuts, and seeds. Try adding one protein-rich food to breakfast, lunch, and dinner. Individual protein needs vary.",
  "carbohydrates":
    "No. Carbohydrates are an important source of energy. Foods such as whole grains, beans, fruits, and vegetables also provide fiber and nutrients. Instead of avoiding all carbohydrates, focus on food quality, portions, and balanced meals.",
  "supermarket":
    "Compare Nutrition Facts labels. Look at added sugars, sodium, fiber, protein, and serving sizes. Compare similar products rather than relying only on front-of-package claims. Choose foods that fit your needs, preferences, and budget.",
  "healthy-fats":
    "Unsaturated fats are found in foods such as olive oil, avocados, walnuts, seeds, and fatty fish. Replacing some saturated fats with unsaturated fats can support heart health. Fats are still energy-rich, so enjoy them in appropriate amounts.",
  "strength-training":
    "Strength exercises help maintain muscle function and support everyday activities such as standing up, carrying groceries, and climbing stairs. You can begin with gentle bodyweight exercises or suitable resistance bands. Choose a safe level for your abilities.",
  "flexibility":
    "Gentle stretching and regular mobility exercises can help you practice comfortable movement. Move slowly, avoid bouncing, and do not force a stretch. Consistency matters more than stretching as far as possible.",
  "sit-all-day":
    "Try taking regular movement breaks. Stand up if you can, walk around briefly, stretch your shoulders, or try gentle seated exercises. Small movement breaks can help reduce long periods of uninterrupted sitting.",
  "measure-progress":
    "You can track your movement minutes, exercise sessions, sleep, energy, mood, waist measurements, and personal achievements. You might notice that walking feels easier or that you have more confidence with everyday activities. Choose the measurements that matter to you.",
  "bloated":
    "Bloating can have many possible causes, including eating patterns, certain foods, constipation, and digestive conditions. Eating slowly, drinking enough water, and increasing fiber gradually may help some people. If bloating is persistent, painful, or accompanied by concerning symptoms, seek medical advice.",
  "clothes-fit":
    "Yes. Clothing fit can change for several reasons, including body measurements, fluid changes, and how your body composition changes. Weight alone does not tell the whole story. If you choose, track waist or other measurements over time using consistent methods.",
  "non-scale":
    "Non-scale victories are positive changes that are not measured by body weight. Examples include sleeping better, feeling stronger, walking farther, having more energy, or feeling more confident. These achievements are important parts of your personal wellness journey.",
  "realistic-goals":
    "Choose one or two changes that feel manageable. Make your goal specific and practical. For example, walk for ten minutes three times this week or add vegetables to lunch each day. Review your progress and adjust your goals when needed.",
  "first-week":
    "Take a moment to recognize what you accomplished. Review your movement, nutrition, sleep, and personal observations. Choose one habit you would like to continue and one small new goal for the next week.",
  "recognize-improvements":
    "Look at your own records over time. You may notice better sleep, more regular movement, improved confidence, or easier everyday activities. Write down what you observe. Your progress does not need to look like anyone else's.",
  "blood-pressure":
    "Blood pressure measurements can help you understand an important part of your cardiovascular health. High blood pressure often has no noticeable symptoms, so regular measurement may be useful. Discuss your readings and any concerns with your healthcare professional.",
  "blood-sugar":
    "Blood sugar, also called blood glucose, is the amount of glucose in your blood. Your body uses glucose as an energy source. Blood glucose can change after meals, activity, stress, and during illness. Your healthcare professional can explain your personal test results.",
  "hba1c":
    "HbA1c is a blood test that reflects your average blood glucose over approximately the previous three months. It is used by healthcare professionals to assess blood sugar levels and help evaluate diabetes risk or management. Your result should be interpreted using appropriate clinical guidance.",
  "checkups":
    "Regular checkups give you an opportunity to discuss your health, review medications, ask questions, and understand which screening tests may be appropriate for your age and personal history. Your healthcare professional can help determine what you need.",
  "heart-habits":
    "Healthy habits such as regular physical activity, balanced meals, not smoking, sufficient sleep, and managing stress can support cardiovascular health. Small, consistent choices can contribute to a healthier lifestyle. Your personal health needs may require additional medical guidance.",
  "when-to-talk":
    "Speak with a healthcare professional if you have persistent symptoms, unexplained changes in your health, or questions about medications or test results. Seek urgent help for severe or sudden symptoms such as chest pain, severe difficulty breathing, fainting, or signs of stroke.",
};

const UNSAFE_ANSWER =
  /stop taking|change (?:your|the) dose|you have (?:diabetes|cancer|hypertension)|prevents (?:disease|cancer|diabetes|heart disease)|guaranteed weight|lose \d+ pounds|prescrib|diagnosis of|take \d+\s*mg|openai|api[_ -]?key/i;

function memoryStorage() {
  const data = new Map<string, string>();
  return {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => {
      data.set(key, value);
    },
    removeItem: (key: string) => {
      data.delete(key);
    },
  };
}

describe("prepared wellness assistant", () => {
  afterEach(() => {
    resetRecentForTests();
    vi.unstubAllGlobals();
  });

  it("shows the prepared assistant wording", () => {
    expect(WELLNESS_ASSISTANT_TITLE).toBe("LIFEZOI WELLNESS ASSISTANT");
    expect(WELLNESS_ASSISTANT_SUBTITLE).toBe("Your everyday companion for healthier living.");
    expect(WELLNESS_ASSISTANT_WELCOME).toBe(
      "How are you feeling today? Let's find a helpful next step together.",
    );
    expect(WELLNESS_ASSISTANT_NOTE).toBe(
      "LifeZoi Wellness Assistant provides prepared educational information to support everyday wellness. It is not a live AI medical service and does not diagnose or treat health conditions.",
    );
    expect(WELLNESS_ASSISTANT_EMERGENCY).toContain("emergency services");
    expect(WELLNESS_ASSISTANT_EMERGENCY).toContain("healthcare professional");
    expect(LIMITED_SET_MESSAGE).toBe(
      "I don't have a prepared answer for that exact question yet. Please choose one of the topics below.",
    );
    expect(SPEECH_STARTS_ONLY_FROM_CLICK).toBe(true);
  });

  it("stores the 50 exact answers in seven categories", () => {
    expect(WELLNESS_QUESTIONS).toHaveLength(50);
    expect(new Set(WELLNESS_QUESTIONS.map((item) => item.id)).size).toBe(50);
    expect(WELLNESS_CATEGORIES.map((item) => item.label)).toEqual([
      "Energy & Daily Wellness",
      "Sleep & Relaxation",
      "Nutrition & Sugar",
      "Movement & Fitness",
      "Weight & Body Wellness",
      "Motivation & Personal Progress",
      "Health Awareness",
    ]);
    expect(questionsInCategory("energy")).toHaveLength(8);
    expect(questionsInCategory("sleep")).toHaveLength(6);
    expect(questionsInCategory("nutrition")).toHaveLength(10);
    expect(questionsInCategory("movement")).toHaveLength(8);
    expect(questionsInCategory("weight")).toHaveLength(5);
    expect(questionsInCategory("motivation")).toHaveLength(7);
    expect(questionsInCategory("awareness")).toHaveLength(6);
    expect(questionsInCategory("all")).toHaveLength(50);
    for (const item of WELLNESS_QUESTIONS) {
      expect(item.answer).toBe(EXACT_ANSWERS[item.id]);
      expect(item.answer).not.toMatch(UNSAFE_ANSWER);
      expect(item.question).not.toMatch(/openai|api[_ -]?key/i);
    }
  });

  it("connects three related questions by id, including the sweets example", () => {
    for (const item of WELLNESS_QUESTIONS) {
      expect(item.relatedIds.length).toBeGreaterThanOrEqual(2);
      expect(item.relatedIds.length).toBeLessThanOrEqual(3);
      expect(new Set(item.relatedIds).size).toBe(3);
      expect(item.relatedIds).not.toContain(item.id);
      expect(relatedQuestions(item.id).map((related) => related.id)).toEqual([...item.relatedIds]);
    }
    expect(relatedQuestions("crave-sweets").map((item) => item.question)).toEqual([
      "How can I reduce added sugar?",
      "Does sugar give me energy?",
      "What is a healthy breakfast?",
    ]);
  });

  it("keeps popular questions and section links inside the existing app", () => {
    expect(popularQuestions().map((item) => item.id)).toEqual([...POPULAR_IDS]);
    expect(isPopular("sleep-better")).toBe(true);
    expect(isPopular("wake-at-night")).toBe(false);
    const staticRoutes = new Set([
      "/academy/meals",
      "/academy/move/resources",
      "/progress",
      "/choices/sleep",
      "/lab-results",
    ]);
    for (const item of WELLNESS_QUESTIONS) {
      expect(item.links.length).toBeGreaterThan(0);
      for (const link of item.links) {
        expect(link.label.length).toBeGreaterThan(0);
        if (link.href.startsWith("/library/guides/")) {
          expect(guideBySlug(link.href.slice("/library/guides/".length))).toBeTruthy();
        } else if (link.href.startsWith("/library/move/")) {
          expect(exerciseBySlug(link.href.slice("/library/move/".length))).toBeTruthy();
        } else if (link.href.startsWith("/academy/move/resources/categories/")) {
          expect(categoryBySlug(link.href.slice("/academy/move/resources/categories/".length))).toBeTruthy();
        } else {
          expect(staticRoutes.has(link.href)).toBe(true);
        }
      }
    }
    expect(questionById("chair-yoga")?.links.some((link) => link.href.includes("/academy/move"))).toBe(true);
    expect(questionById("improve-balance")?.links.some((link) => link.href.includes("balance"))).toBe(true);
    expect(questionById("crave-sweets")?.links.some((link) => link.href === "/academy/meals")).toBe(true);
    expect(questionById("stay-motivated")?.links.some((link) => link.href === "/progress")).toBe(true);
    expect(questionsInCategory("nutrition").every((item) => item.links.some((link) => link.href === "/academy/meals"))).toBe(true);
    expect(questionsInCategory("movement").every((item) => item.links.some((link) => link.href === "/academy/move/resources"))).toBe(true);
    expect(questionsInCategory("weight").every((item) => item.links.some((link) => link.href === "/progress"))).toBe(true);
    expect(questionsInCategory("motivation").every((item) => item.links.some((link) => link.href === "/progress"))).toBe(true);
    expect(FEELING_SUPPORT).toBe("Thank you for sharing. Let's explore a few simple ideas that may help.");
    expect(FEELINGS.map((item) => item.label)).toEqual([
      "I feel tired",
      "I am having trouble sleeping",
      "I crave sweets",
      "I want to lose weight",
      "I have no motivation",
      "I want to become stronger",
      "I feel stressed",
      "I want to eat healthier",
      "I want to move more",
      "I want to improve my daily habits",
      "I feel bloated",
      "I want to improve my balance",
      "I feel good and want to improve further",
    ]);
    const tired = FEELINGS.find((item) => item.id === "tired");
    expect(tired?.note).toBe(TIRED_EXPLORE);
    expect(tired?.prompts?.map((prompt) => prompt.label)).toEqual([
      "How well have you been sleeping?",
      "How often do you move during the day?",
      "Are you eating regular balanced meals?",
    ]);
    for (const feeling of FEELINGS) {
      for (const id of feeling.questionIds) expect(questionById(id)).toBeTruthy();
      for (const prompt of feeling.prompts ?? []) expect(questionById(prompt.questionId)).toBeTruthy();
    }
  });

  it("searches and matches only the prepared library", () => {
    expect(searchPreparedQuestions("").map((item) => item.id)).toEqual(WELLNESS_QUESTIONS.map((item) => item.id));
    expect(searchPreparedQuestions("sleep better").map((item) => item.id)).toContain("sleep-better");
    expect(questionsInCategory("nutrition").every((item) => item.category === "nutrition")).toBe(true);
    const sweets = matchPreparedQuestions("Why do I crave sweets?");
    expect(sweets.confident).toBe(true);
    expect(sweets.selectedId).toBe("crave-sweets");
    expect(sweets.matches.every((item) => WELLNESS_QUESTIONS.includes(item))).toBe(true);
    const missing = matchPreparedQuestions("What medication dose should I take for chest pain?");
    expect(missing.confident).toBe(false);
    expect(missing.selectedId).toBeNull();
    expect(missing.matches.every((item) => questionById(item.id)?.answer)).toBe(true);
    const fiber = searchPreparedQuestions("fiber");
    expect(fiber.map((item) => item.id)).toContain("gut-health");
  });

  it("keeps recently selected ids in the storage that is passed in", () => {
    const storage = memoryStorage();
    const allowed = WELLNESS_QUESTIONS.map((item) => item.id);
    expect(readRecentIds(storage, allowed)).toEqual([]);
    writeRecentIds(storage, ["sleep-better", "not-a-question", "sleep-better", "tired-day"]);
    expect(readRecentIds(storage, allowed)).toEqual(["sleep-better", "tired-day"]);
    clearRecentQuestions(storage);
    expect(readRecentIds(storage, allowed)).toEqual([]);
    expect(JSON.stringify(storage)).not.toContain("localStorage");
  });

  it("leaves the model adapter disabled and offline", async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    expect(PREPARED_LIBRARY_ADAPTER.enabled).toBe(false);
    expect(PREPARED_LIBRARY_ADAPTER.provider).toBe("none");
    expect(adapterStatusLabel()).toContain("No language model");
    const result = await completeWithModel("How can I sleep better?");
    expect(result.ok).toBe(false);
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(questionById("sleep-better")?.answer).toContain("bedtime");
  });

  it("keeps speech local, optional, and click-started", () => {
    expect(USUAL_SPEECH_RATE).toBe(1);
    expect(SLOWER_SPEECH_RATE).toBeLessThan(USUAL_SPEECH_RATE);
    expect(englishVoices([
      { name: "Samantha", lang: "en-US" },
      { name: "Thomas", lang: "fr-FR" },
      { name: "Daniel", lang: "en_GB" },
    ]).map((voice) => voice.name)).toEqual(["Samantha", "Daniel"]);
    expect(pauseAndResumeSupported({ pause: () => undefined, resume: () => undefined })).toBe(true);
    expect(pauseAndResumeSupported({ pause: () => undefined })).toBe(false);
    expect(speechUnavailableMessage(false, true)).toContain("No English voice");
    expect(speechUnavailableMessage(true, false)).toContain("does not offer speech");
    expect(speechUnavailableMessage(true, true)).toBeNull();
    expect(recognitionConstructor()).toBeNull();
    expect(recognitionFailureMessage("not-allowed")).toContain("permission was denied");
    expect(recognitionFailureMessage("aborted")).toBeNull();
    expect(transcriptFromResults({ results: [{ 0: { transcript: "how can I sleep" } }, { 0: { transcript: "better" } }] })).toBe(
      "how can I sleep better",
    );
  });
});
