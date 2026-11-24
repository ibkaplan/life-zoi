import { msg } from "@/lib/i18n/translate";
import type { GrowthCourse } from "@/lib/growth-academy/types";

export const emotionalIntelligenceCourse: GrowthCourse = {
  id: "emotional-intelligence",
  title: msg("Emotional Intelligence Training"),
  shortTitle: msg("Emotional Intelligence"),
  tagline: msg("Notice what you feel, understand why, and choose how you respond."),
  description: msg("Ten practical lessons on naming emotions, spotting triggers, pausing before you react, handling anger and worry, understanding other people, and speaking about feelings without blame. This is an educational course, not therapy."),
  goal: msg("Help you recognize, understand, and manage your emotions while developing empathy and healthier responses to other people."),
  objectives: [
    msg("Name your emotions clearly and notice what they are telling you."),
    msg("Recognize your triggers and pause long enough to choose a response."),
    msg("Handle anger, frustration, and worry in steadier, more constructive ways."),
    msg("Understand other people's perspectives, keep healthy boundaries, and express feelings without blame."),
  ],
  difficulty: "intermediate",
  cover: "heart",
  colors: ["#8a3f63", "#f5e1ea"],
  achievement: {
    id: "emotional-awareness",
    title: msg("Emotional Awareness"),
    text: msg("You completed Emotional Intelligence Training and built your own routine for noticing feelings and choosing how to respond."),
  },
  lessons: [
    // 1
    {
      id: "emotional-intelligence-01",
      number: 1,
      title: msg("Understanding Your Emotions"),
      skill: msg("Name what you feel with precise words, so emotions become useful information instead of a blur."),
      minutes: 8,
      intro: [
        "Emotions are part of every day, yet many of us describe them with only a few words: fine, stressed, annoyed, tired. In this lesson you will learn what emotions are, why they carry useful information, and how a wider vocabulary helps you understand yourself.",
        "You will look at how feelings show up in the body, thoughts, and urges, practice telling similar emotions apart, and finish by naming three emotions you felt recently.",
      ],
      learn: [
        {
          heading: "What an emotion is",
          paragraphs: [
            "An emotion is a short-lived response to something that matters to you. It usually has three parts: a body sensation, a set of thoughts, and an urge to do something. Fear might bring a tight chest, the thought \"this could go wrong,\" and an urge to avoid. Joy might bring warmth, the thought \"this is good,\" and an urge to share.",
            "Emotions are not good or bad in themselves. Even unpleasant ones have a job. They point to something you care about, something that feels at risk, or something you need.",
          ],
          bullets: [
            "Body: heat, tension, a racing heart, heaviness, lightness.",
            "Thoughts: what you tell yourself about the situation.",
            "Urges: to speak up, withdraw, move closer, fix, or get away.",
          ],
        },
        {
          heading: "Emotions as messages",
          paragraphs: [
            "A helpful way to treat a feeling is as a message, not an order. Sadness often signals a loss. Anger often signals that a boundary or value has been crossed. Anxiety often signals uncertainty about something important. Gratitude signals that something good has happened.",
            "Reading the message does not mean you must act on the urge. It means you have more information about what is going on, which makes a wiser choice easier.",
          ],
        },
        {
          heading: "Finding the right word",
          paragraphs: [
            "General words like \"upset\" or \"stressed\" can hide very different experiences. Upset could mean hurt, embarrassed, disappointed, or jealous, and each one asks for something different. A more exact word gives you a clearer next step.",
            "Try asking: \"If I had to choose a more specific word, what would it be?\" Then check it against your body. The right word often brings a small sense of \"yes, that's it.\"",
          ],
          bullets: [
            "Instead of \"bad\": disappointed, lonely, ashamed, discouraged, uneasy.",
            "Instead of \"angry\": irritated, resentful, offended, frustrated, betrayed.",
            "Instead of \"good\": relieved, content, proud, hopeful, grateful.",
          ],
        },
      ],
      example: {
        title: "Kofi's \"stressed\" evening",
        story: [
          "Kofi, 38, came home from work and told his partner he was \"just stressed.\" He snapped at a small question about dinner and then felt guilty. Later, sitting on the back step, he tried to name the feeling more exactly.",
          "He noticed tight shoulders and a heavy feeling in his stomach. The word that fit was not \"stressed\" but \"embarrassed.\" His manager had corrected a report in front of the team. Once he named it, he could tell his partner what had actually happened, and the evening felt easier for both of them.",
        ],
        point: "A precise word can turn a vague bad mood into something you understand and can talk about.",
      },
      exercise: {
        title: "Name three recent emotions",
        steps: [
          "Think back over the last few days and pick three moments that stood out, pleasant or unpleasant.",
          "For each moment, notice what you felt in your body and what you were thinking.",
          "Choose the most precise word you can for each emotion. Avoid \"fine,\" \"good,\" or \"bad.\"",
          "Next to each word, write what the emotion might have been telling you.",
        ],
        fields: [
          { id: "emotion-1", label: "Emotion 1: the moment, the word, and its message", kind: "short", placeholder: "Relieved: my test results came back clear. It told me I had been more worried than I admitted." },
          { id: "emotion-2", label: "Emotion 2: the moment, the word, and its message", kind: "short" },
          { id: "emotion-3", label: "Emotion 3: the moment, the word, and its message", kind: "short" },
        ],
        minutes: 6,
      },
      practice: {
        kind: "question",
        prompt: "A friend asks how you are, and your first answer is \"Fine, just a bit off today.\" Take a moment. What more precise word could describe how you really feel, and what might it be telling you?",
        examples: [
          { text: "\"Honestly, I feel a bit lonely. I think I miss having time with people this week.\"", why: "It replaces \"off\" with a specific feeling and connects it to a need." },
          { text: "\"I'm uneasy. I have a medical appointment tomorrow and it is on my mind.\"", why: "It names the feeling and the situation behind it, which makes support easier to offer." },
        ],
        lookFors: [
          "Does your answer use a more specific word than \"fine\" or \"off\"?",
          "Does it say something about what the feeling might be pointing to?",
          "Does it feel true when you read it back?",
        ],
        cues: [
          { anyOf: ["lonely", "uneasy", "disappointed", "frustrated", "relieved", "hurt", "nervous", "proud", "worried", "sad"], say: "You chose a specific emotion word, which already makes the feeling clearer." },
          { anyOf: ["because", "i think", "miss", "need"], say: "You linked the feeling to what it might mean, which is exactly what makes emotions useful." },
        ],
      },
      reflection: [
        "Which emotions do you find easiest to name, and which do you tend to skip over?",
        "Where in your body do you usually notice a strong feeling first?",
        "What is one emotion you would like to understand better?",
      ],
      takeaways: [
        "Emotions have body, thought, and urge parts.",
        "Every emotion carries a message about what matters to you.",
        "A precise word gives you a clearer next step.",
        "Noticing an urge does not mean you have to act on it.",
      ],
    },
    // 2
    {
      id: "emotional-intelligence-02",
      number: 2,
      title: msg("Recognize Your Emotional Triggers"),
      skill: msg("Spot the situations, thoughts, and memories that set off strong reactions, so they surprise you less often."),
      minutes: 9,
      care: "This lesson looks at everyday triggers, not trauma. If a trigger brings back painful memories, panic, or feelings that are hard to manage, please go gently and consider talking with a mental health professional.",
      intro: [
        "Some moments bring a reaction that feels bigger than the situation. A short reply, a certain tone, or a messy kitchen can set off a wave of feeling before you have time to think. These moments are often connected to triggers.",
        "In this lesson you will learn what triggers are, where they tend to come from, and how to notice the early signs. You will finish by identifying one trigger that comes up for you again and again.",
      ],
      learn: [
        {
          heading: "What a trigger is",
          paragraphs: [
            "A trigger is anything that reliably sets off a strong emotional response. It can be outside you, such as a situation or a phrase someone uses, or inside you, such as a thought, a memory, or being tired and hungry.",
            "Triggers make sense. They usually connect to something that once hurt, scared, or frustrated you, or to a value that feels threatened. The reaction is your mind trying to protect you, even when the present situation is not dangerous.",
          ],
          bullets: [
            "Situations: being interrupted, waiting, running late, crowded places.",
            "Words or tones: sarcasm, being told to \"calm down,\" a raised voice.",
            "Inner states: lack of sleep, hunger, pain, feeling rushed.",
            "Thoughts: \"Nobody listens to me,\" \"I always mess this up.\"",
          ],
        },
        {
          heading: "Following the chain",
          paragraphs: [
            "A trigger rarely works alone. There is usually a chain: something happens, you interpret it in a certain way, you feel an emotion, and then you react. For example: a colleague does not reply to your message, you think \"they are ignoring me,\" you feel hurt, and you send a sharp follow-up.",
            "When you look back at a strong reaction, try writing out the chain link by link. The interpretation in the middle is often where the trigger really lives, and it is also the link you have the most influence over.",
          ],
        },
        {
          heading: "Early warning signs",
          paragraphs: [
            "Your body often notices a trigger before your mind does. Common early signs include a clenched jaw, a hot face, a sinking stomach, fast breathing, or a sudden urge to leave the room.",
            "Learning your own signs gives you a few seconds of warning. You do not need to stop the feeling. Just saying to yourself \"this is my trigger\" can create a little distance and make the next step calmer.",
          ],
        },
      ],
      example: {
        title: "Elena and the unanswered questions",
        story: [
          "Elena, 52, noticed that she became irritable whenever her adult daughter answered her questions with one word. She would push harder for details, and the conversation would end badly.",
          "When she wrote out the chain, she saw her interpretation: \"She is shutting me out, like my own mother did.\" The trigger was less about her daughter and more about an old feeling of being left out. Knowing this, Elena began to notice the tight feeling in her throat and to ask one gentle question instead of five.",
        ],
        point: "Understanding where a reaction comes from can loosen its grip, even when the trigger itself does not go away.",
      },
      exercise: {
        title: "Identify one recurring trigger",
        steps: [
          "Think of a type of moment that often brings a reaction bigger than you would like.",
          "Write what usually happens just before you react.",
          "Write the thought or interpretation that tends to come up.",
          "Note the first sign you feel in your body.",
          "Write one thing you could say to yourself next time you notice that sign.",
        ],
        fields: [
          { id: "trigger-situation", label: "The situation that often triggers you", kind: "short", placeholder: "Being interrupted in meetings." },
          { id: "trigger-thought", label: "The thought that usually follows", kind: "short", placeholder: "My ideas don't matter here." },
          { id: "trigger-body", label: "The first sign in your body", kind: "short" },
          { id: "trigger-response", label: "What you could say to yourself next time", kind: "long" },
        ],
        minutes: 7,
      },
      practice: {
        kind: "scenario",
        prompt: "You are cooking dinner and a family member walks in and says, \"Are you still not done?\" You feel a quick flash of heat. Describe what the trigger might be and what you could say to yourself in that moment.",
        examples: [
          { text: "\"I think the trigger is feeling judged when I'm already rushing. I could tell myself: this is my trigger, I don't have to answer right away.\"", why: "It names the trigger and the inner state behind it, and gives a calm phrase to use." },
          { text: "\"The thought is 'they think I'm slow.' I could check: maybe they're just hungry. I'll take a breath and answer the question they actually asked.\"", why: "It spots the interpretation and considers another explanation before reacting." },
        ],
        lookFors: [
          "Does your answer name what might be setting off the reaction?",
          "Does it notice the thought or interpretation in the middle?",
          "Does it include something kind or calming you could say to yourself?",
        ],
        cues: [
          { anyOf: ["trigger", "judged", "rushed", "tired", "hungry"], say: "You named what might be behind the reaction, which is the heart of recognizing a trigger." },
          { anyOf: ["maybe", "might", "another", "check"], say: "You considered another explanation, which loosens the interpretation that fuels the reaction." },
          { anyOf: ["breath", "pause", "tell myself"], say: "You gave yourself a calm phrase or pause, which creates useful distance from the trigger." },
        ],
      },
      reflection: [
        "Which of your triggers are more about the present, and which might connect to the past?",
        "What inner states, such as tiredness or hunger, make you more easily triggered?",
        "Who in your life might share some of your triggers, and how could you talk about them together?",
      ],
      takeaways: [
        "Triggers can be situations, words, thoughts, or body states.",
        "A strong reaction often follows a chain: event, interpretation, feeling, action.",
        "The interpretation is the link you can most easily question.",
        "Early body signs give you a few seconds of warning.",
      ],
    },
    // 3
    {
      id: "emotional-intelligence-03",
      number: 3,
      title: msg("Respond Instead of React"),
      skill: msg("Use a short pause to move from an automatic reaction to a response you choose."),
      minutes: 8,
      intro: [
        "A reaction is fast and automatic. A response is a little slower and chosen. The difference between them is often just a few seconds. In this lesson you will learn why that small gap matters and how to create it on purpose.",
        "You will learn a simple pause-and-choose technique you can use at home, at work, or in a message you are about to send, and then practice it.",
      ],
      learn: [
        {
          heading: "Why the pause helps",
          paragraphs: [
            "When a strong emotion rises, the body gets ready to act. Breathing speeds up, muscles tense, and thinking narrows. That is useful in an emergency but less helpful in a tense email or a disagreement over chores.",
            "A pause gives the body a moment to settle and the thinking part of you a chance to catch up. You are not ignoring the feeling. You are giving yourself room to decide what to do with it.",
          ],
        },
        {
          heading: "The pause-and-choose steps",
          paragraphs: [
            "This simple sequence can take as little as ten seconds. With practice it becomes more natural.",
          ],
          bullets: [
            "Stop: stop talking, typing, or moving for a moment.",
            "Breathe: take one or two slow, comfortable breaths, a little longer out than in. Never hold your breath.",
            "Notice: name the feeling silently, for example \"irritated.\"",
            "Ask: \"What do I want to happen here?\"",
            "Choose: pick one response that moves toward that, even a small one.",
          ],
        },
        {
          heading: "Ways to buy time",
          paragraphs: [
            "Sometimes a few breaths are not enough and you need a longer pause. It is fine to step away, as long as you say you will come back. That way the other person does not feel dismissed.",
          ],
          bullets: [
            "\"Let me think about that and get back to you this afternoon.\"",
            "\"I want to answer this properly. Can we talk after dinner?\"",
            "Write the message, then save it as a draft and reread it later.",
            "Get a glass of water or step outside for a few minutes.",
          ],
        },
      ],
      example: {
        title: "Priya's draft folder",
        story: [
          "Priya, 41, received a message from a parent at her child's school criticizing how she had organized a bake sale. Her first instinct was to write a long reply defending every decision. Her fingers were already moving.",
          "She stopped, took two slow breaths, and named the feeling: \"stung.\" She asked herself what she wanted, and the answer was a good relationship with the other parents. She saved her draft, went for a short walk, and later sent a brief, friendly reply asking for suggestions for next time.",
        ],
        point: "A pause does not erase the feeling, but it lets you respond in a way that fits what you actually want.",
      },
      exercise: {
        title: "Practice pause and choose",
        steps: [
          "Recall a recent moment when you reacted quickly and later wished you had not.",
          "Sit comfortably and take a few slow, easy breaths, letting each out-breath be a little longer. Stop if you feel dizzy.",
          "Walk through the steps for that moment: stop, breathe, notice, ask, choose.",
          "Write what you noticed and the response you would choose now.",
        ],
        fields: [
          { id: "pause-moment", label: "The moment you reacted quickly", kind: "short" },
          { id: "pause-feeling", label: "The feeling you would name", kind: "short" },
          { id: "pause-want", label: "What you really wanted to happen", kind: "short" },
          { id: "pause-choice", label: "The response you would choose now", kind: "long" },
        ],
        minutes: 6,
        timerSeconds: 60,
      },
      practice: {
        kind: "mindful",
        prompt: "Imagine your manager sends a short message: \"We need to talk about your report.\" You feel your stomach drop and want to reply right away asking what is wrong. Walk through the pause-and-choose steps. What would you do?",
        examples: [
          { text: "\"I'd stop and take two slow breaths. I'd name the feeling as anxious. What I want is to understand the feedback calmly, so I'd reply: 'Sure, when suits you?'\"", why: "It follows each step and leads to a calm, practical reply." },
          { text: "\"I'd step away from the screen for a minute and notice my worry. Then I'd remind myself I don't know what it's about yet and ask for a time to talk.\"", why: "It uses a short break and separates the feeling from guesses about what will happen." },
        ],
        lookFors: [
          "Does your answer include a moment of stopping or breathing?",
          "Does it name the feeling?",
          "Does the response you chose fit what you actually want?",
        ],
        cues: [
          { anyOf: ["breath", "breathe", "pause", "stop", "step away"], say: "You built in a pause, which is the space where choice becomes possible." },
          { anyOf: ["anxious", "worried", "nervous", "uneasy", "scared"], say: "You named the feeling, which helps it settle a little." },
          { anyOf: ["want", "goal", "calm", "understand"], say: "You connected your response to what you want, which turns a reaction into a choice." },
        ],
      },
      reflection: [
        "In what situations do you most often react before you think?",
        "Which pause step feels easiest for you, and which feels hardest?",
        "What phrase could you use to buy time without seeming dismissive?",
      ],
      takeaways: [
        "A reaction is automatic; a response is chosen.",
        "Stop, breathe, notice, ask, choose.",
        "Stepping away is fine if you say you will come back.",
        "Asking \"What do I want here?\" points you toward a better response.",
      ],
    },
    // 4
    {
      id: "emotional-intelligence-04",
      number: 4,
      title: msg("Managing Anger and Frustration"),
      skill: msg("Recognize anger early and turn it into calm, constructive action instead of harm."),
      minutes: 9,
      care: "This lesson is for everyday frustration and is not a treatment. If anger leads you to hurt anyone, including yourself, or you often feel out of control, please seek help from a doctor or mental health professional. If anyone is in danger right now, contact local emergency services. Safety always comes first.",
      intro: [
        "Anger is a normal emotion. It often shows up when something feels unfair, blocked, or disrespectful. On its own it is not a problem. What matters is what you do with it.",
        "In this lesson you will learn to spot anger as it builds, cool your body down safely, and use what anger is telling you in a constructive way. You will finish with a personal plan for frustrating moments.",
      ],
      learn: [
        {
          heading: "Anger as a signal",
          paragraphs: [
            "Anger usually points to something that matters: a need not being met, a boundary crossed, or a value being ignored. Frustration is a close relative that often comes from repeated small blocks, such as a slow computer or a task that keeps going wrong.",
            "Underneath anger there is often another feeling, such as hurt, fear, embarrassment, or exhaustion. Asking \"What else am I feeling?\" can help you address the real issue rather than only the heat on the surface.",
          ],
        },
        {
          heading: "Notice the rise",
          paragraphs: [
            "Anger tends to build in stages. Catching it early is much easier than calming it at its peak. Think of a scale from 1, mildly irritated, to 10, ready to explode. Most of your choices are easier to make at 3 or 4 than at 8.",
          ],
          bullets: [
            "Early signs: tight jaw or fists, a warm face, faster speech, shorter answers.",
            "Rising signs: louder voice, pacing, harsh thoughts about the other person.",
            "High signs: shaking, wanting to shout, throw, or hit. This is the moment to leave safely.",
          ],
        },
        {
          heading: "Cool down, then act",
          paragraphs: [
            "When your body is very activated, it is hard to solve anything. First cool down, then deal with the problem. Cooling down is not giving in; it is getting ready to handle things well.",
          ],
          bullets: [
            "Leave the room and say, \"I need ten minutes, then I'll come back.\"",
            "Breathe slowly with a longer out-breath, without holding your breath.",
            "Move: walk, stretch, or shake out your hands.",
            "Put cold water on your hands or face.",
            "Once calmer, name the problem and one fair request you can make.",
          ],
        },
      ],
      example: {
        title: "Tomás and the broken promise",
        story: [
          "Tomás, 47, had asked his housemate three times to fix the leaking tap he had promised to repair. When he found the kitchen floor wet again, he felt his fists clench and his voice rise as he called out his housemate's name.",
          "He noticed he was at about a 7. He said, \"I'm too annoyed to talk right now, give me a few minutes,\" and went for a walk around the block. On the way back he realized he felt disrespected more than anything. He then asked calmly whether they could agree on a date for the repair or call a plumber and split the cost.",
        ],
        point: "Cooling down first let Tomás turn anger into a clear, fair request instead of an argument.",
      },
      exercise: {
        title: "Your frustration plan",
        steps: [
          "Think about the situations where you most often feel frustrated or angry.",
          "Write your personal early warning signs.",
          "Choose two cool-down actions that are safe and realistic for you.",
          "Write a sentence you can use to step away without slamming a door.",
          "Write how you will return to the problem once you are calmer.",
        ],
        fields: [
          { id: "anger-situations", label: "Situations that often frustrate me", kind: "short" },
          { id: "anger-signs", label: "My early warning signs", kind: "short", placeholder: "Tight shoulders, talking faster." },
          { id: "anger-cooldown", label: "Two cool-down actions I can use", kind: "short" },
          { id: "anger-step-away", label: "What I will say to step away", kind: "short", placeholder: "I need a few minutes. I'll come back so we can sort this out." },
          { id: "anger-return", label: "How I will return to the problem", kind: "long" },
        ],
        minutes: 8,
      },
      practice: {
        kind: "scenario",
        prompt: "You are in a long phone queue for the third time this week to fix a billing mistake. When someone finally answers, they say they need to transfer you again. You feel your anger rising fast. What could you do and say?",
        examples: [
          { text: "\"I'd notice I'm at about a 6, breathe out slowly, and say: 'I've called three times about this and I'm frustrated. Before you transfer me, could you note my case so I don't have to explain again?'\"", why: "It names the feeling honestly, stays respectful, and makes a clear request." },
          { text: "\"I'd ask if I could get a call back instead, then hang up and walk around for a few minutes before dealing with it again.\"", why: "It protects the person on the line and gives the body time to cool down." },
        ],
        lookFors: [
          "Does your answer notice how strong the anger is getting?",
          "Does it include a way to cool down or slow down?",
          "Does it end with a fair, specific request rather than an attack?",
        ],
        cues: [
          { anyOf: ["breathe", "breath", "walk", "minutes", "slow"], say: "You included a way to cool down, which keeps the anger from deciding for you." },
          { anyOf: ["frustrated", "annoyed", "angry", "upset"], say: "You named your frustration honestly without turning it against the other person." },
          { anyOf: ["could you", "would you", "can you", "please"], say: "You turned the feeling into a clear request, which is the constructive side of anger." },
        ],
      },
      reflection: [
        "What feeling often hides underneath your anger?",
        "At what number on the 1 to 10 scale do you usually notice your anger, and could you notice it earlier?",
        "Who could you tell about your frustration plan so they understand when you step away?",
      ],
      takeaways: [
        "Anger is a signal that something matters.",
        "It is easier to change course at a 3 than at an 8.",
        "Cool down first, then deal with the problem.",
        "If anger ever leads to harm or feels out of control, get professional help.",
      ],
    },
    // 5
    {
      id: "emotional-intelligence-05",
      number: 5,
      title: msg("Understanding Anxiety and Worry"),
      skill: msg("Notice worry patterns and separate what you can control from what you cannot."),
      minutes: 9,
      care: "This lesson covers everyday worry and is not a treatment for anxiety. If anxiety is severe, lasts for weeks, or gets in the way of daily life, please talk with a doctor or mental health professional. If you might harm yourself, contact local emergency services now.",
      intro: [
        "Worry is the mind trying to prepare for what might go wrong. A little of it can help you plan. Too much can keep you stuck in loops that drain energy without solving anything.",
        "In this lesson you will learn to notice common worry patterns and to sort a worry into the parts you can influence and the parts you cannot. You will practice this with one real worry of your own.",
      ],
      learn: [
        {
          heading: "Worry and anxiety",
          paragraphs: [
            "Worry is mostly thinking: \"What if this happens?\" Anxiety includes the body as well: a racing heart, tight muscles, restlessness, or trouble sleeping. They often feed each other. Anxious feelings bring more worried thoughts, and worried thoughts bring more anxious feelings.",
            "It helps to remember that the mind tends to treat a possibility as if it were a certainty. Gently noticing \"this is a 'what if', not a fact\" can lower the volume a little.",
          ],
        },
        {
          heading: "Common worry patterns",
          paragraphs: [
            "Most people have a few favorite patterns. Recognizing yours can help you step out of them sooner.",
          ],
          bullets: [
            "Jumping ahead: imagining the worst outcome before anything has happened.",
            "Going in circles: replaying the same question without reaching a decision.",
            "Mind reading: assuming you know what others think of you.",
            "Needing certainty: feeling you cannot relax until every doubt is gone.",
          ],
        },
        {
          heading: "Control, influence, and letting go",
          paragraphs: [
            "Almost every worry has parts you can control, parts you can influence a little, and parts you cannot change. Sorting them gives your energy a clear direction.",
            "For the parts you can control, choose one small action and a time to do it. For the parts you cannot control, try a short accepting phrase, such as \"This is uncertain, and I can live with not knowing yet.\" You may need to repeat it. That is normal.",
          ],
          bullets: [
            "Control: your preparation, your questions, your next step, how you rest.",
            "Influence: how others respond to you, some timing, some outcomes.",
            "Outside your control: other people's choices, the weather, the past.",
          ],
        },
      ],
      example: {
        title: "Grace and the job interview",
        story: [
          "Grace, 55, was returning to work after several years of caring for her father. The night before an interview, she lay awake thinking, \"What if they think I'm too old? What if I freeze?\" The thoughts went round and round.",
          "She got up and drew two columns on a piece of paper. Under \"I can control\" she wrote: lay out clothes, reread my notes, plan the bus route, prepare one story about caring. Under \"I can't control\" she wrote: who else applied, what they decide. She did the first three things, read the second column once, and told herself, \"I'll know when I know.\" Sleep came more easily.",
        ],
        point: "Sorting a worry turned an endless loop into a few clear actions and one thing to let be.",
      },
      exercise: {
        title: "Sort one worry",
        steps: [
          "Pick one worry that has been on your mind recently.",
          "Write it as a single sentence.",
          "List the parts of it you can control or influence.",
          "List the parts you cannot control.",
          "Choose one small action from the first list and when you will do it, and one accepting phrase for the second list.",
        ],
        fields: [
          { id: "worry-sentence", label: "My worry in one sentence", kind: "short" },
          { id: "worry-control", label: "Parts I can control or influence", kind: "long" },
          { id: "worry-no-control", label: "Parts I cannot control", kind: "long" },
          { id: "worry-action", label: "One small action and when I'll do it", kind: "short" },
          { id: "worry-phrase", label: "An accepting phrase for what I can't control", kind: "short", placeholder: "I don't have to solve this tonight." },
        ],
        minutes: 8,
      },
      practice: {
        kind: "question",
        prompt: "You are waiting to hear whether a close friend got home safely after a long drive, and they have not replied for two hours. Your mind is jumping to the worst. What can you control here, what can't you, and what could you say to yourself?",
        examples: [
          { text: "\"I can send one message and maybe call once. I can't control whether their phone is charged or if they're asleep. I could tell myself: 'No reply is not news. I'll check again in an hour.'\"", why: "It sorts the worry clearly and offers a calm, realistic phrase." },
          { text: "\"I notice I'm jumping ahead. I'll text a mutual friend and then do something with my hands, like washing up, while I wait.\"", why: "It names the pattern, takes one action, and gives the body something steady to do." },
        ],
        lookFors: [
          "Does your answer name at least one thing you can do?",
          "Does it name something outside your control?",
          "Does it include a kind or realistic phrase you could use?",
        ],
        cues: [
          { anyOf: ["i can", "control", "send", "call", "check"], say: "You found something within your control, which gives the worry a useful place to go." },
          { anyOf: ["can't control", "cannot control", "not up to me", "outside"], say: "You recognized what is outside your control, which makes letting go a little easier." },
          { anyOf: ["jumping", "what if", "worst", "not a fact"], say: "You spotted the worry pattern itself, which is a real step out of the loop." },
        ],
      },
      reflection: [
        "Which worry pattern do you notice most often in yourself?",
        "What time of day do your worries tend to be strongest, and what helps then?",
        "What is one accepting phrase that feels honest to you?",
      ],
      takeaways: [
        "Worry treats possibilities as if they were certain.",
        "Knowing your worry pattern helps you step out of it sooner.",
        "Sort each worry into what you can and cannot control.",
        "Take one small action and practice letting the rest be.",
      ],
    },
    // 6
    {
      id: "emotional-intelligence-06",
      number: 6,
      title: msg("Developing Empathy"),
      skill: msg("Imagine how a situation looks and feels from another person's side before you judge it."),
      minutes: 8,
      intro: [
        "Empathy is the ability to sense and understand what another person might be feeling. It does not mean agreeing with them or giving up your own view. It means making room for the fact that people experience the same situation differently.",
        "In this lesson you will learn the difference between kinds of empathy, a few practical ways to take another perspective, and how to show someone you understand. You will then explore another person's view in a sample situation.",
      ],
      learn: [
        {
          heading: "Feeling with and understanding",
          paragraphs: [
            "Empathy has two sides that work together. One is feeling with someone: you sense some of their sadness or excitement. The other is understanding: you think through why they might feel that way given their life, history, and pressures.",
            "Both matter. Feeling with someone builds warmth. Understanding helps you respond wisely, especially when their reaction is different from what yours would be.",
          ],
        },
        {
          heading: "Ways to take another perspective",
          paragraphs: [
            "Perspective-taking is a skill you can practice. When someone's behavior puzzles or annoys you, try these questions before deciding what it means.",
          ],
          bullets: [
            "What might be going on in their day or life that I cannot see?",
            "If I were in their position, with their worries, what might I feel?",
            "What need might be behind what they are doing?",
            "Is there a kinder explanation that is also possible?",
          ],
        },
        {
          heading: "Showing that you understand",
          paragraphs: [
            "Empathy helps most when the other person can feel it. Often the best thing is to reflect what you notice, without rushing to fix or advise.",
            "Try phrases like \"That sounds exhausting,\" \"I can see why you'd be worried,\" or \"It makes sense you're upset after that.\" If you are unsure, ask: \"How are you feeling about it?\" Then listen to the answer before you add your own view.",
          ],
        },
      ],
      example: {
        title: "Jun and the quiet neighbor",
        story: [
          "Jun, 36, felt hurt that an older neighbor never returned her greeting in the hallway. She began to think he was rude and stopped saying hello.",
          "One day she saw him struggling with heavy shopping and offered to help. As they talked, he mentioned that his hearing had been getting worse and that he often missed people speaking to him. Jun realized she had built a story without the full picture. Now she waves and smiles when she sees him, and he waves back.",
        ],
        point: "Behavior that seems rude often has a reason we cannot see. Pausing to imagine other explanations can change a relationship.",
      },
      exercise: {
        title: "See it from their side",
        steps: [
          "Read this situation: a coworker cancels a planned lunch with you at the last minute for the second time, with a short message that just says \"Sorry, can't today.\"",
          "Write your first reaction honestly.",
          "Now imagine at least two things that might be going on for the coworker.",
          "Write what they might be feeling and needing.",
          "Write a short, empathic reply you could send.",
        ],
        fields: [
          { id: "empathy-first", label: "My first reaction", kind: "short" },
          { id: "empathy-possibilities", label: "Two things that might be going on for them", kind: "long" },
          { id: "empathy-feeling", label: "What they might be feeling or needing", kind: "short" },
          { id: "empathy-reply", label: "An empathic reply I could send", kind: "long", placeholder: "No problem. It sounds like a busy week. Want to try again next week?" },
        ],
        minutes: 7,
      },
      practice: {
        kind: "role-play",
        prompt: "A relative tells you, \"I've been so stressed with the move, and nobody seems to notice.\" You are tempted to say, \"Well, everyone's busy.\" What could you say instead to show you understand?",
        examples: [
          { text: "\"That sounds really hard. Moving is a lot, and it must feel lonely if nobody's asking how you are.\"", why: "It reflects both the stress and the feeling of being unseen." },
          { text: "\"I'm sorry, I didn't realize. What's been the hardest part so far?\"", why: "It acknowledges the feeling and invites them to say more before offering help." },
        ],
        lookFors: [
          "Does your answer reflect what they might be feeling?",
          "Does it avoid comparing, minimizing, or rushing to advice?",
          "Does it invite them to share more if they want to?",
        ],
        cues: [
          { anyOf: ["sounds", "must feel", "makes sense", "i can see"], say: "You reflected their feeling back, which helps people feel understood." },
          { anyOf: ["what's been", "how are you", "tell me", "hardest"], say: "You invited them to say more, which shows real interest in their side." },
          { anyOf: ["sorry", "didn't realize", "didn't notice"], say: "You acknowledged that you had not noticed, which is honest and warm." },
        ],
      },
      reflection: [
        "Whose perspective do you find hardest to imagine, and why?",
        "When has someone else's empathy made a real difference to you?",
        "What is one relationship where a little more perspective-taking could help?",
      ],
      takeaways: [
        "Empathy is understanding, not necessarily agreeing.",
        "People experience the same situation differently.",
        "Ask what you cannot see before you decide what behavior means.",
        "Reflect feelings before you offer advice.",
      ],
    },
    // 7
    {
      id: "emotional-intelligence-07",
      number: 7,
      title: msg("Emotional Boundaries"),
      skill: msg("Care about other people's feelings while staying responsible for your own, and say so respectfully."),
      minutes: 8,
      intro: [
        "Caring about others is a strength, but it can tip into taking on everyone's feelings as if they were your job to fix. Emotional boundaries help you stay kind without becoming drained.",
        "In this lesson you will learn what emotional boundaries are, how to tell when you need one, and how to word a boundary with respect. You will practice a boundary-setting response you could actually use.",
      ],
      learn: [
        {
          heading: "What an emotional boundary is",
          paragraphs: [
            "An emotional boundary is the line between your feelings and someone else's. Inside your line are your emotions, choices, and limits. Outside are theirs. You can care about what is outside your line, but you are not responsible for controlling it.",
            "Boundaries are not walls. They are more like a garden fence with a gate. They let you decide what comes in, how often, and on what terms.",
          ],
        },
        {
          heading: "Signs you may need a boundary",
          paragraphs: [
            "Boundaries are easier to set when you notice the need early. Pay attention to these signals.",
          ],
          bullets: [
            "You feel drained or tense before or after time with a certain person.",
            "You often say yes when you want to say no.",
            "You feel responsible for keeping someone else happy or calm.",
            "You notice resentment building quietly.",
            "Your own needs, such as rest or time alone, keep getting pushed aside.",
          ],
        },
        {
          heading: "Wording a respectful boundary",
          paragraphs: [
            "A clear boundary usually has three parts: warmth, the limit, and sometimes an alternative. Keep it short. You do not need a long explanation or an apology for having needs.",
          ],
          bullets: [
            "Warmth: \"I care about you and I want to help.\"",
            "Limit: \"I can't talk about this every night.\"",
            "Alternative: \"Could we set aside time on Sunday instead?\"",
            "If it is not respected, calmly repeat it once and then take the step you said you would take, such as ending the call.",
          ],
        },
      ],
      example: {
        title: "Abdul and the late-night calls",
        story: [
          "Abdul, 44, had a close friend going through a divorce who called him most evenings, sometimes for two hours. Abdul wanted to support him, but he was starting to dread the phone and was sleeping badly.",
          "He decided to set a boundary. He said, \"I really care about you and I want to keep being here. I can't do long calls on weeknights anymore because I need to sleep. Can we talk for twenty minutes on weekdays and have a longer call on Saturdays?\" His friend was surprised at first but agreed, and Abdul found he could listen better when he was not exhausted.",
        ],
        point: "A boundary set with warmth can protect a relationship rather than harm it.",
      },
      exercise: {
        title: "Practice a respectful boundary",
        steps: [
          "Think of one situation where you feel drained or overstretched by someone else's emotions or requests.",
          "Write what you are willing to do and what you are not willing to do.",
          "Write a short boundary statement with warmth, a limit, and an alternative if one fits.",
          "Say it aloud once or twice so it feels more natural.",
        ],
        fields: [
          { id: "boundary-situation", label: "The situation", kind: "short" },
          { id: "boundary-willing", label: "What I'm willing and not willing to do", kind: "long" },
          { id: "boundary-statement", label: "My boundary statement", kind: "long", placeholder: "I care about you. I can't lend money again, but I'm happy to help you look at a budget." },
        ],
        minutes: 6,
      },
      practice: {
        kind: "role-play",
        prompt: "A coworker regularly comes to your desk to vent about their manager for half an hour, and you are falling behind on your own work. You like them and do not want to hurt them. What could you say?",
        examples: [
          { text: "\"I can tell this is really getting to you, and I'm glad you trust me. I need to focus on my work right now. Want to talk over lunch for a bit instead?\"", why: "It is warm, sets a clear limit, and offers an alternative." },
          { text: "\"I've got about five minutes, then I need to get back to this deadline.\"", why: "Short and clear. It sets a time limit before the conversation starts." },
        ],
        lookFors: [
          "Does your answer show care for the other person?",
          "Does it state your limit clearly?",
          "Does it avoid blaming or long apologies?",
        ],
        cues: [
          { anyOf: ["care", "glad", "i can tell", "i understand"], say: "You opened with warmth, which helps the other person hear the boundary without feeling rejected." },
          { anyOf: ["i need", "i can't", "minutes", "focus"], say: "You stated your limit plainly, which makes the boundary easy to understand." },
          { anyOf: ["instead", "how about", "lunch", "later"], say: "You offered an alternative, which shows you still want to connect." },
        ],
      },
      reflection: [
        "With whom do you find it hardest to set boundaries, and why?",
        "What do you fear might happen if you set a boundary?",
        "How might your relationships change if your needs were included too?",
      ],
      takeaways: [
        "You can care about others' feelings without being responsible for them.",
        "Drained or resentful feelings often signal a missing boundary.",
        "Warmth, a limit, and an alternative make a respectful boundary.",
        "Keep it short; you do not need to justify having needs.",
      ],
    },
    // 8
    {
      id: "emotional-intelligence-08",
      number: 8,
      title: msg("Emotional Communication"),
      skill: msg("Share your feelings using \"I feel...\" statements that describe, not blame."),
      minutes: 8,
      intro: [
        "When feelings are strong, it is easy to speak in ways that sound like accusations: \"You never listen,\" \"You always make me late.\" These phrases tend to start arguments rather than solve problems.",
        "In this lesson you will learn how to describe what happened, how you feel, and what you need, in a way that invites the other person to listen. You will practice building your own \"I feel...\" statements.",
      ],
      learn: [
        {
          heading: "Blame versus description",
          paragraphs: [
            "Blaming language focuses on the other person's character: \"You're so selfish.\" Descriptive language focuses on a specific action and its effect on you: \"When the plans changed without a message, I felt left out.\"",
            "Description is easier to hear because it does not ask the other person to accept a label. It gives them something concrete they can respond to.",
          ],
          bullets: [
            "Swap \"always\" and \"never\" for a specific time: \"yesterday,\" \"at dinner.\"",
            "Swap labels for actions: not \"lazy\" but \"the dishes were left overnight.\"",
          ],
        },
        {
          heading: "Building an \"I feel...\" statement",
          paragraphs: [
            "A simple structure helps, especially when emotions are high. You do not have to use it word for word; it is a guide.",
          ],
          bullets: [
            "When: \"When [specific thing happened]...\"",
            "I feel: \"...I felt [emotion word]...\"",
            "Because: \"...because [what matters to me]...\"",
            "Request: \"Could we [specific request]?\"",
          ],
        },
        {
          heading: "Watch for hidden blame",
          paragraphs: [
            "Some sentences begin with \"I feel\" but still blame: \"I feel like you don't care\" or \"I feel that you're being unfair.\" These are thoughts about the other person, not feelings.",
            "A quick check: if you can replace \"I feel\" with \"I think,\" it is probably a thought. Try finding the actual emotion underneath, such as hurt, lonely, or worried.",
          ],
        },
      ],
      example: {
        title: "Naomi and the forgotten birthday",
        story: [
          "Naomi, 49, was upset that her brother had not called on her birthday. Her first thought was to text him, \"Typical. You never remember anything about me.\"",
          "Instead, she waited until the next day and said, \"When I didn't hear from you on my birthday, I felt hurt, because our calls mean a lot to me. Could we put each other's birthdays in our calendars?\" Her brother apologized, explained he had been in the hospital with their uncle that day, and they talked for an hour.",
        ],
        point: "Describing the feeling instead of blaming opened a real conversation, and Naomi learned something she would not have heard otherwise.",
      },
      exercise: {
        title: "Practice \"I feel...\" statements",
        steps: [
          "Think of a recent moment when someone's action bothered you.",
          "Write what happened as a specific, neutral description.",
          "Write the emotion you felt, using a precise word.",
          "Write why it mattered to you.",
          "Combine them into one \"I feel...\" statement with a request.",
        ],
        fields: [
          { id: "ifeel-when", label: "When... (what happened)", kind: "short", placeholder: "When the meeting started without me" },
          { id: "ifeel-feeling", label: "I felt... (emotion word)", kind: "short" },
          { id: "ifeel-because", label: "Because... (what matters to me)", kind: "short" },
          { id: "ifeel-full", label: "My full statement with a request", kind: "long" },
        ],
        minutes: 7,
      },
      practice: {
        kind: "scenario",
        prompt: "A friend makes a comment that upsets you. How can you express your feelings without blaming them?",
        examples: [
          { text: "\"When you joked about my cooking in front of everyone, I felt embarrassed, because I'd worked hard on that meal. Could we keep jokes like that between us?\"", why: "It describes a specific moment, names the feeling, and makes a clear request." },
          { text: "\"I felt a bit hurt by what you said earlier about my job. Can we talk about it?\"", why: "Short and gentle. It names the feeling and opens a conversation instead of an argument." },
        ],
        lookFors: [
          "Does your answer describe what happened without labeling the person?",
          "Does it include a real emotion word rather than a thought?",
          "Does it end with a request or an invitation to talk?",
        ],
        cues: [
          { anyOf: ["i felt", "i feel"], say: "You spoke from your own experience, which makes it easier for your friend to listen." },
          { anyOf: ["hurt", "embarrassed", "sad", "upset", "disappointed", "uncomfortable"], say: "You named a clear emotion, which tells your friend exactly how the comment landed." },
          { anyOf: ["could we", "can we", "would you", "talk about"], say: "You ended with a request, which points the conversation toward a solution." },
        ],
      },
      reflection: [
        "What blaming phrases do you tend to use when you are upset?",
        "Which part of the \"I feel...\" structure feels most natural, and which is hardest?",
        "Who is one person you would like to communicate more openly with?",
      ],
      takeaways: [
        "Describe actions, not character.",
        "When, I feel, because, request.",
        "\"I feel like you...\" is usually a thought, not a feeling.",
        "Clear, calm words invite listening rather than defending.",
      ],
    },
    // 9
    {
      id: "emotional-intelligence-09",
      number: 9,
      title: msg("Self-Compassion and Emotional Balance"),
      skill: msg("Speak to yourself with the kindness you would offer a friend, especially after a hard moment."),
      minutes: 8,
      care: "This lesson is about everyday kindness toward yourself and is not a substitute for care. If difficult experiences keep returning, or low mood lasts for weeks, please talk with a doctor or mental health professional. If you might harm yourself, contact local emergency services now.",
      intro: [
        "Many people are far harsher with themselves than they would ever be with someone they love. After a mistake or a hard day, the inner voice can turn critical: \"You're hopeless,\" \"Why can't you get anything right?\"",
        "In this lesson you will learn what self-compassion is, why it supports emotional balance, and how to set realistic expectations. You will practice writing a supportive message to yourself about a difficult experience.",
      ],
      learn: [
        {
          heading: "What self-compassion is",
          paragraphs: [
            "Self-compassion means treating yourself with the same warmth and understanding you would offer a good friend who is struggling. It is not self-pity or making excuses. It is recognizing that you are a person, people struggle, and you deserve kindness while you work things out.",
            "Harsh self-criticism can feel like it keeps you in line, but it often leaves you more anxious and less willing to try again. A kind inner voice tends to make it easier to learn from what happened.",
          ],
        },
        {
          heading: "Three gentle steps",
          paragraphs: [
            "When something hard happens, you can try these steps in your own words.",
          ],
          bullets: [
            "Acknowledge: \"This is really hard right now.\"",
            "Connect: \"Other people feel this way too. I'm not the only one.\"",
            "Be kind: \"What do I need right now? What would I say to a friend?\"",
          ],
        },
        {
          heading: "Realistic expectations",
          paragraphs: [
            "Emotional balance does not mean always feeling calm. It means being able to return to steadiness after ups and downs. Expecting yourself never to feel anger, sadness, or worry sets you up for disappointment.",
            "Try replacing \"I should be over this by now\" with \"It makes sense that this still affects me.\" Replace \"I must do this perfectly\" with \"I'll do my best with what I have today.\" These are not lower standards. They are honest ones.",
          ],
        },
      ],
      example: {
        title: "Sofia after the presentation",
        story: [
          "Sofia, 33, lost her place halfway through a presentation at a community meeting. Afterward, walking home, she replayed the moment again and again, telling herself she had made a fool of herself.",
          "That evening she asked herself what she would say to her best friend in the same situation. She wrote: \"That was uncomfortable, and of course you feel embarrassed. Lots of people lose their place when speaking. You recovered and finished. Next time you could bring short notes.\" Reading it, she felt her shoulders drop, and she was able to think about what to do differently without dreading it.",
        ],
        point: "Speaking to yourself as a friend can ease the sting of a hard moment and make learning from it possible.",
      },
      exercise: {
        title: "A supportive note to yourself",
        steps: [
          "Choose a difficult experience from the recent past that still bothers you a little. Pick something manageable, not your hardest memory.",
          "Write what your inner critic says about it.",
          "Imagine a caring friend who knows the whole story. Write what they would say to you.",
          "Read their words slowly. Notice any change in how you feel.",
        ],
        fields: [
          { id: "compassion-experience", label: "The difficult experience", kind: "short" },
          { id: "compassion-critic", label: "What my inner critic says", kind: "short" },
          { id: "compassion-friend", label: "What a caring friend would say to me", kind: "long", placeholder: "That was hard, and you did the best you could. It's okay to feel disappointed." },
        ],
        minutes: 7,
      },
      practice: {
        kind: "mindful",
        prompt: "You forgot an important appointment and had to reschedule. Your inner voice says, \"You're so disorganized. You can't even manage the basics.\" What could you say to yourself instead?",
        examples: [
          { text: "\"I'm annoyed I missed it, and that makes sense. Everyone forgets things sometimes. I'll set a reminder on my phone for next time.\"", why: "It acknowledges the feeling, connects to common experience, and moves to a practical step." },
          { text: "\"I've had a lot on my plate this month. Missing one appointment doesn't define me. I'll be gentle with myself today.\"", why: "It offers context and kindness without making excuses." },
        ],
        lookFors: [
          "Does your answer acknowledge that the moment felt hard?",
          "Does it speak to you the way you would speak to a friend?",
          "Does it include a realistic, kind next step?",
        ],
        cues: [
          { anyOf: ["makes sense", "it's okay", "understandable", "hard"], say: "You acknowledged the feeling with understanding, which is the first step of self-compassion." },
          { anyOf: ["everyone", "other people", "people forget", "human"], say: "You remembered that others go through this too, which eases the sense of being alone in it." },
          { anyOf: ["next time", "reminder", "i'll", "gentle"], say: "You offered yourself a kind next step, which turns compassion into action." },
        ],
      },
      reflection: [
        "How does your inner voice usually talk to you after a mistake?",
        "What words of kindness are easiest for you to accept from yourself?",
        "Which expectation could you make a little more realistic this week?",
      ],
      takeaways: [
        "Self-compassion is kindness, not excuses.",
        "Acknowledge, connect, be kind.",
        "Balance means returning to steadiness, not never feeling upset.",
        "Ask what you would say to a friend, then say it to yourself.",
      ],
    },
    // 10
    {
      id: "emotional-intelligence-10",
      number: 10,
      title: msg("Your Emotional Intelligence Plan"),
      skill: msg("Combine the skills from this course into a simple routine you can use day to day."),
      minutes: 10,
      intro: [
        "Over this course you have practiced naming emotions, spotting triggers, pausing, handling anger and worry, understanding others, setting boundaries, communicating clearly, and being kind to yourself. Skills like these grow with regular use.",
        "In this final lesson you will review the skills, choose the ones that matter most to you, and build a short, realistic routine for recognizing emotions and choosing constructive responses.",
      ],
      learn: [
        {
          heading: "A quick review",
          paragraphs: [
            "Each skill supports the others. Naming a feeling makes it easier to pause. Pausing gives you room to take another perspective. Understanding others makes boundaries and honest communication easier.",
          ],
          bullets: [
            "Notice and name: find a precise word for what you feel.",
            "Spot triggers: know your common sparks and early body signs.",
            "Pause and choose: stop, breathe, notice, ask, choose.",
            "Cool down and sort: calm anger first; separate worry into control and no control.",
            "Connect: imagine others' perspectives and reflect their feelings.",
            "Protect and express: set kind boundaries and use \"I feel...\" statements.",
            "Be kind to yourself: speak to yourself as a friend.",
          ],
        },
        {
          heading: "Building a daily routine",
          paragraphs: [
            "A routine works best when it is small and tied to something you already do. A one-minute check-in after breakfast is more likely to last than a long session you keep postponing.",
          ],
          bullets: [
            "Morning: \"How am I feeling right now? What might challenge me today?\"",
            "During the day: notice one moment to pause before responding.",
            "Evening: \"What did I feel most strongly today? How did I respond? What would I keep or change?\"",
          ],
        },
        {
          heading: "When things don't go to plan",
          paragraphs: [
            "Some days you will react before you remember any of these skills. That is part of learning, not a sign of failure. Use it as information: what happened, what you felt, and what you might try next time.",
            "If you notice that strong emotions often feel unmanageable, or affect your sleep, work, or relationships for a long time, talking with a doctor or mental health professional is a strong and sensible step.",
          ],
        },
      ],
      example: {
        title: "Marcus builds a routine",
        story: [
          "Marcus, 58, finished a similar course and wanted to keep the habits going. He chose two skills that mattered most to him: pausing before responding to his teenage grandson, and naming his feelings at the end of the day.",
          "He put a small note on the kettle that said \"How am I?\" and made a habit of writing one line in a notebook before bed. Some weeks he missed days. Over a couple of months, though, he noticed he raised his voice less often, and his grandson started staying to talk after dinner.",
        ],
        point: "A small, repeated routine linked to everyday cues can make emotional skills part of ordinary life.",
      },
      exercise: {
        title: "Build your emotional intelligence plan",
        steps: [
          "Choose the two or three skills from this course that would help you most right now.",
          "Pick a daily cue, such as making tea or brushing your teeth, for a short check-in.",
          "Write the questions you will ask yourself at that check-in.",
          "Write how you will respond when you notice a strong emotion during the day.",
          "Decide when you will look back on this plan, such as in two weeks.",
        ],
        fields: [
          { id: "plan-skills", label: "The skills I most want to keep using", kind: "short" },
          { id: "plan-cue", label: "My daily cue for a check-in", kind: "short", placeholder: "After my morning coffee." },
          { id: "plan-questions", label: "My check-in questions", kind: "long" },
          { id: "plan-response", label: "What I'll do when a strong emotion shows up", kind: "long" },
          { id: "plan-review", label: "When I'll look back on this plan", kind: "short" },
        ],
        minutes: 9,
      },
      practice: {
        kind: "question",
        prompt: "Picture a typical busy day for you. At what point is a strong emotion most likely to show up, and which skill from this course would you use first?",
        examples: [
          { text: "\"Around 6 p.m., when everyone's tired and hungry at home. I'd use pause and choose, and maybe name the feeling out loud: 'I'm frazzled, give me a minute.'\"", why: "It identifies a real moment and picks a specific skill to use there." },
          { text: "\"In my Monday team meeting I often feel dismissed. I'd notice my trigger, breathe, and later use an 'I feel' statement with my manager.\"", why: "It links a trigger, a calming step, and a communication skill into one plan." },
        ],
        lookFors: [
          "Does your answer name a specific time or situation?",
          "Does it choose a particular skill from the course?",
          "Does it feel realistic for your actual life?",
        ],
        cues: [
          { anyOf: ["morning", "evening", "meeting", "dinner", "p.m.", "a.m.", "work", "home"], say: "You pinpointed a real moment, which makes your plan much easier to follow." },
          { anyOf: ["pause", "breathe", "name", "i feel", "boundary", "trigger", "perspective"], say: "You chose a specific skill, which turns good intentions into a clear action." },
        ],
      },
      reflection: [
        "Which skill from this course has made the biggest difference so far?",
        "What might get in the way of your routine, and how could you plan around it?",
        "How would you like people close to you to experience you in a few months?",
      ],
      takeaways: [
        "The skills in this course support each other.",
        "A small routine tied to an everyday cue is easier to keep.",
        "Reacting sometimes is part of learning; use it as information.",
        "Seeking professional support for overwhelming emotions is a sensible step.",
      ],
    },
  ],
};
