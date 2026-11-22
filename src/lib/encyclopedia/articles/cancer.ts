import type { Article } from "@/lib/encyclopedia/types";
import { NCI, SEED_AUTHOR, SEED_DATE, WHO, FDA, nobel } from "./shared";

const base = { publishedOn: SEED_DATE, updatedOn: SEED_DATE, draftedBy: SEED_AUTHOR, safety: ["cancer"] as Article["safety"] };

export const cancerArticles: Article[] = [
  {
    ...base,
    slug: "how-cancer-develops",
    category: "cancer",
    featured: true,
    title: "How Cancer Develops",
    summary:
      "Cancer is not one disease but more than a hundred. All of them begin when changes in a cell's genes let it grow and divide when it should not. This article explains how that happens, what raises the risk, and why some cancers can be prevented or found early.",
    easySummary:
      "Cancer starts when a cell's instructions (its genes) change, so the cell keeps growing when it should stop. There are many kinds of cancer. Some risks can be lowered.",
    keywords: ["cancer", "tumor", "genes", "mutation", "risk factors", "smoking", "HPV", "metastasis", "prevention", "types of cancer"],
    terms: ["gene", "mutation", "tumor", "metastasis", "carcinogen"],
    image: { illustration: "cell", alt: "Drawing of one dividing cell with a changed nucleus beside a group of normal round cells." },
    sections: [
      {
        heading: "What is it?",
        standard: [
          "The body is made of trillions of cells that normally grow, divide, and die in an orderly way. Cancer begins when changes in a cell's genes switch off the normal brakes on growth, or switch on signals that tell it to keep dividing. Over time the abnormal cells can form a lump called a tumor, crowd out healthy tissue, and in some cases spread to other parts of the body. That spread is called metastasis.",
          "Cancers are named for where they start, such as the breast, lung, colon, skin, or blood. Carcinomas start in the cells that line organs, sarcomas in bone and soft tissue, leukemias in blood-forming tissue, lymphomas in immune cells, and melanomas in pigment cells of the skin.",
        ],
        easy: [
          "Your body is made of tiny cells. Normally they grow and stop at the right time.",
          "In cancer, some cells keep growing. They can form a lump (a tumor) and sometimes spread.",
        ],
      },
      {
        heading: "Why does it matter?",
        standard: [
          "The World Health Organization lists cancer among the leading causes of death worldwide. It also notes that a large share of cancers could be prevented by avoiding known risk factors, and that many cancers can be treated more successfully when they are found early.",
        ],
        easy: ["Cancer is common around the world. Avoiding known risks and finding cancer early can make a real difference."],
      },
      {
        heading: "What does science tell us?",
        standard: [
          "Gene changes that lead to cancer can be inherited, but most are acquired during life. They can come from errors when cells divide, or from damage caused by things in the environment called carcinogens. The National Cancer Institute lists well-established risk factors that include tobacco, alcohol, some infections (such as human papillomavirus and hepatitis B and C), radiation including ultraviolet light from the sun, obesity, and some chemicals. Age is the biggest single risk factor, because gene changes build up over the years.",
          "Having a risk factor does not mean a person will get cancer, and many people who get cancer have no known risk factor. Risk is about probabilities across large groups, not certainty for one person.",
        ],
        easy: [
          "Most gene changes happen during life. Some are passed down in families.",
          "Known risks include smoking, alcohol, some infections, too much sun, and extra body weight. Getting older also raises risk.",
          "A risk factor does not mean you will get cancer.",
        ],
        points: ["Tobacco is the best-known preventable cause.", "Vaccines against HPV and hepatitis B lower the risk of cancers those viruses cause."],
      },
      {
        heading: "Important research and discoveries",
        standard: [
          "In 1964 the U.S. Surgeon General's report concluded that cigarette smoking causes lung cancer in men, a turning point for prevention. In the 1970s and 1980s researchers showed that specific genes, called oncogenes and tumor suppressor genes, drive cancer. Harald zur Hausen's work linking human papillomavirus to cervical cancer, recognized with a Nobel Prize in 2008, led to HPV vaccines. Since the 2000s, sequencing the genes inside tumors has shown that two cancers in the same organ can be driven by very different changes, which is the basis of precision medicine.",
        ],
        easy: [
          "In 1964 a U.S. report said smoking causes lung cancer.",
          "Scientists later found the genes that drive cancer, and that a virus (HPV) can cause cervical cancer. That led to a vaccine.",
        ],
      },
      {
        heading: "Practical information for everyday life",
        standard: [
          "The steps with the strongest support are not smoking, limiting alcohol, protecting skin from strong sun, keeping vaccinations such as HPV and hepatitis B up to date, staying active, and taking part in the screening tests recommended for your age and history. Ask a clinician which screening tests apply to you, and tell them about cancers in your close family.",
        ],
        easy: ["Do not smoke. Drink less alcohol. Protect your skin from strong sun. Keep vaccines up to date. Ask your doctor which cancer checks are right for you."],
      },
      {
        heading: "Risks, limitations, and unanswered questions",
        standard: [
          "Researchers still cannot predict exactly who will develop cancer. Many claims about single foods or supplements that \"prevent\" cancer come from laboratory or observational studies and have not been confirmed in trials. Be cautious of any product that promises to prevent or cure cancer.",
        ],
        easy: ["No single food or pill is proven to prevent cancer. Be careful with any product that promises it."],
      },
    ],
    evidence: [
      { claim: "Tobacco smoking causes several cancers, including lung cancer.", level: "strong", basis: "guidance" },
      { claim: "HPV vaccination lowers the risk of cancers caused by HPV.", level: "strong", basis: "guidance" },
      { claim: "A single 'superfood' or supplement prevents cancer.", level: "not-established", basis: "observational" },
    ],
    takeaways: [
      "Cancer is a group of diseases that start with changes in a cell's genes.",
      "Many risks can be lowered: tobacco, alcohol, strong sun, some infections, and inactivity.",
      "Screening can find some cancers early, when treatment often works better.",
    ],
    references: [
      { title: "What Is Cancer?", publisher: NCI, url: "https://www.cancer.gov/about-cancer/understanding/what-is-cancer" },
      { title: "Risk Factors for Cancer", publisher: NCI, url: "https://www.cancer.gov/about-cancer/causes-prevention/risk" },
      { title: "Cancer: fact sheet", publisher: WHO, url: "https://www.who.int/news-room/fact-sheets/detail/cancer" },
      { title: "The 1964 Report on Smoking and Health", publisher: "National Library of Medicine, Profiles in Science", url: "https://profiles.nlm.nih.gov/spotlight/nn/feature/smoking", date: "1964" },
      nobel("medicine", 2008),
    ],
  },
  {
    ...base,
    slug: "modern-cancer-treatments",
    category: "cancer",
    alsoIn: ["western-medicine"],
    featured: true,
    title: "Modern Cancer Treatments Explained",
    summary:
      "Surgery, radiation, and chemotherapy are still the foundations of cancer care. Since the late 1990s they have been joined by targeted therapies and immunotherapies. This article explains what each does, and the difference between approved treatments and those still being studied.",
    easySummary:
      "Cancer can be treated with surgery, radiation, medicines that kill cancer cells, medicines that target the cancer's weak spots, and medicines that help the immune system. Your cancer team chooses what fits your cancer.",
    keywords: ["cancer treatment", "surgery", "radiation therapy", "chemotherapy", "immunotherapy", "targeted therapy", "precision medicine", "CAR T", "checkpoint inhibitor", "imatinib", "trastuzumab", "HER2"],
    terms: ["chemotherapy", "immunotherapy", "targeted-therapy", "precision-medicine", "checkpoint-inhibitor", "car-t"],
    image: { illustration: "immune", alt: "Drawing of immune cells with small hooks gathering around a larger irregular cancer cell." },
    sections: [
      {
        heading: "What is it?",
        standard: [
          "Surgery removes a tumor and sometimes nearby lymph nodes. Radiation therapy uses high-energy beams or sources placed inside the body to damage cancer cells' DNA in a chosen area. Chemotherapy uses medicines that kill fast-dividing cells throughout the body. Hormone therapy slows cancers that grow in response to hormones, such as many breast and prostate cancers.",
          "Targeted therapy uses medicines designed to block a specific change that a cancer depends on. Immunotherapy helps the body's own immune system recognize and attack cancer. Examples are checkpoint inhibitors, which release a brake on immune cells, and CAR T-cell therapy, in which a patient's own immune cells are modified in a laboratory and returned to the body.",
        ],
        easy: [
          "Surgery takes the tumor out. Radiation aims strong energy at the cancer. Chemotherapy is medicine that kills fast-growing cells.",
          "Newer medicines aim at the cancer's own weak spots (targeted therapy) or help your immune system fight it (immunotherapy).",
        ],
      },
      {
        heading: "Why does it matter?",
        standard: [
          "Most people with cancer receive a combination of treatments. Knowing what each one does can make conversations with the care team easier and help people ask better questions about benefits, side effects, and goals of care.",
        ],
        easy: ["Most people get more than one kind of treatment. Knowing the words helps you talk with your care team."],
      },
      {
        heading: "What does science tell us?",
        standard: [
          "Every treatment in routine use has been tested in clinical trials and approved by regulators for specific cancers and situations. A treatment that works for one cancer may not work for another, even in the same organ. That is why doctors increasingly test tumors for particular gene changes or proteins before choosing a targeted therapy or immunotherapy.",
          "Immunotherapy has produced long-lasting responses in some people with cancers such as melanoma, but it does not work for everyone, and it can cause serious immune side effects that need prompt medical care.",
        ],
        easy: [
          "Approved treatments were tested in large studies for specific cancers.",
          "Doctors may test the tumor first to choose the best medicine.",
          "Immunotherapy helps some people a lot, but not everyone. It can have side effects that need quick care.",
        ],
      },
      {
        heading: "Important research and discoveries",
        standard: [
          "Trastuzumab, a targeted antibody for breast cancers with too much of a protein called HER2, was approved in the United States in 1998, building on research by Dennis Slamon and colleagues. Imatinib, approved in 2001 for chronic myeloid leukemia, showed that a pill aimed at one faulty protein could transform the outlook for a cancer. The 2018 Nobel Prize recognized James Allison and Tasuku Honjo for discovering how to release the immune system's brakes, the basis of checkpoint inhibitors. In 2017 the U.S. Food and Drug Administration approved the first CAR T-cell therapy.",
        ],
        easy: [
          "1998: a targeted medicine for one type of breast cancer was approved.",
          "2001: a pill for a type of leukemia changed how that cancer is treated.",
          "2017: the first treatment made from a patient's own changed immune cells was approved in the U.S.",
        ],
      },
      {
        heading: "Approved, researched, and experimental",
        standard: [
          "An established or approved treatment has passed large trials and is part of standard guidelines for a particular cancer. A treatment being researched is being tested in clinical trials, often in phases that move from safety in small groups to comparison with standard care in large groups. Experimental approaches, such as many personalized cancer vaccines, are still being studied and should be used only inside a properly supervised clinical trial. A product sold outside medical care with claims to cure cancer is not a treatment.",
        ],
        easy: [
          "Approved means it passed big studies for that cancer.",
          "Being researched means it is still being tested in clinical trials.",
          "Experimental treatments should only be used inside a supervised trial.",
        ],
      },
      {
        heading: "Risks, limitations, and unanswered questions",
        standard: [
          "All cancer treatments have side effects, and they differ widely. Supportive care, sometimes called palliative care, helps with symptoms such as pain, nausea, and fatigue at any stage, alongside treatment. Researchers are still learning why some cancers resist treatment and how to predict who will benefit from immunotherapy.",
        ],
        easy: ["All treatments can have side effects. Supportive care helps with pain, sickness, and tiredness at any stage."],
      },
    ],
    evidence: [
      { claim: "Approved targeted therapies and immunotherapies improve outcomes for specific cancers they were tested in.", level: "strong", basis: "approval" },
      { claim: "Personalized cancer vaccines improve survival in routine care.", level: "promising", basis: "randomized-trials" },
      { claim: "Alternative remedies sold as cancer cures can replace standard treatment.", level: "not-established", basis: "guidance" },
    ],
    takeaways: [
      "Surgery, radiation, and chemotherapy remain central; targeted therapy and immunotherapy are newer tools.",
      "Treatments are approved for specific cancers, so what works for one person may not work for another.",
      "Experimental treatments belong in supervised clinical trials. Decisions belong with an oncology team.",
    ],
    references: [
      { title: "Types of Cancer Treatment", publisher: NCI, url: "https://www.cancer.gov/about-cancer/treatment/types" },
      { title: "Immunotherapy to Treat Cancer", publisher: NCI, url: "https://www.cancer.gov/about-cancer/treatment/types/immunotherapy" },
      { title: "Targeting HER2: research story", publisher: NCI, url: "https://www.cancer.gov/research/progress/discovery/HER2" },
      { title: "How Imatinib Transformed Leukemia Treatment", publisher: NCI, url: "https://www.cancer.gov/research/progress/discovery/gleevec" },
      { title: "FDA approval brings first gene therapy to the United States", publisher: FDA, url: "https://www.fda.gov/news-events/press-announcements/fda-approval-brings-first-gene-therapy-united-states", date: "2017-08-30" },
      nobel("medicine", 2018),
    ],
  },
  {
    ...base,
    slug: "cancer-screening-and-clinical-trials",
    category: "cancer",
    title: "Cancer Screening, Early Detection, and Clinical Trials",
    summary:
      "Screening looks for cancer before symptoms appear. Clinical trials are how new treatments are tested. This article explains how both work, what their benefits and limits are, and how to talk about them with a clinician.",
    easySummary:
      "Screening tests look for cancer before you feel sick. Clinical trials test new treatments safely. Ask your doctor which screening tests are right for you.",
    keywords: ["screening", "early detection", "mammogram", "colonoscopy", "Pap test", "HPV test", "lung cancer screening", "clinical trials", "phases", "genetic testing", "BRCA"],
    terms: ["screening", "false-positive", "overdiagnosis", "clinical-trial"],
    image: { illustration: "magnifier", alt: "Drawing of a magnifying glass over a field of cells, one of them highlighted." },
    sections: [
      {
        heading: "What is it?",
        standard: [
          "Cancer screening means testing people who have no symptoms. Examples include mammograms for breast cancer, tests for colorectal cancer such as colonoscopy or stool tests, Pap and HPV tests for cervical cancer, and low-dose CT scans for some people with a heavy smoking history. Genetic testing, for example for BRCA1 and BRCA2 changes, can show an inherited higher risk in some families.",
          "A clinical trial is a research study in people that tests whether a new approach is safe and works better than, or as well as, the current standard.",
        ],
        easy: [
          "Screening is a test for people who feel well, to find cancer early.",
          "A clinical trial is a study that carefully tests a new treatment in people.",
        ],
      },
      {
        heading: "What does science tell us?",
        standard: [
          "The National Cancer Institute explains that screening can find some cancers early, when treatment is often more effective, and that some tests can find changes before they become cancer. Screening also has limits: a test can be falsely positive and lead to worry and further tests, it can miss a cancer, and it can find slow cancers that would never have caused harm, which is called overdiagnosis. Recommendations depend on age, sex, family history, and other risks, and they are updated as evidence changes.",
          "Clinical trials move through phases. Early phases test safety and dose in small groups. Later phases compare the new approach with standard care in larger groups. Trials have rules to protect participants, including informed consent and independent review.",
        ],
        easy: [
          "Screening helps find some cancers early. It can also give false alarms or miss a cancer.",
          "Advice on screening depends on your age, family, and health.",
          "Trials start small to check safety, then grow to compare with usual care.",
        ],
      },
      {
        heading: "Practical information for everyday life",
        standard: [
          "Ask your clinician which screening tests are recommended for you and how often, what the results can and cannot tell you, and what happens after an abnormal result. If you are interested in a clinical trial, your oncology team can tell you whether one fits your situation. The National Cancer Institute lists trials it supports.",
        ],
        easy: ["Ask your doctor: Which checks should I have? How often? What happens if a result is not normal?"],
      },
      {
        heading: "Risks, limitations, and unanswered questions",
        standard: [
          "Blood tests that look for signals of many cancers at once are being studied. They are promising but are not yet an established replacement for recommended screening tests.",
        ],
        easy: ["Blood tests for many cancers at once are still being studied. They do not replace your usual checks."],
      },
    ],
    evidence: [
      { claim: "Recommended screening for some cancers, such as cervical and colorectal cancer, can find cancer or precancer early.", level: "strong", basis: "guidance" },
      { claim: "Multi-cancer blood tests can replace recommended screening.", level: "not-established", basis: "guidance" },
    ],
    takeaways: [
      "Screening looks for cancer in people without symptoms; it has benefits and limits.",
      "Which tests you need depends on your age, history, and risks. Ask a clinician.",
      "Clinical trials test new treatments step by step with protections for participants.",
    ],
    references: [
      { title: "Cancer Screening", publisher: NCI, url: "https://www.cancer.gov/about-cancer/screening" },
      { title: "Clinical Trials Information for Patients and Caregivers", publisher: NCI, url: "https://www.cancer.gov/research/participate/clinical-trials" },
      { title: "BRCA Gene Changes: Cancer Risk and Genetic Testing", publisher: NCI, url: "https://www.cancer.gov/about-cancer/causes-prevention/genetics/brca-fact-sheet" },
    ],
  },
];
