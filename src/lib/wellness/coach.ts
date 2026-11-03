import type { LearnModule, LessonBlock, Practice } from "@/lib/wellness/types";

function practice(input: Practice): Practice {
  return input;
}

function block(
  heading: string,
  body: string,
  sourceIds: string[],
  evidence: LessonBlock["evidence"],
  evidenceNote: string,
): LessonBlock {
  return { heading, body, sourceIds, evidence, evidenceNote };
}

const carryBottle = practice({
  id: "carry-bottle",
  title: "Carry a bottle you will actually see",
  why: "CDC lists carrying a reusable bottle as one way to drink water through the day. NIH says a habit is easier when the cue is in your path. A visible bottle is a cue, not a prescription for a number of ounces.",
  what: "Choose a bottle you can take apart and wash. Put it where you already walk, such as by the door or at the place you eat.",
  when: "Set it out once today, then notice it the next time you pass that spot.",
  supplies: "A reusable bottle, or a glass you already own.",
  alternative: "Use a cup and put it on the table at one meal. CDC also lists serving water with meals.",
  sourceIds: ["cdc-water", "nih-habits"],
  evidence: "established",
  evidenceNote: "CDC publishes the bottle and meal ideas as practical tips. NIH publishes cue and environment skills for habits. Neither page assigns one water volume to every person.",
});

const fluidLimit = practice({
  id: "fluid-limit",
  title: "Honor a fluid limit",
  why: "MedlinePlus says water needs depend on sex, weight, age, activity, and medical conditions, and that there is no specific recommendation for how much plain water to drink. A clinician’s fluid limit is the plan that counts.",
  what: "If a clinician has limited your fluids, follow that plan and skip any step that asks you to drink more. If you are unsure, ask the clinician before you change what you drink.",
  when: "Before you start the hydration challenge, and any day the question comes up.",
  supplies: "None. Your clinician’s instructions, if you have them.",
  alternative: "Use the check-in only to note that you followed the plan you were given.",
  sourceIds: ["medlineplus-water"],
  evidence: "established",
  evidenceNote: "This is public encyclopedia guidance about individual needs. It is not a personal fluid order from lifeZoi.",
});

const washBottle = practice({
  id: "wash-bottle",
  title: "Wash the bottle the way it was designed",
  why: "CDC says to clean, maintain, and store devices that use water according to the manufacturer, because germs can grow when those devices are not maintained.",
  what: "Take the bottle apart as the maker allows. Wash the bottle, lid, and straw if there is one. Let the parts dry. Replace a filter bottle’s filter on the schedule the maker gives.",
  when: "On a day you will use the bottle, and again whenever it sits with liquid in it.",
  supplies: "The bottle, dish soap you already use, and a brush if the opening is narrow.",
  alternative: "Drink from a cup you wash with the rest of the dishes.",
  sourceIds: ["cdc-water-germs"],
  evidence: "established",
  evidenceNote: "CDC’s page names humidifiers, filters, and other water-using devices. lifeZoi applies that maintenance idea to a reusable bottle. The page does not review bottle brands.",
});

const waterReport = practice({
  id: "water-report",
  title: "Match a filter to your water, or skip the filter",
  why: "CDC says EPA sets standards for public tap water and that utilities must provide a water quality report at least once a year. CDC also says a filter should be certified to reduce the contaminant you are concerned about. A certification for one substance does not cover every substance. Boiling does not remove chemicals.",
  what: "Read your utility’s water quality report, or ask the household where it is. If you are thinking about a filter, compare the report with the certification printed on the filter package. CDC gives PFAS as one example: a filter certified to NSF/ANSI 53 or NSF/ANSI 58 for PFAS reduction. Lead, arsenic, nitrate, and other contaminants are different questions. You may not need a filter.",
  when: "Once, before you buy anything.",
  supplies: "The water quality report, or the bottled-water label if that is what you drink. FDA regulates bottled water, and some bottled water starts as municipal tap water.",
  alternative: "Keep using the water you have while you read. Do not buy a filter in order to finish this step.",
  sourceIds: ["cdc-tap-standards", "cdc-tap-chemicals", "fda-bottled-water"],
  evidence: "established",
  evidenceNote: "The standards, the yearly report, and the advice to use a certified filter for a named contaminant are CDC guidance. CDC also says researchers continue to study how PFAS may affect health. That research question is separate from the shopping step.",
});

const vegetableAdd = practice({
  id: "add-vegetable",
  title: "Add one vegetable to a meal you already eat",
  why: "The Dietary Guidelines fact sheet says to eat a variety of vegetables and that small changes can be part of a routine. It also says fresh, frozen, and canned vegetables all count.",
  what: "Add one vegetable you like to one meal. Wash it under running water first. Do not use soap.",
  when: "The next meal you already planned.",
  supplies: "A vegetable you can afford. Frozen or canned is fine.",
  alternative: "Add a few bites if a full portion feels like too much.",
  sourceIds: ["dga-eating-routine", "fda-produce"],
  evidence: "established",
  evidenceNote: "This is Dietary Guidelines education from the March 26, 2021 fact sheet, plus FDA produce-washing steps. It is not a personal diet order.",
});

const proteinSwap = practice({
  id: "protein-swap",
  title: "Repeat a protein food you can cook",
  why: "The same fact sheet lists eggs, seafood, beans, lentils, nuts, seeds, tofu, and lean meats and poultry as protein foods. It also says fatty meats such as ribs and sausage are higher in saturated fat, and suggests choosing foods with unsaturated fats more often, such as seafood, nuts, and seeds.",
  what: "At one meal, use beans, lentils, eggs, tofu, or fish you already know how to prepare. If you eat meat, you can still choose a leaner cut you already buy. There is no requirement to remove meat.",
  when: "One meal this week.",
  supplies: "A protein food you can store and afford.",
  alternative: "Keep your usual meal and add beans or nuts beside it.",
  sourceIds: ["dga-eating-routine", "fda-fish"],
  evidence: "established",
  evidenceNote: "The food-group pattern is from the 2021 Dietary Guidelines fact sheet. FDA and EPA add a separate fish-choice chart, especially for pregnancy, breastfeeding, and children. lifeZoi does not assign a seafood quota.",
});

const fiberStep = practice({
  id: "fiber-step",
  title: "Add fiber a little at a time",
  why: "MedlinePlus says fiber helps food move through the gut, can help you feel full faster, and should be added slowly. A large jump can cause gas, bloating, and cramps. Fluids help fiber pass. Anyone on a fluid restriction should follow that medical plan.",
  what: "Add a small amount of fruit, vegetables, beans, oats, or another whole grain to one meal. Drink fluids you are allowed to drink. Do not jump to a large new amount.",
  when: "One meal, then keep the same small amount for several days if you tolerate it.",
  supplies: "One fiber-containing food you already tolerate.",
  alternative: "Keep the edible peel on a fruit or vegetable you already wash. MedlinePlus says peeling removes some fiber.",
  sourceIds: ["medlineplus-fiber", "medlineplus-water"],
  evidence: "established",
  evidenceNote: "MedlinePlus states these points as encyclopedia guidance. It also says a low-fiber diet has been linked with several conditions. That “linked” wording is an association, not a prediction for you.",
});

const washProduce = practice({
  id: "wash-produce",
  title: "Rinse produce under running water",
  why: "FDA says harmful germs can be on produce and that washing under running water reduces germs without removing all of them. Soap, detergent, and commercial produce washes are not recommended.",
  what: "Wash your hands. Cut away bruised parts. Rinse all produce under running water, including items you will peel. Scrub firm produce with a clean brush. Dry with a clean cloth or paper towel.",
  when: "Just before you cut or eat the produce.",
  supplies: "Running water and, for melons or cucumbers, a clean produce brush.",
  alternative: "Choose a package that is refrigerated and follow its directions, then rinse whole produce you will cut.",
  sourceIds: ["fda-produce"],
  evidence: "established",
  evidenceNote: "These are FDA handling steps. They do not make produce sterile, and FDA says washing reduces bacteria but does not eliminate them.",
});

export const coachModules: LearnModule[] = [
  {
    slug: "hydration",
    title: "Hydration coach",
    summary:
      "Learn a bottle routine, a check-in, and how tap, filtered, and bottled water differ. lifeZoi will not give you one water target.",
    challengeId: "hydration",
    blocks: [
      block(
        "Needs are not the same for everyone",
        "CDC says daily water intake recommendations vary by age, sex, pregnancy, activity, and breastfeeding, and that food, especially fruit and vegetables, also contributes fluid. MedlinePlus says there is no specific recommendation for how much plain water to drink, and that needs depend on the person, including medical conditions. Thirst can change as people get older. If you are concerned, talk with a clinician.",
        ["cdc-water", "medlineplus-water"],
        "established",
        "Both pages are current public education. They describe variation. They do not authorize a single drinking goal.",
      ),
      block(
        "A fluid restriction comes first",
        "If a clinician has told you to limit fluids, follow that instruction. Do not use this coach to drink more. lifeZoi does not replace kidney, heart, or other medical advice.",
        ["medlineplus-water"],
        "established",
        "MedlinePlus states that medical conditions change water needs and points people to a clinician when they are concerned.",
      ),
      block(
        "Tap, filtered, and bottled water",
        "CDC says EPA sets and enforces limits for public tap water, and that your utility must give you a water quality report at least yearly. Tap water that meets those standards is still not sterile. FDA regulates bottled water. Some bottled water comes from municipal sources and is usually treated before it is bottled. A home filter is useful only for contaminants it is certified to reduce. CDC’s examples differ by contaminant. For PFAS, CDC says to check for NSF/ANSI 53 or NSF/ANSI 58 certification for PFAS reduction. Lead, copper, arsenic, and nitrate are not the same shopping question. Researchers continue to study PFAS and health. That open question is not a reason to buy an uncertified filter.",
        ["cdc-tap-standards", "cdc-tap-chemicals", "cdc-water-germs", "fda-bottled-water"],
        "established",
        "The regulatory split between EPA tap water and FDA bottled water is established public guidance. CDC labels the health picture for PFAS as something researchers continue to study, so that part is emerging research rather than a settled personal risk number.",
      ),
      block(
        "How a habit forms",
        "NIH describes habits as actions that become more automatic when they are cued, easier to do, and repeated. The steps it lists include noticing triggers, making a small plan, changing the surroundings, tracking, asking for support, and expecting setbacks. Carrying a bottle is one place to practice those steps.",
        ["nih-habits"],
        "established",
        "NIH News in Health presents these steps as research-based habit skills. lifeZoi treats them as education, not a promise that a habit will form on a schedule.",
      ),
    ],
    practices: [carryBottle, fluidLimit, washBottle, waterReport],
  },
  {
    slug: "food",
    title: "Smart food choices",
    summary:
      "Learn vegetables, fruit, fiber, protein, and affordable meals as skills you can repeat. This is not a diet plan and not a calorie target.",
    challengeId: "vegetables",
    blocks: [
      block(
        "Variety, not a perfect plate",
        "The March 26, 2021 Dietary Guidelines fact sheet says a routine can include vegetables, fruits, grains, protein foods, and dairy or fortified soy drinks. It says to make half the plate fruits and vegetables and to vary the types of vegetables. It also says culture, taste, budget, and a busy schedule can shape the routine, and that there is no one right way to eat.",
        ["dga-eating-routine"],
        "established",
        "This is published Dietary Guidelines education from that fact sheet. lifeZoi cites the sheet by its date because later editions may also exist.",
      ),
      block(
        "Fiber, protein, and fats in plain language",
        "MedlinePlus describes soluble fiber, which it says is in oats, barley, beans, lentils, nuts, seeds, and some fruits and vegetables, and insoluble fiber, which it says is in wheat bran, vegetables, and whole grains. Most high-fiber foods contain both. The Dietary Guidelines fact sheet lists protein foods such as seafood, beans, lentils, eggs, nuts, seeds, tofu, and lean meats and poultry. It says saturated fat is higher in foods such as butter, cheese, whole milk, and fatty meats such as ribs and sausage, and it points toward unsaturated fats in seafood, nuts, seeds, and olive oil.",
        ["medlineplus-fiber", "dga-eating-routine"],
        "established",
        "MedlinePlus also says research has shown that soluble fiber lowers cholesterol. That is a research statement in the encyclopedia, not a result lifeZoi can promise you. The fact sheet’s pattern advice is public guidance.",
      ),
      block(
        "Affordable meals and storage",
        "The fact sheet says fresh, frozen, and canned fruits and vegetables all count, and that in-season produce and cooking at home can help with cost and time. It points people who cannot afford enough food to USA.gov/Food-Help. FDA says to refrigerate perishable produce at 40 degrees Fahrenheit or below, keep produce separate from raw meat, and rinse it under running water before you prepare it.",
        ["dga-eating-routine", "fda-produce"],
        "established",
        "Shopping and storage steps are public guidance. They are not a budget audit of your household.",
      ),
    ],
    practices: [vegetableAdd, proteinSwap, fiberStep, washProduce],
  },
  {
    slug: "organic",
    title: "Organic food guide",
    summary:
      "Learn what USDA organic labels mean, what certification does not mean, and how to wash produce whether or not it is organic.",
    blocks: [
      block(
        "Three labels you may see",
        "USDA describes a “100 percent organic” label for a product whose ingredients are organic, except salt and water. The USDA organic seal may be used. The “organic” label is a different category: USDA sets a minimum share of organic ingredients, allows a limited remainder from its National List, and also allows the seal. The “made with organic” label may name up to three organic ingredients or categories. It must not use the USDA organic seal, and it must not call the finished product organic. The exact composition rules are on USDA’s labeling page.",
        ["usda-organic-labels"],
        "established",
        "These are USDA labeling rules. They describe production and labeling, not a medical benefit.",
      ),
      block(
        "Organic does not mean pesticide-free",
        "USDA says synthetic substances are prohibited in organic crop production unless they are specifically allowed on the National List, and natural substances are allowed unless they are specifically prohibited. The allowed synthetic list includes some insecticides, herbicides, and other crop tools. USDA gives glyphosate herbicides as an example of a synthetic pesticide that is prohibited, and vinegar or clove-oil herbicides as examples of natural substances that are allowed. Certification is oversight of allowed methods. It is not a claim that no pest-control substance was used.",
        ["usda-organic-substances"],
        "established",
        "This is USDA’s own description of the National List. It is the reason lifeZoi does not call organic food pesticide-free.",
      ),
      block(
        "Buy the produce you can afford",
        "The Dietary Guidelines fact sheet encourages vegetables and fruits and says fresh, frozen, and canned options all count. It does not require an organic label. If organic food costs more than you can spend, choose the conventional produce you can afford and wash it. Eating vegetables and fruit is the habit. The label is optional.",
        ["dga-eating-routine", "fda-produce"],
        "established",
        "The fact sheet does not compare the nutrient content of organic and conventional foods. lifeZoi does not invent that comparison.",
      ),
    ],
    practices: [washProduce],
  },
];

export const coachPractices: Practice[] = coachModules.flatMap((module) => module.practices);

export const habitLesson: LessonBlock[] = [
  block(
    "A habit is a cue plus a small action",
    "NIH says many repeated actions become automatic, and that changing one starts with noticing the pattern and the trigger. A plan with a realistic goal and a specific action comes next. Making the helpful choice easier, removing a temptation, tracking what happens, and asking someone for support are all listed. So is patience: setbacks happen, and the focus is progress rather than perfection.",
    ["nih-habits"],
    "established",
    "This is NIH’s published habit guidance. lifeZoi uses it to teach a skill. It does not guarantee a result or a date by which a habit will feel automatic.",
  ),
  block(
    "What this coach will not do",
    "lifeZoi will not diagnose you, change a medicine, predict how long you will live, or give you a health score. It will not set one water amount, one calorie amount, or one clock time to stop eating.",
    ["medlineplus-water", "dga-eating-routine"],
    "belief",
    "The limits are lifeZoi’s own rules. The linked pages are there because they already say needs differ and that there is no single right way to eat. A product claim that promises a cleanse, a detox, or a longer life is a belief, not a finding on these pages.",
  ),
];

export function coachModule(slug: string) {
  return coachModules.find((item) => item.slug === slug) ?? null;
}

export const ORGANIC_LABELS = [
  {
    officialName: "100% Organic",
    text: "USDA uses this label when the ingredients are organic, except salt and water. The USDA organic seal may appear.",
  },
  {
    officialName: "Organic",
    text: "USDA uses this label when the product meets the organic-ingredient minimum on its labeling page. A limited remainder must follow the National List. The seal may appear.",
  },
  {
    officialName: "Made with Organic",
    text: "USDA allows the package to name up to three organic ingredients or categories. The package must not use the USDA organic seal or call the whole product organic.",
  },
] as const;
