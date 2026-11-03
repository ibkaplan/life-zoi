/**
 * Published figures copied from the SSA Period Life Table, 2023,
 * opened at https://www.ssa.gov/oact/STATS/table4c6.html on 2026-11-03.
 * Columns are the table’s female and male figures only. Ages outside this
 * list are not interpolated.
 */
export const SSA_LIFE_TABLE_URL = "https://www.ssa.gov/oact/STATS/table4c6.html";

export const SSA_TABLE_META = {
  name: "Period Life Table, 2023, as used in the 2026 Trustees Report",
  year: "2023",
  report: "2026 Trustees Report",
  population:
    "The Social Security area population: residents of the 50 states and the District of Columbia (adjusted for net census undercount); civilian residents of Puerto Rico, the Virgin Islands, Guam, American Samoa, and the Northern Mariana Islands; federal civilian employees and people in the U.S. Armed Forces abroad and their dependents; non-citizens living abroad who are insured for Social Security benefits; and all other U.S. citizens abroad.",
  assumptions: [
    "It is a period table: it uses 2023 mortality rates as if they continued.",
    "SSA defines the figure at an exact age for a person born on January 1.",
    "The published columns are female and male only.",
    "The table is not adjusted for smoking, illness, income, or habits.",
    "lifeZoi does not interpolate ages that are not copied here, and it has no validated personal model.",
  ],
} as const;

const ROWS: Record<number, { female: number; male: number }> = {
  18: { male: 58.56, female: 63.69 },
  19: { male: 57.62, female: 62.72 },
  20: { male: 56.69, female: 61.74 },
  25: { male: 52.06, female: 56.9 },
  30: { male: 47.5, female: 52.08 },
  35: { male: 43.02, female: 47.34 },
  40: { male: 38.59, female: 42.64 },
  45: { male: 34.21, female: 38.01 },
  50: { male: 29.9, female: 33.45 },
  55: { male: 25.73, female: 29.01 },
  60: { male: 21.79, female: 24.73 },
  65: { male: 18.12, female: 20.66 },
  70: { male: 14.66, female: 16.76 },
  75: { male: 11.42, female: 13.1 },
  80: { male: 8.5, female: 9.82 },
  85: { male: 6.04, female: 7.02 },
  90: { male: 4.11, female: 4.8 },
};

export function populationFigure(age: number, sex: "female" | "male") {
  const row = ROWS[age];
  if (!row) return null;
  return row[sex];
}

export const SSA_COPIED_AGES = Object.keys(ROWS).map(Number);
