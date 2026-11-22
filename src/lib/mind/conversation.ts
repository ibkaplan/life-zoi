import type { CrisisKind } from "@/lib/emotional-wellness/types";
import { articleBySlug, recommendArticles } from "@/lib/mind/articles";
import { instrumentById, type InstrumentId } from "@/lib/mind/assessments";
import { checkSafety, crisisMessage, DISTRESS_NOTE } from "@/lib/mind/safety";
import { detectTopic, topicById, TOPICS, type TopicId } from "@/lib/mind/topics";

/**
 * LifeZoi Mind's written companion: a rule-based conversation that runs entirely in
 * the browser. It does not call a model and nothing the person types leaves the device.
 *
 * What it can do: notice safety concerns first, recognize common situations (for
 * example criticism at work, grief, loneliness, sleep, worry), reflect feelings, ask
 * one follow-up question at a time, offer a balanced perspective, suggest practical
 * steps and exercises with a reason, and recommend encyclopedia articles.
 *
 * What it cannot do: understand everything a person writes, remember anything beyond
 * this conversation, or reason about situations it was not written for. When it does
 * not recognize something, it says so honestly and asks an open question.
 */

export type ReplyKind = "reply" | "crisis" | "boundary" | "closing" | "answer";

export type MindReply = {
  text: string;
  kind: ReplyKind;
  quickReplies: string[];
  exercises: string[];
  exerciseWhy: string | null;
  articles: string[];
  /** A softer safety note shown with an ordinary reply. */
  distress: boolean;
  crisisKinds: CrisisKind[];
};

export type ResultContext = { instrument: InstrumentId; band: string; total: number; suggestFollowUp: boolean; item9Positive: boolean };

export type ConversationState = {
  topic: TopicId | null;
  step: number;
  facet: string | null;
  /** Open follow-up questions already asked, so they are not repeated. */
  asked: string[];
  turns: number;
  /** Set when the person came from a questionnaire result. */
  result: ResultContext | null;
  resultStep: number;
  crisis: boolean;
  suggestedProfessional: boolean;
};

export function initialConversation(result: ResultContext | null = null): ConversationState {
  return { topic: null, step: 0, facet: null, asked: [], turns: 0, result, resultStep: 0, crisis: false, suggestedProfessional: false };
}

export const OPENING_TEXT =
  "Hello, I'm LifeZoi Mind. I'm here to listen and to help you think things through. You can tell me about your day, something that's bothering you, or a question about emotions. I'm an educational tool with written replies, not a therapist, and I can't diagnose anything. What's on your mind?";

export const OPENING_TOPICS = [
  "I had a difficult day at work",
  "I've been feeling anxious",
  "I can't sleep well",
  "I feel lonely",
  "I'm having problems in a relationship",
  "I'd like a relaxation exercise",
];

const PROFESSIONAL_NOTE =
  "Because this has been going on for a while and is affecting your daily life, it may really help to talk with a doctor or a mental health professional. You deserve support from someone trained to help.";

const OPEN_FOLLOW_UPS: { id: string; text: string }[] = [
  { id: "next", text: "What would you like to happen next?" },
  { id: "helped-before", text: "What has helped you, even a little, in a similar situation before?" },
  { id: "friend", text: "If a good friend told you this, what would you want to say to them?" },
  { id: "support", text: "Is there someone in your life you trust who you could talk to about this?" },
  { id: "values", text: "What matters most to you in how you handle this?" },
  { id: "body", text: "How are you feeling in your body right now, as we talk about it?" },
];

const EMOTION_REFLECTIONS: [RegExp, string][] = [
  [/\b(humiliat\w*|embarrass\w*|ashamed|shame)\b/i, "It sounds like you felt embarrassed, and that is a painful feeling."],
  [/\b(hurt|hurtful|wounded)\b/i, "It sounds like that really hurt."],
  [/\b(angry|furious|mad|rage|pissed)\b/i, "It sounds like you're feeling angry, which makes sense when something important to you is affected."],
  [/\b(unfair|not fair|injustice)\b/i, "It sounds like it felt unfair to you."],
  [/\b(scared|afraid|terrified|frightened|fear)\b/i, "It sounds like you're feeling scared."],
  [/\b(anxious|worried|nervous|on edge|uneasy)\b/i, "It sounds like there's a lot of worry here."],
  [/\b(sad|down|low|upset|crying|cried|tearful)\b/i, "It sounds like you're feeling sad."],
  [/\b(exhausted|tired|drained|worn out)\b/i, "It sounds like you're exhausted."],
  [/\b(overwhelmed|too much|can'?t cope)\b/i, "It sounds like it's all feeling like too much right now."],
  [/\b(lonely|alone|isolated)\b/i, "It sounds like you're feeling alone with this."],
  [/\b(guilty|guilt|regret)\b/i, "It sounds like you're carrying some guilt about it."],
  [/\b(confused|don'?t understand|mixed up)\b/i, "It sounds like it's confusing, and that's okay."],
  [/\b(frustrat\w*|annoyed|irritated)\b/i, "It sounds really frustrating."],
  [/\b(stupid|useless|failure|worthless)\b/i, "It sounds like you're being very hard on yourself."],
  [/\b(relieved|better|calmer|helps|helped)\b/i, "I'm glad that feels a little lighter."],
];

function reflect(message: string): string | null {
  for (const [pattern, text] of EMOTION_REFLECTIONS) if (pattern.test(message)) return text;
  return null;
}

const GREETING = /^(hi|hello|hey|good (morning|afternoon|evening)|hiya|howdy)[\s!.,]*$/i;
const THANKS_BYE = /^(thanks?|thank you|thx|ok(ay)? thanks?|bye|goodbye|good night|that'?s all|i'?m done|that helps?,? thank you|that helped)\b/i;
const UNSURE = /^(i )?(don'?t know|dunno|not sure|no idea|idk|maybe|hard to say)[\s.!?]*$/i;
const DECLINE = /^(no|nope|not (right )?now|not really|no thanks|i'?d rather not|skip)[\s.!?,]*$/i;
const ACCEPT = /^(yes|yeah|yep|sure|ok(ay)?|please|let'?s|yes,? let'?s explore|go ahead)\b/i;
const IDENTITY = /\b(are you (a )?(real|human|person|robot|bot|ai|therapist|psychologist|doctor)|who are you|what are you|is this (a )?(real person|human|ai))\b/i;
const DIAGNOSIS = /\b(do i have|am i (depressed|bipolar|autistic|crazy|mentally ill)|diagnose me|is (this|it) (depression|anxiety|bipolar|ptsd|adhd|ocd)|what disorder|what'?s wrong with me)\b/i;
const MEDICATION = /\b(stop|start|change|increase|decrease|skip|quit|come off|taper|double|adjust) (taking )?(my |the )?(medication|medicine|meds|pills|dose|antidepressants?|prescription|sertraline|zoloft|prozac|fluoxetine|lexapro|escitalopram|xanax|lithium)\b|\b(what dose|how many mg|should i take|which (medication|antidepressant))\b/i;
const EXERCISE_REQUEST = /\b(exercise|relax(ation)?|breathing|breathe|calm (me )?down|meditat\w*|grounding|help me (relax|calm))\b/i;
const QUESTION = /^(what|why|how|is it|is there|can|does|do|are)\b.+\?$|\b(what is|what are|why do (i|we|people)|how does|how do (i|we)|explain|tell me about)\b/i;
const RESENTMENT = /\b(i hate (him|her|them|my (boss|manager|partner|husband|wife|mother|father))|revenge|get back at|make (him|her|them) pay|teach (him|her|them) a lesson|they'?re all (idiots|stupid|against me)|everyone is against me|(he|she|they) (is|are) (evil|an idiot|stupid|a monster))\b/i;
const AGREEMENT = /\b(am i right|don'?t you (think|agree)|wasn'?t (that|it) (unfair|wrong)|right\?$|you agree|tell me i'?m right|was i wrong)\b/i;
const DURATION = /\b(for (weeks|months|years|a long time|ages)|every (single )?day|all the time|can'?t (work|function|get out of bed|eat)|stopped (eating|working|going out))\b/i;

function reply(text: string, kind: ReplyKind = "reply", extra: Partial<MindReply> = {}): MindReply {
  return { text, kind, quickReplies: [], exercises: [], exerciseWhy: null, articles: [], distress: false, crisisKinds: [], ...extra };
}

function pickFollowUp(state: ConversationState): { id: string; text: string } {
  const next = OPEN_FOLLOW_UPS.find((entry) => !state.asked.includes(entry.id));
  return next ?? OPEN_FOLLOW_UPS[state.turns % OPEN_FOLLOW_UPS.length];
}

const RESULT_QUESTIONS: Record<InstrumentId, string[]> = {
  gad7: [
    "What situations tend to make you feel anxious?",
    "How often do these worried thoughts come up, and how long do they usually stay?",
    "Do they affect your sleep?",
    "Do you find it difficult to relax, even when you have time to?",
    "Are there particular events or relationships contributing to your stress at the moment?",
  ],
  phq9: [
    "What has been weighing on you most over the last couple of weeks?",
    "Have you noticed changes in your sleep, energy, or appetite?",
    "Are there things you used to enjoy that feel harder to do now?",
    "Who do you have around you for support at the moment?",
  ],
};

/** The first message after a questionnaire. It never treats the score as a diagnosis. */
export function resultOpening(result: ResultContext): MindReply {
  const instrument = instrumentById(result.instrument);
  const subject = result.instrument === "gad7" ? "anxiety symptoms" : "depression symptoms";
  const level =
    result.band === "Minimal" ? `few ${subject}` : result.band === "Mild" ? `some ${subject}` : `elevated ${subject}`;
  const paragraphs = [
    `Your answers on the ${instrument?.shortName ?? "questionnaire"} indicate that you may be experiencing ${level} over the last two weeks. This questionnaire cannot diagnose a condition, and it cannot tell us what is causing how you feel, but it can help us understand what you have been experiencing.`,
  ];
  if (result.item9Positive) {
    paragraphs.push(
      "You also answered that you have had thoughts of being better off dead or of hurting yourself. Please keep the 988 Lifeline in mind: you can call or text 988 at any time, and call 911 if you might act on these thoughts. Please tell a doctor or someone you trust about this answer too.",
    );
  }
  if (result.suggestFollowUp) {
    paragraphs.push("At this level, the questionnaire's developers suggest talking with a doctor or mental health professional, who can look at the whole picture with you.");
  }
  paragraphs.push("Would you like to explore what may be contributing to these feelings?");
  return reply(paragraphs.join("\n\n"), "reply", {
    quickReplies: ["Yes, let's explore", "Not right now"],
    distress: result.item9Positive,
  });
}

function resultTurn(state: ConversationState, message: string): { reply: MindReply; state: ConversationState } | null {
  const result = state.result;
  if (!result) return null;
  const questions = RESULT_QUESTIONS[result.instrument];
  const instrument = instrumentById(result.instrument);
  if (state.resultStep === 0) {
    if (DECLINE.test(message)) {
      return {
        state: { ...state, result: null, resultStep: 0 },
        reply: reply(
          "That's completely fine. You don't have to explore anything you're not ready for. If you'd like, you can try a short exercise, read about what the questionnaire measures, or simply tell me about your day.",
          "reply",
          { exercises: instrument?.exercises.slice(0, 2) ?? [], articles: instrument?.articles.slice(0, 2) ?? [], quickReplies: ["Tell me about an exercise", "I'd like to talk about my day"] },
        ),
      };
    }
    if (!ACCEPT.test(message) && message.split(/\s+/).length > 4) {
      // They started talking about it directly: treat it as the first answer.
      return resultTurn({ ...state, resultStep: 1, asked: [...state.asked] }, message);
    }
    return { state: { ...state, resultStep: 1 }, reply: reply(`Thank you. Let's take it one question at a time, and you can skip any of them. ${questions[0]}`) };
  }
  const answered = state.resultStep; // 1-based index of the question just answered
  const reflection = UNSURE.test(message) ? "That's okay, it's not always easy to put into words." : (reflect(message) ?? "Thank you for sharing that.");
  if (answered < questions.length) {
    return { state: { ...state, resultStep: answered + 1 }, reply: reply(`${reflection} ${questions[answered]}`) };
  }
  // All questions answered: educational guidance, exercises, articles, and professional help where it fits.
  const topic = detectTopic(message) ?? (result.instrument === "gad7" ? topicById("anxiety") : topicById("low-mood"));
  const paragraphs = [
    `${reflection} Thank you for talking this through with me. From what you've shared, a few things may be worth trying, at your own pace and only if they feel right.`,
    result.instrument === "gad7"
      ? "When worry is frequent, it often helps to calm the body first, then sort worries into ones you can act on and ones you can't. Regular sleep, movement, and limiting caffeine can also make a difference."
      : "When mood is low, small, doable activities and staying in touch with people can gently help, even before you feel like it. Regular sleep, daylight, and movement support mood too.",
  ];
  if (result.suggestFollowUp || result.item9Positive) {
    paragraphs.push("Please also consider talking with a doctor or mental health professional. They can assess what is going on, which a questionnaire and an app cannot do, and effective help is available.");
  } else {
    paragraphs.push("If these feelings continue or get stronger, talking with a doctor or mental health professional is always a good option.");
  }
  return {
    state: { ...state, result: null, resultStep: 0, topic: topic.id, step: 4, suggestedProfessional: true },
    reply: reply(paragraphs.join("\n\n"), "reply", {
      exercises: instrument?.exercises.slice(0, 3) ?? [],
      exerciseWhy: topic.why,
      articles: instrument?.articles.slice(0, 2) ?? [],
      quickReplies: ["I'd like to keep talking", "Show me the 7-day plan"],
      distress: result.item9Positive,
    }),
  };
}

function encyclopediaAnswer(message: string): MindReply | null {
  const found = recommendArticles(message, 2);
  if (found.length === 0) return null;
  const main = found[0];
  const first = main.sections[0];
  const text = `Here is what the LifeZoi Psychology Encyclopedia says, in short. ${main.summary} ${first.paragraphs[0]}\n\nThe full article, "${main.title}", explains more and links to its sources. Is this connected to something you're going through? You're welcome to tell me about it.`;
  return reply(text, "answer", { articles: found.map((article) => article.slug), exercises: main.exercises.slice(0, 2) });
}

/**
 * One turn of the conversation. Safety comes first, then boundaries, then the topic flow.
 */
export function respond(state: ConversationState, rawMessage: string): { reply: MindReply; state: ConversationState } {
  const message = rawMessage.replace(/\s+/g, " ").trim();
  const next: ConversationState = { ...state, turns: state.turns + 1 };
  if (!message) return { state, reply: reply("Take your time. Write or say a few words when you're ready.") };

  // 1. Safety, before anything else.
  const safety = checkSafety(message);
  if (safety.level === "crisis") {
    const crisis = crisisMessage(safety.kinds);
    return {
      state: { ...next, crisis: true },
      reply: reply([crisis.title, ...crisis.paragraphs].join("\n\n"), "crisis", { crisisKinds: safety.kinds }),
    };
  }

  // 2. Professional boundaries.
  if (MEDICATION.test(message)) {
    return {
      state: next,
      reply: reply(
        "I can't advise on starting, stopping, or changing any medication, and it's important not to stop a prescribed medicine without talking with the person who prescribed it, because some need to be changed gradually. Your doctor or pharmacist can go through your questions with you. Would it help to talk about how you've been feeling, or to write down the questions you want to ask them?",
        "boundary",
        { quickReplies: ["Talk about how I've been feeling", "Help me prepare questions"] },
      ),
    };
  }
  if (DIAGNOSIS.test(message)) {
    return {
      state: next,
      reply: reply(
        "That's an understandable question, and I'm not able to answer it. I can't diagnose any condition, and neither can a questionnaire on its own. A doctor or licensed mental health professional can assess what's going on. What I can do is help you understand what you've been experiencing, so you feel more prepared to talk with them. What have you been noticing most?",
        "boundary",
        { articles: recommendArticles(message, 2).map((article) => article.slug) },
      ),
    };
  }
  if (IDENTITY.test(message)) {
    return {
      state: next,
      reply: reply(
        "I'm LifeZoi Mind, an educational wellness tool. I'm not a person, a therapist, or a doctor, and right now my replies are written in advance and chosen by rules, not generated by an AI model. I can listen, ask questions, suggest exercises, and share articles. For diagnosis, treatment, or a crisis, please reach out to a professional or call or text 988 in the United States. What would you like to talk about?",
        "boundary",
      ),
    };
  }

  // 3. A conversation that started from a questionnaire result.
  if (next.result) {
    const turn = resultTurn(next, message);
    if (turn) return withDistress(turn, safety.level === "distress");
  }

  // 4. Small talk and closings.
  if (GREETING.test(message)) {
    return { state: next, reply: reply("Hello. I'm glad you're here. How are you feeling today, and is there something on your mind you'd like to talk about?", "reply", { quickReplies: OPENING_TOPICS.slice(0, 4) }) };
  }
  if (THANKS_BYE.test(message)) {
    return {
      state: { ...next, topic: null, step: 0, facet: null },
      reply: reply(
        "Thank you for talking with me. I hope something here was useful. Be gentle with yourself today, and if you can, share how you're doing with someone you trust. You're welcome back any time.",
        "closing",
      ),
    };
  }

  // 5. Requests for an exercise or for information.
  if (EXERCISE_REQUEST.test(message) && !detectTopic(message)) {
    return {
      state: next,
      reply: reply(
        "Of course. Here are a few exercises you could try. Each one can be read aloud step by step, and you can choose how long it lasts. There's no need to finish one if it doesn't feel right. If you tell me what's making it hard to relax, I can suggest the one that fits best.",
        "reply",
        { exercises: ["guided-relaxation", "paced-breathing", "progressive-muscle-relaxation", "grounding-54321"], exerciseWhy: "Relaxation and slow breathing help the body settle. Muscle relaxation releases tension. Grounding is useful when worry pulls you into the future." },
      ),
    };
  }
  if (QUESTION.test(message) && !next.topic) {
    const answer = encyclopediaAnswer(message);
    if (answer) return withDistress({ state: next, reply: answer }, safety.level === "distress");
  }

  // 6. Balanced responses that do not take sides against other people.
  if (RESENTMENT.test(message)) {
    return withDistress(
      {
        state: { ...next, step: Math.max(next.step, 2) },
        reply: reply(
          "It sounds like you're really hurt and angry, and those feelings make sense when someone has treated you badly. I'm not going to tell you how to feel. At the same time, holding on to resentment or acting to get even usually ends up costing us more than the other person. What would help you feel more at peace with this, or more in control of what happens next?",
        ),
      },
      safety.level === "distress",
    );
  }
  if (AGREEMENT.test(message)) {
    return withDistress(
      {
        state: next,
        reply: reply(
          "I can hear why it feels that way to you, and your feelings about it are real. I only know your side, though, so I can't fairly say who was right. What I can do is help you look at it from a few angles. If the other person described this moment, what do you think they would say?",
        ),
      },
      safety.level === "distress",
    );
  }

  // 7. Topic flow.
  const detected = detectTopic(message);
  let current = next.topic ? topicById(next.topic) : null;
  if (detected && (!current || (detected.id !== current.id && next.step >= 3))) {
    current = detected;
    next.topic = detected.id;
    next.step = 0;
    next.facet = null;
  }

  if (!current) {
    const reflection = reflect(message);
    const follow = UNSURE.test(message)
      ? "That's okay. Sometimes it's hard to know where to start. Would it help to begin with how you're feeling right now, or with something that happened today?"
      : `${reflection ?? "Thank you for telling me."} I want to make sure I understand. Could you tell me a little more about what happened, and how it's been affecting you?`;
    return withDistress(
      {
        state: next,
        reply: reply(follow, "reply", {
          quickReplies: UNSURE.test(message) ? ["How I'm feeling right now", "Something that happened today"] : [],
          articles: recommendArticles(message, 1).map((article) => article.slug),
        }),
      },
      safety.level === "distress",
    );
  }

  const professional = !next.suggestedProfessional && DURATION.test(message);
  if (professional) next.suggestedProfessional = true;
  const addProfessional = (text: string) => (professional ? `${text}\n\n${PROFESSIONAL_NOTE}` : text);

  if (next.step === 0) {
    next.step = 1;
    return withDistress(
      { state: next, reply: reply(addProfessional(current.open), "reply", { quickReplies: current.facets.map((facet) => facet.label).concat(current.facets.length ? ["Something else"] : []) }) },
      safety.level === "distress",
    );
  }

  if (next.step === 1) {
    const facet = current.facets.find((entry) => entry.label === message || entry.match.test(message));
    next.facet = facet?.id ?? "other";
    next.step = 2;
    const part = facet ?? current.otherFacet;
    const lead = UNSURE.test(message) ? "That's okay, it can be hard to pin down." : facet ? "" : (reflect(message) ?? "");
    return withDistress(
      { state: next, reply: reply(addProfessional([lead, part.reply, part.question].filter(Boolean).join(" "))) },
      safety.level === "distress",
    );
  }

  if (next.step === 2) {
    next.step = 3;
    const lead = reflect(message) ?? "Thank you, that helps me understand.";
    return withDistress({ state: next, reply: reply(addProfessional(`${lead} ${current.perspective}`)) }, safety.level === "distress");
  }

  if (next.step === 3) {
    next.step = 4;
    const lead = UNSURE.test(message) ? "That's alright. You don't need to have it all worked out." : (reflect(message) ?? "That makes sense.");
    return withDistress(
      {
        state: next,
        reply: reply(addProfessional(`${lead} ${current.nextSteps}`), "reply", {
          exercises: [...current.exercises],
          exerciseWhy: current.why,
          articles: [...current.articles],
          quickReplies: ["I'd like to keep talking", "That helps, thank you"],
        }),
      },
      safety.level === "distress",
    );
  }

  // Step 4 and later: open, non-repeating follow-ups that encourage real-world support.
  const follow = pickFollowUp(next);
  next.asked = [...next.asked, follow.id];
  const lead = UNSURE.test(message) ? "That's okay." : (reflect(message) ?? "I hear you.");
  const articles = recommendArticles(message, 1, [...current.articles]).map((article) => article.slug);
  return withDistress(
    { state: next, reply: reply(addProfessional(`${lead} ${follow.text}`), "reply", { articles }) },
    safety.level === "distress",
  );
}

function withDistress(turn: { reply: MindReply; state: ConversationState }, distress: boolean) {
  if (!distress) return turn;
  return { state: turn.state, reply: { ...turn.reply, distress: true, text: `${turn.reply.text}\n\n${DISTRESS_NOTE}` } };
}

/** Plain text for reading a reply aloud. */
export function spokenReply(value: MindReply): string {
  const titles = value.articles.map((slug) => articleBySlug(slug)?.title).filter(Boolean);
  return titles.length ? `${value.text} You might like to read: ${titles.join(", and ")}.` : value.text;
}

export const KNOWN_TOPICS = TOPICS.map((topic) => topic.id);
