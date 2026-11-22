import type { EvidenceLevel } from "@/lib/mind/evidence";

/**
 * LifeZoi Psychology Encyclopedia.
 *
 * Every reference below is a real public page or a PubMed record. Links were checked
 * when the article was written (see `reviewed`). To add new research: add a section with
 * its own `evidence` level and a reference, update `reviewed`, and keep claims
 * qualitative unless the number is in the cited source.
 */

export type ArticleReference = { label: string; url: string };

export type ArticleSection = { heading: string; paragraphs: readonly string[]; evidence?: EvidenceLevel };

export type ArticleMotif = "heart" | "brain" | "wave" | "cloud" | "people" | "sprout" | "mirror" | "moon" | "sun" | "path" | "spark" | "home" | "lightbulb" | "leaf" | "book";

export type Article = {
  slug: string;
  title: string;
  category: string;
  summary: string;
  minutes: number;
  motif: ArticleMotif;
  sections: readonly ArticleSection[];
  example: { title: string; text: string };
  exercises: readonly string[];
  /** Words that make the assistant suggest this article. */
  keywords: readonly string[];
  references: readonly ArticleReference[];
  reviewed: string;
};

const NIMH_HOME = { label: "National Institute of Mental Health: Health topics", url: "https://www.nimh.nih.gov/health/topics" };

export const ARTICLES: readonly Article[] = [
  {
    slug: "understanding-emotions",
    title: "Understanding human emotions",
    category: "Emotions",
    summary: "What emotions are, why we have them, and why no feeling is simply good or bad.",
    minutes: 4,
    motif: "heart",
    sections: [
      {
        heading: "Emotions are signals",
        paragraphs: [
          "Emotions are fast responses that combine feelings, body changes, and urges to act. Fear prepares us to protect ourselves. Sadness slows us down after a loss. Anger can signal that something important to us has been crossed.",
          "Because they carry information, emotions are worth listening to, even when they are unpleasant. They are not always accurate, though. A feeling tells you how a situation seems to you, not necessarily how it is.",
        ],
        evidence: "established",
      },
      {
        heading: "Feelings, thoughts, and actions affect each other",
        paragraphs: [
          "How we interpret a situation shapes what we feel, and what we feel shapes what we do. Changing any one of these, for example by taking a walk or questioning a thought, can shift the others. This idea is at the heart of cognitive behavioral therapy.",
        ],
        evidence: "established",
      },
      {
        heading: "Naming what you feel",
        paragraphs: [
          "Finding a precise word for a feeling, such as disappointed rather than bad, is linked in laboratory studies to a lower emotional response. It is one reason journaling and talking things through can help.",
        ],
        evidence: "emerging",
      },
    ],
    example: {
      title: "An everyday example",
      text: "Maria snaps at her son after a long day. Pausing, she notices she is not really angry at him. She is exhausted and worried about work. Naming that helps her apologize and ask for ten quiet minutes.",
    },
    exercises: ["name-the-feeling", "journaling"],
    keywords: ["emotion", "emotions", "feeling", "feelings", "feel"],
    references: [
      { label: "American Psychological Association: Stress effects on the body", url: "https://www.apa.org/topics/stress/body" },
      { label: "Lieberman MD et al. Putting feelings into words: affect labeling disrupts amygdala activity. Psychol Sci. 2007.", url: "https://pubmed.ncbi.nlm.nih.gov/17576282/" },
    ],
    reviewed: "2026-11-22",
  },
  {
    slug: "how-the-brain-processes-emotions",
    title: "How the brain processes emotions",
    category: "Emotions",
    summary: "A simple tour of the brain systems involved in feelings and in calming down.",
    minutes: 4,
    motif: "brain",
    sections: [
      {
        heading: "Many areas, working together",
        paragraphs: [
          "There is no single emotion center. Areas deep in the brain, including the amygdala, help detect threats and important events quickly. Areas at the front of the brain, the prefrontal cortex, help us think things through, plan, and calm strong reactions.",
          "These areas are in constant conversation. When we are tired, stressed, or in danger, fast reactions tend to take the lead. When we are rested and safe, it is easier to pause and choose a response.",
        ],
        evidence: "established",
      },
      {
        heading: "The body is part of it",
        paragraphs: [
          "Stress hormones and the nervous system change heart rate, breathing, and muscle tension. That is why calming the body, for example with slow breathing, can make it easier to think clearly.",
        ],
        evidence: "evidence-informed",
      },
      {
        heading: "The brain can change",
        paragraphs: [
          "The brain keeps adapting throughout life. Practicing new ways of responding, as in therapy or regular relaxation, is thought to strengthen those patterns over time. Research on exactly how this works is still developing.",
        ],
        evidence: "emerging",
      },
    ],
    example: {
      title: "An everyday example",
      text: "A car horn makes James jump before he even knows why. A second later, his thinking brain catches up: it was not aimed at him. A slow breath helps his body settle too.",
    },
    exercises: ["paced-breathing", "grounding-54321"],
    keywords: ["brain", "amygdala", "nervous system", "fight or flight", "react"],
    references: [
      { label: "NIMH: Psychotherapies", url: "https://www.nimh.nih.gov/health/topics/psychotherapies" },
      { label: "American Psychological Association: Stress effects on the body", url: "https://www.apa.org/topics/stress/body" },
    ],
    reviewed: "2026-11-22",
  },
  {
    slug: "anxiety-and-stress",
    title: "Anxiety and stress",
    category: "Mental health",
    summary: "The difference between everyday stress, anxiety, and an anxiety disorder, and what helps.",
    minutes: 5,
    motif: "wave",
    sections: [
      {
        heading: "Stress and anxiety are normal",
        paragraphs: [
          "Stress is the body's response to a demand, such as a deadline or a difficult conversation. Anxiety is a feeling of worry or fear about what might happen. In small amounts both are part of ordinary life and can even help us prepare.",
        ],
        evidence: "established",
      },
      {
        heading: "When to look for help",
        paragraphs: [
          "Anxiety disorders are different from everyday worry. The worry is intense, hard to control, lasts for months, and gets in the way of work, relationships, or daily life. Anxiety disorders are common and treatable, most often with therapy such as cognitive behavioral therapy, medication, or both.",
          "If worry or panic is affecting your daily life, a doctor or mental health professional can assess what is going on. A questionnaire like the GAD-7 can be a starting point for that conversation, but it is not a diagnosis.",
        ],
        evidence: "established",
      },
      {
        heading: "What helps day to day",
        paragraphs: [
          "Regular physical activity, enough sleep, limiting caffeine and alcohol, slow breathing, and talking with people you trust are commonly recommended ways to manage stress. They support, but do not replace, professional treatment when it is needed.",
        ],
        evidence: "evidence-informed",
      },
    ],
    example: {
      title: "An everyday example",
      text: "Before a medical appointment, Ana's heart races and she imagines bad news. She writes her questions down, does five minutes of slow breathing, and asks her sister to come with her.",
    },
    exercises: ["paced-breathing", "worry-time", "grounding-54321", "stress-plan"],
    keywords: ["anxiety", "anxious", "worry", "worried", "stress", "stressed", "panic", "nervous", "overwhelmed"],
    references: [
      { label: "NIMH: Anxiety disorders", url: "https://www.nimh.nih.gov/health/topics/anxiety-disorders" },
      { label: "NIMH: I'm so stressed out! fact sheet", url: "https://www.nimh.nih.gov/health/publications/so-stressed-out-fact-sheet" },
      { label: "American Psychological Association: Anxiety", url: "https://www.apa.org/topics/anxiety" },
    ],
    reviewed: "2026-11-22",
  },
  {
    slug: "understanding-depression",
    title: "Understanding depression",
    category: "Mental health",
    summary: "What depression is, how it differs from sadness, and why it is treatable.",
    minutes: 5,
    motif: "cloud",
    sections: [
      {
        heading: "More than a sad mood",
        paragraphs: [
          "Everyone feels sad or low at times. Depression is different: low mood or loss of interest lasts most of the day, nearly every day, for at least two weeks, and comes with other changes such as sleep problems, tiredness, trouble concentrating, or feelings of worthlessness.",
          "Depression is a common and serious medical condition. It is not a weakness or a character flaw, and it is not something a person can simply snap out of.",
        ],
        evidence: "established",
      },
      {
        heading: "Treatment works",
        paragraphs: [
          "Depression, even severe depression, can be treated. Common treatments include talking therapies, medication, or a combination. Only a qualified professional can diagnose depression and recommend treatment. If you take medication, do not stop or change it without talking with your prescriber.",
        ],
        evidence: "established",
      },
      {
        heading: "Small steps alongside care",
        paragraphs: [
          "Staying in touch with people, getting some physical activity, keeping a regular routine, and planning small enjoyable activities can support recovery. Recent research reviews suggest exercise can help with depression symptoms, alongside other treatment.",
        ],
        evidence: "evidence-informed",
      },
    ],
    example: {
      title: "An everyday example",
      text: "For weeks, Tom has stopped enjoying his garden and sleeps badly. His daughter notices and helps him book a doctor's appointment. Meanwhile, he aims for one short walk a day.",
    },
    exercises: ["behavioral-activation", "self-compassion", "gratitude"],
    keywords: ["depression", "depressed", "sad", "low", "hopeless", "empty", "numb", "no energy", "unmotivated"],
    references: [
      { label: "NIMH: Depression", url: "https://www.nimh.nih.gov/health/topics/depression" },
      { label: "American Psychological Association: Depression", url: "https://www.apa.org/topics/depression" },
      { label: "Noetel M et al. Effect of exercise for depression: systematic review and network meta-analysis. BMJ. 2024.", url: "https://pubmed.ncbi.nlm.nih.gov/38355154/" },
    ],
    reviewed: "2026-11-22",
  },
  {
    slug: "relationships-and-communication",
    title: "Relationships and communication",
    category: "Relationships",
    summary: "How to have difficult conversations more calmly and repair after conflict.",
    minutes: 4,
    motif: "people",
    sections: [
      {
        heading: "Conflict is normal",
        paragraphs: [
          "Disagreements happen in every close relationship. What matters most is how people handle them: whether both feel heard, and whether they can repair things afterwards.",
        ],
        evidence: "evidence-informed",
      },
      {
        heading: "Helpful habits",
        paragraphs: [
          "Speak about your own experience rather than blaming, for example: I felt hurt when the plans changed, instead of: you never think about me. Listen to understand, not only to reply. Take a break if the conversation gets heated, and agree to come back to it.",
          "Couples and family therapy can help when the same conflicts keep repeating or when trust has been damaged.",
        ],
        evidence: "evidence-informed",
      },
    ],
    example: {
      title: "An everyday example",
      text: "Sam and Lee argue about chores again. This time Sam says: I feel tired and alone with this. Lee, less defensive, suggests making a list together.",
    },
    exercises: ["i-statements", "boundary-script", "name-the-feeling"],
    keywords: ["relationship", "partner", "husband", "wife", "argument", "argue", "fight", "conflict", "communication", "boyfriend", "girlfriend"],
    references: [
      { label: "American Psychological Association: Marriage and relationships", url: "https://www.apa.org/topics/marriage-relationships" },
    ],
    reviewed: "2026-11-22",
  },
  {
    slug: "self-esteem-and-confidence",
    title: "Self-esteem and confidence",
    category: "Personal growth",
    summary: "Where self-esteem comes from, and how self-compassion can help more than self-criticism.",
    minutes: 4,
    motif: "mirror",
    sections: [
      {
        heading: "What self-esteem is",
        paragraphs: [
          "Self-esteem is how we value ourselves overall. It is shaped by early experiences, relationships, and how we interpret successes and setbacks. It can change over time.",
        ],
        evidence: "established",
      },
      {
        heading: "Kindness works better than harshness",
        paragraphs: [
          "Many people believe that being hard on themselves keeps them motivated. Research on self-compassion suggests that treating yourself with understanding after a setback is linked to less distress and can make it easier to try again.",
        ],
        evidence: "emerging",
      },
      {
        heading: "Building confidence",
        paragraphs: [
          "Confidence tends to grow from experience: trying small, manageable challenges and noticing that you coped. Noticing unhelpful thoughts, such as I always get things wrong, and testing them against the facts is a skill taught in CBT.",
        ],
        evidence: "evidence-informed",
      },
    ],
    example: {
      title: "An everyday example",
      text: "After a mistake at work, Priya's first thought is: I'm useless. She asks what she would say to a friend, and rewrites it: I made one mistake, and I fixed it.",
    },
    exercises: ["self-compassion", "thought-reframing", "gratitude"],
    keywords: ["self-esteem", "confidence", "useless", "worthless", "failure", "not good enough", "stupid", "ashamed"],
    references: [
      { label: "American Psychological Association: What is cognitive behavioral therapy?", url: "https://www.apa.org/ptsd-guideline/patients-and-families/cognitive-behavioral" },
    ],
    reviewed: "2026-11-22",
  },
  {
    slug: "emotional-intelligence",
    title: "Emotional intelligence",
    category: "Emotions",
    summary: "Noticing, understanding, and managing emotions, in yourself and with others.",
    minutes: 3,
    motif: "lightbulb",
    sections: [
      {
        heading: "What it means",
        paragraphs: [
          "Emotional intelligence usually describes the ability to recognize emotions, understand what they mean, and use that understanding to guide thinking and behavior. Researchers define and measure it in different ways, and popular claims about it sometimes go beyond the evidence.",
        ],
        evidence: "emerging",
      },
      {
        heading: "Skills you can practice",
        paragraphs: [
          "Practical skills include naming your feelings precisely, pausing before reacting, considering how another person might feel, and choosing a response that fits your values. These are similar to the emotion-regulation skills taught in several evidence-based therapies.",
        ],
        evidence: "evidence-informed",
      },
    ],
    example: {
      title: "An everyday example",
      text: "When a friend cancels plans, Leo notices he feels rejected. Instead of sending a sharp text, he asks if everything is okay. His friend was unwell.",
    },
    exercises: ["name-the-feeling", "i-statements"],
    keywords: ["emotional intelligence", "empathy", "understand others", "regulate", "control my emotions", "temper"],
    references: [
      { label: "NIMH: Psychotherapies (includes dialectical behavior therapy and its emotion-regulation skills)", url: "https://www.nimh.nih.gov/health/topics/psychotherapies" },
      { label: "American Psychological Association: Marriage and relationships", url: "https://www.apa.org/topics/marriage-relationships" },
    ],
    reviewed: "2026-11-22",
  },
  {
    slug: "childhood-and-family",
    title: "Childhood and family relationships",
    category: "Relationships",
    summary: "How early relationships can shape us, without deciding who we become.",
    minutes: 4,
    motif: "home",
    sections: [
      {
        heading: "Early relationships matter",
        paragraphs: [
          "The care we receive as children can shape how we see ourselves and how we relate to others. Supportive relationships help children learn to manage feelings. Difficult experiences, such as neglect or ongoing conflict, can leave patterns that show up later.",
        ],
        evidence: "established",
      },
      {
        heading: "The past is not destiny",
        paragraphs: [
          "People continue to grow throughout life. Supportive adult relationships, reflection, and therapy can all help people understand old patterns and choose new ones. If painful childhood memories affect you strongly today, a trauma-informed therapist can help.",
        ],
        evidence: "evidence-informed",
      },
    ],
    example: {
      title: "An everyday example",
      text: "Elena notices she goes silent whenever someone raises their voice, as she did as a child. Recognizing the pattern, she practices telling her partner: I need a minute, and then I want to talk.",
    },
    exercises: ["name-the-feeling", "self-compassion", "journaling"],
    keywords: ["childhood", "parents", "mother", "father", "mom", "dad", "family", "sibling", "upbringing", "children", "kids"],
    references: [
      { label: "CDC: About adverse childhood experiences", url: "https://www.cdc.gov/aces/about/index.html" },
      { label: "American Psychological Association: Parenting", url: "https://www.apa.org/topics/parenting" },
    ],
    reviewed: "2026-11-22",
  },
  {
    slug: "loneliness",
    title: "Loneliness",
    category: "Relationships",
    summary: "Why loneliness matters for health, and gentle ways to reconnect.",
    minutes: 4,
    motif: "path",
    sections: [
      {
        heading: "Loneliness is common",
        paragraphs: [
          "Loneliness is the painful feeling that our connections are not what we need. It can happen even when we are surrounded by people, and it is not a personal failing.",
        ],
        evidence: "established",
      },
      {
        heading: "Connection and health",
        paragraphs: [
          "Large research reviews have linked strong social relationships with better health and longer life, and social isolation with health risks. In 2023 the U.S. Surgeon General published an advisory on loneliness and social connection.",
        ],
        evidence: "established",
      },
      {
        heading: "Small steps to reconnect",
        paragraphs: [
          "Reaching out to one person, joining a group around an interest, volunteering, or simply chatting with a neighbor can all help. It often feels awkward at first. Starting small makes it easier.",
        ],
        evidence: "evidence-informed",
      },
    ],
    example: {
      title: "An everyday example",
      text: "Since retiring, George rarely talks to anyone. He joins a weekly walking group at the library. The first week is uncomfortable; by the fourth, he looks forward to it.",
    },
    exercises: ["behavioral-activation", "self-compassion"],
    keywords: ["lonely", "loneliness", "alone", "isolated", "no friends", "nobody"],
    references: [
      { label: "U.S. Surgeon General: Our Epidemic of Loneliness and Isolation (2023 advisory)", url: "https://www.hhs.gov/sites/default/files/surgeon-general-social-connection-advisory.pdf" },
      { label: "Holt-Lunstad J, Smith TB, Layton JB. Social relationships and mortality risk: a meta-analytic review. PLoS Med. 2010.", url: "https://pubmed.ncbi.nlm.nih.gov/20668659/" },
      { label: "National Institute on Aging: Loneliness and social isolation", url: "https://www.nia.nih.gov/health/loneliness-and-social-isolation/loneliness-and-social-isolation-tips-staying-connected" },
    ],
    reviewed: "2026-11-22",
  },
  {
    slug: "motivation-and-personal-growth",
    title: "Motivation and personal growth",
    category: "Personal growth",
    summary: "Why motivation often follows action, and how to make change manageable.",
    minutes: 3,
    motif: "sprout",
    sections: [
      {
        heading: "Action can come first",
        paragraphs: [
          "We often wait to feel motivated before starting. In practice, motivation frequently grows after we begin. Starting with a very small step lowers the barrier.",
        ],
        evidence: "evidence-informed",
      },
      {
        heading: "Goals that fit your values",
        paragraphs: [
          "Change tends to last longer when it connects to what matters to you, rather than to pressure or guilt. Specific plans, such as walking after lunch on weekdays, work better than vague intentions.",
        ],
        evidence: "evidence-informed",
      },
    ],
    example: {
      title: "An everyday example",
      text: "Nadia wants to feel less stressed. Instead of an hour of exercise, she commits to five minutes of stretching after breakfast, and adds more when it feels easy.",
    },
    exercises: ["behavioral-activation", "stress-plan"],
    keywords: ["motivation", "motivated", "procrastinate", "procrastination", "goal", "goals", "lazy", "stuck", "change"],
    references: [
      { label: "American Psychological Association: Making lifestyle changes that last", url: "https://www.apa.org/topics/behavioral-health/healthy-lifestyle-changes" },
    ],
    reviewed: "2026-11-22",
  },
  {
    slug: "cognitive-behavioral-therapy",
    title: "Cognitive behavioral therapy (CBT)",
    category: "Approaches",
    summary: "One of the most researched talking therapies, and the ideas behind it.",
    minutes: 4,
    motif: "book",
    sections: [
      {
        heading: "The core idea",
        paragraphs: [
          "CBT is based on the idea that thoughts, feelings, and behaviors affect each other, and that learning to notice and change unhelpful patterns can reduce distress.",
        ],
        evidence: "established",
      },
      {
        heading: "What the evidence says",
        paragraphs: [
          "CBT has been studied in many trials and is recommended for a range of problems, including depression and anxiety disorders. It is usually time-limited and focused on practical skills, often with homework between sessions.",
        ],
        evidence: "established",
      },
      {
        heading: "Self-help versus therapy",
        paragraphs: [
          "The thinking exercises in LifeZoi Mind are inspired by CBT. They are educational self-help, not therapy. A trained therapist tailors CBT to the person and can help when problems are more serious.",
        ],
      },
    ],
    example: {
      title: "An everyday example",
      text: "Ravi thinks: if I speak up in the meeting, everyone will think I'm stupid. He tests it by asking one question. Two colleagues thank him afterwards.",
    },
    exercises: ["thought-reframing", "thinking-traps", "worry-time"],
    keywords: ["cbt", "therapy", "therapist", "thoughts", "negative thoughts", "thinking", "overthinking"],
    references: [
      { label: "American Psychological Association: What is cognitive behavioral therapy?", url: "https://www.apa.org/ptsd-guideline/patients-and-families/cognitive-behavioral" },
      { label: "Hofmann SG et al. The efficacy of cognitive behavioral therapy: a review of meta-analyses. Cognit Ther Res. 2012.", url: "https://pubmed.ncbi.nlm.nih.gov/23459093/" },
      { label: "NIMH: Psychotherapies", url: "https://www.nimh.nih.gov/health/topics/psychotherapies" },
    ],
    reviewed: "2026-11-22",
  },
  {
    slug: "mindfulness",
    title: "Mindfulness",
    category: "Approaches",
    summary: "Paying attention to the present moment with openness, and what research shows.",
    minutes: 4,
    motif: "leaf",
    sections: [
      {
        heading: "What mindfulness is",
        paragraphs: [
          "Mindfulness means paying attention to what is happening now, such as your breath, body, sounds, or thoughts, with curiosity rather than judgment. It can be practiced in formal meditation or during everyday activities.",
        ],
        evidence: "established",
      },
      {
        heading: "What research shows",
        paragraphs: [
          "Studies of mindfulness-based programs suggest benefits for stress, anxiety, and depression symptoms for many people. Results vary, and some claims made about mindfulness go beyond what research supports.",
          "Mindfulness is generally considered safe for healthy people, but a small number of people find meditation brings up difficult feelings. If that happens, it is fine to stop or to practice with a trained teacher.",
        ],
        evidence: "evidence-informed",
      },
    ],
    example: {
      title: "An everyday example",
      text: "While washing dishes, Mei notices the warm water and the sound of the plates. For a few minutes, her worry about tomorrow fades into the background.",
    },
    exercises: ["mindful-moment", "body-scan", "grounding-54321"],
    keywords: ["mindfulness", "meditation", "meditate", "present", "calm", "relax"],
    references: [
      { label: "NIH NCCIH: Meditation and mindfulness: effectiveness and safety", url: "https://www.nccih.nih.gov/health/meditation-and-mindfulness-effectiveness-and-safety" },
      { label: "American Psychological Association: Mindfulness meditation", url: "https://www.apa.org/topics/mindfulness/meditation" },
    ],
    reviewed: "2026-11-22",
  },
  {
    slug: "sleep-and-mental-health",
    title: "Sleep and mental well-being",
    category: "Body and mind",
    summary: "How sleep and mood affect each other, and habits that support rest.",
    minutes: 4,
    motif: "moon",
    sections: [
      {
        heading: "A two-way street",
        paragraphs: [
          "Poor sleep can make it harder to handle emotions and stress, and worry or low mood can make it harder to sleep. Sleep problems are common in depression and anxiety.",
        ],
        evidence: "established",
      },
      {
        heading: "Habits that help",
        paragraphs: [
          "Common recommendations include keeping a regular wake time, getting daylight in the morning, limiting caffeine later in the day, keeping the bedroom dark and cool, and having a relaxing routine before bed.",
        ],
        evidence: "evidence-informed",
      },
      {
        heading: "When to see a doctor",
        paragraphs: [
          "If sleep problems last for weeks, or you snore loudly, stop breathing during sleep, or feel very sleepy during the day, talk with a doctor. Ongoing insomnia has effective treatments, including a form of CBT designed for insomnia.",
        ],
        evidence: "established",
      },
    ],
    example: {
      title: "An everyday example",
      text: "Carlos lies awake replaying the day. He starts writing tomorrow's to-do list an hour before bed and does a body scan once he lies down.",
    },
    exercises: ["sleep-wind-down", "body-scan", "worry-time"],
    keywords: ["sleep", "insomnia", "awake", "tired", "exhausted", "night", "can't sleep", "nightmare"],
    references: [
      { label: "CDC: About sleep", url: "https://www.cdc.gov/sleep/about/index.html" },
      { label: "NIH National Heart, Lung, and Blood Institute: Sleep deprivation and deficiency", url: "https://www.nhlbi.nih.gov/health/sleep-deprivation" },
    ],
    reviewed: "2026-11-22",
  },
  {
    slug: "psychology-of-aging",
    title: "The psychology of aging",
    category: "Life stages",
    summary: "Emotional well-being often holds up well with age. What helps, and what to watch for.",
    minutes: 4,
    motif: "sun",
    sections: [
      {
        heading: "Not all decline",
        paragraphs: [
          "Many older adults report emotional well-being that is as good as or better than in earlier life. One theory suggests that as time horizons shorten, people focus more on meaningful relationships and positive experiences.",
        ],
        evidence: "emerging",
      },
      {
        heading: "Challenges to take seriously",
        paragraphs: [
          "Loss, health problems, caregiving, and isolation can all affect mood. Depression is not a normal part of aging, and it can be treated at any age. Memory changes that worry you are worth discussing with a doctor.",
        ],
        evidence: "established",
      },
      {
        heading: "What supports well-being",
        paragraphs: [
          "Staying socially connected, physically active, and engaged in meaningful activities is linked with better well-being in later life.",
        ],
        evidence: "evidence-informed",
      },
    ],
    example: {
      title: "An everyday example",
      text: "At 74, Ruth volunteers at a reading program twice a week. She says the children give her day a shape and a reason to laugh.",
    },
    exercises: ["gratitude", "behavioral-activation"],
    keywords: ["aging", "ageing", "old", "older", "retire", "retired", "retirement", "grandchildren", "elderly"],
    references: [
      { label: "National Institute on Aging: Depression and older adults", url: "https://www.nia.nih.gov/health/mental-and-emotional-health/depression-and-older-adults" },
      { label: "Carstensen LL. The influence of a sense of time on human development. Science. 2006.", url: "https://pubmed.ncbi.nlm.nih.gov/16809512/" },
    ],
    reviewed: "2026-11-22",
  },
  {
    slug: "latest-research",
    title: "New in psychological science",
    category: "Research",
    summary: "A few active research areas, labeled by how settled the evidence is, and how LifeZoi adds new findings.",
    minutes: 4,
    motif: "spark",
    sections: [
      {
        heading: "Social connection as a health factor",
        paragraphs: [
          "Public health agencies increasingly treat social connection as a health issue, building on large research reviews linking relationships with health. Ways to reduce loneliness at a community level are an active research area.",
        ],
        evidence: "established",
      },
      {
        heading: "Exercise for depression",
        paragraphs: [
          "Recent systematic reviews suggest that physical activity, including walking, can reduce depression symptoms, alongside other treatment. Researchers are still working out which types and amounts help most for which people.",
        ],
        evidence: "emerging",
      },
      {
        heading: "Digital mental health tools",
        paragraphs: [
          "Apps, online programs, and AI chat tools are being studied as ways to widen access to support. Evidence varies widely between tools, and most have not been tested to the standard of established therapies. LifeZoi Mind is an educational tool, not a treatment.",
        ],
        evidence: "preliminary",
      },
      {
        heading: "How LifeZoi adds new research",
        paragraphs: [
          "New findings are added only with a link to the original source or to a major health organization, and with a label showing how settled the evidence is. Single small studies are described as preliminary. If you find a link that no longer works, please tell us through Reviews and feedback.",
        ],
      },
    ],
    example: {
      title: "How to read a headline",
      text: "A headline says a new study proves a habit beats depression. Look for: how many people were studied, whether it was compared with a control group, and whether other studies agree.",
    },
    exercises: ["behavioral-activation"],
    keywords: ["research", "study", "studies", "science", "new", "latest", "discovery", "evidence"],
    references: [
      { label: "NIMH: Technology and the future of mental health treatment", url: "https://www.nimh.nih.gov/health/topics/technology-and-the-future-of-mental-health-treatment" },
      { label: "Noetel M et al. Effect of exercise for depression: systematic review and network meta-analysis. BMJ. 2024.", url: "https://pubmed.ncbi.nlm.nih.gov/38355154/" },
      { label: "U.S. Surgeon General: Our Epidemic of Loneliness and Isolation (2023 advisory)", url: "https://www.hhs.gov/sites/default/files/surgeon-general-social-connection-advisory.pdf" },
      NIMH_HOME,
    ],
    reviewed: "2026-11-22",
  },
];

export function articleBySlug(slug: string): Article | null {
  return ARTICLES.find((article) => article.slug === slug) ?? null;
}

/** Articles whose keywords appear in the text, best match first. */
export function recommendArticles(text: string, limit = 2, exclude: readonly string[] = []): Article[] {
  const lower = ` ${text.toLowerCase()} `;
  const scored = ARTICLES.filter((article) => !exclude.includes(article.slug))
    .map((article) => ({
      article,
      score: article.keywords.reduce((sum, keyword) => (new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`, "i").test(lower) ? sum + 1 : sum), 0),
    }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((entry) => entry.article);
}
