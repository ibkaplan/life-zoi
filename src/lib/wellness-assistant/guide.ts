/**
 * The Wellness Assistant page: six topics and their prepared answers.
 *
 * Every answer is written and stored here. Nothing is generated, and no answer
 * is sent anywhere. The page reads and speaks the same blocks (`answerBlocks`),
 * so the voice always reads what is on the screen.
 *
 * A future live assistant can plug in behind `AnswerSource`: it would take a
 * question id and return the same `GuideAnswer` shape, on the server, after the
 * same wording checks. Until then `PREPARED_SOURCE` is the only source.
 */

export type GuideTopicId = "energy" | "weight" | "eating" | "sleep" | "movement" | "brain";

export type GuideTopic = {
  id: GuideTopicId;
  label: string;
  description: string;
  icon: string;
};

export type GuideLink = { href: string; label: string };

export type GuideAnswer = {
  id: string;
  topic: GuideTopicId;
  question: string;
  /** Short paragraphs that explain the topic. */
  intro: readonly string[];
  /** Practical things to try, shown as a list. */
  tips: readonly string[];
  /** One everyday example. */
  example: string;
  /** When to talk with a doctor or get help. */
  care: string;
  links: readonly GuideLink[];
};

export const GUIDE_TITLE = "LIFEZOI WELLNESS ASSISTANT";
export const GUIDE_WELCOME =
  "Choose a question and discover simple, helpful information about your everyday health and wellbeing.";
export const GUIDE_NOTE =
  "These answers are prepared by LifeZoi for general education. They are not medical advice and they do not diagnose. For a health problem, talk with your doctor.";
export const GUIDE_EMERGENCY =
  "If you have chest pain, trouble breathing, signs of a stroke, or another emergency, call your local emergency number now.";
export const GUIDE_CHOOSE_TOPIC = "Choose a topic";
export const GUIDE_CHOOSE_QUESTION = "Choose a question";
export const GUIDE_BACK = "Back to questions";
export const GUIDE_BACK_TOPICS = "Back to topics";
export const GUIDE_TRY = "What you can try";
export const GUIDE_EXAMPLE = "Example";
export const GUIDE_CARE = "When to talk with a doctor";
export const GUIDE_LISTEN = "Listen to this answer";
export const GUIDE_MORE = "More questions on this topic";
export const GUIDE_SECTIONS = "Related LifeZoi sections";
export const GUIDE_QUESTIONS_COUNT = "{count} questions";

export const GUIDE_TOPICS: readonly GuideTopic[] = [
  { id: "energy", label: "Energy & Daily Wellness", description: "Tiredness, daily routine, and motivation", icon: "☀️" },
  { id: "weight", label: "Healthy Weight", description: "Gentle weight change, cravings, and fullness", icon: "⚖️" },
  { id: "eating", label: "Healthy Eating & Blood Sugar", description: "Balanced meals, sugar, and fiber", icon: "🥗" },
  { id: "sleep", label: "Sleep & Relaxation", description: "Better nights and calmer days", icon: "🌙" },
  { id: "movement", label: "Movement & Fitness", description: "Walking, balance, strength, and chair yoga", icon: "🚶" },
  { id: "brain", label: "Brain & Longevity", description: "An active mind, friends, and healthy aging", icon: "🧠" },
];

const meals = { href: "/academy/meals", label: "Nutrition" };
const sleepGuide = { href: "/library/guides/better-sleep", label: "Better sleep guide" };
const stressGuide = { href: "/library/guides/stress-relief", label: "Stress relief guide" };
const hiddenSugar = { href: "/library/guides/hidden-sugar", label: "Hidden sugar guide" };
const fiberGuide = { href: "/library/guides/fiber-foods", label: "Fiber foods guide" };
const breakfast = { href: "/library/guides/healthy-breakfast", label: "Healthy breakfast guide" };
const brainGuide = { href: "/library/guides/brain-aging", label: "Brain and aging guide" };
const habitsGuide = { href: "/library/guides/thirty-day-habits", label: "30-day habits guide" };
const balanceGuide = { href: "/library/guides/beginner-balance", label: "Beginner balance guide" };
const chairGuide = { href: "/library/guides/chair-exercises", label: "Chair exercises guide" };
const movement = { href: "/academy/move/resources", label: "Movement" };
const walking = { href: "/academy/move/resources/categories/walking-and-daily-movement", label: "Walking" };
const chairYoga = { href: "/academy/move/resources/categories/chair-yoga", label: "Chair yoga" };
const balance = { href: "/academy/move/resources/categories/balance-and-stability", label: "Balance and stability" };
const strength = { href: "/academy/move/resources/categories/strength-for-beginners", label: "Movement for beginners" };
const breathing = { href: "/academy/move/resources/categories/breathing-and-relaxation", label: "Breathing and relaxation" };
const progress = { href: "/progress", label: "Progress" };
const brainQuiz = { href: "/brain-quiz", label: "Brain & Habit Quiz" };
const community = { href: "/community", label: "Community" };

const CARE_TIRED =
  "See a doctor if tiredness lasts more than a few weeks, comes with weight loss, fever, or shortness of breath, or stops you from doing everyday things. Tiredness can have medical causes that a doctor can check.";
const CARE_CHANGE =
  "If you have a health condition or take regular medicine, ask your doctor before you make a big change to food or activity.";
const CARE_MOOD =
  "If you feel low or without interest most days for more than two weeks, talk with a doctor. If you have thoughts of harming yourself, contact emergency services or a crisis line right away.";
const CARE_WEIGHT =
  "Talk with a doctor if your weight changes quickly without a clear reason, or before you start a strict diet. Do not stop or change any medicine on your own.";
const CARE_SUGAR =
  "Only a blood test can show your blood sugar. Ask your doctor whether you should be tested, and do not change any diabetes medicine on your own.";
const CARE_SLEEP =
  "Talk with a doctor if poor sleep lasts more than a few weeks, if you snore loudly or someone sees you stop breathing in your sleep, or if you feel very sleepy during the day.";
const CARE_MOVE =
  "Stop and contact a doctor if you feel chest pain, dizziness, or unusual shortness of breath while moving. If you have a heart, joint, or balance condition, ask your doctor which activities are safe for you.";
const CARE_FALLS =
  "If you have fallen recently, feel dizzy, or are afraid of falling, tell your doctor. A doctor or physical therapist can check your balance and suggest safe exercises.";
const CARE_MEMORY =
  "If you or your family notice memory changes that affect daily life, talk with a doctor. Some causes of memory trouble can be checked and treated.";

export const GUIDE_ANSWERS: readonly GuideAnswer[] = [
  // Energy & Daily Wellness
  {
    id: "tired-all-the-time",
    topic: "energy",
    question: "Why do I feel tired all the time?",
    intro: [
      "Feeling tired often is very common, and it usually has more than one reason. Short or broken sleep, stress, sitting for long hours, skipped meals, and not drinking enough water can all leave you low on energy.",
      "Sometimes tiredness has a medical cause, such as low iron, thyroid problems, or a side effect of a medicine. That is why lasting tiredness is worth checking with a doctor.",
    ],
    tips: [
      "Go to bed and get up at about the same time every day, even on weekends.",
      "Eat regular meals with some protein, vegetables, and whole grains.",
      "Drink water during the day, not only when you feel very thirsty.",
      "Take a short walk or stretch every hour or two when you sit a lot.",
      "Notice what drains you, such as late screens, worry, or heavy meals, and change one thing at a time.",
    ],
    example: "Keep a simple note for one week: when you slept, what you ate, and how tired you felt. Patterns often become clear.",
    care: CARE_TIRED,
    links: [sleepGuide, walking, meals],
  },
  {
    id: "more-energy",
    topic: "energy",
    question: "How can I have more energy during the day?",
    intro: [
      "Energy during the day depends a lot on small habits: sleep, light, movement, food, and water. Coffee and sweets can give a quick lift, but the lift often fades fast.",
    ],
    tips: [
      "Get daylight in the morning. Open the curtains or step outside for a few minutes.",
      "Start the day with a breakfast that has protein, such as eggs, yogurt, or beans.",
      "Move a little every hour. Stand up, walk to the kitchen, or stretch your arms.",
      "Have a glass of water when you feel a slump before you reach for a snack.",
      "If you nap, keep it short, about 20 minutes, and not late in the afternoon.",
      "Have your last coffee or strong tea by early afternoon so it does not disturb your sleep.",
    ],
    example: "When you feel a slump at 3 p.m., try a 5-minute walk and a glass of water instead of a sweet snack.",
    care: CARE_TIRED,
    links: [walking, breakfast, sleepGuide],
  },
  {
    id: "sleepy-after-meals",
    topic: "energy",
    question: "Why do I feel sleepy after eating?",
    intro: [
      "Feeling a little sleepy after a meal is normal. Your body is busy digesting food, and many people have a natural dip in alertness in the early afternoon.",
      "Large meals, meals with a lot of white bread, sweets, or sugary drinks, and alcohol at lunch can make the feeling stronger.",
    ],
    tips: [
      "Eat smaller portions and stop when you feel comfortably full.",
      "Fill half your plate with vegetables and add some protein.",
      "Choose whole grains instead of white bread, white rice, or pastries.",
      "Take a gentle 10-minute walk after eating.",
      "Make sure you sleep enough at night, because tiredness after meals is stronger when you are short on sleep.",
    ],
    example: "Instead of a big plate of pasta, try a smaller portion with vegetables and chicken or beans, then a short walk.",
    care: "If you often feel very sleepy after meals, or also feel very thirsty or need to pass water often, ask your doctor whether a blood sugar test is a good idea.",
    links: [meals, walking],
  },
  {
    id: "daily-routine",
    topic: "energy",
    question: "How can I improve my daily routine?",
    intro: [
      "A steady routine helps your body know when to be awake, when to eat, and when to rest. It does not need to be strict. A few fixed points in the day are enough.",
    ],
    tips: [
      "Choose a regular wake-up time and a regular bedtime.",
      "Plan three regular meal times so you do not skip meals and overeat later.",
      "Add one short movement time, such as a walk after breakfast.",
      "Put one calm activity in the evening, such as reading, music, or a warm shower.",
      "Prepare small things the night before, like clothes or a lunch box, so mornings feel easier.",
      "Change one thing at a time and keep it for a week before adding the next.",
    ],
    example: "A simple day: wake at 7, breakfast at 7:30, a 10-minute walk at 10, lunch at 1, dinner at 6:30, screens off at 9:30, bed at 10:30.",
    care: CARE_CHANGE,
    links: [habitsGuide, progress],
  },
  {
    id: "feel-motivated",
    topic: "energy",
    question: "How can I feel more motivated?",
    intro: [
      "Motivation often comes after you start, not before. Waiting to feel ready can keep you stuck. Small actions that you can finish build confidence, and confidence builds motivation.",
    ],
    tips: [
      "Choose a goal so small that it feels easy, such as a 5-minute walk.",
      "Link the new habit to something you already do, like stretching after you brush your teeth.",
      "Write down why the change matters to you, for example playing with grandchildren.",
      "Mark each day you do it on a calendar or in LifeZoi Progress.",
      "Do it with a friend or family member, or tell someone your plan.",
      "If you miss a day, simply start again the next day. One missed day does not erase your progress.",
    ],
    example: "Instead of 'I will exercise more', try 'After lunch I will walk around the block'.",
    care: CARE_MOOD,
    links: [progress, habitsGuide],
  },

  // Healthy Weight
  {
    id: "lose-weight-healthy",
    topic: "weight",
    question: "How can I lose weight in a healthy way?",
    intro: [
      "Healthy weight loss is slow and steady. Very strict diets are hard to keep, and the weight often comes back. Small changes that you can keep for years work better than quick fixes.",
      "Food changes usually matter most for weight, and movement helps you keep muscle, mood, and energy.",
    ],
    tips: [
      "Fill half your plate with vegetables, a quarter with protein, and a quarter with whole grains.",
      "Drink water instead of sugary drinks and juice.",
      "Eat slowly and stop when you feel comfortably full.",
      "Keep sweets and snacks for special times, not every day.",
      "Walk most days and add some strength exercises to protect your muscles.",
      "Sleep well. Short sleep can make you hungrier.",
      "Notice changes other than weight, such as energy, sleep, and how clothes fit.",
    ],
    example: "Swap one sugary drink a day for water, and add one vegetable to dinner. Keep these two changes for a month before adding more.",
    care: CARE_WEIGHT,
    links: [meals, walking, progress],
  },
  {
    id: "gaining-weight",
    topic: "weight",
    question: "Why am I gaining weight?",
    intro: [
      "Weight gain usually happens slowly, and there is often more than one reason. Common reasons are eating larger portions, more snacks or sugary drinks, less movement, poor sleep, and stress.",
      "With age, the body often has less muscle, so it needs a little less food. Some medicines and some health conditions, such as thyroid problems, can also affect weight.",
    ],
    tips: [
      "Look at what changed recently: a new job, less walking, more eating out, or stress.",
      "Keep a simple food note for a few days to see portions and snacks honestly.",
      "Watch drinks: juice, soda, sweet coffee drinks, and alcohol add up.",
      "Add strength exercises to help keep muscle as you age.",
      "Keep regular sleep and meal times.",
    ],
    example: "Some people notice that evening snacks in front of the TV add up. Moving the snack to a plate at the table, or having tea instead, can help.",
    care: "If you gain weight quickly without changing your habits, or notice swelling in your legs, talk with a doctor. If you think a medicine is causing weight gain, ask your doctor. Do not stop it on your own.",
    links: [meals, progress],
  },
  {
    id: "sugar-cravings",
    topic: "weight",
    question: "How can I reduce sugar cravings?",
    intro: [
      "Sugar cravings are very common. They are often stronger when you are tired, stressed, hungry, or used to having something sweet at a certain time of day.",
      "The good news is that taste changes. When you eat less sugar for a few weeks, very sweet foods often start to taste too sweet.",
    ],
    tips: [
      "Do not skip meals. Long gaps make cravings stronger.",
      "Add protein and fiber to meals, for example eggs, beans, nuts, or vegetables.",
      "Keep sweets out of sight, or do not buy them every week.",
      "When a craving comes, drink water and wait 10 minutes. It often passes.",
      "Choose fruit, plain yogurt with berries, or a few nuts when you want something sweet.",
      "Cut down slowly, for example one less spoon of sugar in tea each week.",
    ],
    example: "If you always want something sweet after lunch, try a short walk or a cup of herbal tea right after you eat.",
    care: "If cravings come with strong thirst, frequent need to pass water, or weight loss without trying, talk with a doctor.",
    links: [hiddenSugar, meals],
  },
  {
    id: "feel-full-longer",
    topic: "weight",
    question: "What should I eat to feel full longer?",
    intro: [
      "Some foods keep you full much longer than others. Foods with protein, fiber, and water fill you up. White bread, sweets, and sugary drinks are digested quickly, so hunger comes back sooner.",
    ],
    tips: [
      "Protein: eggs, fish, chicken, beans, lentils, plain yogurt, cottage cheese, tofu.",
      "Fiber: vegetables, fruit, oats, whole-grain bread, brown rice, beans.",
      "Water-rich foods: soups, salads, cucumbers, tomatoes, berries.",
      "A small amount of healthy fat: nuts, seeds, olive oil, avocado.",
      "Eat slowly. It takes time for your body to feel full.",
    ],
    example: "Oatmeal with berries and a spoon of nuts usually keeps you full longer than a white roll with jam.",
    care: CARE_CHANGE,
    links: [fiberGuide, breakfast, meals],
  },
  {
    id: "avoid-overeating",
    topic: "weight",
    question: "How can I avoid overeating?",
    intro: [
      "Overeating often happens when we are very hungry, eating fast, distracted, stressed, or eating from a large package. Small changes to how you eat can help as much as what you eat.",
    ],
    tips: [
      "Eat regular meals so you do not get extremely hungry.",
      "Use a smaller plate and serve food in the kitchen, not from big dishes on the table.",
      "Eat slowly, put the fork down between bites, and chew well.",
      "Turn off the TV and phone while you eat.",
      "Before taking a second helping, wait 10 minutes and drink some water.",
      "Put snacks in a small bowl instead of eating from the package.",
      "Ask yourself: am I hungry, or am I bored, tired, or upset?",
    ],
    example: "At dinner, serve your plate once, sit at the table, and enjoy the meal without a screen.",
    care: "If you often feel you cannot stop eating, or eating causes you a lot of worry or guilt, talk with a doctor. Help is available.",
    links: [meals, progress],
  },

  // Healthy Eating & Blood Sugar
  {
    id: "what-is-prediabetes",
    topic: "eating",
    question: "What is prediabetes?",
    intro: [
      "Prediabetes means your blood sugar is higher than normal, but not high enough to be called type 2 diabetes. Many people with prediabetes have no symptoms and do not know they have it.",
      "Prediabetes is important because it is a warning sign. Healthy habits can often help bring blood sugar back toward a normal range. Only a blood test can show whether you have it.",
    ],
    tips: [
      "Ask your doctor about a blood sugar test, especially if you are overweight, not very active, or have family members with diabetes.",
      "Move more. Walking most days helps your body use sugar.",
      "Choose water instead of sugary drinks.",
      "Eat more vegetables, beans, and whole grains, and fewer sweets and white bread.",
      "If you are overweight, even a modest weight loss can help.",
      "Sleep well and look for ways to manage stress.",
    ],
    example: "A short walk after dinner and water instead of soda are two simple first steps.",
    care: CARE_SUGAR,
    links: [meals, walking, hiddenSugar],
  },
  {
    id: "stable-blood-sugar",
    topic: "eating",
    question: "How can I keep my blood sugar stable?",
    intro: [
      "Blood sugar goes up after you eat and comes down later. Big rises and falls can leave you tired, hungry, or craving sweets. Steadier blood sugar usually feels better.",
    ],
    tips: [
      "Eat regular meals and avoid long gaps without food.",
      "Combine carbohydrates with protein and fiber, for example bread with eggs, or fruit with yogurt.",
      "Choose whole grains, beans, and vegetables instead of white bread, white rice, and pastries.",
      "Limit sugary drinks, juice, and sweets.",
      "Walk for 10 to 15 minutes after meals.",
      "Sleep enough and manage stress, because both affect blood sugar.",
    ],
    example: "Instead of white toast with jam, try whole-grain toast with an egg and a tomato.",
    care: CARE_SUGAR,
    links: [meals, walking],
  },
  {
    id: "balanced-meal",
    topic: "eating",
    question: "What is a balanced meal?",
    intro: [
      "A balanced meal gives your body a mix of what it needs: vegetables, protein, whole grains or starchy foods, and a little healthy fat. A simple way to remember it is the plate method.",
    ],
    tips: [
      "Half the plate: vegetables or salad, such as broccoli, carrots, cabbage, tomatoes, or greens.",
      "A quarter of the plate: protein, such as fish, chicken, eggs, beans, lentils, or tofu.",
      "A quarter of the plate: whole grains or starchy foods, such as brown rice, buckwheat, potatoes, or whole-grain bread.",
      "A little healthy fat, such as olive oil, nuts, or seeds.",
      "Water, or unsweetened tea, to drink.",
    ],
    example: "Baked fish, a large salad with olive oil, and a small portion of buckwheat or potatoes.",
    care: "If you have a condition such as diabetes or kidney disease, your doctor or a dietitian may give you special advice. Follow it.",
    links: [meals, fiberGuide],
  },
  {
    id: "hidden-sugar",
    topic: "eating",
    question: "Which foods contain hidden sugar?",
    intro: [
      "Many foods that do not taste very sweet still contain added sugar. Reading labels helps you find it. Sugar has many names, such as sucrose, glucose syrup, corn syrup, dextrose, fructose, honey, and malt.",
    ],
    tips: [
      "Flavored yogurts and yogurt drinks.",
      "Breakfast cereals and granola.",
      "Ketchup, barbecue sauce, salad dressings, and ready-made sauces.",
      "Fruit juices, smoothies, sports drinks, and iced tea.",
      "White bread, crackers, and cereal bars.",
      "'Low fat' products, which sometimes have extra sugar for taste.",
      "Check the label: when sugar or a sugar name is near the start of the ingredient list, the food has a lot of it.",
    ],
    example: "Choose plain yogurt and add fresh berries yourself instead of buying fruit-flavored yogurt.",
    care: CARE_CHANGE,
    links: [hiddenSugar, { href: "/food-labels", label: "Food labels" }],
  },
  {
    id: "why-fiber",
    topic: "eating",
    question: "Why is fiber important?",
    intro: [
      "Fiber is the part of plant foods that your body does not fully digest. It helps digestion, keeps you full longer, supports steadier blood sugar, and feeds the helpful bacteria in your gut.",
      "Many people eat less fiber than is recommended.",
    ],
    tips: [
      "Vegetables and fruit, especially with the skin when it can be eaten.",
      "Beans, lentils, and chickpeas.",
      "Oats, buckwheat, brown rice, and whole-grain bread.",
      "Nuts and seeds, such as flaxseed or chia.",
      "Add fiber slowly and drink more water, so your stomach can get used to it.",
    ],
    example: "Add a spoon of flaxseed and some berries to your morning oatmeal, and a handful of beans to soup.",
    care: "If you have a bowel condition, or a lasting change in your bowel habits, talk with a doctor before adding a lot of fiber.",
    links: [fiberGuide, meals],
  },

  // Sleep & Relaxation
  {
    id: "sleep-better",
    topic: "sleep",
    question: "How can I sleep better?",
    intro: [
      "Good sleep helps your energy, mood, memory, and health. Most adults need 7 to 9 hours of sleep. Small changes in your daily habits and bedroom often help a lot.",
    ],
    tips: [
      "Go to bed and get up at the same time every day.",
      "Get daylight in the morning and move during the day.",
      "Keep your bedroom dark, quiet, and cool.",
      "Avoid coffee and strong tea from the afternoon onward.",
      "Avoid heavy meals and alcohol close to bedtime.",
      "Put away phones and tablets about an hour before bed.",
      "If you cannot fall asleep after about 20 minutes, get up, do something calm in dim light, and go back to bed when sleepy.",
    ],
    example: "A calm evening: dinner by 7, a short walk, a warm shower, reading a paper book, lights off at the same time each night.",
    care: CARE_SLEEP,
    links: [sleepGuide, breathing],
  },
  {
    id: "wake-at-night",
    topic: "sleep",
    question: "Why do I wake up during the night?",
    intro: [
      "Waking up briefly during the night is normal, and it becomes more common with age. It becomes a problem when you cannot fall back asleep or feel tired the next day.",
      "Common reasons include needing the toilet, noise, light, a warm room, pain, worry, alcohol, late coffee, and some medicines. Snoring and breathing pauses during sleep can also wake you.",
    ],
    tips: [
      "Drink less in the last two hours before bed, and use the toilet before sleeping.",
      "Keep the room dark and cool. Try earplugs or an eye mask.",
      "Avoid alcohol in the evening. It can make sleep lighter later in the night.",
      "Do not look at the clock or your phone when you wake up.",
      "If worries keep you awake, write them down before bed.",
      "Try slow breathing: breathe in gently, then breathe out a little longer.",
    ],
    example: "If you wake at 3 a.m. and feel restless, try slow breathing for a few minutes instead of checking your phone.",
    care: CARE_SLEEP,
    links: [sleepGuide, breathing],
  },
  {
    id: "relax-before-bed",
    topic: "sleep",
    question: "How can I relax before bedtime?",
    intro: [
      "Your body and mind need time to slow down before sleep. A short, regular evening routine tells your body that it is time to rest.",
    ],
    tips: [
      "Dim the lights about an hour before bed.",
      "Take a warm shower or bath.",
      "Read a paper book or listen to calm music.",
      "Try gentle stretching or slow breathing for 5 minutes.",
      "Write tomorrow's to-do list so it is out of your head.",
      "Drink a warm caffeine-free drink, such as chamomile tea.",
      "Avoid the news, work emails, and arguments late in the evening.",
    ],
    example: "Try this breathing: breathe in through your nose for 4 counts, then breathe out slowly for 6 counts. Repeat 5 to 10 times.",
    care: CARE_SLEEP,
    links: [breathing, sleepGuide, stressGuide],
  },
  {
    id: "reduce-stress",
    topic: "sleep",
    question: "What can I do to reduce everyday stress?",
    intro: [
      "Some stress is a normal part of life. When stress is constant, it can affect sleep, mood, eating, and energy. Simple daily habits can help your body calm down.",
    ],
    tips: [
      "Move your body: a walk is one of the easiest ways to release tension.",
      "Breathe slowly for a few minutes when you feel tense.",
      "Spend time outside in daylight or green spaces.",
      "Talk with a friend or family member you trust.",
      "Break big tasks into small steps, and do one at a time.",
      "Limit news and social media if they make you anxious.",
      "Make time for something you enjoy every day, even 10 minutes.",
    ],
    example: "When you feel overwhelmed, stop, take five slow breaths, and choose just one small next step.",
    care: CARE_MOOD,
    links: [stressGuide, breathing, { href: "/emotional-wellness", label: "Emotional wellness" }],
  },

  // Movement & Fitness
  {
    id: "walking-every-day",
    topic: "movement",
    question: "How much walking do I need every day?",
    intro: [
      "The World Health Organization suggests that adults get at least 150 minutes of moderate activity a week. Brisk walking counts. That is about 30 minutes on 5 days a week.",
      "If that sounds like a lot, start smaller. Any amount of walking is better than none, and short walks add up.",
    ],
    tips: [
      "Start with 5 to 10 minutes a day and add a few minutes each week.",
      "Split it up: three 10-minute walks count as much as one 30-minute walk.",
      "Walk at a pace where you can talk but not sing.",
      "Walk after meals, to the shop, or while talking on the phone.",
      "Wear comfortable shoes and choose safe, even paths.",
    ],
    example: "Week one: a 10-minute walk after lunch. Week two: add a 10-minute walk after dinner.",
    care: CARE_MOVE,
    links: [walking, movement, progress],
  },
  {
    id: "chair-yoga",
    topic: "movement",
    question: "Is chair yoga beneficial?",
    intro: [
      "Yes. Chair yoga is a gentle way to move your body while sitting on a chair or holding it for support. It can help flexibility, posture, breathing, and relaxation.",
      "It is a good choice for people who find standing exercise hard, are returning to activity, or worry about balance.",
    ],
    tips: [
      "Use a sturdy chair without wheels, placed against a wall.",
      "Sit tall with both feet flat on the floor.",
      "Move slowly and breathe calmly. Never hold your breath.",
      "Stop any movement that causes pain.",
      "Start with 10 minutes and build up as you feel ready.",
    ],
    example: "Seated twist: sit tall, place your right hand on the outside of your left knee, and gently turn your upper body to the left. Breathe, come back, and repeat on the other side.",
    care: CARE_MOVE,
    links: [chairYoga, chairGuide],
  },
  {
    id: "improve-balance",
    topic: "movement",
    question: "How can I improve my balance?",
    intro: [
      "Balance can be trained at any age. Good balance helps you walk with confidence and lowers the chance of falling. Short, regular practice works best.",
    ],
    tips: [
      "Always practice next to a sturdy chair, counter, or wall you can hold.",
      "Stand on one foot for a few seconds, then switch. Hold on if you need to.",
      "Walk heel to toe along a hallway, as if on a line.",
      "Stand up from a chair and sit down slowly, several times, without using your hands if you can.",
      "Try tai chi or gentle yoga classes.",
      "Keep floors clear, use good lighting, and wear shoes with good grip.",
    ],
    example: "While waiting for the kettle, hold the counter and stand on one foot for 10 seconds, then the other.",
    care: CARE_FALLS,
    links: [balance, balanceGuide],
  },
  {
    id: "strength-training",
    topic: "movement",
    question: "Why is strength training important?",
    intro: [
      "Muscles naturally get weaker with age if we do not use them. Strength exercises help you carry shopping, climb stairs, get up from a chair, and keep your balance. They also support your bones and joints.",
      "The World Health Organization suggests muscle-strengthening activities on at least 2 days a week for adults.",
    ],
    tips: [
      "You do not need a gym. Your own body weight is enough to start.",
      "Sit-to-stand from a chair.",
      "Wall push-ups: push away from a wall with your hands at shoulder height.",
      "Lift water bottles or light weights to work your arms.",
      "Heel raises while holding the back of a chair.",
      "Start with a few repetitions, move slowly, and rest between sets.",
    ],
    example: "Twice a week: 10 sit-to-stands, 10 wall push-ups, and 10 heel raises. Repeat the set once or twice.",
    care: CARE_MOVE,
    links: [strength, movement],
  },
  {
    id: "active-as-i-age",
    topic: "movement",
    question: "How can I stay active as I age?",
    intro: [
      "Staying active helps you stay independent, keep your balance, sleep better, and feel good. It is never too late to start, and you can adapt activities to your abilities.",
    ],
    tips: [
      "Mix different kinds of movement: walking, strength, balance, and stretching.",
      "Choose activities you enjoy, such as dancing, swimming, gardening, or walking with friends.",
      "Sit less. Stand up and move a little every hour.",
      "Join a group or class. It makes activity social and regular.",
      "Start slowly and increase step by step.",
      "On days with less energy, do something gentle instead of nothing.",
    ],
    example: "A week could look like: walks on most days, chair exercises twice a week, and a dance or tai chi class on the weekend.",
    care: CARE_MOVE,
    links: [movement, chairYoga, walking],
  },

  // Brain & Longevity
  {
    id: "brain-active",
    topic: "brain",
    question: "How can I keep my brain active?",
    intro: [
      "The brain likes new challenges. Learning new things, staying curious, and using your mind in different ways help keep it active at any age.",
    ],
    tips: [
      "Learn something new: a language, an instrument, a recipe, or a craft.",
      "Read, do puzzles, crosswords, or play board games.",
      "Change routines sometimes, such as taking a new walking route.",
      "Talk with people and share stories. Conversation is good exercise for the brain.",
      "Stay physically active. Movement supports the brain too.",
      "Sleep well. The brain needs sleep to store memories.",
    ],
    example: "Learn five new words in another language each week, and use them with a friend or family member.",
    care: CARE_MEMORY,
    links: [brainQuiz, brainGuide],
  },
  {
    id: "brain-habits",
    topic: "brain",
    question: "What habits support brain health?",
    intro: [
      "Many of the same habits that are good for your heart are also good for your brain. Healthy blood vessels help bring blood and oxygen to the brain.",
    ],
    tips: [
      "Move regularly, such as walking most days.",
      "Eat plenty of vegetables, fruit, beans, whole grains, fish, and nuts.",
      "Get enough good-quality sleep.",
      "Do not smoke, and limit alcohol.",
      "Stay connected with friends and family.",
      "Keep learning and stay curious.",
      "Have your blood pressure, blood sugar, and hearing checked, as your doctor advises.",
    ],
    example: "A brain-friendly day: a morning walk, a lunch with vegetables and fish, a phone call with a friend, and a good night's sleep.",
    care: CARE_MEMORY,
    links: [brainGuide, brainQuiz, meals],
  },
  {
    id: "social-interaction",
    topic: "brain",
    question: "Why is social interaction important?",
    intro: [
      "People need people. Feeling connected to others supports mood, gives a sense of purpose, and keeps the mind active. Loneliness and isolation can affect both mental and physical health.",
      "What matters most is the quality of connection, not the number of friends.",
    ],
    tips: [
      "Call or visit one friend or family member each week.",
      "Join a club, class, choir, walking group, or place of worship.",
      "Volunteer. Helping others also helps you feel good.",
      "Say hello to neighbors and chat with people you meet.",
      "If going out is hard, try video calls or online groups.",
      "Share a meal with someone when you can.",
    ],
    example: "Set a regular time, such as Sunday afternoon, to call someone you care about.",
    care: CARE_MOOD,
    links: [community, { href: "/life-matters", label: "Your Life Matters" }],
  },
  {
    id: "healthy-aging",
    topic: "brain",
    question: "What daily habits support healthy aging?",
    intro: [
      "Healthy aging is built from many small daily habits. You do not have to change everything at once. Each healthy choice helps, and it is never too late to start.",
    ],
    tips: [
      "Move every day: walk, stretch, and do some strength and balance exercises.",
      "Eat mostly plants: vegetables, fruit, beans, whole grains, and nuts.",
      "Drink water and limit sugary drinks and alcohol.",
      "Sleep at regular times.",
      "Stay connected with people and do things that give you meaning.",
      "Keep your mind busy with learning and hobbies.",
      "Do not smoke, and go to regular check-ups with your doctor.",
    ],
    example: "Pick one habit from this list for this month, such as a daily walk, and add another next month.",
    care: "Regular check-ups help find problems early. Ask your doctor which screenings and vaccines are right for your age.",
    links: [progress, movement, meals],
  },
];

export type AnswerSource = {
  /** Where the answer comes from. Only "prepared" exists today. */
  kind: "prepared";
  answerFor(id: string): GuideAnswer | null;
};

const byId = new Map(GUIDE_ANSWERS.map((item) => [item.id, item]));

export const PREPARED_SOURCE: AnswerSource = {
  kind: "prepared",
  answerFor: (id) => byId.get(id) ?? null,
};

export function topicById(id: string): GuideTopic | null {
  return GUIDE_TOPICS.find((topic) => topic.id === id) ?? null;
}

export function answersInTopic(id: GuideTopicId): GuideAnswer[] {
  return GUIDE_ANSWERS.filter((item) => item.topic === id);
}

type Block = { text: string; kind: "heading" | "paragraph" | "item" };

/**
 * What the Listen button reads, in screen order. The page renders these same
 * strings, so the voice never reads text that is not shown.
 */
export function answerBlocks(answer: GuideAnswer, t: (english: string) => string = (text) => text): Block[] {
  return [
    { text: t(answer.question), kind: "heading" },
    ...answer.intro.map((text) => ({ text: t(text), kind: "paragraph" as const })),
    { text: t(GUIDE_TRY), kind: "heading" },
    ...answer.tips.map((text) => ({ text: t(text), kind: "item" as const })),
    { text: t(GUIDE_EXAMPLE), kind: "heading" },
    { text: t(answer.example), kind: "paragraph" },
    { text: t(GUIDE_CARE), kind: "heading" },
    { text: t(answer.care), kind: "paragraph" },
  ];
}
