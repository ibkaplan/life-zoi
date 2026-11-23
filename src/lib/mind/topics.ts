/**
 * Conversation topics for LifeZoi Mind's written (rule-based) companion.
 *
 * Each topic moves through four short stages, one per reply:
 * 1. Acknowledge what happened and ask what bothered the person most.
 * 2. Respond to that part, and ask a question that helps them understand it.
 * 3. Offer another perspective, gently, without taking sides against anyone.
 * 4. Suggest a few practical next steps and an exercise, and say why it may help.
 *
 * Text can contain {person}, which the conversation fills with the person the visitor
 * mentioned (for example "your mom"), or with the topic's `personFallback`.
 */

export type TopicId =
  | "work-criticism"
  | "grief"
  | "loved-one-illness"
  | "health-worry"
  | "money"
  | "job-loss"
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

export type Facet = {
  id: string;
  label: string;
  match: RegExp;
  reply: string;
  question: string;
  /** Replaces the topic's perspective when this part is what the person chose. */
  perspective?: string;
};

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
  /** Used for {person} when the visitor has not named anyone. */
  personFallback?: string;
  /** How the conversation names this topic when it comes up on the side ("money"). */
  sideLabel?: string;
  /** When the first message already answers the opening question, go straight to that part. */
  skipToFacet?: boolean;
};

const PEOPLE =
  "mom|mum|mother|mama|dad|father|papa|parents?|husband|wife|partner|spouse|boyfriend|girlfriend|son|daughter|child|kids|children|baby|sister|brother|grandmother|grandma|granny|grandfather|grandpa|grandson|granddaughter|aunt|uncle|cousin|friend|best friend|neighbou?r|mother-in-law|father-in-law";

const ILLNESS =
  "sick|ill|unwell|illness|cancer|tumou?r|hospital\\w*|diagnos\\w*|dementia|alzheimer'?s?|stroke|heart attack|surgery|operation|dying|terminal|chemo\\w*|radiation|treatment|disease|not well|in (the )?icu|hospice|getting worse";

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
    match: [
      /\b(died|passed away|passed on|funeral|grief|grieving|bereave\w*|death of|miss (him|her|them) so)\b/i,
      new RegExp(`\\b(lost|loss of) (my|our) (${PEOPLE}|dog|cat|pet)\\b`, "i"),
    ],
    sideLabel: "the loss you mentioned",
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
    id: "loved-one-illness",
    skipToFacet: true,
    match: [
      new RegExp(`\\b(my|our) (${PEOPLE})\\b.{0,60}\\b(${ILLNESS})\\b`, "i"),
      new RegExp(`\\b(${ILLNESS})\\b.{0,40}\\b(my|our) (${PEOPLE})\\b`, "i"),
      /\b(caring for|looking after|taking care of) (my|our) \w+|\b(caregiver|carer|caregiving)\b/i,
    ],
    personFallback: "the person you love",
    sideLabel: "{person} being unwell",
    open: "I'm so sorry that {person} is unwell. When someone we love is ill, it can bring worry, helplessness, and a lot of practical pressure all at once. What is weighing on you most right now: worry about how {person} is doing, not knowing how to help, or how much this is taking out of you?",
    facets: [
      {
        id: "worry",
        label: "Worry about how they're doing",
        match: /\b(worr\w*|scared|afraid|fear\w*|what if|die|dying|worse|prognosis|results|survive|lose (him|her|them))/i,
        reply: "Fear for someone you love can be one of the heaviest feelings there is, especially when so much is uncertain.",
        question: "What is the thought about {person} that frightens you most? Is it something you know, or something you fear might happen?",
      },
      {
        id: "help",
        label: "Not knowing how to help",
        match: /\b(help|what (can|should) i do|don'?t know (how|what)|helpless|useless|can'?t do anything|support (him|her|them)|fix)/i,
        reply: "Feeling helpless when someone you love is ill is very common. Often what helps most isn't fixing things, but being there.",
        question: "What does {person} seem to need most from you right now: practical help, company, or someone to listen?",
        perspective: "You don't have to find the perfect words or solve the illness to help. Many people who are unwell say what matters most is company, being treated as themselves rather than as a patient, and someone who listens without rushing to reassure. Practical help, like a meal, a lift to an appointment, or sorting paperwork, can mean a lot too. It's also fine to ask {person} directly: what would help you most this week? What feels most possible for you to offer?",
      },
      {
        id: "drained",
        label: "It's taking a lot out of me",
        match: /\b(tired|exhausted|drained|no time|alone in this|my own|burn\w*|too much|can'?t cope|caring|sleep|my life)/i,
        reply: "Caring for someone who is ill takes a lot of energy, and it's easy to put your own needs last for a long time.",
        question: "Who else could share some of this with you, even in a small way?",
        perspective: "Looking after yourself while someone you love is ill can feel selfish, but it's what lets you keep going. Caregivers who get even small breaks, a walk, a night of proper sleep, a friend to talk to, usually cope better and have more to give. Accepting help is part of caring well, not a failure. What is one thing you could hand to someone else this week?",
      },
    ],
    otherFacet: {
      reply: "There's a lot to hold here.",
      question: "What part of this feels hardest when you're on your own with it?",
    },
    perspective: "When someone we love is ill, it can help to separate what is in your hands from what isn't. The illness and how it goes aren't in your control. How you show up for {person}, and how you look after yourself so you can keep going, partly are. Being present and keeping small, familiar routines often matter more than finding the right thing to say. You don't have to carry this alone either. What kind of support would make the biggest difference for you right now?",
    nextSteps: "A few things that may help, only if they fit. First, ask {person} what would help most today, rather than guessing. Second, write down your questions for the care team before appointments, so they feel less overwhelming. Third, keep one small thing each day that is just for you, like a short walk, a call with a friend, or a few quiet minutes. Many hospitals and charities also run free support groups for family and caregivers.",
    exercises: ["paced-breathing", "self-compassion", "stress-plan"],
    why: "Slow breathing helps when fear spikes. Self-compassion eases the guilt caregivers often feel. A stress plan helps you share the load and protect a little time for yourself.",
    articles: ["anxiety-and-stress", "childhood-and-family"],
  },
  {
    id: "health-worry",
    skipToFacet: true,
    match: [/\b(my (health|test results?|symptoms?|diagnosis|scan|biopsy|lump|blood work)|health anxiety|worried about my health|waiting for (my |the )?(test )?results|i'?m (so )?(sick|ill) (and|but)|i think i'?m (sick|ill))\b/i],
    sideLabel: "your health",
    open: "Worrying about your own health can be very unsettling, especially while you're waiting for answers. I can't assess symptoms, but I can help with the worry. What is the hardest part right now: waiting for results or an appointment, symptoms you've noticed, or thoughts about what it might mean?",
    facets: [
      { id: "waiting", label: "Waiting for answers", match: /\b(wait\w*|results|appointment|scan|test|call back|hear back)/i, reply: "Waiting is one of the hardest parts, because there is nothing to do with the worry except carry it.", question: "How long until you expect to know more, and how are you getting through the days until then?" },
      { id: "symptoms", label: "Symptoms I've noticed", match: /\b(symptom\w*|pain|lump|feel (sick|ill)|hurts|bleeding|dizzy|tired)/i, reply: "Symptoms deserve proper attention from a doctor, and it's good that you're taking them seriously.", question: "Have you been able to talk with a doctor about them yet? If they get worse or feel urgent, please contact one right away, or call 911 in an emergency." },
      { id: "meaning", label: "What it might mean", match: /\b(mean|worst|cancer|serious|die|dying|what if|google|online|read)/i, reply: "When health is uncertain, the mind often jumps straight to the worst possibility and treats it as if it were already true.", question: "What do you know for sure right now, and what is still a question?" },
    ],
    otherFacet: { reply: "That sounds like a lot to carry.", question: "When does the worry feel strongest during the day?" },
    perspective: "Health worries tend to grow when they have nowhere to go. It can help to give them a place: write down what you know, what you don't know yet, and what you'll ask the doctor. Searching symptoms online usually raises worry rather than settling it, because it shows the rarest and most frightening possibilities. Who could you tell about what you're going through, so you're not carrying it alone?",
    nextSteps: "Some things that may help. Write your questions down before your appointment. Choose a short daily worry time instead of letting the thoughts run all day. Use a calming exercise when the thoughts loop. And if anything gets worse or feels urgent, contact a doctor straight away, or call 911 in an emergency.",
    exercises: ["worry-time", "paced-breathing", "grounding-54321"],
    why: "Worry time contains health worries so they don't take over the day. Slow breathing settles the body. Grounding brings you back to the present when the mind races ahead.",
    articles: ["anxiety-and-stress", "mindfulness"],
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
    sideLabel: "feeling lonely",
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
    sideLabel: "your sleep",
    match: [/\b(can'?t sleep|cannot sleep|insomnia|awake all night|wake up at night|waking up at night|trouble sleeping|not sleeping|sleepless|lying awake|wak(e|ing) up at \d+ ?(am)?|(up|awake) at \d+ ?am|poor sleep|sleep (badly|poorly))\b/i],
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
    match: [/\b(my (partner|husband|wife|boyfriend|girlfriend|spouse|fiance|fiancee)|we (had a fight|argued|keep arguing|broke up)|break ?up|divorce|cheat(ed|ing)?|(problems?|trouble|issues?|difficult(y|ies)) (in|with) (a |my |our )?relationship|my relationship|relationship (problems?|issues?|trouble))\b/i],
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
    skipToFacet: true,
    match: [/\b(my (mother|mom|mum|father|dad|parents|son|daughter|kids|children|sister|brother|in-laws|mother-in-law|grandchild\w*)|family)\b/i],
    open: "Family relationships can bring some of our strongest feelings, both warm and painful. What's been happening, and what part of it is weighing on you most?",
    facets: [
      { id: "conflict", label: "We argued", match: /\b(argu\w*|fight|fought|conflict|yell\w*|shout\w*)/i, reply: "Arguments with family can be especially hard because the history between you is long and the stakes feel high.", question: "What do you wish they understood about your side?" },
      { id: "worry", label: "I'm worried about them", match: /\b(worr\w*|scared|afraid|sick|ill|struggl\w*|concern\w*)/i, reply: "Worrying about someone you love can be exhausting, especially when you can't fix things for them.", question: "What part of this is in your hands, and what part isn't?", perspective: "Caring about someone and being able to fix things for them are two different things, and the gap between them is painful. What is usually in your hands is how you show up: listening, staying in touch, and offering specific help rather than general advice. What isn't in your hands is their choices and what happens to them. Looking after yourself is part of being able to keep showing up. What would you like {person} to know about how you feel?" },
      { id: "distance", label: "We've grown apart", match: /\b(distance|apart|(don|doesn|won|didn)'?t (talk|speak|call)|not (talking|speaking)|estranged|ignor\w*|call me|visit)/i, reply: "Distance in a family can leave a lot of unspoken hurt on both sides.", question: "What would a small step closer look like for you, if you want one?" },
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
    id: "job-loss",
    match: [/\b(lost my job|lose my job|laid off|got fired|been fired|fired me|let me go|made redundant|redundancy|unemployed|out of work|job loss|looking for (a )?(new )?job)\b/i],
    sideLabel: "your job",
    skipToFacet: true,
    open: "I'm sorry. Losing a job, or fearing you might, can shake a lot at once: money, routine, and how you see yourself. What is hitting you hardest right now: the money side, the shock or unfairness of it, or worry about what comes next?",
    facets: [
      { id: "money", label: "The money side", match: /\b(money|bills?|rent|mortgage|pay|afford|savings|income|debt)/i, reply: "Worrying about how to pay for things is one of the hardest parts of losing work, and it's very understandable.", question: "Do you know roughly how long you can manage, and have you been able to check what support or benefits you might be able to get?" },
      { id: "shock", label: "The shock or unfairness", match: /\b(shock\w*|unfair|not fair|why me|out of nowhere|sudden|angry|hurt|betray\w*|years)/i, reply: "Being let go can feel like a rejection, even when it's about the company and not about you.", question: "What is the thought about it that keeps coming back to you most?" },
      { id: "next", label: "What comes next", match: /\b(next|future|find (a|another)|new job|age|too old|apply|interview|start again)/i, reply: "Not knowing what comes next can be frightening, especially if you've been in the same place for a long time.", question: "What kind of work, or what kind of day, would you like to be moving towards?" },
    ],
    otherFacet: { reply: "That's a lot to take in.", question: "How are you looking after yourself in the days since it happened?" },
    perspective: "Losing a job often hurts in two ways: the practical problem, and a hit to how we see ourselves. They're worth separating. Your job was something you did, not who you are, and many people find their next step only after a period that felt very uncertain. Keeping some structure in your days, like a regular wake-up time, a walk, and a set time for job tasks, can help a lot. What is one small thing you could do this week that would make you feel a little more steady?",
    nextSteps: "A few ideas, only if they fit. Make a simple list of what you need to sort out first, like income, benefits, and health insurance, and take one item at a time. Tell one or two people you trust, because isolation makes this harder. Keep a daily routine with time for rest, not only for searching. Free career and benefits advice is often available through local job centers or libraries.",
    exercises: ["stress-plan", "self-compassion", "paced-breathing"],
    why: "A stress plan breaks a big, vague problem into steps. Self-compassion helps with the blow to confidence. Slow breathing helps when worry about the future spikes.",
    articles: ["anxiety-and-stress", "self-esteem-and-confidence"],
  },
  {
    id: "work-stress",
    sideLabel: "work",
    // "I can't work" is about how someone is coping, not about their job.
    match: [/(?<!(can'?t|cannot|unable to|couldn'?t|not able to) )\b(work|job|deadline\w*|workload|overtime|burn(ed|t)? ?out|burnout|career|my shift|project|clients?)\b/i],
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
    id: "money",
    skipToFacet: true,
    match: [/\b(money|debts?|bills?|rent|mortgage|can'?t afford|afford|broke|loans?|credit cards?|financ\w*|pay (the|my) bills|savings|paycheck|salary)\b/i],
    sideLabel: "money",
    open: "Money worries can follow you everywhere, into your sleep, your relationships, and how you feel about yourself. What is weighing on you most: a specific bill or debt, not knowing how you'll manage from month to month, or the strain it's putting on you and the people around you?",
    facets: [
      { id: "specific", label: "A bill or debt", match: /\b(bill|debt|loan|rent|mortgage|credit|owe|behind|late|collector)/i, reply: "A specific debt or bill can feel like a weight hanging over every day.", question: "Is there a date or deadline connected to it, and do you know what your options are yet?" },
      { id: "monthly", label: "Managing month to month", match: /\b(month|manage|enough|paycheck|income|job|lost my job|hours|pension|prices|expensive)/i, reply: "Not knowing whether there will be enough can keep the mind on constant alert.", question: "Have you been able to look at the numbers on paper, or does that feel too stressful right now?" },
      { id: "strain", label: "The strain it's causing", match: /\b(stress\w*|sleep|partner|husband|wife|family|ashamed|shame|embarrass\w*|fight|argu\w*|hide|hiding)/i, reply: "Money stress often spills into sleep and relationships, and many people feel ashamed of it, even though it's far more common than it seems.", question: "Does anyone know what you're going through with this?" },
    ],
    otherFacet: { reply: "That sounds stressful.", question: "What part of the money worry comes back to you most often?" },
    perspective: "Money problems often feel bigger when they stay vague and hidden. Getting them onto paper, even roughly, usually makes them easier to face, because a known problem can be planned for, while a fog can't. Financial trouble also says nothing about your worth as a person. What would be one small, practical step you could take this week?",
    nextSteps: "A few ideas, if they're useful. Write down what comes in, what goes out, and what's owed, without judging it. If you're behind on a payment, contacting the lender early often opens hardship options. Free, non-profit credit or debt counseling can help you see your choices. And give your mind a break: a set worry time can stop money thoughts from taking over the whole day.",
    exercises: ["worry-time", "stress-plan", "paced-breathing"],
    why: "Worry time keeps money thoughts to one part of the day. A stress plan turns a vague worry into small steps. Slow breathing helps when the stress feels physical.",
    articles: ["anxiety-and-stress", "cognitive-behavioral-therapy"],
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

/** The person someone mentioned, as "your mom", for {person} in replies. */
export function mentionedPerson(text: string): string | null {
  const match = new RegExp(`\\b(my|our) (${PEOPLE})\\b`, "i").exec(text);
  return match ? `your ${match[2].toLowerCase()}` : null;
}

/** `person` is already in the reply's language; `tr` translates the fallback. */
export function fillPerson(text: string, person: string | null, topic: Topic, tr: (english: string) => string = (english) => english): string {
  return text.replace(/\{person\}/g, person ?? tr(topic.personFallback ?? "them"));
}

export function detectTopic(text: string): Topic | null {
  for (const topic of TOPICS) if (topic.match.some((pattern) => pattern.test(text))) return topic;
  return null;
}
