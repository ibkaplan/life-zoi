import { describe, expect, it } from "vitest";
import { initialConversation, respond, type ConversationState } from "@/lib/mind/conversation";

/**
 * Realistic conversations for LifeZoi Mind's rule-based companion. Each one checks that
 * Mind understands the situation, uses the person's own words, and stays on topic.
 */
type Case = {
  name: string;
  messages: string[];
  topic: string | null;
  /** Something every reply after the first should keep in mind, for example "your mom". */
  mentions?: RegExp;
  /** Must appear somewhere in the conversation. */
  expect?: RegExp[];
  /** Must never appear (wrong topic or generic filler). */
  never?: RegExp[];
};

const GENERIC = /Thank you for telling me\. I want to make sure I understand/;

const CASES: Case[] = [
  { name: "a sick mother", messages: ["My mom is sick", "She has cancer and I'm scared", "I don't know how to help her", "Maybe just be with her"], topic: "loved-one-illness", mentions: /your mom/, never: [/memories of the same events/, /relationship to look like/, GENERIC] },
  { name: "a father with dementia", messages: ["My dad has dementia and I'm caring for him alone", "I'm exhausted", "My sister lives far away"], topic: "loved-one-illness", mentions: /your dad|caring|caregiv/i, never: [/your sister being unwell/] },
  { name: "a friend in hospital", messages: ["How can I help my friend who is in hospital?"], topic: "loved-one-illness", expect: [/your friend/, /practical help, company, or someone to listen/] },
  { name: "a husband after surgery", messages: ["My husband just had surgery and I'm so worried"], topic: "loved-one-illness", expect: [/your husband/] },
  { name: "a grandson in hospital", messages: ["My grandson is in the hospital"], topic: "loved-one-illness", expect: [/your grandson/] },
  { name: "caregiving burnout", messages: ["I'm a caregiver for my mother and I have no time for myself"], topic: "loved-one-illness", expect: [/your own needs last|share some of this/] },
  { name: "sleep with money worries", messages: ["I can't sleep", "I keep thinking about money", "for a few weeks", "ok", "I don't know", "yes"], topic: "money", expect: [/You mentioned money/, /Earlier you also mentioned money/, /Money worries can follow you/] },
  { name: "money worries", messages: ["I'm worried about money", "rent is due next week"], topic: "money", expect: [/bill or debt/i] },
  { name: "debt", messages: ["I have so much debt on my credit cards"], topic: "money", expect: [/debt or bill/] },
  { name: "can't afford", messages: ["I can't afford my bills this month"], topic: "money" },
  { name: "losing a job", messages: ["I lost my job", "I don't know how I'll pay the bills"], topic: "job-loss", expect: [/Losing a job/, /You mentioned money/], never: [/the amount of work/] },
  { name: "laid off", messages: ["I got laid off after 20 years"], topic: "job-loss", expect: [/rejection|shake a lot/] },
  { name: "biopsy wait", messages: ["I'm waiting for my biopsy results", "two more weeks", "I keep googling"], topic: "health-worry", expect: [/Waiting is one of the hardest|waiting for answers/i, /Searching symptoms online/] },
  { name: "own symptoms", messages: ["I'm worried about my health, I have chest pain sometimes"], topic: null, expect: [/911|emergency|doctor/i] },
  { name: "loneliness after retiring", messages: ["I feel lonely since I retired", "Nobody calls me"], topic: "loneliness", expect: [/few people around/] },
  { name: "grandmother died", messages: ["My grandmother passed away last week", "I miss her voice"], topic: "grief", expect: [/sorry for your loss/, /Missing someone you love/] },
  { name: "lost my husband", messages: ["I lost my husband in the spring"], topic: "grief" },
  { name: "lost my job is not grief", messages: ["I lost my job yesterday"], topic: "job-loss", never: [/sorry for your loss/] },
  { name: "work criticism (brief example)", messages: ["I had a terrible day. My manager criticized me in front of everyone, and now I cannot stop thinking about it."], topic: "work-criticism", expect: [/What bothered you most: the way your manager spoke to you, the fact that other people were present, or the feeling that you were treated unfairly\?/] },
  { name: "work criticism follow-up", messages: ["My boss yelled at me in the meeting", "The fact that everyone saw it"], topic: "work-criticism", expect: [/exposed in front of colleagues/] },
  { name: "workload", messages: ["I have too much work and deadlines everywhere"], topic: "work-stress" },
  { name: "sad for months", messages: ["I've felt sad every day for months and can't work"], topic: "low-mood", expect: [/doctor or a mental health professional/], never: [/the amount of work/] },
  { name: "fights with husband", messages: ["My husband and I fight all the time", "The same fight again and again"], topic: "relationship", expect: [/same argument keeps coming back/], never: [/Because this has been going on for a while/] },
  { name: "daughter stopped talking", messages: ["My daughter doesn't talk to me anymore"], topic: "family", expect: [/Distance in a family/] },
  { name: "argument with mother", messages: ["I had a big argument with my mother"], topic: "family", expect: [/Arguments with family/] },
  { name: "worried about son", messages: ["I'm worried about my son, he is struggling at school"], topic: "family", expect: [/your son|someone you love/] },
  { name: "can't say no", messages: ["I can't say no to anyone at work"], topic: "boundaries" },
  { name: "feeling useless", messages: ["I'm so useless, I mess everything up"], topic: "self-esteem" },
  { name: "anger", messages: ["I'm so angry at my neighbor"], topic: "anger" },
  { name: "anxiety", messages: ["I've been feeling anxious all the time"], topic: "anxiety" },
  { name: "good day", messages: ["I had a good day today!"], topic: "good-day" },
  { name: "waking at night", messages: ["I wake up at 3am every night"], topic: "sleep" },
];

function run(messages: string[]) {
  let state: ConversationState = initialConversation();
  const replies: string[] = [];
  for (const message of messages) {
    const turn = respond(state, message);
    state = turn.state;
    replies.push(turn.reply.text);
  }
  return { state, replies, text: replies.join("\n\n") };
}

describe("LifeZoi Mind realistic conversations", () => {
  it("has at least 30 dialogues", () => {
    expect(CASES.length).toBeGreaterThanOrEqual(30);
  });

  for (const item of CASES) {
    it(item.name, () => {
      const { state, replies, text } = run(item.messages);
      if (item.topic) expect(state.topic, text).toBe(item.topic);
      if (item.mentions) for (const reply of replies) expect(reply, reply).toMatch(item.mentions);
      for (const pattern of item.expect ?? []) expect(text).toMatch(pattern);
      for (const pattern of item.never ?? []) expect(text).not.toMatch(pattern);
      for (const reply of replies) expect(reply).not.toMatch(/\{person\}/);
    });
  }
});
