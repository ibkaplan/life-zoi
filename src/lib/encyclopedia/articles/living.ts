import type { Article } from "@/lib/encyclopedia/types";
import { FDA, SEED_AUTHOR, SEED_DATE, WHO, nobel } from "./shared";

const base = { publishedOn: SEED_DATE, updatedOn: SEED_DATE, draftedBy: SEED_AUTHOR };

export const livingArticles: Article[] = [
  {
    ...base,
    slug: "healthy-aging",
    category: "longevity",
    featured: true,
    title: "Healthy Aging: What Research Supports",
    summary:
      "Healthy aging is about keeping the ability to do what matters to you, not just adding years. This article explains what research supports for staying strong, independent, and connected, and why no product has been shown to stop aging.",
    easySummary:
      "Healthy aging means staying able to do what you enjoy. Being active, building strength, eating well, and staying connected help. No pill stops aging.",
    keywords: ["longevity", "healthy aging", "aging", "strength training", "physical activity", "falls", "social connection", "anti-aging", "lifespan"],
    terms: ["healthspan", "sarcopenia"],
    image: { illustration: "tree", alt: "Drawing of a broad, healthy tree with deep roots and new leaves." },
    sections: [
      {
        heading: "What is it?",
        standard: [
          "The World Health Organization defines healthy ageing as developing and maintaining the functional ability that enables wellbeing in older age. The United Nations named 2021 to 2030 the Decade of Healthy Ageing. The idea shifts the focus from the number of years to the quality of those years, sometimes called healthspan.",
        ],
        easy: ["Healthy aging means staying able to live the way you want as you get older."],
      },
      {
        heading: "What does science tell us?",
        standard: [
          "The U.S. Physical Activity Guidelines for Americans recommend that adults get at least 150 minutes a week of moderate activity, such as brisk walking, plus muscle-strengthening activity on two or more days, and that older adults add balance training. They also stress that some activity is better than none. Muscle and strength decline with age, a process called sarcopenia, and strength training can slow or partly reverse it at any age.",
          "Not smoking, eating a healthy diet, sleeping well, keeping up with vaccinations and screening, protecting hearing and vision, and staying socially connected are consistently linked with better health in later life.",
        ],
        easy: [
          "Aim for about 150 minutes of activity a week, like brisk walking. Add strength exercises twice a week and balance practice.",
          "Some movement is better than none.",
          "Not smoking, good food, sleep, and friends all help.",
        ],
      },
      {
        heading: "Risks, limitations, and unanswered questions",
        standard: [
          "Many anti-aging supplements and treatments are marketed on the basis of animal studies. None has been shown in people to slow aging itself. Research on drugs that target aging biology is active but not established. People with health conditions should ask a clinician how to start or increase exercise safely.",
        ],
        easy: ["No supplement is proven to slow aging in people. Ask your doctor how to start exercise safely if you have a health condition."],
      },
    ],
    evidence: [
      { claim: "Regular physical activity, including strength training, supports health and function as people age.", level: "strong", basis: "guidance" },
      { claim: "Anti-aging supplements slow human aging.", level: "not-established", basis: "animal-lab" },
    ],
    takeaways: [
      "Healthy aging is about function and quality of life.",
      "Activity, strength, balance, good food, sleep, and connection are well supported.",
      "Be skeptical of products that promise to stop aging.",
    ],
    references: [
      { title: "WHO's work on the UN Decade of Healthy Ageing (2021–2030)", publisher: WHO, url: "https://www.who.int/initiatives/decade-of-healthy-ageing" },
      { title: "Physical Activity Guidelines for Americans, 2nd edition", publisher: "U.S. Office of Disease Prevention and Health Promotion", url: "https://odphp.health.gov/our-work/nutrition-physical-activity/physical-activity-guidelines/current-guidelines", date: "2018" },
    ],
  },
  {
    ...base,
    slug: "sleep-and-stress",
    category: "sleep-stress",
    safety: ["mental-health"],
    title: "Sleep and Stress: Why Rest Matters",
    summary:
      "Sleep is when the body and brain recover, and long-term stress can disturb both. This article explains how much sleep adults need, what short sleep does, how stress affects the body, and practical steps with good support.",
    easySummary:
      "Most adults need 7 or more hours of sleep. Not enough sleep and long-lasting stress can affect your body and mood. Regular routines and calming habits help.",
    keywords: ["sleep", "insomnia", "stress", "anxiety", "rest", "sleep hygiene", "cortisol", "relaxation", "sleep apnea", "CBT-I"],
    terms: ["circadian-rhythm", "sleep-apnea", "cbt-i"],
    image: { illustration: "moon", alt: "Drawing of a crescent moon and stars over a softly sleeping figure." },
    sections: [
      {
        heading: "What does science tell us?",
        standard: [
          "The U.S. Centers for Disease Control and Prevention notes that adults need seven or more hours of sleep per night. The National Heart, Lung, and Blood Institute explains that ongoing sleep deficiency is linked with a higher risk of conditions including heart disease, high blood pressure, diabetes, obesity, and depression, and that it affects attention, mood, and safety, for example when driving.",
          "Stress is the body's response to a challenge. Short-term stress can be useful. The National Institute of Mental Health explains that long-lasting stress can affect sleep, digestion, and the immune system, and may contribute to health problems over time. Regular physical activity, relaxation practices, staying connected, and setting realistic goals can help.",
        ],
        easy: [
          "Adults need 7 hours of sleep or more.",
          "Not sleeping enough for a long time is linked with heart problems, diabetes, and low mood.",
          "Long-lasting stress can upset sleep and digestion. Moving, relaxing, and talking with people can help.",
        ],
      },
      {
        heading: "Practical information for everyday life",
        standard: [
          "Keep a regular wake-up time, get daylight in the morning, keep the bedroom dark and cool, and limit caffeine late in the day and alcohol in the evening. For long-lasting insomnia, cognitive behavioral therapy for insomnia, known as CBT-I, is a well-supported first treatment. Loud snoring with pauses in breathing or heavy daytime sleepiness can be signs of sleep apnea and should be checked by a clinician.",
        ],
        easy: [
          "Wake up at the same time each day. Get morning light. Keep the bedroom dark and cool.",
          "Loud snoring with breathing pauses should be checked by a doctor.",
        ],
      },
      {
        heading: "Risks, limitations, and unanswered questions",
        standard: [
          "Sleep medicines and supplements can have side effects, including next-day drowsiness and falls in older adults, and should be discussed with a clinician. Seek help if stress, worry, or low mood is affecting daily life.",
        ],
        easy: ["Ask a doctor before using sleep pills. Get help if stress or sadness is hard to manage."],
      },
    ],
    evidence: [
      { claim: "Adults need seven or more hours of sleep a night.", level: "strong", basis: "guidance" },
      { claim: "Ongoing short sleep is linked with heart disease, diabetes, and depression.", level: "strong", basis: "observational" },
      { claim: "CBT-I helps long-lasting insomnia.", level: "strong", basis: "randomized-trials" },
    ],
    takeaways: [
      "Most adults need at least seven hours of sleep.",
      "Regular routines and daylight support sleep; CBT-I helps insomnia.",
      "Ongoing stress affects the body; get support if it is hard to manage.",
    ],
    references: [
      { title: "About Sleep", publisher: "Centers for Disease Control and Prevention", url: "https://www.cdc.gov/sleep/about/index.html" },
      { title: "Sleep Deprivation and Deficiency", publisher: "National Heart, Lung, and Blood Institute (NIH)", url: "https://www.nhlbi.nih.gov/health/sleep-deprivation" },
      { title: "I'm So Stressed Out! Fact Sheet", publisher: "National Institute of Mental Health (NIH)", url: "https://www.nimh.nih.gov/health/publications/so-stressed-out-fact-sheet" },
    ],
  },
  {
    ...base,
    slug: "vaccines-sixty-years",
    category: "medical-discoveries",
    featured: true,
    title: "Sixty Years of Vaccines: From Measles to mRNA",
    summary:
      "Few medical tools have changed lives as much as vaccines. Since 1960 they have helped eradicate smallpox, brought measles and other diseases under control in many countries, prevented cancers caused by viruses, and in 2020 introduced a new technology: mRNA.",
    easySummary:
      "Vaccines teach your immune system to fight germs. They ended smallpox, made measles rare in many places, can prevent some cancers, and in 2020 a new kind (mRNA) arrived.",
    keywords: ["vaccines", "immunization", "measles", "smallpox", "HPV vaccine", "hepatitis B", "mRNA", "COVID-19", "malaria vaccine", "immune system"],
    terms: ["vaccine", "mrna", "immune-system"],
    image: { illustration: "immune", alt: "Drawing of antibodies, shaped like small Ys, surrounding a virus particle." },
    sections: [
      {
        heading: "What is it?",
        standard: [
          "A vaccine trains the immune system to recognize a germ, or part of one, without causing the disease, so the body can respond quickly if it meets the real germ later.",
        ],
        easy: ["A vaccine shows your body what a germ looks like, so it is ready to fight it."],
      },
      {
        heading: "Important research and discoveries",
        standard: [
          "The first measles vaccine was licensed in the United States in 1963, building on work by John Enders and colleagues. Through a global vaccination campaign led by the World Health Organization, smallpox was declared eradicated in 1980, the only human disease eradicated so far. A hepatitis B vaccine made with recombinant DNA was approved in the United States in 1986, and because hepatitis B can cause liver cancer, it became one of the first vaccines that helps prevent a cancer. HPV vaccines followed in 2006, after Harald zur Hausen showed that HPV causes cervical cancer.",
          "In October 2021 WHO recommended the first malaria vaccine, RTS,S, for children in areas with moderate to high transmission. In December 2020, mRNA vaccines against COVID-19 were authorized for emergency use in the United States and elsewhere. Katalin Karikó and Drew Weissman, whose work on modified mRNA made these vaccines possible, received the 2023 Nobel Prize.",
        ],
        easy: [
          "1963: measles vaccine. 1980: smallpox was declared gone from the world.",
          "1986 and 2006: vaccines that help prevent liver cancer and cervical cancer.",
          "2020: mRNA vaccines against COVID-19. 2021: the first malaria vaccine was recommended.",
        ],
      },
      {
        heading: "Risks, limitations, and unanswered questions",
        standard: [
          "Like all medicines, vaccines can have side effects, which are usually mild, such as a sore arm or fever. Serious reactions are rare, and vaccines are monitored after approval. Ask a clinician which vaccines are recommended for your age, health, and travel.",
        ],
        easy: ["Side effects are usually mild, like a sore arm. Ask your doctor which vaccines you need."],
      },
    ],
    evidence: [
      { claim: "Vaccination eradicated smallpox.", level: "strong", basis: "history" },
      { claim: "HPV and hepatitis B vaccines lower the risk of cancers those viruses cause.", level: "strong", basis: "guidance" },
    ],
    takeaways: [
      "Vaccines are among the most important medical advances of the last 60 years.",
      "Some vaccines help prevent cancers caused by viruses.",
      "mRNA technology, recognized with a 2023 Nobel Prize, is now being studied for other diseases.",
    ],
    references: [
      { title: "History of Measles", publisher: "Centers for Disease Control and Prevention", url: "https://www.cdc.gov/measles/about/history.html" },
      { title: "Smallpox", publisher: WHO, url: "https://www.who.int/health-topics/smallpox" },
      { title: "WHO recommends groundbreaking malaria vaccine for children at risk", publisher: WHO, url: "https://www.who.int/news/item/06-10-2021-who-recommends-groundbreaking-malaria-vaccine-for-children-at-risk", date: "2021-10-06" },
      { title: "FDA takes key action in fight against COVID-19 by issuing emergency use authorization for first COVID-19 vaccine", publisher: FDA, url: "https://www.fda.gov/news-events/press-announcements/fda-takes-key-action-fight-against-covid-19-issuing-emergency-use-authorization-first-covid-19", date: "2020-12-11" },
      nobel("medicine", 2008),
      nobel("medicine", 2023),
    ],
  },
  {
    ...base,
    slug: "future-of-medicine",
    category: "future-medicine",
    featured: true,
    title: "The Future of Medicine: Gene Editing, mRNA, and Artificial Intelligence",
    summary:
      "Gene editing is now an approved treatment for one inherited blood disease, artificial intelligence is helping read medical images and predict protein shapes, and mRNA is being tested beyond vaccines. This article separates what is approved today from what is still research.",
    easySummary:
      "New tools like gene editing and artificial intelligence are starting to be used in medicine. A few are approved. Most are still being tested.",
    keywords: ["future of medicine", "CRISPR", "gene editing", "gene therapy", "sickle cell", "artificial intelligence", "AI", "AlphaFold", "mRNA", "personalized medicine", "precision medicine"],
    terms: ["crispr", "gene-therapy", "mrna", "precision-medicine"],
    image: { illustration: "dna", alt: "Drawing of a DNA double helix with one small section highlighted as if being edited." },
    sections: [
      {
        heading: "What is it?",
        standard: [
          "Gene editing changes DNA at a chosen place. The CRISPR-Cas9 method, described by Emmanuelle Charpentier and Jennifer Doudna in 2012, made this far easier; they received the 2020 Nobel Prize in Chemistry. Gene therapy more broadly adds, replaces, or changes genetic material to treat disease. Artificial intelligence in medicine means software that learns patterns from data, for example to flag signs of disease on scans.",
        ],
        easy: ["Gene editing changes a tiny part of DNA. AI is computer software that learns from examples."],
      },
      {
        heading: "What is approved today",
        standard: [
          "In December 2023 the U.S. Food and Drug Administration approved the first CRISPR-based therapy, Casgevy, for sickle cell disease in people aged 12 and older, alongside another gene therapy, Lyfgenia. The FDA keeps a public list of AI-enabled medical devices it has authorized, many of them in radiology. In 2024 the Nobel Prize in Chemistry recognized Demis Hassabis and John Jumper for AlphaFold, an AI system that predicts protein structures, together with David Baker for protein design.",
        ],
        easy: [
          "2023: the first gene-editing treatment was approved in the U.S., for sickle cell disease.",
          "Many approved AI tools help read medical scans.",
          "2024: a Nobel Prize went to an AI that predicts the shapes of proteins.",
        ],
      },
      {
        heading: "Still being researched",
        standard: [
          "Personalized mRNA cancer vaccines, editing genes directly inside the body for more conditions, blood tests that look for many cancers at once, and AI systems that give clinical advice are all active research areas. Some early results are encouraging, but they are not established treatments, and their long-term safety is still being studied.",
        ],
        easy: ["mRNA cancer vaccines, more gene editing, and AI advice tools are still being tested."],
      },
      {
        heading: "Risks, limitations, and unanswered questions",
        standard: [
          "Gene therapies can be very expensive and involve intensive treatment, including chemotherapy before some of them. Long-term effects of editing are still being followed. AI tools can be wrong, can reflect biases in their training data, and need human oversight. Be cautious of clinics offering unapproved gene or stem cell treatments.",
        ],
        easy: ["New treatments can be costly and have risks. AI can make mistakes. Be careful with clinics selling unapproved treatments."],
      },
    ],
    evidence: [
      { claim: "CRISPR-based therapy treats sickle cell disease in approved patients.", level: "strong", basis: "approval" },
      { claim: "Personalized mRNA cancer vaccines will become standard care.", level: "promising", basis: "randomized-trials" },
      { claim: "AI can replace clinicians in diagnosis.", level: "not-established", basis: "guidance" },
    ],
    takeaways: [
      "A few gene and AI technologies are approved; most are still research.",
      "Approval is for specific uses and groups of patients.",
      "Avoid clinics selling unapproved gene or stem cell treatments.",
    ],
    references: [
      nobel("chemistry", 2020),
      { title: "FDA Approves First Gene Therapies to Treat Patients with Sickle Cell Disease", publisher: FDA, url: "https://www.fda.gov/news-events/press-announcements/fda-approves-first-gene-therapies-treat-patients-sickle-cell-disease", date: "2023-12-08" },
      { title: "Artificial Intelligence-Enabled Medical Devices", publisher: FDA, url: "https://www.fda.gov/medical-devices/software-medical-device-samd/artificial-intelligence-enabled-medical-devices" },
      nobel("chemistry", 2024),
    ],
  },
];
