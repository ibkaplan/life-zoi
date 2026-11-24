import { msg } from "@/lib/i18n/translate";
import type { GrowthCourse } from "@/lib/growth-academy/types";

export const communicationCourse: GrowthCourse = {
  id: "communication",
  title: msg("Communication Skills Training"),
  shortTitle: msg("Communication Skills"),
  tagline: msg("Listen well, speak clearly, and work through disagreements with respect."),
  description: msg("Ten practical lessons on listening, clear speaking, good questions, assertiveness, empathy, and calm handling of disagreements and hard conversations, at home and at work."),
  goal: msg("Help you become a better listener, express yourself clearly, build stronger relationships, and handle disagreements constructively."),
  objectives: [
    msg("Listen with full attention and reflect back what you heard so people feel understood."),
    msg("Organize your thoughts and say what you mean in a clear, direct, and respectful way."),
    msg("Ask open questions and see situations from other people's points of view."),
    msg("Disagree and have difficult conversations calmly, staying on the issue rather than the person."),
  ],
  difficulty: "intermediate",
  cover: "bridge",
  colors: ["#3d6b4f", "#dfeee3"],
  achievement: {
    id: "communication-champion",
    title: msg("Communication Champion"),
    text: msg("You finished all ten lessons and practiced listening, clarity, empathy, and assertiveness in real conversations."),
  },
  lessons: [
    // 1
    {
      id: "communication-01",
      number: 1,
      title: msg("The Foundations of Good Communication"),
      skill: msg("Notice how words, tone, and body language work together, and what makes a conversation feel comfortable."),
      minutes: 8,
      intro: [
        "Every conversation carries two messages at once: the words you choose and the way you deliver them. In this lesson you will look at both, so you can see why some conversations feel easy and others leave people tense or confused.",
        "You will learn the basic parts of verbal and nonverbal communication, how they can match or clash, and a few simple habits that make people feel at ease. You will finish by studying a real conversation from your own life that went well.",
      ],
      learn: [
        {
          heading: "Verbal and nonverbal messages",
          paragraphs: [
            "Verbal communication is the words themselves: what you say, the order you say it in, and how much detail you give. Nonverbal communication is everything around the words: your tone of voice, speed, volume, facial expression, posture, gestures, and how close you stand.",
            "People read both channels at once. When they match, your message feels trustworthy. When they clash, listeners usually believe the nonverbal part. Saying \"I'm happy to help\" with a flat voice while looking at your phone sends a mixed message, and most people will hear the reluctance rather than the offer.",
          ],
          bullets: [
            "Tone: warm, neutral, sharp, or rushed.",
            "Pace: slowing down often signals care and calm.",
            "Face and eyes: a relaxed face and steady, comfortable eye contact show interest. Comfort with eye contact varies between people and cultures, so there is no single right amount.",
            "Posture: turning your body toward someone says \"you have my attention.\"",
          ],
        },
        {
          heading: "What makes a conversation comfortable",
          paragraphs: [
            "Comfortable conversations tend to share a few features. Both people get a turn. Nobody feels rushed or judged. The topic is clear enough that people know what they are talking about. And there are small signs of attention, such as a nod, a short \"mm-hm,\" or a question that shows you were following.",
            "Effective conversations add one more thing: they reach a point. Something is understood, decided, or shared. A chat can be pleasant without being effective, and a meeting can be effective without being pleasant. Good communication aims for both.",
          ],
        },
        {
          heading: "Three habits to start with",
          paragraphs: [
            "You do not need a new personality to communicate well. Small, steady habits do most of the work.",
          ],
          bullets: [
            "Check your setting: a noisy room or a rushed moment makes any talk harder. If it matters, ask, \"Is now a good time?\"",
            "Match your tone to your words: if you mean something kindly, let your voice and face show it.",
            "Give a sign you are listening before you reply, such as repeating a key word or nodding.",
          ],
        },
      ],
      example: {
        title: "Daniel and the kitchen table",
        story: [
          "Daniel, 52, noticed that talks with his adult daughter often ended in short answers. One evening he paid attention to himself instead of her. He was standing at the counter, half-reading messages, asking questions over his shoulder.",
          "The next time she visited, he made two cups of tea, sat down across from her, and put his phone in another room. He asked the same kind of questions as before. This time she talked for nearly an hour about a change she was considering at work.",
        ],
        point: "The words barely changed. The setting, posture, and attention did, and that changed how safe the conversation felt.",
      },
      exercise: {
        title: "Study a conversation that went well",
        steps: [
          "Think of a recent conversation that felt comfortable and useful. It can be with a friend, relative, neighbor, or colleague.",
          "Write down where it happened and what was going on around you.",
          "Note what the other person did, verbally and nonverbally, that helped.",
          "Note what you did that helped.",
          "Pick one of those things to repeat on purpose in your next conversation.",
        ],
        fields: [
          { id: "setting", label: "Where it happened and what the setting was like", kind: "short", placeholder: "A quiet walk with my brother after dinner." },
          { id: "their-part", label: "What the other person did that helped", kind: "long" },
          { id: "my-part", label: "What I did that helped", kind: "long" },
          { id: "repeat", label: "One thing I will repeat on purpose", kind: "short" },
        ],
        minutes: 6,
      },
      practice: {
        kind: "scenario",
        prompt: "A friend starts telling you about a stressful day just as you are finishing an email. You want to listen, but you also need two minutes to finish. What could you say and do so your friend still feels welcome?",
        examples: [
          { text: "\"I really want to hear this. Can you give me two minutes to send this email, and then I'm all yours?\" Then close the laptop and turn toward them.", why: "It shows interest in words, sets a short and honest limit, and follows through with body language." },
          { text: "Stop typing, look up, and say, \"That sounds like a lot. Let me save this so I can listen properly.\"", why: "It responds to their feeling first and makes your full attention visible." },
        ],
        lookFors: [
          "Does your answer show interest in what your friend wants to say?",
          "Does your body language match your words, for example by turning away from the screen?",
          "Is the pause you ask for short and clear?",
        ],
        cues: [
          { anyOf: ["want to hear", "i'm listening", "tell me", "all yours"], say: "You let your friend know you want to hear them, which makes it easier for them to keep talking." },
          { anyOf: ["close", "look up", "turn", "put down", "phone away"], say: "You thought about your body language as well as your words, so your message stays consistent." },
          { anyOf: ["two minutes", "one minute", "a moment", "give me"], say: "You set a short, honest pause instead of half-listening, which respects both your task and your friend." },
        ],
      },
      reflection: [
        "Which do you tend to notice more in others: their words or their tone and body language?",
        "In what kind of setting do you find it easiest to talk openly?",
        "Is there a mixed message you sometimes send without meaning to?",
      ],
      takeaways: [
        "Every message has words and a delivery. Both count.",
        "When words and body language clash, people usually trust the body language.",
        "Comfortable conversations give both people a turn and show small signs of attention.",
        "A better setting can change a conversation before you say a word.",
      ],
    },
    // 2
    {
      id: "communication-02",
      number: 2,
      title: msg("Active Listening"),
      skill: msg("Give full attention, ask follow-up questions, and summarize what you heard so the other person feels understood."),
      minutes: 9,
      intro: [
        "Most of us listen while quietly preparing our reply. Active listening is different. It means your main goal is to understand the other person first, and to show them that you did.",
        "In this lesson you will learn three parts of active listening: attention, follow-up questions, and reflecting back. You will then practice summarizing what someone told you, which is one of the most useful conversation skills you can build.",
      ],
      learn: [
        {
          heading: "Attention: listening with your whole self",
          paragraphs: [
            "Attention starts with removing distractions. Put the phone face down, stop what you are doing, and let the other person finish their sentences. If your mind wanders, gently bring it back to their words without scolding yourself.",
            "Notice the urge to jump in with your own story, advice, or solution. It is often well meant, but it moves the spotlight away from the speaker. Try holding your reply until they seem to have finished, then wait one more breath.",
          ],
        },
        {
          heading: "Follow-up questions",
          paragraphs: [
            "A good follow-up question proves you were listening because it could only come from what they just said. It also helps them say more about what matters to them.",
          ],
          bullets: [
            "\"What happened next?\"",
            "\"How did you feel when she said that?\"",
            "\"What part of it is bothering you most?\"",
            "\"What would a good outcome look like for you?\"",
          ],
        },
        {
          heading: "Reflecting back",
          paragraphs: [
            "Reflecting back means putting what you heard into your own words and checking it. It has three parts: the main facts, the feeling you noticed, and a check. For example: \"So the project deadline moved up a week, and you're worried you'll have to cancel your trip. Did I get that right?\"",
            "Keep it short and tentative. Phrases such as \"It sounds like…\" or \"So what I'm hearing is…\" leave room for the person to correct you. If they do, that is a success, not a failure: you now understand them better than before.",
            "Avoid adding your opinion inside the summary. \"So your boss is being unreasonable again\" is a judgment. \"So your boss asked for the report two days early\" is a reflection.",
          ],
        },
      ],
      example: {
        title: "Priya and the long phone call",
        story: [
          "Priya, 38, had a friend who called often to talk about problems with a landlord. Priya usually offered solutions within the first minute, and the calls went in circles.",
          "One evening she tried only listening and summarizing. After a few minutes she said, \"So the heating has been off for a week, he isn't answering, and you're starting to feel ignored, not just cold.\" Her friend went quiet, then said, \"Yes. That's exactly it.\" They then planned a written complaint together, and the call ended sooner than usual.",
        ],
        point: "When people feel heard, they are often more ready to move toward solutions. A summary can do more than advice.",
      },
      exercise: {
        title: "Practice summarizing",
        steps: [
          "In your next real conversation, choose a moment when someone tells you about something that matters to them.",
          "Listen without interrupting until they pause.",
          "Summarize in one or two sentences: the main facts and the feeling you noticed.",
          "End with a check, such as \"Is that right?\"",
          "Afterward, write down what you said and how they responded.",
        ],
        fields: [
          { id: "what-they-said", label: "What the person told me, briefly", kind: "long" },
          { id: "my-summary", label: "The summary I gave", kind: "long", placeholder: "So you're excited about the move but nervous about leaving your friends. Is that right?" },
          { id: "their-response", label: "How they responded", kind: "short" },
        ],
        minutes: 7,
      },
      practice: {
        kind: "role-play",
        prompt: "A colleague says to you: \"I've been asked to lead the new project, which is great, but I already have two deadlines this month and I don't know how to say no without looking lazy.\" Write a short reply that reflects back what you heard before giving any advice.",
        examples: [
          { text: "\"It sounds like you're pleased to be asked, but you're stretched thin already and worried about how saying no would look. Is that it?\"", why: "It captures both the good news and the worry, and checks instead of assuming." },
          { text: "\"So it's a real opportunity, but the timing is hard, and you're concerned people might judge you. What part feels hardest?\"", why: "It reflects the situation and the feeling, then invites them to say more with a follow-up question." },
        ],
        lookFors: [
          "Does your reply mention both the facts and the feeling?",
          "Does it check whether you understood, instead of assuming?",
          "Does it hold back advice until the person feels heard?",
        ],
        cues: [
          { anyOf: ["it sounds like", "so you", "what i'm hearing", "if i understand"], say: "You started with a reflection, which shows you were following closely." },
          { anyOf: ["worried", "stretched", "concerned", "pressure", "overwhelmed"], say: "You named the feeling as well as the facts, which helps the person feel understood." },
          { anyOf: ["is that right", "is that it", "did i get", "am i right"], say: "You checked your understanding, which invites the person to correct or add detail." },
        ],
      },
      reflection: [
        "When did someone last make you feel truly listened to? What did they do?",
        "What usually pulls your attention away while someone is talking?",
        "Who in your life might appreciate a little more listening from you this week?",
      ],
      takeaways: [
        "Active listening aims to understand first and reply second.",
        "A good follow-up question builds on what the person just said.",
        "A reflection includes the facts, the feeling, and a check.",
        "Being corrected after a summary means the listening is working.",
      ],
    },
    // 3
    {
      id: "communication-03",
      number: 3,
      title: msg("Express Yourself Clearly"),
      skill: msg("Organize your thoughts before you speak and put your main point first, in plain words."),
      minutes: 8,
      intro: [
        "Clear speaking is less about vocabulary and more about order. When the main point is buried under background, people lose track, guess, or tune out. In this lesson you will learn how to organize a message so it lands the first time.",
        "You will use a simple three-part structure, learn a few ways to cut confusion, and practice explaining one idea in three clear sentences.",
      ],
      learn: [
        {
          heading: "Know your point before you start",
          paragraphs: [
            "Before an important conversation, ask yourself: \"If the other person remembers only one thing, what should it be?\" Write that in one sentence. If you cannot, the message is not ready yet, and that is useful to know.",
            "Then decide what you want from the listener. Do you need a decision, help, information, or simply for them to know something? Saying this out loud makes conversations shorter and calmer.",
          ],
        },
        {
          heading: "Point, reason, next step",
          paragraphs: [
            "A reliable structure for most everyday messages has three parts.",
          ],
          bullets: [
            "Point: what you want to say or ask. \"I'd like to move our weekly call to Thursdays.\"",
            "Reason: the one or two most important reasons. \"Mondays are full of school drop-offs and I'm often late.\"",
            "Next step: what happens now. \"Could you let me know by Friday if Thursday works?\"",
          ],
        },
        {
          heading: "Ways to cut confusion",
          paragraphs: [
            "Confusion often comes from small habits: long run-on sentences, vague words like \"stuff\" or \"soon,\" and too many ideas at once. A few changes help.",
          ],
          bullets: [
            "Use specific words: \"by 3 p.m. Tuesday\" instead of \"soon.\"",
            "One idea per sentence. Pause between ideas.",
            "Say what you mean, not only what you do not want: \"Please text before you come over\" is clearer than \"Don't just show up.\"",
            "Check understanding: \"What's your take on that?\" works better than \"Does that make sense?\", which many people answer with a polite yes.",
          ],
        },
      ],
      example: {
        title: "Kwame's maintenance request",
        story: [
          "Kwame, 44, manages a small community center. His emails to the volunteer team often began with a long history of an issue, and people replied asking what he actually needed.",
          "Before sending his next one, he wrote a single top line: \"I need two volunteers to help repaint the hall on Saturday, 10 a.m. to 1 p.m.\" Then he added one reason and asked people to reply by Thursday. He had four offers within a day, and nobody asked what he meant.",
        ],
        point: "Putting the main point first, with a clear next step, saves everyone time and guesswork.",
      },
      exercise: {
        title: "Explain an idea in three clear sentences",
        steps: [
          "Choose something you want to explain or ask for: a plan, a request, or an idea at home or work.",
          "Write sentence one: your main point.",
          "Write sentence two: the most important reason.",
          "Write sentence three: the next step or what you need from the listener.",
          "Read all three aloud. Replace any vague words with specific ones.",
        ],
        fields: [
          { id: "point", label: "Sentence 1: my main point", kind: "short", placeholder: "I'd like us to cook at home three nights a week." },
          { id: "reason", label: "Sentence 2: the main reason", kind: "short" },
          { id: "next-step", label: "Sentence 3: the next step", kind: "short" },
        ],
        minutes: 5,
      },
      practice: {
        kind: "question",
        prompt: "You need to tell your manager or a family member that you cannot finish something by the date you agreed. Write what you would say, using point, reason, and next step.",
        examples: [
          { text: "\"I won't be able to finish the budget by Monday. Two of the supplier quotes haven't arrived yet. I can have it to you by Wednesday, or send a draft on Monday with gaps marked. Which would help more?\"", why: "The main point comes first, the reason is short, and it offers clear choices for what happens next." },
          { text: "\"I need to move the garden clean-up to next weekend. My back is sore from moving furniture. Could we pick Saturday or Sunday now so it's on the calendar?\"", why: "Simple, honest, and it ends with a specific question instead of leaving the plan open." },
        ],
        lookFors: [
          "Does your message put the main point in the first sentence?",
          "Is the reason short and specific rather than a long story?",
          "Does it end with a clear next step or question?",
        ],
        cues: [
          { anyOf: ["by monday", "by wednesday", "by friday", "next week", "saturday", "sunday", "tomorrow"], say: "You used a specific time, which removes guesswork for the other person." },
          { anyOf: ["could we", "can i", "would it help", "which would", "instead"], say: "You offered a next step, so the conversation ends with a plan rather than a problem." },
          { anyOf: ["because", "since", "haven't", "the reason"], say: "You gave a brief reason, which helps the listener understand without needing a long story." },
        ],
      },
      reflection: [
        "When do you find it hardest to get to the point?",
        "Who in your life communicates very clearly? What do they do?",
        "Which upcoming conversation would benefit from a single-sentence main point?",
      ],
      takeaways: [
        "Decide your main point before you start talking.",
        "Point, reason, next step works for most everyday messages.",
        "Specific words beat vague ones.",
        "Check understanding with an open question, not \"Does that make sense?\"",
      ],
    },
    // 4
    {
      id: "communication-04",
      number: 4,
      title: msg("Ask Better Questions"),
      skill: msg("Turn closed questions into open ones and use curiosity to keep conversations going."),
      minutes: 7,
      intro: [
        "Questions shape conversations. A closed question invites a one-word answer. An open question invites a story, a thought, or a feeling. Knowing the difference helps you learn more and connect more easily.",
        "In this lesson you will learn how open and closed questions work, how to ask with genuine curiosity, and how to avoid questions that feel like an interview or a test. Then you will rewrite five closed questions.",
      ],
      learn: [
        {
          heading: "Open and closed questions",
          paragraphs: [
            "Closed questions can be answered with yes, no, or a single fact: \"Did you like the film?\" \"Is the meeting at two?\" They are useful when you need a quick fact or a decision.",
            "Open questions usually begin with what, how, or tell me about. \"What did you think of the film?\" \"How did the meeting go?\" They give the other person room to choose what to share, and they often lead somewhere you did not expect.",
          ],
          bullets: [
            "Closed: \"Was your trip good?\" Open: \"What was the best part of your trip?\"",
            "Closed: \"Are you okay?\" Open: \"How are you feeling about everything?\"",
            "Closed: \"Do you like your new job?\" Open: \"What's it like so far?\"",
          ],
        },
        {
          heading: "Curiosity over assumptions",
          paragraphs: [
            "The best questions come from real interest in the answer. If you already think you know what someone will say, your question can sound like a trap. Notice when you are assuming, and ask about the part you genuinely do not know.",
            "Be careful with \"why\" questions. \"Why did you do that?\" can sound like blame even when you mean it kindly. \"What led you to that choice?\" or \"How did you decide?\" usually feels gentler.",
          ],
        },
        {
          heading: "Keeping questions comfortable",
          paragraphs: [
            "Too many questions in a row can feel like an interrogation. Mix questions with short reflections or a little about yourself. Leave silence after you ask, and let the person think. Respect the answer \"I'd rather not talk about that,\" and move on without pressure.",
          ],
        },
      ],
      example: {
        title: "Sofia at the reunion",
        story: [
          "Sofia, 61, went to a family reunion and dreaded the small talk. Her usual questions, such as \"Are you still in the same house?\" got short replies and awkward pauses.",
          "She tried changing them. To a cousin she had not seen for years she asked, \"What's been keeping you busy lately?\" He told her about restoring an old boat, and twenty minutes passed easily. Later, she asked an aunt, \"What do you remember about this town when you were young?\" and heard stories she had never known.",
        ],
        point: "A small change in wording can turn a polite exchange into a real conversation.",
      },
      exercise: {
        title: "Turn five closed questions into open ones",
        steps: [
          "Read each closed question below or write five of your own that you often ask.",
          "Rewrite each one so it starts with what, how, or tell me about.",
          "Check that each new question cannot be answered with just yes or no.",
          "Choose one to try in a real conversation this week.",
        ],
        fields: [
          { id: "q1", label: "1. \"Did you have a good weekend?\" becomes…", kind: "short" },
          { id: "q2", label: "2. \"Is work busy?\" becomes…", kind: "short" },
          { id: "q3", label: "3. \"Did you like the book?\" becomes…", kind: "short" },
          { id: "q4", label: "4. \"Are you worried about the move?\" becomes…", kind: "short" },
          { id: "q5", label: "5. \"Was the class useful?\" becomes…", kind: "short" },
        ],
        minutes: 5,
      },
      practice: {
        kind: "scenario",
        prompt: "A neighbor mentions they have just started volunteering at an animal shelter. You would like to know more. Write two or three questions you could ask that show curiosity and invite them to share.",
        examples: [
          { text: "\"What made you decide to start volunteering there?\" and \"What's a typical day like?\"", why: "Both are open, they show real interest, and they let the neighbor choose what to talk about." },
          { text: "\"How's it been so far? What has surprised you most?\"", why: "It invites feelings and stories, not just facts, and gives an easy starting point." },
        ],
        lookFors: [
          "Do your questions start with words such as what, how, or tell me?",
          "Could your neighbor answer them with more than one word?",
          "Do they sound curious rather than testing or judging?",
        ],
        cues: [
          { anyOf: ["what", "how", "tell me"], say: "You used open question words, which give your neighbor room to share more." },
          { anyOf: ["surprised", "enjoy", "like about", "favorite", "best part"], say: "You asked about their experience, which shows genuine curiosity about them as a person." },
        ],
      },
      reflection: [
        "Which closed questions do you ask most out of habit?",
        "When has someone's question made you feel genuinely interesting?",
        "Who would you like to get to know better, and what could you ask them?",
      ],
      takeaways: [
        "Closed questions get facts. Open questions get stories and thoughts.",
        "What, how, and tell me about are good starting words.",
        "\"What led you to…\" often feels gentler than \"Why did you…\"",
        "Leave silence after a question so the person can think.",
      ],
    },
    // 5
    {
      id: "communication-05",
      number: 5,
      title: msg("Assertive Communication"),
      skill: msg("Tell passive, aggressive, and assertive styles apart, and state a need directly and respectfully."),
      minutes: 9,
      intro: [
        "Being assertive means saying what you think, feel, or need in a way that is honest and respectful to both you and the other person. It sits between staying silent and pushing too hard.",
        "In this lesson you will learn to recognize three styles of communication, use a simple formula for a respectful request, and practice expressing one real need.",
      ],
      learn: [
        {
          heading: "Three styles",
          paragraphs: [
            "Most people use all three styles at different times, depending on the situation and who they are with. Noticing which one you are using is the first step.",
          ],
          bullets: [
            "Passive: putting your own needs aside to avoid conflict. \"Oh, it's fine, don't worry about it,\" when it is not fine. Over time this can build resentment.",
            "Aggressive: getting your point across at the other person's expense, through blame, sarcasm, or a raised voice. \"You never think about anyone but yourself.\"",
            "Assertive: clear and calm, respecting both sides. \"I'd like us to split the chores more evenly. Can we sit down this weekend and plan it?\"",
          ],
        },
        {
          heading: "A simple formula",
          paragraphs: [
            "An assertive request often has four parts. You do not need to use all of them every time, but they are a helpful guide when the topic matters to you.",
          ],
          bullets: [
            "What happened, described neutrally: \"When the meeting ran 30 minutes over…\"",
            "How it affects you: \"…I missed my bus and got home late.\"",
            "What you need: \"I'd like us to finish on time.\"",
            "A request: \"Could we set a timer, or move extra topics to email?\"",
          ],
        },
        {
          heading: "Staying steady",
          paragraphs: [
            "Assertiveness also shows in delivery: a calm voice, upright posture, and steady pace. You do not need to over-apologize or over-explain. One short reason is usually enough.",
            "Being assertive does not guarantee you will get what you ask for. The other person may say no or suggest something else. The aim is to make your needs clear and to stay respectful, which keeps the door open for an honest conversation.",
          ],
        },
      ],
      example: {
        title: "Hiroshi and the weekend calls",
        story: [
          "Hiroshi, 35, had a supervisor who often sent work messages on Saturday mornings. Hiroshi replied every time, then felt tense for the rest of the weekend. When a friend asked how he was, he snapped, \"My boss has no respect for anyone's life.\"",
          "He decided to speak to the supervisor directly. On Monday he said, \"When I get messages on Saturdays, I find it hard to switch off. I'd like to keep weekends free unless it's urgent. Could we agree that urgent things come by phone call and the rest waits until Monday?\" The supervisor agreed and said they had not realized he felt he had to answer.",
        ],
        point: "Hiroshi moved from silent frustration to a calm, specific request. He named the situation, his need, and a workable solution.",
      },
      exercise: {
        title: "Express a need with respectful, direct language",
        steps: [
          "Choose one real need you have not yet expressed, at home, work, or with friends.",
          "Describe what happens, without blame.",
          "Say how it affects you.",
          "State what you need and make one clear request.",
          "Read it aloud and remove any extra apology or sharp words.",
        ],
        fields: [
          { id: "situation", label: "What happens (neutral description)", kind: "short", placeholder: "When plans change on the day…" },
          { id: "effect", label: "How it affects me", kind: "short" },
          { id: "need", label: "What I need", kind: "short" },
          { id: "request", label: "My request", kind: "short" },
          { id: "full-message", label: "The full message as I would say it", kind: "long" },
        ],
        minutes: 7,
      },
      practice: {
        kind: "scenario",
        prompt: "A friend often borrows things from you and returns them late or not at all. This time they ask to borrow your car for the weekend. You would rather not lend it. What could you say that is honest, kind, and clear?",
        examples: [
          { text: "\"I'm not comfortable lending the car this weekend. I need it, and I'm still waiting on the tools from last month. Could you bring those back this week?\"", why: "It says no clearly, gives a short reason, and raises the other issue without blame." },
          { text: "\"I'm going to say no to the car. I care about our friendship, so I'd rather be honest than say yes and feel annoyed later.\"", why: "It is direct and warm, and explains the choice without attacking the friend." },
        ],
        lookFors: [
          "Does your answer say clearly what you will and will not do?",
          "Does it avoid blame words such as always or never?",
          "Is the reason short, without a long apology?",
        ],
        cues: [
          { anyOf: ["i'm not comfortable", "i'd rather not", "i'm going to say no", "no, ", "i won't"], say: "You said no clearly, which is kinder in the long run than a vague maybe." },
          { anyOf: ["i need", "i'd like", "i feel", "i prefer"], say: "You spoke from your own point of view, which keeps the message assertive rather than aggressive." },
          { anyOf: ["could you", "can we", "would you", "friendship", "care about"], say: "You kept the relationship in mind and invited a next step, which shows respect for both of you." },
        ],
      },
      reflection: [
        "Which style do you fall into most when you are tired or stressed?",
        "Is there someone with whom it is especially hard for you to be assertive?",
        "What small request could you practice making this week?",
      ],
      takeaways: [
        "Passive puts your needs aside, aggressive pushes others aside, assertive respects both.",
        "Describe what happened, how it affects you, what you need, and what you ask.",
        "One short reason is usually enough.",
        "Assertiveness is about being clear, not about always getting a yes.",
      ],
    },
    // 6
    {
      id: "communication-06",
      number: 6,
      title: msg("Handle Disagreements"),
      skill: msg("Disagree respectfully, stay on the issue, and avoid personal attacks."),
      minutes: 9,
      intro: [
        "Disagreements are a normal part of any close relationship or team. They are not a sign that something is broken. What matters is how they are handled: respectful disagreement can solve problems and build trust, while personal attacks can do lasting harm.",
        "In this lesson you will learn how to keep a disagreement focused on the issue, phrases that lower tension, and what to do when a conversation starts to heat up. You will practice responding to someone who disagrees with you.",
      ],
      care: "These tools are for everyday disagreements between people who feel safe with each other. If a disagreement involves threats, intimidation, or fear of harm, step away and put your safety first, and reach out to a trusted person, a professional, or local emergency services.",
      learn: [
        {
          heading: "Issue, not person",
          paragraphs: [
            "A disagreement stays healthy when it is about a specific issue: a plan, a decision, a behavior. It turns harmful when it becomes about the person's character. \"I disagree with spending this much on the holiday\" is about the issue. \"You're so irresponsible with money\" is about the person.",
            "Watch for words such as always, never, and you're so. They tend to widen a disagreement and make the other person defend themselves instead of listening. Name the specific situation instead.",
          ],
        },
        {
          heading: "Phrases that keep things calm",
          paragraphs: [
            "Small phrases can show that you take the other person seriously even while you disagree.",
          ],
          bullets: [
            "\"I see it differently. Can I explain how?\"",
            "\"I hear that this matters to you. Here's my concern.\"",
            "\"What part do we already agree on?\"",
            "\"Help me understand what's most important to you here.\"",
            "\"You may be right about that part. I still have a concern about…\"",
          ],
        },
        {
          heading: "When it heats up",
          paragraphs: [
            "If voices rise or you notice your heart racing, it is fine to pause. Say something like, \"I want to keep talking about this, but I need twenty minutes to think. Can we come back to it after dinner?\" Then actually come back to it, so the pause does not feel like walking away.",
            "You do not have to settle everything in one conversation, and you do not always have to agree. Sometimes the best result is understanding each other's view and agreeing on what to do next, even if you still see things differently.",
          ],
        },
      ],
      example: {
        title: "Leila and the school choice",
        story: [
          "Leila, 41, and her partner disagreed about which secondary school their child should attend. Early conversations slid into old complaints: \"You always decide without me,\" \"You never look at the details.\"",
          "One evening they agreed to talk only about the schools. Leila started with, \"We both want her to be happy and to do well. Where we differ is how much the travel time matters.\" They each listed their top two concerns, visited both schools again, and made a decision together a week later.",
        ],
        point: "Naming the shared goal and the specific point of difference turned a personal argument into a problem they could solve together.",
      },
      exercise: {
        title: "Respond to someone who disagrees with you",
        steps: [
          "Think of a recent or likely disagreement with someone you know.",
          "Write the other person's view in one fair sentence, as they might say it.",
          "Write one thing you agree with or understand about their view.",
          "Write your own view, focused on the issue and using \"I\" language.",
          "Add a question or next step that keeps the conversation open.",
        ],
        fields: [
          { id: "their-view", label: "Their view, stated fairly", kind: "short" },
          { id: "common-ground", label: "What I agree with or understand", kind: "short" },
          { id: "my-view", label: "My view, about the issue", kind: "long" },
          { id: "next-step", label: "A question or next step", kind: "short" },
        ],
        minutes: 7,
      },
      practice: {
        kind: "role-play",
        prompt: "In a team meeting, a colleague says, \"Your plan won't work. It's far too expensive and nobody asked for it.\" You believe the plan is worth considering. Write how you would respond, respectfully and on the issue.",
        examples: [
          { text: "\"Cost is a fair concern. Can I walk you through the numbers? If they still look too high, I'm open to a smaller version.\"", why: "It acknowledges a valid point, stays on the issue, and offers a way forward." },
          { text: "\"I see it differently, but I'd like to understand your view. What would make a plan like this worth it for you?\"", why: "It disagrees calmly and asks a curious question rather than defending or attacking." },
        ],
        lookFors: [
          "Does your response acknowledge something in your colleague's view?",
          "Does it stay on the plan rather than on the colleague as a person?",
          "Does it leave room for the conversation to continue?",
        ],
        cues: [
          { anyOf: ["fair", "good point", "i understand", "i hear", "you may be right"], say: "You acknowledged their point first, which lowers tension and shows respect." },
          { anyOf: ["i see it differently", "my concern", "i think", "i believe"], say: "You stated your own view calmly, keeping the focus on the issue." },
          { anyOf: ["what would", "can we", "open to", "how about", "help me understand"], say: "You invited a next step or question, which keeps the disagreement constructive." },
        ],
      },
      reflection: [
        "When you disagree with someone close to you, what tends to happen first: listening, defending, or withdrawing?",
        "Which words do you notice yourself using when a disagreement starts to become personal?",
        "What shared goal could you name in a disagreement you have now?",
      ],
      takeaways: [
        "Keep disagreements about the issue, not the person.",
        "Words such as always and never usually make things worse.",
        "Acknowledging part of the other view does not mean giving up yours.",
        "A pause is fine, as long as you come back to the conversation.",
      ],
    },
    // 7
    {
      id: "communication-07",
      number: 7,
      title: msg("Difficult Conversations"),
      skill: msg("Prepare for a sensitive conversation and keep it calm, honest, and kind."),
      minutes: 10,
      intro: [
        "Some conversations feel heavy before they even start: telling a friend they hurt you, raising a money worry with a partner, discussing care plans with an aging parent, or giving hard news at work. It is natural to put them off.",
        "In this lesson you will learn how to prepare, how to open gently, and how to stay steady when emotions rise. You will then plan one difficult conversation of your own, step by step.",
      ],
      care: "This lesson is for everyday hard conversations, not a replacement for professional help. If a relationship involves fear, threats, or harm, your safety comes first: you do not need to have this conversation alone, and a trusted professional or local helpline can help you plan what to do. If you are in danger now, contact local emergency services.",
      learn: [
        {
          heading: "Prepare before you speak",
          paragraphs: [
            "Preparation lowers the chance of saying something you regret. Take a few minutes to answer three questions in writing.",
          ],
          bullets: [
            "What do I want this conversation to achieve? Understanding, an apology, a change, a decision?",
            "What do I know about how the other person might see it?",
            "What are the one or two most important things I need to say?",
          ],
        },
        {
          heading: "Choose the moment and open gently",
          paragraphs: [
            "Pick a time when neither of you is rushed, hungry, or exhausted, and a place with some privacy. You can give a gentle heads-up: \"There's something I'd like to talk about. Is this evening a good time?\"",
            "Your opening sentence sets the tone. Try starting with your intention and the topic: \"I want to talk about how we split costs, because I care about us and it's been on my mind.\" Avoid opening with a long list of complaints or a judgment.",
          ],
        },
        {
          heading: "Stay steady as it unfolds",
          paragraphs: [
            "Expect some strong feelings, on both sides. When you feel your body tense, slow down your speech and take an easy breath. When the other person reacts strongly, listen and reflect before you respond: \"I can see this is upsetting to hear.\"",
            "If things become too heated, you can pause and agree on a time to continue. It is also fine if one conversation does not resolve everything. Ending with \"Thank you for talking with me. Can we check in again next week?\" keeps the door open.",
          ],
        },
      ],
      example: {
        title: "Tomás and his father's driving",
        story: [
          "Tomás, 57, had grown worried about his father's driving after two small scrapes in a month. He kept putting off the topic, afraid his father would feel insulted.",
          "He wrote down his goal: to agree on a safer plan together, not to take the keys away. He chose a calm Sunday afternoon and opened with, \"Dad, I love you and I've been worried about something. Can we talk about the car?\" His father was defensive at first. Tomás listened, reflected that his father valued his independence, and suggested an eye test and avoiding night driving for now. They agreed to try that and talk again in a month.",
        ],
        point: "A clear goal, a gentle opening, and careful listening helped turn a feared conversation into a shared plan.",
      },
      exercise: {
        title: "Plan one difficult conversation",
        steps: [
          "Choose a conversation you have been putting off that feels safe to have.",
          "Write what you hope it will achieve.",
          "Write how the other person might see the situation.",
          "Draft your first one or two sentences.",
          "Note a good time and place, and one thing you will do if it gets heated.",
        ],
        fields: [
          { id: "topic", label: "The conversation and who it is with", kind: "short" },
          { id: "goal", label: "What I hope it will achieve", kind: "short" },
          { id: "their-side", label: "How they might see it", kind: "long" },
          { id: "opening", label: "My opening sentences", kind: "long", placeholder: "I'd like to talk about something that matters to me…" },
          { id: "plan", label: "Time, place, and my plan if it gets heated", kind: "long" },
        ],
        minutes: 8,
      },
      practice: {
        kind: "scenario",
        prompt: "A close friend made a joke about you in front of others that hurt your feelings. They do not seem to have noticed. You want to raise it without ending the friendship. Write how you would open the conversation.",
        examples: [
          { text: "\"Can I tell you about something that's been on my mind? At the dinner on Friday, the joke about my job stung a bit. I don't think you meant it that way, but I wanted to be honest with you.\"", why: "It asks permission, names a specific moment, shares the feeling, and assumes good intent." },
          { text: "\"I value our friendship, so I'd rather say this than let it build up. The comment about my cooking at the party hurt. Could we talk about it?\"", why: "It begins with the relationship, stays specific, and invites a conversation instead of an argument." },
        ],
        lookFors: [
          "Does your opening refer to a specific moment rather than a pattern of blame?",
          "Does it share how you felt, using \"I\" language?",
          "Does it leave room for your friend to respond?",
        ],
        cues: [
          { anyOf: ["hurt", "stung", "upset", "i felt", "bothered"], say: "You named how it felt for you, which helps your friend understand the impact." },
          { anyOf: ["friendship", "i value", "i care", "didn't mean", "don't think you meant"], say: "You showed care for the relationship and assumed good intent, which makes it easier to hear." },
          { anyOf: ["can we talk", "could we talk", "can i tell you", "is now a good time"], say: "You invited a conversation rather than delivering a verdict, which keeps it calm." },
        ],
      },
      reflection: [
        "Which conversation have you been putting off, and what has made it hard?",
        "What helps you stay calm when someone reacts strongly to what you say?",
        "Who could you talk to for support before or after a hard conversation?",
      ],
      takeaways: [
        "Know what you want a hard conversation to achieve before you start.",
        "A gentle opening names your intention and the topic.",
        "Listen and reflect before responding to strong reactions.",
        "Your safety comes before any conversation. Get support when you need it.",
      ],
    },
    // 8
    {
      id: "communication-08",
      number: 8,
      title: msg("Empathy and Understanding Others"),
      skill: msg("Take another person's perspective and adjust to different communication styles."),
      minutes: 8,
      intro: [
        "Empathy is the effort to understand how something looks and feels from another person's side. It does not mean you have to agree with them. It means you take their experience seriously.",
        "In this lesson you will learn simple ways to take another perspective, use curiosity instead of quick judgment, and recognize that people communicate in different styles. You will finish by looking at a real situation through someone else's eyes.",
      ],
      learn: [
        {
          heading: "Taking another perspective",
          paragraphs: [
            "Perspective-taking is a skill you can practice. When someone's behavior puzzles or annoys you, pause and ask yourself a few questions before deciding what it means.",
          ],
          bullets: [
            "What might be going on in their life right now that I do not see?",
            "What might they be worried about or hoping for?",
            "If I were in their position, with their history, how might I act?",
            "What is one kinder explanation for what they did?",
          ],
        },
        {
          heading: "Curiosity before judgment",
          paragraphs: [
            "Our minds quickly fill gaps with stories. A friend who does not reply is \"ignoring me\"; a colleague who is short is \"rude.\" These stories may be wrong. Curiosity means treating your first explanation as a guess and finding out more.",
            "You can say what you notice and ask: \"You seemed quiet in the meeting. Is everything okay?\" Showing empathy can be as simple as, \"That sounds really hard,\" without rushing to fix anything.",
          ],
        },
        {
          heading: "Different communication styles",
          paragraphs: [
            "People differ in how they like to communicate, often because of personality, culture, family habits, or how they process information. None of these styles is wrong. Noticing them helps you meet people where they are.",
          ],
          bullets: [
            "Some like to get straight to the point; others like context first.",
            "Some think out loud; others need quiet time before they answer.",
            "Some show feelings openly; others are more reserved.",
            "Some prefer to talk in person; others prefer writing.",
          ],
        },
      ],
      example: {
        title: "Grace and the quiet colleague",
        story: [
          "Grace, 33, worked with a colleague who rarely spoke in meetings and replied to her ideas with a single line in email. Grace assumed he disliked her proposals.",
          "She decided to ask instead of guess. Over coffee she said, \"I'd really value your thoughts on the project. What's the best way to get them?\" He explained that he struggled to think on the spot and preferred to see things in writing a day ahead. Grace began sending agendas in advance, and his written comments became some of the most useful on the team.",
        ],
        point: "What looked like disinterest was a different communication style. Curiosity replaced a wrong story with a better way of working together.",
      },
      exercise: {
        title: "See a situation from another person's perspective",
        steps: [
          "Choose a recent situation where someone's words or actions frustrated or confused you.",
          "Write down your first interpretation of what happened.",
          "Imagine the situation from their side. Write what they might have been thinking, feeling, or dealing with.",
          "Write one question you could ask them to understand better.",
        ],
        fields: [
          { id: "situation", label: "The situation", kind: "short" },
          { id: "first-story", label: "My first interpretation", kind: "short" },
          { id: "their-perspective", label: "How it might look from their side", kind: "long" },
          { id: "question", label: "A question I could ask them", kind: "short" },
        ],
        minutes: 6,
      },
      practice: {
        kind: "question",
        prompt: "Your sibling cancels plans with you for the third time this month, sending only a short text. Before you reply, write two possible explanations from their side, then the message you would send.",
        examples: [
          { text: "\"They might be overwhelmed at work, or something might be going on they haven't mentioned.\" Message: \"No problem. I've missed you, though. Is everything alright with you?\"", why: "It considers kinder explanations and replies with warmth and a caring question." },
          { text: "\"Maybe the kids are sick again, or they're feeling low.\" Message: \"I understand. Would a short phone call this week be easier than meeting up?\"", why: "It imagines their situation and adjusts the plan to fit what might work for them." },
        ],
        lookFors: [
          "Did you think of at least one explanation that is not about you?",
          "Does your message show care as well as honesty?",
          "Does it invite them to share, without demanding an explanation?",
        ],
        cues: [
          { anyOf: ["maybe", "might", "could be", "perhaps"], say: "You considered possible reasons on their side, which is the heart of perspective-taking." },
          { anyOf: ["everything alright", "everything okay", "are you okay", "how are you"], say: "You checked in on them as a person, which shows real empathy." },
          { anyOf: ["easier", "would it help", "instead", "phone call"], say: "You adjusted to what might suit them, which shows flexibility and care." },
        ],
      },
      reflection: [
        "Whose behavior do you tend to judge quickly? What might you be missing?",
        "How would you describe your own communication style?",
        "Who in your life communicates very differently from you, and how could you meet them halfway?",
      ],
      takeaways: [
        "Empathy means understanding, not necessarily agreeing.",
        "Treat your first explanation of someone's behavior as a guess.",
        "\"That sounds hard\" can be enough. You do not always have to fix things.",
        "Different styles are not wrong, just different. Adjusting helps everyone.",
      ],
    },
    // 9
    {
      id: "communication-09",
      number: 9,
      title: msg("Communication in Relationships and at Work"),
      skill: msg("Use respect, boundaries, and helpful feedback in close relationships and professional settings."),
      minutes: 9,
      intro: [
        "The same core skills work everywhere, but home and work ask for slightly different touches. Close relationships need warmth and clear boundaries. Workplaces need clarity, professionalism, and good collaboration.",
        "In this lesson you will learn how to set a boundary kindly, how to give and receive feedback, and a few habits that make teamwork smoother. You will then respond to a realistic scenario of your choice.",
      ],
      learn: [
        {
          heading: "Respect and boundaries",
          paragraphs: [
            "A boundary is a clear statement of what you are and are not okay with, and what you will do. It protects your time, energy, and well-being, and it helps others know how to treat you.",
            "Good boundaries are calm and specific. \"I'm happy to help with the move on Saturday morning, but I need to leave by one.\" \"I'm not able to answer work messages after seven, but I'll reply first thing in the morning.\" You can be kind and firm at the same time.",
          ],
        },
        {
          heading: "Giving and receiving feedback",
          paragraphs: [
            "Useful feedback is specific, timely, and about behavior, not character. A simple shape is: what you noticed, its effect, and a suggestion. \"In the report, the summary came at the end. Readers might miss it. Could you move it to the top?\" Positive feedback works the same way and is just as important: \"The way you handled that customer's question was calm and clear.\"",
            "Receiving feedback is a skill too. Listen fully, ask a clarifying question, and thank the person, even if you need time to decide whether you agree. \"Thanks for telling me. Can you give me an example?\" keeps the conversation useful.",
          ],
        },
        {
          heading: "Collaboration and professional communication",
          paragraphs: [
            "Teams work better when people are clear about who is doing what and by when. A few habits help in any workplace.",
          ],
          bullets: [
            "Confirm next steps in writing after a meeting.",
            "Credit others' ideas openly.",
            "Raise problems early and bring a possible solution.",
            "Keep messages brief and polite, and re-read before sending anything written while upset.",
          ],
        },
      ],
      example: {
        title: "Ahmed's two kinds of feedback",
        story: [
          "Ahmed, 48, ran a small bakery and also shared a home with his sister. At work, he noticed a new employee was often late opening the shop. At home, his sister often used his car without asking.",
          "With the employee, he said, \"On three mornings this week the shop opened after seven. Customers were waiting outside. What would help you get here on time?\" With his sister, he said, \"I'm fine lending you the car, but I need you to ask first so I can plan my day. Can we agree on that?\" Both conversations stayed calm, and both led to a change.",
        ],
        point: "The same skills of being specific, explaining the effect, and asking for a change work at home and at work, with tone adjusted to the relationship.",
      },
      exercise: {
        title: "Respond to a workplace or relationship scenario",
        steps: [
          "Pick one scenario: a teammate keeps missing shared deadlines, or a relative often drops by without warning.",
          "Write what you notice, without judgment.",
          "Write the effect it has on you or the team.",
          "Write your boundary or suggestion as a clear request.",
          "Write how you might respond if they react with surprise or frustration.",
        ],
        fields: [
          { id: "scenario", label: "The scenario I chose", kind: "short" },
          { id: "notice", label: "What I notice", kind: "short" },
          { id: "effect", label: "The effect", kind: "short" },
          { id: "request", label: "My boundary or suggestion", kind: "long" },
          { id: "follow-up", label: "How I would respond to their reaction", kind: "long" },
        ],
        minutes: 8,
      },
      practice: {
        kind: "scenario",
        prompt: "Someone interrupts you while you are speaking. How would you respond respectfully and confidently?",
        examples: [
          { text: "\"I'd like to finish this point, and then I really want to hear your thoughts.\"", why: "It holds your turn calmly, without blame, and shows you value what they want to say." },
          { text: "\"Hold on one moment, I'm almost done.\" Then finish briefly and say, \"Go ahead, what were you going to say?\"", why: "It is short and confident, and it hands the turn back clearly once you have finished." },
          { text: "In a meeting: \"Sorry, Sam, I hadn't quite finished. Let me wrap up in thirty seconds.\"", why: "It works in a professional setting, names the issue lightly, and gives a clear time limit." },
        ],
        lookFors: [
          "Does your response keep a calm, steady tone rather than a sharp one?",
          "Does it make clear that you would like to finish your point?",
          "Does it show you still want to hear the other person afterward?",
        ],
        cues: [
          { anyOf: ["finish", "almost done", "wrap up", "one moment", "hadn't finished"], say: "You claimed your turn clearly, which shows quiet confidence." },
          { anyOf: ["your thoughts", "go ahead", "hear what", "then you", "your turn"], say: "You promised the other person their turn, which keeps the exchange respectful." },
          { anyOf: ["i'd like", "let me", "please"], say: "You used calm, polite wording, which keeps things friendly while still being firm." },
        ],
      },
      reflection: [
        "Where do you find it easier to set boundaries: at home or at work? Why might that be?",
        "How do you usually react when you receive feedback you did not expect?",
        "What is one piece of positive, specific feedback you could give someone this week?",
      ],
      takeaways: [
        "Boundaries can be kind and firm at the same time.",
        "Good feedback names what you noticed, its effect, and a suggestion.",
        "Receive feedback by listening, asking for an example, and saying thanks.",
        "At work, clear next steps and early problem-raising help everyone.",
      ],
    },
    // 10
    {
      id: "communication-10",
      number: 10,
      title: msg("Your Communication Challenge"),
      skill: msg("Combine listening, clarity, empathy, and assertiveness in one real conversation and reflect on it."),
      minutes: 10,
      intro: [
        "You have now learned the main building blocks of good communication: attention, active listening, clear structure, open questions, assertiveness, respectful disagreement, preparation for hard talks, empathy, and boundaries. This final lesson brings them together.",
        "You will plan a real conversation that matters to you, choose which skills to use, have the conversation, and then reflect on what went well and what you want to keep practicing.",
      ],
      learn: [
        {
          heading: "Choosing your challenge",
          paragraphs: [
            "Pick a conversation that feels meaningful but manageable. It should stretch you a little without feeling overwhelming. Good options include asking for something you need, reconnecting with someone you have drifted from, or discussing a small ongoing friction at home or work.",
            "Avoid choosing your most difficult conversation for this challenge. Building skill on something medium-sized gives you confidence for bigger ones later.",
          ],
        },
        {
          heading: "Putting the skills together",
          paragraphs: [
            "A conversation that draws on everything in this course often follows a natural flow. You do not need to follow it rigidly, but it can help you prepare.",
          ],
          bullets: [
            "Set the scene: choose a good time and give your full attention.",
            "Open clearly: state your intention and main point.",
            "Listen and ask: use open questions and reflect back what you hear.",
            "Speak up: express your view or need assertively, with \"I\" language.",
            "Stay respectful: if you disagree, stay on the issue and look for common ground.",
            "Close well: agree on a next step and thank the person.",
          ],
        },
        {
          heading: "Reflecting afterward",
          paragraphs: [
            "Reflection turns an experience into learning. Soon after the conversation, write down what happened while it is still fresh. Be curious rather than critical. Notice what worked, what felt hard, and what you would try differently.",
            "Remember that one conversation does not define your skills. Communication improves through steady practice, and every attempt, even an awkward one, teaches you something.",
          ],
        },
      ],
      example: {
        title: "Ingrid's reconnection call",
        story: [
          "Ingrid, 39, had drifted from a close friend after a misunderstanding about a missed birthday two years earlier. For her challenge, she decided to call.",
          "She opened with, \"I've missed you, and I've wanted to call for a long time.\" She asked how her friend had been and reflected back what she heard. When the birthday came up, Ingrid said, \"I'm sorry it hurt you. I'd like to explain what was happening for me, if that's okay.\" They talked for an hour and planned to meet for lunch. Afterward Ingrid wrote that listening first had made it much easier to share her side.",
        ],
        point: "Ingrid combined a clear opening, active listening, empathy, and assertive honesty, and her reflection helped her see which skill made the biggest difference.",
      },
      exercise: {
        title: "Complete a real-life communication challenge",
        steps: [
          "Choose a meaningful but manageable conversation to have within the next week.",
          "Write your goal and your opening sentence.",
          "Pick two or three skills from this course that you will focus on.",
          "Have the conversation.",
          "Afterward, write what went well, what was hard, and what you will keep practicing.",
        ],
        fields: [
          { id: "conversation", label: "The conversation I chose", kind: "short" },
          { id: "goal-opening", label: "My goal and opening sentence", kind: "long" },
          { id: "skills", label: "The skills I will focus on", kind: "short", placeholder: "Reflecting back, open questions, one clear request." },
          { id: "went-well", label: "What went well", kind: "long" },
          { id: "keep-practicing", label: "What was hard and what I will keep practicing", kind: "long" },
        ],
        minutes: 10,
      },
      practice: {
        kind: "mindful",
        prompt: "Picture yourself at the start of your challenge conversation. Take a slow, comfortable breath. Now write the first two things you will say, and one thing you will do to show you are listening.",
        examples: [
          { text: "\"Thanks for making time. I'd like to talk about how we plan our weekends, because I want us both to enjoy them.\" I'll put my phone away and summarize what they say before I reply.", why: "It opens clearly with an intention and plans a concrete listening habit." },
          { text: "\"I've been wanting to catch up properly. How have things been for you?\" I'll ask follow-up questions and let them finish before I share my news.", why: "It starts with warmth and an open question, and commits to patient listening." },
        ],
        lookFors: [
          "Does your opening make your intention clear?",
          "Does it include a specific listening habit you can actually do?",
          "Does it feel natural enough to say in your own voice?",
        ],
        cues: [
          { anyOf: ["i'd like", "i want", "i've been wanting", "thanks for"], say: "You opened with a clear, warm intention, which sets a calm tone." },
          { anyOf: ["summarize", "listen", "follow-up", "let them finish", "reflect"], say: "You planned a specific listening habit, which shows you are bringing the course skills together." },
          { anyOf: ["how have", "what do you", "how do you", "tell me"], say: "You included an open question, which invites the other person into the conversation." },
        ],
      },
      reflection: [
        "Which skill from this course has made the biggest difference for you so far?",
        "What did your challenge conversation teach you about yourself?",
        "Which skill would you like to keep practicing over the next month?",
      ],
      takeaways: [
        "Good communication combines listening, clarity, empathy, and assertiveness.",
        "Choose a meaningful but manageable conversation to practice on.",
        "Reflect with curiosity, not criticism.",
        "Every conversation is a chance to practice, including the awkward ones.",
      ],
    },
  ],
};
