import { msg } from "@/lib/i18n/translate";
import type { GrowthCourse } from "@/lib/growth-academy/types";

export const resilienceCourse: GrowthCourse = {
  id: "resilience",
  title: msg("Resilience & Motivation Training"),
  shortTitle: msg("Resilience & Motivation"),
  tagline: msg("Meet setbacks with steadiness and keep moving toward what matters to you."),
  description: msg("Ten practical lessons on recovering from setbacks, learning from mistakes, finding real reasons to act, and turning goals into small, realistic steps."),
  goal: msg("Help you approach setbacks constructively, build persistence, maintain motivation, and take realistic steps toward meaningful goals."),
  objectives: [
    msg("Recognize the resilience you already have and use it when things get hard."),
    msg("Treat mistakes and setbacks as information you can learn from."),
    msg("Connect your goals to your own values so motivation lasts longer than a good mood."),
    msg("Build small habits and simple plans that keep you moving, even when progress is slow."),
  ],
  difficulty: "intermediate",
  cover: "mountain",
  colors: ["#5a4f8f", "#e7e4f5"],
  achievement: {
    id: "resilience-in-action",
    title: msg("Resilience in Action"),
    text: msg("You finished the course and built your own 30-day plan for steady, realistic growth."),
  },
  lessons: [
    // 1
    {
      id: "resilience-01",
      number: 1,
      title: msg("What Is Resilience?"),
      skill: msg("Understand resilience as a set of learnable skills, and find evidence of it in your own past."),
      minutes: 8,
      care: "This lesson asks you to think about a past challenge. Choose one that feels manageable to revisit today. If a memory brings up strong distress, or low mood stays with you for weeks, please talk with a doctor or mental health professional. If you might harm yourself, contact local emergency services now.",
      intro: [
        "Resilience is the ability to adapt, recover, and keep going after difficult experiences. It is not about never feeling hurt or never struggling. It is about what you do next, and how you find your way back to the things you care about.",
        "In this lesson you will learn what resilience looks like in ordinary life, why it is something you can build rather than something you either have or lack, and you will look back at a challenge you have already come through.",
      ],
      learn: [
        {
          heading: "Resilience is bending, not being unbreakable",
          paragraphs: [
            "People sometimes picture a resilient person as someone who stays calm and strong no matter what happens. Real resilience looks more like a tree in wind. It bends, it may lose some leaves, and then it straightens again over time.",
            "Feeling upset, tired, or discouraged after a hard event is normal. Resilience includes those feelings. It shows up in the small choices that follow: resting, asking for help, trying again in a different way, or simply getting through the day.",
          ],
        },
        {
          heading: "The parts of resilience you can practice",
          paragraphs: [
            "Resilience is not one single trait. It is made of several everyday skills, and each one can grow with practice.",
          ],
          bullets: [
            "Connection: having people you can talk to, and letting them help.",
            "Perspective: seeing a hard moment as one part of your story, not the whole of it.",
            "Problem solving: breaking a difficulty into parts you can act on.",
            "Self-care: sleep, food, movement, and rest that keep your energy steady.",
            "Meaning: remembering what matters to you and why it is worth the effort.",
          ],
        },
        {
          heading: "Your past is a source of evidence",
          paragraphs: [
            "Almost everyone has come through something difficult: a move, a loss, a job that ended, an illness in the family, a hard exam, or a long stretch of feeling stuck. You may not have called it resilience at the time, but you used skills to get through it.",
            "When you look back and name what helped, you collect proof that you can cope. That proof is useful the next time something goes wrong, because it reminds you that you have done hard things before and you know some of the steps.",
          ],
        },
      ],
      example: {
        title: "Kwame and the year the shop closed",
        story: [
          "Kwame, 52, ran a small repair shop for many years until rising rent forced him to close it. For a few months he felt lost. He slept badly and avoided friends who asked how he was doing.",
          "When a former customer asked him to fix a bicycle, he realized how much he missed the work. He started repairing things from his garage on weekends, joined a community repair group, and later found part-time work at a hardware store. Looking back, he could see what had helped: his friend's patience, his practical skills, and taking one small step instead of waiting to feel ready.",
        ],
        point: "Resilience rarely looks dramatic. It is often a slow return, helped by people, skills, and small steps taken before you feel fully ready.",
      },
      exercise: {
        title: "A challenge you came through",
        steps: [
          "Choose a challenge from your past that you have now come through, at least partly. Pick one that feels comfortable to think about today.",
          "Describe it in a sentence or two. You do not need every detail.",
          "Write down what helped you get through it: people, actions, qualities, or ideas.",
          "Name one thing from that experience you could use again in a future challenge.",
        ],
        fields: [
          { id: "challenge", label: "The challenge I came through", kind: "long", placeholder: "Moving to a new city and not knowing anyone at first." },
          { id: "what-helped", label: "What helped me get through it", kind: "long", placeholder: "Calling my sister every Sunday, joining a walking group, being patient with myself." },
          { id: "use-again", label: "One thing I can use again", kind: "short" },
        ],
        minutes: 7,
      },
      practice: {
        kind: "question",
        prompt: "Think about the challenge you just wrote about. If a friend were facing something similar right now, what is one thing you learned that you would want to share with them?",
        examples: [
          { text: "\"It does not have to get better all at once. I just focused on getting through each week.\"", why: "It shares a practical way of coping and takes pressure off needing a quick recovery." },
          { text: "\"Let people help you. I waited too long to tell anyone, and things got easier once I did.\"", why: "It names connection, one of the strongest parts of resilience, and is honest about what was hard." },
          { text: "\"Keep one small routine going, even if everything else is messy.\"", why: "It offers a concrete action the friend could take today." },
        ],
        lookFors: [
          "Does your answer come from something that actually helped you?",
          "Does it include something your friend could do, not only feel?",
          "Is it kind enough that you would say it to someone you care about?",
        ],
        cues: [
          { anyOf: ["help", "talk", "friend", "family", "asked"], say: "You named support from other people, which is one of the most reliable parts of resilience." },
          { anyOf: ["small", "step", "one day", "each day", "routine"], say: "You pointed to small, steady steps, which is how most people find their way back after a hard time." },
        ],
      },
      reflection: [
        "Which part of resilience do you rely on most: connection, perspective, problem solving, self-care, or meaning?",
        "Which part would you like to strengthen during this course?",
        "Who has helped you through a hard time, and have you told them what it meant to you?",
      ],
      takeaways: [
        "Resilience is adapting, recovering, and continuing, not never struggling.",
        "It is built from everyday skills you can practice.",
        "Challenges you have already come through are evidence that you can cope.",
      ],
    },
    // 2
    {
      id: "resilience-02",
      number: 2,
      title: msg("Change Your Relationship with Failure"),
      skill: msg("Look at a mistake as information, and turn it into one clear lesson you can use."),
      minutes: 8,
      care: "Looking at past mistakes can stir up shame or regret. Go gently, and pick a mistake that feels safe to explore. If guilt or low mood feels heavy or lasts for weeks, please talk with a doctor or mental health professional. If you might harm yourself, contact local emergency services now.",
      intro: [
        "Most people learn early that mistakes are something to hide or feel bad about. That reaction is understandable, but it can make it harder to try new things and harder to recover when something goes wrong.",
        "In this lesson you will learn how to separate a mistake from your worth as a person, how to ask useful questions about what happened, and how to pull out one lesson you can carry forward.",
      ],
      learn: [
        {
          heading: "A mistake is an event, not an identity",
          paragraphs: [
            "There is a big difference between \"I made a mistake\" and \"I am a failure.\" The first describes something that happened. The second turns one event into a judgment about your whole self.",
            "When you notice yourself using words like \"always,\" \"never,\" or \"I am so…\" after a mistake, try rewording it into a description of the event. \"I always mess things up\" becomes \"I sent the report with the wrong figures this time.\" The event is still real, but now it is something you can look at and work with.",
          ],
        },
        {
          heading: "Treat it as information",
          paragraphs: [
            "Every mistake carries information about what did not work under those conditions. Once the first sting has passed, you can become curious rather than critical. These questions help:",
          ],
          bullets: [
            "What was I trying to do?",
            "What actually happened?",
            "What was in my control, and what was not?",
            "What would I try differently next time?",
            "What did I do well, even in this situation?",
          ],
        },
        {
          heading: "Let feelings settle first",
          paragraphs: [
            "Right after a mistake, emotions are usually strong. That is not the best moment to analyze it. Give yourself a little time: take a walk, sleep on it, or talk it through with someone you trust.",
            "Coming back to it later, with a calmer mind, makes it easier to find a fair and useful lesson rather than a harsh one. A good lesson is specific and points to an action, such as \"check the figures with a colleague before sending\" rather than \"be more careful.\"",
          ],
        },
      ],
      example: {
        title: "Lucía's burned dinner party",
        story: [
          "Lucía, 38, invited her new partner's family for dinner and wanted everything to be perfect. She tried a complicated recipe for the first time, lost track of time while setting the table, and the main dish burned. She ordered takeout and spent the evening feeling embarrassed.",
          "A few days later she thought about it more calmly. The guests had been friendly and the conversation had gone well. The real lesson was not \"I cannot cook\" but \"I should not try a brand-new recipe for an important event.\" Next time she made a dish she knew well, and she enjoyed the evening far more.",
        ],
        point: "Once the embarrassment settled, Lucía found a specific lesson she could use, and she also noticed what had gone right.",
      },
      exercise: {
        title: "One lesson from a past mistake",
        steps: [
          "Choose a past mistake that is small or medium in size, and that you feel ready to look at.",
          "Describe what happened in neutral words, as if you were telling a fair friend.",
          "Answer: what was in your control, and what was not?",
          "Write one specific lesson that points to an action you could take next time.",
        ],
        fields: [
          { id: "mistake", label: "What happened, described as an event", kind: "long", placeholder: "I agreed to a deadline without checking my calendar, and I had to ask for more time." },
          { id: "control", label: "What was in my control, and what was not", kind: "long" },
          { id: "lesson", label: "My one lesson", kind: "short", placeholder: "Check my calendar before agreeing to a deadline." },
        ],
        minutes: 6,
      },
      practice: {
        kind: "scenario",
        prompt: "You forgot to reply to an important email, and the person had to follow up twice. Your first thought is, \"I am so disorganized. I can never keep up.\" How could you describe this to yourself in a more useful way?",
        examples: [
          { text: "\"I missed that email during a busy week. I will reply now and set up a reminder for messages I need to answer.\"", why: "It describes the event, takes responsibility, and turns it into a clear action." },
          { text: "\"This one slipped through. Next time I will flag important emails as soon as I read them.\"", why: "It is calm and specific, and it names a small change that is easy to try." },
        ],
        lookFors: [
          "Does your answer describe what happened instead of judging who you are?",
          "Does it include a specific action for next time?",
          "Is the tone something you would use with a friend in the same situation?",
        ],
        cues: [
          { anyOf: ["next time", "i will", "i'll", "reminder", "from now on"], say: "You turned the mistake into a concrete next step, which is exactly how mistakes become useful." },
          { anyOf: ["this time", "this one", "busy week", "missed"], say: "You described one event rather than your whole self, which keeps the problem a size you can handle." },
        ],
      },
      reflection: [
        "How did the adults around you react to mistakes when you were growing up, and how does that shape your reactions today?",
        "What is one mistake that, looking back, taught you something you still use?",
        "What words could you say to yourself the next time something goes wrong?",
      ],
      takeaways: [
        "A mistake is something that happened, not who you are.",
        "Curious questions turn a mistake into information.",
        "Let strong feelings settle before you look for the lesson.",
        "A useful lesson is specific and points to an action.",
      ],
    },
    // 3
    {
      id: "resilience-03",
      number: 3,
      title: msg("Develop a Growth Mindset"),
      skill: msg("Notice fixed, limiting thoughts and rewrite them as learning-oriented statements."),
      minutes: 9,
      intro: [
        "The way you think about your abilities affects what you are willing to try. If you believe your abilities are set in stone, a difficulty can feel like proof that you are simply not good enough. If you believe abilities can grow, the same difficulty looks like part of learning.",
        "In this lesson you will learn to recognize these two ways of thinking in your own words, and practice rewriting limiting statements so they leave room for progress.",
      ],
      learn: [
        {
          heading: "Two ways of looking at ability",
          paragraphs: [
            "A fixed way of thinking assumes that talent and intelligence are mostly set. You either have them or you do not. From this view, effort can feel like a sign of weakness, and mistakes feel like a verdict.",
            "A growth-oriented way of thinking assumes that skills develop through practice, good strategies, and help from others. From this view, effort is how you improve, and mistakes show you where to focus next.",
            "Most people use both ways of thinking depending on the topic. You might feel open to learning a new recipe but believe you are \"just not a numbers person.\" The aim is to notice which one is speaking.",
          ],
        },
        {
          heading: "How fixed thinking sounds",
          paragraphs: [
            "Fixed thinking often shows up as short, final sentences. Listen for phrases like these in your own head:",
          ],
          bullets: [
            "\"I'm just not good at this.\"",
            "\"Some people are natural at it, and I'm not one of them.\"",
            "\"If I have to work this hard, I must not have the talent.\"",
            "\"I tried once and it didn't work, so there's no point.\"",
          ],
        },
        {
          heading: "How to rewrite a limiting statement",
          paragraphs: [
            "Rewriting is not about pretending everything is easy. A good rewrite stays honest about where you are now and adds the possibility of change. Three simple tools help:",
          ],
          bullets: [
            "Add \"yet\": \"I can't do this\" becomes \"I can't do this yet.\"",
            "Name a strategy: \"I'm bad at public speaking\" becomes \"Speaking in front of people is hard for me, and practicing with one friend first could help.\"",
            "Look for the next step: \"I'll never understand this software\" becomes \"I understand the basics. Next I'll learn how to make a chart.\"",
          ],
        },
      ],
      example: {
        title: "Priya learns to swim at 41",
        story: [
          "Priya, 41, never learned to swim as a child. Every summer she told her friends, \"I'm just not a water person.\" When her nephew asked her to come to the pool with him, she felt embarrassed to admit she could not swim.",
          "She signed up for adult lessons and almost quit after the first one, thinking, \"Everyone else is better than me.\" Her instructor suggested she compare herself only with where she was last week. She changed her thought to \"I can float now, and next I'm working on breathing.\" By the end of the season she could swim a slow length of the pool, and she joined her nephew at last.",
        ],
        point: "Changing her words from a fixed label to a next step made it possible for Priya to keep going through the awkward early stage.",
      },
      exercise: {
        title: "Rewrite three limiting statements",
        steps: [
          "Think of three things you often say about yourself that sound fixed or final.",
          "Write each one down exactly as you usually say it.",
          "Rewrite each one using \"yet,\" a strategy, or a next step.",
          "Read your rewritten statements aloud and notice how they feel.",
        ],
        fields: [
          { id: "statement-1", label: "Limiting statement 1 and my rewrite", kind: "long", placeholder: "\"I'm terrible with money.\" Rewrite: \"I'm learning to track my spending, starting with one week.\"" },
          { id: "statement-2", label: "Limiting statement 2 and my rewrite", kind: "long" },
          { id: "statement-3", label: "Limiting statement 3 and my rewrite", kind: "long" },
        ],
        minutes: 7,
      },
      practice: {
        kind: "question",
        prompt: "You are asked to learn a new computer system at work. You hear yourself thinking, \"I'm too old to pick up new technology.\" How could you rewrite this thought in a growth-oriented way?",
        examples: [
          { text: "\"New technology takes me a bit longer, and that's fine. I'll ask for a short demo and practice the main tasks first.\"", why: "It is honest about the difficulty and adds a practical strategy." },
          { text: "\"I've learned new systems before. I don't know this one yet, but I can learn it step by step.\"", why: "It uses past evidence and the word \"yet\" to leave room for progress." },
          { text: "\"I'll write down the three things I use most and learn those first.\"", why: "It moves straight to a small, concrete next step." },
        ],
        lookFors: [
          "Does your rewrite stay honest about how it feels now?",
          "Does it include \"yet,\" a strategy, or a next step?",
          "Would this version make you more likely to try?",
        ],
        cues: [
          { anyOf: ["yet"], say: "Adding \"yet\" kept the door open, which is the heart of growth-oriented thinking." },
          { anyOf: ["practice", "ask", "step", "learn", "first"], say: "You named a way to learn, which turns a fixed label into a plan." },
        ],
      },
      reflection: [
        "In which areas of your life do you tend to think in a fixed way?",
        "Where do you already think in a growth-oriented way, and what helps you there?",
        "What is one skill you would like to improve if you knew progress was possible?",
      ],
      takeaways: [
        "Fixed thinking treats ability as set; growth-oriented thinking treats it as something that develops.",
        "Most people use both, depending on the topic.",
        "Rewrite limiting statements with \"yet,\" a strategy, or a next step.",
        "An honest rewrite works better than forced positivity.",
      ],
    },
    // 4
    {
      id: "resilience-04",
      number: 4,
      title: msg("Find Your Motivation"),
      skill: msg("Identify what genuinely motivates you and link your goals to your personal values."),
      minutes: 8,
      intro: [
        "Motivation is often treated like a feeling that either arrives or does not. Feelings come and go, though. Motivation that lasts usually comes from reasons that truly matter to you.",
        "In this lesson you will learn the difference between motivation that comes from inside and motivation that comes from outside, how values can give you reasons to act, and you will name three things that genuinely move you.",
      ],
      learn: [
        {
          heading: "Inside reasons and outside reasons",
          paragraphs: [
            "Some reasons to act come from outside you: a reward, a deadline, approval, or avoiding trouble. These can be useful, especially for short tasks. Other reasons come from inside: enjoyment, curiosity, a sense of meaning, or wanting to live by your values.",
            "Inside reasons tend to keep you going longer, because they do not disappear when the reward ends or nobody is watching. Most goals have a mix of both. It helps to know which ones are really driving you.",
          ],
        },
        {
          heading: "Values are your compass",
          paragraphs: [
            "Values are the qualities you want your life to show, such as kindness, learning, health, family, creativity, fairness, independence, or adventure. A value is never finished. You do not complete kindness; you keep choosing it.",
            "When a goal connects to a value, it gains a deeper reason. \"Walk three times a week\" can feel like a chore. \"Walk three times a week because I want energy to play with my grandchildren\" carries meaning that a schedule alone does not.",
          ],
        },
        {
          heading: "Ask \"why\" a few times",
          paragraphs: [
            "A simple way to find your real reason is to ask \"why does this matter to me?\" and then ask it again about your answer. After two or three rounds, you usually reach something important.",
          ],
          bullets: [
            "\"I want to learn Spanish.\" Why? \"To talk with my partner's relatives.\"",
            "Why does that matter? \"I want them to feel I care about their family.\"",
            "The value underneath: connection and respect.",
          ],
        },
      ],
      example: {
        title: "Tomasz and the guitar in the corner",
        story: [
          "Tomasz, 47, bought a guitar three years ago and played it only a handful of times. He kept telling himself he should practice because he had spent money on it, but that reason never got him to pick it up.",
          "One evening he asked himself why he had wanted to play in the first place. He remembered singing with his father when he was young and how close he felt to him then. He realized the real reason was to bring music back into his family. He began playing simple songs with his teenage daughter on Sunday evenings, and practicing stopped feeling like an obligation.",
        ],
        point: "Guilt about money did not move Tomasz. A reason rooted in his values did.",
      },
      exercise: {
        title: "Three things that genuinely motivate you",
        steps: [
          "Think of times when you worked hard on something without needing to be pushed.",
          "Ask what drew you in: the people, the learning, the result, the enjoyment, or the meaning.",
          "Write down three things that genuinely motivate you.",
          "For each one, name the value underneath it.",
        ],
        fields: [
          { id: "motivator-1", label: "Motivator 1 and the value under it", kind: "short", placeholder: "Helping someone solve a problem. Value: being useful." },
          { id: "motivator-2", label: "Motivator 2 and the value under it", kind: "short" },
          { id: "motivator-3", label: "Motivator 3 and the value under it", kind: "short" },
        ],
        minutes: 6,
      },
      practice: {
        kind: "question",
        prompt: "Pick one goal you have right now. Ask yourself \"why does this matter to me?\" two or three times. What deeper reason do you find?",
        examples: [
          { text: "\"I want to cook at home more. Why? To save money and eat better. Why does that matter? So I feel more in control of my life and can take care of myself.\"", why: "It moves from a practical reason to a personal value: self-care and independence." },
          { text: "\"I want to finish my course. Why? To get a better job. Why? Because I want to show myself I can follow through.\"", why: "It finds an inside reason that will stay meaningful even on hard days." },
        ],
        lookFors: [
          "Did you ask \"why\" more than once?",
          "Does your final reason feel personal and true, not only sensible?",
          "Can you see a value inside your answer?",
        ],
        cues: [
          { anyOf: ["because", "so that", "so i", "matters"], say: "You followed the reason deeper, which is how motivation finds solid ground." },
          { anyOf: ["family", "care", "health", "learn", "proud", "connect", "help"], say: "You reached a value, and goals tied to values tend to hold up when energy dips." },
        ],
      },
      reflection: [
        "Which of your current goals are driven mostly by outside reasons, and which by inside ones?",
        "What value would you like to show more of in your daily life?",
        "When did you last feel truly motivated, and what made it feel that way?",
      ],
      takeaways: [
        "Lasting motivation comes from reasons that matter to you.",
        "Inside reasons usually last longer than outside ones.",
        "Linking a goal to a value gives it deeper meaning.",
        "Asking \"why\" a few times helps you find your real reason.",
      ],
    },
    // 5
    {
      id: "resilience-05",
      number: 5,
      title: msg("Build Habits That Support Your Goals"),
      skill: msg("Choose one small, realistic habit and set it up so it is easy to repeat for a week."),
      minutes: 8,
      intro: [
        "Big goals are reached through small actions repeated over time. Habits are those repeated actions. When something becomes a habit, it takes less willpower and fits more naturally into your day.",
        "In this lesson you will learn how to make a habit small enough to start, how to attach it to your existing routine, and how to respond kindly when you miss a day. Then you will choose one habit to practice for seven days.",
      ],
      learn: [
        {
          heading: "Start smaller than you think",
          paragraphs: [
            "Many people choose habits that are too big, such as \"exercise for an hour every day\" or \"read a book a week.\" These can be hard to keep up on busy or tired days.",
            "A small habit is so easy you could do it even on a bad day: two minutes of stretching, one page of a book, filling a water bottle in the morning. Once the habit feels automatic, you can grow it if you want to. Starting small is not lowering your standards. It is building a foundation.",
          ],
        },
        {
          heading: "Link it to something you already do",
          paragraphs: [
            "New habits stick more easily when they are attached to something already in your day. Use the pattern \"After I…, I will…\"",
          ],
          bullets: [
            "\"After I pour my morning coffee, I will write one line in a notebook.\"",
            "\"After I brush my teeth at night, I will set out clothes for tomorrow.\"",
            "\"After I park the car at work, I will take three slow breaths before going in.\"",
          ],
        },
        {
          heading: "Make it easy and forgive the gaps",
          paragraphs: [
            "Remove small barriers. Put the book on your pillow, the walking shoes by the door, the fruit at the front of the fridge. The fewer steps between you and the habit, the better.",
            "You will miss days. That is part of building any habit. A missed day does not erase your progress. The helpful response is simply to start again the next day, without guilt or making up for it. A useful rule for yourself: \"If I miss a day, I just do the next one.\"",
          ],
        },
      ],
      example: {
        title: "Grace and the two-minute tidy",
        story: [
          "Grace, 55, works long shifts as a nurse and often came home to a cluttered kitchen that made her feel more tired. She tried cleaning for half an hour every evening but gave up after a few days because she was exhausted.",
          "She changed her plan to a two-minute tidy: after she put her keys in the bowl, she cleared the counter by the door. That was all. Some days she did more because she was already started. On the days she forgot, she simply did it the next evening. After a month, the kitchen felt calmer, and the habit felt like part of coming home.",
        ],
        point: "A habit small enough to fit into a tiring day lasted far longer than an ambitious plan that relied on energy Grace did not always have.",
      },
      exercise: {
        title: "A seven-day small habit",
        steps: [
          "Choose one goal that matters to you.",
          "Pick one small habit that supports it, small enough to do on a difficult day.",
          "Write it in the form \"After I…, I will…\"",
          "Decide one way to make it easier, such as placing something where you will see it.",
          "Practice it for seven days. If you miss a day, start again the next day with no guilt.",
        ],
        fields: [
          { id: "habit-goal", label: "The goal this habit supports", kind: "short" },
          { id: "habit-plan", label: "After I…, I will…", kind: "short", placeholder: "After I make breakfast, I will drink a full glass of water." },
          { id: "habit-easy", label: "How I will make it easier", kind: "short" },
          { id: "habit-notes", label: "Notes from my seven days", kind: "long", placeholder: "Day 1: done. Day 2: forgot, started again on day 3." },
        ],
        minutes: 6,
      },
      practice: {
        kind: "scenario",
        prompt: "You planned a small daily habit, and on day four you forget completely. You think, \"I've ruined it, so what's the point.\" What could you say to yourself instead?",
        examples: [
          { text: "\"I missed one day, and I did three. I'll just do it tomorrow.\"", why: "It notices the progress already made and moves straight to the next day." },
          { text: "\"Forgetting tells me I need a better reminder. I'll put a note by the kettle.\"", why: "It treats the miss as information and adjusts the setup instead of blaming yourself." },
        ],
        lookFors: [
          "Does your answer move on to the next day rather than giving up?",
          "Does it notice what you have already done?",
          "Does it avoid guilt or punishment?",
        ],
        cues: [
          { anyOf: ["tomorrow", "next day", "start again", "keep going"], say: "You chose to start again, which is the most important habit skill there is." },
          { anyOf: ["reminder", "note", "easier", "change"], say: "You looked at the setup instead of blaming yourself, which makes the habit easier to keep." },
        ],
      },
      reflection: [
        "What is a habit you already do without thinking, and how did it become automatic?",
        "Where in your day is there a natural place to attach a new small habit?",
        "How do you usually treat yourself when you miss a day, and how would you like to treat yourself?",
      ],
      takeaways: [
        "Small, repeated actions are how big goals are reached.",
        "Make a habit small enough to do on a difficult day.",
        "Attach it to something you already do.",
        "A missed day is not failure. Just do the next one.",
      ],
    },
    // 6
    {
      id: "resilience-06",
      number: 6,
      title: msg("Overcome Procrastination"),
      skill: msg("Understand why you delay a task and break it into three small, doable steps."),
      minutes: 8,
      intro: [
        "Procrastination is putting off something you intend to do, even when you know waiting may make things harder. It is very common, and it is rarely about laziness. More often, it is a way of avoiding an uncomfortable feeling.",
        "In this lesson you will learn some common reasons people delay, how to spot your own reason, and a simple method for turning a postponed task into small steps you can actually start.",
      ],
      learn: [
        {
          heading: "Why people put things off",
          paragraphs: [
            "Delaying usually gives short-term relief from a feeling, even though the task is still waiting. Knowing which feeling you are avoiding helps you choose the right response.",
          ],
          bullets: [
            "The task feels too big or unclear, so you do not know where to start.",
            "You worry about doing it badly or being judged.",
            "The task is boring or unpleasant.",
            "You feel tired, overloaded, or low in energy.",
            "You are not sure the task really matters to you.",
          ],
        },
        {
          heading: "Make the first step tiny and clear",
          paragraphs: [
            "A task like \"sort out my taxes\" or \"clean the garage\" is really a project with many parts. When the first step is vague, your mind tends to avoid it.",
            "Break the task into steps so small and clear that each one could be done in about ten to fifteen minutes. A good first step starts with an action word and is specific: \"Find last year's tax papers in the drawer\" rather than \"deal with taxes.\"",
          ],
        },
        {
          heading: "Get started, then decide",
          paragraphs: [
            "Starting is often the hardest part. Once you begin, it usually becomes easier to continue. Try agreeing with yourself to work on the task for just ten minutes. When the time is up, you can stop or keep going.",
            "It also helps to reduce distractions for those minutes: put your phone in another room, close extra tabs, and have what you need ready. If worry about doing it badly is the reason, give yourself permission to make a rough first version that you can improve later.",
          ],
        },
      ],
      example: {
        title: "Hassan's application form",
        story: [
          "Hassan, 34, wanted to apply for a community grant for his neighborhood garden project. The form sat on his desk for three weeks. Each time he looked at it, he felt overwhelmed and found something else to do.",
          "When he thought about why, he realized he was worried his writing would not sound professional. He broke the task into three steps: read the form and highlight the questions, write rough answers in plain words, then ask his friend Ana to read it. He did the first step that evening in fifteen minutes. A week later the application was sent.",
        ],
        point: "Naming the real reason for the delay and making the first step small helped Hassan move from stuck to started.",
      },
      exercise: {
        title: "Break one postponed task into three steps",
        steps: [
          "Choose one task you have been putting off.",
          "Write down the main reason you think you have been delaying it.",
          "Break the task into three small steps, each starting with an action word.",
          "Choose when you will do the first step, and make it no longer than fifteen minutes.",
        ],
        fields: [
          { id: "task", label: "The task I have been postponing", kind: "short" },
          { id: "reason", label: "Why I think I have been delaying it", kind: "short", placeholder: "It feels too big, and I don't know where to begin." },
          { id: "steps", label: "My three small steps", kind: "long", placeholder: "1. Find the papers. 2. Make a list of what is missing. 3. Call the office about one question." },
          { id: "first-step-time", label: "When I will do step one", kind: "short" },
        ],
        minutes: 6,
      },
      practice: {
        kind: "role-play",
        prompt: "Imagine a friend tells you, \"I've been meaning to book a medical checkup for months, but I keep putting it off.\" What could you say to help them take a first step, without lecturing?",
        examples: [
          { text: "\"That happens to a lot of people. What feels hardest about it? Maybe we could just find the phone number together now.\"", why: "It is understanding, asks about the reason, and offers a tiny first step." },
          { text: "\"Would it help to set a ten-minute window tomorrow morning just to call? You don't have to do anything else.\"", why: "It makes the task small and time-limited, which makes starting easier." },
        ],
        lookFors: [
          "Does your answer sound kind rather than critical?",
          "Does it help find one small first step?",
          "Does it ask about the reason for the delay?",
        ],
        cues: [
          { anyOf: ["what feels", "why", "hardest", "worried"], say: "You asked about the reason behind the delay, which helps choose a step that actually fits." },
          { anyOf: ["now", "ten minutes", "first step", "just", "together"], say: "You offered a small, clear first step, which is often all it takes to get moving." },
        ],
      },
      reflection: [
        "Which reason for procrastinating do you notice most often in yourself?",
        "What kinds of tasks do you tend to put off, and what do they have in common?",
        "What helps you get started when you finally do begin?",
      ],
      takeaways: [
        "Procrastination is usually about avoiding a feeling, not laziness.",
        "Naming the reason helps you choose the right response.",
        "Break tasks into small steps that start with an action word.",
        "Starting for ten minutes often makes it easier to continue.",
      ],
    },
    // 7
    {
      id: "resilience-07",
      number: 7,
      title: msg("Stay Motivated When Progress Is Slow"),
      skill: msg("Set realistic expectations and notice small signs of progress that keep you going."),
      minutes: 8,
      intro: [
        "At the start of a new goal, energy is often high. Then comes the middle stretch, when the newness has worn off and results seem slow. This is when many people give up, even though they may be closer than they think.",
        "In this lesson you will learn why progress often feels slower than it is, how to set expectations that match reality, and how to notice the small signs of progress that are easy to overlook.",
      ],
      learn: [
        {
          heading: "Progress is rarely a straight line",
          paragraphs: [
            "Most real progress looks like a bumpy path that slowly rises. There are good weeks, flat weeks, and weeks that feel like a step back. That pattern is normal for learning a skill, changing a habit, or working toward any meaningful goal.",
            "If you expect steady improvement every week, a flat stretch can feel like failure. If you expect ups and downs, a flat stretch is just part of the journey.",
          ],
        },
        {
          heading: "Measure what you do, not only the result",
          paragraphs: [
            "Results often take time and depend on things outside your control. Actions are something you can see and count today. Shifting some attention from outcomes to effort helps you notice progress sooner.",
          ],
          bullets: [
            "Outcome: \"I want to feel fitter.\" Action: \"I walked four times this week.\"",
            "Outcome: \"I want to speak French well.\" Action: \"I practiced ten minutes on five days.\"",
            "Outcome: \"I want a calmer home.\" Action: \"I cleared one shelf.\"",
          ],
        },
        {
          heading: "Look for small signs",
          paragraphs: [
            "Small signs of progress are easy to miss because they are quiet. They might be that something feels a little easier, that you started without as much resistance, or that you recovered faster after a hard day.",
            "Try comparing yourself with where you were a month ago, not with other people or with your final goal. Writing small wins down, even briefly, gives you something to look back on when motivation dips.",
          ],
        },
      ],
      example: {
        title: "Mei's slow return to running",
        story: [
          "Mei, 44, started running again after a long break. In the first month she felt she was getting nowhere. She was still slow and still out of breath on hills, and she nearly stopped.",
          "A friend suggested she keep a simple notebook. Looking back after a few weeks, Mei saw that she had gone from walking most of the route to running most of it, that she no longer dreaded putting on her shoes, and that she slept better on running days. None of these were dramatic, but together they showed real change.",
        ],
        point: "Writing down small signs helped Mei see progress that her day-to-day feelings had missed.",
      },
      exercise: {
        title: "Three small signs of progress",
        steps: [
          "Choose a goal you have been working on for a while.",
          "Think back to when you first started. What was it like then?",
          "Write down three small signs that something has changed, however small.",
          "Read them back and notice how they make you feel about continuing.",
        ],
        fields: [
          { id: "progress-goal", label: "The goal I am working on", kind: "short" },
          { id: "sign-1", label: "Small sign of progress 1", kind: "short", placeholder: "I start without arguing with myself as much." },
          { id: "sign-2", label: "Small sign of progress 2", kind: "short" },
          { id: "sign-3", label: "Small sign of progress 3", kind: "short" },
        ],
        minutes: 5,
      },
      practice: {
        kind: "question",
        prompt: "You have been working on a goal for six weeks, and today you feel you have achieved nothing. What could you remind yourself of to stay realistic and keep going?",
        examples: [
          { text: "\"Six weeks ago I wasn't doing this at all. Showing up regularly is already progress.\"", why: "It compares with the starting point and values the effort itself." },
          { text: "\"Flat weeks are normal. I'll look back at my notes and find one thing that's easier now.\"", why: "It sets a realistic expectation and turns to evidence of small change." },
        ],
        lookFors: [
          "Does your answer compare you with your own starting point?",
          "Does it accept that progress can be uneven?",
          "Does it name a small sign or a next action?",
        ],
        cues: [
          { anyOf: ["started", "weeks ago", "before", "used to"], say: "You compared yourself with where you began, which shows progress that feelings can hide." },
          { anyOf: ["normal", "ups and downs", "slow", "patient", "takes time"], say: "You set a realistic expectation, which protects your motivation through the slower stretches." },
        ],
      },
      reflection: [
        "When have you nearly given up on something, only to see progress later?",
        "What actions could you count this week, apart from results?",
        "How could you remind yourself of small wins when motivation is low?",
      ],
      takeaways: [
        "Progress is usually bumpy, not a straight line.",
        "Counting your actions shows progress sooner than waiting for results.",
        "Compare yourself with your own starting point.",
        "Small signs of progress are worth writing down.",
      ],
    },
    // 8
    {
      id: "resilience-08",
      number: 8,
      title: msg("Adapt to Change"),
      skill: msg("Respond constructively when plans change by preparing a flexible alternative plan."),
      minutes: 8,
      intro: [
        "Plans change. A job shifts, a relationship ends, someone gets sick, money gets tight, or something you counted on does not happen. Change can be unsettling even when it is positive, because it brings uncertainty.",
        "In this lesson you will learn how to tell what you can and cannot control, how to stay flexible about the route while keeping your direction, and how to prepare an alternative plan before you need one.",
      ],
      learn: [
        {
          heading: "Sort what you can and cannot control",
          paragraphs: [
            "When something changes, it helps to divide the situation into two lists. One list holds what is outside your control: other people's decisions, the weather, the economy, the past. The other holds what you can influence: your next action, how you prepare, who you ask for help, and how you look after yourself.",
            "Putting your energy into the second list helps you feel less helpless. It does not mean the first list does not matter. It means you choose where your effort can make a difference.",
          ],
        },
        {
          heading: "Keep the direction, change the route",
          paragraphs: [
            "When a plan stops working, it is easy to feel that the whole goal is lost. Often, the goal can stay while the way of reaching it changes.",
            "Ask yourself: what is the purpose behind this plan? If your plan was to take an evening class to learn a skill and the class is cancelled, the purpose is learning. Other routes might be an online course, a library book, or a friend who can teach you.",
          ],
        },
        {
          heading: "Prepare a plan B",
          paragraphs: [
            "A simple \"if… then…\" plan helps you respond calmly instead of reacting in the moment. Thinking ahead about likely obstacles makes them feel less like disasters when they happen.",
          ],
          bullets: [
            "\"If it rains on my walking day, then I'll do a stretching video at home.\"",
            "\"If my shift changes, then I'll move my study time to the morning.\"",
            "\"If the plan falls through, then I'll call my friend and decide together what to do next.\"",
          ],
        },
      ],
      example: {
        title: "Olumide's new city",
        story: [
          "Olumide, 39, had planned to move closer to his parents. At the last minute, the apartment he had arranged fell through. He felt angry and stuck, and for a day he thought about cancelling the move entirely.",
          "After talking it through with his sister, he wrote down what he could still control. His goal was to be near his family, not to live in that specific apartment. He arranged a short-term room nearby, kept his moving date, and spent his first weeks looking for a longer-term home. The plan looked different, but it still took him where he wanted to go.",
        ],
        point: "Keeping the purpose clear and changing the route let Olumide adapt instead of giving up on what mattered.",
      },
      exercise: {
        title: "Create an alternative plan",
        steps: [
          "Choose a goal or situation where things might not go as planned.",
          "Write down the purpose behind your plan: what you really want from it.",
          "List one or two things that could get in the way.",
          "For each one, write an \"if… then…\" alternative.",
        ],
        fields: [
          { id: "plan-situation", label: "The goal or situation", kind: "short" },
          { id: "plan-purpose", label: "The purpose behind my plan", kind: "short", placeholder: "To spend more time with friends." },
          { id: "plan-obstacles", label: "What could get in the way", kind: "long" },
          { id: "plan-b", label: "My \"if… then…\" alternatives", kind: "long", placeholder: "If the dinner is cancelled, then I'll suggest a walk on the weekend instead." },
        ],
        minutes: 7,
      },
      practice: {
        kind: "scenario",
        prompt: "You planned a weekend away to rest, but a family commitment comes up and you have to stay home. You feel disappointed. How could you respond constructively?",
        examples: [
          { text: "\"I'm disappointed, and that's okay. The real goal was rest, so I'll keep Sunday afternoon free just for me.\"", why: "It accepts the feeling, finds the purpose, and changes the route." },
          { text: "\"I can't change the commitment, but I can rebook the trip for next month and plan a quiet evening this weekend.\"", why: "It separates what is out of control from what can be done, and makes a plan B." },
        ],
        lookFors: [
          "Does your answer allow yourself to feel disappointed?",
          "Does it keep the purpose while changing the plan?",
          "Does it name something you can still control?",
        ],
        cues: [
          { anyOf: ["instead", "another", "rebook", "next month", "alternative", "plan b"], say: "You found another route to the same purpose, which is what flexibility looks like." },
          { anyOf: ["disappointed", "okay", "frustrated", "sad"], say: "You made room for the feeling first, which makes a flexible response easier." },
        ],
      },
      reflection: [
        "How do you usually react when a plan changes unexpectedly?",
        "What is one change in your life that turned out differently than you feared?",
        "Where could an \"if… then…\" plan help you in the next month?",
      ],
      takeaways: [
        "Separate what you can control from what you cannot.",
        "Keep the purpose; be flexible about the route.",
        "\"If… then…\" plans help you respond calmly to obstacles.",
        "Disappointment is normal, and it can sit alongside a new plan.",
      ],
    },
    // 9
    {
      id: "resilience-09",
      number: 9,
      title: msg("Set Meaningful Goals"),
      skill: msg("Turn a personal goal into a clear, realistic plan with achievable milestones."),
      minutes: 9,
      intro: [
        "A goal gives your energy a direction. When a goal is vague, it is hard to know where to start or how you are doing. When it is clear and realistic, it becomes something you can work on a little at a time.",
        "In this lesson you will learn how to make a goal clear and meaningful, how to check that it is realistic, and how to break it into milestones you can reach along the way.",
      ],
      learn: [
        {
          heading: "Make it clear",
          paragraphs: [
            "A clear goal answers a few simple questions: what exactly do I want to do, by when, and how will I know I have done it? \"Get healthier\" is a wish. \"Cook a home meal four evenings a week for the next two months\" is a goal you can act on.",
            "It also helps to phrase goals as something you will do rather than something you will stop. \"Go to bed by eleven\" is often easier to work toward than \"stop staying up late.\"",
          ],
        },
        {
          heading: "Make it meaningful and realistic",
          paragraphs: [
            "Check that the goal connects to something you care about, as you explored in the motivation lesson. Then check that it fits your real life: your time, energy, money, health, and other responsibilities.",
            "A realistic goal stretches you a little without overwhelming you. If you feel a sinking feeling when you read it, try making it smaller or giving it more time. A goal you reach and then build on is worth more than an ambitious one you abandon.",
          ],
        },
        {
          heading: "Break it into milestones",
          paragraphs: [
            "Milestones are stepping stones between where you are and where you want to be. They give you a sense of progress and a natural moment to check in and adjust.",
          ],
          bullets: [
            "Goal: hold a simple conversation in Italian in six months.",
            "Milestone 1 (month 1): learn greetings and introduce myself.",
            "Milestone 2 (month 3): order food and ask for directions.",
            "Milestone 3 (month 5): have a ten-minute chat with a practice partner.",
            "First action: download a language app and do one lesson today.",
          ],
        },
      ],
      example: {
        title: "Esther's savings goal",
        story: [
          "Esther, 61, had wanted to visit her childhood village abroad for years, but the trip always felt out of reach. Her goal was simply \"save for the trip someday,\" and someday never came.",
          "She made it clearer: she would save enough for the trip within eighteen months. She checked her budget and decided on a realistic monthly amount. She set milestones at six, twelve, and eighteen months, and her first action was opening a separate savings account that weekend. Seeing the first milestone reached gave her a lift, and she started planning the route with her grandson.",
        ],
        point: "Turning a vague wish into a clear goal with milestones made Esther's dream feel possible and gave her moments to celebrate along the way.",
      },
      exercise: {
        title: "One goal with achievable milestones",
        steps: [
          "Choose one personal goal that matters to you.",
          "Write it clearly: what you will do, by when, and how you will know you have done it.",
          "Write why it matters to you in one sentence.",
          "Break it into two to four milestones.",
          "Name one first action you can take this week.",
        ],
        fields: [
          { id: "goal-clear", label: "My clear goal", kind: "short", placeholder: "Walk a 5-kilometer route without stopping by the end of spring." },
          { id: "goal-why", label: "Why it matters to me", kind: "short" },
          { id: "goal-milestones", label: "My milestones", kind: "long" },
          { id: "goal-first-action", label: "My first action this week", kind: "short" },
        ],
        minutes: 8,
      },
      practice: {
        kind: "question",
        prompt: "A friend says their goal is \"to be more organized.\" What questions could you ask to help them turn it into a clear, realistic goal?",
        examples: [
          { text: "\"What part of your life feels most disorganized right now? What would 'organized' look like there?\"", why: "It narrows a vague goal down to something specific and visible." },
          { text: "\"What could you do in a week that would make it feel a little better? How would you know it worked?\"", why: "It looks for a realistic timeframe and a clear way to notice success." },
        ],
        lookFors: [
          "Do your questions help make the goal specific?",
          "Do they ask about a timeframe or how success would look?",
          "Do they keep the goal realistic for your friend's life?",
        ],
        cues: [
          { anyOf: ["what part", "specific", "look like", "exactly"], say: "You helped narrow the goal down, which makes it much easier to act on." },
          { anyOf: ["by when", "week", "month", "how would you know", "realistic"], say: "You asked about time or success, which turns a wish into a goal." },
        ],
      },
      reflection: [
        "Which goal in your life has stayed a vague wish for a long time?",
        "What makes a goal feel realistic to you rather than overwhelming?",
        "How would you like to mark reaching a milestone?",
      ],
      takeaways: [
        "A clear goal says what, by when, and how you will know.",
        "Meaningful and realistic goals are easier to keep working on.",
        "Milestones show progress and give natural moments to adjust.",
        "Every goal starts with one first action.",
      ],
    },
    // 10
    {
      id: "resilience-10",
      number: 10,
      title: msg("Your Personal Growth Action Plan"),
      skill: msg("Combine resilience, motivation, habits, and goals into a realistic 30-day plan."),
      minutes: 10,
      intro: [
        "Over this course you have looked at resilience, mistakes, ways of thinking, motivation, habits, procrastination, slow progress, change, and goal setting. Each one is useful on its own. Together, they form a practical way of moving toward what matters to you.",
        "In this final lesson you will bring these skills together into a 30-day personal growth plan. The plan is meant to be simple, flexible, and kind, something you can actually follow and adjust as life happens.",
      ],
      learn: [
        {
          heading: "Choose one focus",
          paragraphs: [
            "It can be tempting to change many things at once. A single focus for thirty days usually works better, because your energy is not spread thin. Choose one area that matters to you right now: your health, a skill, a relationship, your home, your work, or your well-being.",
            "Connect it to a value, so you remember why it matters on the days when motivation is low.",
          ],
        },
        {
          heading: "Plan in weekly steps",
          paragraphs: [
            "Thirty days is about four weeks. Give each week one simple step that builds on the one before. Start small in week one, so you build momentum rather than burn out.",
          ],
          bullets: [
            "Week 1: start a small daily habit linked to your focus.",
            "Week 2: keep the habit and add one small related action.",
            "Week 3: tackle a task you have been putting off, broken into steps.",
            "Week 4: review your progress and decide what to continue.",
          ],
        },
        {
          heading: "Plan for slips and notice progress",
          paragraphs: [
            "Every plan meets obstacles. Decide in advance what you will do if you slip: \"If I miss two days, I'll restart with the smallest version of my habit.\" This turns a setback into a planned response instead of a reason to quit.",
            "Also decide how you will notice progress. You might keep a short note each evening, check in with a friend once a week, or simply look back at the end of each week and write one thing that went well.",
          ],
        },
      ],
      example: {
        title: "Daniel's month of reconnecting",
        story: [
          "Daniel, 50, had drifted from his friends after a demanding few years at work. He wanted to feel more connected, but the idea felt big and awkward. He chose \"reconnecting with friends\" as his focus for thirty days, because friendship and belonging mattered deeply to him.",
          "Week one, he sent one short message a day to someone he had not spoken to in a while. Week two, he arranged one phone call. Week three, he invited two friends for a meal. Week four, he looked back over his notes. When a busy stretch at work made him miss several days, his plan said to restart with one message, so he did. By the end of the month he had seen four old friends and planned a monthly get-together.",
        ],
        point: "A simple weekly plan, linked to a value and prepared for slips, helped Daniel turn a big wish into steady action.",
      },
      exercise: {
        title: "My 30-day personal growth plan",
        steps: [
          "Choose one focus for the next thirty days and connect it to a value.",
          "Write one simple step for each of the four weeks, starting small.",
          "Decide how you will notice progress along the way.",
          "Decide what you will do if you slip, so a missed day does not end the plan.",
          "Put the start date somewhere you will see it.",
        ],
        fields: [
          { id: "plan-focus", label: "My focus and why it matters to me", kind: "short", placeholder: "Feeling more rested, because I want energy for my family." },
          { id: "plan-week-1", label: "Week 1 step", kind: "short" },
          { id: "plan-week-2", label: "Week 2 step", kind: "short" },
          { id: "plan-week-3-4", label: "Week 3 and week 4 steps", kind: "long" },
          { id: "plan-progress-slip", label: "How I'll notice progress, and what I'll do if I slip", kind: "long", placeholder: "I'll write one line each evening. If I miss two days, I'll restart with the smallest step." },
        ],
        minutes: 10,
      },
      practice: {
        kind: "scenario",
        prompt: "You have postponed an important goal after experiencing a setback. What is one small step you can take today?",
        examples: [
          { text: "\"I'll spend ten minutes looking at my notes and write down the very next action.\"", why: "It is small, time-limited, and gets you back in touch with the goal without pressure." },
          { text: "\"I'll tell one friend I'm restarting, so I have some support.\"", why: "It uses connection, one of the strongest parts of resilience, to make restarting easier." },
          { text: "\"I'll do the smallest version of my habit today, even if it's just two minutes.\"", why: "It restarts momentum with an action that fits even a difficult day." },
        ],
        lookFors: [
          "Is your step small enough to do today?",
          "Does it treat the setback as a pause rather than the end?",
          "Is it kind to yourself rather than demanding?",
        ],
        cues: [
          { anyOf: ["today", "ten minutes", "two minutes", "small", "just"], say: "You chose a step small enough for today, which is the most reliable way to restart." },
          { anyOf: ["friend", "tell", "ask", "support", "partner"], say: "You brought another person in, which can make returning to a goal feel much lighter." },
          { anyOf: ["again", "restart", "back", "continue"], say: "You framed this as starting again, which treats the setback as part of the journey." },
        ],
      },
      reflection: [
        "Which lesson in this course felt most useful to you, and why?",
        "What will you do differently the next time you face a setback?",
        "How will you know, thirty days from now, that your plan made a difference?",
      ],
      takeaways: [
        "One clear focus for thirty days is easier to follow than many changes at once.",
        "Weekly steps that start small build steady momentum.",
        "Planning for slips turns setbacks into planned restarts.",
        "Resilience, motivation, habits, and goals work best together.",
      ],
    },
  ],
};
