/**
 * LifeZoi's own self-reflection questions. They were written for LifeZoi Mind and are
 * NOT validated psychological tests. They give no score, band, or label. They only
 * show which statements the person said feel true often, and point to exercises and
 * articles about that topic.
 */

export const REFLECTION_LABEL = "Educational self-reflection. Written by LifeZoi, not a clinically validated test.";

export const REFLECTION_SCALE = ["Rarely", "Sometimes", "Often"] as const;

export type Reflection = {
  id: string;
  title: string;
  intro: string;
  statements: readonly string[];
  exercises: readonly string[];
  articles: readonly string[];
};

export const REFLECTIONS: readonly Reflection[] = [
  {
    id: "stress",
    title: "Everyday stress",
    intro: "A few statements about how stress has felt this month. This is not the Perceived Stress Scale.",
    statements: [
      "I feel there is more to do than I can manage.",
      "Small problems upset me more than usual.",
      "I find it hard to switch off at the end of the day.",
      "I notice stress in my body, such as tight shoulders, headaches, or a racing heart.",
      "I have time for things that help me recharge.",
    ],
    exercises: ["paced-breathing", "progressive-muscle-relaxation", "stress-plan"],
    articles: ["anxiety-and-stress", "mindfulness"],
  },
  {
    id: "sleep",
    title: "Sleep and rest",
    intro: "A few statements about your sleep this month. This is not the Insomnia Severity Index and cannot tell you whether you have a sleep disorder.",
    statements: [
      "It takes me a long time to fall asleep.",
      "I wake up during the night and find it hard to get back to sleep.",
      "I wake up feeling unrested.",
      "Worries keep me awake.",
      "I use screens in bed shortly before sleep.",
    ],
    exercises: ["sleep-wind-down", "body-scan", "worry-time"],
    articles: ["sleep-and-mental-health"],
  },
  {
    id: "self-esteem",
    title: "Self-esteem and confidence",
    intro: "A few statements about how you see yourself lately.",
    statements: [
      "I am harder on myself than I would be on a friend.",
      "I discount my successes as luck.",
      "I worry a lot about what others think of me.",
      "I can name things I do well.",
      "I avoid trying new things in case I fail.",
    ],
    exercises: ["self-compassion", "thought-reframing", "gratitude"],
    articles: ["self-esteem-and-confidence", "cognitive-behavioral-therapy"],
  },
  {
    id: "emotional-regulation",
    title: "Handling strong feelings",
    intro: "A few statements about what happens when emotions run high.",
    statements: [
      "When I am upset, it takes me a long time to calm down.",
      "I say or do things in the moment that I regret later.",
      "I find it hard to name what I am feeling.",
      "I push feelings away rather than notice them.",
      "I have a few things I can do that reliably help me settle.",
    ],
    exercises: ["name-the-feeling", "paced-breathing", "grounding-54321"],
    articles: ["understanding-emotions", "emotional-intelligence", "how-the-brain-processes-emotions"],
  },
  {
    id: "burnout",
    title: "Work stress and burnout",
    intro: "A few statements about work or caregiving demands. Burnout is described by the World Health Organization as an occupational phenomenon, not a medical condition.",
    statements: [
      "I feel drained at the end of most working days.",
      "I feel more cynical or distant about my work than I used to.",
      "I feel less effective than I used to.",
      "I find it hard to take breaks, even when I could.",
      "Work thoughts follow me into evenings and weekends.",
    ],
    exercises: ["stress-plan", "boundary-script", "behavioral-activation"],
    articles: ["anxiety-and-stress", "motivation-and-personal-growth"],
  },
  {
    id: "relationships",
    title: "Relationship stress",
    intro: "A few statements about a close relationship that matters to you.",
    statements: [
      "Disagreements with this person often turn into arguments.",
      "I hold back what I really think to avoid conflict.",
      "I feel listened to by this person.",
      "Old hurts come back up when we disagree.",
      "We can repair things after a difficult conversation.",
    ],
    exercises: ["i-statements", "boundary-script", "name-the-feeling"],
    articles: ["relationships-and-communication", "childhood-and-family"],
  },
  {
    id: "boundaries",
    title: "Personal boundaries",
    intro: "A few statements about saying yes and no.",
    statements: [
      "I say yes when I want to say no.",
      "I feel guilty when I put my own needs first.",
      "I feel responsible for other people's feelings.",
      "I can tell people calmly what I need.",
      "I feel resentful after helping others.",
    ],
    exercises: ["boundary-script", "i-statements", "self-compassion"],
    articles: ["relationships-and-communication", "self-esteem-and-confidence"],
  },
  {
    id: "wellbeing",
    title: "General emotional well-being",
    intro: "A few statements about the last two weeks overall.",
    statements: [
      "I have felt cheerful or in good spirits.",
      "I have felt calm and relaxed.",
      "I have had energy for things I care about.",
      "I have felt connected to other people.",
      "I have had something to look forward to.",
    ],
    exercises: ["gratitude", "behavioral-activation", "mindful-moment"],
    articles: ["understanding-emotions", "loneliness", "psychology-of-aging"],
  },
];

export function reflectionById(id: string): Reflection | null {
  return REFLECTIONS.find((entry) => entry.id === id) ?? null;
}

/** Statements that describe something helpful, so "Often" is good news, not a concern. */
const HELPFUL = new Set([
  "I have time for things that help me recharge.",
  "I can name things I do well.",
  "I have a few things I can do that reliably help me settle.",
  "I feel listened to by this person.",
  "We can repair things after a difficult conversation.",
  "I can tell people calmly what I need.",
  "I have felt cheerful or in good spirits.",
  "I have felt calm and relaxed.",
  "I have had energy for things I care about.",
  "I have felt connected to other people.",
  "I have had something to look forward to.",
]);

export function isHelpfulStatement(statement: string): boolean {
  return HELPFUL.has(statement);
}

export type ReflectionSummary = { strengths: string[]; worthAttention: string[]; complete: boolean };

/** No total and no label: only which statements stand out. */
export function summarizeReflection(reflection: Reflection, answers: readonly (number | null)[]): ReflectionSummary {
  const strengths: string[] = [];
  const worthAttention: string[] = [];
  let complete = answers.length === reflection.statements.length;
  reflection.statements.forEach((statement, index) => {
    const answer = answers[index];
    if (answer === null || answer === undefined) {
      complete = false;
      return;
    }
    const helpful = isHelpfulStatement(statement);
    if (helpful && answer === 2) strengths.push(statement);
    if (helpful && answer === 0) worthAttention.push(statement);
    if (!helpful && answer === 2) worthAttention.push(statement);
  });
  return { strengths, worthAttention, complete };
}
