"use client";

import Link from "next/link";
import "@/components/journey/journey.css";
import { usePageFormat } from "@/components/page-format";
import type { PlanItem } from "@/lib/journey";

/** The personal plan as cards. Each card says what to do, why, and opens the page to do it. */
export function PlanItems({ items }: { items: PlanItem[] }) {
  const { t } = usePageFormat();
  return (
    <ol className="jr-plan">
      {items.map((item, index) => (
        <li key={item.id} className="jr-plan-item" data-area={item.id}>
          <span className="jr-plan-number" aria-hidden="true">
            {index + 1}
          </span>
          <div className="jr-plan-body">
            <p className="jr-plan-area">{t(item.area)}</p>
            <p className="jr-plan-action">{t(item.action)}</p>
            <p className="jr-plan-why">{t(item.why)}</p>
            <Link className="btn btn-primary jr-plan-go" href={item.href}>
              {t(item.cta)} <span aria-hidden="true">→</span>
            </Link>
          </div>
        </li>
      ))}
    </ol>
  );
}
