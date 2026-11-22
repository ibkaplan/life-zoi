import type { Article } from "@/lib/encyclopedia/types";
import { NCCIH, PUBMED, SEED_AUTHOR, SEED_DATE, WHO } from "./shared";

const base = { publishedOn: SEED_DATE, updatedOn: SEED_DATE, draftedBy: SEED_AUTHOR };

export const bodyArticles: Article[] = [
  {
    ...base,
    slug: "healthy-eating-patterns",
    category: "nutrition",
    featured: true,
    title: "Healthy Eating Patterns: What Decades of Research Agree On",
    summary:
      "Nutrition headlines change every week, but the core advice from major health bodies has been remarkably steady. This article explains the eating pattern most guidance agrees on, and why whole patterns matter more than single foods.",
    easySummary:
      "Eat plenty of vegetables, fruit, beans, whole grains, and nuts. Have less salt, sugar, and highly processed foods. The overall pattern matters more than any single food.",
    keywords: ["nutrition", "healthy eating", "diet", "vegetables", "fruit", "whole grains", "fiber", "salt", "sugar", "Mediterranean diet", "processed food", "vitamins"],
    terms: ["fiber", "saturated-fat", "ultra-processed"],
    image: { illustration: "plate", alt: "Drawing of a plate divided into vegetables, whole grains, beans, and fruit." },
    sections: [
      {
        heading: "What is it?",
        standard: [
          "An eating pattern is the overall mix of foods and drinks a person has over time. Research has shifted from studying single nutrients to studying patterns, because foods are eaten together and their effects add up.",
        ],
        easy: ["An eating pattern is what you usually eat over weeks and months, not one meal."],
      },
      {
        heading: "What does science tell us?",
        standard: [
          "The World Health Organization advises eating plenty of fruit, vegetables, legumes such as lentils and beans, nuts, and whole grains; limiting free sugars and salt; and preferring unsaturated fats, found in fish, nuts, and oils such as olive oil, over saturated fats and avoiding industrial trans fats. National dietary guidelines in many countries give similar advice.",
          "Mediterranean-style eating, rich in vegetables, olive oil, nuts, fish, and legumes, has been studied in large observational studies and some trials. The PREDIMED trial in Spain was retracted in 2018 because of problems with how some participants were randomized, and then republished after reanalysis; its findings still suggested fewer cardiovascular events, but the episode is a reminder that even well-known studies have limits.",
        ],
        easy: [
          "Health experts agree: lots of vegetables, fruit, beans, whole grains, and nuts.",
          "Less sugar and salt. Choose oils like olive oil more often than butter.",
        ],
        points: ["Fiber from plants supports digestion and heart health.", "Sugary drinks are an easy place to cut free sugar."],
      },
      {
        heading: "Practical information for everyday life",
        standard: [
          "Try filling half the plate with vegetables and fruit, choosing whole grains, adding beans or lentils a few times a week, drinking water instead of sugary drinks, and cooking more often with simple ingredients. Small, steady changes usually last longer than strict diets. LifeZoi's Nutrition and Food & Wellness sections have practical recipes.",
        ],
        easy: ["Fill half your plate with vegetables and fruit. Drink water. Cook simple meals more often."],
      },
      {
        heading: "Risks, limitations, and unanswered questions",
        standard: [
          "Much nutrition research is observational, because long feeding trials are difficult, so many specific claims are uncertain. People with kidney disease, diabetes, food allergies, or other conditions may need tailored advice from a clinician or registered dietitian. Vitamin and mineral supplements help people with a deficiency but have not generally been shown to prevent chronic disease in well-nourished people.",
        ],
        easy: ["Some nutrition advice is still uncertain. People with health conditions may need advice made for them."],
      },
    ],
    evidence: [
      { claim: "Diets rich in vegetables, fruit, legumes, and whole grains, and low in salt and free sugars, support health.", level: "strong", basis: "guidance" },
      { claim: "Mediterranean-style eating is linked with fewer cardiovascular events.", level: "promising", basis: "randomized-trials" },
      { claim: "Vitamin supplements prevent chronic disease in well-nourished adults.", level: "limited", basis: "randomized-trials" },
    ],
    takeaways: [
      "The overall pattern matters more than any single food.",
      "More plants, whole grains, and unsaturated fats; less salt, sugar, and highly processed food.",
      "Get tailored advice if you have a medical condition.",
    ],
    references: [
      { title: "Healthy diet: fact sheet", publisher: WHO, url: "https://www.who.int/news-room/fact-sheets/detail/healthy-diet" },
      { title: "PREDIMED Study Retraction and Republication", publisher: "The Nutrition Source, Harvard T.H. Chan School of Public Health", url: "https://nutritionsource.hsph.harvard.edu/2018/06/22/predimed-retraction-republication", date: "2018-06-22" },
    ],
  },
  {
    ...base,
    slug: "brain-health-and-memory",
    category: "brain",
    featured: true,
    title: "Brain Health and Memory as We Age",
    summary:
      "Some changes in memory are a normal part of aging, while dementia is not. Research has identified risk factors for dementia that can be changed, from blood pressure to hearing loss. This article explains what is known and what remains uncertain.",
    easySummary:
      "Some forgetfulness is normal with age. Dementia is not normal. Looking after blood pressure, hearing, activity, and social life may help protect the brain.",
    keywords: ["brain", "memory", "dementia", "Alzheimer's", "cognitive health", "hearing loss", "blood pressure", "exercise", "social connection", "aging brain"],
    terms: ["dementia", "cognition", "neuron"],
    image: { illustration: "brain", alt: "Drawing of a brain with soft connecting lines, like branches, across its surface." },
    sections: [
      {
        heading: "What is it?",
        standard: [
          "Cognitive health is the ability to think clearly, learn, and remember. With age, many people take longer to learn new things or recall names, but they keep knowledge and skills. Dementia is different: it is a decline in memory and thinking severe enough to affect daily life. Alzheimer's disease is the most common cause, and blood vessel disease is another.",
        ],
        easy: ["Taking longer to remember a name can be normal. Dementia is when thinking problems make daily life hard."],
      },
      {
        heading: "What does science tell us?",
        standard: [
          "The 2024 Lancet Commission on dementia prevention, intervention and care (Livingston and colleagues) reviewed the evidence and identified fourteen potentially modifiable risk factors across life. They include less education in early life; hearing loss, high LDL cholesterol, depression, head injury, physical inactivity, diabetes, smoking, high blood pressure, obesity, and excess alcohol in midlife; and social isolation, air pollution, and untreated vision loss in later life. The Commission concluded that a substantial share of dementia cases might be prevented or delayed by addressing these factors, although much of the evidence is observational.",
          "Dementia risk also depends on age and genes that cannot be changed. Working on risk factors lowers the chance across a population; it does not guarantee that any one person will avoid dementia.",
        ],
        easy: [
          "A big 2024 review listed things linked with dementia that people can change, like high blood pressure, hearing loss, smoking, inactivity, and loneliness.",
          "These steps may lower the chance. They cannot promise it for one person.",
        ],
        points: ["Treat high blood pressure.", "Have hearing and vision checked, and use aids if needed.", "Stay active and socially connected."],
      },
      {
        heading: "Practical information for everyday life",
        standard: [
          "Regular physical activity, staying socially and mentally engaged, sleeping well, not smoking, limiting alcohol, and managing blood pressure, diabetes, and cholesterol are all good for the brain and the rest of the body. Talk with a clinician if memory problems are new, getting worse, or worrying you or your family; some causes, such as vitamin B12 deficiency, thyroid problems, or medicine side effects, are treatable.",
        ],
        easy: ["Move often. See friends. Sleep well. See a doctor if memory problems are new or getting worse."],
      },
      {
        heading: "Risks, limitations, and unanswered questions",
        standard: [
          "Brain-training games can improve skill at the games themselves, but evidence that they prevent dementia is limited. Supplements marketed for memory have not been shown to prevent cognitive decline. New medicines for early Alzheimer's disease are approved in some countries for specific patients; they modestly slow decline and carry risks, so decisions need a specialist.",
        ],
        easy: ["Brain games and memory supplements are not proven to prevent dementia."],
      },
    ],
    evidence: [
      { claim: "Several risk factors for dementia, such as high blood pressure and hearing loss, can be changed.", level: "promising", basis: "systematic-review" },
      { claim: "Brain-training games prevent dementia.", level: "limited", basis: "randomized-trials" },
      { claim: "Memory supplements prevent cognitive decline.", level: "not-established", basis: "randomized-trials" },
    ],
    takeaways: [
      "Normal aging can slow memory a little; dementia is not a normal part of aging.",
      "Heart-healthy habits, hearing care, and social connection are linked with lower dementia risk.",
      "See a clinician about new or worsening memory problems.",
    ],
    references: [
      { title: "Dementia prevention, intervention, and care: 2024 report of the Lancet standing Commission (Livingston et al.)", publisher: PUBMED, url: "https://pubmed.ncbi.nlm.nih.gov/39096926/", date: "2024" },
      { title: "Cognitive Aging: Progress in Understanding and Opportunities for Action", publisher: "National Academies of Sciences, Engineering, and Medicine", url: "https://www.nationalacademies.org/publications/21693", date: "2015" },
    ],
  },
  {
    ...base,
    slug: "heart-health-blood-pressure-cholesterol",
    category: "heart",
    featured: true,
    safety: ["heart"],
    title: "Heart Health: Blood Pressure, Cholesterol, and Daily Habits",
    summary:
      "Heart and blood vessel diseases are among the leading causes of death worldwide, yet many of their main risk factors can be measured and managed. This article explains blood pressure and cholesterol, the habits linked with a healthier heart, and how treatments such as statins came about.",
    easySummary:
      "High blood pressure and high cholesterol often have no symptoms, so get them checked. Not smoking, moving, eating well, and sleeping well help your heart.",
    keywords: ["heart", "heart disease", "cardiovascular", "blood pressure", "hypertension", "cholesterol", "LDL", "statins", "stroke", "heart attack", "circulation", "Life's Essential 8"],
    terms: ["blood-pressure", "ldl", "atherosclerosis", "statin"],
    image: { illustration: "heart", alt: "Drawing of a heart with arteries branching from it and a steady pulse line." },
    sections: [
      {
        heading: "What is it?",
        standard: [
          "The heart pumps blood through arteries to every organ. Blood pressure is the force of blood against artery walls. High blood pressure, or hypertension, strains the heart and blood vessels over years. Cholesterol is a fatty substance carried in the blood; high levels of LDL cholesterol contribute to plaque building up in artery walls, a process called atherosclerosis, which can lead to heart attacks and strokes.",
        ],
        easy: [
          "Blood pressure is how hard blood pushes on your blood vessels.",
          "Too much 'bad' cholesterol (LDL) can build up in blood vessels and block them.",
        ],
      },
      {
        heading: "Why does it matter?",
        standard: [
          "The World Health Organization reports that cardiovascular diseases are the leading cause of death globally. High blood pressure often has no symptoms, which is why it is called a silent condition, and many people do not know they have it.",
        ],
        easy: ["Heart disease is the top cause of death in the world. High blood pressure often has no signs."],
      },
      {
        heading: "What does science tell us?",
        standard: [
          "The American Heart Association summarizes heart health with \"Life's Essential 8\": eating better, being more active, not using nicotine, getting healthy sleep, managing weight, and keeping cholesterol, blood sugar, and blood pressure in healthy ranges. Large trials have shown that lowering high blood pressure and high LDL cholesterol with medicines reduces heart attacks and strokes in people at risk.",
          "Statins, which lower LDL cholesterol, trace back to Akira Endo's discovery of the first statin compound in the 1970s; he received the Lasker Award in 2008. Lovastatin was approved in the United States in 1987.",
        ],
        easy: [
          "Eight things help the heart: good food, activity, no smoking, good sleep, healthy weight, and healthy cholesterol, blood sugar, and blood pressure.",
          "Medicines that lower blood pressure and cholesterol help prevent heart attacks and strokes in people at risk.",
        ],
      },
      {
        heading: "Practical information for everyday life",
        standard: [
          "Have your blood pressure checked regularly and ask about cholesterol and blood sugar tests. Move most days, eat more plants and less salt, avoid tobacco, limit alcohol, and aim for regular sleep. If you have been prescribed medicine for blood pressure or cholesterol, keep taking it and talk with your clinician about any side effects rather than stopping on your own.",
        ],
        easy: ["Check your blood pressure. Move most days. Use less salt. Keep taking your heart medicines unless your doctor changes them."],
      },
      {
        heading: "Risks, limitations, and unanswered questions",
        standard: [
          "Risk is shaped by age, family history, and other conditions, so targets and treatments are personal. Some supplements promoted for heart health, such as many fish oil or vitamin products, have shown little or inconsistent benefit in trials.",
        ],
        easy: ["Targets are different for each person. Many heart supplements have not been shown to help."],
      },
    ],
    evidence: [
      { claim: "Lowering high blood pressure reduces heart attacks and strokes.", level: "strong", basis: "randomized-trials" },
      { claim: "Statins lower LDL cholesterol and cardiovascular events in people at risk.", level: "strong", basis: "randomized-trials" },
      { claim: "Over-the-counter heart supplements prevent heart disease.", level: "limited", basis: "randomized-trials" },
    ],
    takeaways: [
      "High blood pressure and cholesterol are often silent; get them checked.",
      "Daily habits and, when needed, medicines protect the heart.",
      "Chest pain or stroke signs are emergencies. Call your emergency number.",
    ],
    references: [
      { title: "Cardiovascular diseases (CVDs): fact sheet", publisher: WHO, url: "https://www.who.int/news-room/fact-sheets/detail/cardiovascular-diseases-(cvds)" },
      { title: "Life's Essential 8", publisher: "American Heart Association", url: "https://www.heart.org/en/healthy-living/healthy-lifestyle/lifes-essential-8" },
      { title: "Healthy Blood Pressure for Healthy Hearts: Small Steps To Take Control", publisher: "National Heart, Lung, and Blood Institute (NIH)", url: "https://www.nhlbi.nih.gov/resources/healthy-blood-pressure-healthy-hearts-small-steps-take-control-fact-sheet" },
      { title: "Statins for lowering LDL and decreasing heart attacks: Akira Endo", publisher: "Lasker Foundation", url: "https://laskerfoundation.org/winners/statins-for-lowering-ldl-and-decreasing-heart-attacks/", date: "2008" },
    ],
  },
  {
    ...base,
    slug: "gut-microbiome",
    category: "gut",
    title: "The Gut Microbiome: What We Know and What We Don't",
    summary:
      "The gut is home to trillions of bacteria and other microbes. Since the Human Microbiome Project began, research has exploded. This article explains what the microbiome does, what fiber and fermented foods may offer, and why most probiotic claims remain unproven.",
    easySummary:
      "Your gut has trillions of tiny living things. Fiber from plants feeds them. Many claims about probiotic pills are not proven yet.",
    keywords: ["gut", "microbiome", "bacteria", "probiotics", "prebiotics", "fiber", "fermented food", "digestion", "Human Microbiome Project", "C. difficile"],
    terms: ["microbiome", "probiotic", "prebiotic", "fiber"],
    image: { illustration: "gut", alt: "Drawing of the digestive tract with tiny round and rod-shaped microbes inside it." },
    sections: [
      {
        heading: "What is it?",
        standard: [
          "The microbiome is the community of bacteria, viruses, fungi, and other microbes living in and on the body, most of them in the large intestine. They help digest fiber, make some vitamins, train the immune system, and compete with harmful germs.",
        ],
        easy: ["Tiny living things in your gut help digest food and support your immune system."],
      },
      {
        heading: "What does science tell us?",
        standard: [
          "The U.S. Human Microbiome Project, launched by NIH in 2007, mapped the microbes of healthy people and published a major analysis in Nature in 2012 showing large differences between people and between body sites. Since then, studies have linked microbiome patterns with many conditions, but most of these links are associations, and it is often unclear whether microbes are a cause or a result.",
          "One clearly established use is fecal microbiota transplantation for recurrent Clostridioides difficile infection. For probiotic supplements, NCCIH notes that evidence of benefit is promising for a few uses, such as preventing some antibiotic-associated diarrhea, and lacking or weak for many others, and that products vary widely.",
        ],
        easy: [
          "A large NIH project mapped gut microbes. Everyone's mix is different.",
          "Many links to disease are found, but we often do not know which causes which.",
          "Probiotic pills may help a few problems, but not most claims.",
        ],
      },
      {
        heading: "Practical information for everyday life",
        standard: [
          "A varied diet with plenty of fiber from vegetables, fruit, legumes, and whole grains feeds gut microbes. Fermented foods such as yogurt, kefir, and sauerkraut are a reasonable part of a healthy diet for many people. LifeZoi's Nutrition section has a gut health lesson with food examples.",
        ],
        easy: ["Eat many kinds of plants with fiber. Yogurt and other fermented foods can be part of a healthy diet."],
      },
      {
        heading: "Risks, limitations, and unanswered questions",
        standard: [
          "Probiotics are generally safe for healthy people but can cause serious infections in people with weakened immune systems or critical illness. Home microbiome tests are not established tools for diagnosing disease.",
        ],
        easy: ["People with weak immune systems should ask a doctor before taking probiotics. Home gut tests are not proven."],
      },
    ],
    evidence: [
      { claim: "Fecal microbiota transplantation treats recurrent C. difficile infection.", level: "strong", basis: "randomized-trials" },
      { claim: "Some probiotics help prevent antibiotic-associated diarrhea.", level: "promising", basis: "systematic-review" },
      { claim: "Changing the microbiome prevents chronic diseases such as obesity or depression.", level: "not-established", basis: "observational" },
    ],
    takeaways: [
      "The gut microbiome is important and differs from person to person.",
      "A fiber-rich, varied diet is the best-supported way to support it.",
      "Most probiotic and microbiome test claims are not yet proven.",
    ],
    references: [
      { title: "Structure, function and diversity of the healthy human microbiome (Human Microbiome Project Consortium, Nature)", publisher: PUBMED, url: "https://pubmed.ncbi.nlm.nih.gov/22699609/", date: "2012" },
      { title: "Probiotics: Usefulness and Safety", publisher: NCCIH, url: "https://www.nccih.nih.gov/health/probiotics-usefulness-and-safety" },
    ],
  },
];
