import { LINK_CHECKED } from "@/lib/wellness/exercise-resources/copy";

export type ExternalLink = {
  id: string;
  title: string;
  source: string;
  url: string;
  checked: typeof LINK_CHECKED;
};

export const externalLinks = [
  {
    id: "nia-toolkit",
    title: "Exercise and Older Adults Toolkit",
    source: "National Institute on Aging",
    url: "https://www.nia.nih.gov/exercise-toolkit",
    checked: LINK_CHECKED,
  },
  {
    id: "nia-exercise-hub",
    title: "Exercise and physical activity",
    source: "National Institute on Aging",
    url: "https://www.nia.nih.gov/health/exercise-and-physical-activity",
    checked: LINK_CHECKED,
  },
  {
    id: "nia-benefits",
    title: "Health Benefits of Exercise and Physical Activity",
    source: "National Institute on Aging",
    url: "https://www.nia.nih.gov/health/exercise-and-physical-activity/health-benefits-exercise-and-physical-activity",
    checked: LINK_CHECKED,
  },
  {
    id: "nia-tips",
    title: "Tips for Getting and Staying Active as You Age",
    source: "National Institute on Aging",
    url: "https://www.nia.nih.gov/health/exercise-and-physical-activity/tips-getting-and-staying-active-you-age",
    checked: LINK_CHECKED,
  },
  {
    id: "nia-outdoor",
    title: "Exercising Outdoors: Safety Tips for Older Adults",
    source: "National Institute on Aging",
    url: "https://www.nia.nih.gov/health/exercise-and-physical-activity/safety-tips-exercising-outdoors-older-adults",
    checked: LINK_CHECKED,
  },
  {
    id: "nia-chronic",
    title: "Exercising With Chronic Conditions",
    source: "National Institute on Aging",
    url: "https://www.nia.nih.gov/health/exercise-and-physical-activity/exercising-chronic-conditions",
    checked: LINK_CHECKED,
  },
  {
    id: "nia-three-types",
    title: "Three Types of Exercise Can Improve Your Health and Physical Ability",
    source: "National Institute on Aging",
    url: "https://www.nia.nih.gov/health/exercise-and-physical-activity/three-types-exercise-can-improve-your-health-and-physical",
    checked: LINK_CHECKED,
  },
  {
    id: "nia-playlist",
    title: "Exercises for Older Adults playlist",
    source: "National Institute on Aging on YouTube",
    url: "https://www.youtube.com/playlist?list=PLmk21KJuZUM6_Gy9jxzF9sTO_6u_tYCOm",
    checked: LINK_CHECKED,
  },
  {
    id: "nia-emotional-video",
    title: "The Emotional Benefits of Exercise",
    source: "National Institute on Aging on YouTube",
    url: "https://www.youtube.com/watch?v=MjMkBaqimFo",
    checked: LINK_CHECKED,
  },
  {
    id: "nia-aging-video",
    title: "Exercise and Healthy Aging: Expert Q&A",
    source: "National Institute on Aging on YouTube",
    url: "https://www.youtube.com/watch?v=n5kWf0pvEkc",
    checked: LINK_CHECKED,
  },
  {
    id: "nia-flexibility-video",
    title: "4 Flexibility and Cool Down Exercises for Older Adults",
    source: "National Institute on Aging on YouTube",
    url: "https://www.youtube.com/watch?v=kCQ6irSQwYA",
    checked: LINK_CHECKED,
  },
  {
    id: "nia-flex6-video",
    title: "6 Flexibility Exercises for Older Adults",
    source: "National Institute on Aging on YouTube",
    url: "https://www.youtube.com/watch?v=KcdkySvCRCc",
    checked: LINK_CHECKED,
  },
  {
    id: "nia-strength-video",
    title: "Strength Training Workout for Older Adults",
    source: "National Institute on Aging on YouTube",
    url: "https://www.youtube.com/watch?v=JejTelL05Qw",
    checked: LINK_CHECKED,
  },
  {
    id: "nia-10-min-video",
    title: "10-minute Workout for Older Adults",
    source: "National Institute on Aging on YouTube",
    url: "https://www.youtube.com/watch?v=G1lwVhnnkoU",
    checked: LINK_CHECKED,
  },
  {
    id: "nia-15-min-video",
    title: "15-minute Workout for Older Adults",
    source: "National Institute on Aging on YouTube",
    url: "https://www.youtube.com/watch?v=Ev6yE55kYGw",
    checked: LINK_CHECKED,
  },
  {
    id: "nia-balance-video",
    title: "Balance Exercise for Older Adults",
    source: "National Institute on Aging on YouTube",
    url: "https://www.youtube.com/watch?v=4YOBIEOobCE",
    checked: LINK_CHECKED,
  },
  {
    id: "nia-heel-video",
    title: "Heel-to-Toe Walk Balance Exercise for Older Adults",
    source: "National Institute on Aging on YouTube",
    url: "https://www.youtube.com/watch?v=z_GKdFf3qv4",
    checked: LINK_CHECKED,
  },
  {
    id: "nia-one-foot-video",
    title: "Stand on One Foot Balance Exercise for Older Adults",
    source: "National Institute on Aging on YouTube",
    url: "https://www.youtube.com/watch?v=QT5d4tTXW6U",
    checked: LINK_CHECKED,
  },
  {
    id: "nia-wall-pushup-video",
    title: "Wall Pushups Strength Exercise for Older Adults",
    source: "National Institute on Aging on YouTube",
    url: "https://www.youtube.com/watch?v=751E9kAdkwg",
    checked: LINK_CHECKED,
  },
  {
    id: "nia-hand-grip-video",
    title: "Hand Grip Strength Exercise for Older Adults",
    source: "National Institute on Aging on YouTube",
    url: "https://www.youtube.com/watch?v=kgqIdCwVivE",
    checked: LINK_CHECKED,
  },
  {
    id: "nia-ankle-video",
    title: "Ankle Stretch for Older Adults",
    source: "National Institute on Aging on YouTube",
    url: "https://www.youtube.com/watch?v=87BeiyTFZyU",
    checked: LINK_CHECKED,
  },
  {
    id: "nia-shoulder-video",
    title: "Shoulder and Arm Stretch for Older Adults",
    source: "National Institute on Aging on YouTube",
    url: "https://www.youtube.com/watch?v=CW0h60-PS4Y",
    checked: LINK_CHECKED,
  },
  {
    id: "medlineplus-older",
    title: "Exercise for Older Adults",
    source: "MedlinePlus",
    url: "https://medlineplus.gov/exerciseforolderadults.html",
    checked: LINK_CHECKED,
  },
  {
    id: "medlineplus-fitness",
    title: "Exercise and Physical Fitness",
    source: "MedlinePlus",
    url: "https://medlineplus.gov/exerciseandphysicalfitness.html",
    checked: LINK_CHECKED,
  },
  {
    id: "medlineplus-how-much",
    title: "How Much Exercise Do I Need?",
    source: "MedlinePlus",
    url: "https://medlineplus.gov/howmuchexercisedoineed.html",
    checked: LINK_CHECKED,
  },
  {
    id: "medlineplus-benefits",
    title: "Benefits of Exercise",
    source: "MedlinePlus",
    url: "https://medlineplus.gov/benefitsofexercise.html",
    checked: LINK_CHECKED,
  },
  {
    id: "medlineplus-fiber",
    title: "Fiber",
    source: "MedlinePlus Medical Encyclopedia",
    url: "https://medlineplus.gov/ency/article/002470.htm",
    checked: LINK_CHECKED,
  },
  {
    id: "cdc-older",
    title: "Older Adult Activity: An Overview",
    source: "Centers for Disease Control and Prevention",
    url: "https://www.cdc.gov/physical-activity-basics/guidelines/older-adults.html",
    checked: LINK_CHECKED,
  },
  {
    id: "liveup",
    title: "Fitness for all",
    source: "LiveUp",
    url: "https://www.liveup.org.au/fitness-for-all",
    checked: LINK_CHECKED,
  },
  {
    id: "chair-yoga-fit",
    title: "Chair Yoga Fit",
    source: "Chair Yoga Fit",
    url: "https://chairyoga.fit/",
    checked: LINK_CHECKED,
  },
  {
    id: "nccih-yoga",
    title: "Yoga: Effectiveness and Safety",
    source: "National Center for Complementary and Integrative Health",
    url: "https://www.nccih.nih.gov/health/yoga-effectiveness-and-safety",
    checked: LINK_CHECKED,
  },
  {
    id: "nccih-tai-chi",
    title: "Tai Chi: What You Need To Know",
    source: "National Center for Complementary and Integrative Health",
    url: "https://www.nccih.nih.gov/health/tai-chi-what-you-need-to-know",
    checked: LINK_CHECKED,
  },
  {
    id: "nimh-stress",
    title: "I'm So Stressed Out! Fact Sheet",
    source: "National Institute of Mental Health",
    url: "https://www.nimh.nih.gov/health/publications/so-stressed-out-fact-sheet",
    checked: LINK_CHECKED,
  },
  {
    id: "nutrition-gov-videos",
    title: "Exercise Examples and Videos",
    source: "Nutrition.gov",
    url: "https://www.nutrition.gov/topics/exercise-and-fitness/exercise-examples-and-videos",
    checked: LINK_CHECKED,
  },
  {
    id: "fda-added-sugars",
    title: "Added Sugars on the Nutrition Facts Label",
    source: "U.S. Food and Drug Administration",
    url: "https://www.fda.gov/food/nutrition-facts-label/added-sugars-nutrition-facts-label",
    checked: LINK_CHECKED,
  },
  {
    id: "dietary-guidelines",
    title: "Dietary Guidelines for Americans",
    source: "Dietary Guidelines for Americans",
    url: "https://www.dietaryguidelines.gov/",
    checked: LINK_CHECKED,
  },
] as const satisfies readonly ExternalLink[];

export type ExternalLinkId = (typeof externalLinks)[number]["id"];

const byId = new Map(externalLinks.map((link) => [link.id, link]));

export function linkById(id: ExternalLinkId): ExternalLink {
  const link = byId.get(id);
  if (!link) throw new Error(`Missing exercise link: ${id}`);
  return link;
}

export function linksByIds(ids: readonly ExternalLinkId[]): ExternalLink[] {
  return ids.map((id) => linkById(id));
}
