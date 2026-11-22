import type { EvidenceLevel } from "@/lib/mind/evidence";

/**
 * Guided exercises for LifeZoi Mind. Each step can be read aloud, followed by a quiet
 * pause. The person chooses a length; longer lengths give more quiet time between the
 * same steps, and repeat the core steps where that makes sense. Nothing is required.
 */

export type ExerciseCategory = "calm the body" | "mindfulness" | "thinking" | "feelings" | "relationships" | "sleep" | "mood" | "stress";

export type ExerciseStep = { text: string; pause: number; repeat?: boolean };

export type MindExercise = {
  id: string;
  title: string;
  category: ExerciseCategory;
  summary: string;
  why: string;
  evidence: EvidenceLevel;
  /** Minutes the person can choose. */
  lengths: readonly number[];
  steps: readonly ExerciseStep[];
  /** A written prompt for exercises that work better on paper. The text is not saved. */
  writing?: readonly string[];
  caution?: string;
  sourceUrl?: string;
  sourceLabel?: string;
};

export const MIND_EXERCISES: readonly MindExercise[] = [
  {
    id: "paced-breathing",
    title: "Slow, paced breathing",
    category: "calm the body",
    summary: "Breathe a little slower than usual, with a longer out-breath.",
    why: "Slowing your breathing and lengthening the out-breath can help the body shift out of the fight-or-flight response. It is a simple way to take the edge off before you think a problem through.",
    evidence: "evidence-informed",
    lengths: [2, 5, 10],
    steps: [
      { text: "Sit or lie in a comfortable position. Let your shoulders drop.", pause: 5 },
      { text: "Breathe in gently through your nose for a count of four.", pause: 4, repeat: true },
      { text: "Now breathe out slowly, for a count of six. There is no need to force anything.", pause: 6, repeat: true },
      { text: "Keep this rhythm on your own. In for four, out for six.", pause: 30, repeat: true },
      { text: "Let your breathing return to normal. Notice how your body feels now.", pause: 8 },
    ],
    caution: "If you feel dizzy or light-headed, stop and breathe normally.",
    sourceLabel: "NIH National Center for Complementary and Integrative Health: Relaxation techniques",
    sourceUrl: "https://www.nccih.nih.gov/health/relaxation-techniques-what-you-need-to-know",
  },
  {
    id: "guided-relaxation",
    title: "Five-minute guided relaxation",
    category: "calm the body",
    summary: "A short, gentle settling of the body and attention.",
    why: "Relaxation practices give the mind a break from going over a problem and help the body release tension that builds up with stress.",
    evidence: "evidence-informed",
    lengths: [3, 5, 10],
    steps: [
      { text: "Let's try a short relaxation exercise. Find a comfortable position.", pause: 5 },
      { text: "Relax your shoulders. Let your hands rest.", pause: 6 },
      { text: "Notice your breathing. There is no need to change it or force anything.", pause: 12, repeat: true },
      { text: "Soften your forehead, your jaw, and the muscles around your eyes.", pause: 10, repeat: true },
      { text: "If your mind wanders, that is normal. Gently come back to the feeling of your breath.", pause: 20, repeat: true },
      { text: "Picture a place where you feel safe and calm. Notice what you can see and hear there.", pause: 25, repeat: true },
      { text: "When you are ready, wiggle your fingers and toes, and slowly open your eyes.", pause: 6 },
    ],
    sourceLabel: "NIH National Center for Complementary and Integrative Health: Relaxation techniques",
    sourceUrl: "https://www.nccih.nih.gov/health/relaxation-techniques-what-you-need-to-know",
  },
  {
    id: "progressive-muscle-relaxation",
    title: "Progressive muscle relaxation",
    category: "calm the body",
    summary: "Gently tense and then release one muscle group at a time.",
    why: "Tensing and then releasing muscles helps you notice the difference between tension and relaxation, which makes it easier to let go of tension you carry without noticing.",
    evidence: "evidence-informed",
    lengths: [5, 10, 15],
    steps: [
      { text: "Sit or lie comfortably. Tense each area gently, never to the point of pain.", pause: 5 },
      { text: "Curl your hands into fists. Hold for five seconds.", pause: 5 },
      { text: "Release, and notice the hands softening.", pause: 12 },
      { text: "Lift your shoulders toward your ears. Hold.", pause: 5 },
      { text: "Let them drop. Feel the release.", pause: 12 },
      { text: "Scrunch the muscles of your face. Hold.", pause: 5 },
      { text: "Release, and let your face become smooth.", pause: 12 },
      { text: "Press your feet into the floor and tighten your legs. Hold.", pause: 5 },
      { text: "Let go. Notice your legs becoming heavy and relaxed.", pause: 12 },
      { text: "Take a slow breath and notice your whole body.", pause: 15, repeat: true },
    ],
    caution: "Skip any area that is injured or painful.",
    sourceLabel: "NIH National Center for Complementary and Integrative Health: Relaxation techniques",
    sourceUrl: "https://www.nccih.nih.gov/health/relaxation-techniques-what-you-need-to-know",
  },
  {
    id: "body-scan",
    title: "Body scan",
    category: "mindfulness",
    summary: "Move your attention slowly through the body, without judging what you find.",
    why: "A body scan trains attention and helps you notice sensations kindly, which can make strong feelings easier to sit with and can help before sleep.",
    evidence: "evidence-informed",
    lengths: [5, 10, 15],
    steps: [
      { text: "Lie down or sit comfortably. Close your eyes if that feels right.", pause: 6 },
      { text: "Bring your attention to your feet. Notice any warmth, coolness, or pressure.", pause: 20, repeat: true },
      { text: "Move up to your legs and hips. Just notice. Nothing needs to change.", pause: 20, repeat: true },
      { text: "Notice your belly and chest rising and falling with your breath.", pause: 20, repeat: true },
      { text: "Bring attention to your hands, arms, and shoulders.", pause: 20, repeat: true },
      { text: "Notice your neck, face, and head.", pause: 20, repeat: true },
      { text: "Now feel the body as a whole, breathing.", pause: 20 },
    ],
  },
  {
    id: "mindful-moment",
    title: "A mindful minute",
    category: "mindfulness",
    summary: "Pause and notice this moment with curiosity.",
    why: "Brief mindful pauses help you step out of autopilot. Research on mindfulness-based programs shows benefits for stress for many people, though results vary.",
    evidence: "evidence-informed",
    lengths: [2, 5],
    steps: [
      { text: "Pause what you are doing. Feel your feet on the floor.", pause: 8 },
      { text: "Take one slow breath and notice it from beginning to end.", pause: 10, repeat: true },
      { text: "Notice three sounds around you, near or far.", pause: 15, repeat: true },
      { text: "Notice what you are feeling right now, and name it quietly to yourself.", pause: 15 },
      { text: "Choose what you want to do next, with intention.", pause: 6 },
    ],
    sourceLabel: "NIH National Center for Complementary and Integrative Health: Meditation and mindfulness",
    sourceUrl: "https://www.nccih.nih.gov/health/meditation-and-mindfulness-effectiveness-and-safety",
  },
  {
    id: "grounding-54321",
    title: "5-4-3-2-1 grounding",
    category: "feelings",
    summary: "Use your five senses to come back to the present.",
    why: "When worry or panic pulls you into the future, naming what your senses notice right now can bring your attention back to the room you are in.",
    evidence: "evidence-informed",
    lengths: [2, 5],
    steps: [
      { text: "Look around. Name five things you can see.", pause: 20 },
      { text: "Name four things you can feel, such as your clothes, the chair, or the air.", pause: 18 },
      { text: "Name three things you can hear.", pause: 15 },
      { text: "Name two things you can smell, or two smells you like.", pause: 12 },
      { text: "Name one thing you can taste, or one kind thing you can say to yourself.", pause: 12 },
      { text: "Take a slow breath. You are here, in this moment.", pause: 8 },
    ],
  },
  {
    id: "name-the-feeling",
    title: "Name the feeling",
    category: "feelings",
    summary: "Put a word to what you feel, and notice where it sits in the body.",
    why: "Putting feelings into words, sometimes called affect labeling, has been linked in studies to lower emotional intensity. It is a first step in handling feelings rather than being carried by them.",
    evidence: "emerging",
    lengths: [3, 5],
    steps: [
      { text: "Pause and ask yourself: what am I feeling right now?", pause: 12 },
      { text: "Try to find a precise word. Not just bad, but perhaps hurt, embarrassed, worried, disappointed, or angry.", pause: 15 },
      { text: "Notice where you feel it in your body. Your chest, stomach, throat, or shoulders?", pause: 15 },
      { text: "Say to yourself: I am noticing a feeling of, and add the word.", pause: 10 },
      { text: "Ask: what does this feeling need from me right now? Rest, comfort, action, or time?", pause: 20 },
    ],
    writing: ["The feeling I notice is…", "I feel it in my…", "What it may need is…"],
  },
  {
    id: "thought-reframing",
    title: "Reframe a difficult thought",
    category: "thinking",
    summary: "A CBT-inspired way to look at a thought from more than one side.",
    why: "Cognitive behavioral therapy, one of the most researched talking therapies, teaches that thoughts are not always facts. Looking at the evidence for and against a thought can open up a more balanced view. This self-help exercise is inspired by CBT; it is not therapy.",
    evidence: "evidence-informed",
    lengths: [5, 10],
    steps: [
      { text: "Write down the thought that is bothering you, in a single sentence.", pause: 30 },
      { text: "How strongly do you believe it right now, from 0 to 10?", pause: 10 },
      { text: "What facts support this thought?", pause: 40 },
      { text: "What facts do not fit with it, or show another side?", pause: 40 },
      { text: "What would you say to a good friend who had this thought?", pause: 30 },
      { text: "Write a more balanced version of the thought.", pause: 40 },
      { text: "How strongly do you believe the original thought now, from 0 to 10?", pause: 10 },
    ],
    writing: ["The thought:", "Facts that support it:", "Facts that don't fit:", "What I'd tell a friend:", "A more balanced thought:"],
    sourceLabel: "American Psychological Association: What is cognitive behavioral therapy?",
    sourceUrl: "https://www.apa.org/ptsd-guideline/patients-and-families/cognitive-behavioral",
  },
  {
    id: "thinking-traps",
    title: "Spot unhelpful thinking patterns",
    category: "thinking",
    summary: "Notice common thinking traps, such as all-or-nothing thinking or mind reading.",
    why: "Everyone falls into thinking traps sometimes. Learning their names makes them easier to catch, which is a core skill taught in CBT.",
    evidence: "evidence-informed",
    lengths: [5, 10],
    steps: [
      { text: "Think of a recent moment that upset you, and the thought you had.", pause: 20 },
      { text: "All-or-nothing thinking: am I seeing this as total success or total failure?", pause: 15 },
      { text: "Mind reading: am I assuming I know what someone else is thinking?", pause: 15 },
      { text: "Catastrophizing: am I jumping to the worst possible outcome?", pause: 15 },
      { text: "Overgeneralizing: am I using words like always or never?", pause: 15 },
      { text: "Should statements: am I holding myself or others to rigid rules?", pause: 15 },
      { text: "If you found a trap, try rewording the thought in a fairer way.", pause: 30 },
    ],
    writing: ["The thought:", "The trap I notice:", "A fairer way to say it:"],
  },
  {
    id: "journaling",
    title: "Expressive journaling",
    category: "feelings",
    summary: "Write freely about what happened and how you feel.",
    why: "Studies of expressive writing suggest that writing about thoughts and feelings can help some people make sense of difficult events. Effects vary and are usually modest.",
    evidence: "emerging",
    lengths: [5, 10, 15],
    steps: [
      { text: "Find a quiet moment. Write about what happened, in your own words.", pause: 60, repeat: true },
      { text: "Now write about how it made you feel, and why it matters to you.", pause: 60, repeat: true },
      { text: "Finally, write about anything you have learned, or what you would like to happen next.", pause: 60 },
    ],
    writing: ["What happened:", "How I feel about it:", "What I'd like next:"],
    caution: "If writing brings up feelings that are too strong, stop and do something calming. You can come back later.",
  },
  {
    id: "gratitude",
    title: "Three good things",
    category: "mood",
    summary: "Notice three things that went well today, however small.",
    why: "Our attention naturally sticks to problems. Writing down what went well trains attention toward what is also true. Studies of gratitude practices show small benefits for mood for many people.",
    evidence: "emerging",
    lengths: [3, 5],
    steps: [
      { text: "Think back over today, or yesterday.", pause: 10 },
      { text: "Name one thing that went well, even something small, like a warm drink or a kind word.", pause: 20 },
      { text: "Name a second good thing.", pause: 20 },
      { text: "Name a third good thing.", pause: 20 },
      { text: "For one of them, ask: what part did I play in making it happen?", pause: 20 },
    ],
    writing: ["Good thing 1:", "Good thing 2:", "Good thing 3:"],
  },
  {
    id: "self-compassion",
    title: "A self-compassion break",
    category: "feelings",
    summary: "Treat yourself with the kindness you would offer a friend.",
    why: "Being harsh with ourselves tends to add to distress. Self-compassion practices encourage noticing pain, remembering that others struggle too, and offering yourself kindness.",
    evidence: "emerging",
    lengths: [3, 5],
    steps: [
      { text: "Think of something that is hard for you right now.", pause: 12 },
      { text: "Say to yourself: this is a moment of difficulty. It hurts.", pause: 10 },
      { text: "Remind yourself: other people feel this way too. I am not alone in this.", pause: 10 },
      { text: "Place a hand on your chest if that feels comfortable.", pause: 8 },
      { text: "Ask: what would I say to a friend going through this? Say it to yourself.", pause: 20 },
    ],
  },
  {
    id: "behavioral-activation",
    title: "One small, doable activity",
    category: "mood",
    summary: "Plan one small activity that gives a sense of pleasure or achievement.",
    why: "When mood is low we tend to do less, which can lower mood further. Behavioral activation, a well-researched approach, breaks that cycle by scheduling small, meaningful activities.",
    evidence: "evidence-informed",
    lengths: [3, 5],
    steps: [
      { text: "Think of one small activity you used to enjoy, or that would give a little sense of achievement.", pause: 20 },
      { text: "Make it smaller. A ten-minute walk, one phone call, or one drawer to tidy.", pause: 15 },
      { text: "Choose when you will do it today or tomorrow.", pause: 12 },
      { text: "Afterwards, notice how you felt before and after, even if the change is small.", pause: 10 },
    ],
    writing: ["My small activity:", "When I'll do it:"],
  },
  {
    id: "worry-time",
    title: "Scheduled worry time",
    category: "thinking",
    summary: "Postpone worries to a set 15-minute window.",
    why: "Setting aside a short, regular time for worries helps some people feel less taken over by worry during the rest of the day. It is a technique used in CBT for worry.",
    evidence: "evidence-informed",
    lengths: [3, 5],
    steps: [
      { text: "Choose a daily time for worries, not right before bed. For example, 5 pm.", pause: 12 },
      { text: "When a worry comes up during the day, write it down in a word or two.", pause: 10 },
      { text: "Tell yourself: I will think about this at my worry time.", pause: 8 },
      { text: "At worry time, look at the list. For each worry, ask: is there something I can do?", pause: 20 },
      { text: "If yes, choose one small action. If not, practice letting it go for now.", pause: 15 },
    ],
  },
  {
    id: "stress-plan",
    title: "Make a stress plan",
    category: "stress",
    summary: "Sort what you can control from what you cannot, and pick one next step.",
    why: "Stress feels bigger when everything blurs together. Separating what is in your control from what is not helps you put energy where it can make a difference.",
    evidence: "evidence-informed",
    lengths: [5, 10],
    steps: [
      { text: "List the things that are causing stress right now.", pause: 40 },
      { text: "Mark the ones you can influence, even a little.", pause: 20 },
      { text: "For one of them, choose the smallest useful next step.", pause: 20 },
      { text: "For the ones you cannot control, name one way to look after yourself while they continue.", pause: 25 },
      { text: "Choose one person you could ask for help or simply tell how you are doing.", pause: 15 },
    ],
    writing: ["What's causing stress:", "What I can influence:", "My next small step:", "Who I could talk to:"],
    sourceLabel: "NIMH: I'm So Stressed Out! fact sheet",
    sourceUrl: "https://www.nimh.nih.gov/health/publications/so-stressed-out-fact-sheet",
  },
  {
    id: "boundary-script",
    title: "Practice a healthy boundary",
    category: "relationships",
    summary: "Prepare a calm, clear way to say what you need.",
    why: "Boundaries protect relationships as well as you. Preparing words in advance makes it easier to stay calm and kind when the moment comes.",
    evidence: "evidence-informed",
    lengths: [3, 5],
    steps: [
      { text: "Think of a situation where you would like to set a limit.", pause: 15 },
      { text: "Name what you need, in one sentence. For example: I need to finish work by six.", pause: 20 },
      { text: "Try a kind, clear script: I care about this, and I can't do it this time.", pause: 15 },
      { text: "Practice saying it out loud in a calm voice.", pause: 20 },
      { text: "Expect some discomfort. Feeling guilty does not mean the boundary is wrong.", pause: 10 },
    ],
    writing: ["The situation:", "What I need:", "What I'll say:"],
  },
  {
    id: "i-statements",
    title: "Calm conversation with an I-statement",
    category: "relationships",
    summary: "Plan how to raise something difficult without blaming.",
    why: "Describing your own experience, rather than accusing, makes the other person less likely to get defensive and more likely to listen.",
    evidence: "evidence-informed",
    lengths: [5],
    steps: [
      { text: "Choose a calm time and a private place for the conversation.", pause: 10 },
      { text: "Describe what happened, without labels. For example: in today's meeting, when my work was discussed in front of the team.", pause: 20 },
      { text: "Say how you felt: I felt embarrassed and unsure what to change.", pause: 15 },
      { text: "Say what would help: it would help me to get feedback in private.", pause: 15 },
      { text: "Then listen to their side, and look for one point you can agree on.", pause: 15 },
    ],
    writing: ["What happened:", "How I felt:", "What would help:"],
  },
  {
    id: "sleep-wind-down",
    title: "Sleep wind-down routine",
    category: "sleep",
    summary: "A calm half hour that tells your body it is time to rest.",
    why: "A regular, relaxing routine before bed and a consistent wake time are standard sleep-hygiene advice. Relaxation can make it easier to fall asleep, although it does not treat a sleep disorder.",
    evidence: "evidence-informed",
    lengths: [5, 10],
    steps: [
      { text: "Dim the lights and put your phone or tablet away, or on night mode.", pause: 10 },
      { text: "Write down anything on your mind for tomorrow, so it can wait on paper.", pause: 30 },
      { text: "Get comfortable in bed. Let your body feel heavy.", pause: 15 },
      { text: "Breathe in for four, and out slowly for six.", pause: 30, repeat: true },
      { text: "Let each part of your body soften, from your feet to your face.", pause: 40, repeat: true },
      { text: "If you are still awake later and feel restless, it is fine to get up for a quiet, dim activity, and return when sleepy.", pause: 10 },
    ],
    caution: "If poor sleep lasts for weeks or affects your days, talk with a doctor. Ongoing insomnia has effective treatments.",
    sourceLabel: "CDC: About sleep",
    sourceUrl: "https://www.cdc.gov/sleep/about/index.html",
  },
];

export function exerciseById(id: string): MindExercise | null {
  return MIND_EXERCISES.find((entry) => entry.id === id) ?? null;
}

export type TimedStep = { text: string; pause: number };

/** Builds the steps for the chosen length by stretching pauses and repeating core steps. */
export function planExercise(exercise: MindExercise, minutes: number): TimedStep[] {
  const target = Math.max(1, minutes) * 60;
  const base = exercise.steps.map((step) => ({ text: step.text, pause: step.pause }));
  // About 5 seconds to read each step aloud.
  const spoken = (list: TimedStep[]) => list.reduce((sum, step) => sum + step.pause + 5, 0);
  const steps = [...base];
  const repeatable = exercise.steps.filter((step) => step.repeat);
  let guard = 0;
  while (repeatable.length > 0 && spoken(steps) < target * 0.75 && guard < 40) {
    const lastIndex = steps.length - 1;
    for (const step of repeatable) {
      if (spoken(steps) >= target * 0.75) break;
      steps.splice(lastIndex, 0, { text: step.text, pause: step.pause });
    }
    guard += 1;
  }
  const total = spoken(steps);
  const factor = Math.min(3, Math.max(0.6, target / total));
  return steps.map((step) => ({ text: step.text, pause: Math.max(3, Math.round(step.pause * factor)) }));
}

export function plannedSeconds(steps: readonly TimedStep[]): number {
  return steps.reduce((sum, step) => sum + step.pause + 5, 0);
}
