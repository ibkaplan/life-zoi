import { populationFigure, SSA_LIFE_TABLE_URL, SSA_TABLE_META } from "@/lib/life-table";
import {
  alcoholLabels,
  smokingLabels,
  socialLabels,
  stressLabels,
  vegetableLabels,
} from "@/lib/labels";
import type { NormalizedAssessment } from "@/lib/types";

export const POPULATION_LABEL =
  "Population-based statistical estimate — not an individual prediction.";

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

export function populationBlock(assessment: NormalizedAssessment | null) {
  if (!assessment) {
    return {
      shown: false,
      text: "No completed assessment is available, so no population figure is shown.",
    };
  }
  const sex = assessment.tableSex === "female" || assessment.tableSex === "male" ? assessment.tableSex : null;
  const age = assessment.exactAge;
  const note = assessment.populationNote
    ? `You wrote this population note: “${assessment.populationNote}.” The table below is still only the Social Security area table, not a table for that note.`
    : "If you live outside the Social Security area population, this table is not your country’s table.";
  if (age === null || sex === null) {
    return {
      shown: false,
      text: `No figure is shown. The official table needs an exact age from 18 to 90 that was copied into lifeZoi, and the female or male column, because those are the published columns. Another sex, a skipped sex, or a missing age stays blank on purpose. Read the table at ${SSA_LIFE_TABLE_URL}. ${note}`,
    };
  }
  const figure = populationFigure(age, sex);
  if (figure === null) {
    return {
      shown: false,
      text: `Age ${age} is not one of the copied rows, and lifeZoi will not estimate a number in between. Open the official table: ${SSA_LIFE_TABLE_URL}. ${note}`,
    };
  }
  return {
    shown: true,
    text: `${POPULATION_LABEL} For the ${SSA_TABLE_META.population} the ${SSA_TABLE_META.name} publishes ${figure} at exact age ${age} in the ${sex} column. ${SSA_TABLE_META.assumptions.join(" ")} ${note} This is not your number and not a date.`,
  };
}

export function personalProfile(assessment: NormalizedAssessment | null): {
  modelNote: string;
  items: ProfileItem[];
  missing: string[];
  opportunities: string[];
  nextChapter: string;
} {
  const modelNote =
    "No validated prediction model is implemented. Labels below are qualitative readings of what you reported. A risk factor is not a diagnosis. An association is not a personal forecast.";
  if (!assessment) {
    return {
      modelNote,
      items: [],
      missing: ["A completed assessment"],
      opportunities: ["Finish the assessment when you want a profile."],
      nextChapter: "The next chapter can be one small habit, not a number.",
    };
  }
  const items: ProfileItem[] = [];
  const add = (topic: string, label: OutlookLabel, note: string) => {
    items.push({ topic, label, kind: "user-reported", note });
  };
  if (assessment.vegetables === "daily" || assessment.vegetables === "most-days") {
    add("Vegetables or fruit", "potentially protective", `You reported ${vegetableLabels[assessment.vegetables]}.`);
  } else {
    add("Vegetables or fruit", "worth improving", `You reported ${vegetableLabels[assessment.vegetables]}.`);
  }
  if (assessment.smoking === "daily" || assessment.smoking === "some-days") {
    add("Tobacco", "discuss with a professional", `You reported ${smokingLabels[assessment.smoking]}. lifeZoi does not recommend a medicine.`);
  } else if (assessment.smoking === "never" || assessment.smoking === "former") {
    add("Tobacco", "potentially protective", `You reported ${smokingLabels[assessment.smoking]}.`);
  }
  if (assessment.sleepHours < 7 || assessment.sleepHours > 9) {
    add("Sleep", "worth improving", "Public guidance for adults often describes about 7 to 9 hours. Your note is outside that range.");
  } else {
    add("Sleep", "potentially protective", "Your reported hours sit inside the 7 to 9 hour adult range often described in public guidance.");
  }
  if (assessment.stress === "high") {
    add("Stress", "discuss with a professional", `You described stress as ${stressLabels[assessment.stress]}.`);
  } else {
    add("Stress", "monitor", `You described stress as ${stressLabels[assessment.stress]}.`);
  }
  if (assessment.social === "isolated") {
    add("Social connection", "worth improving", `You reported ${socialLabels[assessment.social]}.`);
  } else {
    add("Social connection", "potentially protective", `You reported ${socialLabels[assessment.social]}.`);
  }
  if (assessment.activityDays < 3) {
    add("Movement", "worth improving", `You reported activity on ${assessment.activityDays} days.`);
  } else {
    add("Movement", "potentially protective", `You reported activity on ${assessment.activityDays} days.`);
  }
  if (assessment.alcohol === "most-weeks") {
    add("Alcohol", "discuss with a professional", `You reported ${alcoholLabels[assessment.alcohol]}.`);
  }
  if (assessment.bloodPressure || assessment.glucose || assessment.hba1c || assessment.cholesterol) {
    add(
      "Numbers you typed",
      "monitor",
      "Blood pressure, glucose, HbA1c, or cholesterol text is user-reported. lifeZoi did not measure it and does not turn it into a probability.",
    );
  }
  const missing: string[] = [];
  if (assessment.exactAge === null) missing.push("Exact age, only if you want the population table");
  if (assessment.tableSex !== "female" && assessment.tableSex !== "male") {
    missing.push("Female or male column, only if you want the population table");
  }
  if (!assessment.smoking) missing.push("Tobacco, if you want it included");
  if (!assessment.fiber) missing.push("Fiber, if you want it included");
  const opportunities = items
    .filter((item) => item.label === "worth improving" || item.label === "discuss with a professional")
    .map((item) => item.topic);
  return {
    modelNote,
    items,
    missing,
    opportunities: opportunities.length > 0 ? opportunities : ["Keep a habit that already feels supportive."],
    nextChapter: "Pick one weekly action in My Life Improvement Plan. Disability or illness does not make a life less valuable.",
  };
}
