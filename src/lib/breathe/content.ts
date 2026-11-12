/**
 * Breathe for Life – Nitric Oxide & Healthy Aging: all reading text in one place,
 * so the wording can be reviewed and checked by tests.
 *
 * Rules for this copy:
 * - Nitric oxide (NO) is never presented as a cure, or as preventing disease or aging.
 * - No percentage is given for whole-body NO, and no claim that a practice raises it by an amount.
 * - The 15-fold humming figure is always "nasal NO output in a small study".
 * - Established findings, preliminary research, and traditional yoga teachings are labeled separately.
 */

export const BREATHE_TITLE = "Breathe for Life";
export const BREATHE_SUBTITLE = "Nitric Oxide & Healthy Aging";

export const BREATHE_DISCLAIMER =
  "Breathe for Life is general wellness education. Breathing exercises can help many people relax, but they are not proven to prevent disease or to restore nitric oxide levels that change with age. lifeZoi does not measure nitric oxide. Talk with your clinician about any health condition or medicine.";

// ---------- evidence ----------

export type EvidenceLevel = "established" | "preliminary" | "traditional";

export const EVIDENCE_LABELS: Record<EvidenceLevel, { label: string; text: string }> = {
  established: {
    label: "Established science",
    text: "Supported by many studies and widely accepted in physiology.",
  },
  preliminary: {
    label: "Preliminary research",
    text: "Seen in small or short studies. Promising, but not proven to change health.",
  },
  traditional: {
    label: "Traditional yoga teaching",
    text: "Comes from yoga tradition and experience, not from clinical trials.",
  },
};

export type BreatheSource = {
  id: string;
  authors: string;
  year: number;
  title: string;
  where: string;
  url: string;
  /** What lifeZoi takes from it, kept to what the source says. */
  supports: string;
};

export const BREATHE_SOURCES: BreatheSource[] = [
  {
    id: "osu",
    authors: "Polizzi S.",
    year: 2024,
    title: "Say NO to disease: The benefits of nitric oxide (EM 9442)",
    where: "Oregon State University Extension Service",
    url: "https://extension.oregonstate.edu/catalog/em-9442-say-no-disease-benefits-nitric-oxide",
    supports:
      "A plain-language overview of nitric oxide, nitrate-rich vegetables, the role of oral bacteria, and mouthwash. lifeZoi does not repeat its age-decline figure, because the page gives no source for it (see the note below).",
  },
  {
    id: "weitzberg-2002",
    authors: "Weitzberg E, Lundberg JO.",
    year: 2002,
    title: "Humming greatly increases nasal nitric oxide",
    where: "American Journal of Respiratory and Critical Care Medicine 166(2):144–145",
    url: "https://pubmed.ncbi.nlm.nih.gov/12119224/",
    supports: "In ten healthy people, nitric oxide measured at the nose was about 15 times higher during humming than during quiet breathing out.",
  },
  {
    id: "maniscalco-2003",
    authors: "Maniscalco M, et al.",
    year: 2003,
    title: "Assessment of nasal and sinus nitric oxide output using single-breath humming exhalations",
    where: "European Respiratory Journal 22(2):323–329",
    url: "https://pubmed.ncbi.nlm.nih.gov/12952268/",
    supports: "In ten healthy people, nasal nitric oxide rose greatly during humming, explained by faster air exchange with the sinuses.",
  },
  {
    id: "seals-2011",
    authors: "Seals DR, Jablonski KL, Donato AJ.",
    year: 2011,
    title: "Aging and vascular endothelial function in humans",
    where: "Clinical Science 120(9):357–375",
    url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC3482987/",
    supports:
      "With age, blood vessel lining (endothelial) function declines. Reduced nitric oxide bioavailability from oxidative stress is described as the key mechanism. Regular aerobic exercise is one of the factors that influences it.",
  },
  {
    id: "shannon-2022",
    authors: "Shannon OM, Clifford T, Seals DR, Craighead DH, Rossman MJ.",
    year: 2022,
    title: "Nitric oxide, aging and aerobic exercise: Sedentary individuals to Master's athletes",
    where: "Nitric Oxide 125–126:31–39",
    url: "https://www.sciencedirect.com/science/article/pii/S1089860322000659",
    supports:
      "Nitric oxide bioavailability decreases with aging, especially in sedentary people, while physically active older adults tend to keep higher levels. Results in postmenopausal women are less consistent.",
  },
  {
    id: "lundberg-1995",
    authors: "Lundberg JO, et al.",
    year: 1995,
    title: "High nitric oxide production in human paranasal sinuses",
    where: "Nature Medicine 1(4):370–373",
    url: "https://pubmed.ncbi.nlm.nih.gov/7585069/",
    supports: "The cells lining the sinuses produce nitric oxide, and sinus air contains it in high concentrations.",
  },
];

export const AGE_FIGURE_NOTE = {
  title: "About a number you may see elsewhere",
  text: "Some articles, including the Oregon State University page, say that nitric oxide production falls by about three quarters between ages 20 and 70. We looked for the original study behind that number and could not find one: the page gives no reference for it. Studies agree that nitric oxide bioavailability tends to fall with age, but the size of the change differs between people and depends on how it is measured. So lifeZoi does not use that number.",
};

// ---------- what is nitric oxide ----------

export type Fact = { title: string; text: string; level: EvidenceLevel };

export const NO_INTRO = [
  "Nitric oxide, written NO, is a tiny gas molecule that your body makes itself. It acts as a messenger: it carries signals between cells for a few seconds and then is gone.",
  "Do not confuse it with nitrous oxide, the laughing gas used at the dentist. They are different molecules.",
];

export const NO_ROLES: Fact[] = [
  { title: "Relaxes blood vessels", text: "NO made in the lining of blood vessels tells the surrounding muscle to relax, which helps blood flow smoothly.", level: "established" },
  { title: "Supports the endothelium", text: "The endothelium is the thin inner lining of every blood vessel. NO is one of its main signals for staying flexible and healthy.", level: "established" },
  { title: "Helps regulate blood pressure", text: "Because it widens blood vessels, NO is one of several systems that take part in blood pressure regulation.", level: "established" },
  { title: "Carries messages between nerve cells", text: "Some nerve cells use NO to signal to each other and to nearby tissue.", level: "established" },
  { title: "Takes part in immune signaling", text: "Immune cells use NO as part of their response to germs.", level: "established" },
  { title: "Influences oxygen delivery", text: "By adjusting blood flow, NO helps match the delivery of oxygen to what the heart and muscles need.", level: "established" },
];

export const NO_LOW = {
  title: "When less NO is available",
  text: "Reduced nitric oxide bioavailability (less NO available to do its work) is associated with endothelial dysfunction, oxidative stress, vascular aging, and higher cardiovascular risk. Associated means they tend to appear together. It does not mean that adding NO would cure or prevent any of them.",
};

export const NO_FACTORS = ["Aging", "Smoking", "Sitting most of the day", "Metabolic health, such as blood sugar and weight", "Chronic inflammation", "Oxidative stress"];

export const PATHWAYS = [
  {
    id: "arginine",
    title: "1. The L-arginine pathway",
    steps: ["L-arginine, an amino acid from food and from the body", "Nitric oxide synthase enzymes (NOS)", "Nitric oxide"],
    text: "Cells in blood vessels, nerves, and the immune system make NO from L-arginine using enzymes called nitric oxide synthases. This route needs oxygen and healthy cells.",
    level: "established" as EvidenceLevel,
  },
  {
    id: "nitrate",
    title: "2. The nitrate pathway",
    steps: ["Nitrate from vegetables such as beetroot, spinach, and arugula", "Friendly bacteria on the tongue turn nitrate into nitrite", "Nitrite becomes nitric oxide in the body"],
    text: "Nitrate you eat is absorbed, returns to the mouth in saliva, and is changed into nitrite by bacteria on the tongue. The body can then turn nitrite into NO, especially where oxygen is low.",
    level: "established" as EvidenceLevel,
  },
];

export const NOT_A_CURE =
  "Nitric oxide is important, but it is not a cure for inflammation, heart disease, dementia, or aging. Nothing in this feature treats or prevents a disease.";

// ---------- aging ----------

export const AGING_STEPS = [
  { title: "Endothelial NO signaling weakens", text: "With age, the blood vessel lining tends to make and respond to NO less well." },
  { title: "Oxidative stress rises", text: "Older vessels make more reactive oxygen molecules, such as superoxide, without a matching rise in antioxidant defenses." },
  { title: "Less NO is available", text: "Superoxide reacts with NO and uses it up, so less NO is left to relax the vessel. This is called reduced bioavailability." },
  { title: "Endothelial dysfunction", text: "The vessel lining becomes less able to widen when more blood flow is needed." },
  { title: "Arteries stiffen", text: "Large arteries tend to become stiffer over the years. Lower NO signaling is one of several contributors." },
];

export const AGING_INFLAMMATION =
  "Chronic low-grade inflammation, which often increases with age, and oxidative stress feed each other. Together they are linked with vascular aging.";

export const AGING_NUANCE =
  "Aging can affect how much NO is produced, how much stays available, and how well tissues respond to it. These are different things, and they change at different rates in different people. Studies of older adults suggest that physically active people tend to keep better blood vessel function than sedentary people of the same age.";

// ---------- techniques ----------

export type Technique = {
  id: "bhramari" | "nasal" | "diaphragm" | "alternate";
  title: string;
  subtitle: string;
  steps: string[];
  science: { text: string; level: EvidenceLevel }[];
};

export const TECHNIQUES: Technique[] = [
  {
    id: "bhramari",
    title: "Bhramari – humming breath",
    subtitle: "A gentle hum on the out-breath, named after the humming bee.",
    steps: [
      "Sit comfortably with your back supported.",
      "Breathe in gently through your nose.",
      "Breathe out slowly while making a soft, comfortable humming sound with your lips closed.",
      "Let the hum end naturally, then breathe in again. Repeat several times.",
      "If you like, rest your fingertips lightly on your cheeks to feel the buzz.",
    ],
    science: [
      {
        text: "In a small study of ten healthy people, nitric oxide output measured at the nose was about 15 times higher during humming than during quiet breathing out (Weitzberg & Lundberg, 2002). A second small study found the same kind of rise and linked it to faster air exchange with the sinuses (Maniscalco et al., 2003).",
        level: "preliminary",
      },
      {
        text: "This refers to nasal NO output, the NO in air leaving the nose. It is not a 15-fold increase in nitric oxide in the whole body or in the blood, and it has not been shown to change health outcomes.",
        level: "established",
      },
      { text: "In yoga tradition, Bhramari is taught to quiet the mind and is often practiced before meditation.", level: "traditional" },
    ],
  },
  {
    id: "nasal",
    title: "Nasal breathing",
    subtitle: "Soft, quiet breathing in and out through the nose, when it is comfortable.",
    steps: [
      "Close your mouth gently and relax your jaw.",
      "Breathe in and out through your nose, softly and without effort.",
      "If your nose is blocked, breathe through your mouth. Comfort comes first.",
    ],
    science: [
      { text: "The sinuses and nasal passages produce nitric oxide, and sinus air contains it in high concentrations (Lundberg et al., 1995).", level: "established" },
      { text: "Breathing in through the nose carries some of this NO toward the lungs. Whether this changes long-term health is not known.", level: "preliminary" },
    ],
  },
  {
    id: "diaphragm",
    title: "Diaphragmatic breathing",
    subtitle: "Comfortable belly breathing at a slow, relaxed pace.",
    steps: [
      "Sit or lie down. Rest one hand on your belly and one on your chest.",
      "Breathe in slowly through your nose and let your belly rise under your hand.",
      "Breathe out a little longer than you breathed in and let your belly fall.",
      "Keep it small and easy. Never force a deep breath.",
    ],
    science: [
      { text: "Slow, relaxed breathing helps many people feel calmer. Studies of slow breathing for stress are encouraging but mostly small.", level: "preliminary" },
    ],
  },
  {
    id: "alternate",
    title: "Gentle alternate nostril breathing",
    subtitle: "A beginner pranayama, with no breath holding.",
    steps: [
      "Sit upright and rest your left hand in your lap.",
      "Gently close your right nostril with your right thumb and breathe in through the left.",
      "Close the left nostril with your ring finger, release the thumb, and breathe out through the right.",
      "Breathe in through the right, switch, and breathe out through the left. That is one round.",
      "Do five to ten slow rounds. Do not hold your breath between sides. If one nostril is blocked, skip this practice.",
    ],
    science: [
      { text: "Alternate nostril breathing (Nadi Shodhana) comes from yoga tradition, where it is taught to balance and calm the mind.", level: "traditional" },
      { text: "Small studies suggest it may help some people relax. Traditional versions sometimes add breath retention; lifeZoi leaves that out.", level: "preliminary" },
    ],
  },
];

// ---------- safety ----------

export const SAFETY_RULES = [
  "Breathing should always stay comfortable. If it feels like effort, make it smaller and softer.",
  "Never hold your breath, breathe very fast, or force the air in or out. This program never asks you to.",
  "You can stop at any time. Press Stop, breathe normally, and rest.",
  "Practice sitting down or lying down, not while driving, in water, or standing where you could fall.",
];

export const STOP_SIGNS =
  "Stop and breathe normally if you feel dizzy, light-headed, short of breath, tingling, chest discomfort, a racing or irregular heartbeat, or anything unusual. If chest pain, severe shortness of breath, or fainting does not settle quickly, call your local emergency number (911 in the United States).";

export const MEDICAL_CAUTION =
  "If you have asthma, COPD, another lung condition, heart disease, high or low blood pressure, are pregnant, or have had recent surgery, check with your clinician before starting a breathing program and keep the practice very gentle. Breathing exercises do not replace your inhalers, medicines, or treatment plan.";

export const PROGRAM_LIMITS =
  "Breathing exercises support general wellness and relaxation. They are not proven to prevent disease or to restore age-related nitric oxide levels.";

/** Extra caution when the assessment reported breathlessness or a heart, chest, or surgery note. */
export const REPORTED_BREATHLESSNESS =
  "Your assessment says you get short of breath easily or mentions a heart, chest, or surgery concern. Please check with your clinician before you start, use the gentle pace and the short session, and stop at the first sign of discomfort.";

// ---------- food ----------

export type Food = { id: string; name: string; tip: string; group: "leafy" | "root" | "other" };

export const FOODS: Food[] = [
  { id: "beetroot", name: "Beetroot", tip: "Roast, grate raw into salads, or blend a little into a smoothie. Beet juice can turn urine pink or red, which is harmless.", group: "root" },
  { id: "arugula", name: "Arugula (rocket)", tip: "One of the richest nitrate vegetables. Add a handful to sandwiches, pasta, or eggs.", group: "leafy" },
  { id: "spinach", name: "Spinach", tip: "Stir into soups at the end, or use fresh in salads.", group: "leafy" },
  { id: "kale", name: "Kale", tip: "Massage with a little olive oil and lemon for a soft salad, or add to stews.", group: "leafy" },
  { id: "chard", name: "Swiss chard", tip: "Sauté the leaves briefly with garlic. The stems can be cooked like celery.", group: "leafy" },
  { id: "lettuce", name: "Lettuce", tip: "Darker leaves such as romaine or butterhead are good choices.", group: "leafy" },
  { id: "broccoli", name: "Broccoli", tip: "Steam lightly so it stays bright green.", group: "other" },
  { id: "celery", name: "Celery", tip: "Snack on sticks, or add to soups and salads.", group: "other" },
  { id: "bok-choy", name: "Bok choy", tip: "Stir-fry for two minutes or add to broth.", group: "leafy" },
  { id: "cabbage", name: "Cabbage", tip: "Shred raw into coleslaw or add to soups.", group: "other" },
  { id: "radish", name: "Radish", tip: "Slice thinly over salads and toast.", group: "root" },
  { id: "parsley", name: "Parsley and fresh herbs", tip: "Chop generously over almost any dish.", group: "leafy" },
];

export const FOOD_TIPS = [
  "Raw or lightly cooked vegetables keep more nitrate. Boiling for a long time moves much of it into the cooking water, so soups that keep the liquid are fine.",
  "Variety matters more than any single food. Vegetables also bring fiber, potassium, and other nutrients.",
  "Nitrate from vegetables is different from the nitrites added to processed meats. lifeZoi does not suggest processed meats.",
];

export const ORAL_BACTERIA = {
  title: "Your mouth is part of the nitrate pathway",
  text: "Friendly bacteria on the back of the tongue turn nitrate from vegetables into nitrite. Brushing, flossing, and regular dental care support a healthy mouth.",
  mouthwash:
    "Educational sources such as the Oregon State University guide note that regular use of antibacterial mouthwash may reduce this conversion. The research is early. If you use mouthwash, do not stop a prescribed rinse or change your dental care on your own: ask your dentist or clinician whether a different routine suits you.",
  level: "preliminary" as EvidenceLevel,
};

export const SUPPLEMENT_NOTE =
  "lifeZoi does not recommend nitric oxide boosters, L-arginine, or nitrate supplements. They can interact with blood pressure and erectile dysfunction medicines and are not right for everyone. Talk with your clinician or pharmacist before taking any supplement. Food is the place to start.";

export const MEDICINE_NOTE =
  "If you take blood thinners such as warfarin, follow your care team's advice on leafy greens, because vitamin K in greens affects these medicines. If you have kidney disease or a history of kidney stones, ask before eating large amounts of spinach, chard, or beetroot.";

export type Recipe = { id: string; title: string; minutes: number; foods: string[]; ingredients: string[]; steps: string[] };

export const RECIPES: Recipe[] = [
  {
    id: "beet-arugula-salad",
    title: "Roasted beetroot and arugula salad",
    minutes: 15,
    foods: ["beetroot", "arugula"],
    ingredients: ["2 cooked beetroots (ready-cooked is fine)", "2 handfuls of arugula", "A few walnuts or seeds", "1 tablespoon olive oil", "A squeeze of lemon"],
    steps: ["Cut the beetroot into wedges.", "Toss the arugula with olive oil and lemon.", "Top with beetroot and walnuts or seeds."],
  },
  {
    id: "green-soup",
    title: "Simple spinach and broccoli soup",
    minutes: 25,
    foods: ["spinach", "broccoli", "celery"],
    ingredients: ["1 onion", "2 celery sticks", "1 small head of broccoli", "2 handfuls of spinach", "750 ml low-salt stock", "Olive oil"],
    steps: ["Soften the chopped onion and celery in a little oil.", "Add broccoli and stock and simmer for 10 minutes.", "Stir in the spinach for one minute, then blend. Keep the liquid: it holds the nutrients."],
  },
  {
    id: "beet-smoothie",
    title: "Beetroot and berry smoothie",
    minutes: 5,
    foods: ["beetroot", "spinach"],
    ingredients: ["1 small cooked beetroot", "A handful of frozen berries", "A handful of spinach", "Plain yogurt or a plant drink"],
    steps: ["Blend everything until smooth.", "Add water if it is too thick. Drink it with a meal if you watch your blood sugar."],
  },
  {
    id: "chard-eggs",
    title: "Swiss chard with eggs or beans",
    minutes: 15,
    foods: ["chard"],
    ingredients: ["A bunch of Swiss chard", "1 clove garlic", "2 eggs, or a can of white beans for a plant version", "Olive oil"],
    steps: ["Slice the stems and leaves separately.", "Cook the stems with garlic for 3 minutes, then add the leaves.", "Make two hollows and cook the eggs in them, or stir in the beans and warm through."],
  },
  {
    id: "green-wrap",
    title: "Lettuce, kale, and hummus wrap",
    minutes: 5,
    foods: ["lettuce", "kale", "radish"],
    ingredients: ["A whole-grain wrap", "Hummus", "Lettuce and a little shredded kale", "Sliced radish or celery"],
    steps: ["Spread hummus over the wrap.", "Add the greens and sliced vegetables.", "Roll up tightly and cut in half."],
  },
  {
    id: "beet-hummus",
    title: "Beetroot hummus",
    minutes: 10,
    foods: ["beetroot", "celery", "radish"],
    ingredients: ["1 can of chickpeas, drained", "1 cooked beetroot", "1 tablespoon tahini", "1 small clove garlic", "Juice of half a lemon", "Celery sticks, radishes, or whole-grain bread to dip"],
    steps: ["Blend the chickpeas, beetroot, tahini, garlic, and lemon juice until smooth.", "Add a spoonful of water if it is too thick.", "Serve with celery sticks, radishes, or bread."],
  },
  {
    id: "borscht",
    title: "Vegetable borscht",
    minutes: 50,
    foods: ["beetroot", "cabbage", "parsley"],
    ingredients: ["2 raw beetroots", "1 carrot", "1 onion", "2 potatoes", "A quarter of a small cabbage", "1 tablespoon tomato paste", "1.5 litres water or low-salt stock", "Fresh dill or parsley", "Olive or sunflower oil"],
    steps: [
      "Grate the beetroot and carrot and chop the onion.",
      "Soften the onion, carrot, and beetroot in a little oil for 10 minutes, then stir in the tomato paste.",
      "Bring the water or stock to a boil and add diced potatoes. Cook for 10 minutes.",
      "Add the shredded cabbage and the beetroot mix, then simmer for 15 minutes.",
      "Serve with plenty of chopped herbs. The soup keeps the cooking liquid, so the nitrate stays in the bowl.",
    ],
  },
  {
    id: "beet-vinegret",
    title: "Beetroot vinegret salad",
    minutes: 15,
    foods: ["beetroot", "cabbage"],
    ingredients: ["2 cooked beetroots", "2 cooked potatoes", "1 cooked carrot", "2 pickled cucumbers", "A handful of sauerkraut", "1 small onion or a few spring onions", "2 tablespoons sunflower or olive oil"],
    steps: ["Dice everything into small cubes of about the same size.", "Toss the beetroot with the oil first, so it does not color everything else too much.", "Mix in the other vegetables and the sauerkraut. Pickles and sauerkraut are salty, so taste before adding salt."],
  },
  {
    id: "arugula-pesto",
    title: "Arugula pesto with pasta",
    minutes: 20,
    foods: ["arugula", "parsley"],
    ingredients: ["2 large handfuls of arugula", "A small handful of parsley or basil", "A handful of walnuts or sunflower seeds", "1 small clove garlic", "3 tablespoons olive oil", "A little grated hard cheese (optional)", "200 g whole-grain pasta"],
    steps: ["Cook the pasta as the packet says.", "Blend the arugula, herbs, nuts or seeds, garlic, and olive oil into a rough paste.", "Stir the raw pesto into the drained pasta with a splash of the cooking water. Add cheese if you like."],
  },
  {
    id: "arugula-bean-salad",
    title: "Arugula and white bean salad",
    minutes: 10,
    foods: ["arugula", "radish", "parsley"],
    ingredients: ["1 can of white beans, rinsed", "2 handfuls of arugula", "A few radishes, sliced", "Half a red onion, thinly sliced", "Chopped parsley", "Olive oil and lemon juice"],
    steps: ["Mix the beans, onion, and parsley with olive oil and lemon juice.", "Let it sit for 5 minutes so the onion softens.", "Fold in the arugula and radishes just before serving."],
  },
  {
    id: "kale-salad",
    title: "Massaged kale salad",
    minutes: 10,
    foods: ["kale", "cabbage"],
    ingredients: ["A bunch of kale", "1 tablespoon olive oil", "Juice of half a lemon", "A handful of shredded red cabbage or grated carrot", "A spoonful of seeds or chopped nuts"],
    steps: ["Strip the leaves from the tough stems and tear them into small pieces.", "Add the oil, lemon, and a pinch of salt, then squeeze the leaves with your hands for 2 minutes until they soften.", "Mix in the cabbage or carrot and sprinkle with seeds."],
  },
  {
    id: "spinach-chickpea-curry",
    title: "Spinach and chickpea curry",
    minutes: 25,
    foods: ["spinach"],
    ingredients: ["1 onion", "2 cloves garlic", "A small piece of fresh ginger", "1 teaspoon each of ground cumin and coriander", "1 can of chopped tomatoes", "1 can of chickpeas, drained", "4 large handfuls of spinach", "Oil"],
    steps: ["Soften the chopped onion in a little oil, then add the garlic, ginger, and spices for one minute.", "Add the tomatoes and chickpeas and simmer for 10 minutes.", "Stir in the spinach until it wilts. Serve with rice or flatbread."],
  },
  {
    id: "spinach-rice",
    title: "Greek spinach rice (spanakorizo)",
    minutes: 30,
    foods: ["spinach", "parsley"],
    ingredients: ["1 onion or a few spring onions", "Half a cup of rice", "About 1.5 cups of water or low-salt stock", "500 g fresh spinach", "Fresh dill", "2 tablespoons olive oil", "A lemon"],
    steps: ["Soften the onion in the olive oil.", "Add the rice and the water or stock, cover, and simmer gently for about 12 minutes.", "Stir in the spinach and dill, cover again, and cook for 5 minutes more until the rice is tender.", "Squeeze lemon over the top before serving."],
  },
  {
    id: "spinach-omelette",
    title: "Spinach omelette",
    minutes: 10,
    foods: ["spinach", "parsley"],
    ingredients: ["2 eggs", "A large handful of spinach", "A few chopped herbs", "A little oil or butter"],
    steps: ["Wilt the spinach in the pan for one minute, then set it aside.", "Beat the eggs with the herbs and pour them into the pan.", "When the eggs are almost set, add the spinach to one half and fold the omelette over."],
  },
  {
    id: "green-shakshuka",
    title: "Green shakshuka",
    minutes: 20,
    foods: ["spinach", "chard", "kale"],
    ingredients: ["1 leek or onion", "2 cloves garlic", "4 large handfuls of spinach, chard, or kale", "1 teaspoon ground cumin", "3 or 4 eggs", "Chopped herbs", "Olive oil"],
    steps: ["Soften the sliced leek or onion in olive oil, then add the garlic and cumin.", "Add the greens with a splash of water and cook until wilted.", "Make hollows, crack in the eggs, cover, and cook gently until the whites are set.", "Scatter herbs over the top."],
  },
  {
    id: "bok-choy-stir-fry",
    title: "Garlic bok choy stir-fry",
    minutes: 10,
    foods: ["bok-choy"],
    ingredients: ["4 heads of baby bok choy", "2 cloves garlic", "A small piece of fresh ginger", "1 teaspoon low-salt soy sauce", "1 teaspoon sesame seeds", "Oil"],
    steps: ["Cut the bok choy in half lengthwise and rinse out any grit.", "Fry the garlic and ginger in a little oil for 30 seconds.", "Add the bok choy and a splash of water, cover, and cook for 2 minutes.", "Season with soy sauce and sesame seeds."],
  },
  {
    id: "coleslaw",
    title: "Crunchy cabbage slaw without mayonnaise",
    minutes: 10,
    foods: ["cabbage", "celery", "parsley"],
    ingredients: ["A quarter of a white or red cabbage", "1 carrot", "1 celery stick", "Chopped parsley", "2 tablespoons olive oil", "1 tablespoon apple cider vinegar or lemon juice", "1 teaspoon mustard"],
    steps: ["Shred the cabbage finely and grate the carrot. Slice the celery thinly.", "Whisk the oil, vinegar or lemon, and mustard.", "Toss everything together and leave for 10 minutes before eating."],
  },
  {
    id: "roasted-broccoli",
    title: "Roasted broccoli with lemon and garlic",
    minutes: 20,
    foods: ["broccoli"],
    ingredients: ["1 head of broccoli", "2 cloves garlic, sliced", "1 tablespoon olive oil", "Half a lemon"],
    steps: ["Heat the oven to 220 °C (425 °F).", "Cut the broccoli into florets and toss with the oil and garlic on a tray.", "Roast for 12 to 15 minutes until the edges brown.", "Squeeze lemon over the top."],
  },
  {
    id: "lettuce-salad",
    title: "Greek lettuce salad (maroulosalata)",
    minutes: 10,
    foods: ["lettuce", "parsley"],
    ingredients: ["1 head of romaine lettuce", "3 spring onions", "A small bunch of fresh dill", "3 tablespoons olive oil", "1 tablespoon lemon juice or vinegar", "A little feta (optional)"],
    steps: ["Slice the lettuce into thin ribbons.", "Chop the spring onions and dill.", "Toss with the olive oil and lemon juice. Crumble feta over the top if you like."],
  },
  {
    id: "radish-cucumber-salad",
    title: "Radish and cucumber salad",
    minutes: 10,
    foods: ["radish", "lettuce", "parsley"],
    ingredients: ["A bunch of radishes", "1 cucumber", "A few lettuce leaves", "Chopped dill or parsley", "Plain yogurt or olive oil", "A squeeze of lemon"],
    steps: ["Slice the radishes and cucumber thinly.", "Mix with the herbs and torn lettuce.", "Dress with a spoonful of yogurt or olive oil and lemon."],
  },
  {
    id: "tabbouleh",
    title: "Parsley tabbouleh",
    minutes: 20,
    foods: ["parsley", "lettuce"],
    ingredients: ["2 large bunches of flat-leaf parsley", "A small bunch of mint", "3 tablespoons fine bulgur", "2 tomatoes", "2 spring onions", "Juice of 1 lemon", "3 tablespoons olive oil", "Lettuce leaves to serve"],
    steps: ["Soak the bulgur in a little hot water for 10 minutes, then drain well.", "Chop the parsley, mint, tomatoes, and spring onions finely.", "Mix everything with the lemon juice and olive oil.", "Scoop into lettuce leaves to eat."],
  },
];

/** Every reading string in this feature, for the wording checks. */
export function breatheCopy(): string[] {
  return [
    BREATHE_DISCLAIMER,
    AGE_FIGURE_NOTE.text,
    ...NO_INTRO,
    ...NO_ROLES.map((r) => `${r.title}. ${r.text}`),
    NO_LOW.text,
    ...PATHWAYS.flatMap((p) => [p.text, ...p.steps]),
    NOT_A_CURE,
    ...AGING_STEPS.map((s) => s.text),
    AGING_INFLAMMATION,
    AGING_NUANCE,
    ...TECHNIQUES.flatMap((t) => [t.subtitle, ...t.steps, ...t.science.map((s) => s.text)]),
    ...SAFETY_RULES,
    STOP_SIGNS,
    MEDICAL_CAUTION,
    PROGRAM_LIMITS,
    REPORTED_BREATHLESSNESS,
    ...FOODS.map((f) => f.tip),
    ...FOOD_TIPS,
    ORAL_BACTERIA.text,
    ORAL_BACTERIA.mouthwash,
    SUPPLEMENT_NOTE,
    MEDICINE_NOTE,
    ...RECIPES.flatMap((r) => [...r.ingredients, ...r.steps]),
    ...BREATHE_SOURCES.map((s) => s.supports),
  ];
}
