import { describe, expect, it } from "vitest";
import { initialConversation, resultOpening, respond, type ConversationState } from "@/lib/mind/conversation";
import { MIND_TEXT } from "@/lib/mind/lang";
import { ukrainianCues } from "@/lib/mind/lang/uk-cues";

const uk = MIND_TEXT.uk;
const ru = MIND_TEXT.ru;
const placeholders = (text: string) => new Set([...text.matchAll(/\{(\w+)\}/g)].map((match) => match[1]));

describe("LifeZoi Mind in Ukrainian: text", () => {
  it("has a Ukrainian version of everything the Russian version has", () => {
    // conversation-ru.test.ts checks that the Russian table covers every English text.
    expect(Object.keys(ru).filter((english) => !uk[english]?.trim())).toEqual([]);
  });

  it("only uses placeholders the English text has", () => {
    for (const [english, ukrainian] of Object.entries(uk)) {
      const allowed = placeholders(english);
      for (const name of placeholders(ukrainian)) expect(allowed.has(name), `${name} in ${ukrainian}`).toBe(true);
    }
  });

  it("names plural people in a way that keeps the grammar singular", () => {
    expect(uk["your parents"]).toBe("хтось із ваших батьків");
    expect(uk["your kids"]).toBe("хтось із ваших дітей");
  });
});

type Dialogue = { say: string[]; topic: string | null; expect?: RegExp[]; person?: string };

const DIALOGUES: Dialogue[] = [
  { say: ["Начальник накричав на мене при всіх на нараді"], topic: "work-criticism", expect: [/критикують при інших людях/] },
  { say: ["Начальник накричав на мене при всіх", "Поруч були інші люди"], topic: "work-criticism", expect: [/перед колегами/] },
  { say: ["Моя мама хворіє, у неї рак"], topic: "loved-one-illness", person: "your mom", expect: [/ваша мама хворіє/] },
  { say: ["Моя мама хворіє", "Я дуже боюся, що їй стане гірше"], topic: "loved-one-illness", expect: [/як тримається ваша мама/] },
  { say: ["Мої батьки хворіють"], topic: "loved-one-illness", expect: [/хтось із ваших батьків хворіє/] },
  { say: ["Мій батько помер минулого місяця"], topic: "grief", person: "your dad" },
  { say: ["Мене звільнили з роботи"], topic: "job-loss" },
  { say: ["Мене звільнили з роботи", "Грошовий бік"], topic: "job-loss", expect: [/як за все платити/] },
  { say: ["Борги за кредитом не дають спати"], topic: "money" },
  { say: ["Не можу заснути"], topic: "sleep", expect: [/Поганий сон/] },
  { say: ["Мені самотньо"], topic: "loneliness" },
  { say: ["Я посварилася з чоловіком"], topic: "relationship", person: "your husband" },
  { say: ["Я така невдаха"], topic: "self-esteem" },
  { say: ["Я злюся на колегу"], topic: "anger" },
  { say: ["Мені останнім часом тривожно"], topic: "anxiety" },
  { say: ["Сьогодні в мене був важкий день на роботі"], topic: "work-stress" },
  { say: ["Не можу відмовити, завжди погоджуюся"], topic: "boundaries" },
  { say: ["Я чекаю результати своїх аналізів"], topic: "health-worry" },
  { say: ["Мені дуже сумно"], topic: "low-mood" },
  { say: ["Сьогодні був чудовий день"], topic: "good-day" },
  { say: ["Привіт"], topic: null, expect: [/^Вітаю\. Я радий, що ви тут/] },
  { say: ["Я хочу вправу на розслаблення"], topic: null, expect: [/кілька вправ/] },
  { say: ["Ти справжня людина?"], topic: null, expect: [/Я не людина/] },
  { say: ["Чи можна мені кинути приймати антидепресанти?"], topic: null, expect: [/не припиняти прийом/] },
  { say: ["Постав мені діагноз"], topic: null, expect: [/не можу діагностувати/] },
  { say: ["Мені самотньо", "Дякую, це допомогло"], topic: null, expect: [/Дякую, що поговорили зі мною/] },
];

function talk(lines: readonly string[]) {
  let state: ConversationState = initialConversation();
  const replies: string[] = [];
  for (const line of lines) {
    const turn = respond(state, line, "uk");
    state = turn.state;
    replies.push(turn.reply.text, ...turn.reply.quickReplies);
  }
  return { state, replies };
}

const ENGLISH_WORD = /\b(?!(?:LifeZoi|Mind|Suicide|Crisis|Lifeline|GAD|PHQ)\b)[A-Za-z]{3,}\b/;
const RUSSIAN_ONLY = /[ыэъё]/i;

describe("LifeZoi Mind in Ukrainian: conversation", () => {
  for (const dialogue of DIALOGUES) {
    it(dialogue.say.join(" → "), () => {
      const { state, replies } = talk(dialogue.say);
      expect(state.topic).toBe(dialogue.topic);
      if (dialogue.person) expect(state.person).toBe(dialogue.person);
      const all = replies.join("\n");
      for (const pattern of dialogue.expect ?? []) expect(all).toMatch(pattern);
      for (const text of replies) {
        expect(text).not.toMatch(/\{\w+\}/);
        expect(text, text).not.toMatch(ENGLISH_WORD);
        expect(text, text).not.toMatch(RUSSIAN_ONLY);
      }
    });
  }

  it("answers a crisis in Ukrainian", () => {
    const turn = respond(initialConversation(), "Я більше не хочу жити", "uk");
    expect(turn.reply.kind).toBe("crisis");
    expect(turn.reply.text).toMatch(/Ваша безпека найважливіша/);
    expect(turn.reply.text).toMatch(/988/);
  });

  it("keeps a tapped answer on the current topic", () => {
    const { replies } = talk(["Мене звільнили з роботи", "Грошовий бік"]);
    expect(replies.join("\n")).not.toMatch(/Ви згадали й гроші/);
  });

  it("reads short replies and English", () => {
    expect(ukrainianCues("Так")).toBe("yes");
    expect(ukrainianCues("Ні")).toBe("no");
    expect(ukrainianCues("I can't sleep")).toBe("I can't sleep");
  });

  it("opens a questionnaire result in Ukrainian", () => {
    const opening = resultOpening({ instrument: "phq9", band: "Mild", total: 7, suggestFollowUp: false, item9Positive: false }, "uk");
    expect(opening.text).toMatch(/не може поставити діагноз/);
    expect(opening.quickReplies).toEqual(["Так, давайте розберемося", "Не зараз"]);
  });
});
