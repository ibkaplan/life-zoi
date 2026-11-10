import { describe, expect, it } from "vitest";
import { EMPTY_ASSESSMENT, STEP_IDS } from "@/lib/types";
import { FOOTER_LINKS, MEMBER_LINKS, PUBLIC_LINKS } from "@/lib/navigation";
import {
  ageLabels,
  alcoholLabels,
  goalLabels,
  hydrationLabels,
  moodLabels,
  sleepQualityLabels,
  smokingLabels,
  socialLabels,
  stressLabels,
  vegetableLabels,
} from "@/lib/labels";
import {
  allergenLabels,
  bloodPressureLabels,
  bloodSugarLabels,
  cholesterolLabels,
  dietPatternLabels,
  dietRequirementLabels,
  eatingPatternLabels,
  energyLabels,
  mobilityLabels,
  reactionLabels,
  wellnessGoalLabels,
} from "@/lib/health-profile";
import { validateStep } from "@/lib/validation";
import { CRISIS_NOTICE, PROFESSIONAL_NOTICE } from "@/lib/sources";
import { WELCOME_BODY, WELCOME_HEADING } from "@/lib/share-care";
import { detectLocale, fmt, isLocale, LOCALE_META, LOCALES } from "./config";
import { en } from "./messages/en";
import { MESSAGES } from "./messages";
import { translateError } from "./translate-error";

type Tree = { [key: string]: string | Tree };

function leaves(tree: Tree, prefix = ""): Map<string, string> {
  const out = new Map<string, string>();
  for (const [key, value] of Object.entries(tree)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof value === "string") out.set(path, value);
    else for (const [inner, text] of leaves(value, path)) out.set(inner, text);
  }
  return out;
}

const placeholders = (text: string) => [...text.matchAll(/\{(\w+)\}/g)].map((match) => match[1]).sort();
const english = leaves(en as unknown as Tree);

describe("translation files", () => {
  it("offers exactly English, Ukrainian, Russian, and Greek, with English first", () => {
    expect(LOCALES).toEqual(["en", "uk", "ru", "el"]);
    expect(Object.keys(MESSAGES).sort()).toEqual([...LOCALES].sort());
    expect(LOCALES.map((code) => LOCALE_META[code].nativeName)).toEqual(["English", "Українська", "Русский", "Ελληνικά"]);
  });

  for (const locale of LOCALES) {
    describe(locale, () => {
      const text = leaves(MESSAGES[locale] as unknown as Tree);

      it("has every English key and no extra keys", () => {
        expect([...text.keys()].sort()).toEqual([...english.keys()].sort());
      });

      it("has no empty text", () => {
        for (const [key, value] of text) expect(value.trim(), key).not.toBe("");
      });

      it("keeps the same placeholders as English", () => {
        for (const [key, value] of english) expect(placeholders(text.get(key) ?? ""), key).toEqual(placeholders(value));
      });

      if (locale !== "en") {
        it("is written in its own script, not left in English", () => {
          const script = locale === "el" ? /[Ͱ-Ͽ]/ : /[Ѐ-ӿ]/;
          // Brand names, numbers, and codes may stay as they are.
          const allowed = /^(LIFEZOI|WHAT IF\?|Email|Vegan|[\d–+ ]+|\{\w+\} ?(cm|kg)?)$/;
          for (const [key, value] of text) {
            if (allowed.test(value)) continue;
            expect(script.test(value), `${locale}.${key}: ${value}`).toBe(true);
          }
        });
      }
    });
  }
});

describe("English text matches the existing source strings", () => {
  // The English file must say exactly what the app said before translation.
  it("keeps the shell notices", () => {
    expect(en.shell.professionalNotice).toBe(PROFESSIONAL_NOTICE);
    expect(en.shell.crisisNotice).toBe(CRISIS_NOTICE);
    expect(en.welcome.heading).toBe(WELCOME_HEADING);
    expect(en.welcome.body).toBe(WELCOME_BODY);
  });

  it("keeps every menu label", () => {
    for (const link of [...PUBLIC_LINKS, ...MEMBER_LINKS, ...FOOTER_LINKS]) {
      expect((en.nav as Record<string, string>)[link.href], link.href).toBe(link.label);
    }
  });

  it("keeps every answer label and has a translation for every option", () => {
    const pairs: [Record<string, string>, Record<string, string>][] = [
      [en.labels.age, ageLabels],
      [en.labels.sleepQuality, sleepQualityLabels],
      [en.labels.frequency, vegetableLabels],
      [en.labels.hydration, hydrationLabels],
      [en.labels.smoking, smokingLabels],
      [en.labels.alcohol, alcoholLabels],
      [en.labels.stress, stressLabels],
      [en.labels.mood, moodLabels],
      [en.labels.social, socialLabels],
      [en.labels.goal, goalLabels],
      [en.labels.bloodSugar, bloodSugarLabels],
      [en.labels.cholesterol, cholesterolLabels],
      [en.labels.bloodPressure, bloodPressureLabels],
      [en.labels.eatingPattern, eatingPatternLabels],
      [en.labels.allergen, allergenLabels],
      [en.labels.dietRequirement, dietRequirementLabels],
      [en.labels.dietPattern, dietPatternLabels],
      [en.labels.energy, energyLabels],
      [en.labels.reaction, reactionLabels],
      [en.labels.mobility, mobilityLabels],
      [en.labels.wellnessGoal, wellnessGoalLabels],
    ];
    for (const [translated, source] of pairs) expect(translated).toEqual(source);
  });

  it("has a title for every assessment step", () => {
    expect(Object.keys(en.assessment.steps).sort()).toEqual([...STEP_IDS].sort());
  });
});

describe("language detection", () => {
  it("uses the first supported browser language", () => {
    expect(detectLocale(["uk-UA", "en-US"])).toBe("uk");
    expect(detectLocale(["de-DE", "ru"])).toBe("ru");
    expect(detectLocale(["el_GR"])).toBe("el");
    expect(detectLocale(["EN-gb"])).toBe("en");
  });

  it("falls back to English", () => {
    expect(detectLocale(["de-DE", "fr"])).toBe("en");
    expect(detectLocale([])).toBe("en");
    expect(detectLocale(undefined)).toBe("en");
  });

  it("accepts only the four codes", () => {
    expect(isLocale("uk")).toBe(true);
    expect(isLocale("ua")).toBe(false);
    expect(isLocale(null)).toBe(false);
  });
});

describe("fmt", () => {
  it("fills placeholders and leaves unknown ones", () => {
    expect(fmt("Step {step} of {total}", { step: 2, total: 9 })).toBe("Step 2 of 9");
    expect(fmt("Hi {name}", {})).toBe("Hi {name}");
  });
});

describe("validation messages", () => {
  it("translates every message the assessment can show", () => {
    const draft = {
      ...EMPTY_ASSESSMENT,
      goals: [],
      exactAge: "abc",
      heightCm: "10",
      weightKg: "70.5",
      sleepHours: "",
      activityDays: "3",
      activityMinutes: "",
      sedentaryHours: "99",
      desiredWeightKg: "5",
      habitNote: "x".repeat(400),
    };
    for (const locale of LOCALES.filter((code) => code !== "en")) {
      const m = MESSAGES[locale];
      for (const step of STEP_IDS) {
        for (const message of Object.values(validateStep(step, draft))) {
          const translated = translateError(message, m);
          expect(translated, `${locale}: ${message}`).not.toBe(message);
          expect(translated).not.toMatch(/\{\w+\}/);
        }
      }
    }
  });

  it("returns English unchanged and passes unknown messages through", () => {
    expect(translateError("Enter age from 18 to 100.", MESSAGES.en)).toBe("Enter age from 18 to 100.");
    expect(translateError("Something new.", MESSAGES.uk)).toBe("Something new.");
    expect(translateError(undefined, MESSAGES.uk)).toBeUndefined();
    expect(translateError("Enter age from 18 to 100.", MESSAGES.uk)).toBe("Введіть вік від 18 до 100.");
  });
});
