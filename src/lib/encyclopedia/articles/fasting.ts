import type { Article } from "@/lib/encyclopedia/types";
import { PUBMED, SEED_AUTHOR, SEED_DATE, nobel } from "./shared";

const base = { publishedOn: SEED_DATE, updatedOn: SEED_DATE, draftedBy: SEED_AUTHOR, safety: ["fasting", "diabetes"] as Article["safety"] };

const NIDDK = "National Institute of Diabetes and Digestive and Kidney Diseases (NIH)";

export const fastingArticles: Article[] = [
  {
    ...base,
    slug: "what-happens-when-you-fast",
    category: "fasting-metabolism",
    featured: true,
    title: "What Happens in Your Body When You Fast",
    summary:
      "Between meals and overnight, the body shifts from using the sugar in your blood to using stored energy. This article explains metabolism, insulin, blood glucose, insulin resistance, and autophagy in plain words, and separates what is known in people from what has only been seen in animals.",
    easySummary:
      "When you do not eat for a while, your body uses stored energy. A hormone called insulin goes down. Most of what you read about 'cell cleaning' (autophagy) comes from animal studies.",
    keywords: ["fasting", "metabolism", "insulin", "blood glucose", "blood sugar", "insulin resistance", "prediabetes", "autophagy", "ketones", "glycogen", "diabetes"],
    terms: ["metabolism", "insulin", "glucose", "insulin-resistance", "autophagy", "ketones", "glycogen"],
    image: { illustration: "clock", alt: "Drawing of a clock face with a plate on one side and a resting moon on the other, showing eating and fasting hours." },
    sections: [
      {
        heading: "What is it?",
        standard: [
          "Metabolism is the set of chemical processes that turn food into energy and building blocks for the body. After a meal, carbohydrates are broken down into glucose, a sugar that enters the blood. The pancreas releases insulin, a hormone that helps cells take in glucose and tells the liver to store extra glucose as glycogen.",
          "When you go without food for several hours, insulin levels fall. The liver releases stored glucose to keep blood glucose steady, and the body uses more fat for fuel. After a longer time without food, the liver also makes ketones, another fuel the brain and muscles can use. In healthy people, blood glucose usually stays within a normal range during an overnight fast because these systems balance it.",
        ],
        easy: [
          "Food becomes sugar (glucose) in your blood. Insulin helps your cells use it.",
          "When you do not eat for a few hours, insulin goes down. Your body uses stored sugar and fat instead.",
        ],
      },
      {
        heading: "What is insulin resistance?",
        standard: [
          "Insulin resistance means the muscles, fat, and liver do not respond well to insulin, so the pancreas has to make more to keep blood glucose in range. Over time, the pancreas may not keep up, and blood glucose rises into the prediabetes or type 2 diabetes range. The National Institute of Diabetes and Digestive and Kidney Diseases explains that excess weight, especially around the waist, and physical inactivity are major contributors, and that being active and losing weight if needed can improve how the body responds to insulin.",
        ],
        easy: [
          "Insulin resistance means your body does not answer insulin well. Blood sugar can slowly rise.",
          "Moving more and, if needed, losing some weight can help.",
        ],
      },
      {
        heading: "What is autophagy?",
        standard: [
          "Autophagy, meaning \"self-eating\", is the process cells use to break down and recycle worn-out parts. Yoshinori Ohsumi received the 2016 Nobel Prize for discovering the genes and mechanisms of autophagy, first in yeast. Fasting and nutrient shortage strongly switch on autophagy in yeast, cells, and animals.",
          "In people, autophagy is hard to measure, and it is not known how many hours of fasting are needed to change it meaningfully in human organs, or whether that change improves health or slows aging. Claims that a particular fast \"triggers autophagy\" and \"reverses aging\" go beyond the evidence.",
        ],
        easy: [
          "Autophagy is how cells recycle old parts. Its discovery won a Nobel Prize in 2016.",
          "Most of what we know comes from yeast and animals. It is not proven that fasting slows aging in people.",
        ],
      },
      {
        heading: "Risks, limitations, and unanswered questions",
        standard: [
          "For people who take insulin or some diabetes tablets, skipping meals can cause dangerously low blood sugar. Long fasts can cause dizziness, dehydration, and loss of muscle, which matters more as people age. These are reasons to plan any change with a clinician.",
        ],
        easy: ["If you take diabetes medicine, skipping meals can make your blood sugar too low. Talk with your doctor first."],
      },
    ],
    evidence: [
      { claim: "Insulin levels fall and the body uses more stored fat during fasting.", level: "strong", basis: "guidance" },
      { claim: "Physical activity and weight loss, when needed, improve insulin resistance.", level: "strong", basis: "guidance" },
      { claim: "Fasting switches on autophagy in yeast, cells, and animals.", level: "strong", basis: "animal-lab" },
      { claim: "A specific fast boosts autophagy enough in people to slow aging.", level: "not-established", basis: "animal-lab" },
    ],
    takeaways: [
      "During a fast insulin falls and the body uses stored glucose and fat.",
      "Insulin resistance is common and improves with activity and weight loss when needed.",
      "Autophagy is real and important, but its link to fasting and aging in people is not established.",
    ],
    references: [
      { title: "Insulin Resistance & Prediabetes", publisher: NIDDK, url: "https://www.niddk.nih.gov/health-information/diabetes/overview/what-is-diabetes/prediabetes-insulin-resistance" },
      nobel("medicine", 2016),
      { title: "Effects of Intermittent Fasting on Health, Aging, and Disease (de Cabo and Mattson, N Engl J Med)", publisher: PUBMED, url: "https://pubmed.ncbi.nlm.nih.gov/31881139/", date: "2019" },
    ],
  },
  {
    ...base,
    slug: "intermittent-fasting-research",
    category: "fasting-metabolism",
    alsoIn: ["nutrition"],
    title: "Intermittent Fasting and Time-Restricted Eating: What Research Shows",
    summary:
      "Intermittent fasting is popular, and early animal research was striking. Randomized trials in people show a more modest picture: for weight loss it often works about as well as eating less in other ways. This article sorts the evidence by type of study.",
    easySummary:
      "Intermittent fasting means eating in a time window or fasting on some days. In people, it helps weight loss about as much as other ways of eating less. It is not right for everyone.",
    keywords: ["intermittent fasting", "time-restricted eating", "16:8", "5:2", "alternate-day fasting", "weight loss", "calorie restriction", "clinical trial"],
    terms: ["intermittent-fasting", "time-restricted-eating", "randomized-trial", "observational-study"],
    image: { illustration: "plate", alt: "Drawing of a plate with vegetables, grains, and beans beside a small clock." },
    sections: [
      {
        heading: "What is it?",
        standard: [
          "Intermittent fasting is a general name for eating patterns that alternate eating and not eating. Time-restricted eating limits food to a daily window, for example eight hours. Other patterns include eating very little on two days a week, or fasting every other day.",
        ],
        easy: ["You eat only in some hours of the day, or you eat very little on some days of the week."],
      },
      {
        heading: "What does science tell us?",
        standard: [
          "Different kinds of studies answer different questions. Laboratory and animal studies show that fasting changes metabolism, stress responses, and in some animals lifespan. Observational studies in people can find links but cannot prove cause. Randomized trials, in which people are assigned to one approach or another, give the clearest answers for people.",
          "A 2019 review in the New England Journal of Medicine by de Cabo and Mattson summarized promising effects in animals and early human studies. Later randomized trials were more cautious. A 2020 trial in JAMA Internal Medicine (Lowe and colleagues) found that eating within an 8-hour window without other guidance did not lead to more weight loss than eating at usual times. A 2022 trial in the New England Journal of Medicine (Liu and colleagues) found that when both groups ate the same reduced calories, adding time-restricted eating did not produce extra weight loss over a year.",
          "In short, intermittent fasting can help some people eat less, and for them it may be a workable approach. It has not been shown to be better than other ways of reducing calories, and its long-term effects on disease and aging in people are not established.",
        ],
        easy: [
          "Animal studies looked very hopeful.",
          "In studies with people, fasting helped weight loss about the same as simply eating less.",
          "We do not yet know if it prevents disease or slows aging in people.",
        ],
        points: ["Animal and lab research: promising, not proof for people.", "Human randomized trials: similar weight loss to other calorie-reduced diets."],
      },
      {
        heading: "Practical information for everyday life",
        standard: [
          "If you are healthy and want to try an eating window, regular meals with plenty of vegetables, fruit, whole grains, beans, and enough protein matter more than the clock. Drink water, and stop if you feel unwell. Anyone with diabetes, a history of eating disorders, pregnancy or breastfeeding, low body weight, or frailty should talk with a clinician first.",
        ],
        easy: ["What you eat matters more than when. Drink water. Stop if you feel unwell. Ask your doctor first if you have a health condition."],
      },
      {
        heading: "Risks, limitations, and unanswered questions",
        standard: [
          "Reported problems include hunger, headaches, irritability, and in people on some medicines, low blood sugar. Many trials are short and include mainly middle-aged adults, so results may not apply to older adults or people with illnesses. Long-term studies are still needed.",
        ],
        easy: ["Some people get hungry, tired, or get headaches. Most studies were short."],
      },
    ],
    evidence: [
      { claim: "Intermittent fasting leads to weight loss similar to other calorie-reduced diets.", level: "strong", basis: "randomized-trials" },
      { claim: "Time-restricted eating gives extra weight loss beyond the same calorie reduction.", level: "limited", basis: "randomized-trials" },
      { claim: "Intermittent fasting extends human lifespan.", level: "not-established", basis: "animal-lab" },
    ],
    takeaways: [
      "Intermittent fasting is one way to eat less, not a magic method.",
      "Human trials show weight loss similar to other diets that reduce calories.",
      "It is not appropriate for everyone. Ask a clinician first if you have a medical condition.",
    ],
    references: [
      { title: "Effects of Intermittent Fasting on Health, Aging, and Disease (de Cabo and Mattson, N Engl J Med)", publisher: PUBMED, url: "https://pubmed.ncbi.nlm.nih.gov/31881139/", date: "2019" },
      { title: "Effects of Time-Restricted Eating on Weight Loss and Other Metabolic Parameters (Lowe et al., JAMA Intern Med)", publisher: PUBMED, url: "https://pubmed.ncbi.nlm.nih.gov/32986097/", date: "2020" },
      { title: "Calorie Restriction with or without Time-Restricted Eating in Weight Loss (Liu et al., N Engl J Med)", publisher: PUBMED, url: "https://pubmed.ncbi.nlm.nih.gov/35443107/", date: "2022" },
      { title: "5 questions about intermittent fasting", publisher: "NIH MedlinePlus Magazine", url: "https://magazine.medlineplus.gov/article/5-questions-about-intermittent-fasting" },
    ],
  },
];
