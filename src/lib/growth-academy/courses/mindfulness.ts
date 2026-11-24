import { msg } from "@/lib/i18n/translate";
import type { GrowthCourse } from "@/lib/growth-academy/types";

export const mindfulnessCourse: GrowthCourse = {
  id: "mindfulness",
  title: msg("Mindfulness Training"),
  shortTitle: msg("Mindfulness"),
  tagline: msg("Step out of autopilot and notice what is happening right now."),
  description: msg("Ten short, practical lessons on present-moment awareness: breathing, thoughts, the body, listening, eating, stress, gratitude, and a routine that fits your day."),
  goal: msg("Help you develop present-moment awareness, steadier attention, and a calmer way of meeting automatic reactions in everyday life."),
  objectives: [
    msg("Notice when you are on autopilot and gently bring your attention back to the present moment."),
    msg("Use your breath and body as simple anchors for attention during the day."),
    msg("Observe thoughts and reactions with curiosity, and create a short pause before you respond."),
    msg("Build a realistic five-minute mindfulness routine that fits your own life."),
  ],
  difficulty: "beginner",
  cover: "ripples",
  colors: ["#2f6f8f", "#dcedf4"],
  achievement: {
    id: "mindfulness-explorer",
    title: msg("Mindfulness Explorer"),
    text: msg("You finished all ten lessons and built a mindfulness routine of your own."),
  },
  lessons: [
    // 1
    {
      id: "mindfulness-01",
      number: 1,
      title: msg("What Is Mindfulness?"),
      skill: msg("Tell the difference between running on autopilot and being present, and return to the present on purpose."),
      minutes: 7,
      intro: [
        "Mindfulness is a plain, practical skill: paying attention to what is happening right now, on purpose, with a curious and kind attitude. It does not need special clothes, a quiet room, or any belief system. You can practice it while washing a cup.",
        "In this lesson you will learn what mindfulness is and what it is not, how to spot autopilot in your own day, and how to come back to the present in a few seconds. You will finish with a two-minute noticing practice.",
      ],
      learn: [
        {
          heading: "Being present versus autopilot",
          paragraphs: [
            "Autopilot is the mode where your body does one thing and your mind is somewhere else. You drive home and cannot remember the journey. You finish a snack and realize you never tasted it. You read a page three times because your thoughts were on tomorrow's meeting.",
            "Autopilot is not a fault. It is how the brain saves effort, and it is useful for routine tasks. The trouble starts when it runs your whole day, so you miss pleasant moments and react to stress before you even notice it.",
            "Being present means your attention is with what you are actually doing, seeing, hearing, or feeling. It is not about emptying your mind. It is about knowing where your mind is.",
          ],
        },
        {
          heading: "What mindfulness is not",
          paragraphs: [
            "A few common ideas get in the way, so it helps to clear them up early.",
          ],
          bullets: [
            "It is not stopping your thoughts. Thoughts will keep coming, and that is normal.",
            "It is not forcing yourself to feel calm. Sometimes you notice that you feel restless, and that counts.",
            "It is not a treatment for health conditions. It is an everyday attention skill.",
            "It is not a test you pass or fail. Every time you notice your mind has wandered, you are practicing.",
          ],
        },
        {
          heading: "A quick way back: name three things",
          paragraphs: [
            "When you catch yourself on autopilot, try this simple step. Pause and silently name three things you can notice right now: one thing you see, one thing you hear, and one thing you feel, such as your feet on the floor or the air on your hands.",
            "Keep it simple and factual: \"Grey mug. Fridge humming. Cool air on my wrists.\" There is no right answer. The point is that naming what is here brings your attention back to here.",
          ],
        },
      ],
      example: {
        title: "Daniel's morning commute",
        story: [
          "Daniel, 38, takes the same bus to work every day. One morning he arrived at his stop and realized he had spent the whole ride replaying an argument from the night before. He felt tense and could not remember a single thing he had seen.",
          "The next day he tried something small. Each time the bus stopped, he noticed one sight and one sound: a child's red backpack, the hiss of the doors. The argument still came to mind, but he kept returning to the ride. He got off feeling a little more awake and less wound up.",
        ],
        point: "Autopilot is ordinary, and you do not have to fight it. A small, repeated cue, like each bus stop, can bring you back to the present many times a day.",
      },
      exercise: {
        title: "Two minutes in the present moment",
        steps: [
          "Sit or stand somewhere comfortable. You can keep your eyes open or lower your gaze.",
          "Start the timer. Notice what you can see, hear, and feel, one thing at a time.",
          "When your mind wanders to plans or memories, notice where it went and gently come back to what is around you.",
          "When the timer ends, write down what you noticed and where your mind tended to go.",
        ],
        fields: [
          { id: "noticed", label: "Three things I noticed in the present moment", kind: "long", placeholder: "Light through the window, a car outside, my hands warm on the cup." },
          { id: "wandered", label: "Where my mind wandered to", kind: "short", placeholder: "My to-do list for this afternoon." },
        ],
        minutes: 4,
        timerSeconds: 120,
      },
      practice: {
        kind: "question",
        prompt: "Think about yesterday. When were you most on autopilot, and what is one small cue you could use today to come back to the present?",
        examples: [
          { text: "\"I scrolled my phone through lunch without noticing my food. Today I'll take one look at my plate before the first bite.\"", why: "It names a specific autopilot moment and a small, realistic cue that is easy to remember." },
          { text: "\"I was on autopilot doing the dishes. Next time I'll notice the warm water on my hands first.\"", why: "It turns a routine task into a reminder, using a simple physical sensation as the cue." },
        ],
        lookFors: [
          "Does your answer name a real moment from your own day?",
          "Is your cue small enough to actually use today?",
          "Does it connect to something you can see, hear, or feel?",
        ],
        cues: [
          { anyOf: ["notice", "noticing", "look", "listen", "feel"], say: "You chose a cue based on your senses, which is one of the quickest ways back to the present." },
          { anyOf: ["today", "next time", "tomorrow"], say: "You planned when to use your cue, which makes it much more likely to happen." },
        ],
      },
      reflection: [
        "Which parts of your day usually pass by on autopilot?",
        "When do you already feel most present, even without trying?",
        "What would you like to notice more of this week?",
      ],
      takeaways: [
        "Mindfulness means paying attention to the present on purpose, with curiosity.",
        "Autopilot is normal. The skill is noticing it and coming back.",
        "A wandering mind is not failure; noticing it is the practice.",
        "Naming one thing you see, hear, and feel is a quick way back.",
      ],
    },
    // 2
    {
      id: "mindfulness-02",
      number: 2,
      title: msg("The Power of Your Breath"),
      skill: msg("Use the natural breath as an anchor and gently return your attention to it when the mind wanders."),
      minutes: 8,
      intro: [
        "Your breath is always with you, which makes it a handy place to rest your attention. In this lesson you will learn to use the breath as an anchor: something to come back to whenever your mind drifts.",
        "You will learn how to watch the breath without changing it, what to do when your attention wanders, and how to keep the practice gentle and comfortable. You will finish with a three-minute guided breathing practice.",
      ],
      learn: [
        {
          heading: "Why the breath works as an anchor",
          paragraphs: [
            "An anchor in mindfulness is a steady point you can return to. The breath is a good one because it is always happening in the present. You cannot breathe yesterday's breath or tomorrow's.",
            "You do not need to breathe in a special way. Mindful breathing simply means noticing the breath that is already here: the cool air at the nose, the rise of the chest or belly, the small pause before the next breath begins on its own.",
          ],
        },
        {
          heading: "Returning, again and again",
          paragraphs: [
            "Within a few breaths, your mind will probably wander. That is expected. The core of the practice is the moment you realize you have drifted and gently bring your attention back.",
            "Try a light inner label when you notice: \"thinking\" or \"wandering,\" then return to the next breath. Use a friendly tone with yourself, as you might guide a puppy back to its bed. Coming back ten times in three minutes is ten repetitions of the skill, not ten mistakes.",
          ],
          bullets: [
            "Notice that the mind has wandered.",
            "Silently label it: \"thinking.\"",
            "Feel the next breath, wherever it is easiest to notice.",
          ],
        },
        {
          heading: "Keep it gentle and safe",
          paragraphs: [
            "Breathe at a natural, comfortable pace. Never hold your breath, and do not force long or deep breaths. If you feel dizzy, lightheaded, or uncomfortable, stop, breathe normally, and open your eyes if they were closed.",
            "If focusing on the breath feels unpleasant for you, that is fine. You can use another anchor instead, such as the feeling of your hands resting in your lap or your feet on the floor.",
          ],
        },
      ],
      example: {
        title: "Aisha before the school run",
        story: [
          "Aisha, 41, has a hectic half hour every morning getting two children fed, dressed, and out the door. She used to start the day already rushing in her head before her feet hit the floor.",
          "She began sitting on the edge of her bed for a few breaths after her alarm. She felt the air going in and out and counted five breaths. Most mornings her mind jumped to lunch boxes by breath two, and she simply started again. The mornings stayed busy, but she noticed she began them a little less hurried inside.",
        ],
        point: "Mindful breathing does not need a long session or a quiet house. A few noticed breaths at a regular moment can become a steady habit.",
      },
      exercise: {
        title: "Three-minute guided breathing",
        steps: [
          "Sit comfortably with your back supported if you like. Rest your hands wherever they are easy.",
          "Start the timer. Breathe naturally. Notice where you feel the breath most clearly: nose, chest, or belly.",
          "Follow each breath in and each breath out. Do not hold your breath or try to make it deeper.",
          "When your mind wanders, label it \"thinking\" and return to the next breath. If you feel dizzy, stop and breathe normally.",
          "When the timer ends, note where you felt the breath and how often you came back.",
        ],
        fields: [
          { id: "breath-place", label: "Where I felt my breath most clearly", kind: "short", placeholder: "In my belly, rising and falling." },
          { id: "breath-notes", label: "What happened when my mind wandered", kind: "long", placeholder: "I drifted to work a few times and came back each time." },
        ],
        minutes: 5,
        timerSeconds: 180,
      },
      practice: {
        kind: "mindful",
        prompt: "Take three slow breaths. What do you notice about your body and attention?",
        examples: [
          { text: "\"My shoulders dropped a little on the second breath. My attention kept jumping to an email, then came back.\"", why: "It notices both a body sensation and where attention went, without judging either one." },
          { text: "\"I felt cool air at my nose and a slight tightness in my chest. My mind felt busy but I could follow each breath.\"", why: "It describes plain sensations and an honest sense of the mind, which is exactly what noticing means." },
        ],
        lookFors: [
          "Does your answer describe at least one physical sensation?",
          "Does it say something about where your attention went?",
          "Is it a description rather than a judgment of how well you did?",
        ],
        cues: [
          { anyOf: ["shoulder", "chest", "belly", "nose", "hands", "jaw", "feet"], say: "You noticed a specific place in your body, which shows real attention to sensation." },
          { anyOf: ["mind", "attention", "thought", "wander", "drift"], say: "You noticed where your attention went, which is the heart of mindful breathing." },
          { anyOf: ["calm", "slower", "relaxed", "settled", "busy", "restless"], say: "You named how you felt honestly, whatever it was, and that kind of honest noticing is the skill." },
        ],
      },
      reflection: [
        "At what moment in your day could a few mindful breaths fit naturally?",
        "Where in your body is the breath easiest for you to notice?",
        "How do you usually speak to yourself when your mind wanders, and how might you make that kinder?",
      ],
      takeaways: [
        "The breath is always in the present, so it makes a reliable anchor.",
        "Notice the natural breath. There is no need to change it.",
        "Coming back after wandering is the practice, not a mistake.",
        "Never hold your breath, and stop if you feel dizzy.",
      ],
    },
    // 3
    {
      id: "mindfulness-03",
      number: 3,
      title: msg("Observe Your Thoughts"),
      skill: msg("Notice thoughts as passing events in the mind instead of automatically believing them or acting on them."),
      minutes: 8,
      intro: [
        "Your mind produces thoughts all day: plans, worries, memories, comments, and stories. Many of them arrive so quickly that you treat them as facts and react before you notice.",
        "In this lesson you will practice stepping back a little so you can see a thought as a thought. You will learn simple ways to name thoughts, notice their patterns, and choose what to do next. You will finish by observing your thoughts for two minutes and describing them without judgment.",
      ],
      learn: [
        {
          heading: "A thought is not always a fact",
          paragraphs: [
            "A thought like \"I always mess this up\" can feel completely true in the moment. But it is a sentence your mind produced, often from habit, tiredness, or worry. It may be partly true, not true at all, or simply unhelpful right now.",
            "Mindfulness does not ask you to argue with thoughts or replace them with positive ones. It asks you to notice them first. That small gap gives you a choice about whether to believe a thought, act on it, or let it pass.",
          ],
        },
        {
          heading: "Ways to step back from a thought",
          paragraphs: [
            "These simple techniques help you watch thoughts instead of being swept along by them.",
          ],
          bullets: [
            "Add a frame: change \"I'm going to fail\" to \"I'm having the thought that I'm going to fail.\"",
            "Label the type: \"planning,\" \"worrying,\" \"remembering,\" \"judging,\" or \"imagining.\"",
            "Picture thoughts as passing traffic: you can watch the cars go by from the sidewalk without getting in each one.",
            "Notice repeats: \"Ah, this is the 'not enough time' story again.\"",
          ],
        },
        {
          heading: "Describe, do not judge",
          paragraphs: [
            "When you notice a thought, describe it the way a friendly reporter would: what it said, what kind of thought it was, and how strong it felt. Avoid adding a second layer such as \"I shouldn't think that\" or \"I'm bad at this.\"",
            "If a judgment does appear, you can notice that too: \"There's a judging thought.\" Everything that shows up can be observed, including criticism of yourself.",
          ],
        },
      ],
      example: {
        title: "Kenji and the unanswered message",
        story: [
          "Kenji, 52, sent his adult daughter a message and saw that she had read it but not replied. Within minutes his mind had built a full story: she was upset with him, he had said the wrong thing, their relationship was slipping.",
          "He paused and tried labeling. \"Worrying. Imagining. This is the 'I've upset someone' story.\" The story did not vanish, but it loosened its grip. He went back to cooking dinner. Later his daughter replied that she had been on a train with poor signal.",
        ],
        point: "Seeing a thought as a thought creates room to wait, check, or carry on, instead of reacting to a story that may not be true.",
      },
      exercise: {
        title: "Two minutes of watching thoughts",
        steps: [
          "Sit comfortably and take a couple of natural breaths to settle.",
          "Start the timer. Instead of focusing on the breath, let your attention rest on whatever thoughts appear.",
          "As each thought comes, give it a short label such as \"planning\" or \"remembering,\" and let it pass.",
          "If you get caught up in a thought, notice that kindly and return to watching.",
          "When the timer ends, describe a few of the thoughts in neutral words, without judging them.",
        ],
        fields: [
          { id: "thought-types", label: "Types of thoughts I noticed", kind: "short", placeholder: "Planning, worrying, a memory from last week." },
          { id: "thought-describe", label: "Describe one or two thoughts without judgment", kind: "long", placeholder: "A planning thought about groceries. A worry thought about a work deadline that felt strong at first." },
        ],
        minutes: 5,
        timerSeconds: 120,
      },
      practice: {
        kind: "scenario",
        prompt: "You make a small mistake at work and the thought appears: \"Everyone will think I'm useless.\" How could you notice this thought without automatically believing it?",
        examples: [
          { text: "\"I'm having the thought that everyone will think I'm useless. That's a worrying thought, not a fact.\"", why: "It adds a frame that separates you from the thought and labels its type." },
          { text: "\"There's the 'not good enough' story again. I can fix the mistake and see what actually happens.\"", why: "It recognizes a familiar pattern and turns attention back to a practical next step." },
        ],
        lookFors: [
          "Does your answer name the thought as a thought?",
          "Does it avoid arguing with or scolding yourself?",
          "Does it leave room for a calm next step?",
        ],
        cues: [
          { anyOf: ["having the thought", "a thought", "just a thought", "thinking"], say: "You named it as a thought, which creates a little space between you and it." },
          { anyOf: ["worry", "worrying", "story", "judging", "pattern"], say: "You labeled the kind of thought, which makes familiar patterns easier to spot next time." },
          { anyOf: ["fix", "next step", "check", "see what"], say: "You moved toward a practical next step instead of staying stuck in the story." },
        ],
      },
      reflection: [
        "Which kind of thought shows up most often for you: planning, worrying, remembering, or judging?",
        "Is there a familiar story your mind tells you that you could learn to recognize?",
        "How might your day change if you paused before believing your first thought?",
      ],
      takeaways: [
        "Thoughts are events in the mind, not always facts.",
        "Framing and labeling thoughts creates a small, useful gap.",
        "Describe thoughts neutrally, and notice judgments as more thoughts.",
        "Noticing first gives you a choice about what to do next.",
      ],
    },
    // 4
    {
      id: "mindfulness-04",
      number: 4,
      title: msg("Mindful Body Awareness"),
      skill: msg("Scan the body with curious attention and notice tension, comfort, and neutral sensations without needing to change them."),
      minutes: 9,
      intro: [
        "Your body often notices stress, tiredness, or ease before your thinking mind does. A tight jaw, raised shoulders, or a clenched hand can be early signals worth hearing.",
        "In this lesson you will learn to move your attention slowly through the body, noticing sensations as they are. You will learn what to do with tension, discomfort, or numbness, and you will finish with a four-minute body scan.",
      ],
      learn: [
        {
          heading: "What body awareness means",
          paragraphs: [
            "Body awareness is simply noticing physical sensations: warmth, coolness, pressure, tingling, heaviness, lightness, tightness, or ease. Some areas will feel neutral or you may feel very little, and that is a normal finding too.",
            "You are not trying to relax every muscle or reach a special state. You are getting to know what is present in your body right now, with the same curiosity you would bring to a new place.",
          ],
        },
        {
          heading: "Common places tension hides",
          paragraphs: [
            "Many people carry everyday tension in a few familiar places. Checking these during the day can help you notice stress early.",
          ],
          bullets: [
            "Forehead and the space between the eyebrows.",
            "Jaw and tongue, which may be pressed or clenched.",
            "Shoulders, which often creep up toward the ears.",
            "Hands, which may be gripping a phone, wheel, or pen tightly.",
            "Stomach, which can feel tight or held in.",
          ],
        },
        {
          heading: "Meeting tension and discomfort",
          paragraphs: [
            "When you find tension, you can simply notice it: \"tightness in my shoulders.\" If softening happens on its own, let it. If not, that is fine; noticing is enough.",
            "If you live with pain or an area feels uncomfortable to focus on, you can briefly note \"discomfort here\" and move on to the next area. You never need to stay with a sensation that feels too much. Body scanning is an attention practice, not a way to assess or treat a health problem, so talk to a health professional about any pain that concerns you.",
          ],
        },
      ],
      example: {
        title: "Rosa at her desk",
        story: [
          "Rosa, 57, works long hours at a computer as a bookkeeper. By the afternoon she often had a sore neck and felt drained, but she only noticed when she stood up at the end of the day.",
          "She set a reminder to check in with her body after each coffee break. The first time, she found her shoulders lifted and her jaw clenched. She noticed them, let her shoulders lower a little, and went back to work. Over the weeks, she started catching the tension earlier and took short stretches when she found it.",
        ],
        point: "Regular, brief check-ins help you notice what the body is telling you before small tension turns into a long, tiring day.",
      },
      exercise: {
        title: "A short body scan",
        steps: [
          "Sit or lie down in a position that is comfortable for you. Let your breath be natural.",
          "Start the timer. Bring attention to your feet, then slowly move upward: legs, hips, belly, back, chest, hands, arms, shoulders, neck, and face.",
          "In each area, notice any sensation: warmth, pressure, tightness, ease, or nothing much at all.",
          "If an area is painful or uncomfortable, simply note it and move on to the next one.",
          "When the timer ends, write down what you noticed.",
        ],
        fields: [
          { id: "tension-areas", label: "Where I noticed tension", kind: "short", placeholder: "Shoulders and jaw." },
          { id: "body-notes", label: "Other sensations I noticed", kind: "long", placeholder: "My feet felt warm and heavy. My hands were tingly. My belly felt neutral." },
        ],
        minutes: 6,
        timerSeconds: 240,
      },
      practice: {
        kind: "mindful",
        prompt: "Pause where you are now. Without moving, check your forehead, jaw, shoulders, and hands. What do you notice?",
        examples: [
          { text: "\"My jaw is clenched and my shoulders are up. My hands are fine. I can feel my shoulders lower a bit as I notice them.\"", why: "It checks each area, names what is there, and lets change happen without forcing it." },
          { text: "\"I don't feel much in my forehead. My hands are tight on my phone. That's interesting.\"", why: "It accepts a neutral area as a valid finding and stays curious rather than critical." },
        ],
        lookFors: [
          "Does your answer mention at least one specific area of the body?",
          "Does it describe sensations rather than judging them as good or bad?",
          "Does it allow for areas where you feel very little?",
        ],
        cues: [
          { anyOf: ["jaw", "shoulder", "forehead", "hands", "neck", "stomach"], say: "You checked a specific area, which makes the body scan concrete and useful." },
          { anyOf: ["tight", "tense", "clenched", "heavy", "warm", "loose", "soft"], say: "You described the sensation in clear words, which is exactly what body awareness asks." },
          { anyOf: ["nothing", "neutral", "not much", "don't feel"], say: "You noticed a neutral area honestly, and that is a real observation too." },
        ],
      },
      reflection: [
        "Where does your body tend to hold tension during a busy day?",
        "What early body signals tell you that you are tired or stressed?",
        "When could a short body check-in fit into your routine?",
      ],
      takeaways: [
        "Body awareness means noticing sensations as they are.",
        "Tension often gathers in the jaw, shoulders, hands, and stomach.",
        "Noticing is enough; you do not have to force relaxation.",
        "If an area hurts, simply note it and move on.",
      ],
    },
    // 5
    {
      id: "mindfulness-05",
      number: 5,
      title: msg("Mindful Listening"),
      skill: msg("Give someone your full attention while they speak, without interrupting or planning your reply."),
      minutes: 8,
      intro: [
        "Most of us listen with half our attention. The other half is checking a phone, waiting for a turn to talk, or rehearsing what to say next. People can usually tell.",
        "In this lesson you will learn what mindful listening looks like, how to catch yourself planning a response, and simple ways to show you are truly hearing someone. You will finish by practicing full-attention listening in a real conversation.",
      ],
      learn: [
        {
          heading: "Listening as a mindfulness practice",
          paragraphs: [
            "Mindful listening uses the same skill as mindful breathing: you choose an anchor and come back to it when your attention drifts. Here the anchor is the other person's words, tone, and face.",
            "Your mind will still produce thoughts while they speak: opinions, advice, your own similar story. You do not have to stop these. Just notice them, set them aside for now, and return to listening.",
          ],
        },
        {
          heading: "Catching the urge to plan or interrupt",
          paragraphs: [
            "A common sign of autopilot listening is that you are forming your reply while the other person is mid-sentence. Another is jumping in to fix, finish their sentence, or share your own experience.",
          ],
          bullets: [
            "Notice the urge: \"I want to jump in.\" Let it pass.",
            "Wait for a natural pause, then allow one more breath before you speak.",
            "Put your phone face down or out of reach.",
            "If you lose track, it is fine to say, \"Sorry, could you say that last part again?\"",
          ],
        },
        {
          heading: "Showing that you heard",
          paragraphs: [
            "When the person finishes, a short reflection shows you were really with them. You might repeat the core of what they said in your own words: \"So the move has been more tiring than you expected.\"",
            "An open question can invite more without steering: \"What has been the hardest part?\" Hold back on advice unless they ask for it. Often, being heard is what people want most.",
          ],
        },
      ],
      example: {
        title: "Tomás and his friend's news",
        story: [
          "Tomás, 44, met an old friend for coffee. His friend began talking about caring for an aging parent. Tomás noticed he was already planning to share his own family story and some advice about care homes.",
          "He silently noted, \"planning,\" and brought his attention back to his friend's face and voice. When she paused, he waited a breath and said, \"It sounds like you're stretched really thin.\" She nodded and kept talking, sharing more than she had in years. At the end she thanked him for listening.",
        ],
        point: "Setting aside your own reply for a few minutes lets the other person feel heard, and you often learn far more than you would have by talking.",
      },
      exercise: {
        title: "One conversation with full attention",
        steps: [
          "Choose a conversation today with a family member, friend, or colleague. It can be short.",
          "Put your phone away and turn your body toward the person.",
          "Listen to their words and tone. When you notice yourself planning a reply, label it \"planning\" and return to listening.",
          "When they pause, wait one breath, then reflect back what you heard or ask one open question.",
          "Afterwards, note what you noticed about them and about your own attention.",
        ],
        fields: [
          { id: "listen-who", label: "Who I listened to and what about", kind: "short", placeholder: "My neighbor, about her new job." },
          { id: "listen-noticed", label: "What I noticed when I listened fully", kind: "long", placeholder: "I wanted to give advice twice. When I didn't, she told me more about how she felt." },
        ],
        minutes: 8,
      },
      practice: {
        kind: "role-play",
        prompt: "A coworker says, \"This week has been a mess. My project changed three times and I'm behind on everything.\" You notice yourself about to give advice. What could you say instead that shows you are listening?",
        examples: [
          { text: "\"Three changes in one week? That sounds really frustrating.\"", why: "It reflects the key detail and the feeling, showing you heard both." },
          { text: "\"That's a lot. What's been the hardest part of it?\"", why: "It acknowledges their situation and invites them to say more with an open question." },
          { text: "\"I'm sorry, that sounds exhausting. Do you want to talk it through, or just vent for a minute?\"", why: "It checks what they need before offering anything, which respects their choice." },
        ],
        lookFors: [
          "Does your answer reflect something the person actually said?",
          "Does it hold off on advice unless they ask?",
          "Does it invite them to share more if they want to?",
        ],
        cues: [
          { anyOf: ["sounds", "it seems", "so you"], say: "You reflected back what you heard, which helps the other person feel understood." },
          { anyOf: ["what", "how", "do you want"], say: "You asked an open question, which gives them room to keep talking." },
          { anyOf: ["frustrating", "exhausting", "a lot", "hard", "tough", "stressful"], say: "You named the feeling behind their words, which shows you were listening closely." },
        ],
      },
      reflection: [
        "With whom do you find it hardest to listen without planning your reply?",
        "What usually pulls your attention away during conversations?",
        "Who in your life might appreciate a few minutes of your full attention this week?",
      ],
      takeaways: [
        "Mindful listening uses the other person's words as your anchor.",
        "Notice the urge to plan or interrupt, and let it pass.",
        "Wait one breath before you speak.",
        "Reflecting back and asking open questions shows you truly heard.",
      ],
    },
    // 6
    {
      id: "mindfulness-06",
      number: 6,
      title: msg("Mindful Eating"),
      skill: msg("Use the senses to bring full attention to one eating experience, noticing taste, texture, smell, and habits."),
      minutes: 8,
      intro: [
        "Eating is one of the most common things we do on autopilot. Many meals happen in front of a screen, on the move, or while thinking about something else entirely.",
        "In this lesson you will use eating as a chance to practice attention. You will explore sight, smell, texture, and taste, and notice your own eating habits with curiosity. This lesson is about attention, not about what or how much you eat. You will finish with one mindful eating experience.",
      ],
      learn: [
        {
          heading: "Eating with all your senses",
          paragraphs: [
            "Mindful eating slows down one moment so you can notice it fully. Each sense gives you something to observe.",
          ],
          bullets: [
            "Sight: colors, shapes, shine, and the way the food sits on the plate or in your hand.",
            "Smell: notice the aroma before the first bite, and whether it changes as you bring it close.",
            "Texture: crunchy, soft, smooth, chewy, juicy, or crumbly in your mouth.",
            "Taste: sweet, salty, sour, bitter, or savory, and how the flavor changes as you chew.",
            "Sound: the crunch of an apple or the crackle of toast.",
          ],
        },
        {
          heading: "Noticing eating habits with curiosity",
          paragraphs: [
            "As you pay attention, you may notice habits: reaching for the next bite before you have finished the last one, eating faster when stressed, or not tasting food while scrolling. These are simply observations, not things to judge.",
            "This practice is not a diet and has no rules about foods being good or bad. You can eat mindfully with any food you enjoy, from a piece of fruit to a slice of cake.",
          ],
        },
        {
          heading: "Keeping it practical and safe",
          paragraphs: [
            "Choose a food that is safe for you, and always respect allergies, intolerances, and any eating plan a health professional has given you. You do not need a special meal; a few bites at the start of an ordinary meal are enough.",
            "If thinking closely about food feels stressful for you, it is completely fine to skip this practice or use a drink, such as tea or water, instead. You can also apply the same attention to a different everyday activity.",
          ],
        },
      ],
      example: {
        title: "Priya's lunch break",
        story: [
          "Priya, 35, usually eats lunch at her desk while answering emails. One day she noticed she had finished her sandwich and could not remember what it tasted like.",
          "The next day she stepped away from the screen for the first five minutes of lunch. She looked at her food, smelled the warm bread, and noticed the crunch of the lettuce and the sharpness of the mustard. She found she enjoyed the meal more and came back to her emails feeling a little refreshed.",
        ],
        point: "Even a few mindful bites can turn an ordinary meal into a moment of real presence and enjoyment.",
      },
      exercise: {
        title: "One mindful eating experience",
        steps: [
          "Choose a small piece of food or a drink that is safe for you and that you enjoy.",
          "Before tasting, look at it closely and notice its color, shape, and smell.",
          "Take one small bite or sip. Notice the texture, temperature, and taste. Chew or sip slowly.",
          "Notice any urge to hurry to the next bite, and let it pass.",
          "Afterwards, write down what you noticed.",
        ],
        fields: [
          { id: "food-chosen", label: "What I chose", kind: "short", placeholder: "A slice of orange." },
          { id: "senses-noticed", label: "What I noticed with my senses", kind: "long", placeholder: "Bright color, sharp smell when I peeled it, juicy and a bit sour at first." },
          { id: "habit-noticed", label: "Any eating habit I noticed", kind: "short", placeholder: "I wanted to reach for the next piece right away." },
        ],
        minutes: 6,
      },
      practice: {
        kind: "question",
        prompt: "Think of the last thing you ate or drank. What do you remember about how it looked, smelled, felt, and tasted? What would you like to notice next time?",
        examples: [
          { text: "\"I had coffee but barely tasted it. Next time I'll notice the smell and the warmth of the cup before I drink.\"", why: "It honestly notes an autopilot moment and picks specific senses to try next time." },
          { text: "\"I remember the crunch of my toast but not the taste. I'd like to slow down for the first bite.\"", why: "It notices one sense that stood out and makes a small, realistic plan." },
        ],
        lookFors: [
          "Does your answer mention at least one of the senses?",
          "Is it curious rather than critical of what or how you ate?",
          "Is your plan for next time small and easy to try?",
        ],
        cues: [
          { anyOf: ["smell", "taste", "texture", "crunch", "warm", "color", "sweet", "salty"], say: "You focused on your senses, which is the core of mindful eating." },
          { anyOf: ["next time", "slow", "first bite", "first sip"], say: "You chose a small, gentle plan, which is the kind that tends to stick." },
        ],
      },
      reflection: [
        "When during the week do you most often eat on autopilot?",
        "Which sense do you notice least when you eat?",
        "Which meal or snack could be your next chance to eat mindfully?",
      ],
      takeaways: [
        "Mindful eating is about attention, not about rules or diets.",
        "Sight, smell, texture, taste, and sound all give you something to notice.",
        "Notice habits with curiosity rather than judgment.",
        "A few mindful bites or sips are enough to practice.",
      ],
    },
    // 7
    {
      id: "mindfulness-07",
      number: 7,
      title: msg("Managing Everyday Stress"),
      skill: msg("Recognize the early signs of a stressful moment and create a short pause before you respond."),
      minutes: 9,
      care: "This lesson is about ordinary daily stress and is not a treatment. If stress or worry feels overwhelming or goes on for weeks, please talk with a doctor or mental health professional. If you might harm yourself, contact local emergency services now.",
      intro: [
        "Stressful moments are part of everyday life: a missed train, a sharp email, a spilled drink, a crowded store. When they happen on autopilot, we often react in ways we later regret.",
        "In this lesson you will learn to spot the early signs of stress in your body and mind, and to create a short pause between what happens and how you respond. You will finish with a one-minute pause-and-breathe routine you can use anywhere.",
      ],
      learn: [
        {
          heading: "Recognizing a stressful moment",
          paragraphs: [
            "Stress often shows up in the body before you name it in words. Learning your own signals helps you notice sooner.",
          ],
          bullets: [
            "Body: a faster heartbeat, tight chest, clenched jaw, hot face, or knotted stomach.",
            "Thoughts: \"I can't deal with this,\" \"Why does this always happen,\" or racing to-do lists.",
            "Actions: rushing, snapping, sighing loudly, or reaching for your phone to escape.",
          ],
        },
        {
          heading: "The power of a pause",
          paragraphs: [
            "Between a stressful event and your response, there is a moment of choice. On autopilot, that moment is so short you do not see it. Mindfulness helps you stretch it a little.",
            "A pause does not mean ignoring the problem or pretending you are fine. It simply gives you a few seconds to notice what is happening so you can respond in a way that fits your values, rather than reacting from habit.",
          ],
        },
        {
          heading: "A simple pause-and-breathe routine",
          paragraphs: [
            "You can remember the routine with three words: stop, breathe, notice. It works standing in line, sitting at a desk, or before answering a message.",
          ],
          bullets: [
            "Stop: pause what you are doing for a moment, even mid-sentence or mid-step.",
            "Breathe: take a few natural, comfortable breaths. Do not hold your breath or force it.",
            "Notice: check what you feel in your body, what you are thinking, and what you need.",
            "Then choose your next step: respond, wait, ask for help, or take a short break.",
          ],
        },
      ],
      example: {
        title: "Grace and the late delivery",
        story: [
          "Grace, 49, runs a small catering business. One morning a supplier called to say an order would be two hours late. She felt her face go hot and was about to shout down the phone.",
          "Instead she said, \"Give me a moment,\" and took a few slow, natural breaths. She noticed her tight chest and the thought \"Everything is ruined.\" Then she asked herself what she actually needed. She calmly asked the supplier for a partial delivery and rearranged her prep order. The day was still hard, but she handled it without an argument she would regret.",
        ],
        point: "A brief pause does not remove the stress, but it can change your response from a reflex into a choice.",
      },
      exercise: {
        title: "One-minute pause and breathe",
        steps: [
          "Think of a mildly stressful moment from today or recent days, not the hardest one.",
          "Start the timer. Stop and let your body be still for a moment.",
          "Breathe naturally and comfortably. Do not hold your breath. Stop if you feel dizzy.",
          "Notice what you feel in your body and what thoughts are present.",
          "When the timer ends, write down what you noticed and one way you might respond next time.",
        ],
        fields: [
          { id: "stress-signs", label: "My early stress signs", kind: "short", placeholder: "Tight chest and talking fast." },
          { id: "stress-response", label: "How I might respond after a pause next time", kind: "long", placeholder: "Take three breaths, then ask what I actually need before I reply." },
        ],
        minutes: 4,
        timerSeconds: 60,
      },
      practice: {
        kind: "scenario",
        prompt: "You are running late, and a family member asks you a question you have already answered twice. You feel irritation rising. How could you create a short pause before you respond?",
        examples: [
          { text: "\"I'll stop for a second, take a breath, and notice I'm stressed about time. Then I'll say, 'I'm in a rush, can we talk about it tonight?'\"", why: "It uses stop, breathe, notice, and then chooses a calm, honest response." },
          { text: "\"I'll feel my feet on the floor and breathe once before I answer, so I don't snap.\"", why: "It uses a quick body anchor to create a pause in the moment." },
        ],
        lookFors: [
          "Does your answer include a pause before speaking?",
          "Does it notice what you are feeling?",
          "Does it lead to a response you would feel okay about later?",
        ],
        cues: [
          { anyOf: ["breath", "breathe", "pause", "stop", "moment"], say: "You built in a pause, which is the key step in responding instead of reacting." },
          { anyOf: ["notice", "stressed", "irritated", "frustrated", "rushed"], say: "You named what you were feeling, which helps you choose how to respond." },
          { anyOf: ["later", "tonight", "can we", "i need"], say: "You chose a calm, practical response that respects both you and the other person." },
        ],
      },
      reflection: [
        "What are your own early signs that stress is building?",
        "Which everyday situations would benefit most from a short pause?",
        "How would you like to respond the next time a small stress catches you off guard?",
      ],
      takeaways: [
        "Stress often shows up first in the body.",
        "A short pause turns a reflex into a choice.",
        "Stop, breathe, notice, then choose your next step.",
        "Pausing is not ignoring the problem; it helps you meet it more clearly.",
      ],
    },
    // 8
    {
      id: "mindfulness-08",
      number: 8,
      title: msg("Gratitude and Appreciation"),
      skill: msg("Notice and savor positive moments in everyday life without denying difficult feelings."),
      minutes: 7,
      intro: [
        "The mind tends to notice problems more readily than pleasant moments. Small good things, like a kind word or the smell of rain, can slip by unnoticed.",
        "In this lesson you will learn to notice and briefly savor positive experiences, while still allowing room for difficult feelings. You will finish by writing down three things you appreciate today.",
      ],
      learn: [
        {
          heading: "Noticing the good",
          paragraphs: [
            "Mindful appreciation is a way of paying attention to pleasant or meaningful moments as they happen. They are often small: sunlight on a wall, a warm shower, a message from a friend, a task finished.",
            "The key is to be specific. \"I'm grateful for my family\" is fine, but \"My brother called to check how my week went\" is easier to feel and remember.",
          ],
        },
        {
          heading: "Savoring a moment",
          paragraphs: [
            "Savoring means staying with a pleasant moment for a few extra seconds instead of rushing past it. You can do this with a simple sequence.",
          ],
          bullets: [
            "Notice: \"This is a nice moment.\"",
            "Stay: give it ten or fifteen seconds of attention.",
            "Feel: notice where you feel it in your body, such as warmth in your chest or a softer face.",
          ],
        },
        {
          heading: "Gratitude without denial",
          paragraphs: [
            "Appreciation is not about pretending everything is fine or telling yourself you should feel grateful. Hard days and painful feelings are real, and they deserve attention too.",
            "You can hold both: \"Today was stressful, and I appreciated my neighbor's help with the shopping.\" Using \"and\" instead of \"but\" lets both experiences be true at once. If you cannot find anything today, that is okay; noticing that honestly is still mindful.",
          ],
        },
      ],
      example: {
        title: "Oluwaseun on a hard week",
        story: [
          "Oluwaseun, 61, was going through a tough week after a family disagreement. A friend suggested writing down good things, but at first he felt it was forced and a bit dismissive of how he felt.",
          "He tried a gentler version. Each evening he wrote one difficult thing and one small thing he appreciated. \"Still upset about the argument, and the walk in the park was peaceful.\" He found it helped him see the whole day, not only the hardest part, without pretending the hard part away.",
        ],
        point: "Gratitude works best when it sits alongside honesty about difficult feelings, rather than replacing them.",
      },
      exercise: {
        title: "Three things I appreciate today",
        steps: [
          "Take a breath and think back over today, from waking until now.",
          "Look for three moments you appreciate. They can be very small.",
          "Make each one specific: what happened, who was there, what you noticed.",
          "For one of them, pause for a few seconds and notice how it feels to remember it.",
        ],
        fields: [
          { id: "appreciate-1", label: "Something I appreciate today", kind: "short", placeholder: "The barista remembered my order." },
          { id: "appreciate-2", label: "A second thing I appreciate", kind: "short" },
          { id: "appreciate-3", label: "A third thing I appreciate", kind: "short" },
        ],
        minutes: 5,
      },
      practice: {
        kind: "question",
        prompt: "Think of a recent day that was partly difficult. Can you describe one hard part and one thing you appreciated, using \"and\" to hold both?",
        examples: [
          { text: "\"Work was exhausting, and my partner made dinner so I could rest.\"", why: "It honestly names the hard part and the good part without one cancelling the other." },
          { text: "\"I felt lonely on Sunday, and the phone call with my cousin made me laugh.\"", why: "It keeps the difficult feeling real while noticing a specific moment of connection." },
        ],
        lookFors: [
          "Does your answer include both a difficult part and something you appreciated?",
          "Is the positive moment specific?",
          "Does it avoid telling yourself how you should feel?",
        ],
        cues: [
          { anyOf: ["and"], say: "You used \"and\" to hold both experiences, which keeps gratitude honest." },
          { anyOf: ["appreciated", "grateful", "thankful", "enjoyed", "liked"], say: "You named something you appreciated, which helps your attention notice it again." },
          { anyOf: ["called", "made", "helped", "walk", "laugh", "smiled"], say: "You described a specific moment, which makes appreciation easier to feel." },
        ],
      },
      reflection: [
        "What small, pleasant moments do you tend to rush past?",
        "How might you make room for gratitude on a hard day without denying how you feel?",
        "Who has done something recently that you appreciated but have not mentioned?",
      ],
      takeaways: [
        "Specific, small moments are easiest to appreciate.",
        "Savoring means staying with a good moment for a few extra seconds.",
        "Gratitude can sit alongside difficult feelings; use \"and,\" not \"but.\"",
        "You never have to force yourself to feel grateful.",
      ],
    },
    // 9
    {
      id: "mindfulness-09",
      number: 9,
      title: msg("Mindfulness in Daily Life"),
      skill: msg("Bring full attention to ordinary activities such as walking, working, cleaning, and conversations."),
      minutes: 8,
      intro: [
        "Mindfulness is not only for quiet moments set aside to practice. Its real value shows up in ordinary life: the walk to the store, a work task, folding laundry, or chatting with a friend.",
        "In this lesson you will learn how to turn everyday activities into mindfulness practice, how to use reminders, and how to keep it light. You will finish by choosing one daily activity and doing it mindfully.",
      ],
      learn: [
        {
          heading: "Everyday activities as practice",
          paragraphs: [
            "Almost any activity can become mindfulness practice if you give it your full attention. Here are a few ideas.",
          ],
          bullets: [
            "Walking: feel each foot touch the ground, notice the air on your skin, look at what is around you.",
            "Working: do one task at a time, notice when you switch to something else, return to the task.",
            "Cleaning: notice the warmth of the water, the smell of soap, the movement of your arms.",
            "Showering: feel the temperature and pressure of the water instead of planning the day.",
            "Conversations: listen to the other person's words and watch their face, as you practiced earlier.",
          ],
        },
        {
          heading: "Single-tasking",
          paragraphs: [
            "Doing several things at once often means doing each one on autopilot. Mindful single-tasking means choosing one activity and staying with it for a short while.",
            "Start small. You might decide to drink your morning tea without your phone, or to write one email without checking other tabs. When you notice yourself drifting to another task, note it and come back.",
          ],
        },
        {
          heading: "Reminders that help",
          paragraphs: [
            "Because autopilot is so strong, it helps to link mindfulness to something you already do. These links act as gentle reminders.",
          ],
          bullets: [
            "Every time you open a door, notice your hand on the handle.",
            "Every time you wait for the kettle, feel your feet on the floor.",
            "Every time you sit down in a vehicle, take one noticed breath before you start moving.",
          ],
        },
      ],
      example: {
        title: "Mei's evening dishes",
        story: [
          "Mei, 39, used to rush through washing the dishes while listening to podcasts and thinking about the next day. She often felt she never had a moment to herself.",
          "She decided to make the dishes her mindful activity. She turned off the audio and paid attention to the warm water, the bubbles, and the sound of plates on the rack. Her mind wandered often, and she kept coming back. After a week she noticed the ten minutes had started to feel like a short, quiet break rather than a chore.",
        ],
        point: "You do not need extra time for mindfulness. An activity you already do can become a regular moment of presence.",
      },
      exercise: {
        title: "One everyday activity, done mindfully",
        steps: [
          "Choose one activity you do every day, such as walking, showering, cleaning, or making a drink.",
          "Decide when you will do it mindfully today.",
          "While doing it, focus on what you see, hear, feel, and smell. Put other tasks and screens aside.",
          "When your mind wanders, notice it and come back to the activity.",
          "Afterwards, note what was different about doing it this way.",
        ],
        fields: [
          { id: "activity-chosen", label: "The activity I chose", kind: "short", placeholder: "Walking to the bus stop." },
          { id: "activity-noticed", label: "What I noticed doing it mindfully", kind: "long", placeholder: "I heard birds I'd never noticed and felt the ground under my shoes." },
        ],
        minutes: 7,
      },
      practice: {
        kind: "question",
        prompt: "Which everyday activity could you turn into a regular mindfulness moment, and what reminder could you link it to?",
        examples: [
          { text: "\"Brushing my teeth. I'll notice the taste of the toothpaste and the sound of the brush every morning.\"", why: "It picks a daily activity with clear sensations and a fixed time." },
          { text: "\"Walking from the parking lot to work. When I lock the car, that's my cue to start noticing.\"", why: "It links mindfulness to an existing action that happens every day." },
        ],
        lookFors: [
          "Does your answer name an activity you do regularly?",
          "Does it include a clear reminder or cue?",
          "Does it mention something you can notice with your senses?",
        ],
        cues: [
          { anyOf: ["every", "each", "when i"], say: "You linked mindfulness to a regular moment, which helps it become a habit." },
          { anyOf: ["walking", "brushing", "shower", "cleaning", "dishes", "cooking", "tea", "coffee"], say: "You chose a specific everyday activity, which makes the practice easy to start." },
          { anyOf: ["notice", "feel", "hear", "smell", "taste", "see"], say: "You included your senses, which keeps attention anchored in the present." },
        ],
      },
      reflection: [
        "Which daily activity do you most often rush through on autopilot?",
        "Where could single-tasking make a difference in your day?",
        "What existing habit could remind you to be present?",
      ],
      takeaways: [
        "Any everyday activity can become mindfulness practice.",
        "Single-tasking means staying with one thing for a short while.",
        "Linking mindfulness to existing habits creates natural reminders.",
        "You do not need extra time, just a different kind of attention.",
      ],
    },
    // 10
    {
      id: "mindfulness-10",
      number: 10,
      title: msg("Your Personal Mindfulness Routine"),
      skill: msg("Design a realistic daily mindfulness routine of about five minutes that fits your life and is easy to keep."),
      minutes: 9,
      intro: [
        "You have now tried several ways to practice mindfulness: noticing, breathing, watching thoughts, scanning the body, listening, eating, pausing, appreciating, and everyday activities.",
        "In this final lesson you will put the pieces together into a short daily routine that suits you. You will learn how to keep it realistic, how to restart after missed days, and you will finish by building your own five-minute mindfulness plan.",
      ],
      learn: [
        {
          heading: "Start small and realistic",
          paragraphs: [
            "A routine that is short and easy is more likely to last than one that is long and ambitious. Five minutes a day is a good starting point, and even two minutes counts on a busy day.",
            "Choose practices you actually liked in this course. If breathing felt good, start there. If body scanning was useful, include a short one. There is no single right combination.",
          ],
        },
        {
          heading: "Building your routine",
          paragraphs: [
            "A simple routine has three parts: when, what, and where.",
          ],
          bullets: [
            "When: link it to a moment you already have, such as after waking, after lunch, or before bed.",
            "What: pick one or two practices, for example two minutes of breathing and a short body check.",
            "Where: choose a spot that is easy to reach, such as the edge of your bed, a chair by the window, or your parked car.",
            "Extras: add one daily-life moment, such as mindful tea or a pause before opening emails.",
          ],
        },
        {
          heading: "When you miss a day",
          paragraphs: [
            "Everyone misses days. Illness, travel, family needs, and busy weeks happen. Missing a day is just another moment to notice, without blame.",
            "Treat restarting the same way you treat a wandering mind during practice: notice, and gently come back. You might keep a very short backup option, such as three noticed breaths, for days when five minutes feels like too much.",
          ],
        },
      ],
      example: {
        title: "Samuel's five-minute plan",
        story: [
          "Samuel, 66, recently retired and wanted to keep up what he had learned. He first planned twenty minutes every morning but kept skipping it, then felt annoyed with himself.",
          "He changed his plan to five minutes after breakfast: two minutes of breathing, a quick body scan, and one thing he appreciated. On busy days he took three breaths at the kitchen table instead. A month later he had kept going most days and found the short routine easy to return to.",
        ],
        point: "A small, flexible routine that you can restart easily is more useful than a perfect plan that is hard to keep.",
      },
      exercise: {
        title: "Build your five-minute mindfulness plan",
        steps: [
          "Look back over the lessons and pick one or two practices you found helpful.",
          "Choose when in your day your routine will happen, linked to something you already do.",
          "Choose where you will do it.",
          "Write a short backup option for busy days.",
          "Read your plan back and check that it feels realistic for your life right now.",
        ],
        fields: [
          { id: "plan-when", label: "When I will practice", kind: "short", placeholder: "After my morning coffee." },
          { id: "plan-where", label: "Where I will practice", kind: "short", placeholder: "The chair by the window." },
          { id: "plan-what", label: "What my five minutes will include", kind: "long", placeholder: "Two minutes of breathing, one minute body check, two minutes noticing sounds." },
          { id: "plan-backup", label: "My backup for busy days", kind: "short", placeholder: "Three noticed breaths before I leave the house." },
        ],
        minutes: 8,
      },
      practice: {
        kind: "scenario",
        prompt: "You have kept your routine for a week, then miss three days in a row because of a busy schedule. What could you say to yourself, and how would you restart?",
        examples: [
          { text: "\"Okay, I missed a few days. That happens. I'll do my three-breath backup tonight and my full routine tomorrow morning.\"", why: "It notices without blame and uses a small step to restart." },
          { text: "\"This is like my mind wandering in practice. I just come back. I'll start again after lunch today.\"", why: "It applies the core mindfulness skill of returning to the routine itself." },
        ],
        lookFors: [
          "Does your answer speak to yourself kindly?",
          "Does it include a clear, small step to restart?",
          "Does it avoid all-or-nothing thinking?",
        ],
        cues: [
          { anyOf: ["happens", "okay", "fine", "normal"], say: "You spoke to yourself kindly, which makes restarting much easier." },
          { anyOf: ["start again", "restart", "come back", "tomorrow", "tonight", "today"], say: "You planned a clear time to restart, which turns intention into action." },
          { anyOf: ["backup", "three breaths", "small", "short"], say: "You used a small backup step, which keeps the routine flexible and realistic." },
        ],
      },
      reflection: [
        "Which practice from this course felt most natural for you?",
        "What might get in the way of your routine, and how could you plan for it?",
        "How would you like mindfulness to fit into your life a month from now?",
      ],
      takeaways: [
        "A short, realistic routine is easier to keep than a long one.",
        "Choose when, what, and where, and link it to an existing habit.",
        "Have a tiny backup for busy days.",
        "Missing a day is a moment to notice and return, not a failure.",
      ],
    },
  ],
};
