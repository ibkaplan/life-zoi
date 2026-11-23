import { NCCIH, nobel, PUBMED, WHO } from "@/lib/encyclopedia/articles/shared";
import type { Reference } from "@/lib/encyclopedia/types";
import { msg } from "@/lib/i18n/translate";

/**
 * "Did You Know? — Amazing Health Facts".
 *
 * Every fact names the source it was checked against. The words are LifeZoi's own
 * summary, drafted with AI assistance and not yet read by a medical reviewer. Facts
 * stay qualitative: a number appears only when the cited source states it.
 * Facts are English only for now, like the articles. Add new facts at the end of
 * FACTS so the Fact of the Day order for past days does not change.
 */

export const FACT_CATEGORIES = [
  { slug: "body", title: msg("Amazing Human Body Facts"), illustration: "cell" },
  { slug: "brain", title: msg("Brain & Memory"), illustration: "brain" },
  { slug: "heart", title: msg("Heart & Circulation"), illustration: "heart" },
  { slug: "sleep", title: msg("Sleep & Dreams"), illustration: "moon" },
  { slug: "nutrition", title: msg("Nutrition & Digestion"), illustration: "plate" },
  { slug: "immune", title: msg("Immune System"), illustration: "immune" },
  { slug: "hormones", title: msg("Hormones"), illustration: "needle" },
  { slug: "aging", title: msg("Aging & Longevity"), illustration: "tree" },
  { slug: "eastern", title: msg("Eastern Medicine"), illustration: "lotus" },
  { slug: "western", title: msg("Western Medicine"), illustration: "stethoscope" },
  { slug: "history", title: msg("Medical History"), illustration: "timeline" },
  { slug: "herbs", title: msg("Natural Health & Herbs"), illustration: "leaf" },
  { slug: "discoveries", title: msg("New Medical Discoveries"), illustration: "dna" },
  { slug: "mind", title: msg("Psychology & Emotions"), illustration: "balance" },
  { slug: "exercise", title: msg("Exercise & Physical Health"), illustration: "clock" },
] as const;

export type FactCategory = (typeof FACT_CATEGORIES)[number]["slug"];

/** Established: settled science or official guidance. Preliminary: promising or mixed research. Traditional: a belief or practice, with what research says about it. */
export const FACT_EVIDENCE = {
  established: { label: msg("Established science"), meaning: msg("Supported by strong, consistent research or official health guidance.") },
  preliminary: { label: msg("Preliminary research"), meaning: msg("Encouraging or mixed findings. More research is needed before it is settled.") },
  traditional: { label: msg("Traditional practice"), meaning: msg("A traditional belief or practice. The explanation says what modern research has and has not shown.") },
} as const;

export type FactEvidence = keyof typeof FACT_EVIDENCE;

export type HealthFact = {
  id: string;
  category: FactCategory;
  headline: string;
  fact: string;
  evidence: FactEvidence;
  /** Shown when the fact is opened. */
  why: string;
  how: string;
  science: string;
  history?: string;
  related?: string;
  sources: Reference[];
  articles?: string[];
};

const NIH_NINDS = "National Institute of Neurological Disorders and Stroke (NIH)";
const CDC = "Centers for Disease Control and Prevention";

const sleepBasics: Reference = {
  title: "Brain Basics: Understanding Sleep",
  publisher: NIH_NINDS,
  url: "https://www.ninds.nih.gov/health-information/public-education/brain-basics/brain-basics-understanding-sleep",
};
const cdcSleep: Reference = { title: "About Sleep", publisher: CDC, url: "https://www.cdc.gov/sleep/about/index.html" };
const activityGuidelines: Reference = {
  title: "Adult Activity: An Overview",
  publisher: CDC,
  url: "https://www.cdc.gov/physical-activity-basics/guidelines/adults.html",
};
const olderActivity: Reference = {
  title: "Older Adult Activity: An Overview",
  publisher: CDC,
  url: "https://www.cdc.gov/physical-activity-basics/guidelines/older-adults.html",
};
const herbDrug: Reference = { title: "Herb-Drug Interactions", publisher: NCCIH, url: "https://www.nccih.nih.gov/health/providers/digest/herb-drug-interactions" };

export const FACTS: readonly HealthFact[] = [
  {
    id: "temperature-touch-sensors",
    category: "body",
    headline: "Your nerves have dedicated sensors for heat and touch",
    fact: "Nerve endings carry special receptor molecules that turn temperature and touch into electrical signals the brain can read.",
    evidence: "established",
    why: "It explains how you can tell warm from hot, or a light touch from firm pressure, in a fraction of a second.",
    how: "Some receptors respond to heat or cold. Others open when the cell membrane is pressed or stretched. Either way, the nerve sends a signal to the brain.",
    science: "Finding these receptors helped researchers understand how the body senses its surroundings, and it is an active area of research on pain.",
    history: "David Julius and Ardem Patapoutian shared the 2021 Nobel Prize in Physiology or Medicine for their discoveries of receptors for temperature and touch.",
    sources: [nobel("medicine", 2021)],
  },
  {
    id: "cells-sense-oxygen",
    category: "body",
    headline: "Your cells can sense how much oxygen they have",
    fact: "Cells have a molecular system that notices when oxygen runs low and switches on genes that help the body adapt.",
    evidence: "established",
    why: "Oxygen sensing helps the body respond to exercise, high altitude, and wounds, and it is involved in diseases such as anaemia and cancer.",
    how: "When oxygen is low, a protein complex called HIF builds up and turns on genes, including one for erythropoietin (EPO), a hormone that raises red blood cell production.",
    science: "This pathway is now a target for medicines, and research continues into how it can be used safely.",
    history: "William Kaelin, Peter Ratcliffe, and Gregg Semenza received the 2019 Nobel Prize in Physiology or Medicine for this discovery.",
    sources: [nobel("medicine", 2019)],
  },
  {
    id: "cells-recycle",
    category: "body",
    headline: "Your cells recycle their own worn-out parts",
    fact: "Cells break down and reuse their own old or damaged components through a process called autophagy, meaning 'self-eating'.",
    evidence: "established",
    why: "Autophagy helps cells stay clean and respond to stress such as hunger and infection.",
    how: "The cell wraps unwanted material in a small membrane bag and delivers it to a compartment that breaks it down into reusable building blocks.",
    science: "Autophagy itself is well established. Claims that a particular diet or fast 'boosts autophagy' to improve human health are still being studied.",
    history: "Yoshinori Ohsumi received the 2016 Nobel Prize in Physiology or Medicine for discovering how autophagy works, starting with experiments in yeast.",
    sources: [nobel("medicine", 2016)],
    articles: ["what-happens-when-you-fast"],
  },
  {
    id: "brain-gps",
    category: "brain",
    headline: "Your brain has its own GPS",
    fact: "Special nerve cells in the brain fire when you are in particular places, building an inner map that helps you find your way.",
    evidence: "established",
    why: "It shows that the brain represents space with dedicated cells, which helps explain why getting lost can be an early sign of some memory problems.",
    how: "'Place cells' in the hippocampus fire at specific locations. 'Grid cells' in a nearby area fire in a regular pattern that works like coordinates.",
    science: "Most of this was first shown in rodents. Studies in people support the same kind of system.",
    history: "John O'Keefe, May-Britt Moser, and Edvard Moser received the 2014 Nobel Prize in Physiology or Medicine for discovering these cells.",
    sources: [nobel("medicine", 2014)],
    articles: ["brain-health-and-memory"],
  },
  {
    id: "brain-chemical-signals",
    category: "brain",
    headline: "Brain cells talk to each other with chemicals",
    fact: "Nerve cells pass messages across tiny gaps by releasing chemical messengers that change how the next cell behaves.",
    evidence: "established",
    why: "This chemical signalling underlies thinking, movement, and mood, and many medicines for the brain act on it.",
    how: "One nerve cell releases a messenger into the gap, called a synapse. The next cell picks it up with receptors and changes its own activity in response.",
    science: "How these signals are passed on inside nerve cells is called signal transduction. Researchers are still learning how it shapes learning and memory.",
    history: "Arvid Carlsson, Paul Greengard, and Eric Kandel received the 2000 Nobel Prize in Physiology or Medicine for discoveries concerning signal transduction in the nervous system.",
    sources: [nobel("medicine", 2000)],
    articles: ["brain-health-and-memory"],
  },
  {
    id: "smell-genes",
    category: "brain",
    headline: "A large family of genes lets you tell thousands of smells apart",
    fact: "Your nose uses many different odour receptors, and the brain recognises a smell from the pattern of receptors it switches on.",
    evidence: "established",
    why: "It explains how we can recognise so many smells with a limited number of receptor types.",
    how: "Each smell-sensing cell carries one type of receptor. A single smell activates a combination of them, and the brain reads the combination like a code.",
    science: "Losing the sense of smell can happen with infections such as COVID-19 and with some brain conditions, and it is an active area of research.",
    history: "Richard Axel and Linda Buck received the 2004 Nobel Prize in Physiology or Medicine for discovering odorant receptors.",
    sources: [nobel("medicine", 2004)],
  },
  {
    id: "nitric-oxide",
    category: "heart",
    headline: "A simple gas helps your blood vessels relax",
    fact: "The body makes nitric oxide, a gas that signals blood vessel walls to relax and widen.",
    evidence: "established",
    why: "It was a surprise that a gas could act as a signal between cells, and it opened new ways to treat heart and blood vessel problems.",
    how: "The inner lining of blood vessels releases nitric oxide. It spreads into the surrounding muscle, which relaxes, so blood flows more easily.",
    science: "This helps explain how nitroglycerin, a long-used heart medicine, works.",
    history: "Robert Furchgott, Louis Ignarro, and Ferid Murad received the 1998 Nobel Prize in Physiology or Medicine for this discovery.",
    sources: [nobel("medicine", 1998)],
    articles: ["heart-health-blood-pressure-cholesterol"],
  },
  {
    id: "self-catheter",
    category: "heart",
    headline: "A doctor once threaded a tube into his own heart",
    fact: "In 1929 Werner Forssmann passed a thin tube through a vein in his own arm to his heart, showing that heart catheterization was possible.",
    evidence: "established",
    why: "Heart catheterization is now a routine way to diagnose and treat heart disease.",
    how: "A thin, flexible tube is guided through a blood vessel to the heart, where doctors can measure pressures, take images, or open narrowed arteries.",
    science: "Today the procedure is done by trained teams with imaging and safety checks. Self-experimentation like Forssmann's is not acceptable practice.",
    history: "Forssmann shared the 1956 Nobel Prize in Physiology or Medicine with André Cournand and Dickinson Richards.",
    sources: [nobel("medicine", 1956)],
    articles: ["heart-health-blood-pressure-cholesterol"],
  },
  {
    id: "first-heart-transplant",
    category: "heart",
    headline: "The first human heart transplant took place in 1967",
    fact: "Surgeons in Cape Town, South Africa, carried out the first human-to-human heart transplant in December 1967.",
    evidence: "established",
    why: "It showed that replacing a failing heart was possible, and heart transplantation became a lasting treatment.",
    how: "A healthy donor heart replaces the failing one. Medicines that calm the immune system help prevent the body from rejecting it.",
    science: "Better rejection medicines in later decades made long-term survival after a transplant far more common.",
    history: "The operation was led by Christiaan Barnard at Groote Schuur Hospital.",
    sources: [{ title: "50th anniversary of the first human heart transplant", publisher: "University of Cape Town", url: "https://news.uct.ac.za/article/-2017-11-29-50th-anniversary-of-the-first-human-heart-transplant" }],
  },
  {
    id: "body-clock",
    category: "sleep",
    headline: "Almost every cell keeps time",
    fact: "Your body runs on an internal clock of about 24 hours, driven by genes whose activity rises and falls each day.",
    evidence: "established",
    why: "This clock shapes when you feel sleepy, hungry, and alert, which is why jet lag and night shifts can feel so hard.",
    how: "Clock genes make proteins that build up during the night and switch their own genes off, then break down and let the cycle start again.",
    science: "Daylight helps keep the clock on time. Research continues into how disrupting it affects long-term health.",
    history: "Jeffrey Hall, Michael Rosbash, and Michael Young received the 2017 Nobel Prize in Physiology or Medicine, based on work in fruit flies.",
    sources: [nobel("medicine", 2017)],
    articles: ["sleep-and-stress"],
  },
  {
    id: "rem-dreams",
    category: "sleep",
    headline: "Your most vivid dreams happen while your muscles are switched off",
    fact: "Most vivid dreaming happens in rapid eye movement (REM) sleep, when the eyes move quickly and most other muscles are temporarily relaxed.",
    evidence: "established",
    why: "This temporary relaxation stops us from acting out our dreams.",
    how: "Sleep moves through cycles of non-REM and REM sleep during the night. REM periods tend to get longer towards the morning.",
    science: "Scientists are still studying exactly why we dream and how REM sleep supports memory and mood.",
    sources: [sleepBasics],
    articles: ["sleep-and-stress"],
  },
  {
    id: "adult-sleep",
    category: "sleep",
    headline: "Adults need 7 or more hours of sleep",
    fact: "The U.S. Centers for Disease Control and Prevention says adults aged 18 to 60 need 7 or more hours of sleep a night.",
    evidence: "established",
    why: "Many people sleep less than this, and regular short sleep is linked with health problems.",
    how: "During sleep the body and brain do work that supports attention, mood, and the body's repair.",
    science: "Needs change across life. The CDC gives similar ranges for older adults, and children and teenagers need more sleep than adults.",
    sources: [cdcSleep],
    articles: ["sleep-and-stress"],
  },
  {
    id: "ulcer-bacteria",
    category: "nutrition",
    headline: "Most stomach ulcers are caused by a bacterium, not stress",
    fact: "The bacterium Helicobacter pylori causes most stomach and duodenal ulcers, and they can be cured with antibiotics.",
    evidence: "established",
    why: "For decades ulcers were blamed on stress and spicy food. This discovery changed treatment.",
    how: "H. pylori lives in the stomach lining and causes long-lasting inflammation that can lead to ulcers.",
    science: "Doctors test for the bacterium and treat it with a combination of medicines. Ongoing pain or black stools need a doctor's care.",
    history: "Barry Marshall and Robin Warren received the 2005 Nobel Prize in Physiology or Medicine. Marshall famously drank a culture of the bacteria to test the idea.",
    sources: [nobel("medicine", 2005)],
  },
  {
    id: "vitamin-discovery",
    category: "nutrition",
    headline: "Vitamins were discovered through a disease of polished rice",
    fact: "Research into beriberi, a disease linked to eating polished white rice, helped lead to the discovery of vitamins.",
    evidence: "established",
    why: "It showed that tiny amounts of substances in food are essential for health.",
    how: "Polishing rice removes the outer layer that contains thiamine (vitamin B1). Without enough thiamine, nerves and the heart can be damaged.",
    science: "Vitamin deficiencies are uncommon with a varied diet, but they still occur. Taking high doses of supplements is not automatically better.",
    history: "Christiaan Eijkman and Frederick Hopkins received the 1929 Nobel Prize in Physiology or Medicine for discoveries about vitamins.",
    sources: [nobel("medicine", 1929)],
    articles: ["healthy-eating-patterns"],
  },
  {
    id: "gut-microbes",
    category: "nutrition",
    headline: "Trillions of microbes live in your gut",
    fact: "Your intestines are home to a huge community of bacteria and other microbes, and the mix differs from person to person.",
    evidence: "established",
    why: "These microbes help digest food and interact with the immune system.",
    how: "Different microbes break down fibre and other foods we cannot digest ourselves, producing substances the body can use.",
    science: "That the microbiome exists and varies is established. Many claims about using it to treat diseases are still preliminary.",
    history: "The U.S. Human Microbiome Project mapped microbes in healthy people and published major results in 2012.",
    sources: [{ title: "Structure, function and diversity of the healthy human microbiome", publisher: PUBMED, url: "https://pubmed.ncbi.nlm.nih.gov/22699609/", date: "2012" }],
    articles: ["gut-microbiome"],
  },
  {
    id: "innate-sensors",
    category: "immune",
    headline: "Your immune system has early-warning sensors",
    fact: "Immune cells carry sensors that recognise common features of germs and raise the alarm within hours.",
    evidence: "established",
    why: "This first line of defence buys time while the slower, more targeted immune response gets ready.",
    how: "Receptors such as Toll-like receptors detect parts of bacteria and viruses, and switch on inflammation and other defences.",
    science: "This knowledge helps in designing vaccines and in understanding inflammatory diseases.",
    history: "Bruce Beutler and Jules Hoffmann shared the 2011 Nobel Prize in Physiology or Medicine for this, alongside Ralph Steinman, who discovered dendritic cells.",
    sources: [nobel("medicine", 2011)],
  },
  {
    id: "immune-peacekeepers",
    category: "immune",
    headline: "Your immune system has its own peacekeepers",
    fact: "Regulatory T cells help stop the immune system from attacking the body's own tissues.",
    evidence: "established",
    why: "When this control fails, autoimmune diseases can develop.",
    how: "These cells calm other immune cells and help the body tolerate its own tissues.",
    science: "Researchers are testing treatments based on these cells for autoimmune disease and transplants. Those uses are still experimental.",
    history: "Mary Brunkow, Fred Ramsdell, and Shimon Sakaguchi received the 2025 Nobel Prize in Physiology or Medicine for discoveries about this peripheral immune tolerance.",
    sources: [nobel("medicine", 2025)],
  },
  {
    id: "smallpox-eradicated",
    category: "immune",
    headline: "Vaccines wiped out a disease from the whole planet",
    fact: "Smallpox is the first human disease to be eradicated. The World Health Assembly declared it gone in 1980 after a global vaccination campaign.",
    evidence: "established",
    why: "It shows what vaccines and worldwide cooperation can achieve.",
    how: "Vaccinating people around each new case stopped the virus from finding new people to infect, until there were no cases left.",
    science: "Smallpox virus now exists only in a small number of secure laboratories.",
    sources: [{ title: "Smallpox", publisher: WHO, url: "https://www.who.int/health-topics/smallpox" }],
    articles: ["vaccines-sixty-years"],
  },
  {
    id: "insulin-discovery",
    category: "hormones",
    headline: "Insulin turned a fatal disease into a treatable one",
    fact: "Before insulin was discovered in the early 1920s, type 1 diabetes was usually fatal. Insulin treatment changed that.",
    evidence: "established",
    why: "It was one of the first times a hormone was isolated and used as a medicine.",
    how: "Insulin is a hormone from the pancreas that lets cells take up sugar from the blood. In type 1 diabetes the body does not make enough.",
    science: "Modern insulins and devices help people manage diabetes, always with their care team. Never change an insulin dose on your own.",
    history: "Frederick Banting and John Macleod received the 1923 Nobel Prize in Physiology or Medicine for the discovery of insulin.",
    sources: [nobel("medicine", 1923)],
    articles: ["what-happens-when-you-fast"],
  },
  {
    id: "adrenal-hormones",
    category: "hormones",
    headline: "Hormones from tiny glands above your kidneys affect your whole body",
    fact: "The adrenal glands make hormones such as cortisol that help control how the body responds to stress, inflammation, and energy needs.",
    evidence: "established",
    why: "Learning about these hormones led to cortisone-type medicines, which are widely used for inflammation.",
    how: "Cortisol levels change through the day and rise during stress, affecting blood sugar, blood pressure, and the immune system.",
    science: "Steroid medicines help many people but can have serious side effects, so they are used under medical supervision.",
    history: "Edward Kendall, Tadeus Reichstein, and Philip Hench received the 1950 Nobel Prize in Physiology or Medicine for discoveries about adrenal cortex hormones.",
    sources: [nobel("medicine", 1950)],
  },
  {
    id: "gut-hormone-medicines",
    category: "hormones",
    headline: "A gut hormone led to new medicines for diabetes and obesity",
    fact: "Research on GLP-1, a hormone released by the gut after eating, led to medicines for type 2 diabetes and obesity.",
    evidence: "established",
    why: "It shows how basic research on hormones can lead to treatments decades later.",
    how: "GLP-1 helps the body release insulin after meals and affects appetite. The medicines mimic its effects.",
    science: "These are prescription medicines with benefits and side effects that a doctor weighs for each person.",
    history: "Researchers behind GLP-1-based therapy received a 2024 Lasker Award.",
    sources: [{ title: "GLP-1-based therapy for obesity", publisher: "Lasker Foundation", url: "https://laskerfoundation.org/winners/glp-1-based-therapy-for-obesity/", date: "2024" }],
  },
  {
    id: "telomeres",
    category: "aging",
    headline: "Your chromosomes have protective caps",
    fact: "The ends of chromosomes are protected by caps called telomeres, and an enzyme called telomerase can rebuild them.",
    evidence: "established",
    why: "Telomeres help explain why cells cannot divide forever, and they are studied in ageing and cancer.",
    how: "Telomeres shorten a little each time many cells divide. When they become too short, the cell stops dividing.",
    science: "The biology is established. Products that claim to lengthen telomeres to reverse ageing are not supported by good evidence.",
    history: "Elizabeth Blackburn, Carol Greider, and Jack Szostak received the 2009 Nobel Prize in Physiology or Medicine for this discovery.",
    sources: [nobel("medicine", 2009)],
    articles: ["healthy-aging"],
  },
  {
    id: "decade-healthy-ageing",
    category: "aging",
    headline: "The world has named a Decade of Healthy Ageing",
    fact: "The United Nations declared 2021 to 2030 the Decade of Healthy Ageing, led by the World Health Organization.",
    evidence: "established",
    why: "Populations are getting older in most countries, so helping people stay healthy and independent matters more and more.",
    how: "The Decade focuses on age-friendly places, fighting ageism, care that fits older people, and long-term care.",
    science: "Healthy ageing is about keeping the abilities people value, not only about avoiding disease.",
    sources: [{ title: "UN Decade of Healthy Ageing", publisher: WHO, url: "https://www.who.int/initiatives/decade-of-healthy-ageing" }],
    articles: ["healthy-aging"],
  },
  {
    id: "dementia-risk-factors",
    category: "aging",
    headline: "Many dementia risk factors are things that can change",
    fact: "A major 2024 review identified risk factors for dementia that can be changed, such as physical inactivity, smoking, high blood pressure, and hearing loss.",
    evidence: "preliminary",
    why: "It suggests that looking after heart health, hearing, and activity may help protect the brain.",
    how: "These factors are linked to dementia in studies that follow people over many years.",
    science: "The links come mostly from observational studies, so they show association rather than proof that changing one factor prevents dementia in a given person.",
    sources: [{ title: "Dementia prevention, intervention, and care: 2024 report of the Lancet standing Commission", publisher: PUBMED, url: "https://pubmed.ncbi.nlm.nih.gov/39096926/", date: "2024" }],
    articles: ["brain-health-and-memory"],
  },
  {
    id: "artemisinin",
    category: "eastern",
    headline: "An ancient Chinese text helped lead to a modern malaria medicine",
    fact: "Tu Youyou found the malaria medicine artemisinin after studying traditional Chinese remedies, including a text more than 1,500 years old.",
    evidence: "established",
    why: "It is one of the clearest examples of a traditional remedy leading to a proven, modern medicine.",
    how: "The active compound was extracted from sweet wormwood (Artemisia annua), purified, and tested in careful studies.",
    science: "The proven medicine is the purified, tested drug. This does not mean that herbal teas or home preparations are an effective treatment for malaria.",
    history: "Tu Youyou shared the 2015 Nobel Prize in Physiology or Medicine.",
    sources: [nobel("medicine", 2015)],
    articles: ["eastern-and-western-medicine", "herbal-medicine-chinese-and-ayurvedic"],
  },
  {
    id: "acupuncture-pain",
    category: "eastern",
    headline: "Acupuncture has been studied in thousands of patients with chronic pain",
    fact: "A large analysis of trials found acupuncture did a little better than sham acupuncture for some chronic pain, though the difference was modest.",
    evidence: "preliminary",
    why: "It is one of the best-studied traditional practices, and the results are more mixed than many claims suggest.",
    how: "Traditional Chinese medicine describes acupuncture as balancing energy flow. Researchers study possible effects on nerves and the brain.",
    science: "Expectation and the care around treatment seem to play a large part. Acupuncture by a trained practitioner with sterile needles is generally low risk.",
    sources: [{ title: "Acupuncture for chronic pain: individual patient data meta-analysis", publisher: PUBMED, url: "https://pubmed.ncbi.nlm.nih.gov/22965186/", date: "2012" }],
    articles: ["acupuncture"],
  },
  {
    id: "tai-chi-balance",
    category: "eastern",
    headline: "Tai chi is being studied for balance and falls",
    fact: "Tai chi, a gentle Chinese movement practice, has been studied as a way to improve balance and reduce falls in older adults.",
    evidence: "preliminary",
    why: "Falls are a common cause of injury in older age, and tai chi is low cost and gentle.",
    how: "Slow, flowing movements with shifting weight train balance, leg strength, and body awareness.",
    science: "Research suggests benefits for balance, but study quality varies. Check with a clinician if you have health conditions or a high risk of falling.",
    history: "Tai chi developed in China as a martial art and is now practised worldwide for health.",
    sources: [{ title: "Tai Chi: What You Need To Know", publisher: NCCIH, url: "https://nccih.nih.gov/health/taichi" }],
    articles: ["meditation-and-mind-body"],
  },
  {
    id: "penicillin",
    category: "western",
    headline: "The first antibiotic was found on a contaminated plate",
    fact: "Alexander Fleming noticed in 1928 that a mould on a laboratory plate was killing the bacteria around it. That mould produced penicillin.",
    evidence: "established",
    why: "Antibiotics have since saved huge numbers of lives from infections that were once often deadly.",
    how: "Penicillin stops many bacteria from building their cell walls. Others made it into a usable medicine in the early 1940s.",
    science: "Bacteria can become resistant when antibiotics are overused, so they should be taken only when prescribed and as directed.",
    history: "Fleming, Ernst Chain, and Howard Florey received the 1945 Nobel Prize in Physiology or Medicine.",
    sources: [nobel("medicine", 1945)],
  },
  {
    id: "clinical-trial-phases",
    category: "western",
    headline: "New medicines are tested in phases",
    fact: "Before a new medicine is approved in the United States, it is studied in people in stages, and safety is still watched after approval.",
    evidence: "established",
    why: "Testing step by step lets researchers stop early if a medicine is unsafe or does not work.",
    how: "Phase 1 studies look at safety and dosage, usually in healthy volunteers. Phase 2 looks at whether it works and at side effects in people with the condition. Phase 3 checks the benefit in a larger group. Phase 4 follows safety after approval.",
    science: "This staged process is a core part of evidence-based medicine. Results from many trials are later weighed together in systematic reviews.",
    sources: [{ title: "Step 3: Clinical Research", publisher: "U.S. Food and Drug Administration", url: "https://www.fda.gov/patients/drug-development-process/step-3-clinical-research" }],
    articles: ["evidence-based-medicine"],
  },
  {
    id: "systematic-reviews",
    category: "western",
    headline: "Doctors weigh many studies together, not just one",
    fact: "A systematic review gathers all the good-quality studies on a question and weighs them together to see what the evidence shows.",
    evidence: "established",
    why: "One study can be wrong or misleading. Looking at all of them gives a more reliable answer.",
    how: "Reviewers search for every relevant study, judge their quality, and combine the results with clear methods.",
    science: "Organisations such as Cochrane publish systematic reviews that guidelines often rely on.",
    sources: [{ title: "What are systematic reviews?", publisher: "Cochrane", url: "https://cochrane.org/evidence/what-are-systematic-reviews" }],
    articles: ["evidence-based-medicine"],
  },
  {
    id: "first-vaccine",
    category: "history",
    headline: "The first vaccine came from cowpox",
    fact: "In 1796 Edward Jenner showed that material from cowpox could protect a person against smallpox. This was the start of vaccination.",
    evidence: "established",
    why: "The word 'vaccine' comes from the Latin word for cow, vacca.",
    how: "Cowpox is a related but milder virus, so exposure to it trained the immune system to recognise smallpox.",
    science: "Modern vaccines are tested in large clinical trials and monitored for safety.",
    sources: [{ title: "History of Smallpox", publisher: CDC, url: "https://www.cdc.gov/smallpox/about/history.html" }],
    articles: ["vaccines-sixty-years"],
  },
  {
    id: "blood-groups",
    category: "history",
    headline: "Safe blood transfusions began with the discovery of blood groups",
    fact: "Karl Landsteiner discovered the main human blood groups in 1901, which made safe blood transfusions possible.",
    evidence: "established",
    why: "Mixing blood from incompatible groups can cause a dangerous reaction. Matching groups prevents it.",
    how: "Red blood cells carry markers called antigens. The immune system can attack cells with markers it does not recognise.",
    science: "Today blood is carefully typed and screened before transfusion.",
    history: "Landsteiner received the 1930 Nobel Prize in Physiology or Medicine.",
    sources: [nobel("medicine", 1930)],
  },
  {
    id: "smoking-report",
    category: "history",
    headline: "A 1964 report changed how the world saw smoking",
    fact: "In 1964 the U.S. Surgeon General's report concluded that cigarette smoking causes lung cancer in men.",
    evidence: "established",
    why: "It was a turning point for public health warnings and tobacco control.",
    how: "An expert committee reviewed thousands of studies and reached a firm conclusion about cause.",
    science: "Later research has linked smoking to many more diseases. Quitting at any age brings health benefits.",
    sources: [{ title: "The Reports of the Surgeon General: The 1964 Report on Smoking and Health", publisher: "National Library of Medicine", url: "https://profiles.nlm.nih.gov/spotlight/nn/feature/smoking" }],
    articles: ["how-cancer-develops"],
  },
  {
    id: "st-johns-wort",
    category: "herbs",
    headline: "A popular herb can weaken many medicines",
    fact: "St. John's wort can interact with many medicines, including some antidepressants, birth control pills, and heart medicines, making some of them work less well.",
    evidence: "established",
    why: "Many people assume herbal products are harmless and do not mention them to their doctor.",
    how: "The herb speeds up the liver enzymes and transport proteins that clear many medicines from the body.",
    science: "Research on St. John's wort for depression is mixed. Never use it in place of prescribed treatment without talking to a doctor.",
    sources: [{ title: "St. John's Wort", publisher: NCCIH, url: "https://www.nccih.nih.gov/health/st-johns-wort" }, herbDrug],
    articles: ["herbal-medicine-chinese-and-ayurvedic"],
  },
  {
    id: "natural-not-always-safe",
    category: "herbs",
    headline: "'Natural' does not always mean safe",
    fact: "Some herbal and dietary supplements can interact with prescription medicines, and some products have been found to contain undeclared drugs or harmful contaminants.",
    evidence: "established",
    why: "Supplements are not tested and approved the way medicines are before they are sold.",
    how: "Plant compounds can affect how the body processes medicines, and quality varies between products.",
    science: "Tell your doctor and pharmacist about every herb and supplement you take.",
    sources: [herbDrug],
    articles: ["herbal-medicine-chinese-and-ayurvedic"],
  },
  {
    id: "probiotics-mixed",
    category: "herbs",
    headline: "Probiotics do not all work the same way",
    fact: "Probiotic products contain different strains of microbes, and research findings for one strain do not automatically apply to another.",
    evidence: "preliminary",
    why: "Labels often make broad promises that the research does not support.",
    how: "Each strain behaves differently in the gut, so studies have to test specific products for specific conditions.",
    science: "Some uses show promise, others do not. People who are seriously ill or have weakened immune systems should ask a doctor first.",
    sources: [{ title: "Probiotics: Usefulness and Safety", publisher: NCCIH, url: "https://www.nccih.nih.gov/health/probiotics-usefulness-and-safety" }],
    articles: ["gut-microbiome"],
  },
  {
    id: "mrna-vaccines",
    category: "discoveries",
    headline: "mRNA vaccines teach your cells to make a harmless piece of a virus",
    fact: "mRNA vaccines give cells temporary instructions to make one protein from a virus, so the immune system learns to recognise it.",
    evidence: "established",
    why: "This approach let COVID-19 vaccines be developed much faster than older methods allowed.",
    how: "The mRNA is read by the cell and then broken down. It does not change your DNA.",
    science: "mRNA is now being studied for other infections and for cancer. Those uses are still in research.",
    history: "Katalin Karikó and Drew Weissman received the 2023 Nobel Prize in Physiology or Medicine.",
    sources: [nobel("medicine", 2023)],
    articles: ["vaccines-sixty-years", "future-of-medicine"],
  },
  {
    id: "crispr",
    category: "discoveries",
    headline: "Scientists can now edit genes with molecular scissors",
    fact: "CRISPR-Cas9 lets scientists cut DNA at a chosen spot. In 2023 the U.S. FDA approved the first CRISPR-based treatment, for sickle cell disease.",
    evidence: "established",
    why: "Gene editing could treat some inherited diseases at their source.",
    how: "A guide molecule leads the Cas9 enzyme to a specific DNA sequence, where it makes a cut that the cell then repairs.",
    science: "Approved uses are still few and specialised. Most other gene-editing treatments are in clinical trials.",
    history: "Emmanuelle Charpentier and Jennifer Doudna received the 2020 Nobel Prize in Chemistry.",
    sources: [nobel("chemistry", 2020), { title: "FDA Approves First Gene Therapies to Treat Patients with Sickle Cell Disease", publisher: "U.S. Food and Drug Administration", url: "https://www.fda.gov/news-events/press-announcements/fda-approves-first-gene-therapies-treat-patients-sickle-cell-disease", date: "2023" }],
    articles: ["future-of-medicine"],
  },
  {
    id: "protein-structures-ai",
    category: "discoveries",
    headline: "AI can predict the shape of proteins",
    fact: "Artificial intelligence can now predict the 3D shape of proteins from their building blocks, a problem that took scientists decades.",
    evidence: "established",
    why: "A protein's shape decides what it does, so knowing it speeds up research on diseases and medicines.",
    how: "AI models learned patterns from many known protein structures and use them to predict new ones.",
    science: "Predictions are a starting point and still need checking in the laboratory.",
    history: "David Baker, Demis Hassabis, and John Jumper received the 2024 Nobel Prize in Chemistry.",
    sources: [nobel("chemistry", 2024)],
    articles: ["future-of-medicine"],
  },
  {
    id: "microrna",
    category: "discoveries",
    headline: "Tiny RNA molecules act as volume knobs for your genes",
    fact: "MicroRNAs are tiny RNA molecules that turn down the activity of specific genes.",
    evidence: "established",
    why: "They help explain how cells with the same DNA become different tissues, such as muscle or nerve.",
    how: "A microRNA binds to a gene's messenger RNA and reduces how much protein is made from it.",
    science: "Medicines based on microRNAs are being studied, but this is still early research.",
    history: "Victor Ambros and Gary Ruvkun received the 2024 Nobel Prize in Physiology or Medicine, starting from work in a tiny worm.",
    sources: [nobel("medicine", 2024)],
  },
  {
    id: "meditation-mood",
    category: "mind",
    headline: "Meditation programs may ease anxiety a little",
    fact: "A large review found that mindfulness meditation programs led to small to moderate improvements in anxiety, depression, and pain.",
    evidence: "preliminary",
    why: "Meditation is low cost and widely available, so even modest benefits can matter.",
    how: "Regular practice trains attention and the way people respond to thoughts and feelings.",
    science: "Meditation can support, but does not replace, treatment for anxiety or depression. A small number of people find it uncomfortable.",
    sources: [{ title: "Meditation programs for psychological stress and well-being: a systematic review and meta-analysis", publisher: PUBMED, url: "https://pubmed.ncbi.nlm.nih.gov/24395196/", date: "2014" }],
    articles: ["meditation-and-mind-body"],
  },
  {
    id: "loneliness-health",
    category: "mind",
    headline: "Feeling connected to others is good for your health",
    fact: "A 2023 U.S. Surgeon General's advisory described loneliness and social isolation as risks to health, linked with heart disease, stroke, dementia, depression, and anxiety.",
    evidence: "preliminary",
    why: "Social connection is something many people can build on, at any age.",
    how: "Connection may affect health through stress, sleep, and habits, and through having support when it is needed.",
    science: "Most evidence comes from observational studies, which show links rather than proof of cause.",
    sources: [{ title: "Our Epidemic of Loneliness and Isolation: The U.S. Surgeon General's Advisory", publisher: "U.S. Department of Health and Human Services", url: "https://www.hhs.gov/sites/default/files/surgeon-general-social-connection-advisory.pdf", date: "2023" }],
  },
  {
    id: "stress-response",
    category: "mind",
    headline: "Some stress can help you rise to a challenge",
    fact: "Short-term stress can sharpen focus and energy, but long-lasting stress can harm health.",
    evidence: "established",
    why: "Knowing the difference helps people notice when stress has gone on too long.",
    how: "Stress hormones prepare the body for action. When they stay high for a long time, they can affect sleep, mood, and the immune system.",
    science: "If stress feels overwhelming or does not ease, a health professional can help.",
    sources: [{ title: "I'm So Stressed Out! Fact Sheet", publisher: "National Institute of Mental Health (NIH)", url: "https://www.nimh.nih.gov/health/publications/so-stressed-out-fact-sheet" }],
    articles: ["sleep-and-stress"],
  },
  {
    id: "some-activity-better",
    category: "exercise",
    headline: "Any movement counts",
    fact: "The CDC says some physical activity is better than none, and adults who sit less and do any amount of moderate or vigorous activity gain some health benefits.",
    evidence: "established",
    why: "Many people feel they must do long workouts to benefit. Short bouts of activity count too.",
    how: "Activity strengthens the heart, muscles, and bones, and helps with mood and sleep.",
    science: "Start slowly and build up. People with health conditions should ask a clinician what is safe for them.",
    sources: [activityGuidelines],
    articles: ["healthy-aging"],
  },
  {
    id: "weekly-activity",
    category: "exercise",
    headline: "The weekly activity guideline for adults",
    fact: "The CDC says adults need at least 150 minutes of moderate-intensity activity a week, such as brisk walking, plus muscle-strengthening activity on 2 days a week.",
    evidence: "established",
    why: "This target is based on a large body of research on health benefits.",
    how: "The minutes can be spread through the week. The CDC gives the example of 30 minutes a day, 5 days a week.",
    science: "Older adults are also advised to include balance training. Needs depend on health and ability.",
    sources: [activityGuidelines],
    articles: ["healthy-aging"],
  },
  {
    id: "muscle-and-aging",
    category: "exercise",
    headline: "Strong muscles help you stay independent",
    fact: "The CDC advises muscle-strengthening activity for adults, and says people aged 65 or older need balance activities each week too.",
    evidence: "established",
    why: "Strength and balance help with everyday tasks like climbing stairs and carrying shopping, and help prevent falls.",
    how: "Working muscles against resistance, such as body weight, bands, or weights, makes them stronger over time.",
    science: "It is never too late to start, but begin gently and get advice if you have health concerns.",
    sources: [activityGuidelines, olderActivity],
    articles: ["healthy-aging"],
  },
];

export function factCategory(slug: string) {
  return FACT_CATEGORIES.find((category) => category.slug === slug);
}

export function findFact(id: string): HealthFact | undefined {
  return FACTS.find((fact) => fact.id === id);
}

const DAY_MS = 86_400_000;
/** The first Fact of the Day. */
export const FACT_START = "2026-11-23";

function dayNumber(isoDate: string): number {
  return Math.floor(Date.parse(`${isoDate}T00:00:00Z`) / DAY_MS);
}

/** A fixed shuffle so neighbouring days show different categories. */
function order(count: number): number[] {
  const items = Array.from({ length: count }, (_, index) => index);
  let seed = 20261123;
  for (let i = items.length - 1; i > 0; i -= 1) {
    seed = (seed * 1103515245 + 12345) % 2147483648;
    const j = seed % (i + 1);
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}

/**
 * The Fact of the Day for a date (YYYY-MM-DD). Every fact is shown once before
 * any repeats, then the cycle starts again.
 */
export function factOfTheDay(isoDate: string, facts: readonly HealthFact[] = FACTS): HealthFact {
  const index = Math.max(0, dayNumber(isoDate) - dayNumber(FACT_START));
  const sequence = order(facts.length);
  return facts[sequence[index % facts.length]];
}

/** Earlier Facts of the Day, most recent first, never before FACT_START. */
export function factArchive(isoDate: string, days = 30, facts: readonly HealthFact[] = FACTS): { date: string; fact: HealthFact }[] {
  const today = dayNumber(isoDate);
  const first = dayNumber(FACT_START);
  const items: { date: string; fact: HealthFact }[] = [];
  for (let day = today - 1; day >= Math.max(first, today - days); day -= 1) {
    const date = new Date(day * DAY_MS).toISOString().slice(0, 10);
    items.push({ date, fact: factOfTheDay(date, facts) });
  }
  return items;
}

function normalize(text: string): string {
  return text.toLocaleLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "");
}

export function searchFacts(query: string, category: string | null, facts: readonly HealthFact[] = FACTS): HealthFact[] {
  const words = normalize(query).split(/\s+/).filter((word) => word.length > 1);
  return facts.filter((fact) => {
    if (category && fact.category !== category) return false;
    if (words.length === 0) return true;
    const text = normalize(`${fact.headline} ${fact.fact} ${fact.why} ${fact.how} ${fact.science} ${fact.history ?? ""}`);
    return words.every((word) => text.includes(word));
  });
}

export function relatedFacts(fact: HealthFact, limit = 3, facts: readonly HealthFact[] = FACTS): HealthFact[] {
  return facts.filter((other) => other.id !== fact.id && other.category === fact.category).slice(0, limit);
}
