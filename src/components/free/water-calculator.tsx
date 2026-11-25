"use client";

import { useId, useState } from "react";
import { useT } from "@/components/locale-provider";
import { glasses, GLASS_ML, WATER_NASEM, type WaterGroup } from "@/lib/free/calculators";
import { FREE_SOURCES } from "@/lib/free/sources";
import { msg } from "@/lib/i18n/translate";
import { FreeFrame } from "./free-frame";

const GROUPS: readonly { key: WaterGroup; label: string }[] = [
  { key: "female", label: msg("A woman") },
  { key: "male", label: msg("A man") },
  { key: "pregnant", label: msg("Pregnant") },
  { key: "breastfeeding", label: msg("Breastfeeding") },
];

export function WaterCalculator() {
  const t = useT();
  const id = useId();
  const [group, setGroup] = useState<WaterGroup>("female");
  const amount = WATER_NASEM[group];
  const litres = (n: number) => n.toLocaleString(undefined, { maximumFractionDigits: 1 });

  return (
    <FreeFrame
      href="/free/water-calculator"
      kicker={msg("Free calculator")}
      title={msg("Water intake guide")}
      lead={msg("How much water adults usually need in a day, according to the U.S. National Academies, shown in litres and in glasses.")}
      sources={[FREE_SOURCES.nasemWater, FREE_SOURCES.cdcWater]}
    >
      <div className="card free-form">
        <fieldset className="free-segment">
          <legend>{t("I am")}</legend>
          {GROUPS.map((option) => (
            <label key={option.key}>
              <input type="radio" name={`${id}-group`} checked={group === option.key} onChange={() => setGroup(option.key)} />
              {t(option.label)}
            </label>
          ))}
        </fieldset>
        <p className="hint">{t("For adults 19 and older.")}</p>
      </div>
      <section className="free-result" aria-live="polite">
        <h2>{t("A usual day")}</h2>
        <p className="free-big">
          {t("about {litres} litres", { litres: litres(amount.drinks) })} <small>{t("from drinks, about {glasses} glasses of {ml} ml", { glasses: glasses(amount.drinks), ml: GLASS_ML })}</small>
        </p>
        <p>
          {t("About {total} litres of water a day in total, counting water from food. Plain water, tea, coffee, milk, and soup all count.", {
            total: litres(amount.total),
          })}
        </p>
        <p className="hint">{t("These are the amounts most healthy people drink, not a strict rule. Thirst is a good guide for most people.")}</p>
      </section>
      <section className="card stack">
        <h2>{t("When you may need more, or less")}</h2>
        <ul>
          <li>{t("More in hot or humid weather, and when you exercise or work hard and sweat.")}</li>
          <li>{t("More when you have a fever, vomiting, or diarrhea.")}</li>
          <li>{t("Less, or a fixed amount, if your doctor has told you to limit fluids, for example for some heart or kidney conditions. Follow your doctor's advice.")}</li>
          <li>{t("Water is the best everyday choice. Drinks with added sugar add calories without filling you up.")}</li>
        </ul>
      </section>
    </FreeFrame>
  );
}
