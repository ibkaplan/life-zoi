import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { conversationText, initialConversation, resultOpening, respond, type ConversationState } from "@/lib/mind/conversation";
import { MIND_TEXT } from "@/lib/mind/lang";
import { russianCues } from "@/lib/mind/lang/ru-cues";
import { DISTRESS_NOTE } from "@/lib/mind/safety";
import { TOPICS } from "@/lib/mind/topics";

const ru = MIND_TEXT.ru;
const placeholders = (text: string) => new Set([...text.matchAll(/\{(\w+)\}/g)].map((match) => match[1]));

/** Every English text the conversation can show. */
function engineText(): string[] {
  const out = new Set<string>([...conversationText(), DISTRESS_NOTE]);
  for (const file of ["conversation.ts", "safety.ts"]) {
    const code = readFileSync(join(__dirname, file), "utf8");
    for (const match of code.matchAll(/(?<![\w.])tr\(\s*("(?:[^"\\\n]|\\.)*")/g)) out.add(JSON.parse(match[1]) as string);
  }
  for (const topic of TOPICS) {
    out.add(topic.open).add(topic.otherFacet.reply).add(topic.otherFacet.question).add(topic.perspective).add(topic.nextSteps).add(topic.why);
    for (const facet of topic.facets) {
      out.add(facet.label).add(facet.reply).add(facet.question);
      if (facet.perspective) out.add(facet.perspective);
    }
    if (topic.personFallback) out.add(topic.personFallback);
    if (topic.sideLabel) out.add(topic.sideLabel);
  }
  const people = /const PEOPLE =\s*"([^"]+)"/.exec(readFileSync(join(__dirname, "topics.ts"), "utf8"))?.[1] ?? "";
  for (const person of people.replace(/\?/g, "").split("|")) out.add(`your ${person}`);
  out.add("them");
  return [...out];
}

describe("LifeZoi Mind in Russian: text", () => {
  it("has a Russian version of every reply, label, and person", () => {
    const missing = engineText().filter((english) => !ru[english]?.trim());
    expect(missing).toEqual([]);
  });

  it("only uses placeholders the English text has", () => {
    for (const [english, russian] of Object.entries(ru)) {
      const allowed = placeholders(english);
      for (const name of placeholders(russian)) expect(allowed.has(name), `${name} in ${russian}`).toBe(true);
    }
  });

  it("names plural people in a way that keeps the grammar singular", () => {
    expect(ru["your parents"]).toBe("кто-то из ваших родителей");
    expect(ru["your kids"]).toBe("кто-то из ваших детей");
  });
});

type Dialogue = { say: string[]; topic: string | null; expect?: RegExp[]; person?: string };

const DIALOGUES: Dialogue[] = [
  { say: ["Начальник накричал на меня при всех на совещании"], topic: "work-criticism", expect: [/критикуют при других людях/] },
  { say: ["Начальник накричал на меня при всех", "Рядом были другие люди"], topic: "work-criticism", expect: [/перед коллегами/] },
  { say: ["Моя мама болеет, у неё рак"], topic: "loved-one-illness", person: "your mom", expect: [/ваша мама болеет/] },
  { say: ["Моя мама болеет", "Я очень боюсь, что ей станет хуже"], topic: "loved-one-illness", expect: [/как держится ваша мама/] },
  { say: ["Мои родители болеют"], topic: "loved-one-illness", expect: [/кто-то из ваших родителей болеет/] },
  { say: ["Мой отец умер в прошлом месяце"], topic: "grief", person: "your dad", expect: [/утрату/] },
  { say: ["Меня уволили с работы"], topic: "job-loss", expect: [/Потеря работы/] },
  { say: ["Долги по кредиту не дают спать"], topic: "money", expect: [/долг или счёт/] },
  { say: ["Не могу уснуть"], topic: "sleep", expect: [/Плохой сон/] },
  { say: ["Не могу уснуть", "Трудно заснуть"], topic: "sleep", expect: [/мысли продолжают нестись/] },
  { say: ["Мне одиноко"], topic: "loneliness", expect: [/Одиночество/] },
  { say: ["Я поругалась с мужем"], topic: "relationship", person: "your husband" },
  { say: ["Я такая неудачница"], topic: "self-esteem" },
  { say: ["Я злюсь на коллегу"], topic: "anger" },
  { say: ["Мне в последнее время тревожно"], topic: "anxiety" },
  { say: ["Сегодня у меня был трудный день на работе"], topic: "work-stress" },
  { say: ["Не могу отказать, всегда соглашаюсь"], topic: "boundaries" },
  { say: ["Я жду результаты своих анализов"], topic: "health-worry" },
  { say: ["Мне очень грустно"], topic: "low-mood" },
  { say: ["Сегодня был отличный день"], topic: "good-day" },
  { say: ["Привет"], topic: null, expect: [/^Здравствуйте\. Я рад, что вы здесь/] },
  { say: ["Я хочу упражнение на расслабление"], topic: null, expect: [/несколько упражнений/] },
  { say: ["Ты настоящий человек?"], topic: null, expect: [/Я не человек/] },
  { say: ["Можно мне бросить принимать антидепрессанты?"], topic: null, expect: [/не прекращать приём/] },
  { say: ["Поставь мне диагноз"], topic: null, expect: [/не могу диагностировать/] },
  { say: ["Мне одиноко", "Спасибо, это помогло"], topic: null, expect: [/Спасибо, что поговорили со мной/] },
];

function talk(lines: readonly string[]) {
  let state: ConversationState = initialConversation();
  const replies: string[] = [];
  for (const line of lines) {
    const turn = respond(state, line, "ru");
    state = turn.state;
    replies.push(turn.reply.text, ...turn.reply.quickReplies);
  }
  return { state, replies };
}

/** English words that must not appear in a Russian reply. Names of services are allowed. */
const ENGLISH_WORD = /\b(?!(?:LifeZoi|Mind|Suicide|Crisis|Lifeline|GAD|PHQ)\b)[A-Za-z]{3,}\b/;

describe("LifeZoi Mind in Russian: conversation", () => {
  for (const dialogue of DIALOGUES) {
    it(dialogue.say.join(" → "), () => {
      const { state, replies } = talk(dialogue.say);
      expect(state.topic).toBe(dialogue.topic);
      if (dialogue.person) expect(state.person).toBe(dialogue.person);
      const last = replies.join("\n");
      for (const pattern of dialogue.expect ?? []) expect(last).toMatch(pattern);
      for (const text of replies) {
        expect(text).not.toMatch(/\{\w+\}/);
        expect(text, text).not.toMatch(ENGLISH_WORD);
      }
    });
  }

  it("goes through every stage of a topic in Russian", () => {
    const { replies } = talk(["Мне одиноко", "Рядом мало людей", "Раньше было больше друзей", "Не знаю", "Хочу продолжить разговор", "Да"]);
    for (const text of replies) expect(text, text).not.toMatch(ENGLISH_WORD);
  });

  it("answers a crisis in Russian and reads the person's own words for safety", () => {
    const turn = respond(initialConversation(), "Я больше не хочу жить", "ru");
    expect(turn.reply.kind).toBe("crisis");
    expect(turn.reply.text).toMatch(/Ваша безопасность важнее всего/);
    expect(turn.reply.text).toMatch(/988/);
    expect(turn.reply.text).toMatch(/911/);
  });

  it("still understands English typed on the Russian page", () => {
    expect(russianCues("I can't sleep")).toBe("I can't sleep");
    const turn = respond(initialConversation(), "I can't sleep", "ru");
    expect(turn.state.topic).toBe("sleep");
    expect(turn.reply.text).toMatch(/Плохой сон/);
  });

  it("does not treat a long message that starts with «можно» as a yes", () => {
    expect(russianCues("Можно я расскажу, что случилось на работе сегодня утром")).not.toMatch(/^yes/);
    expect(russianCues("Да")).toBe("yes");
    expect(russianCues("Нет")).toBe("no");
  });

  it("opens a questionnaire result in Russian without calling it a diagnosis", () => {
    const opening = resultOpening({ instrument: "gad7", band: "Moderate", total: 12, suggestFollowUp: true, item9Positive: false }, "ru");
    expect(opening.text).toMatch(/не может поставить диагноз/);
    expect(opening.text).toMatch(/GAD-7/);
    expect(opening.quickReplies).toEqual(["Да, давайте разберёмся", "Не сейчас"]);
  });

  it("keeps English replies unchanged", () => {
    const turn = respond(initialConversation(), "I feel lonely");
    expect(turn.reply.text).toMatch(/^I'm really glad you said something/);
  });
});
