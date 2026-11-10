import { populationFigure, SSA_LIFE_TABLE_URL, SSA_TABLE_META } from "@/lib/life-table";
import {
  alcoholLabels,
  smokingLabels,
  socialLabels,
  stressLabels,
  vegetableLabels,
} from "@/lib/labels";
import { msg } from "@/lib/i18n/translate";
import { englishT, type Translate } from "@/lib/page-format";
import type { NormalizedAssessment } from "@/lib/types";

export const POPULATION_LABEL = msg("Population-based statistical estimate — not an individual prediction.");

export type OutlookLabel =
  | "potentially protective"
  | "worth improving"
  | "monitor"
  | "discuss with a professional";

export type ProfileItem = {
  topic: string;
  label: OutlookLabel;
  kind: "user-reported" | "missing";
  note: string;
};

const TOPIC = {
  vegetables: msg("Vegetables or fruit"),
  tobacco: msg("Tobacco"),
  sleep: msg("Sleep"),
  stress: msg("Stress"),
  social: msg("Social connection"),
  movement: msg("Movement"),
  alcohol: msg("Alcohol"),
  numbers: msg("Numbers you typed"),
} as const;

/** The qualitative readings, written for a person. The stored label stays in English. */
export const OUTLOOK_LABEL_TEXT: Record<OutlookLabel, string> = {
  "potentially protective": msg("potentially protective"),
  "worth improving": msg("worth improving"),
  monitor: msg("monitor"),
  "discuss with a professional": msg("discuss with a professional"),
};

export function populationBlock(assessment: NormalizedAssessment | null, t: Translate = englishT) {
  if (!assessment) {
    return {
      shown: false,
      text: t("No completed assessment is available, so no population figure is shown."),
    };
  }
  const sex = assessment.tableSex === "female" || assessment.tableSex === "male" ? assessment.tableSex : null;
  const age = assessment.exactAge;
  const note = assessment.populationNote
    ? t(
        "You wrote this population note: “{note}.” The table below is still only the Social Security area table, not a table for that note.",
        { note: assessment.populationNote },
      )
    : t("If you live outside the Social Security area population, this table is not your country’s table.");
  if (age === null || sex === null) {
    return {
      shown: false,
      text: t(
        "No figure is shown. The official table needs an exact age from 18 to 90 that was copied into lifeZoi, and the female or male column, because those are the published columns. Another sex, a skipped sex, or a missing age stays blank on purpose. Read the table at {url}. {note}",
        { url: SSA_LIFE_TABLE_URL, note },
      ),
    };
  }
  const figure = populationFigure(age, sex);
  if (figure === null) {
    return {
      shown: false,
      text: t(
        "Age {age} is not one of the copied rows, and lifeZoi will not estimate a number in between. Open the official table: {url}. {note}",
        { age, url: SSA_LIFE_TABLE_URL, note },
      ),
    };
  }
  const published =
    sex === "female"
      ? t("For the {population} the {table} publishes {figure} at exact age {age} in the female column.", {
          population: t(SSA_TABLE_META.population),
          table: t(SSA_TABLE_META.name),
          figure,
          age,
        })
      : t("For the {population} the {table} publishes {figure} at exact age {age} in the male column.", {
          population: t(SSA_TABLE_META.population),
          table: t(SSA_TABLE_META.name),
          figure,
          age,
        });
  return {
    shown: true,
    text: `${t(POPULATION_LABEL)} ${published} ${SSA_TABLE_META.assumptions.map((item) => t(item)).join(" ")} ${note} ${t("This is not your number and not a date.")}`,
  };
}

export function personalProfile(assessment: NormalizedAssessment | null, t: Translate = englishT): {
  modelNote: string;
  items: ProfileItem[];
  missing: string[];
  opportunities: string[];
  nextChapter: string;
} {
  const modelNote = t(
    "No validated prediction model is implemented. Labels below are qualitative readings of what you reported. A risk factor is not a diagnosis. An association is not a personal forecast.",
  );
  if (!assessment) {
    return {
      modelNote,
      items: [],
      missing: [t("A completed assessment")],
      opportunities: [t("Finish the assessment when you want a profile.")],
      nextChapter: t("The next chapter can be one small habit, not a number."),
    };
  }
  const items: ProfileItem[] = [];
  const add = (topic: string, label: OutlookLabel, note: string) => {
    items.push({ topic: t(topic), label, kind: "user-reported", note });
  };
  const reported = (answer: string) => t("You reported {answer}.", { answer: t(answer) });
  const stressNote = (answer: string) => t("You described stress as {answer}.", { answer: t(answer) });
  const activity = t("You reported activity on {days} days.", { days: assessment.activityDays });
  if (assessment.vegetables === "daily" || assessment.vegetables === "most-days") {
    add(TOPIC.vegetables, "potentially protective", reported(vegetableLabels[assessment.vegetables]));
  } else {
    add(TOPIC.vegetables, "worth improving", reported(vegetableLabels[assessment.vegetables]));
  }
  if (assessment.smoking === "daily" || assessment.smoking === "some-days") {
    add(
      TOPIC.tobacco,
      "discuss with a professional",
      t("You reported {answer}. lifeZoi does not recommend a medicine.", { answer: t(smokingLabels[assessment.smoking]) }),
    );
  } else if (assessment.smoking === "never" || assessment.smoking === "former") {
    add(TOPIC.tobacco, "potentially protective", reported(smokingLabels[assessment.smoking]));
  }
  if (assessment.sleepHours < 7 || assessment.sleepHours > 9) {
    add(TOPIC.sleep, "worth improving", t("Public guidance for adults often describes about 7 to 9 hours. Your note is outside that range."));
  } else {
    add(TOPIC.sleep, "potentially protective", t("Your reported hours sit inside the 7 to 9 hour adult range often described in public guidance."));
  }
  if (assessment.stress === "high") {
    add(TOPIC.stress, "discuss with a professional", stressNote(stressLabels[assessment.stress]));
  } else {
    add(TOPIC.stress, "monitor", stressNote(stressLabels[assessment.stress]));
  }
  if (assessment.social === "isolated") {
    add(TOPIC.social, "worth improving", reported(socialLabels[assessment.social]));
  } else {
    add(TOPIC.social, "potentially protective", reported(socialLabels[assessment.social]));
  }
  if (assessment.activityDays < 3) {
    add(TOPIC.movement, "worth improving", activity);
  } else {
    add(TOPIC.movement, "potentially protective", activity);
  }
  if (assessment.alcohol === "most-weeks") {
    add(TOPIC.alcohol, "discuss with a professional", reported(alcoholLabels[assessment.alcohol]));
  }
  if (assessment.bloodPressure || assessment.glucose || assessment.hba1c || assessment.cholesterol) {
    add(
      TOPIC.numbers,
      "monitor",
      t("Blood pressure, glucose, HbA1c, or cholesterol text is user-reported. lifeZoi did not measure it and does not turn it into a probability."),
    );
  }
  const missing: string[] = [];
  if (assessment.exactAge === null) missing.push(t("Exact age, only if you want the population table"));
  if (assessment.tableSex !== "female" && assessment.tableSex !== "male") {
    missing.push(t("Female or male column, only if you want the population table"));
  }
  if (!assessment.smoking) missing.push(t("Tobacco, if you want it included"));
  if (!assessment.fiber) missing.push(t("Fiber, if you want it included"));
  const opportunities = items
    .filter((item) => item.label === "worth improving" || item.label === "discuss with a professional")
    .map((item) => item.topic);
  return {
    modelNote,
    items,
    missing,
    opportunities: opportunities.length > 0 ? opportunities : [t("Keep a habit that already feels supportive.")],
    nextChapter: t("Pick one weekly action in My Life Improvement Plan. Disability or illness does not make a life less valuable."),
  };
}
