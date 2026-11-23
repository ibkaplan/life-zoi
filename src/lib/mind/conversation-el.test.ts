import { describe, expect, it } from "vitest";
import { initialConversation, OPENING_TOPICS, resultOpening, respond, type ConversationState } from "@/lib/mind/conversation";
import { MIND_TEXT } from "@/lib/mind/lang";
import { greekCues } from "@/lib/mind/lang/el-cues";

const el = MIND_TEXT.el;
const ru = MIND_TEXT.ru;
const placeholders = (text: string) => new Set([...text.matchAll(/\{(\w+)\}/g)].map((match) => match[1]));

describe("LifeZoi Mind in Greek: text", () => {
  it("has a Greek version of everything the Russian version has", () => {
    // conversation-ru.test.ts checks that the Russian table covers every English text.
    expect(Object.keys(ru).filter((english) => !el[english]?.trim())).toEqual([]);
  });

  it("only uses placeholders the English text has", () => {
    for (const [english, greek] of Object.entries(el)) {
      const allowed = placeholders(english);
      for (const name of placeholders(greek)) expect(allowed.has(name), `${name} in ${greek}`).toBe(true);
    }
  });

  it("names plural people in a way that keeps the grammar singular", () => {
    expect(el["your parents"]).toBe("κάποιος από τους γονείς σας");
    expect(el["your kids"]).toBe("κάποιο από τα παιδιά σας");
  });
});

type Dialogue = { say: string[]; topic: string | null; expect?: RegExp[]; person?: string };

const DIALOGUES: Dialogue[] = [
  { say: ["Ο προϊστάμενός μου μου φώναξε μπροστά σε όλους στη σύσκεψη"], topic: "work-criticism", expect: [/κριτική μπροστά σε άλλους/] },
  { say: ["Ο προϊστάμενός μου μου φώναξε μπροστά σε όλους", "Ήταν παρόντες κι άλλοι"], topic: "work-criticism", expect: [/μπροστά στους συναδέλφους/] },
  { say: ["Η μαμά μου είναι άρρωστη, έχει καρκίνο"], topic: "loved-one-illness", person: "your mom", expect: [/η μαμά σας δεν είναι καλά/] },
  { say: ["Η μαμά μου είναι άρρωστη", "Φοβάμαι πολύ ότι θα χειροτερέψει"], topic: "loved-one-illness", expect: [/πώς τα πάει η μαμά σας/] },
  { say: ["Οι γονείς μου είναι άρρωστοι"], topic: "loved-one-illness", expect: [/κάποιος από τους γονείς σας δεν είναι καλά/] },
  { say: ["Ο πατέρας μου πέθανε τον περασμένο μήνα"], topic: "grief", person: "your dad" },
  { say: ["Με απέλυσαν από τη δουλειά"], topic: "job-loss" },
  { say: ["Με απέλυσαν από τη δουλειά", "Τα οικονομικά"], topic: "job-loss", expect: [/πώς θα πληρώσετε/] },
  { say: ["Τα χρέη από το δάνειο δεν με αφήνουν να κοιμηθώ"], topic: "money" },
  { say: ["Δεν μπορώ να κοιμηθώ"], topic: "sleep", expect: [/κακός ύπνος/] },
  { say: ["Νιώθω μοναξιά"], topic: "loneliness" },
  { say: ["Τσακώθηκα με τον άντρα μου"], topic: "relationship", person: "your husband" },
  { say: ["Είμαι τόσο αποτυχημένη"], topic: "self-esteem" },
  { say: ["Είμαι θυμωμένη με έναν συνάδελφο"], topic: "anger" },
  { say: ["Τελευταία έχω πολύ άγχος"], topic: "anxiety" },
  { say: ["Σήμερα είχα μια δύσκολη μέρα στη δουλειά"], topic: "work-stress" },
  { say: ["Δεν μπορώ να αρνηθώ, πάντα λέω ναι"], topic: "boundaries" },
  { say: ["Περιμένω τα αποτελέσματα των εξετάσεών μου"], topic: "health-worry" },
  { say: ["Νιώθω πολύ θλίψη"], topic: "low-mood" },
  { say: ["Σήμερα ήταν μια υπέροχη μέρα"], topic: "good-day" },
  { say: ["Γεια σας"], topic: null, expect: [/^Γεια σας\. Χαίρομαι που είστε εδώ/] },
  { say: ["Θέλω μια άσκηση χαλάρωσης"], topic: null, expect: [/μερικές ασκήσεις/] },
  { say: ["Είσαι αληθινός άνθρωπος;"], topic: null, expect: [/Δεν είμαι άνθρωπος/] },
  { say: ["Μπορώ να σταματήσω τα αντικαταθλιπτικά;"], topic: null, expect: [/να μη σταματήσετε ένα φάρμακο/] },
  { say: ["Κάντε μου διάγνωση"], topic: null, expect: [/Δεν μπορώ να διαγνώσω/] },
  { say: ["Νιώθω μοναξιά", "Ευχαριστώ, αυτό βοήθησε"], topic: null, expect: [/Σας ευχαριστώ που μιλήσατε μαζί μου/] },
];

function talk(lines: readonly string[]) {
  let state: ConversationState = initialConversation();
  const replies: string[] = [];
  for (const line of lines) {
    const turn = respond(state, line, "el");
    state = turn.state;
    replies.push(turn.reply.text, ...turn.reply.quickReplies);
  }
  return { state, replies };
}

const ENGLISH_WORD = /\b(?!(?:LifeZoi|Mind|Suicide|Crisis|Lifeline|GAD|PHQ)\b)[A-Za-z]{3,}\b/;
const CYRILLIC = /[Ѐ-ӿ]/;

describe("LifeZoi Mind in Greek: conversation", () => {
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
        expect(text, text).not.toMatch(CYRILLIC);
      }
    });
  }

  it("treats each opening button like its English version", () => {
    for (const english of OPENING_TOPICS) {
      const inEnglish = respond(initialConversation(), english).state.topic;
      const inGreek = respond(initialConversation(), el[english], "el").state.topic;
      expect(inGreek, el[english]).toBe(inEnglish);
    }
  });

  it("goes through every stage of a topic in Greek", () => {
    const { replies } = talk(["Νιώθω μοναξιά", "Λίγοι άνθρωποι γύρω μου", "Παλιά είχα περισσότερους φίλους", "Δεν ξέρω", "Θα ήθελα να συνεχίσουμε τη συζήτηση", "Ναι"]);
    for (const text of replies) expect(text, text).not.toMatch(ENGLISH_WORD);
  });

  it("answers a crisis in Greek", () => {
    const turn = respond(initialConversation(), "Δεν θέλω να ζω άλλο", "el");
    expect(turn.reply.kind).toBe("crisis");
    expect(turn.reply.text).toMatch(/Η ασφάλειά σας είναι το πρώτο/);
    expect(turn.reply.text).toMatch(/988/);
    expect(turn.reply.text).toMatch(/911/);
  });

  it("keeps a tapped answer on the current topic", () => {
    const { replies } = talk(["Με απέλυσαν από τη δουλειά", "Τα οικονομικά"]);
    expect(replies.join("\n")).not.toMatch(/Αναφέρατε και τα χρήματα/);
  });

  it("reads short replies, accents, and English", () => {
    expect(greekCues("Ναι")).toBe("yes");
    expect(greekCues("Όχι")).toBe("no");
    expect(greekCues("ΔΕΝ ΜΠΟΡΩ ΝΑ ΚΟΙΜΗΘΩ")).toBe(greekCues("Δεν μπορώ να κοιμηθώ"));
    expect(greekCues("Μπορώ να σας πω τι έγινε σήμερα το πρωί στη δουλειά")).not.toMatch(/^yes/);
    expect(greekCues("I can't sleep")).toBe("I can't sleep");
  });

  it("opens a questionnaire result in Greek", () => {
    const opening = resultOpening({ instrument: "phq9", band: "Mild", total: 7, suggestFollowUp: false, item9Positive: false }, "el");
    expect(opening.text).toMatch(/δεν μπορεί να κάνει διάγνωση/);
    expect(opening.quickReplies).toEqual(["Ναι, ας το εξερευνήσουμε", "Όχι αυτή τη στιγμή"]);
  });
});
