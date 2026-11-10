"use client";

import { useT } from "@/components/locale-provider";

const MARK = "\u0000";

/**
 * One line of a stats card, such as "<strong>40</strong> total points". The label is a
 * template with `{count}`, so each language can place the number where its grammar needs it
 * (for example "Балів загалом: 40") without plural endings that depend on the number.
 */
export function StatLine({ value, label }: { value: number; label: string }) {
  const t = useT();
  const [before = "", after = ""] = t(label, { count: MARK }).split(MARK);
  return (
    <p>
      {before}
      <strong>{value}</strong>
      {after}
    </p>
  );
}
