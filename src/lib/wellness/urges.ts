import type { LessonBlock } from "@/lib/wellness/types";
import type { NextChoice, SupportFlag, UrgeFactor } from "@/lib/wellness/types";

function block(
  heading: string,
  body: string,
  sourceIds: string[],
  evidence: LessonBlock["evidence"],
  evidenceNote: string,
): LessonBlock {
  return { heading, body, sourceIds, evidence, evidenceNote };
}

export type UrgeLesson = {
  slug: string;
  title: string;
  summary: string;
  blocks: LessonBlock[];
  actions: string[];
  challengeId?: string;
};

export const URGE_LESSONS: UrgeLesson[] = [
  {
    slug: "late-night-sugar",
    title: "Late-night sugar",
    summary: "A sweet at night can be hunger, a place, or a habit. You can be curious about which one it is.",
    challengeId: "late-night",
    blocks: [
      block(
        "Why it matters",
        "Evening sweets are easy to repeat because the cue is often the same: a show, the kitchen, or the end of a long day. Noticing the cue is a skill. It is not a verdict about your character.",
        ["nih-habits"],
        "established",
        "NIH’s habit page describes cues and repetition. It does not assign a stop-eating hour.",
      ),
      block(
        "What you can sort out",
        "Ask whether you are physically hungry, thirsty, or following a habit. If you are hungry, eat an ordinary meal or snack. Water is for thirst, and only if a clinician has not limited your fluids. A sweet can still be eaten on a plate, with attention, if you want it.",
        ["medlineplus-water", "nih-habits", "cdc-rethink-drink"],
        "established",
        "CDC separates added sugars in drinks from sugars that occur in milk and fruit. lifeZoi does not turn that into a ban.",
      ),
      block(
        "What research says",
        "NIH describes changing a habit by noticing the trigger and making a specific plan. A separate open-access feasibility study on PubMed Central tested planning plus self-monitoring for people who wanted to change sugar intake. That study had no comparison group, so it is early evidence, not proof that a plan works for every person.",
        ["nih-habits", "pmc-sugar-planning"],
        "emerging",
        "The NIH steps are public habit education. The PMC paper is emerging because it is a pre-post feasibility study.",
      ),
    ],
    actions: [
      "Name hunger, thirst, or habit before you decide.",
      "If you are hungry, eat.",
      "If you want something sweet, put a portion on a plate.",
      "If you are not hungry, open Choose Your Moment.",
      "Keep one note about what the evening was like.",
    ],
  },
  {
    slug: "emotional-eating",
    title: "Emotional eating",
    summary: "Food sometimes shows up beside a feeling. That pattern is worth noticing. It is not a name for every craving.",
    challengeId: "stress-eating",
    blocks: [
      block(
        "Why it matters",
        "MedlinePlus describes emotional eating as eating to cope with difficult emotions, and says the soothing effect can be temporary. A feeling and an appetite can also be present together. lifeZoi will not relabel every craving as emotional eating.",
        ["medlineplus-emotional-eating"],
        "established",
        "MedlinePlus patient instructions, reviewed September 4, 2024. The page is education, not a diagnosis.",
      ),
      block(
        "What you can sort out",
        "Mayo Clinic describes eating in response to stress, boredom, loneliness, and other feelings, and also says some people eat less when emotions are strong. A diary of what you wanted, when, how you felt, and whether you were hungry can show your own pattern. lifeZoi does not use that diary to set a calorie limit or to assign guilt.",
        ["mayo-emotional-eating", "medlineplus-emotional-eating"],
        "established",
        "These are patient-education suggestions. Mayo’s page is framed around weight loss. lifeZoi does not adopt a weight-loss program or a shame cycle.",
      ),
      block(
        "When to ask for help",
        "MedlinePlus says to contact a health professional for frequent loss of control, eating to the point of discomfort, intense shame, or making yourself vomit. NIDDK describes binge eating as a clinical pattern a clinician diagnoses. If this is frequent or the distress is severe, please talk with a qualified professional. lifeZoi cannot diagnose an eating disorder.",
        ["medlineplus-emotional-eating", "niddk-binge", "samhsa-988"],
        "established",
        "The help threshold is public clinical education. It is not applied to you automatically.",
      ),
    ],
    actions: [
      "Write the feeling in a few words, without deciding it caused the urge.",
      "Eat if you are physically hungry.",
      "Talk with someone you trust, or take a short walk if that is available.",
      "Try a hobby, a page of a book, or rest.",
      "Seek professional care if control, distress, binge eating, or restriction feels serious.",
    ],
  },
  {
    slug: "boredom-eating",
    title: "Boredom eating",
    summary: "Boredom can be a cue. It can also be tiredness or hunger wearing a familiar face.",
    challengeId: "choose-moment",
    blocks: [
      block(
        "Why it matters",
        "A quiet stretch of time is not a problem to punish. Mayo Clinic suggests that when boredom, not hunger, is the driver, another activity can take the place of snacking. Rest, learning, and people count as those activities.",
        ["mayo-emotional-eating"],
        "established",
        "Substitution is patient education from the Mayo page. It is an option, not an order.",
      ),
      block(
        "Do not skip a real meal",
        "If your body is asking for food, eat. A pause is for a habit urge when waiting is safe. It does not replace a meal, and water does not replace food.",
        ["medlineplus-water", "nih-habits"],
        "established",
        "lifeZoi’s limit is stated beside the public pages, which already say needs differ.",
      ),
      block(
        "Your record is separate",
        "Mark boredom only when you think it fits. A later chart counts the factors you chose. It does not decide the cause for you.",
        ["mayo-emotional-eating"],
        "individual",
        "Individual notes stay individual. The Mayo page describes a diary. It does not read yours.",
      ),
    ],
    actions: [
      "Ask whether you are hungry.",
      "If yes, eat something ordinary.",
      "If no, pick one Choose Your Moment option, including rest.",
      "Change rooms if the snack is in reach and you are not hungry.",
      "Write one line about what you did with the time.",
    ],
  },
  {
    slug: "portions",
    title: "Overeating and portions",
    summary: "A portion you can see is easier to notice. A second portion is still allowed.",
    challengeId: "late-night",
    blocks: [
      block(
        "Why it matters",
        "MedlinePlus says distracted eating, such as eating in front of a screen, makes it easier to lose track. A plate or bowl gives you a place to pause. The pause is a question, not a lock.",
        ["medlineplus-emotional-eating"],
        "established",
        "The distracted-eating point is MedlinePlus education.",
      ),
      block(
        "Hunger still leads",
        "A large appetite can be ordinary hunger, a long gap since the last meal, or a habit. lifeZoi will not set a calorie target, a fast, or a time when eating must stop.",
        ["nih-habits", "dga-eating-routine"],
        "belief",
        "The Dietary Guidelines fact sheet says there is no single right way to eat. Calorie caps and fasts are not taught here.",
      ),
    ],
    actions: [
      "Put the food on a plate or in a bowl.",
      "Pause before another portion and ask if you are still hungry.",
      "Take more if you are hungry.",
      "Step away from the screen for part of the meal if you can.",
      "Note what happened without calling it a failure.",
    ],
  },
  {
    slug: "sweet-drinks",
    title: "Sweetened drinks",
    summary: "Added sugars in drinks and the sugars in milk or fruit are not the same thing.",
    challengeId: "sugar",
    blocks: [
      block(
        "Why it matters",
        "CDC describes sugary drinks as a common source of added sugars and invites people to rethink the drink. A label can show you what you are choosing. The choice can be gradual.",
        ["cdc-rethink-drink"],
        "established",
        "CDC drink education. lifeZoi does not add a personal sugar quota.",
      ),
      block(
        "Water is not a substitute for food",
        "If you are thirsty and fluids are not restricted, water is one option. If you are hungry, eat. A sweetened drink is not a moral event.",
        ["cdc-water", "medlineplus-water"],
        "established",
        "CDC and MedlinePlus both say fluid needs vary. Neither page sets one target for every adult.",
      ),
    ],
    actions: [
      "Read one drink label for added sugars.",
      "Choose water only if you want it and you are allowed fluids.",
      "Keep a drink you enjoy and make the next one smaller if you want.",
      "Notice whether the drink was thirst, habit, or a break.",
      "Skip the experiment on any day you do not want it.",
    ],
  },
  {
    slug: "smoking",
    title: "Smoking urges",
    summary: "An urge to smoke can rise and fall. You can meet it without shame, and free public help exists.",
    challengeId: "tobacco-alcohol",
    blocks: [
      block(
        "Why it matters",
        "CDC says cigarette smoking harms nearly every organ and that quitting has health benefits. An urge is a moment, not a measure of your worth. lifeZoi does not diagnose addiction and does not recommend a medication change.",
        ["cdc-smoking"],
        "established",
        "CDC cigarette smoking page, September 17, 2024. Detailed risk statements stay on CDC’s page.",
      ),
      block(
        "What you can try",
        "Smokefree.gov, from the National Cancer Institute, offers free quit tools. Changing the cue, delaying when it is safe, or telling someone are options. Text programs on that site may have phone-carrier charges. lifeZoi does not enroll you.",
        ["smokefree", "nih-habits"],
        "established",
        "The tools are public. A delay is not safe in every situation, and it is never a reason to ignore a medical need.",
      ),
      block(
        "Mindfulness research is mixed",
        "NCCIH says mindfulness means attention to the present moment without judgment, and that studies of mindfulness for nicotine withdrawal and craving are part of a research area that is often preliminary. A few slow breaths may help some people notice an urge. They do not eliminate every craving. Stop if the practice feels worse.",
        ["nccih-mindfulness"],
        "emerging",
        "NCCIH, last updated June 2022, describes both interest in these practices and the limits of the evidence.",
      ),
    ],
    actions: [
      "Name the urge and its intensity.",
      "Step away from the usual cue if you can.",
      "Take a few slow breaths, or skip them.",
      "Open Smokefree.gov if you want free tools.",
      "Ask a clinician before any medication change.",
    ],
  },
  {
    slug: "alcohol",
    title: "Alcohol cravings",
    summary: "You can look at an alcohol urge without a lecture. Cutting down and quitting are both valid, and help is public.",
    challengeId: "tobacco-alcohol",
    blocks: [
      block(
        "Why it matters",
        "NIAAA says drinking too much, on one occasion or over time, can affect the brain, heart, liver, pancreas, and immune system. There is no shame in wanting a drink, and no shame in asking for help.",
        ["niaaa-alcohol-body"],
        "established",
        "NIAAA’s effects page. lifeZoi does not assign a personal drink number.",
      ),
      block(
        "Where to look",
        "NIAAA’s health hub lists treatment information and Rethinking Drinking. Counseling or medication, if any, belongs with a clinician. lifeZoi will not start, stop, or change a medicine.",
        ["niaaa-alcohol-hub"],
        "established",
        "The hub is a public directory, not a treatment plan.",
      ),
    ],
    actions: [
      "Write the cue: place, people, feeling, or time.",
      "Choose a smaller amount, a different drink, or a skip, if you want.",
      "Eat if you are hungry. Do not use alcohol as a meal.",
      "Open NIAAA’s hub if you want more support.",
      "Use 988 in the United States if you are in immediate distress.",
    ],
  },
  {
    slug: "avoiding-activity",
    title: "Procrastination and avoiding activity",
    summary: "Not starting is a common stuck point. A tiny start counts, and so does rest.",
    challengeId: "sitting",
    blocks: [
      block(
        "Why it matters",
        "The National Cancer Institute’s research summary on if-then plans describes failing to get started as one reason intentions stall. A plan that names the cue and the next action is a studied method. It is not a demand to push through pain or fatigue.",
        ["nci-if-then"],
        "established",
        "NCI summarizes accumulated research on if-then plans. It is not a personal exercise prescription.",
      ),
      block(
        "Movement that fits today",
        "CDC says adults can break up sitting and that activity can be adjusted to ability. A chair exercise, a short walk, or a decision to rest are all real choices. Not every exercise fits every condition.",
        ["cdc-adult-activity", "cdc-older-activity"],
        "established",
        "CDC adult and older-adult activity pages. Ability and health conditions limit the advice.",
      ),
    ],
    actions: [
      "Write: if I avoid moving, then I will do one seated move or rest on purpose.",
      "Set out shoes or a chair so the choice is visible.",
      "Do two minutes, or skip it if you are ill or in pain.",
      "Mark what you did, including rest.",
      "Ask a clinician or therapist if a condition makes movement unclear.",
    ],
  },
  {
    slug: "stress",
    title: "Stress habits",
    summary: "Stress is a response to something outside you. A habit can sit beside it. Care is allowed.",
    challengeId: "stress-eating",
    blocks: [
      block(
        "Why it matters",
        "NIMH describes stress as the body and mind responding to an external cause, and lists coping steps such as movement, regular meals, breathing, sleep, and support from other people. Those steps are not a substitute for professional mental health care.",
        ["nimh-stress"],
        "established",
        "NIMH fact sheet, NIH Publication No. 20-MH-8125. The text is public domain. Images are not copied.",
      ),
      block(
        "A breath is optional",
        "NCCIH describes some meditation as attention on the breath. Research on stress and anxiety is mixed, and some people feel worse. A short pause does not clear every craving or every feeling. Stop if you feel worse.",
        ["nccih-mindfulness"],
        "emerging",
        "NCCIH treats many mindfulness findings as preliminary and notes reports of unpleasant effects.",
      ),
    ],
    actions: [
      "Name one stressor in a few words.",
      "Eat a regular meal if you are due for one.",
      "Try a walk, rest, or a call.",
      "Write an if-then line for the next hard moment.",
      "Talk with a professional if stress will not ease. In the United States, call or text 988 for immediate distress.",
    ],
  },
  {
    slug: "consistency",
    title: "Consistency",
    summary: "A missed day is not a failure. History stays. You can begin again with one small step.",
    challengeId: "habits-30",
    blocks: [
      block(
        "Why it matters",
        "NIH says setbacks happen and that the useful focus is progress rather than perfection. Several habits can exist at once. Starting with a manageable number is kinder than trying to change everything tonight.",
        ["nih-habits"],
        "established",
        "NIH News in Health, March 2018.",
      ),
      block(
        "Self-monitoring without punishment",
        "MedlinePlus and Mayo Clinic both describe watching your own patterns. In lifeZoi, the record is a reflection. It is not a score, and a quiet week does not erase earlier marks.",
        ["medlineplus-emotional-eating", "mayo-emotional-eating", "nih-habits"],
        "established",
        "The diary idea is patient education. lifeZoi keeps it in this browser tab only.",
      ),
    ],
    actions: [
      "Pick one to three habits if you are just starting.",
      "You may add more later.",
      "Pause a habit if it is too much. The history remains.",
      "Mark a miss as a miss, then leave it there.",
      "Read your week as information, not as a grade.",
    ],
  },
  {
    slug: "late-night-automatic",
    title: "How to Stop Automatic Late-Night Eating",
    summary: "Automatic eating follows a cue. You can change the cue, eat if you are hungry, or spend the time another way.",
    challengeId: "late-night",
    blocks: [
      block(
        "Why it matters",
        "NIH says repeated actions become more automatic and that one step is to change your surroundings. Moving a snack, leaving the room, or putting a book in the usual spot are cue changes. Researchers sometimes study this family of ideas as stimulus control. The page lifeZoi uses is NIH’s habit guide, not a separate trial.",
        ["nih-habits"],
        "established",
        "Cue change is NIH habit education. lifeZoi does not claim a trial result it did not open.",
      ),
      block(
        "An evening can have a plan and still be flexible",
        "An example plan is an illustration. It is not a required clock time. If you are hungry, eat. If you want a sweet, you may have it on a plate. If you are bored and not hungry, Choose Your Moment offers something else to do with the time, including rest.",
        ["nih-habits", "mayo-emotional-eating"],
        "individual",
        "The shape of the example is lifeZoi’s. Your evening is your own record.",
      ),
    ],
    actions: [
      "Notice the first cue of the evening.",
      "Eat if you are hungry.",
      "If you are not hungry, pick a moment: a task, body care, learning, a person, making something, or rest.",
      "Leave one snack where it is if moving it would make food harder to reach when you need it.",
      "Write what you actually did.",
    ],
  },
  {
    slug: "stronger",
    title: "Be Stronger Than Your Urges",
    summary: "Strength here means a choice. It does not mean punishment, hunger, or perfect control.",
    blocks: [
      block(
        "A sentence you can borrow",
        "I can have it, but I don't have to have it right now. Use that sentence for a habit urge. Do not use it to ignore hunger, to restrict food, or to scold yourself.",
        ["nih-habits", "medlineplus-emotional-eating"],
        "individual",
        "The sentence is a prompt. The pages beside it describe cues, coping, and the option to eat when hungry.",
      ),
      block(
        "Offer the time something better",
        "Fighting an urge is only half of the skill. The other half is choosing a use of your attention that you value. Rest counts. A short pause does not eliminate every craving.",
        ["mayo-emotional-eating", "nccih-mindfulness"],
        "emerging",
        "Substitution is patient education. NCCIH describes mindfulness research as mixed and often preliminary.",
      ),
    ],
    actions: [
      "Say the sentence only if you are not physically hungry.",
      "If you are hungry, eat.",
      "Take a few breaths or skip them.",
      "Choose a next action and write what happened.",
      "Ask for professional help if urges often feel out of control.",
    ],
  },
];

export function urgeLesson(slug: string) {
  return URGE_LESSONS.find((item) => item.slug === slug) ?? null;
}

export const FACTOR_LABELS: Record<UrgeFactor, string> = {
  hunger: "Physical hunger",
  "last-meal": "A while since I ate",
  tired: "Tired",
  stressed: "Stressed",
  bored: "Bored",
  lonely: "Lonely",
  comfort: "Wanting comfort",
  automatic: "Automatic habit",
};

export const CHOICE_LABELS: Record<NextChoice, string> = {
  eat: "Eat a meal or snack, because I am hungry",
  water: "Drink water, if I am thirsty and fluids are allowed",
  moment: "Open Choose Your Moment",
  move: "A short walk or a chair movement",
  connect: "Reach out to someone",
  portion: "A planned portion on a plate",
  support: "Open free public quit or alcohol support",
  rest: "Rest",
  other: "Something else I will name",
};

export const SUPPORT_LABELS: Record<SupportFlag, string> = {
  "often-out-of-control": "This kind of urge often feels out of my control",
  "severe-distress": "I am in severe distress about eating or a craving",
  "binge-pattern": "I have episodes of eating that feel like a binge",
  "restrictive-pattern": "I have been restricting food in a way that worries me",
};

export const SUPPORT_NOTE =
  "If cravings often feel out of your control, if the distress is severe, or if eating feels like a binge or like tight restriction, a qualified clinician can help. lifeZoi does not diagnose an eating disorder or addiction and does not change medication. In the United States, call or text 988 for immediate distress.";

export const STRONGER_LINE = "I can have it, but I don't have to have it right now.";

export const EVENING_EXAMPLE = [
  "After you finish dinner, notice whether you are still hungry. This is an example, not a required time.",
  "If you are hungry, eat a snack you already planned.",
  "If you want something sweet, put one serving on a plate and sit down with it.",
  "If you are bored and not hungry, open Choose Your Moment for about 10 minutes.",
  "If a snack is automatic, move one package out of the path you usually walk. Leave food easy to reach if you will need it.",
  "No clock time in this example is mandatory.",
];

export const TOOLKITS: { title: string; text: string; href: string }[] = [
  {
    title: "Evening sweets",
    text: "Hunger gets food. A wanted sweet can go on a plate. Boredom can go to Choose Your Moment.",
    href: "/urges/lessons/late-night-sugar",
  },
  {
    title: "Stress",
    text: "Name the stressor. Try a meal, a walk, rest, or a person. Professional care remains available.",
    href: "/urges/lessons/stress",
  },
  {
    title: "Inactivity",
    text: "A chair move, a short walk, or rest on purpose. Do not push through pain.",
    href: "/urges/lessons/avoiding-activity",
  },
  {
    title: "Smoking and alcohol",
    text: "Free public support is linked from the lessons. No shame, and no medication advice.",
    href: "/urges/lessons/smoking",
  },
];

export function urgeCopyText(): string {
  const parts = [
    SUPPORT_NOTE,
    STRONGER_LINE,
    ...EVENING_EXAMPLE,
    ...URGE_LESSONS.flatMap((lesson) => [
      lesson.title,
      lesson.summary,
      ...lesson.actions,
      ...lesson.blocks.flatMap((item) => [item.heading, item.body, item.evidenceNote]),
    ]),
  ];
  return parts.join("\n");
}
