"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { storageLine, useFoodPlan } from "@/components/food-plan/use-food-plan";

const LINKS = [
  ["/food-plan", "Overview"],
  ["/food-plan/today", "Today's meals"],
  ["/food-plan/preferences", "My food choices"],
  ["/food-plan/seasonal", "Seasonal"],
  ["/food-plan/modern", "Modern"],
  ["/food-plan/ayurveda", "Ayurveda"],
  ["/food-plan/profile", "Profile"],
  ["/food-plan/week", "Week"],
  ["/food-plan/favorites", "Favorites"],
  ["/food-plan/shopping", "Shopping"],
  ["/food-plan/progress", "Progress"],
  ["/food-plan/spices", "Spices"],
  ["/food-plan/science", "Science"],
  ["/food-plan/protein", "Protein"],
  ["/food-plan/simple", "Simple meals"],
] as const;

export function FoodMark({ label }: { label: string }) {
  return (
    <svg className="food-mark" viewBox="0 0 64 64" role="img" aria-hidden={label ? undefined : true} aria-label={label || undefined}>
      <rect width="64" height="64" rx="16" fill="#f4efe4" />
      <circle cx="32" cy="34" r="14" fill="#d7ebdd" stroke="#2f6b4f" strokeWidth="2" />
      <path d="M32 14c2 6 2 10 0 16" fill="none" stroke="#2f6b4f" strokeWidth="2" />
      <path d="M24 28c6 2 10 2 16 0" fill="none" stroke="#6A3DA8" strokeWidth="2" />
    </svg>
  );
}

export function FoodFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { phase, sample } = useFoodPlan();
  return (
    <div className="stack-lg">
      <nav className="food-nav" aria-label="Food and wellness">
        {LINKS.map(([href, label]) => {
          const current = href === "/food-plan" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link key={href} href={href} aria-current={current ? "page" : undefined}>
              {label}
            </Link>
          );
        })}
      </nav>
      <p className="hint">{storageLine(phase)}</p>
      {sample ? <p className="hint">Sample data is read-only.</p> : null}
      {children}
    </div>
  );
}

export function FoodNumbers({
  kcal,
  protein,
  fiber,
  sat,
  sodium,
}: {
  kcal: number;
  protein: number;
  fiber: number | null;
  sat: number | null;
  sodium?: number | null;
}) {
  return (
    <dl className="food-numbers">
      <div>
        <dt>Protein</dt>
        <dd>{protein.toFixed(1)} g</dd>
      </div>
      <div>
        <dt>Calories</dt>
        <dd>{kcal.toFixed(1)} kcal</dd>
      </div>
      <div>
        <dt>Saturated fat</dt>
        <dd>{sat === null ? "Not reported" : `${sat.toFixed(1)} g`}</dd>
      </div>
      <div>
        <dt>Fiber</dt>
        <dd>{fiber === null ? "Not reported" : `${fiber.toFixed(1)} g`}</dd>
      </div>
      {sodium !== undefined ? (
        <div>
          <dt>Sodium</dt>
          <dd>{sodium === null ? "Not reported" : `${Math.round(sodium)} mg`}</dd>
        </div>
      ) : null}
    </dl>
  );
}
