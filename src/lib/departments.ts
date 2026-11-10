/** Each section keeps the LifeZoi palette but gets its own accent. */
export type Department = "home" | "nutrition" | "yoga" | "movement" | "brain" | "wellness" | "sleep" | "progress" | "plan" | "reading";

const RULES: [RegExp, Department][] = [
  [/^\/(academy\/meals|food-plan|food-labels|sugar-detective|nutrition)/, "nutrition"],
  [/^\/academy\/move\/library/, "yoga"],
  [/^\/(academy\/move|balance-challenge)/, "movement"],
  [/^\/brain-quiz/, "brain"],
  [/^\/library\/(music|books)/, "reading"],
  [/^\/(library|academy)/, "reading"],
  [/^\/(breathe|emotional-wellness|wellness-coach|nature|urges|life-matters|ai-assistant|habit-transformation|habits|choices)/, "wellness"],
  [/^\/(progress|outlook)/, "progress"],
  [/^\/(plan|my-day|assessment|what-if|change-lab)/, "plan"],
];

export function departmentFor(pathname: string): Department {
  for (const [pattern, dept] of RULES) if (pattern.test(pathname)) return dept;
  return "home";
}
