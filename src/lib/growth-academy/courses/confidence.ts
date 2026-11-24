import { msg } from "@/lib/i18n/translate";
import type { GrowthCourse } from "@/lib/growth-academy/types";

export const confidenceCourse: GrowthCourse = {
  id: "confidence",
  title: msg("Confidence & Self-Esteem Training"),
  shortTitle: msg("Confidence & Self-Esteem"),
  tagline: msg("Build steady, realistic confidence one small step at a time."),
  description: msg("Ten short lessons on noticing your strengths, quieting unfair self-criticism, speaking up, setting boundaries, and trusting your own choices."),
  goal: msg("Help you recognize your strengths, develop healthy self-confidence, communicate more confidently, and become more comfortable expressing yourself."),
  objectives: [
    msg("Name your strengths with real examples and speak to yourself in a fair, encouraging way."),
    msg("Share your opinions, introduce yourself, and speak to a group with clear structure and calmer nerves."),
    msg("Use body language, boundaries, and respectful wording to say no and handle difficult conversations."),
    msg("Make decisions you can stand behind and turn one real confidence challenge into a practical plan."),
  ],
  difficulty: "beginner",
  cover: "sunrise",
  colors: ["#b4562f", "#fbe6d8"],
  achievement: {
    id: "confidence-builder",
    title: msg("Confidence Builder"),
    text: msg("You finished all ten lessons and made a plan for a real confidence challenge of your own."),
  },
  lessons: [
    // 1
    {
      id: "confidence-01",
      number: 1,
      title: msg("Discover Your Strengths"),
      skill: msg("Name your strengths with real examples, so confidence rests on evidence rather than mood."),
      minutes: 8,
      intro: [
        "Confidence grows more easily when it stands on something solid. In this lesson you will learn to notice your strengths: the abilities, qualities, and habits that already help you and the people around you.",
        "You will look at the different kinds of strengths people have, practice spotting them in ordinary days, and finish with a short list of your own that you can come back to.",
      ],
      learn: [
        {
          heading: "What counts as a strength",
          paragraphs: [
            "A strength is anything you do fairly well and that tends to help: a skill you learned, a quality of character, or a way you treat people. It does not have to be rare or impressive. Being reliable, patient with children, good at fixing things, or calm in a long line are all strengths.",
            "Many people overlook their strengths because they come easily. If something feels effortless to you, that is often a clue that it is a strength, not a sign that it does not count.",
          ],
          bullets: [
            "Skills: cooking, organizing, listening, explaining, repairing, writing.",
            "Qualities: kindness, honesty, patience, curiosity, humor, courage.",
            "Habits: keeping promises, finishing what you start, checking on friends.",
          ],
        },
        {
          heading: "Why evidence matters",
          paragraphs: [
            "Telling yourself \"I am great\" rarely sticks, because a part of you asks for proof. A strength backed by a real moment is different. \"I stayed calm when my neighbor's pipe burst and helped her find the shut-off valve\" is hard to argue with.",
            "When you collect examples like this, your confidence has a memory to lean on in moments of doubt.",
          ],
        },
        {
          heading: "Where to look",
          paragraphs: [
            "Think about what people thank you for, what they ask you to help with, and what you enjoy doing even when nobody is watching. Look at hard times too: getting through a difficult period usually needed strengths such as persistence or resourcefulness.",
            "Accomplishments count as well. Finishing a course, learning a new routine at work, or keeping a home running through a busy season all show abilities you can name.",
          ],
        },
      ],
      example: {
        title: "Maria's \"nothing special\" week",
        story: [
          "Maria, 46, told a friend she had no real talents. Her friend asked her to describe her week instead.",
          "Maria had calmed her teenage son before an exam, covered a colleague's shift at short notice, and planned a birthday dinner on a tight budget. When she wrote these down, she saw patience, reliability, and practical planning.",
        ],
        point: "Strengths often hide inside ordinary days. Describing what you actually did makes them easier to see.",
      },
      exercise: {
        title: "Find five strengths",
        steps: [
          "Think back over the last month, at home, at work, and with friends.",
          "Write down at least five strengths. They can be skills, qualities, habits, or accomplishments.",
          "Next to each one, add a short real example of when you used it.",
          "Read the list back slowly. Notice which one surprises you most.",
        ],
        fields: [
          { id: "strength-1", label: "Strength 1 and an example", kind: "short", placeholder: "Patient: I helped my father set up his new phone." },
          { id: "strength-2", label: "Strength 2 and an example", kind: "short" },
          { id: "strength-3", label: "Strength 3 and an example", kind: "short" },
          { id: "strength-4", label: "Strength 4 and an example", kind: "short" },
          { id: "strength-5", label: "Strength 5 and an example", kind: "short" },
        ],
        minutes: 5,
      },
      practice: {
        kind: "scenario",
        prompt: "A colleague says, \"You are so good at calming people down.\" You feel embarrassed and want to say \"Oh, it's nothing.\" What could you say instead that accepts the compliment?",
        examples: [
          { text: "\"Thank you, that is kind of you to notice.\"", why: "Short and warm. It accepts the compliment without making it bigger or smaller." },
          { text: "\"Thanks. I do try to listen before I say anything.\"", why: "It accepts the praise and names the skill behind it, which helps you remember it." },
        ],
        lookFors: [
          "Does your answer start with a simple thank you?",
          "Does it accept the compliment rather than brushing it away?",
          "Is it something you would feel comfortable saying aloud?",
        ],
        cues: [
          { anyOf: ["thank", "thanks"], say: "You began with thanks, which lets the other person's kindness land." },
          { anyOf: ["i try", "i like", "i enjoy"], say: "You named something you do on purpose, which turns the compliment into a strength you own." },
        ],
      },
      reflection: [
        "What do you appreciate about yourself?",
        "Which of your strengths do other people notice more than you do?",
        "Where could you use one of your strengths a little more this week?",
      ],
      takeaways: [
        "Strengths include skills, qualities, everyday habits, and accomplishments.",
        "Things that feel easy to you are often real strengths.",
        "A strength backed by a real example builds steadier confidence.",
        "Accepting a compliment with a simple thank you is a confidence skill in itself.",
      ],
    },
    // 2
    {
      id: "confidence-02",
      number: 2,
      title: msg("Believe in Yourself"),
      skill: msg("Catch unfair self-criticism and rewrite it as a balanced, encouraging thought."),
      minutes: 9,
      intro: [
        "Most people carry an inner voice that comments on everything they do. Sometimes it is helpful. Often it is harsher than anything you would say to a friend. In this lesson you will learn to notice that voice and answer it fairly.",
        "You will learn a simple way to catch a negative thought, test it, and rewrite it so it is honest and encouraging at the same time. The goal is not forced positivity. It is a fairer conversation with yourself.",
      ],
      learn: [
        {
          heading: "Self-doubt is normal, and it is not a fact",
          paragraphs: [
            "Doubt shows up when something matters to you. A flicker of \"What if I get this wrong?\" before a new task is ordinary. The trouble starts when doubt turns into a verdict, such as \"I always mess things up\" or \"I am not the kind of person who can do this.\"",
            "A thought can feel completely true and still be unfair. Feelings are real information about how you feel, but they are not proof about who you are or what will happen.",
          ],
        },
        {
          heading: "Common patterns in unfair self-talk",
          paragraphs: [
            "Negative inner dialogue tends to follow a few familiar shapes. Naming the shape makes it easier to step back from it.",
          ],
          bullets: [
            "All-or-nothing words: \"always,\" \"never,\" \"completely,\" \"total failure.\"",
            "Labels: \"I am useless\" instead of \"That part did not go well.\"",
            "Mind reading: \"Everyone thinks I am boring\" without any real sign.",
            "Fortune telling: \"It will definitely go badly,\" before anything has happened.",
            "Ignoring the good: one mistake erases ten things that went fine.",
          ],
        },
        {
          heading: "Three questions for a fairer thought",
          paragraphs: [
            "When you notice a harsh thought, pause and ask yourself three questions. First: What is the evidence for and against this? Second: What would I say to a friend who said this about themselves? Third: What is a more balanced way to put it that is still true?",
            "A balanced thought keeps the honest part and drops the exaggeration. \"I always freeze in meetings\" might become \"I froze in today's meeting. Last week I spoke up once, and I can prepare one point for next time.\" It does not pretend the problem is gone. It gives you somewhere to go.",
          ],
        },
      ],
      example: {
        title: "Kwame and the late report",
        story: [
          "Kwame, 38, sent a report two days late because his daughter had been sick. On the drive home he kept thinking, \"I am so unreliable. My manager must think I am hopeless.\"",
          "That evening he wrote the thought down and asked the three questions. He had met every other deadline that quarter, and his manager had replied, \"Thanks, hope she feels better.\" His rewrite was: \"This one was late for a real reason. I am usually on time, and next time I will let my manager know earlier if something comes up.\"",
        ],
        point: "Testing a harsh thought against the facts often shows a fairer story. The balanced version also points to a useful next step.",
      },
      exercise: {
        title: "Rewrite three negative thoughts",
        steps: [
          "Think of three critical things you have said to yourself recently. Write each one down exactly as it sounded in your head.",
          "For each thought, note one piece of evidence that does not fit it.",
          "Rewrite each thought as a balanced, encouraging statement that you can honestly believe.",
          "Read your three new statements aloud, slowly, once.",
        ],
        fields: [
          { id: "thought-1", label: "Negative thought 1 and your balanced rewrite", kind: "long", placeholder: "\"I'm terrible with money.\" → \"I overspent this month, and I have paid every bill on time this year.\"" },
          { id: "thought-2", label: "Negative thought 2 and your balanced rewrite", kind: "long" },
          { id: "thought-3", label: "Negative thought 3 and your balanced rewrite", kind: "long" },
        ],
        minutes: 6,
      },
      practice: {
        kind: "question",
        prompt: "You try a new recipe for friends and it comes out dry. Your inner voice says, \"You can't do anything right.\" How could you rewrite that thought so it is honest and kind?",
        examples: [
          { text: "\"The chicken was dry this time. My friends still enjoyed the evening, and next time I will check it earlier.\"", why: "It admits what went wrong, notices what went well, and points to a small fix." },
          { text: "\"One recipe did not work. That does not cancel all the meals I have cooked well.\"", why: "It replaces an all-or-nothing word with a fair, specific view." },
        ],
        lookFors: [
          "Does your rewrite name the specific thing that went wrong, rather than you as a person?",
          "Does it include something that went well or a strength you have?",
          "Would you feel comfortable saying it to a friend in the same situation?",
        ],
        cues: [
          { anyOf: ["this time", "one", "today"], say: "You kept the problem specific to this moment, which is fair and accurate." },
          { anyOf: ["next time", "i will", "i can"], say: "You added a next step, which turns criticism into something you can act on." },
          { anyOf: ["still", "enjoyed", "usually", "well"], say: "You noticed what went right as well, which gives a more balanced picture." },
        ],
      },
      reflection: [
        "Which pattern of unfair self-talk shows up most often for you?",
        "What would change if you spoke to yourself the way you speak to a good friend?",
        "What is one belief about yourself you would like to test this week?",
      ],
      takeaways: [
        "A thought can feel true and still be unfair.",
        "Watch for words like \"always,\" \"never,\" and harsh labels.",
        "Ask: What is the evidence? What would I tell a friend? What is a fairer version?",
        "Balanced thoughts stay honest and point to a next step.",
      ],
    },
    // 3
    {
      id: "confidence-03",
      number: 3,
      title: msg("Speak with Confidence"),
      skill: msg("Share an opinion, ask a question, or introduce yourself in a clear, simple structure."),
      minutes: 8,
      intro: [
        "Speaking with confidence is less about having a big personality and more about having a simple plan for what you want to say. In this lesson you will learn small structures that make it easier to share an opinion, ask a question, and introduce yourself.",
        "You will also practice a short, 30-second introduction that you can adapt for work events, new groups, classes, or neighborhood gatherings.",
      ],
      learn: [
        {
          heading: "Clear beats clever",
          paragraphs: [
            "People often hold back because they worry that what they say will not sound smart enough. In everyday conversation, being clear matters far more than being impressive. A short, plain sentence that says what you think is usually easier for others to hear and respond to.",
            "Try to lead with your main point, then give one reason. For example: \"I think Saturday works better, because more people are free.\" That is a complete, confident contribution.",
          ],
        },
        {
          heading: "Simple structures to lean on",
          paragraphs: [
            "Having a few patterns ready means you do not have to invent your sentence from scratch when you feel nervous.",
          ],
          bullets: [
            "Sharing an opinion: \"My view is... because...\" or \"One thing I noticed is...\"",
            "Building on someone else: \"I agree with Sam, and I would add...\"",
            "Gently disagreeing: \"I see it a bit differently. I think...\"",
            "Asking a question: \"Can I check something? When you say..., do you mean...?\"",
            "Asking for help: \"I am not sure I followed that part. Could you go over it again?\"",
          ],
        },
        {
          heading: "A 30-second introduction",
          paragraphs: [
            "A good short introduction has three parts: who you are, something about what you do or care about, and a link to the people in front of you. For example: \"Hi, I am Lena. I work in a library, and lately I have been learning to garden. I came tonight because I would like to meet more people in the neighborhood.\"",
            "Speak a little slower than feels natural, and pause briefly between parts. Asking questions is a confident act too. It shows you are engaged, and most people are glad when someone asks what others were wondering.",
          ],
        },
      ],
      example: {
        title: "Diego's first team meeting",
        story: [
          "Diego, 52, changed careers and joined a team where everyone seemed to know each other. At his first meeting he had a question about the schedule but stayed quiet, worried it would sound basic.",
          "Before the next meeting he wrote down one opinion and one question using the patterns \"One thing I noticed is...\" and \"Can I check something?\" He said both. Two colleagues thanked him afterward because they had wondered the same thing.",
        ],
        point: "Preparing a simple sentence ahead of time lowers the pressure. A clear question often helps other people as much as it helps you.",
      },
      exercise: {
        title: "Introduce yourself in 30 seconds",
        steps: [
          "Write a short introduction with three parts: who you are, something you do or care about, and why you are here.",
          "Read it aloud once to check it fits comfortably in about 30 seconds.",
          "Start the timer and say your introduction out loud, a little slower than usual.",
          "Note one thing you liked about how it sounded and one small change you would make.",
        ],
        fields: [
          { id: "intro-script", label: "Your 30-second introduction", kind: "long", placeholder: "Hi, I'm... I work as / I spend my time... I'm here because..." },
          { id: "intro-liked", label: "One thing you liked about saying it", kind: "short" },
          { id: "intro-change", label: "One small change for next time", kind: "short" },
        ],
        minutes: 6,
        timerSeconds: 30,
      },
      practice: {
        kind: "scenario",
        prompt: "You are in a group conversation. You have an opinion, but you feel nervous about speaking. What could you say?",
        examples: [
          { text: "\"Can I add something? I think we could try the earlier time, because it is easier for people with kids.\"", why: "It politely opens a space, states a clear view, and gives one reason." },
          { text: "\"I agree with what Priya said, and one thing I would add is that the park is closer for most of us.\"", why: "Building on someone else is a gentle way in, and it still shares your own idea." },
          { text: "\"I see it a little differently. My view is that we should wait a week.\"", why: "It disagrees calmly and clearly, without attacking anyone." },
        ],
        lookFors: [
          "Does your answer include your actual opinion, not just agreement?",
          "Does it give a short reason?",
          "Is it short enough to say comfortably in one breath or two?",
        ],
        cues: [
          { anyOf: ["i think", "my view", "i feel", "one thing"], say: "You stated your own view clearly, which is the heart of speaking up." },
          { anyOf: ["because", "since", "so that"], say: "You added a reason, which helps others understand and respond to your idea." },
          { anyOf: ["can i add", "i agree", "i would add"], say: "You found a polite way into the conversation, which makes speaking up feel easier." },
        ],
      },
      reflection: [
        "In which setting do you most often hold back your opinion?",
        "Which sentence pattern from this lesson feels most natural for you to use?",
        "Who is one person you could practice speaking up with this week?",
      ],
      takeaways: [
        "Clear and simple is more confident than clever.",
        "Lead with your point, then give one reason.",
        "Ready-made sentence patterns help when nerves rise.",
        "Asking a question is a confident way to take part.",
      ],
    },
    // 4
    {
      id: "confidence-04",
      number: 4,
      title: msg("Overcome the Fear of Judgment"),
      skill: msg("Approach uncomfortable social situations in small, gradual steps instead of avoiding them."),
      minutes: 9,
      care: "This lesson is about everyday nervousness around other people's opinions. If fear of judgment is stopping you from daily activities or feels overwhelming for a long time, a doctor or mental health professional can help.",
      intro: [
        "Almost everyone cares what others think. That concern helps us get along. But when the fear of criticism, embarrassment, or rejection becomes strong, it can keep you quiet, keep you home, or keep you from trying things you want to do.",
        "In this lesson you will learn why avoidance makes the fear grow, how to build a ladder of small steps, and how to try the first step in a way that feels manageable.",
      ],
      learn: [
        {
          heading: "How avoidance keeps fear alive",
          paragraphs: [
            "When you avoid something uncomfortable, you feel relief right away. That relief teaches your mind that the situation really was dangerous. Next time, the fear can feel even stronger.",
            "Facing a situation in small doses works the other way. Each time you stay, even briefly, your mind collects new information: \"That was awkward, and I was fine.\" Over time the situation starts to feel more ordinary.",
          ],
        },
        {
          heading: "People are thinking about you less than you fear",
          paragraphs: [
            "When we feel self-conscious, it can seem as though everyone has noticed our blush, our pause, or our mistake. In reality, most people are busy with their own thoughts and worries. A moment that feels huge to you often passes unnoticed by others.",
            "Even when someone does notice, a small stumble rarely changes how they see you. Many people find it easier to relate to someone who is a little imperfect.",
          ],
        },
        {
          heading: "Build a ladder of small steps",
          paragraphs: [
            "Pick an area where you would like to feel freer, then list situations from easiest to hardest. Start with a step that feels a little uncomfortable but doable. Stay with it until the discomfort starts to settle, then move up only when you are ready.",
          ],
          bullets: [
            "Easiest: ask a store employee where something is.",
            "Next: give a short compliment to a neighbor or coworker.",
            "Next: share a small opinion with one friend.",
            "Harder: share an idea in a group or ask a question in a class.",
            "Hardest for now: suggest a plan to a group and invite people to join.",
          ],
        },
      ],
      example: {
        title: "Mei's book club",
        story: [
          "Mei, 61, joined a book club after retiring but said almost nothing for three meetings. She worried that her ideas would sound obvious and that people would think she had not understood the book.",
          "She made a small ladder. First she would ask one question. Then she would share one sentence about a character she liked. By the fifth meeting she was reading a short passage aloud. Her heart still raced at first, but it settled faster each time.",
        ],
        point: "Small, repeated steps let confidence grow at a pace that feels safe. The fear does not have to vanish before you begin.",
      },
      exercise: {
        title: "Choose one small step",
        steps: [
          "Think of an area of life where you would like to express yourself more openly.",
          "Write down one small situation in that area that feels slightly uncomfortable but possible.",
          "Write what you are afraid might happen, and what is more likely to happen.",
          "Pick a day this week to try it, and plan one kind thing to say to yourself afterward, however it goes.",
        ],
        fields: [
          { id: "fear-situation", label: "The small situation you will try", kind: "short", placeholder: "Tell my coworker I enjoyed her presentation." },
          { id: "fear-worry", label: "What you fear might happen, and what is more likely", kind: "long" },
          { id: "fear-when", label: "When you will try it", kind: "short" },
          { id: "fear-kind-words", label: "What you will say to yourself afterward", kind: "short" },
        ],
        minutes: 6,
      },
      practice: {
        kind: "mindful",
        prompt: "Imagine you are about to ask a question in a class or meeting. Your face feels warm and your heart beats faster. Take a slow breath. What could you tell yourself in that moment that helps you go ahead?",
        examples: [
          { text: "\"My heart is racing because this matters to me. I can feel nervous and still ask.\"", why: "It accepts the feeling instead of fighting it, and keeps you moving." },
          { text: "\"Other people probably have the same question. A short question is enough.\"", why: "It is realistic, lowers the pressure, and keeps the step small." },
        ],
        lookFors: [
          "Does your answer allow the nervous feeling to be there?",
          "Does it remind you that the step is small?",
          "Does it sound kind rather than demanding?",
        ],
        cues: [
          { anyOf: ["nervous", "and still", "it's okay", "it is okay"], say: "You let the nerves be there while still choosing to act, which is how courage usually works." },
          { anyOf: ["small", "short", "just one", "enough"], say: "You kept the step small, which makes it much easier to begin." },
        ],
      },
      reflection: [
        "What situations do you avoid because of what others might think?",
        "When you have faced a fear before, what actually happened?",
        "What is the smallest step on your ladder that you could try this week?",
      ],
      takeaways: [
        "Avoidance brings quick relief but makes fear stronger over time.",
        "Most people notice your stumbles far less than you expect.",
        "Build a ladder and start with a small, doable step.",
        "You can feel nervous and still act.",
      ],
    },
    // 5
    {
      id: "confidence-05",
      number: 5,
      title: msg("Public Speaking"),
      skill: msg("Prepare and deliver a short talk with a clear structure, steady pacing, and calmer nerves."),
      minutes: 10,
      intro: [
        "Speaking in front of a group, whether at work, a family celebration, or a community meeting, makes many people nervous. The good news is that public speaking is a skill made of small parts you can learn and practice.",
        "In this lesson you will learn a simple structure for a short talk, ways to use your voice and pace, and practical ways to manage nerves. You will finish by preparing and delivering a one-minute speech.",
      ],
      learn: [
        {
          heading: "Prepare with a simple shape",
          paragraphs: [
            "A short talk is easier to give, and easier to follow, when it has a clear beginning, middle, and end. Decide on the one main message you want people to remember before you write anything else.",
          ],
          bullets: [
            "Opening: one sentence that says what you will talk about, or a brief story or question.",
            "Middle: two or three points, each with a short example.",
            "Close: repeat your main message in one sentence and thank people.",
            "Write key words on a card instead of a full script, so you speak rather than read.",
          ],
        },
        {
          heading: "Voice and pacing",
          paragraphs: [
            "Nerves often make people speak faster. Aim for a pace that feels slightly slow to you; it usually sounds natural to listeners. Short pauses after important points give people time to take them in, and give you time to breathe.",
            "Speak to the back of the room so your voice carries without shouting. Vary your tone a little, as you would when telling a friend a story. If you lose your place, pause, look at your card, and carry on. A short silence feels much longer to you than to the audience.",
          ],
        },
        {
          heading: "Working with nervousness",
          paragraphs: [
            "A racing heart and shaky hands are your body getting ready for something that matters. You do not need to get rid of them to speak well. A few things can help them settle.",
          ],
          bullets: [
            "Practice aloud two or three times, ideally standing up.",
            "Before you start, breathe in gently through your nose and let a longer, slow breath out. Never hold your breath, and stop if you feel dizzy.",
            "Find one or two friendly faces and speak to them.",
            "Focus on helping the audience understand your message, not on how you look.",
          ],
        },
      ],
      example: {
        title: "Rosa's toast",
        story: [
          "Rosa, 44, was asked to give a toast at her brother's anniversary party. She considered saying no. Instead, she chose one message: \"He has always shown up for the people he loves.\"",
          "She picked two short stories that showed it, practiced in the kitchen three times, and kept a small card with three words on it. At the party her hands shook a little at first, but she slowed down, looked at her brother, and finished by raising her glass. People remembered the stories, not the shaking.",
        ],
        point: "One clear message, a few examples, and a little practice can carry you through nerves. Listeners remember what you said far more than how you felt.",
      },
      exercise: {
        title: "Prepare and deliver a one-minute speech",
        steps: [
          "Choose a topic you know well, such as a hobby, a place you love, or something you learned recently.",
          "Write your one main message, two supporting points, and a closing line.",
          "Practice once aloud from your notes, standing up if you can.",
          "Start the timer and deliver the speech to a mirror, a phone recording, or a trusted person.",
          "Write down what went well and one thing to try next time.",
        ],
        fields: [
          { id: "speech-message", label: "Your main message in one sentence", kind: "short", placeholder: "Walking every morning helps me start the day calmer." },
          { id: "speech-points", label: "Your two points and closing line", kind: "long" },
          { id: "speech-reflection", label: "What went well and one thing to try next time", kind: "long" },
        ],
        minutes: 8,
        timerSeconds: 60,
      },
      practice: {
        kind: "role-play",
        prompt: "You are halfway through a short talk at work and your mind suddenly goes blank. A few people are looking at you, waiting. What could you do or say?",
        examples: [
          { text: "Pause, take a slow breath out, glance at your note card, and continue: \"So, the second point is...\"", why: "A calm pause and a quick look at notes is all most blanks need. The audience usually reads it as thoughtfulness." },
          { text: "\"Let me just check my notes for a moment.\" Then carry on.", why: "Naming it simply and briefly takes the pressure off without apologizing at length." },
        ],
        lookFors: [
          "Does your answer include a pause or a breath?",
          "Does it give you a simple way back into the talk?",
          "Does it avoid a long apology?",
        ],
        cues: [
          { anyOf: ["pause", "breath", "breathe", "slow"], say: "You gave yourself a pause, which helps your thoughts come back." },
          { anyOf: ["notes", "card", "point"], say: "You used your notes to find your place, which is exactly what they are for." },
        ],
      },
      reflection: [
        "When have you spoken in front of others before, and what went better than you expected?",
        "Which part of public speaking feels hardest for you right now?",
        "Where could you practice a short talk in a low-pressure setting?",
      ],
      takeaways: [
        "Choose one main message before anything else.",
        "Opening, two or three points, and a clear close.",
        "Speak a little slower than feels natural and use pauses.",
        "Nerves are normal. Practice and slow breathing out help them settle.",
      ],
    },
    // 6
    {
      id: "confidence-06",
      number: 6,
      title: msg("Confident Body Language"),
      skill: msg("Use posture, eye contact, facial expression, and gestures that feel open and natural to you."),
      minutes: 8,
      intro: [
        "How you stand, move, and look at people sends messages before you say a word. Body language also works the other way: settling into an open, steady posture can help you feel more grounded.",
        "In this lesson you will learn simple, flexible ideas about posture, eye contact, facial expressions, and gestures. You will adapt them to your own body, culture, and comfort, then practice a confident introduction in front of a mirror.",
      ],
      learn: [
        {
          heading: "Posture and presence",
          paragraphs: [
            "Confident posture is not about standing perfectly straight or taking up as much room as possible. It is about looking settled and open. Whether you stand, sit, or use a wheelchair, you can let your shoulders drop away from your ears, rest your weight evenly, and face the person you are speaking with.",
            "Presence also means not rushing. Taking a moment before you speak, keeping your hands still for a second, and letting your breathing slow all signal that you are comfortable being where you are.",
          ],
        },
        {
          heading: "Eye contact, with flexibility",
          paragraphs: [
            "In many places, looking at someone while they talk shows interest and respect. But expectations differ between cultures, families, and individuals. In some settings, steady eye contact can feel rude or intense. Many people, including some neurodivergent people, find it uncomfortable or tiring.",
            "You do not have to force it. Looking near the eyes, at the bridge of the nose, or at the person's face in general works well. Glancing away now and then while you think is natural. What matters most is that the other person can tell you are paying attention.",
          ],
        },
        {
          heading: "Face and gestures",
          paragraphs: [
            "A relaxed face and an occasional, genuine smile help people feel at ease with you. Nodding shows you are listening. Gestures can support your words when they are open and calm.",
          ],
          bullets: [
            "Keep hands visible and relaxed rather than hidden or clenched.",
            "Use simple gestures to show size, number, or direction when you explain.",
            "Notice nervous habits, such as playing with a pen, and gently set the object down.",
            "Match your expression to your words, so a serious point looks serious.",
          ],
        },
      ],
      example: {
        title: "Sanjay's job interview",
        story: [
          "Sanjay, 35, had a video interview for a role he really wanted. In a practice call with a friend, he noticed he kept looking down at his notes and hunching toward the screen.",
          "He raised the laptop so the camera was at eye level, sat back a little, and practiced looking at the camera when he made a key point and at the screen when he listened. His friend said he looked calmer, and Sanjay said he felt calmer too.",
        ],
        point: "Small adjustments to posture and where you look can change how you come across and how you feel, without trying to become someone else.",
      },
      exercise: {
        title: "Mirror introduction",
        steps: [
          "Stand or sit in front of a mirror in a comfortable, open position, shoulders relaxed.",
          "Take one slow breath out, then say a short introduction aloud, such as the one from Lesson 3.",
          "Try it again with a relaxed face, a small smile at the start, and one simple hand gesture.",
          "Notice where your eyes go, and choose a way of looking that feels natural for you.",
          "Write down what you noticed and what you want to keep.",
        ],
        fields: [
          { id: "mirror-noticed", label: "What you noticed about your posture, face, and hands", kind: "long" },
          { id: "mirror-keep", label: "One thing you want to keep doing", kind: "short", placeholder: "Pausing and dropping my shoulders before I speak." },
        ],
        minutes: 6,
      },
      practice: {
        kind: "question",
        prompt: "You walk into a room where you know only one or two people. You feel like shrinking into a corner. What could you do with your body in the first minute that helps you feel and look more at ease?",
        examples: [
          { text: "Pause at the door, let my shoulders drop, and walk toward the person I know with a small smile.", why: "A brief pause and relaxed shoulders signal calm, and moving toward someone gives you a clear first step." },
          { text: "Hold my drink in one hand, keep the other relaxed, and face the group instead of the wall.", why: "Open, relaxed hands and facing people make it easier for others to include you." },
        ],
        lookFors: [
          "Does your answer include something about posture or shoulders?",
          "Does it include a way of looking or smiling that feels comfortable for you?",
          "Is it realistic for your own body and comfort?",
        ],
        cues: [
          { anyOf: ["shoulders", "stand", "sit", "posture"], say: "You thought about your posture, which helps you feel more grounded." },
          { anyOf: ["smile", "face", "look", "eyes"], say: "You chose a way to show warmth and attention that suits you." },
          { anyOf: ["pause", "breath", "slow"], say: "You included a pause, which helps you arrive calmly instead of rushing." },
        ],
      },
      reflection: [
        "What does your body tend to do when you feel unsure?",
        "What kind of eye contact feels comfortable and respectful to you and the people in your life?",
        "In which situation this week could you try one small body language change?",
      ],
      takeaways: [
        "Confident posture means settled and open, not stiff.",
        "Eye contact norms vary. Looking near the face is fine.",
        "Relaxed hands and a genuine expression put people at ease.",
        "A pause before speaking shows presence.",
      ],
    },
    // 7
    {
      id: "confidence-07",
      number: 7,
      title: msg("Say No Without Guilt"),
      skill: msg("Decline requests politely and clearly, so your yes means something and your time is protected."),
      minutes: 8,
      intro: [
        "Saying yes to everything can feel kind, but over time it can leave you tired, resentful, and with little time for what matters to you. Saying no, respectfully, is part of healthy self-esteem.",
        "In this lesson you will learn why boundaries help relationships, how to handle the guilt that often comes with saying no, and several respectful ways to decline that you can adapt to your own life.",
      ],
      learn: [
        {
          heading: "Why boundaries are healthy",
          paragraphs: [
            "A boundary is a limit on what you can or will do. It is not a punishment or a rejection of the other person. When you are honest about your limits, people know where they stand, and your yes becomes more trustworthy.",
            "Guilt after saying no is common, especially if you grew up being praised for always helping. Feeling guilty does not mean you did something wrong. It often just means you are doing something new.",
          ],
        },
        {
          heading: "Ways to say no respectfully",
          paragraphs: [
            "A good no is clear, kind, and short. You do not need a long explanation or an excuse. Too many reasons can invite debate.",
          ],
          bullets: [
            "Simple and warm: \"Thank you for asking, but I can't this time.\"",
            "With a reason, if you want: \"I would love to, but I have promised myself a quiet weekend.\"",
            "Offering an alternative: \"I can't help on Saturday, but I could drop off the chairs on Friday.\"",
            "Buying time: \"Let me check my week and get back to you tomorrow.\"",
            "Partial yes: \"I can't lead the project, but I can review the plan once.\"",
          ],
        },
        {
          heading: "When people push back",
          paragraphs: [
            "Sometimes people ask again or try to change your mind. You can calmly repeat your answer without adding new reasons: \"I understand, and it is still a no for me this time.\" Repeating yourself kindly is not rude. It is clear.",
            "Notice how you feel in your body when you are asked for something. A tight chest or sinking stomach can be a sign that you want to say no, even before your mind has caught up.",
          ],
        },
      ],
      example: {
        title: "Fatima and the weekend favor",
        story: [
          "Fatima, 49, was the person everyone called when they needed help moving, babysitting, or driving. One Friday a cousin asked her to help paint his apartment all weekend. She was exhausted and had planned to rest.",
          "She took a breath and said, \"I can't this weekend. I really need some rest. I could come by for an hour next Sunday if that helps.\" Her cousin was surprised but said, \"That's fair.\" Fatima felt guilty for an hour, then relieved for the rest of the weekend.",
        ],
        point: "A short, kind no with an honest limit is usually accepted better than you fear. Guilt often fades once you see the relationship is still fine.",
      },
      exercise: {
        title: "Three ways to say no",
        steps: [
          "Think of a real request you often find hard to refuse.",
          "Write three different polite but confident ways to say no to it.",
          "Make at least one of them very short, and one of them include an alternative.",
          "Say each one aloud and mark the one that feels most natural to you.",
        ],
        fields: [
          { id: "no-request", label: "The request you find hard to refuse", kind: "short", placeholder: "Staying late to cover for a coworker." },
          { id: "no-1", label: "Way to say no 1", kind: "short" },
          { id: "no-2", label: "Way to say no 2", kind: "short" },
          { id: "no-3", label: "Way to say no 3", kind: "short" },
        ],
        minutes: 5,
      },
      practice: {
        kind: "role-play",
        prompt: "A friend asks you to organize a group trip. You are already very busy and do not want to take it on. Your friend says, \"Oh come on, you're so good at this!\" What could you say?",
        examples: [
          { text: "\"Thank you, that is nice to hear. I can't take it on right now, but I would love to come.\"", why: "It accepts the compliment, keeps the no clear, and shows you still care about the trip." },
          { text: "\"I'm not able to organize it this time. I could share the list of places I used last year.\"", why: "It declines firmly and offers a small, manageable alternative." },
        ],
        lookFors: [
          "Does your answer say no clearly, without sounding like a maybe?",
          "Is it kind to your friend?",
          "Is it short, without a long list of excuses?",
        ],
        cues: [
          { anyOf: ["can't", "cannot", "not able", "won't be able"], say: "Your no is clear, which helps your friend know where things stand." },
          { anyOf: ["thank", "thanks", "nice of you", "kind"], say: "You stayed warm while setting the limit, which protects the friendship." },
          { anyOf: ["but i could", "i could", "instead", "happy to"], say: "You offered an alternative that fits your limits, which shows goodwill." },
        ],
      },
      reflection: [
        "Who or what do you find hardest to say no to, and why?",
        "What do you lose when you say yes to things you do not want to do?",
        "What would you like to make more room for by saying no a little more often?",
      ],
      takeaways: [
        "A boundary is about your limits, not a rejection of the other person.",
        "A good no is clear, kind, and short.",
        "Guilt after saying no is common and usually fades.",
        "You can calmly repeat your answer if someone pushes.",
      ],
    },
    // 8
    {
      id: "confidence-08",
      number: 8,
      title: msg("Handle Difficult Conversations"),
      skill: msg("Raise a concern, disagree respectfully, and ask for what you need using calm, specific wording."),
      minutes: 10,
      care: "This lesson is for everyday disagreements with people who are generally safe to talk with. If a relationship involves threats, intimidation, or harm, your safety comes first; consider reaching out to a trusted person, a local support service, or emergency services.",
      intro: [
        "Some conversations feel hard before they even begin: telling a friend something hurt you, disagreeing with a manager, or asking a family member for help. Many people put them off, and the issue grows.",
        "In this lesson you will learn how to prepare for a difficult conversation, a simple structure for raising a concern, and ways to stay calm and respectful when you disagree.",
      ],
      learn: [
        {
          heading: "Prepare before you talk",
          paragraphs: [
            "Decide what you want from the conversation. Is it to be heard, to change something, or to find a compromise? Knowing your aim helps you stay on track if emotions rise.",
            "Choose a good time and place. Private, unhurried moments work better than raising an issue in the middle of an argument or in front of others. You can open gently: \"Do you have a few minutes? There is something I would like to talk about.\"",
          ],
        },
        {
          heading: "A simple structure for raising a concern",
          paragraphs: [
            "Talking about the specific situation, your feelings, and your request is clearer and less likely to start a fight than talking about the other person's character.",
          ],
          bullets: [
            "What happened: \"When the plans changed at the last minute on Friday...\"",
            "How you felt: \"...I felt frustrated, because I had arranged my day around it.\"",
            "What you need: \"Could you let me know earlier if plans might change?\"",
            "Invite their view: \"How does that sound to you?\"",
          ],
        },
        {
          heading: "Disagreeing and staying steady",
          paragraphs: [
            "You can disagree and still show respect. Start by showing you understood: \"So you think we should wait. I see why.\" Then share your view: \"I see it differently, because...\" Avoid words like \"you always\" or \"you never,\" which tend to make people defensive.",
            "If things get heated, it is fine to pause: \"I want to keep talking about this, but I need a few minutes first.\" Breathe out slowly, and come back when you both feel calmer. You do not have to settle everything in one conversation.",
          ],
        },
      ],
      example: {
        title: "Tomás and the shared workload",
        story: [
          "Tomás, 41, had been quietly taking on extra tasks at work since a colleague left. He felt resentful but worried that raising it would make him look like he could not cope.",
          "He asked his manager for a short meeting and said, \"Since the team changed, I have been covering three extra reports each week. I'm finding it hard to keep up with my main work. Could we look at sharing them out or changing deadlines?\" His manager had not realized the load and agreed to move two reports to someone else.",
        ],
        point: "Describing the situation, the effect, and a clear request turns a complaint into a problem you can solve together.",
      },
      exercise: {
        title: "Respond to a challenging conversation",
        steps: [
          "Read this scenario: A family member keeps making jokes about your job at gatherings. It bothers you, and you would like it to stop.",
          "Write what happened, in neutral words that describe it without blaming.",
          "Write how it makes you feel, starting with \"I feel...\"",
          "Write a clear, respectful request, and a question that invites their view.",
          "Read your whole response aloud and adjust anything that sounds harsher than you intend.",
        ],
        fields: [
          { id: "talk-situation", label: "What happened", kind: "short", placeholder: "At the last two dinners, you joked about my job in front of everyone." },
          { id: "talk-feeling", label: "How you feel", kind: "short" },
          { id: "talk-request", label: "Your request and a question that invites their view", kind: "long" },
        ],
        minutes: 7,
      },
      practice: {
        kind: "role-play",
        prompt: "A friend often arrives very late when you meet, and you end up waiting. You decide to bring it up. Your friend says, \"It's just a few minutes, why does it matter?\" What could you say?",
        examples: [
          { text: "\"I know it doesn't seem like much, but when I wait half an hour I feel like my time doesn't count. Could you text me if you're running late?\"", why: "It stays calm, explains the effect honestly, and makes a simple, doable request." },
          { text: "\"I get that it feels small to you. For me it adds up. Can we agree on a time that works better for you?\"", why: "It shows understanding, holds your point, and invites a solution together." },
        ],
        lookFors: [
          "Does your answer describe how it affects you rather than criticizing your friend?",
          "Does it include a clear, specific request?",
          "Does it stay calm and leave room for your friend's view?",
        ],
        cues: [
          { anyOf: ["i feel", "i felt", "for me"], say: "You spoke from your own experience, which makes it easier for your friend to listen." },
          { anyOf: ["could you", "can we", "would you", "let's"], say: "You made a clear request, which gives the conversation a way forward." },
          { anyOf: ["i know", "i get", "i understand", "i see"], say: "You acknowledged your friend's view, which keeps the conversation respectful." },
        ],
      },
      reflection: [
        "Is there a conversation you have been putting off? What makes it feel hard?",
        "What would you like the other person to understand?",
        "What is one sentence you could use to begin that conversation?",
      ],
      takeaways: [
        "Know your aim and choose a calm, private moment.",
        "Describe the situation, your feelings, and your request.",
        "Show you understand before sharing a different view.",
        "Pausing a heated talk is fine. You can return to it.",
      ],
    },
    // 9
    {
      id: "confidence-09",
      number: 9,
      title: msg("Trust Your Decisions"),
      skill: msg("Use a simple decision framework, take ownership of your choice, and learn from the outcome."),
      minutes: 8,
      intro: [
        "Confidence includes trusting yourself to choose. Many people get stuck asking others what to do, going back and forth for days, or worrying they will pick wrong.",
        "In this lesson you will learn a simple framework for everyday decisions, how to take responsibility for your choices without blaming yourself harshly, and how to learn from decisions that do not work out.",
      ],
      learn: [
        {
          heading: "A simple decision framework",
          paragraphs: [
            "Most everyday decisions do not need a long analysis. A few clear steps can help you move from stuck to decided.",
          ],
          bullets: [
            "Name the decision in one sentence: \"Should I sign up for the evening class?\"",
            "List two or three realistic options, including doing nothing.",
            "For each option, note the main benefit and the main drawback.",
            "Check your values: which option fits what matters most to you right now?",
            "Choose, set a time to review, and take one first step.",
          ],
        },
        {
          heading: "Good decisions and good outcomes are different",
          paragraphs: [
            "A decision can be sensible and still turn out badly because of things you could not know or control. Judge your choice by how you made it, with the information you had, not only by how it ended.",
            "Many small decisions are also easy to change. Asking \"Can I undo or adjust this later?\" can take a lot of pressure off. If the answer is yes, it is often better to decide and learn than to wait for certainty.",
          ],
        },
        {
          heading: "Owning your choices and learning from mistakes",
          paragraphs: [
            "Personal responsibility means saying \"I chose this\" rather than blaming others or luck. It is not the same as punishing yourself. When something goes wrong, ask: What did I know then? What would I do differently? What did I learn about myself?",
            "Asking others for input is wise for big decisions. Just remember that the final choice is yours, and you are the one who knows your life best.",
          ],
        },
      ],
      example: {
        title: "Nadia's apartment choice",
        story: [
          "Nadia, 33, had been comparing two apartments for weeks and kept asking friends which to choose. Everyone had a different opinion, and she felt more confused.",
          "She wrote down each option with its main benefit and drawback, then asked what mattered most to her this year: a shorter commute so she had energy for her evening classes. That made the choice clear. A few months later the kitchen turned out to be smaller than she liked, but she still felt she had chosen well for the reason that mattered.",
        ],
        point: "Linking a decision to your values makes it easier to choose and easier to stand behind, even when not everything turns out perfectly.",
      },
      exercise: {
        title: "Make a small decision with a framework",
        steps: [
          "Pick a small decision you have been putting off, such as a weekend plan, a purchase, or a class.",
          "Write two or three options, each with one benefit and one drawback.",
          "Write the value that matters most to you in this decision.",
          "Choose an option and write one first step and a date to review how it went.",
        ],
        fields: [
          { id: "decision-question", label: "The decision in one sentence", kind: "short", placeholder: "Should I join the weekend walking group?" },
          { id: "decision-options", label: "Your options, each with a benefit and a drawback", kind: "long" },
          { id: "decision-value", label: "What matters most to you here", kind: "short" },
          { id: "decision-choice", label: "Your choice, first step, and review date", kind: "long" },
        ],
        minutes: 7,
      },
      practice: {
        kind: "question",
        prompt: "You chose to take a short weekend trip instead of staying home to rest. It rained the whole time and you came back tired. What could you say to yourself about the decision?",
        examples: [
          { text: "\"I chose the trip because I wanted a change of scene. The weather was bad luck. Next time I might check the forecast and keep a backup plan.\"", why: "It owns the choice, separates luck from judgment, and draws a useful lesson." },
          { text: "\"It didn't turn out how I hoped, but I did enjoy the quiet café. I've learned I need a rest day after traveling.\"", why: "It notices what went well and learns something about personal needs." },
        ],
        lookFors: [
          "Does your answer separate the decision from things you could not control?",
          "Does it include something you learned?",
          "Is it kind to yourself rather than blaming?",
        ],
        cues: [
          { anyOf: ["i chose", "i decided", "my choice"], say: "You owned the decision, which builds trust in yourself." },
          { anyOf: ["learned", "next time", "i might", "i will"], say: "You found a lesson for next time, which turns a setback into experience." },
          { anyOf: ["luck", "weather", "couldn't control", "could not control"], say: "You recognized what was outside your control, which is a fair way to judge a choice." },
        ],
      },
      reflection: [
        "What kinds of decisions do you find hardest to make, and why?",
        "When did you make a choice you are glad you trusted yourself on?",
        "What values do you want to guide your decisions this year?",
      ],
      takeaways: [
        "Name the decision, list options, check your values, then choose.",
        "Judge a decision by how you made it, not only by its outcome.",
        "Many choices can be adjusted later, which lowers the pressure.",
        "Owning a choice means learning from it, not punishing yourself.",
      ],
    },
    // 10
    {
      id: "confidence-10",
      number: 10,
      title: msg("Your Confidence Challenge"),
      skill: msg("Turn one real-life confidence goal into a practical plan with small steps and support."),
      minutes: 10,
      intro: [
        "You have explored strengths, fairer self-talk, speaking up, facing fear of judgment, public speaking, body language, boundaries, difficult conversations, and decision-making. Now it is time to bring them together.",
        "In this final lesson you will choose one real confidence challenge from your own life and build a practical action plan for it, using the skills that feel most useful to you.",
      ],
      learn: [
        {
          heading: "Choose a challenge that matters",
          paragraphs: [
            "A good challenge is real, meaningful to you, and a little outside your comfort zone, without being overwhelming. It might be speaking up in meetings, asking for a raise, joining a new group, having a conversation you have avoided, or giving a talk.",
            "Write your challenge as something you will do, not something you will feel. \"Share one idea in each weekly meeting for a month\" is easier to act on than \"Feel more confident at work.\"",
          ],
        },
        {
          heading: "Build your plan from the course",
          paragraphs: [
            "Look back at the lessons and pick the tools that fit your challenge. You do not need all of them.",
          ],
          bullets: [
            "Strengths: which of your strengths will help you here?",
            "Self-talk: what unfair thought might show up, and what is your balanced reply?",
            "Small steps: what is the first, smallest step, and what comes after it?",
            "Words and body: what sentence will you use, and how will you stand or sit?",
            "Boundaries and decisions: what might you say no to, to make room for this?",
          ],
        },
        {
          heading: "Support, setbacks, and noticing progress",
          paragraphs: [
            "Tell one trusted person about your plan, or ask someone to practice with you. Support makes it easier to keep going on days when motivation dips.",
            "Expect some steps to feel awkward or not go as planned. That is part of the process, not a sign you should stop. After each step, write down what you did and what you noticed. Over a few weeks, these notes become your own evidence of growth.",
          ],
        },
      ],
      example: {
        title: "Olu's community meeting",
        story: [
          "Olu, 57, wanted to speak at his neighborhood association about a dangerous crossing near the school, but he had never spoken in public. He made a plan: first share the idea with a neighbor, then write three key points, practice in front of the mirror, and finally speak for one minute at the meeting.",
          "When the unfair thought \"Who will listen to me?\" came up, he answered it with \"I have lived here twenty years and I see this crossing every day.\" He spoke for just over a minute. Two neighbors came up afterward to offer help with a petition.",
        ],
        point: "Breaking a big goal into small, prepared steps, and answering doubt with real evidence, makes a challenge feel possible.",
      },
      exercise: {
        title: "Create your confidence action plan",
        steps: [
          "Choose one real-life confidence challenge and write it as a specific action.",
          "Name two strengths that will help you, and one doubt you expect along with your balanced reply.",
          "Write three to five small steps from easiest to hardest.",
          "Choose one person who could support you and a date for your first step.",
          "Decide how you will mark your progress, such as a note after each step.",
        ],
        fields: [
          { id: "challenge-goal", label: "Your confidence challenge, as a specific action", kind: "short", placeholder: "Ask my manager about the training course by the end of the month." },
          { id: "challenge-strengths", label: "Strengths that will help, and a doubt with your balanced reply", kind: "long" },
          { id: "challenge-steps", label: "Your small steps, easiest to hardest", kind: "long" },
          { id: "challenge-support", label: "Your support person and first-step date", kind: "short" },
        ],
        minutes: 10,
      },
      practice: {
        kind: "question",
        prompt: "Imagine you have finished your confidence challenge. A friend asks, \"What helped you do it?\" Looking at your plan, what would you hope to tell them?",
        examples: [
          { text: "\"I broke it into small steps and started with the easiest one. Each step made the next feel less scary.\"", why: "It shows that a gradual approach builds confidence over time." },
          { text: "\"I reminded myself of things I'd already done well, and I had my sister to practice with.\"", why: "It names both inner evidence and outside support." },
        ],
        lookFors: [
          "Does your answer mention a specific skill or step from your plan?",
          "Does it include support from someone or something?",
          "Does it give you credit for the effort you will make?",
        ],
        cues: [
          { anyOf: ["step", "small", "first", "practice"], say: "You focused on small, practiced steps, which is how lasting confidence grows." },
          { anyOf: ["friend", "support", "sister", "brother", "partner", "helped me"], say: "You included support, which makes it easier to keep going." },
          { anyOf: ["strength", "already", "i did", "i can"], say: "You leaned on your own evidence, which gives your confidence a solid base." },
        ],
      },
      reflection: [
        "What has changed in the way you see yourself?",
        "Which skill from this course do you want to keep practicing?",
        "How will you celebrate the first step of your challenge?",
      ],
      takeaways: [
        "Choose a real challenge and write it as an action.",
        "Use the tools that fit you: strengths, fair self-talk, small steps, clear words.",
        "Support and setbacks are both part of the process.",
        "Notes on each step become your own evidence of growth.",
      ],
    },
  ],
};
