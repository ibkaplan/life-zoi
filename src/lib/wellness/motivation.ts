import { msg } from "@/lib/i18n/translate";
import type { WellnessMotivation } from "@/lib/wellness/types";

export type MotivationIdea = {
  title: string;
  href: string;
  reason: string;
};

const SUGGESTIONS: { words: string[]; idea: MotivationIdea }[] = [
  {
    words: ["sleep", "tired", "rest", "energy", "morning",
      // Ukrainian, Russian and Greek word stems. Greek is compared without accent marks.
      "сон", "спат", "сплю", "втом", "утом", "устал", "відпоч", "отдых", "енерг", "энерг", "ранок", "ранку", "вранці", "утро", "утром", "υπν", "κουρασ", "ξεκουρ", "ενεργ", "πρωι"],
    idea: {
      title: msg("Sleep routine"),
      href: "/choices/sleep",
      reason: msg("Your words mention rest or energy. The sleep notes are one place to look. They do not assume how much energy you should have."),
    },
  },
  {
    words: ["walk", "travel", "trip", "stairs", "independent", "mobility", "grandchild", "garden", "move",
      // Ukrainian, Russian and Greek word stems. Greek is compared without accent marks.
      "гуля", "прогул", "пішк", "пешк", "ходьб", "подорож", "путешеств", "поїздк", "поездк", "сходи", "сходах", "лестниц", "самостій", "самостоят", "онук", "внук", "садів", "огород", "сад ", "рух", "движ", "περπατ", "ταξιδ", "σκαλ", "ανεξαρτητ", "κινησ", "κινουμ", "εγγον", "κηπ"],
    idea: {
      title: msg("Walking, strength, and balance"),
      href: "/choices/muscles",
      reason: msg("Your words mention movement, travel, or staying able to do something. Start with the smallest version that fits. Skip the rest."),
    },
  },
  {
    words: ["food", "cook", "eat", "meal", "weight", "vegetable",
      // Ukrainian, Russian and Greek word stems. Greek is compared without accent marks.
      "їжа", "їжі", "їсти", "еда", "еду", "готуват", "готувал", "готовит", "готовл", "харчуван", "питани", "страв", "блюд", "вага", "вагу", "похуд", "схуд", "овоч", "φαγητ", "μαγειρ", "τρωω", "γευμ", "βαρος", "κιλα", "λαχανικ"],
    idea: {
      title: msg("Meal skills"),
      href: "/academy/meals/planning",
      reason: msg("Your words mention food. The meal modules teach planning and swaps. They do not set calories."),
    },
  },
  {
    words: ["sugar", "sweet", "soda", "dessert",
      // Ukrainian, Russian and Greek word stems. Greek is compared without accent marks.
      "цукор", "цукр", "сахар", "солодк", "солодощ", "сладк", "газуванк", "газировк", "десерт", "ζαχαρ", "γλυκ", "αναψυκτικ", "επιδορπι"],
    idea: {
      title: msg("Sugar curiosity"),
      href: "/choices/sugar",
      reason: msg("Your words mention something sweet. The sugar notes are about labels and habits, without shame."),
    },
  },
  {
    words: ["stress", "worry", "anxious", "overwhelm",
      // Ukrainian, Russian and Greek word stems. Greek is compared without accent marks.
      "стрес", "тривог", "хвилю", "тревог", "волну", "беспоко", "перевантаж", "перегруж", "αγχ", "ανησυχ", "στρες", "πιεση"],
    idea: {
      title: msg("Stress and support"),
      href: "/choices/stress",
      reason: msg("Your words mention stress. NIMH’s coping ideas are education. A professional is the right place for treatment."),
    },
  },
  {
    words: ["smoke", "cigarette", "alcohol", "drink",
      // Ukrainian, Russian and Greek word stems. Greek is compared without accent marks.
      "курю", "курит", "курін", "курен", "палю", "палит", "сигарет", "цигарк", "алкогол", "випив", "выпив", "спиртн", "καπνι", "τσιγαρ", "αλκοολ", "ποτο", "ποτα"],
    idea: {
      title: msg("Tobacco and alcohol information"),
      href: "/choices/tobacco-alcohol",
      reason: msg("Your words mention smoking or drinking. Public support pages are linked. You choose whether to open them."),
    },
  },
];

const GREEK_PLAIN: Record<string, string> = { ά: "α", έ: "ε", ή: "η", ί: "ι", ϊ: "ι", ΐ: "ι", ό: "ο", ύ: "υ", ϋ: "υ", ΰ: "υ", ώ: "ω", ς: "σ" };

/** Lower case, with Greek accent marks and final sigma removed, so "Ύπνος" matches "υπν". */
function plain(text: string) {
  return text.toLowerCase().replace(/[άέήίϊΐόύϋΰώς]/g, (letter) => GREEK_PLAIN[letter] ?? letter);
}

export function motivationSuggestions(motivation: WellnessMotivation): MotivationIdea[] {
  const text = plain(Object.values(motivation).join(" "));
  if (!text.trim()) {
    return [
      {
        title: msg("Write what you want more of"),
        href: "/choices/motivation",
        reason: msg("The ideas appear after you describe an experience, a person, an activity, or a kind of energy that would help. Examples are only examples."),
      },
    ];
  }
  const matches = SUGGESTIONS.filter((item) => item.words.some((word) => text.includes(plain(word)))).map(
    (item) => item.idea,
  );
  if (matches.length === 0) {
    return [
      {
        title: msg("Habit skills"),
        href: "/wellness-coach",
        reason: msg("Your note does not match a narrower module. The habit lesson is a general place to turn a wish into one small cue."),
      },
    ];
  }
  return matches;
}

export const MOTIVATION_EXAMPLES = [
  msg("A trip you hope to take"),
  msg("More energy for a hobby you already enjoy"),
  msg("Staying able to do a daily task that matters to you"),
] as const;
