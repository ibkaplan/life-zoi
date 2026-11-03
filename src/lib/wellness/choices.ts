import type { ChoiceTopic, SourcedNote } from "@/lib/wellness/types";

function note(
  text: string,
  sourceIds: string[],
  evidence: SourcedNote["evidence"],
  evidenceNote: string,
): SourcedNote {
  return { text, sourceIds, evidence, evidenceNote };
}

export const CHOICE_CATEGORIES = [
  "Nutrition and eating habits",
  "Digestion and meal timing",
  "Sugar and blood glucose",
  "Heart and metabolic health",
  "Sleep and recovery",
  "Movement and muscle health",
  "Stress and emotional well-being",
  "Longevity and healthy aging",
  "Personal motivation and habit formation",
] as const;

export const choiceTopics: ChoiceTopic[] = [
  {
    slug: "late-night",
    title: "Late-night eating and overeating",
    categories: ["Nutrition and eating habits", "Digestion and meal timing"],
    why: note(
      "Evening eating is often a mix of hunger, habit, and the place you are in. Learning to tell those apart is a skill. It does not require a clock time that fits every person.",
      ["nih-habits"],
      "established",
      "NIH’s habit page is the source for noticing triggers. lifeZoi does not add a universal stop-eating time.",
    ),
    body: note(
      "A first portion, a pause, and a plate you can see are ways to notice the meal. If heartburn or regurgitation is a problem, NIDDK says stomach contents can come back into the esophagus, and a doctor may recommend finishing meals 2 to 3 hours before lying down. People without that problem do not need that rule. Comfort after a meal is your own note.",
      ["nih-habits", "niddk-gerd"],
      "established",
      "The reflux description and the 2-to-3-hour suggestion are NIDDK guidance for GER and GERD, last reviewed July 2020. They are not a diagnosis that you have reflux.",
    ),
    research: [
      note(
        "NIH says repeated actions can become automatic and that the first step is noticing the trigger. A plan with a specific action makes the next evening easier to repeat.",
        ["nih-habits"],
        "established",
        "Published habit guidance from NIH News in Health, March 2018.",
      ),
      note(
        "NIDDK’s eating advice for reflux symptoms is lifestyle guidance a doctor may recommend. It is established patient education, not a new theory.",
        ["niddk-gerd"],
        "established",
        "Last reviewed July 2020.",
      ),
      note(
        "lifeZoi did not find a public page in this review that justifies one stop-eating hour for every adult, a detox evening routine, or a promise about metabolism. Those ideas are not taught here.",
        ["niddk-gerd"],
        "belief",
        "A belief or product claim is labeled as such. The NIDDK link is the closest verified guidance, and it is conditional.",
      ),
    ],
    actions: [
      "Name whether an evening snack is hunger, habit, or both.",
      "Put the food on a plate or in a bowl.",
      "Pause before a second portion. You may still take it.",
      "If reflux symptoms bother you, ask a clinician about meal timing instead of copying a rule from the internet.",
      "Keep one cue that made the evening easier.",
    ],
    actionSourceIds: ["nih-habits", "niddk-gerd"],
    challengeId: "late-night",
  },
  {
    slug: "sugar",
    title: "Why we crave sugar",
    categories: ["Sugar and blood glucose", "Nutrition and eating habits"],
    why: note(
      "Sweet foods and drinks are easy to repeat, and a cue can be a place, a feeling, or a habit. Curiosity works better than shame. One dessert does not define you.",
      ["nih-habits", "cdc-rethink-drink"],
      "established",
      "CDC describes sugary drinks as a leading source of added sugars. NIH describes triggers. Neither page shames a person.",
    ),
    body: note(
      "CDC says added sugars are sugars added in processing or at home, and that they are not the same as sugars naturally in milk, fruit, and vegetables. Sugary drinks include regular soda, fruit drinks, sports drinks, energy drinks, sweetened coffee, and sweetened tea. CDC says adults who often drink sugary drinks are more likely to have problems that include weight gain, type 2 diabetes, and heart disease. That is a population statement, not a diagnosis for you. lifeZoi does not give a blood glucose target. A clinician sets personal targets and medication.",
      ["cdc-rethink-drink"],
      "observational",
      "CDC’s “more likely” wording is an association reported for people who often drink sugary drinks. The advice to choose water more often is the practical public guidance on the same page.",
    ),
    research: [
      note(
        "Choosing water, reading the label, and keeping sugary drinks out of easy reach are CDC’s practical steps.",
        ["cdc-rethink-drink", "cdc-water"],
        "established",
        "Updated March 5, 2026.",
      ),
      note(
        "A wish for something sweet can also be your own pattern. Write it as experience. lifeZoi will not call it a disorder.",
        ["nih-habits"],
        "individual",
        "NIH supplies the trigger skill. The meaning of your craving is yours.",
      ),
    ],
    actions: [
      "Read added sugars on one label.",
      "Notice one sugary drink without throwing it away.",
      "Try water or whole fruit at one moment.",
      "Write hunger, habit, or a feeling next to the wish for something sweet.",
      "Pick one smaller step to repeat. Skip the shame.",
    ],
    actionSourceIds: ["cdc-rethink-drink", "nih-habits"],
    challengeId: "sugar",
  },
  {
    slug: "fiber",
    title: "Why the body needs fiber",
    categories: ["Nutrition and eating habits", "Digestion and meal timing"],
    why: note(
      "MedlinePlus says fiber adds bulk, helps prevent constipation, and can help you feel full faster. It is a plant substance. You do not need a special product to begin.",
      ["medlineplus-fiber"],
      "established",
      "Encyclopedia guidance, editorial update September 15, 2026.",
    ),
    body: note(
      "Soluble fiber attracts water and is found in foods such as oat bran, barley, nuts, seeds, beans, lentils, and some fruits and vegetables. Insoluble fiber does not dissolve and is found in foods such as wheat bran, vegetables, and whole grains. Most high-fiber foods contain both. MedlinePlus says soluble-fiber research has shown lower cholesterol. It also says a low-fiber diet has been linked with several conditions. Add fiber slowly. Fluids help it pass. A fluid limit or a prescribed diet overrides this page.",
      ["medlineplus-fiber", "medlineplus-water"],
      "established",
      "The cholesterol sentence is a research finding as MedlinePlus states it. The “has been linked” sentence is an observational association. Neither is a personal prediction.",
    ),
    research: [
      note(
        "MedlinePlus says increasing fiber too quickly can cause gas, bloating, and cramps, and that the discomfort often eases as the gut adjusts.",
        ["medlineplus-fiber"],
        "established",
        "A safety point, not a reason to avoid fiber entirely.",
      ),
    ],
    actions: [
      "Name one fiber food you already eat.",
      "Add a small amount, not a large new bowl.",
      "Drink fluids you are allowed to drink.",
      "Keep peels on when you can, after washing.",
      "Stay at a comfortable amount for several days.",
    ],
    actionSourceIds: ["medlineplus-fiber", "fda-produce"],
    challengeId: "fiber",
  },
  {
    slug: "sitting",
    title: "Sitting too much",
    categories: ["Movement and muscle health", "Heart and metabolic health"],
    why: note(
      "Long sitting is common. CDC says some physical activity is better than none, and that adults who sit less and do any moderate activity gain some benefit. A break can be small.",
      ["cdc-adult-activity"],
      "established",
      "CDC adult activity page, December 20, 2023.",
    ),
    body: note(
      "Muscles, heart, and mobility are supported by moving in ways you can do. CDC’s older-adult page adds balance work and says people who cannot meet the full recommendations should be as active as their abilities and conditions allow. A chair version counts as practice. Your worth does not depend on how far you walk.",
      ["cdc-adult-activity", "cdc-older-activity"],
      "established",
      "Established activity guidance. It is not a judgment of disability or illness.",
    ),
    research: [
      note(
        "CDC describes weekly aerobic activity and 2 days of muscle-strengthening as a public picture, and says the time can be broken up.",
        ["cdc-adult-activity"],
        "established",
        "A population recommendation, not a test you pass or fail today.",
      ),
    ],
    actions: [
      "Stand, shift, or circle your ankles once during a long sit.",
      "Attach the break to the end of a call or a show.",
      "Take a short walk if that is available.",
      "Use a chair stand only if it feels safe.",
      "Keep one break cue for next week.",
    ],
    actionSourceIds: ["cdc-adult-activity", "cdc-older-activity", "nih-habits"],
    challengeId: "sitting",
  },
  {
    slug: "sleep",
    title: "Not enough sleep",
    categories: ["Sleep and recovery", "Heart and metabolic health"],
    why: note(
      "NHLBI says sleep is a basic need and that experts recommend adults sleep 7 to 9 hours a night. Adults who sleep less than 7 hours may have more health issues than those who sleep 7 or more. Sleeping more than 9 hours is not automatically harmful. Talk with a doctor if sleep seems too short or too long.",
      ["nhlbi-sleep-amount"],
      "established",
      "NHLBI, last updated March 24, 2022. The range is expert guidance, not a personal order.",
    ),
    body: note(
      "NHLBI says sleep deficiency can make it harder to focus, learn, and react, and can leave people frustrated, cranky, or worried. It links sleep deficiency with chronic problems that include heart disease, high blood pressure, diabetes, stroke, obesity, and depression. Those links are not a diagnosis. lifeZoi did not use a page that measured appetite hormones, so a change in hunger belongs in your own notes until you discuss it with a clinician.",
      ["nhlbi-sleep-deficiency"],
      "observational",
      "NHLBI says sleep deficiency “is linked” with those conditions. That is an association in public education, not proof that one short night caused a disease.",
    ),
    research: [
      note(
        "A repeatable wake time and a short wind-down are practice ideas. NIMH lists a sleep routine as one way to cope with stress.",
        ["nimh-stress", "nhlbi-sleep-amount"],
        "established",
        "Routine guidance. Not a promise of recovery or metabolic change.",
      ),
      note(
        "If you notice hunger on a short night, write it as your experience.",
        ["nih-habits"],
        "individual",
        "Individual experience is kept separate from the NHLBI statements above.",
      ),
    ],
    actions: [
      "Choose a wake time you could keep most days.",
      "Keep a few quiet minutes before bed.",
      "Notice focus and mood without judging them.",
      "If reflux is a problem, ask a clinician about evening meals rather than inventing a stop time.",
      "Talk with a doctor if sleep stays poor.",
    ],
    actionSourceIds: ["nhlbi-sleep-amount", "nhlbi-sleep-deficiency", "nimh-stress", "niddk-gerd"],
    challengeId: "sleep",
  },
  {
    slug: "muscles",
    title: "Strong muscles with age",
    categories: ["Movement and muscle health", "Longevity and healthy aging"],
    why: note(
      "CDC says physical activity can prevent or delay many health problems that seem to come with age, and can help muscles stay strong enough for daily tasks. Independence is about what you want to keep doing. It is not a moral score, and disability does not reduce a person’s worth.",
      ["cdc-older-activity"],
      "established",
      "CDC older-adult page, December 4, 2025. lifeZoi does not promise longevity or a number of extra years.",
    ),
    body: note(
      "Adults 65 and older are advised to include aerobic activity, muscle-strengthening on 2 or more days, and balance activities, if they can. Examples on the page include standing from a chair and walking heel to toe. If those do not fit your condition, CDC says to be as active as your abilities allow. A beginner change is a slower version or a skipped move. A clinician or physical therapist can match exercise to a condition. lifeZoi cannot.",
      ["cdc-older-activity", "cdc-adult-activity"],
      "established",
      "Established guidance with an explicit exception for ability and health conditions.",
    ),
    research: [
      note(
        "There is no exercise on this page that is safe for every diagnosis. That limit is part of the guidance, not a failure.",
        ["cdc-older-activity"],
        "established",
        "CDC states the abilities-and-conditions limit directly.",
      ),
    ],
    actions: [
      "Read the weekly picture once. You do not have to meet it today.",
      "Try one slow chair stand only if it feels safe.",
      "Hold a counter for any balance step.",
      "Rest on days between strength practice.",
      "Write one question for a clinician if pain or a condition changes the plan.",
    ],
    actionSourceIds: ["cdc-older-activity", "cdc-adult-activity"],
    challengeId: "muscles",
  },
  {
    slug: "stress",
    title: "Stress and emotional eating",
    categories: ["Stress and emotional well-being", "Nutrition and eating habits"],
    why: note(
      "NIMH describes stress as the body and mind responding to an external cause. Food can sit next to that response for some people. Noticing it is allowed. Shame is not required, and this page is not treatment.",
      ["nimh-stress"],
      "established",
      "NIMH fact sheet, NIH Publication No. 20-MH-8125. The information is in the public domain. Images from the sheet are not copied.",
    ),
    body: note(
      "NIMH says stress and anxiety can affect sleep and the body, and that coping steps include a journal, relaxation or breathing, movement, regular meals, a sleep routine, less excess caffeine, and support from other people. If stress will not ease or gets in the way of life, NIMH says to talk with a professional. Therapy and medication are decisions for that professional. lifeZoi will not start, stop, or change a medicine. If you are in immediate distress in the United States, call or text 988.",
      ["nimh-stress", "samhsa-988"],
      "established",
      "SAMHSA’s 988 page, updated September 26, 2025, describes 24/7 support by call, text, or chat. That wording is for the United States.",
    ),
    research: [
      note(
        "Eating when a feeling is strong may be your pattern. Record it as individual experience. lifeZoi is not diagnosing binge eating or a mood disorder.",
        ["nih-habits"],
        "individual",
        "NIH’s trigger skill is the method. The meaning is yours.",
      ),
    ],
    actions: [
      "Name one stressor in a few words.",
      "Notice whether food showed up beside the feeling.",
      "Try one NIMH option: a meal, a walk, breathing, or a call.",
      "Keep a sleep cue if nights are part of the stress.",
      "Contact a professional if coping is not enough. Use 988 in the United States for immediate distress.",
    ],
    actionSourceIds: ["nimh-stress", "samhsa-988", "cdc-adult-activity"],
    challengeId: "stress-eating",
  },
  {
    slug: "tobacco-alcohol",
    title: "Smoking and excessive alcohol",
    categories: ["Heart and metabolic health", "Longevity and healthy aging"],
    why: note(
      "CDC says cigarette smoking harms nearly every organ and that quitting has health benefits at any age. NIAAA says drinking too much, on one occasion or over time, can affect the brain, heart, liver, pancreas, immune system, and other parts of the body. You can read this without being shamed. Cutting down or quitting is a choice, and help exists.",
      ["cdc-smoking", "niaaa-alcohol-body"],
      "established",
      "CDC page dated September 17, 2024. NIAAA’s body-systems page was opened with no separate page date. lifeZoi does not repeat death counts here. The linked pages carry the full statements.",
    ),
    body: note(
      "CDC says quitting lowers the chance of early death and of smoking-related diseases, and that counseling and medication can help people quit. lifeZoi does not prescribe that medication or tell you to change a dose. NIAAA says there is strong scientific consensus that alcohol can cause several cancers, and it describes heart, liver, and other risks. The March 26, 2021 Dietary Guidelines fact sheet says that if people drink, drinking less is better, and that alcohol is not safe in pregnancy. A personal quota is still a clinician’s conversation, not a number lifeZoi assigns.",
      ["cdc-smoking", "niaaa-alcohol-body", "dga-eating-routine"],
      "established",
      "These are agency statements. NIAAA’s cancer section quotes the National Cancer Institute and calls the consensus strong. lifeZoi does not add a percentage the page also contains.",
    ),
    research: [
      note(
        "Free public starting points are Smokefree.gov, from the National Cancer Institute, and NIAAA’s health hub, which lists treatment information and Rethinking Drinking. Smokefree text programs may have phone-carrier charges. lifeZoi does not enroll you.",
        ["smokefree", "niaaa-alcohol-hub"],
        "established",
        "The tools are public. Signing up is optional and happens on those sites, not here.",
      ),
    ],
    actions: [
      "Read one public page only as far as you want.",
      "Write one cue, or write that this topic is not yours.",
      "Look at Smokefree.gov if you want quit-planning tools.",
      "Look at NIAAA’s hub if you want alcohol information or treatment listings.",
      "Ask a clinician before any medication change. There is no shame in asking.",
    ],
    actionSourceIds: ["cdc-smoking", "smokefree", "niaaa-alcohol-hub"],
    challengeId: "tobacco-alcohol",
  },
];

export function choiceTopic(slug: string) {
  return choiceTopics.find((item) => item.slug === slug) ?? null;
}

export const ACID_BASE_NOTE: SourcedNote = note(
  "MedlinePlus says electrolytes help balance the body’s acid and base level, and that bicarbonate helps maintain that balance and move carbon dioxide through the bloodstream. Kidney, heart, or liver problems are among the reasons fluid balance can be upset. lifeZoi does not teach eating plans that claim to alkalize the blood or cleanse the body. Those claims are not the science on this page. A clinician evaluates acid-base problems.",
  ["medlineplus-fluids"],
  "belief",
  "The bicarbonate and electrolyte statements are MedlinePlus education. The rejection of alkalizing and cleansing diets is lifeZoi’s limit: those product claims are beliefs, not findings on the page that was opened.",
);
