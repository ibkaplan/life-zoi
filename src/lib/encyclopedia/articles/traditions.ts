import type { Article } from "@/lib/encyclopedia/types";
import { FDA, NCCIH, PUBMED, SEED_AUTHOR, SEED_DATE, nobel } from "./shared";

const base = { publishedOn: SEED_DATE, updatedOn: SEED_DATE, draftedBy: SEED_AUTHOR };

export const traditionArticles: Article[] = [
  {
    ...base,
    slug: "eastern-and-western-medicine",
    category: "eastern-medicine",
    alsoIn: ["western-medicine"],
    featured: true,
    safety: ["herbs"],
    title: "Eastern and Western Medicine: Two Approaches to Understanding Health",
    summary:
      "Medical traditions from China, India, and elsewhere developed over centuries with their own ideas about balance and the whole person. Modern Western medicine grew from laboratory science and clinical trials. This article compares how they think about health, and explains why each practice should be judged on its own evidence.",
    easySummary:
      "Eastern traditions often look at balance in the whole person. Modern Western medicine relies on tests and trials. Each practice should be judged by what studies show, not by where it comes from.",
    keywords: ["Eastern medicine", "Western medicine", "integrative medicine", "complementary", "alternative", "traditional Chinese medicine", "Ayurveda", "evidence", "holistic"],
    terms: ["integrative-medicine", "complementary", "placebo", "randomized-trial"],
    image: { illustration: "balance", alt: "Drawing of a balance with a lotus flower on one side and a stethoscope on the other, level with each other." },
    sections: [
      {
        heading: "What is it?",
        standard: [
          "\"Eastern medicine\" is a loose name for many different traditions. Traditional Chinese medicine includes acupuncture, herbal formulas, and practices such as tai chi and qigong. Ayurveda, from India, uses diet, herbs, massage, and lifestyle routines. These are distinct systems with their own histories, and each contains many practices.",
          "Modern Western medicine, sometimes called conventional or biomedicine, explains illness through anatomy, physiology, chemistry, and genetics, and tests treatments in controlled trials. It includes diagnostics such as blood tests and imaging, medicines, surgery, and preventive care such as vaccination and screening.",
        ],
        easy: [
          "Eastern medicine is many different traditions, such as Chinese medicine and Ayurveda from India.",
          "Western medicine uses lab science, tests, medicines, surgery, and prevention.",
        ],
      },
      {
        heading: "How the approaches compare",
        standard: [
          "On health, traditional systems often describe balance, energy, or constitution across the whole person, while modern medicine describes measurable body systems. On symptoms, a traditional practitioner may read patterns across the whole body, while a modern clinician looks for an underlying cause that can be tested. On prevention, both stress daily habits such as diet, movement, rest, and calm. On treatment, traditional care often combines several practices fitted to the person, while modern medicine relies on treatments tested in groups of people.",
          "These are tendencies, not rules. Modern medicine increasingly values the whole person, and some traditional practices have been studied with modern methods.",
        ],
        easy: [
          "Traditions often look at balance in the whole person. Modern medicine looks for a cause it can test.",
          "Both say daily habits like food, movement, rest, and calm matter.",
        ],
      },
      {
        heading: "What does science tell us?",
        standard: [
          "The U.S. National Center for Complementary and Integrative Health explains that a practice is called complementary when it is used together with conventional medicine, alternative when it is used instead of it, and integrative when both are brought together in a coordinated way. It stresses that evidence differs from practice to practice: some, such as acupuncture for some kinds of chronic pain and tai chi for balance, have meaningful research support; many others have not been studied well; and some herbal products carry real risks.",
          "One famous bridge between traditions is artemisinin. Tu Youyou searched traditional Chinese texts and isolated artemisinin from sweet wormwood in the 1970s, leading to a key malaria medicine. She shared the 2015 Nobel Prize. That success came from testing a traditional lead with modern methods.",
        ],
        easy: [
          "Some traditional practices have good research support. Many have not been studied well.",
          "A malaria medicine, artemisinin, came from a plant described in old Chinese texts and was proven with modern science. It won a Nobel Prize in 2015.",
        ],
      },
      {
        heading: "When to consult a qualified professional",
        standard: [
          "Tell your doctor about any traditional or complementary practice you use, especially herbs and supplements. Do not use a complementary practice to replace or delay care for a serious or new symptom, and do not stop a prescribed medicine on your own. Choose practitioners with recognized training and licensing where it exists.",
        ],
        easy: ["Tell your doctor about any herbs or practices you use. Do not stop your medicines. Do not delay care for a new or serious problem."],
      },
    ],
    evidence: [
      { claim: "Some complementary practices, such as acupuncture for some chronic pain and tai chi for balance, have supporting research.", level: "promising", basis: "systematic-review" },
      { claim: "Artemisinin, first isolated from a plant used in traditional Chinese medicine, treats malaria.", level: "strong", basis: "approval" },
      { claim: "All traditional practices work, or all of them do not work.", level: "not-established", basis: "guidance" },
    ],
    takeaways: [
      "Eastern medicine is many traditions, not one.",
      "Judge each practice by its own evidence, not by its origin.",
      "Use complementary practices with your medical care, not instead of it, and tell your doctor.",
    ],
    references: [
      { title: "Complementary, Alternative, or Integrative Health: What's In a Name?", publisher: NCCIH, url: "https://www.nccih.nih.gov/health/complementary-alternative-or-integrative-health-whats-in-a-name" },
      { title: "Traditional Chinese Medicine: What You Need To Know", publisher: NCCIH, url: "https://www.nccih.nih.gov/health/traditional-chinese-medicine-what-you-need-to-know" },
      { title: "Ayurvedic Medicine: In Depth", publisher: NCCIH, url: "https://www.nccih.nih.gov/health/ayurvedic-medicine-in-depth" },
      nobel("medicine", 2015),
    ],
  },
  {
    ...base,
    slug: "acupuncture",
    category: "eastern-medicine",
    title: "Acupuncture: Tradition and Research",
    summary:
      "Acupuncture places very thin needles at specific points on the body. It comes from traditional Chinese medicine and is now one of the most studied complementary practices. Research suggests it can help some kinds of chronic pain, though part of the effect may come from expectation and care.",
    easySummary:
      "Acupuncture uses very thin needles. Studies suggest it can help some long-lasting pain. It is usually safe when done by a trained person with clean needles.",
    keywords: ["acupuncture", "needles", "chronic pain", "back pain", "neck pain", "osteoarthritis", "headache", "traditional Chinese medicine", "qi"],
    terms: ["placebo", "sham", "meta-analysis"],
    image: { illustration: "needle", alt: "Drawing of an outlined human back with a few small dots marking acupuncture points." },
    sections: [
      {
        heading: "What is the traditional approach?",
        standard: [
          "In traditional Chinese medicine, acupuncture is described as influencing the flow of qi, often translated as vital energy, along pathways called meridians. Practitioners choose points based on a pattern of symptoms across the whole person.",
        ],
        easy: ["In Chinese tradition, needles at chosen points help the flow of energy called qi."],
      },
      {
        heading: "What does modern research say?",
        standard: [
          "Many randomized trials have compared real acupuncture with \"sham\" acupuncture (needles at wrong points or not inserted) and with usual care. A large analysis of individual patient data by the Acupuncture Trialists' Collaboration (Vickers and colleagues, 2012) found that acupuncture did better than both sham and no acupuncture for chronic back and neck pain, osteoarthritis, and chronic headache. The difference from sham was smaller than the difference from no acupuncture, which suggests that part of the benefit comes from factors such as expectation and attention.",
          "The National Center for Complementary and Integrative Health describes evidence that acupuncture may help some types of chronic pain, with less certain or weaker evidence for many other conditions.",
        ],
        easy: [
          "In studies, acupuncture helped some long-lasting back, neck, knee, and head pain more than no treatment.",
          "Fake acupuncture also helped a little, so part of the effect may come from expecting to feel better.",
        ],
      },
      {
        heading: "Risks, limitations, and unanswered questions",
        standard: [
          "When performed by a trained practitioner using sterile, single-use needles, acupuncture has a low rate of serious side effects. Problems that have been reported include infections and, rarely, injury to organs from incorrect technique. It is not a substitute for diagnosing the cause of new pain. Researchers still debate how it works.",
        ],
        easy: ["It is usually safe with a trained person and clean, single-use needles. See a doctor about new pain first."],
      },
      {
        heading: "When to consult a qualified professional",
        standard: [
          "See a doctor about new, severe, or unexplained pain before trying acupuncture. Tell the acupuncturist if you take blood thinners, have a pacemaker, or are pregnant. Check that the practitioner is licensed where licensing exists.",
        ],
        easy: ["Tell the acupuncturist if you take blood thinners, have a pacemaker, or are pregnant."],
      },
    ],
    evidence: [
      { claim: "Acupuncture helps some chronic pain conditions more than no acupuncture.", level: "promising", basis: "systematic-review" },
      { claim: "Acupuncture is better than sham acupuncture by a large margin.", level: "limited", basis: "systematic-review" },
      { claim: "Acupuncture treats serious diseases such as cancer.", level: "not-established", basis: "guidance" },
    ],
    takeaways: [
      "Acupuncture may help some chronic pain; the effect over sham is modest.",
      "It is generally safe with trained practitioners and sterile needles.",
      "Get new pain checked first, and tell your doctor about it.",
    ],
    references: [
      { title: "Acupuncture: What You Need To Know", publisher: NCCIH, url: "https://www.nccih.nih.gov/health/acupuncture-what-you-need-to-know" },
      { title: "Acupuncture for chronic pain: individual patient data meta-analysis (Vickers et al., Arch Intern Med)", publisher: PUBMED, url: "https://pubmed.ncbi.nlm.nih.gov/22965186/", date: "2012" },
    ],
  },
  {
    ...base,
    slug: "herbal-medicine-chinese-and-ayurvedic",
    category: "eastern-medicine",
    safety: ["herbs"],
    title: "Traditional Chinese Medicine, Ayurveda, and Herbal Products",
    summary:
      "Herbal remedies are central to both traditional Chinese medicine and Ayurveda. A few plant compounds have become proven medicines, but most traditional herbal products have not been tested well, and some interact with prescription drugs or have been contaminated. Here is how to think about them safely.",
    easySummary:
      "Many traditions use herbs. A few plants led to real medicines. Many herbal products are not well tested, and some can be unsafe or react with your medicines.",
    keywords: ["herbal medicine", "herbs", "supplements", "Ayurveda", "traditional Chinese medicine", "turmeric", "St. John's wort", "interactions", "heavy metals", "lead", "ginkgo"],
    terms: ["interaction", "supplement"],
    image: { illustration: "leaf", alt: "Drawing of a leafy herb sprig beside a small pill bottle with a caution mark." },
    sections: [
      {
        heading: "What is the traditional approach?",
        standard: [
          "Traditional Chinese medicine often uses formulas of several herbs chosen for a person's pattern of symptoms. Ayurveda, which developed in India over thousands of years, aims to balance three bodily energies called doshas through diet, herbs, oils, cleansing practices, and daily routines.",
        ],
        easy: ["Chinese medicine mixes several herbs for each person. Ayurveda from India uses food, herbs, and routines to keep balance."],
      },
      {
        heading: "What does modern research say?",
        standard: [
          "According to the National Center for Complementary and Integrative Health, there are few well-designed studies of traditional Chinese herbal formulas or Ayurvedic preparations for most conditions, so their effectiveness is mostly unknown. Some single compounds have been studied more, such as curcumin from turmeric, but results in people have been mixed and often limited by how poorly it is absorbed.",
        ],
        easy: ["Most herbal mixtures have not been tested well in people. Results for turmeric are mixed."],
      },
      {
        heading: "Risks, limitations, and unanswered questions",
        standard: [
          "Herbal products can interact with medicines. St. John's wort, for example, can make many medicines less effective, including some antidepressants, birth control pills, blood thinners, and drugs used after organ transplants or for HIV. Some traditional products, including some Ayurvedic preparations, have been found to contain lead, mercury, or arsenic, and some imported products have contained undeclared prescription drugs. Herbal supplements are not reviewed for safety and effectiveness the way prescription medicines are.",
        ],
        easy: [
          "Some herbs change how your medicines work. St. John's wort is a well-known example.",
          "Some products have been found to contain metals like lead or hidden medicines.",
        ],
      },
      {
        heading: "When to consult a qualified professional",
        standard: [
          "Talk with your doctor or pharmacist before starting any herbal product, especially if you take prescription medicines, are pregnant or breastfeeding, are planning surgery, or are treating a child. Stop and seek care if you notice new symptoms.",
        ],
        easy: ["Ask your doctor or pharmacist before you take any herb, especially if you take medicines."],
      },
    ],
    evidence: [
      { claim: "St. John's wort interacts with many prescription medicines.", level: "strong", basis: "guidance" },
      { claim: "Turmeric or curcumin supplements treat disease in people.", level: "limited", basis: "randomized-trials" },
      { claim: "Most traditional herbal formulas are effective for the conditions they are used for.", level: "not-established", basis: "guidance" },
    ],
    takeaways: [
      "\"Natural\" does not mean safe or proven.",
      "Herb-drug interactions are real; tell your doctor and pharmacist everything you take.",
      "Buy from reputable sources and be wary of products making cure claims.",
    ],
    references: [
      { title: "Traditional Chinese Medicine: What You Need To Know", publisher: NCCIH, url: "https://www.nccih.nih.gov/health/traditional-chinese-medicine-what-you-need-to-know" },
      { title: "Ayurvedic Medicine: In Depth", publisher: NCCIH, url: "https://www.nccih.nih.gov/health/ayurvedic-medicine-in-depth" },
      { title: "Herb-Drug Interactions", publisher: NCCIH, url: "https://www.nccih.nih.gov/health/providers/digest/herb-drug-interactions" },
    ],
  },
  {
    ...base,
    slug: "meditation-and-mind-body",
    category: "eastern-medicine",
    alsoIn: ["sleep-stress"],
    safety: ["mental-health"],
    title: "Meditation, Tai Chi, and Mind-Body Practices",
    summary:
      "Meditation, yoga, tai chi, and qigong come from Asian traditions and are now widely studied. Research suggests modest benefits for stress, anxiety, and balance, with low risk for most people. They work best as part of overall care.",
    easySummary:
      "Meditation, yoga, and tai chi can help some people feel less stressed and, for tai chi, improve balance. The benefits are usually modest. They are safe for most people.",
    keywords: ["meditation", "mindfulness", "tai chi", "qigong", "yoga", "stress", "anxiety", "balance", "falls", "breathing"],
    terms: ["mindfulness", "meta-analysis"],
    image: { illustration: "lotus", alt: "Drawing of a lotus flower with calm wave lines beneath it." },
    sections: [
      {
        heading: "What is the traditional approach?",
        standard: [
          "Meditation practices come from Buddhist, Hindu, Taoist, and other traditions. Tai chi and qigong combine slow movement, breathing, and focus, and are linked to traditional Chinese ideas about energy. Yoga, from India, joins postures, breathing, and meditation.",
        ],
        easy: ["These practices come from Asian traditions. They join breathing, attention, and gentle movement."],
      },
      {
        heading: "What does modern research say?",
        standard: [
          "A 2014 systematic review in JAMA Internal Medicine (Goyal and colleagues) found moderate evidence that mindfulness meditation programs improve anxiety, depression, and pain, with small to moderate effects, and low or insufficient evidence for many other outcomes. NCCIH summarizes evidence that tai chi may improve balance and reduce falls in older adults, and that meditation and mindfulness may help with stress, anxiety, and sleep, while noting many studies are small.",
        ],
        easy: [
          "Studies show mindfulness can ease worry, low mood, and pain a little.",
          "Tai chi may help balance and help prevent falls in older adults.",
        ],
      },
      {
        heading: "Practical information for everyday life",
        standard: [
          "Even a few minutes a day of slow breathing or a short guided meditation is a reasonable place to start. For tai chi or yoga, a class with a qualified instructor can adapt movements to your body. LifeZoi's Breathe for Life and Wellness Library pages have guided options.",
        ],
        easy: ["Start with a few minutes of slow breathing a day. A class can help you learn safely."],
      },
      {
        heading: "Risks, limitations, and unanswered questions",
        standard: [
          "These practices are low risk for most people. Some movements may need changes for people with joint problems, pregnancy, or balance difficulties. Meditation can occasionally bring up difficult feelings; people with a history of trauma or serious mental illness may want guidance from a mental health professional. They should not replace treatment for depression, anxiety disorders, or other conditions.",
        ],
        easy: ["They are safe for most people. They do not replace treatment for depression or anxiety."],
      },
    ],
    evidence: [
      { claim: "Mindfulness programs modestly improve anxiety, depression, and pain.", level: "strong", basis: "systematic-review" },
      { claim: "Tai chi improves balance and may reduce falls in older adults.", level: "promising", basis: "systematic-review" },
      { claim: "Meditation can replace treatment for mental illness.", level: "not-established", basis: "guidance" },
    ],
    takeaways: [
      "Mind-body practices offer modest, real benefits for stress and, for tai chi, balance.",
      "They are low risk for most people.",
      "Use them alongside, not instead of, care for health conditions.",
    ],
    references: [
      { title: "Meditation and Mindfulness: Effectiveness and Safety", publisher: NCCIH, url: "https://www.nccih.nih.gov/health/meditation-and-mindfulness-effectiveness-and-safety" },
      { title: "Meditation programs for psychological stress and well-being (Goyal et al., JAMA Intern Med)", publisher: PUBMED, url: "https://pubmed.ncbi.nlm.nih.gov/24395196/", date: "2014" },
      { title: "Tai Chi: What You Need To Know", publisher: NCCIH, url: "https://nccih.nih.gov/health/taichi" },
    ],
  },
  {
    ...base,
    slug: "evidence-based-medicine",
    category: "western-medicine",
    featured: true,
    title: "Evidence-Based Medicine: How Modern Medicine Tests What Works",
    summary:
      "Modern medicine asks a simple question of every treatment: does it help people more than it harms them? Randomized trials, systematic reviews, and drug approval rules are the tools it uses to answer. This article explains them, and how to read health news with a careful eye.",
    easySummary:
      "Doctors use studies to learn which treatments help. The best studies compare groups of people fairly. Reviews put many studies together.",
    keywords: ["evidence-based medicine", "clinical trial", "randomized controlled trial", "systematic review", "Cochrane", "FDA approval", "placebo", "drug development", "health news"],
    terms: ["randomized-trial", "systematic-review", "placebo", "observational-study", "clinical-trial"],
    image: { illustration: "stethoscope", alt: "Drawing of a stethoscope curled around a small bar chart." },
    sections: [
      {
        heading: "What is it?",
        standard: [
          "Evidence-based medicine means combining the best available research with a clinician's experience and the patient's values and situation. It became a widely used term in the early 1990s.",
        ],
        easy: ["It means using good research, a doctor's experience, and what matters to you."],
      },
      {
        heading: "What does science tell us?",
        standard: [
          "In a randomized controlled trial, people are assigned by chance to a new treatment or a comparison, such as standard care or a placebo. Chance assignment makes the groups alike, so differences in results are more likely to come from the treatment. Observational studies follow people without assigning treatments; they are useful for spotting links and rare harms, but cannot prove cause on their own.",
          "A systematic review gathers all the good-quality studies on a question and assesses them together. Cochrane, an international network, is known for such reviews. In the United States, the Food and Drug Administration requires medicines to pass phases of clinical research, from small safety studies to large trials, before approval, and continues to watch for safety problems afterward.",
        ],
        easy: [
          "In the best studies, people are put into groups by chance. That makes the comparison fair.",
          "Reviews combine many studies to give a clearer answer.",
          "New medicines go through several steps of testing before approval.",
        ],
      },
      {
        heading: "Practical information for everyday life",
        standard: [
          "When you read a health headline, ask: Was it studied in people or in animals? How many people took part? Was there a comparison group? Is this one study or a review of many? Who paid for it? A single small study is a starting point, not a conclusion.",
        ],
        easy: ["Ask: Was it tested in people? How many? Was there a fair comparison? Is it one study or many?"],
      },
      {
        heading: "Risks, limitations, and unanswered questions",
        standard: [
          "Trials do not always include enough older adults, women, or people from different backgrounds, so results may not apply equally to everyone. Studies with positive results are more likely to be published. Good evidence-based care recognizes these gaps and adapts to each person.",
        ],
        easy: ["Studies do not always include everyone. A good doctor fits the evidence to you."],
      },
    ],
    evidence: [
      { claim: "Randomized controlled trials are the most reliable way to test whether a treatment works.", level: "strong", basis: "guidance" },
      { claim: "A single small study proves a treatment works.", level: "not-established", basis: "guidance" },
    ],
    takeaways: [
      "Fair comparisons, usually randomized trials, are how medicine tests what works.",
      "Systematic reviews combine many studies for a clearer answer.",
      "Read health news by asking who was studied, how, and how many.",
    ],
    references: [
      { title: "What are systematic reviews?", publisher: "Cochrane", url: "https://cochrane.org/evidence/what-are-systematic-reviews" },
      { title: "Step 3: Clinical Research", publisher: FDA, url: "https://www.fda.gov/patients/drug-development-process/step-3-clinical-research" },
    ],
  },
];
