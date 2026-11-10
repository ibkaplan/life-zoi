"use client";

import Link from "next/link";
import { commitCompanion } from "@/lib/companion/store";
import {
  CARE_SYMPTOMS,
  CYCLE_PHASES,
  emptyWomensCare,
  LIFE_STAGES,
  type CareSymptom,
  type CyclePhase,
  type LifeStage,
  type WomensCarePrefs,
} from "@/lib/companion/state";
import {
  careSymptomLabels,
  cyclePhaseLabels,
  focusLabels,
  lifeStageLabels,
  womensCareActive,
  WOMENS_CARE_MESSAGE,
  WOMENS_CARE_NOT_MEDICAL,
  WOMENS_CARE_PRIVACY,
  WOMENS_CARE_SHARE_CARE,
  WOMENS_CARE_TAKE_CARE,
  WOMENS_CARE_TITLE,
  type WomensCareAdaptation,
} from "@/lib/companion/womens-care";
import { SHARE_HEADING } from "@/lib/share-care";
import { localISODate } from "@/lib/dates";
import type { MealSlot } from "@/lib/food-plan/types";
import { useT } from "@/components/locale-provider";
import { msg } from "@/lib/i18n/translate";

const SLOT_NAME: Record<MealSlot, string> = { breakfast: msg("Breakfast"), lunch: msg("Lunch"), dinner: msg("Dinner"), snack: msg("Snack") };

function saveCare(patch: Partial<WomensCarePrefs>) {
  commitCompanion((state) => ({ ...state, womensCare: { ...state.womensCare, ...patch, updatedOn: localISODate() } }));
}

/** The person's own answers. Nothing is pre-filled or guessed. */
export function WomensCareSettings({ care, sample }: { care: WomensCarePrefs; sample: boolean }) {
  const active = womensCareActive(care);
  const t = useT();
  return (
    <div className="stack">
      <fieldset className="field">
        <legend>{t("Is Women's Care for you?")}</legend>
        <p className="hint">{t("This part is optional. LifeZoi only adapts your meals after you tick both boxes.")} {t(WOMENS_CARE_PRIVACY)}</p>
        <label className="check-row">
          <input type="checkbox" checked={care.identifiesAsWoman} disabled={sample} onChange={(event) => saveCare({ identifiesAsWoman: event.target.checked })} />
          <span>{t("I identify as a woman")}</span>
        </label>
        <label className="check-row">
          <input type="checkbox" checked={care.relevant} disabled={sample} onChange={(event) => saveCare({ relevant: event.target.checked })} />
          <span>{t("Nutrition for my menstrual cycle, perimenopause, or menopause is relevant to me")}</span>
        </label>
      </fieldset>
      {active ? (
        <>
          <fieldset className="field">
            <legend>{t("Where are you now?")}</legend>
            <div className="check-grid">
              {LIFE_STAGES.map((stage) => (
                <label key={stage} className="check-row">
                  <input type="radio" name="wc-stage" checked={care.stage === stage} disabled={sample} onChange={() => saveCare({ stage: stage as LifeStage, phase: stage === "cycle" ? care.phase : "" })} />
                  <span>{t(lifeStageLabels[stage])}</span>
                </label>
              ))}
            </div>
          </fieldset>
          {care.stage === "cycle" ? (
            <label className="field">
              <span>{t("Where are you in your cycle?")}</span>
              <select value={care.phase} disabled={sample} onChange={(event) => saveCare({ phase: event.target.value as CyclePhase | "" })}>
                <option value="">{t("Prefer not to say")}</option>
                {CYCLE_PHASES.map((phase) => (
                  <option key={phase} value={phase}>
                    {t(cyclePhaseLabels[phase])}
                  </option>
                ))}
              </select>
              <span className="hint">{t("You can change this any day. LifeZoi does not track or predict your cycle.")}</span>
            </label>
          ) : null}
          <fieldset className="field">
            <legend>{t("How are you feeling lately? (optional)")}</legend>
            <div className="check-grid">
              {CARE_SYMPTOMS.map((symptom) => (
                <label key={symptom} className="check-row">
                  <input
                    type="checkbox"
                    checked={care.symptoms.includes(symptom)}
                    disabled={sample}
                    onChange={(event) =>
                      saveCare({ symptoms: event.target.checked ? [...care.symptoms, symptom] : care.symptoms.filter((item: CareSymptom) => item !== symptom) })
                    }
                  />
                  <span>{t(careSymptomLabels[symptom])}</span>
                </label>
              ))}
              <label className="check-row">
                <input type="checkbox" checked={care.ironConcern} disabled={sample} onChange={(event) => saveCare({ ironConcern: event.target.checked })} />
                <span>{t("I am worried about low iron")}</span>
              </label>
            </div>
          </fieldset>
          {!sample ? (
            <p>
              <button type="button" className="btn btn-ghost" onClick={() => commitCompanion((state) => ({ ...state, womensCare: emptyWomensCare() }))}>
                {t("Turn off Women's Care and clear these answers")}
              </button>
            </p>
          ) : null}
        </>
      ) : null}
      {sample ? <p className="hint">{t("Sample data is on, so these answers are not saved.")}</p> : null}
    </div>
  );
}

function Header() {
  const t = useT();
  return (
    <header className="wc-head">
      <p className="kicker">{t("Food & Wellness")}</p>
      <h2>{t(WOMENS_CARE_TITLE)}</h2>
      <p className="wc-message">{t(WOMENS_CARE_MESSAGE)}</p>
    </header>
  );
}

function CareFooter() {
  const t = useT();
  return (
    <div className="wc-care-footer">
      <p>
        <strong>{t("Take Care.")}</strong> {t(WOMENS_CARE_TAKE_CARE)}
      </p>
      <p>
        <strong>{t(SHARE_HEADING)}.</strong> {t(WOMENS_CARE_SHARE_CARE)} <Link href="/share-the-care">{t(SHARE_HEADING)}</Link>
      </p>
    </div>
  );
}

/** The highlighted Women's Care section inside today's meal plan. */
export function WomensCareSection({ care, adaptation, sample }: { care: WomensCarePrefs; adaptation: WomensCareAdaptation | null; sample: boolean }) {
  const t = useT();
  if (!adaptation) {
    return (
      <section className="wc-care stack" aria-labelledby="wc-title">
        <Header />
        <details>
          <summary id="wc-title">{t("Turn on Women's Care for your meal plan")}</summary>
          <div className="stack">
            <p>
              {t(
                "If it fits you, LifeZoi can adapt today's meals to your cycle phase, perimenopause, or menopause, with iron-rich foods, satisfying options for cravings, and healthy desserts. Your allergies, requirements, and the foods you avoid still apply to every idea.",
              )}
            </p>
            <WomensCareSettings care={care} sample={sample} />
          </div>
        </details>
      </section>
    );
  }
  const stageText = care.stage ? t(care.stage === "cycle" && care.phase ? cyclePhaseLabels[care.phase] : lifeStageLabels[care.stage]) : t("Tell us where you are to tailor this further");
  return (
    <section className="wc-care stack" aria-labelledby="wc-title-on">
      <Header />
      <p className="wc-stage" id="wc-title-on">
        {t("Today: {stage}", { stage: stageText })}
      </p>
      {adaptation.clinician.length > 0 && adaptation.urgent ? (
        <div className="alert" role="note">
          {adaptation.clinician.map((line) => (
            <p key={line}>{t(line)}</p>
          ))}
        </div>
      ) : null}
      {adaptation.highlights.length > 0 ? (
        <div className="stack">
          <h3>{t("How your meals changed today")}</h3>
          <ul>
            {adaptation.highlights.map((item) => (
              <li key={item.slot}>
                <strong>{t(SLOT_NAME[item.slot])}:</strong> {t(item.recipe.name)} <span className="hint">({item.focus.map((id) => t(focusLabels[id])).join(" · ")})</span>
              </li>
            ))}
          </ul>
          <p className="hint">{t("Women's Care only reorders ideas that already passed your allergy, requirement, and exclusion checks.")}</p>
        </div>
      ) : null}
      <div className="wc-grid">
        {adaptation.focus.map((item) => (
          <div key={item.id} className="wc-focus">
            <h3>{t(item.label)}</h3>
            <p>{t(item.why)}</p>
            <p className="hint">{t("For example: {list}.", { list: item.examples.map((example) => t(example)).join("; ") })}</p>
          </div>
        ))}
      </div>
      <div className="stack">
        <h3>{t("Satisfying options")}</h3>
        <p>
          {t("Cravings are normal, and you deserve food that feels good.")}{" "}
          {adaptation.plantOnly ? t("Here are hearty plant-based meals from today's ideas.") : t("Here are hearty meals from today's ideas, including meat and fish where you eat them.")}
        </p>
        {adaptation.hearty.length > 0 ? (
          <ul>
            {adaptation.hearty.map(({ recipe, swaps }) => (
              <li key={recipe.id}>
                {t(recipe.name)} <span className="hint">({t(SLOT_NAME[recipe.slot])}{swaps.length > 0 ? `, ${swaps.map((swap) => t(swap)).join(" ")}` : ""})</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="hint">{t("No hearty idea passes all of your checks today.")}</p>
        )}
        <h3>{t("Healthy desserts")}</h3>
        {adaptation.desserts.length > 0 ? (
          <ul>
            {adaptation.desserts.map(({ recipe }) => (
              <li key={recipe.id}>
                <strong>{t(recipe.name)}</strong>: {t(recipe.summary)}
              </li>
            ))}
          </ul>
        ) : (
          <p className="hint">{t("No dessert idea in the LifeZoi list passes all of your checks. That is better than showing something unsafe.")}</p>
        )}
      </div>
      {adaptation.tips.length > 0 ? (
        <div className="stack">
          <h3>{t("Gentle ideas for how you feel")}</h3>
          <ul>
            {adaptation.tips.map((tip) => (
              <li key={tip}>{t(tip)}</li>
            ))}
          </ul>
        </div>
      ) : null}
      {!adaptation.urgent ? (
        <p className="hint">
          {adaptation.clinician.map((line) => t(line)).join(" ")}
        </p>
      ) : null}
      <p className="hint">{t(WOMENS_CARE_NOT_MEDICAL)}</p>
      <details>
        <summary>{t("Change my Women's Care answers")}</summary>
        <WomensCareSettings care={care} sample={sample} />
      </details>
      <CareFooter />
    </section>
  );
}
