/**
 * Conversation topics for LifeZoi Mind's written (rule-based) companion.
 *
 * Each topic moves through four short stages, one per reply:
 * 1. Acknowledge what happened and ask what bothered the person most.
 * 2. Respond to that part, and ask a question that helps them understand it.
 * 3. Offer another perspective, gently, without taking sides against anyone.
 * 4. Suggest a few practical next steps and an exercise, and say why it may help.
 */

export type TopicId =
  | "work-criticism"
  | "grief"
  | "boundaries"
  | "loneliness"
  | "sleep"
  | "relationship"
  | "family"
  | "self-esteem"
  | "anger"
  | "work-stress"
  | "anxiety"
  | "low-mood"
  | "good-day";

export type Facet = { id: string; label: string; match: RegExp; reply: string; question: string };

export type Topic = {
  id: TopicId;
  match: readonly RegExp[];
  open: string;
  facets: readonly Facet[];
  otherFacet: { reply: string; question: string };
  perspective: string;
  nextSteps: string;
  exercises: readonly string[];
  why: string;
  articles: readonly string[];
};

export const TOPICS: readonly Topic[] = [
  {
    id: "work-criticism",
    match: [
      /\b(boss|manager|supervisor|team lead|coworker|co-worker|colleague)\b.*\b(critici[sz]\w*|yell\w*|shout\w*|humiliat\w*|embarrass\w*|blam\w*|told me off|snapped|scolded|insult\w*|put me down)\b/i,
      /\b(critici[sz]ed|humiliated|yelled at|shouted at|told off) (me )?(at work|in (the )?meeting|in front of)/i,
      /\bin front of (everyone|everybody|the (whole )?team|my colleagues|my coworkers|other people)\b/i,
    ],
    open: "I'm sorry that happened. Being criticized in front of other people can feel upsetting, and it is very common to keep replaying it afterwards. Let's look at what happened together. What bothered you most: the way your manager spoke to you, the fact that other people were present, or the feeling that you were treated unfairly?",
    facets: [
      {
        id: "tone",
        label: "The way they spoke to me",
        match: /\b(way|tone|spoke|talked|voice|rude|harsh|shout|yell|disrespect|how (he|she|they) (said|spoke))/i,
        reply: "Being spoken to harshly can sting more than the content of the feedback itself, and it can leave you feeling small or disrespected.",
        question: "If you set the tone aside for a moment, was there a point in what they said that you want to think about, or did the feedback itself feel wrong too?",
      },
      {
        id: "audience",
        label: "Other people were there",
        match: /\b(people|everyone|everybody|colleagues|coworkers|team|public|front of|watching|present|embarrass|humiliat)/i,
        reply: "Feeling exposed in front of colleagues often hurts more than the words themselves. It can bring up embarrassment, and a worry about what everyone now thinks of you.",
        question: "When you picture your colleagues in that moment, what do you imagine they were thinking?",
      },
      {
        id: "unfair",
        label: "It felt unfair",
        match: /\b(unfair|not fair|wrong|didn'?t deserve|not my fault|injustice|blamed|lied|untrue|wasn'?t me)/i,
        reply: "Feeling treated unfairly can stir up anger as well as hurt, and both make sense.",
        question: "Was any part of the feedback something you think was fair, even if the way it was delivered wasn't? Or did it feel wrong from start to finish?",
      },
    ],
    otherFacet: {
      reply: "That sounds like it hit you in more than one way.",
      question: "What is the thought about it that keeps coming back to you most?",
    },
    perspective: "It can help to separate three things: what actually happened, the story your mind tells about it, and what you want to happen next. People who watch a moment like that often remember it much less than we expect, and many may have felt uncomfortable for you rather than judging you. You don't have to agree with your manager to look for what, if anything, is useful in the feedback. What would you like to happen next with your manager, if anything?",
    nextSteps: "Here are a few constructive options, and you can choose any or none. First, settle your body before deciding anything: replaying the scene keeps the stress response going, and a few minutes of slow breathing can lower the intensity. Second, write down the facts of what happened separately from your interpretation of it. Third, if you want to address it, plan a calm, private conversation, for example: it would help me to get feedback one-to-one, so I can act on it.",
    exercises: ["paced-breathing", "thought-reframing", "i-statements"],
    why: "Slow breathing can calm the body so you can think more clearly. The reframing exercise helps separate facts from the story your mind tells. The I-statement plan prepares a calm, non-blaming conversation.",
    articles: ["self-esteem-and-confidence", "relationships-and-communication"],
  },
  {
    id: "grief",
    match: [/\b(died|passed away|passed on|lost my|loss of my|funeral|grief|grieving|bereave\w*|death of|miss (him|her|them) so)\b/i],
    open: "I'm so sorry for your loss. Grief can be overwhelming, and there is no right way or right timetable to feel it. I'm here to listen. What has been the hardest part for you lately: the missing, the practical changes, or feelings like guilt or anger that can come with grief?",
    facets: [
      {
        id: "missing",
        label: "Missing them",
        match: /\b(miss|missing|empty|gone|not here|their voice|alone)/i,
        reply: "Missing someone you love can feel physical, like an ache that comes in waves. That is a reflection of how much they mattered.",
        question: "Would you like to tell me a little about them, or about a memory that has been on your mind?",
      },
      {
        id: "practical",
        label: "The changes in daily life",
        match: /\b(practical|changes|routine|house|money|alone now|everything is different|paperwork|daily)/i,
        reply: "Loss often changes daily life in many small ways at once, on top of the sadness. That can be exhausting.",
        question: "Which part of daily life feels heaviest right now?",
      },
      {
        id: "guilt",
        label: "Guilt or anger",
        match: /\b(guilt|guilty|regret|should have|angry|anger|blame|why)/i,
        reply: "Guilt and anger are very common in grief, even when there was nothing more we could have done. They don't mean you loved them any less.",
        question: "What is the thought that brings the guilt or anger up most often?",
      },
    ],
    otherFacet: { reply: "Thank you for sharing that with me.", question: "What do you most want someone to understand about how this feels for you?" },
    perspective: "Grief tends to come in waves rather than fading in a straight line, and good days can be followed by hard ones. That is usually part of grieving, not a sign of going backwards. Many people find it helps to keep some connection to the person, through memories, rituals, or speaking about them. Who in your life has been able to share this loss with you, even a little?",
    nextSteps: "If it feels right, a few gentle ideas: allow some time each day for the feelings, without pushing them away; keep small routines like meals and a short walk; and let people know what kind of help you'd like. Writing a letter to the person you lost can also help some people. If, after many months, the grief is so intense that you cannot manage daily life, a grief counselor or doctor can help.",
    exercises: ["journaling", "self-compassion", "guided-relaxation"],
    why: "Writing can help put the loss into words. A self-compassion break offers some kindness on hard days. Relaxation can give the body a short rest from intense feeling.",
    articles: ["understanding-emotions", "loneliness"],
  },
  {
    id: "boundaries",
    match: [/\b(can'?t say no|cannot say no|people[- ]pleas\w*|taken advantage|walk all over me|always say yes|boundar(y|ies)|too much to ask|they expect me to)\b/i],
    open: "That sounds draining. When it's hard to say no, our own needs can quietly slip to the bottom of the list. What makes it hardest for you: worrying the other person will be upset, feeling guilty, or not being sure what you're allowed to ask for?",
    facets: [
      { id: "upset", label: "They'll be upset", match: /\b(upset|angry|mad|disappoint|react|reaction|lose them|conflict)/i, reply: "Worrying about someone's reaction is one of the most common reasons people keep saying yes.", question: "What do you imagine would actually happen if you said no, kindly, just once?" },
      { id: "guilt", label: "I feel guilty", match: /\b(guilt|guilty|selfish|bad person|mean)/i, reply: "Guilt often shows up when we change a habit, even a healthy one. It doesn't necessarily mean you're doing something wrong.", question: "Where do you think the idea comes from that your needs should come second?" },
      { id: "unsure", label: "I'm not sure what's okay", match: /\b(not sure|don'?t know|allowed|okay to|normal|fair to)/i, reply: "It can be hard to know what's reasonable, especially if you grew up putting others first.", question: "If a close friend were in your situation, what would you think is fair for them to ask for?" },
    ],
    otherFacet: { reply: "That makes sense.", question: "What is one situation where you would most like to set a limit?" },
    perspective: "Healthy boundaries are not about pushing people away. They make relationships more honest and sustainable, and they often protect the relationship from building resentment. Other people may need a little time to adjust, and that's okay. What is one small limit you'd feel ready to try?",
    nextSteps: "A good place to start is one small, low-risk situation. Decide what you need in one sentence, practice a kind and clear script, and expect some discomfort the first time. For example: I'd like to help, and I can't this weekend. Could we look at next week?",
    exercises: ["boundary-script", "i-statements", "self-compassion"],
    why: "Preparing words in advance makes it easier to stay calm. I-statements keep the focus on your needs without blame. Self-compassion helps with the guilt that can follow.",
    articles: ["relationships-and-communication", "self-esteem-and-confidence"],
  },
  {
    id: "loneliness",
    match: [/\b(lonely|loneliness|so alone|all alone|isolated|no friends|no one to talk to|nobody to talk to|nobody cares|no one cares)\b/i],
    open: "I'm really glad you said something. Loneliness can hurt a lot, and it's more common than many people realize. Can you tell me a bit more: is it that there are few people around you, or that you have people but don't feel truly close to them?",
    facets: [
      { id: "few", label: "Few people around me", match: /\b(few|no one|nobody|alone|moved|retired|widow|lost touch|no friends)/i, reply: "When there are few people around, days can feel long and quiet, and reaching out can start to feel harder the longer it goes on.", question: "Was there a time when you felt more connected? What was different then?" },
      { id: "not-close", label: "People, but not close", match: /\b(not close|don'?t understand|surface|superficial|crowd|people around|nobody gets|not really)/i, reply: "Feeling lonely while surrounded by people is real and painful. It's about feeling understood, not just about company.", question: "Is there one person you feel even a little more comfortable with than the others?" },
    ],
    otherFacet: { reply: "Thank you for explaining.", question: "When during the day or week does the loneliness feel strongest?" },
    perspective: "Loneliness can make us expect rejection, so reaching out feels riskier than it really is. Most people respond warmly to a small, friendly contact. Connection also doesn't have to be deep at first: a regular chat with a neighbor or a weekly group can grow into something more. What is one small kind of contact that wouldn't feel too hard?",
    nextSteps: "A few small steps you could consider: send a short message to one person you've lost touch with; try one regular activity with other people, such as a class, a walking group, a faith community, or volunteering; and plan one small enjoyable thing for yourself this week. LifeZoi Mind is glad to talk, but it can't replace people in your life, and you deserve real connection.",
    exercises: ["behavioral-activation", "self-compassion", "gratitude"],
    why: "Planning one small activity makes reconnecting more manageable. Self-compassion helps with the hurt of feeling alone. Noticing good moments can lift mood a little.",
    articles: ["loneliness", "psychology-of-aging"],
  },
  {
    id: "sleep",
    match: [/\b(can'?t sleep|cannot sleep|insomnia|awake all night|wake up at night|waking up at night|trouble sleeping|not sleeping|sleepless|lying awake)\b/i],
    open: "Poor sleep can make everything else feel harder, so I'm sorry you're dealing with it. What happens most: trouble falling asleep, waking in the night, or waking up feeling unrested?",
    facets: [
      { id: "falling", label: "Trouble falling asleep", match: /\b(fall(ing)? asleep|can'?t switch off|mind racing|thoughts|lying awake|hours to)/i, reply: "When the mind keeps racing at bedtime, sleep can feel very far away.", question: "What tends to be on your mind when you're trying to fall asleep?" },
      { id: "waking", label: "Waking in the night", match: /\b(wak(e|ing)|middle of the night|3 ?am|early|back to sleep)/i, reply: "Waking in the night and struggling to drift off again is frustrating, especially when you know you need the rest.", question: "When you wake up, what do you usually find yourself thinking about or doing?" },
      { id: "unrested", label: "Waking up unrested", match: /\b(unrested|tired|exhausted|groggy|not refreshed|still tired)/i, reply: "Waking up tired even after time in bed is worth paying attention to.", question: "Have you noticed snoring, pauses in breathing, or feeling very sleepy during the day?" },
    ],
    otherFacet: { reply: "That sounds tiring.", question: "How long has your sleep been like this?" },
    perspective: "Trying hard to sleep can keep us awake, because effort and worry wake the brain up. It often helps to shift the goal from forcing sleep to resting calmly. Regular wake times and a wind-down routine also help the body know when to rest. How does your evening usually go in the hour before bed?",
    nextSteps: "A few things commonly recommended: keep the same wake-up time each day; get some daylight in the morning; limit caffeine after midday; write down worries or tomorrow's tasks before bed; and use a calm wind-down routine. If sleep problems last for weeks, or you snore loudly or feel very sleepy during the day, please talk with a doctor, because there are effective treatments.",
    exercises: ["sleep-wind-down", "body-scan", "worry-time"],
    why: "A wind-down routine tells the body it's time to rest. A body scan gently moves attention away from racing thoughts. Worry time gives worries a place earlier in the day.",
    articles: ["sleep-and-mental-health"],
  },
  {
    id: "relationship",
    match: [/\b(my (partner|husband|wife|boyfriend|girlfriend|spouse|fiance|fiancee)|we (had a fight|argued|keep arguing|broke up)|break ?up|divorce|cheat(ed|ing)?)\b/i],
    open: "That sounds painful. Difficulties with someone close can affect everything else in the day. What feels most important right now: what was said, a pattern that keeps repeating, or how unsure you feel about the relationship?",
    facets: [
      { id: "said", label: "What was said", match: /\b(said|words|told me|called me|hurtful|insult)/i, reply: "Words from someone close can hurt deeply, precisely because they matter to us.", question: "What did you hear in what they said? Sometimes the meaning we take from words hurts as much as the words themselves." },
      { id: "pattern", label: "A pattern that repeats", match: /\b(pattern|again|always|every time|keeps|same (fight|argument)|repeat)/i, reply: "When the same argument keeps coming back, it often points to an important need that isn't being met for one or both of you.", question: "What do you think each of you needs, underneath the argument?" },
      { id: "unsure", label: "Unsure about us", match: /\b(unsure|not sure|future|leave|stay|doubt|over|end)/i, reply: "Feeling unsure about a relationship can be unsettling, and it's okay not to have the answer right now.", question: "What would you want to understand better before making any decisions?" },
    ],
    otherFacet: { reply: "I hear you.", question: "How are you feeling about it right now?" },
    perspective: "In most conflicts, both people are trying to protect something that matters to them, even when they handle it badly. That doesn't excuse hurtful behavior, but it can help to ask what the other person may have been feeling or needing. If the relationship involves fear, threats, or control, that's different, and it's important to talk with someone you trust or a domestic violence hotline. What do you imagine they might say if they were describing the same moment?",
    nextSteps: "A few options you could consider: wait until you're both calm before talking again; start with how you felt rather than what they did wrong; listen fully to their side before replying; and agree to take a break if things get heated. If the same conflicts keep repeating, couples counseling can help many people.",
    exercises: ["i-statements", "name-the-feeling", "paced-breathing"],
    why: "I-statements make it easier for the other person to listen. Naming your feeling first helps you know what you want to say. Slow breathing helps you stay steady in a hard conversation.",
    articles: ["relationships-and-communication", "emotional-intelligence"],
  },
  {
    id: "family",
    match: [/\b(my (mother|mom|mum|father|dad|parents|son|daughter|kids|children|sister|brother|in-laws|mother-in-law|grandchild\w*)|family)\b/i],
    open: "Family relationships can bring some of our strongest feelings, both warm and painful. What's been happening, and what part of it is weighing on you most?",
    facets: [
      { id: "conflict", label: "We argued", match: /\b(argu\w*|fight|fought|conflict|yell\w*|shout\w*)/i, reply: "Arguments with family can be especially hard because the history between you is long and the stakes feel high.", question: "What do you wish they understood about your side?" },
      { id: "worry", label: "I'm worried about them", match: /\b(worr\w*|scared|afraid|sick|ill|struggl\w*|concern\w*)/i, reply: "Worrying about someone you love can be exhausting, especially when you can't fix things for them.", question: "What part of this is in your hands, and what part isn't?" },
      { id: "distance", label: "We've grown apart", match: /\b(distance|apart|don'?t talk|estranged|ignore|call me|visit)/i, reply: "Distance in a family can leave a lot of unspoken hurt on both sides.", question: "What would a small step closer look like for you, if you want one?" },
    ],
    otherFacet: { reply: "Thank you for telling me.", question: "How are you feeling about it right now?" },
    perspective: "Family members often carry different memories of the same events, and each person's version can feel completely true to them. Understanding someone's view doesn't mean agreeing with it, or accepting being treated badly. It can help you decide how you want to respond. What would you want the relationship to look like a year from now?",
    nextSteps: "Some options to consider: choose one calm moment to share how you feel using an I-statement; decide in advance what limits you need; and look after yourself after difficult contact. If family problems feel overwhelming or involve harm, a family therapist or counselor can help.",
    exercises: ["i-statements", "boundary-script", "self-compassion"],
    why: "I-statements help you raise things without blame. A boundary script prepares you for limits. Self-compassion helps after difficult contact.",
    articles: ["childhood-and-family", "relationships-and-communication"],
  },
  {
    id: "self-esteem",
    match: [/\b(i'?m (so )?(useless|worthless|stupid|a failure|not good enough|an idiot|pathetic)|i hate myself|hate who i am|i'?m never good enough|nobody likes me|ashamed of myself)\b/i],
    open: "I'm sorry you're feeling this way about yourself. Those are painful thoughts to carry. Can I ask what happened that brought these feelings up today, or have they been around for a while?",
    facets: [
      { id: "today", label: "Something happened today", match: /\b(today|happened|mistake|failed|messed up|said|did)/i, reply: "When something goes wrong, the mind often jumps from I made a mistake to I am a failure. That jump feels true in the moment, but it is a big leap.", question: "What would you say to a close friend who made the same mistake?" },
      { id: "long", label: "They've been around a while", match: /\b(always|long time|years|while|whole life|since|child)/i, reply: "Thoughts like these that stay for a long time can start to feel like facts about who you are, even though they are thoughts.", question: "Where do you think you first learned to see yourself this way?" },
    ],
    otherFacet: { reply: "Thank you for sharing that.", question: "What is the harshest thing your mind tells you about yourself right now?" },
    perspective: "Being hard on ourselves can feel like it keeps us motivated, but research suggests it usually adds to distress. A more balanced view isn't pretending everything is fine. It's noticing the whole picture, including what you've done well and what you've coped with. Can you name one thing you've handled, even in a small way, this week?",
    nextSteps: "Some things that may help: notice when the harsh voice shows up and name it, for example, there's the critic again; try writing a more balanced version of one harsh thought; and do one small thing that gives you a sense of achievement. If these feelings are strong or last for weeks, talking with a counselor can make a real difference.",
    exercises: ["self-compassion", "thought-reframing", "gratitude"],
    why: "Self-compassion offers a kinder voice. Reframing helps test harsh thoughts against the facts. Noticing good things balances the mind's focus on problems.",
    articles: ["self-esteem-and-confidence", "cognitive-behavioral-therapy"],
  },
  {
    id: "anger",
    match: [/\b(angry|furious|so mad|rage|livid|pissed off|lost my temper|irritated|annoyed)\b/i],
    open: "It sounds like you're really angry, and anger usually means something important to you was affected. What happened, and what part of it made you angriest?",
    facets: [
      { id: "disrespect", label: "I felt disrespected", match: /\b(disrespect|ignored|rude|insult|dismiss|belittl|not listen)/i, reply: "Feeling disrespected is one of the strongest triggers for anger, because it touches our sense of dignity.", question: "What would respect have looked like in that moment?" },
      { id: "unfair", label: "It was unfair", match: /\b(unfair|not fair|cheat|lied|blam|wrong)/i, reply: "Unfairness naturally brings up anger. It's a signal that a line was crossed.", question: "What outcome would feel fair to you now?" },
      { id: "myself", label: "I'm angry at myself", match: /\b(myself|my fault|i should|i did)/i, reply: "Anger at ourselves can be just as intense, and often harder to put down.", question: "What do you wish you had done differently?" },
    ],
    otherFacet: { reply: "That makes sense.", question: "Where do you feel the anger in your body right now?" },
    perspective: "Anger gives energy, and the question is where to put it. Acting on it in the heat of the moment often makes things worse, while understanding it can help you stand up for what matters calmly. It may also help to consider what the other person might have been dealing with. That doesn't excuse them; it just gives you more options. What would you like to be true after this has calmed down?",
    nextSteps: "A few options: give your body time to cool down first, with a walk or slow breathing; write out what you'd like to say, then wait before sending anything; and if you decide to speak up, focus on the specific behavior and what you need. If anger often feels out of control, or leads to saying or doing things you regret, a counselor can help with practical skills.",
    exercises: ["paced-breathing", "name-the-feeling", "i-statements"],
    why: "Slow breathing helps the body cool down. Naming the feeling under the anger, such as hurt or fear, clarifies what you need. I-statements help you speak up without escalating.",
    articles: ["emotional-intelligence", "understanding-emotions"],
  },
  {
    id: "work-stress",
    match: [/\b(work|job|deadline\w*|workload|overtime|burn(ed|t)? ?out|burnout|career|my shift|project|clients?)\b/i],
    open: "Work stress can really follow us home. I'd like to understand what's going on. What is weighing on you most: the amount of work, a person or relationship at work, or worry about how you're doing?",
    facets: [
      { id: "amount", label: "The amount of work", match: /\b(amount|too much|workload|deadline|hours|overtime|no time|behind)/i, reply: "When the work keeps piling up, it can feel like you're always behind, no matter how hard you try.", question: "Which part of the workload feels most urgent, and which part could wait or be shared?" },
      { id: "person", label: "A person at work", match: /\b(person|boss|manager|colleague|coworker|team|client|someone)/i, reply: "Difficult relationships at work can be draining, because you often can't avoid the person.", question: "What happens between you that's hardest to deal with?" },
      { id: "performance", label: "How I'm doing", match: /\b(doing|perform|good enough|fail|mistake|fired|review|job security|lose my job)/i, reply: "Worrying about your performance can keep your mind busy long after the workday ends.", question: "What evidence do you have about how you're actually doing, both good and bad?" },
    ],
    otherFacet: { reply: "That sounds like a lot to carry.", question: "How long has work felt like this?" },
    perspective: "When we're stressed, everything at work can feel equally urgent and equally out of our control. Usually some parts are in our hands, and others aren't. Separating them can make the load feel more manageable. It's also worth noticing whether rest has been squeezed out, because recovery time is part of doing good work, not a reward for finishing it. What is one thing at work you can influence this week?",
    nextSteps: "Some options: list what's on your plate and mark what you can influence; choose one next step for one item; protect a small daily break and a clear end to the workday where you can; and if it's possible, talk with your manager about priorities. If you feel exhausted, detached, or ineffective for a long time, that may be burnout, and talking with a doctor or counselor can help.",
    exercises: ["stress-plan", "paced-breathing", "boundary-script"],
    why: "A stress plan separates what you can influence from what you can't. Slow breathing lowers the intensity of stress in the moment. A boundary script helps protect time for rest.",
    articles: ["anxiety-and-stress", "motivation-and-personal-growth"],
  },
  {
    id: "anxiety",
    match: [/\b(anxious|anxiety|worried|worry|worrying|nervous|scared|afraid|fear|panic|on edge|can'?t stop thinking|overthinking|dread)\b/i],
    open: "That sounds uncomfortable, and I'm glad you're talking about it. Worry can take up a lot of room. What is the worry mostly about, or does it feel more like a general sense of unease?",
    facets: [
      { id: "specific", label: "Something specific", match: /\b(about|test|results|doctor|money|health|job|exam|interview|appointment|kids|future)/i, reply: "Worrying about something specific often means it matters to you, and that the outcome feels uncertain.", question: "What is the worst outcome your mind is imagining, and how likely does it seem when you step back?" },
      { id: "general", label: "A general unease", match: /\b(general|everything|no reason|don'?t know why|all the time|constantly|always)/i, reply: "A general sense of unease without a clear cause can feel confusing, and it can be tiring to carry around all day.", question: "When do you notice it most: mornings, evenings, around people, or when you're alone?" },
      { id: "body", label: "I feel it in my body", match: /\b(heart|chest|stomach|breath|shaking|tense|body|sweat)/i, reply: "Anxiety often shows up in the body first, with a racing heart, a tight chest, or an unsettled stomach.", question: "What usually helps your body settle, even a little?" },
    ],
    otherFacet: { reply: "Thank you for explaining.", question: "How often does this worry come up, and how long does it tend to stay?" },
    perspective: "Anxious thoughts often feel like warnings, but they tend to overestimate how likely bad things are and underestimate how well we'd cope. It can help to ask: is this worry about something I can act on now, or something I can't control? For the first, a small action helps. For the second, practices that calm the body and shift attention can help. Which kind of worry is this one?",
    nextSteps: "Here are some ideas you could try: calm your body first with slow breathing; if the worry is about something you can act on, choose one small step; if it's not, set aside a short worry time later in the day and gently postpone it until then. Reducing caffeine and keeping regular sleep can also help. If worry is hard to control most days, or panic attacks happen, a doctor or therapist can help; anxiety is very treatable.",
    exercises: ["paced-breathing", "grounding-54321", "worry-time"],
    why: "Slow breathing helps calm the body's alarm. Grounding brings attention back to the present. Worry time stops worry taking over the whole day.",
    articles: ["anxiety-and-stress", "how-the-brain-processes-emotions"],
  },
  {
    id: "low-mood",
    match: [/\b(sad|down|depressed|low|empty|numb|hopeless|miserable|crying|cry|unhappy|no energy|can'?t get out of bed|unmotivated|terrible day|awful day|bad day|rough day)\b/i],
    open: "I'm sorry you're feeling this way. Thank you for telling me. Can you tell me a bit more about what's been happening? Is it about a particular event, or has your mood been low for a while?",
    facets: [
      { id: "event", label: "Something happened", match: /\b(happened|today|because|after|event|news|told|lost)/i, reply: "It makes sense that something difficult would bring your mood down. Feelings like this are a natural response to hard things.", question: "What part of what happened is staying with you most?" },
      { id: "while", label: "It's been a while", match: /\b(while|weeks|months|long time|always|everyday|every day|for ages|since)/i, reply: "When low mood lasts a while, it can wear down your energy and make ordinary things feel much harder.", question: "Have you noticed changes in your sleep, appetite, energy, or interest in things you usually enjoy?" },
    ],
    otherFacet: { reply: "That sounds really hard.", question: "What does a typical day look like for you right now?" },
    perspective: "When we feel low, the mind tends to filter out the good and focus on what's wrong, and we naturally do less, which can lower mood further. Small actions can gently push back on that cycle, even before you feel like doing them. Is there something small that used to give you a little pleasure or sense of achievement?",
    nextSteps: "A few gentle ideas: plan one small, doable activity today, such as a short walk, a call with someone, or a favorite meal; get some daylight and movement; and stay in touch with people even briefly. If low mood lasts most days for two weeks or more, or makes daily life hard, please talk with a doctor or mental health professional. Depression is common and treatable.",
    exercises: ["behavioral-activation", "self-compassion", "gratitude"],
    why: "One small activity can gently lift mood. Self-compassion eases the harsh voice that often comes with low mood. Noticing good things helps balance attention.",
    articles: ["understanding-depression", "cognitive-behavioral-therapy"],
  },
  {
    id: "good-day",
    match: [/\b(good day|great day|happy|proud|excited|grateful|went well|good news|feel better|feeling better)\b/i],
    open: "That's lovely to hear. It's worth pausing on good moments, because we often rush past them. What happened that made it good?",
    facets: [],
    otherFacet: { reply: "That sounds really good.", question: "What part did you play in making that happen?" },
    perspective: "Taking a moment to savor good experiences, by noticing them, telling someone, or writing them down, can help them stay with you a little longer. Who could you share this with?",
    nextSteps: "If you'd like, the Three good things exercise is a nice way to capture days like this. You could also note what helped today, so you can return to it on harder days.",
    exercises: ["gratitude", "mindful-moment"],
    why: "Writing down good things helps your attention notice them. A mindful pause helps you savor the moment.",
    articles: ["understanding-emotions", "motivation-and-personal-growth"],
  },
];

export function topicById(id: TopicId): Topic {
  return TOPICS.find((topic) => topic.id === id) as Topic;
}

export function detectTopic(text: string): Topic | null {
  for (const topic of TOPICS) if (topic.match.some((pattern) => pattern.test(text))) return topic;
  return null;
}
