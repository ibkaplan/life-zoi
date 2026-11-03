import type { LessonBlock, NatureActivityId, NatureEntry } from "@/lib/wellness/types";

export type NatureModule = {
  slug: string;
  title: string;
  summary: string;
  blocks: LessonBlock[];
};

const established = "established" as const;
const emerging = "emerging" as const;
const observational = "observational" as const;
const individual = "individual" as const;

export const NATURE_QUOTE =
  "Nature does not ask us to be perfect. It invites us to slow down, breathe, move, notice, and feel alive.";

export const NATURE_CLOSE =
  "Sometimes improving our lifestyle does not require buying something new.";

export const NATURE_ACTIVITIES: { id: NatureActivityId; label: string; text: string }[] = [
  { id: "window", label: "Window light", text: "Sit where daylight reaches you. A window is daylight, not outdoor time." },
  { id: "balcony", label: "Balcony or doorway", text: "Stand or sit at a doorway, porch, or balcony if one is available." },
  { id: "bench", label: "A bench", text: "Sit outside on a bench. Rest counts." },
  { id: "walk", label: "A short walk", text: "Walk only as far as feels workable today. There is no required distance." },
  { id: "roll", label: "Roll outside", text: "Use a wheelchair or other mobility aid outdoors if that is how you move." },
  { id: "garden", label: "Garden or pots", text: "Touch soil with gloves, or tend a pot. Skip unsafe ground." },
  { id: "tree", label: "Near a tree", text: "Stand or sit near a tree. Do not damage it, climb it, or disturb wildlife." },
  { id: "water-watch", label: "Near water", text: "Look at a river, pond, fountain, or rain from a safe place." },
  { id: "birds", label: "Birds or sky", text: "Notice birds, clouds, or the color of the sky." },
  { id: "stretch", label: "Gentle stretch", text: "Stretch, or try a few slow yoga or tai chi movements you already know. Stop if it hurts." },
  { id: "sit", label: "Sit outside", text: "Sit still outside for a few minutes. Company is welcome." },
  { id: "herbs", label: "A windowsill plant", text: "Water or notice a herb or houseplant. This is care, not a supplement." },
];

export const natureModules: NatureModule[] = [
  {
    slug: "sunlight",
    title: "Sunlight",
    summary: "Daylight is part of the body’s day-and-night rhythm. It does not guarantee a mood, and it does not treat depression.",
    blocks: [
      {
        heading: "Why daylight is discussed",
        body: "People often feel more alert in daylight and more ready for sleep when evenings are dimmer. That pattern is education about circadian rhythm, not a promise for your sleep tonight.",
        sourceIds: ["nimh-sad", "nhlbi-sleep-amount"],
        evidence: established,
        evidenceNote: "Public health pages describe daylight, mood, and sleep as related topics. They do not promise a result for one person.",
      },
      {
        heading: "Serotonin and melatonin",
        body: "NIMH describes theories that shorter winter days may relate to serotonin and melatonin. Researchers are still determining the causes. Daylight does not guarantee higher serotonin, and it does not cure depression.",
        sourceIds: ["nimh-sad"],
        evidence: emerging,
        evidenceNote: "NIMH presents these as theories that are still being studied.",
      },
      {
        heading: "Winter, latitude, and seasonal affective disorder",
        body: "NIMH notes that seasonal affective disorder is discussed more often where winter days are shorter, including New England, than in places such as Texas or Florida. Massachusetts is part of New England. lifeZoi does not publish a state rate. Seasonal affective disorder here is education only, not a diagnosis.",
        sourceIds: ["nimh-sad", "medlineplus-sad"],
        evidence: observational,
        evidenceNote: "Geography is described in public pages. A personal journal cannot diagnose a seasonal mood disorder.",
      },
      {
        heading: "A daily daylight habit",
        body: "One adaptable idea is a short time in daylight: a window, a doorway, a bench, or a walk. Cloudy weather still counts as daylight. There is no fixed number of minutes.",
        sourceIds: ["cdc-sun-safety", "nimh-sad"],
        evidence: established,
        evidenceNote: "CDC describes time outside as a way to be active and reduce stress. It is not a treatment plan.",
      },
      {
        heading: "Light boxes are not ordinary lamps",
        body: "NIMH describes light therapy with a specific light box, often discussed around 10,000 lux, with a filter for ultraviolet light, for about 30 to 45 minutes in clinical descriptions. That is not an ordinary household lamp and not a lifeZoi target. MedlinePlus says light therapy uses a special lamp, that mania is uncommon, and that bipolar disorder is a serious mood concern to raise with a clinician. An eye checkup is advised before starting, and medicines that increase sensitivity to light are a reason not to start light therapy on your own.",
        sourceIds: ["nimh-sad", "medlineplus-sad"],
        evidence: established,
        evidenceNote: "These are clinical descriptions from NIMH and MedlinePlus, not instructions to begin therapy.",
      },
      {
        heading: "Sun safety",
        body: "CDC sun-safety notes, reviewed in the page dated June 17, 2026, include shade, clothing, a hat, sunglasses, and a broad-spectrum sunscreen of SPF 15 or higher, with reapplication. Do not use indoor tanning. Do not seek a tan on purpose.",
        sourceIds: ["cdc-sun-safety"],
        evidence: established,
        evidenceNote: "CDC sun-safety page opened for this project.",
      },
    ],
  },
  {
    slug: "earth",
    title: "Feel the earth beneath your feet",
    summary: "Time in green space is a studied well-being topic. Electrical earthing is a separate, unproven idea.",
    blocks: [
      {
        heading: "Green space",
        body: "A 2022 review protocol describes research on green space and mood, stress, fatigue, vitality, and heart rate. The authors still call for more research. lifeZoi does not copy effect sizes. Time in a park, garden, or tree-lined street is associated in that literature with well-being. It is not medicine and not a replacement for sleep, food, movement, or care.",
        sourceIds: ["pmc-green-space"],
        evidence: observational,
        evidenceNote: "The opened paper is a protocol for a review. Direction of findings is described without copied numbers.",
      },
      {
        heading: "Electrical earthing is not the same topic",
        body: "Some writing uses “earthing” for an electrical claim about bare skin and the ground. Cleveland Clinic’s page, dated April 19, 2024, treats that claim as unproven. lifeZoi does not teach healing energy, and it does not claim effects on inflammation, diabetes, or depression.",
        sourceIds: ["cleveland-earthing"],
        evidence: emerging,
        evidenceNote: "Copyrighted clinic page. Linked, not quoted as a promise. The electrical claim stays unproven here.",
      },
      {
        heading: "Bare feet are optional",
        body: "Warm grass can be a pleasant sensation for some people. Bare feet are unsafe if you have diabetes, reduced sensation, circulation problems, wounds, or another foot-risk condition, unless a clinician has said otherwise. Hot, sharp, contaminated, or unfamiliar ground is a reason to keep shoes on.",
        sourceIds: ["cleveland-earthing"],
        evidence: established,
        evidenceNote: "Injury and infection cautions are practical safety, not a cure claim.",
      },
      {
        heading: "Other ways to notice the ground",
        body: "Put a hand on grass, sit on a bench, garden with gloves, touch a tree, sit near water, or simply look. A wheelchair, a balcony, and a window are valid ways to take part.",
        sourceIds: ["pmc-green-space", "cdc-sun-safety"],
        evidence: individual,
        evidenceNote: "These are adaptable options, not a required ritual.",
      },
    ],
  },
  {
    slug: "trees",
    title: "Hug a tree. Take a breath. Be present.",
    summary: "Forest bathing, or shinrin-yoku, means slow mindful time among trees. It is not a distance workout.",
    blocks: [
      {
        heading: "What the practice is",
        body: "The idea is to move slowly, or sit, and notice bark, leaves, air, and sound. You do not have to hug a tree. If you do, be gentle. Do not damage plants, climb anything unsafe, or disturb wildlife.",
        sourceIds: ["cleveland-forest", "pmc-forest"],
        evidence: individual,
        evidenceNote: "The practice is described as attention, not as a sport and not as energy transfer.",
      },
      {
        heading: "Phytoncides are not a promise",
        body: "Research discusses plant compounds in forest air. A review linked from PubMed Central says those mechanisms are not conclusively clarified. lifeZoi does not promise an immune change or that time among trees prevents illness.",
        sourceIds: ["pmc-forest"],
        evidence: emerging,
        evidenceNote: "Mechanism research in progress. No publication date was clearly visible on the opened page, so none is invented.",
      },
      {
        heading: "Clinic writing stays linked",
        body: "Cleveland Clinic published a forest-therapy article on December 6, 2023. It is copyrighted, so this page links out and does not repeat claims about cancer-killing proteins, oxygen delivery, or immunity.",
        sourceIds: ["cleveland-forest"],
        evidence: emerging,
        evidenceNote: "Link out. Original wording only.",
      },
    ],
  },
  {
    slug: "outside",
    title: "Step outside. Breathe. Move. Feel alive.",
    summary: "Outside time can be a walk, gardening, sitting, stretching, water, birds, or company. Adapt it to your body and your space.",
    blocks: [
      {
        heading: "Many ways to be outside",
        body: "Walking, rolling, gardening, sitting, gentle yoga, tai chi, stretching, watching water, listening for birds, or sharing a garden all count. A wheelchair, a bench, a balcony, and a window view are included. There is no fixed distance and no daily quota.",
        sourceIds: ["cdc-adult-activity", "cdc-older-activity", "cdc-sun-safety"],
        evidence: established,
        evidenceNote: "Regular physical activity is associated with important health benefits. This sentence is not a personal forecast.",
      },
      {
        heading: "No guilt and no seven-day cure",
        body: "A missed day is not a failure. Nothing on this page promises a medical result in seven days. Nature is not a replacement for food, sleep, movement you can do, or professional care.",
        sourceIds: ["nih-habits", "cdc-sun-safety"],
        evidence: established,
        evidenceNote: "Habit pages stress patience. Sun safety still applies when you go out.",
      },
    ],
  },
  {
    slug: "food",
    title: "Nourish your body with real food",
    summary: "Vegetables, fruit, nuts, seeds, whole grains, legumes, protein, and water are everyday topics. No food prevents disease or gives unlimited energy.",
    blocks: [
      {
        heading: "Everyday foods",
        body: "Vegetables and fruit can be fresh, frozen, or canned. Sugar that is part of whole fruit is not the same topic as sugary drinks. Nuts, seeds, beans, and whole grains add fiber. Protein supports muscles as people age. None of these foods is a treatment.",
        sourceIds: ["dga-eating-routine", "medlineplus-fiber", "fda-produce"],
        evidence: established,
        evidenceNote: "Dietary guidance describes variety. It is not a personal meal plan.",
      },
      {
        heading: "Water",
        body: "Fluid needs differ. A clinician’s fluid restriction comes first. Water is not a substitute for food.",
        sourceIds: ["cdc-water", "medlineplus-water"],
        evidence: established,
        evidenceNote: "Public pages say needs vary. No universal target is used here.",
      },
      {
        heading: "Growing a little food",
        body: "A windowsill herb, seasonal produce, or a farmers’ market are optional ways to notice food. They are not required.",
        sourceIds: ["fda-produce", "dga-eating-routine"],
        evidence: individual,
        evidenceNote: "Practical ideas. Wash produce whether or not it is organic.",
      },
      {
        heading: "Organic labels",
        body: "USDA organic labels differ, and they are not a claim that food is pesticide-free. Organic food is not automatically more nutritious. Conventional produce that you can afford, washed before eating, is a valid choice.",
        sourceIds: ["usda-organic-labels", "fda-produce"],
        evidence: established,
        evidenceNote: "Label rules come from USDA pages already opened for the coach. No nutrient ranking is invented.",
      },
    ],
  },
  {
    slug: "people",
    title: "What can we learn from people who live close to nature?",
    summary: "Other people’s routines can be inspiration. Climate does not decide a person’s health, and no culture is a ranking.",
    blocks: [
      {
        heading: "Inspiration, not a stereotype",
        body: "Shared meals, time outside, walking as transport, gardens, and cooking from vegetables, fruit, beans, and nuts show up in many places. lifeZoi does not claim that a climate, a coastline, or a tradition produces health. People in every setting adapt.",
        sourceIds: ["dga-eating-routine"],
        evidence: individual,
        evidenceNote: "The Dietary Guidelines fact sheet says there is not one right way to eat. A Mediterranean diet page was not used, because the URL that was opened was a niacin article.",
      },
      {
        heading: "No purchased identity",
        body: NATURE_CLOSE,
        sourceIds: ["nih-habits"],
        evidence: individual,
        evidenceNote: "A practical close. Not a product recommendation.",
      },
    ],
  },
];

export function natureModule(slug: string) {
  return natureModules.find((item) => item.slug === slug) ?? null;
}

export function natureCopyText() {
  return [
    NATURE_QUOTE,
    NATURE_CLOSE,
    ...natureModules.flatMap((module) => [module.title, module.summary, ...module.blocks.map((block) => block.body)]),
    ...NATURE_ACTIVITIES.map((item) => `${item.label} ${item.text}`),
  ].join("\n");
}

function isOutdoor(entry: NatureEntry) {
  return (entry.outdoorMinutes ?? 0) > 0 || (entry.weather !== "" && entry.weather !== "window");
}

export function outdoorMoodSentence(entries: NatureEntry[]) {
  const scored = entries.filter((entry) => entry.moodAfter !== null);
  const outdoor = scored.filter(isOutdoor);
  const other = scored.filter((entry) => !isOutdoor(entry));
  if (outdoor.length < 2 || other.length < 2) {
    return "There are not enough of your notes yet to describe a mood pattern. A note is an observation. It is not a cause and not a diagnosis.";
  }
  const mean = (list: NatureEntry[]) =>
    list.reduce((sum, entry) => sum + (entry.moodAfter ?? 0), 0) / list.length;
  if (mean(outdoor) > mean(other)) {
    return "Your journal shows that you often report a better mood on days when you spend time outdoors. That sentence uses only your notes. It is not proof of a cause, and it is not a diagnosis of seasonal depression.";
  }
  return "Your notes do not show a higher reported mood on outdoor days. That is an observation, not a diagnosis.";
}
