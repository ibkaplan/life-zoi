import { FACTS, findFact, type FactCategory, type HealthFact } from "@/lib/encyclopedia/facts";
import { msg } from "@/lib/i18n/translate";

/**
 * Health Facts Quiz. Every question is built on one "Did You Know?" fact and says only
 * what that fact and its source say. The explanation restates the fact; nothing new is
 * added. The right answer is always the first choice here and is shuffled on screen.
 * Questions are translated through the catalog (`fact-quiz.json`), unlike the facts.
 */
export type FactQuestion = {
  /** The id of the fact the question is built on. */
  fact: string;
  question: string;
  /** The right answer first, then two wrong ones. */
  choices: readonly [string, string, string];
  explanation: string;
};

export const FACT_QUESTIONS: readonly FactQuestion[] = [
  {
    fact: "temperature-touch-sensors",
    question: msg("What turns heat and touch into signals your brain can read?"),
    choices: [msg("Receptor molecules on nerve endings"), msg("Red blood cells"), msg("Sweat glands")],
    explanation: msg("Nerve endings carry special receptor molecules that turn temperature and touch into electrical signals. This discovery earned the 2021 Nobel Prize in Physiology or Medicine."),
  },
  {
    fact: "cells-recycle",
    question: msg("What is autophagy?"),
    choices: [msg("Cells breaking down and reusing their own worn-out parts"), msg("Cells copying their DNA"), msg("The stomach digesting fat")],
    explanation: msg("Autophagy, meaning 'self-eating', is how cells break down and reuse old or damaged parts. Yoshinori Ohsumi received the 2016 Nobel Prize for showing how it works."),
  },
  {
    fact: "brain-gps",
    question: msg("Which brain cells fire when you are in a particular place?"),
    choices: [msg("Place cells"), msg("Taste cells"), msg("Fat cells")],
    explanation: msg("Place cells in the hippocampus fire at specific locations, and grid cells work like coordinates. Together they build an inner map. This discovery earned the 2014 Nobel Prize."),
  },
  {
    fact: "smell-genes",
    question: msg("How does your brain recognise a smell?"),
    choices: [msg("From the pattern of odour receptors it switches on"), msg("From one receptor that detects every smell"), msg("From the temperature of the air")],
    explanation: msg("Your nose has many different odour receptors, and the brain reads the pattern they make. Richard Axel and Linda Buck received the 2004 Nobel Prize for this discovery."),
  },
  {
    fact: "nitric-oxide",
    question: msg("Which gas made by the body helps blood vessels relax and widen?"),
    choices: [msg("Nitric oxide"), msg("Helium"), msg("Neon")],
    explanation: msg("The body makes nitric oxide, a gas that signals blood vessel walls to relax and widen. The discovery was recognised with the 1998 Nobel Prize."),
  },
  {
    fact: "first-heart-transplant",
    question: msg("Where did the first human heart transplant take place?"),
    choices: [msg("Cape Town, South Africa"), msg("London, England"), msg("Tokyo, Japan")],
    explanation: msg("Surgeons led by Christiaan Barnard carried out the first human-to-human heart transplant at Groote Schuur Hospital in Cape Town in December 1967."),
  },
  {
    fact: "rem-dreams",
    question: msg("In which kind of sleep does most vivid dreaming happen?"),
    choices: [msg("REM (rapid eye movement) sleep"), msg("Only in daytime naps"), msg("Only while falling asleep")],
    explanation: msg("Most vivid dreaming happens in REM sleep, when the eyes move quickly and most other muscles are temporarily relaxed."),
  },
  {
    fact: "adult-sleep",
    question: msg("How much sleep does the CDC say adults aged 18 to 60 need each night?"),
    choices: [msg("7 or more hours"), msg("4 to 5 hours"), msg("Exactly 10 hours")],
    explanation: msg("The U.S. Centers for Disease Control and Prevention says adults aged 18 to 60 need 7 or more hours of sleep a night."),
  },
  {
    fact: "ulcer-bacteria",
    question: msg("What causes most stomach ulcers?"),
    choices: [msg("A bacterium called Helicobacter pylori"), msg("Stress alone"), msg("Spicy food alone")],
    explanation: msg("Helicobacter pylori causes most stomach and duodenal ulcers, and they can be cured with antibiotics. Barry Marshall and Robin Warren received the 2005 Nobel Prize."),
  },
  {
    fact: "vitamin-discovery",
    question: msg("Research into which disease helped lead to the discovery of vitamins?"),
    choices: [msg("Beriberi"), msg("Measles"), msg("Influenza")],
    explanation: msg("Beriberi is a disease linked to eating polished white rice. Research into it helped lead to the discovery of vitamins, recognised with the 1929 Nobel Prize."),
  },
  {
    fact: "immune-peacekeepers",
    question: msg("What do regulatory T cells do?"),
    choices: [msg("Help stop the immune system attacking the body's own tissues"), msg("Carry oxygen in the blood"), msg("Digest food in the gut")],
    explanation: msg("Regulatory T cells are the immune system's peacekeepers. Discoveries about them were recognised with the 2025 Nobel Prize in Physiology or Medicine."),
  },
  {
    fact: "smallpox-eradicated",
    question: msg("Which was the first human disease to be eradicated?"),
    choices: [msg("Smallpox"), msg("Malaria"), msg("The common cold")],
    explanation: msg("The World Health Assembly declared smallpox eradicated in 1980, after a global vaccination campaign."),
  },
  {
    fact: "insulin-discovery",
    question: msg("When was insulin discovered?"),
    choices: [msg("In the early 1920s"), msg("In the 1700s"), msg("In the 1990s")],
    explanation: msg("Before insulin was discovered in the early 1920s, type 1 diabetes was usually fatal. Frederick Banting and John Macleod received the 1923 Nobel Prize."),
  },
  {
    fact: "adrenal-hormones",
    question: msg("Where are the adrenal glands, which make cortisol?"),
    choices: [msg("Above the kidneys"), msg("Inside the ear"), msg("Behind the knees")],
    explanation: msg("The adrenal glands sit above the kidneys. They make hormones such as cortisol that help control how the body responds to stress, inflammation, and energy needs."),
  },
  {
    fact: "telomeres",
    question: msg("What are telomeres?"),
    choices: [msg("Protective caps on the ends of chromosomes"), msg("Tiny bones in the ear"), msg("A kind of vitamin")],
    explanation: msg("Telomeres protect the ends of chromosomes, and an enzyme called telomerase can rebuild them. This discovery earned the 2009 Nobel Prize."),
  },
  {
    fact: "decade-healthy-ageing",
    question: msg("Which years did the United Nations name the Decade of Healthy Ageing?"),
    choices: [msg("2021 to 2030"), msg("1990 to 1999"), msg("2050 to 2059")],
    explanation: msg("The United Nations declared 2021 to 2030 the Decade of Healthy Ageing, led by the World Health Organization."),
  },
  {
    fact: "artemisinin",
    question: msg("What did Tu Youyou study on the way to finding the malaria medicine artemisinin?"),
    choices: [msg("Traditional Chinese remedies, including a very old text"), msg("Mould on a laboratory plate"), msg("Material from cowpox")],
    explanation: msg("Tu Youyou studied traditional Chinese remedies, including a text more than 1,500 years old, and found artemisinin. She shared the 2015 Nobel Prize."),
  },
  {
    fact: "tai-chi-balance",
    question: msg("Tai chi is being studied as a way to help older adults with what?"),
    choices: [msg("Balance and fewer falls"), msg("Eyesight"), msg("Hair growth")],
    explanation: msg("Tai chi, a gentle Chinese movement practice, has been studied as a way to improve balance and reduce falls in older adults. The research is still preliminary."),
  },
  {
    fact: "penicillin",
    question: msg("How was penicillin found?"),
    choices: [msg("A mould on a laboratory plate was killing the bacteria around it"), msg("It was found in seawater"), msg("It was made from cowpox")],
    explanation: msg("In 1928 Alexander Fleming noticed that a mould on a laboratory plate was killing the bacteria around it. That mould produced penicillin."),
  },
  {
    fact: "systematic-reviews",
    question: msg("What does a systematic review do?"),
    choices: [msg("Gathers the good-quality studies on a question and weighs them together"), msg("Relies on one single study"), msg("Collects opinions from social media")],
    explanation: msg("A systematic review gathers all the good-quality studies on a question and weighs them together to see what the evidence shows."),
  },
  {
    fact: "first-vaccine",
    question: msg("In 1796 Edward Jenner's first vaccine used material from which disease?"),
    choices: [msg("Cowpox"), msg("Rabies"), msg("Polio")],
    explanation: msg("Edward Jenner showed that material from cowpox could protect a person against smallpox. This was the start of vaccination."),
  },
  {
    fact: "blood-groups",
    question: msg("Which discovery made safe blood transfusions possible?"),
    choices: [msg("The main human blood groups"), msg("The X-ray"), msg("Insulin")],
    explanation: msg("Karl Landsteiner discovered the main human blood groups in 1901, which made safe blood transfusions possible. He received the 1930 Nobel Prize."),
  },
  {
    fact: "st-johns-wort",
    question: msg("What can the herb St. John's wort do to some medicines?"),
    choices: [msg("Make them work less well"), msg("Turn them into vitamins"), msg("Nothing, because herbs never interact with medicines")],
    explanation: msg("St. John's wort can interact with many medicines, including some antidepressants, birth control pills, and heart medicines, making some of them work less well."),
  },
  {
    fact: "probiotics-mixed",
    question: msg("Do research findings for one probiotic strain apply to every probiotic?"),
    choices: [msg("No, findings for one strain do not automatically apply to another"), msg("Yes, all probiotics are the same"), msg("Yes, as long as it is a yogurt")],
    explanation: msg("Probiotic products contain different strains of microbes, and research findings for one strain do not automatically apply to another."),
  },
  {
    fact: "mrna-vaccines",
    question: msg("What do mRNA vaccines give your cells?"),
    choices: [msg("Temporary instructions to make one protein from a virus"), msg("A full-strength live virus"), msg("An antibiotic")],
    explanation: msg("mRNA vaccines give cells temporary instructions to make one protein from a virus, so the immune system learns to recognise it. Katalin Karikó and Drew Weissman received the 2023 Nobel Prize."),
  },
  {
    fact: "crispr",
    question: msg("The first CRISPR-based treatment, approved by the U.S. FDA in 2023, is for which disease?"),
    choices: [msg("Sickle cell disease"), msg("Asthma"), msg("Migraine")],
    explanation: msg("CRISPR-Cas9 lets scientists cut DNA at a chosen spot. In 2023 the U.S. FDA approved the first CRISPR-based treatment, for sickle cell disease."),
  },
  {
    fact: "loneliness-health",
    question: msg("What did a 2023 U.S. Surgeon General's advisory describe as a risk to health?"),
    choices: [msg("Loneliness and social isolation"), msg("Reading books"), msg("Drinking water")],
    explanation: msg("The 2023 advisory described loneliness and social isolation as risks to health, linked with heart disease, stroke, dementia, depression, and anxiety."),
  },
  {
    fact: "stress-response",
    question: msg("Which statement about stress is true?"),
    choices: [msg("Short-term stress can sharpen focus, but long-lasting stress can harm health"), msg("All stress is always harmful"), msg("Long-lasting stress is good for health")],
    explanation: msg("Short-term stress can sharpen focus and energy, but long-lasting stress can harm health."),
  },
  {
    fact: "weekly-activity",
    question: msg("How much moderate-intensity activity does the CDC say adults need each week?"),
    choices: [msg("At least 150 minutes"), msg("At least 15 minutes"), msg("At least 1,500 minutes")],
    explanation: msg("The CDC says adults need at least 150 minutes of moderate-intensity activity a week, such as brisk walking, plus muscle-strengthening activity on 2 days a week."),
  },
  {
    fact: "muscle-and-aging",
    question: msg("Besides muscle strengthening, what does the CDC say people aged 65 or older need each week?"),
    choices: [msg("Balance activities"), msg("No activity at all"), msg("Only long naps")],
    explanation: msg("The CDC advises muscle-strengthening activity for adults, and says people aged 65 or older need balance activities each week too."),
  },
];

/** How many questions one round asks. */
export const ROUND_SIZE = 10;

export function questionFor(factId: string): FactQuestion | undefined {
  return FACT_QUESTIONS.find((question) => question.fact === factId);
}

export function questionFact(question: FactQuestion): HealthFact {
  const fact = findFact(question.fact);
  if (!fact) throw new Error(`Quiz question for unknown fact ${question.fact}`);
  return fact;
}

/** Fact categories that have at least one question, in the facts' own order. */
export function quizCategories(): FactCategory[] {
  const used = new Set(FACT_QUESTIONS.map((question) => questionFact(question).category));
  return [...new Set(FACTS.map((fact) => fact.category))].filter((category) => used.has(category));
}

function shuffle<T>(items: readonly T[], random: () => number): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export type RoundQuestion = FactQuestion & {
  /** The three choices in the order shown. */
  order: readonly number[];
};

/**
 * A round of up to ROUND_SIZE questions. With a category, only that category's
 * questions are asked. With a fact id, that fact's question comes first.
 */
export function buildRound(options: { category?: string | null; firstFact?: string | null; random?: () => number } = {}): RoundQuestion[] {
  const random = options.random ?? Math.random;
  const pool = FACT_QUESTIONS.filter((question) => !options.category || questionFact(question).category === options.category);
  const first = options.firstFact ? pool.find((question) => question.fact === options.firstFact) : undefined;
  const rest = shuffle(
    pool.filter((question) => question !== first),
    random,
  );
  const picked = (first ? [first, ...rest] : rest).slice(0, ROUND_SIZE);
  return picked.map((question) => ({ ...question, order: shuffle([0, 1, 2], random) }));
}

/** A short line for the final score. */
export function scoreMessage(score: number, total: number): string {
  if (total === 0) return msg("No questions in this round.");
  const share = score / total;
  if (share === 1) return msg("A perfect round. Well done!");
  if (share >= 0.7) return msg("Great result. You know your health facts.");
  if (share >= 0.4) return msg("Good effort. Every answer comes with the fact behind it, so each round teaches something new.");
  return msg("A good start. Read the facts behind the answers and try another round.");
}
