import type { Reference } from "@/lib/encyclopedia/types";
import { msg } from "@/lib/i18n/translate";

/**
 * "Real People. Real Stories." in the Health Encyclopedia.
 *
 * Two kinds of story, always labelled:
 * - "real": a real person who told their own story in public, or whose life is
 *   documented by reliable sources. Only what the cited sources say is written.
 * - "composite": an illustrative person with no real identity. Each step follows
 *   the official guidance it cites. It is never presented as a real case.
 *
 * Every story pairs the experience with "What science says", each point with an
 * evidence label, and sources. No story gives medical advice, a dose, or a cure.
 */

export const STORY_KINDS = {
  real: { label: msg("Real person"), note: msg("A real person's story, told only from the sources linked below.") },
  composite: {
    label: msg("Composite story"),
    note: msg("An illustrative story. This person is not real. Each step follows the public health guidance linked below."),
  },
} as const;
export type StoryKind = keyof typeof STORY_KINDS;

export const STORY_THEMES = [
  { slug: "recovery", title: msg("Recovery") },
  { slug: "aging", title: msg("Aging") },
  { slug: "discipline", title: msg("Discipline") },
  { slug: "treatment", title: msg("Treatment") },
  { slug: "habits", title: msg("Changing habits") },
  { slug: "tradition", title: msg("Traditional practice") },
  { slug: "history", title: msg("Medical history") },
] as const;
export type StoryTheme = (typeof STORY_THEMES)[number]["slug"];

export const STORY_CONDITIONS = [
  { slug: "heart", title: msg("Heart disease") },
  { slug: "stroke", title: msg("Stroke") },
  { slug: "diabetes", title: msg("Prediabetes and diabetes") },
  { slug: "cancer", title: msg("Cancer") },
  { slug: "smoking", title: msg("Smoking") },
  { slug: "pain", title: msg("Back pain") },
  { slug: "aging", title: msg("Healthy aging") },
] as const;
export type StoryCondition = (typeof STORY_CONDITIONS)[number]["slug"];

export const STORY_APPROACHES = [
  { slug: "western", title: msg("Western medicine") },
  { slug: "eastern", title: msg("Eastern medicine") },
  { slug: "integrative", title: msg("Integrative care") },
  { slug: "lifestyle", title: msg("Lifestyle change") },
] as const;
export type StoryApproach = (typeof STORY_APPROACHES)[number]["slug"];

export type ScienceLevel = "established" | "preliminary" | "traditional";

export type HealthStory = {
  id: string;
  kind: StoryKind;
  title: string;
  /** A short line for the card. */
  teaser: string;
  /** Where the story takes place, for example "Japan". */
  place: string;
  themes: StoryTheme[];
  conditions: StoryCondition[];
  approaches: StoryApproach[];
  illustration: string;
  /** The story, one paragraph per item. */
  story: string[];
  science: { point: string; level: ScienceLevel }[];
  /** What the story does not show, so nobody reads it as a promise. */
  limits: string;
  sources: Reference[];
  articles?: string[];
};

const CDC = "Centers for Disease Control and Prevention";
const tipsHeart: Reference = {
  title: "Smoking and Heart Disease, Stroke, and Peripheral Artery Disease",
  publisher: CDC,
  url: "https://www.cdc.gov/tobacco/campaign/tips/diseases/heart-disease-stroke.html",
};
const cdcSmoking: Reference = { title: "Cigarette Smoking", publisher: CDC, url: "https://www.cdc.gov/tobacco/about/index.html" };
const heartRecovery: Reference = { title: "Heart Attack: Recovery", publisher: "National Heart, Lung, and Blood Institute (NIH)", url: "https://www.nhlbi.nih.gov/health/heart-attack/recovery" };
const olderActivity: Reference = { title: "Older Adult Activity: An Overview", publisher: CDC, url: "https://www.cdc.gov/physical-activity-basics/guidelines/older-adults.html" };

/** Stories approved by the owner on 2026-11-24. Each was checked against its sources that day. */
export const STORIES: readonly HealthStory[] = [
  {
    id: "shigeaki-hinohara",
    kind: "real",
    title: "The doctor who kept working after 100",
    teaser: "Shigeaki Hinohara of Japan practised medicine past his 100th birthday and spent his life promoting prevention.",
    place: "Japan",
    themes: ["aging", "discipline"],
    conditions: ["aging"],
    approaches: ["western", "lifestyle"],
    illustration: "tree",
    story: [
      "Shigeaki Hinohara was a Japanese physician linked with St. Luke's hospital. He continued practising as a doctor even after turning 100, and died on July 18, 2017, at the age of 105.",
      "Much of his work was about preventing illness rather than only treating it. He was a pioneer of complete annual health check-ups in Japan, known as the \"human dry-dock\", and in 1978 he proposed the term \"lifestyle-related disease\".",
      "He kept starting new things late in life. At 100 he began the Smart Senior Association. In his final months, after he became unable to eat, he refused to be fed through a tube and spent the rest of his days at home.",
    ],
    science: [
      { point: "Regular physical activity, including muscle-strengthening and balance activities, is recommended for adults aged 65 and older.", level: "established" },
      { point: "Staying socially connected is linked with better health, and loneliness is linked with a higher risk of heart disease, dementia, stroke, and depression.", level: "preliminary" },
    ],
    limits: "One person's long life does not show that any single habit made it happen. Genes, chance, and access to health care matter too.",
    sources: [
      { title: "Shigeaki Hinohara, Japan's centenarian doctor, dies at 105", publisher: "The Japan Times", url: "https://japantimes.co.jp/news/2017/07/18/national/shigeaki-hinohara-japans-centenarian-doctor-st-lukes-dies-105" },
      { title: "Dr Shigeaki Hinohara: 1911-2017", publisher: "World Organization of Family Doctors (WONCA)", url: "https://www.globalfamilydoctor.com/News/DrShigeakiHINOHARA.aspx" },
      olderActivity,
      { title: "Our Epidemic of Loneliness and Isolation", publisher: "U.S. Surgeon General", url: "https://www.hhs.gov/sites/default/files/surgeon-general-social-connection-advisory.pdf" },
    ],
    articles: ["healthy-aging"],
  },
  {
    id: "bks-iyengar",
    kind: "real",
    title: "A sickly child who practised yoga for life",
    teaser: "B. K. S. Iyengar of India credited yoga with improving his health and taught it for decades.",
    place: "India",
    themes: ["discipline", "tradition", "aging"],
    conditions: ["aging"],
    approaches: ["eastern", "lifestyle"],
    illustration: "lotus",
    story: [
      "B. K. S. Iyengar was born into poverty in India and was sickly as a child. He started practising yoga after a series of childhood illnesses, and he credited yoga with improving his health.",
      "He began teaching in the 1930s. In 1966 he published \"Light on Yoga\", one of the books that helped spread yoga to the West. People who studied with him said he practised daily.",
      "He died in August 2014 at the age of 95.",
    ],
    science: [
      { point: "Yoga is a traditional practice from India. Modern research on its health effects is still growing and is not settled for most conditions.", level: "traditional" },
      { point: "For older adults, U.S. guidance recommends muscle-strengthening and balance activities each week. Some yoga styles include both.", level: "established" },
    ],
    limits: "His story does not show that yoga treats illness. It shows one person's lifelong discipline. Anyone with a health condition should ask a clinician which kinds of movement are safe for them.",
    sources: [
      { title: "Yoga Guru BKS Iyengar Dies at 95", publisher: "TIME", url: "https://time.com/3148230/yoga-guru-bks-iyengar-dies-at-95/" },
      { title: "Yogi Iyengar, Who Helped Bring Yoga To The West, Dies At 95", publisher: "NPR", url: "https://www.npr.org/transcripts/341958770" },
      olderActivity,
    ],
    articles: ["meditation-and-mind-body", "eastern-and-western-medicine"],
  },
  {
    id: "roosevelt-heart-attack",
    kind: "real",
    title: "A heart attack at 45, and a new life without cigarettes",
    teaser: "Roosevelt, a plumber from the United States, had a heart attack and six bypasses, then quit smoking.",
    place: "United States",
    themes: ["recovery", "treatment", "habits"],
    conditions: ["heart", "smoking"],
    approaches: ["western", "lifestyle"],
    illustration: "heart",
    story: [
      "Roosevelt shared his story with the CDC's Tips From Former Smokers campaign. At 45 he had a heart attack that kept him in hospital for a month. When other treatment was not enough, he had bypass surgery, six bypasses in all.",
      "His heart is no longer strong enough for his career as a commercial plumber, so he had to give it up. \"I quit smoking because I didn't want to kill myself,\" he said.",
      "When the CDC told his story, he was 51 and had been smoke-free for 3 years.",
    ],
    science: [
      { point: "Quitting smoking lowers the risk of early death and of developing smoking-related diseases. Counselling and medicines can help people quit.", level: "established" },
      { point: "After a heart attack, cardiac rehabilitation, taking prescribed medicines, and support from family and the care team are part of recovery.", level: "established" },
    ],
    limits: "Every heart attack and recovery is different. Decisions about surgery, medicines, and returning to work belong with the person's own care team.",
    sources: [
      { title: "Roosevelt S.'s Story", publisher: "CDC Tips From Former Smokers", url: "https://www.cdc.gov/tobacco/campaign/tips/stories/roosevelt.html" },
      cdcSmoking,
      heartRecovery,
      tipsHeart,
    ],
    articles: ["heart-health-blood-pressure-cholesterol"],
  },
  {
    id: "brian-heart",
    kind: "real",
    title: "Thirty years of living with the cost of smoking",
    teaser: "Brian had a heart attack at 35, kept smoking, and later needed a new heart. A difficult story, told by the CDC.",
    place: "United States",
    themes: ["treatment", "habits"],
    conditions: ["heart", "smoking", "cancer"],
    approaches: ["western"],
    illustration: "stethoscope",
    story: [
      "Brian's story is told by the CDC's Tips From Former Smokers campaign. He had a heart attack at age 35. \"The moment I walked out of the hospital, I started sneaking cigarettes again,\" he said.",
      "He finally quit for good at 55, and three years later he received a new heart. At 63 he was diagnosed with lung cancer.",
      "Brian died at 68, after more than 30 years of smoking-related health problems. His story shows how hard quitting can be, and why getting help to quit matters.",
    ],
    science: [
      { point: "Treatments, including counselling and medicines, can help people quit smoking, and free resources are available.", level: "established" },
      { point: "Smoking can make blood sticky and more likely to clot, which can block blood flow to the heart and brain.", level: "established" },
    ],
    limits: "This story is about one person. Quitting at any age has benefits, and it is never too late to ask for help.",
    sources: [{ title: "Brian H.'s Story", publisher: "CDC Tips From Former Smokers", url: "https://www.cdc.gov/tobacco/campaign/tips/stories/brian-heart.html" }, cdcSmoking, tipsHeart],
    articles: ["heart-health-blood-pressure-cholesterol"],
  },
  {
    id: "henrietta-lacks",
    kind: "real",
    title: "Henrietta Lacks and the cells that changed medicine",
    teaser: "Her cells were taken without her consent in 1951. They helped science, and changed how we think about consent.",
    place: "United States",
    themes: ["history", "treatment"],
    conditions: ["cancer"],
    approaches: ["western"],
    illustration: "cell",
    story: [
      "Henrietta Lacks was a 31-year-old African American mother of five who was treated for cervical cancer at Johns Hopkins in the early 1950s. Doctors took extra tissue for research without her consent. She died in October 1951.",
      "Her cells, known as HeLa cells, kept growing in the laboratory. They have contributed to many medical breakthroughs, including work on the polio vaccine, and have been referred to in more than 74,000 scientific publications.",
      "In 2013, the U.S. National Institutes of Health reached an agreement with her family about the use of HeLa genome data. A working group that includes two members of the Lacks family helps review requests.",
    ],
    science: [
      { point: "Today, research ethics boards require informed consent from people who take part in human research. Johns Hopkins says taking tissue as was done in 1951 would not happen today without the patient's consent.", level: "established" },
    ],
    limits: "Her story is a reminder that medical progress must respect patients. It is not a story about a treatment that a reader should try.",
    sources: [
      { title: "Henrietta Lacks: Frequently Asked Questions", publisher: "Johns Hopkins Medicine", url: "https://www.hopkinsmedicine.org/henrietta-lacks/frequently-asked-questions" },
      { title: "Upholding the Highest Bioethical Standards", publisher: "Johns Hopkins Medicine", url: "https://www.hopkinsmedicine.org/henrietta-lacks/upholding-the-highest-bioethical-standards" },
      { title: "HeLa Cells: A New Chapter in An Enduring Story", publisher: "NIH Director's Blog", url: "https://directorsblog.nih.gov/2013/08/07/hela-cells-a-new-chapter-in-an-enduring-story/" },
    ],
    articles: ["how-cancer-develops", "evidence-based-medicine"],
  },
  {
    id: "stroke-rehabilitation",
    kind: "composite",
    title: "Learning to walk and talk again after a stroke",
    teaser: "Maria, a composite patient in Europe, goes through stroke rehabilitation step by step.",
    place: "Europe (composite story)",
    themes: ["recovery", "treatment"],
    conditions: ["stroke"],
    approaches: ["western"],
    illustration: "brain",
    story: [
      "Maria is not a real person. Her story follows the stroke recovery steps described by the UK's National Health Service.",
      "After her stroke, Maria works with a physiotherapist on exercises to help with movement, and with a speech and language therapist on her speech and swallowing. Some days she feels anxious, low, and very tired, and her team offers talking therapy such as cognitive behavioural therapy.",
      "Her recovery is slow. The NHS explains that for some people it takes days or weeks, and for others months or years. About six months after her stroke, Maria has a review of her progress, and her goals are updated.",
    ],
    science: [
      { point: "Stroke rehabilitation can include physiotherapy, speech and language therapy, and help with emotional effects such as anxiety and depression.", level: "established" },
      { point: "Recovery after a stroke varies widely from person to person.", level: "established" },
    ],
    limits: "Maria is an example, not a real case. A stroke is an emergency: anyone with signs of a stroke should call emergency services at once.",
    sources: [{ title: "Recovering from a stroke", publisher: "NHS", url: "https://www.nhs.uk/conditions/stroke/recovery/" }],
    articles: ["brain-health-and-memory"],
  },
  {
    id: "prediabetes-lifestyle",
    kind: "composite",
    title: "A prediabetes diagnosis and a year of small changes",
    teaser: "James, a composite example, joins a year-long lifestyle programme after learning he has prediabetes.",
    place: "United States (composite story)",
    themes: ["habits"],
    conditions: ["diabetes"],
    approaches: ["lifestyle"],
    illustration: "plate",
    story: [
      "James is not a real person. His story follows the CDC's National Diabetes Prevention Program lifestyle change program.",
      "After a check-up shows that he has prediabetes, James joins the year-long program. A trained lifestyle coach leads it, and a group of people with the same goals meets with him, in person or online.",
      "The program focuses on long-term changes rather than quick results. James works on what he eats, how active he is, and how he handles stress, and he keeps going even in the weeks when it is hard.",
    ],
    science: [
      { point: "The CDC says research shows that people who make certain lifestyle changes can cut their risk for type 2 diabetes in half.", level: "established" },
      { point: "These changes can also lower the risk of heart attack or stroke.", level: "established" },
    ],
    limits: "James is an example, not a real case. The program is for people with prediabetes or at risk of type 2 diabetes, not for people who already have diabetes.",
    sources: [{ title: "Preventing Type 2 Diabetes with the Lifestyle Change Program", publisher: CDC, url: "https://www.cdc.gov/diabetes-prevention/lifestyle-change-program/index.html" }],
    articles: ["healthy-eating-patterns"],
  },
  {
    id: "back-pain-integrative",
    kind: "composite",
    title: "Back pain, acupuncture, and a doctor in the loop",
    teaser: "Lin, a composite example, adds acupuncture to her care for long-lasting low back pain.",
    place: "Composite story",
    themes: ["treatment", "tradition"],
    conditions: ["pain"],
    approaches: ["integrative", "eastern", "western"],
    illustration: "needle",
    story: [
      "Lin is not a real person. Her story follows what the U.S. National Center for Complementary and Integrative Health says about acupuncture and integrative health.",
      "Lin has had low back pain for many months. She talks with her doctor, who keeps looking after her usual care, and they agree she will also try acupuncture. Bringing conventional and complementary approaches together in a coordinated way like this is called integrative health.",
      "She chooses a licensed acupuncturist, because acupuncture that is not delivered properly can cause serious problems such as infections. She tells both her doctor and her acupuncturist about everything she is using.",
    ],
    science: [
      { point: "Research has shown that acupuncture may be helpful for several pain conditions, including back or neck pain. For chronic low back pain the evidence is of moderate quality.", level: "preliminary" },
      { point: "Acupuncture comes from traditional Chinese medicine.", level: "traditional" },
    ],
    limits: "Lin is an example, not a real case. Acupuncture does not help everyone, and new or severe back pain should be checked by a clinician first.",
    sources: [
      { title: "Acupuncture: Effectiveness and Safety", publisher: "NCCIH (NIH)", url: "https://www.nccih.nih.gov/health/acupuncture-what-you-need-to-know" },
      { title: "Traditional Chinese Medicine: What You Need To Know", publisher: "NCCIH (NIH)", url: "https://www.nccih.nih.gov/health/traditional-chinese-medicine-what-you-need-to-know" },
      { title: "Complementary, Alternative, or Integrative Health: What's In a Name?", publisher: "NCCIH (NIH)", url: "https://www.nccih.nih.gov/health/complementary-alternative-or-integrative-health-whats-in-a-name" },
    ],
    articles: ["acupuncture", "eastern-and-western-medicine"],
  },
];

export function findStory(id: string): HealthStory | undefined {
  return STORIES.find((story) => story.id === id);
}

export type StoryFilter = { theme?: string | null; condition?: string | null; approach?: string | null; kind?: StoryKind | null };

export function storiesFor(filter: StoryFilter, stories: readonly HealthStory[] = STORIES): HealthStory[] {
  return stories.filter(
    (story) =>
      (!filter.theme || story.themes.includes(filter.theme as StoryTheme)) &&
      (!filter.condition || story.conditions.includes(filter.condition as StoryCondition)) &&
      (!filter.approach || story.approaches.includes(filter.approach as StoryApproach)) &&
      (!filter.kind || story.kind === filter.kind),
  );
}
