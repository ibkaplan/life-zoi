/**
 * Simple drawn illustrations for the movement-break feature. Inline SVG only:
 * no images, video, or outside services. Animations stop when the person
 * prefers reduced motion (see .mb-anim rules in globals.css).
 */

import { useId } from "react";
import { useLocale, useT } from "@/components/locale-provider";
import { msg } from "@/lib/i18n/translate";

/** Step names for the figure labels, as in the routine. */
const STEP_TITLE: Record<string, string> = {
  stand: msg("Stand up"),
  walk: msg("Walk"),
  heels: msg("Heel raises"),
  ankles: msg("Ankle movements"),
  breathe: msg("Breathing"),
  return: msg("Return to work"),
};

const ARTERY = "#C2412D";
const VEIN = "#2F5FA8";
const LYMPH = "#2F8F5A";
const SKIN = "#F3DCC8";
const INK = "#172554";
const MUSCLE = "#C9755B";

function Arrow({ x, y, rotate, color }: { x: number; y: number; rotate: number; color: string }) {
  return <path d="M -6 4 L 0 -6 L 6 4 Z" fill={color} transform={`translate(${x} ${y}) rotate(${rotate})`} />;
}

/** Cardiovascular and lymphatic systems side by side on one body outline. */
export function BodySystemsArt() {
  const uid = useId();
  const t = useT();
  return (
    <svg viewBox="0 0 320 300" className="mb-art" role="img" aria-labelledby={`${uid}-t ${uid}-d`}>
      <title id={`${uid}-t`}>{t("The cardiovascular and lymphatic systems")}</title>
      <desc id={`${uid}-d`}>
        {t(
          "A body outline with the heart in the chest. Red arteries carry blood from the heart down to the legs, blue veins carry it back up. Green lymph vessels collect fluid from the tissues and join the blood near the heart.",
        )}
      </desc>
      {/* body outline */}
      <g fill={SKIN} stroke={INK} strokeWidth="2">
        <circle cx="160" cy="34" r="22" />
        <path d="M120 64 Q160 56 200 64 L214 150 L196 152 L190 108 L186 180 L196 286 L170 286 L160 196 L150 286 L124 286 L134 180 L130 108 L124 152 L106 150 Z" />
      </g>
      {/* heart */}
      <path d="M160 108 C150 96 136 104 144 116 L160 130 L176 116 C184 104 170 96 160 108 Z" fill={ARTERY} stroke={INK} strokeWidth="1.5" />
      {/* artery: down the left leg */}
      <path d="M154 126 L148 186 L142 278" fill="none" stroke={ARTERY} strokeWidth="5" strokeLinecap="round" />
      <Arrow x={146} y={220} rotate={180} color={ARTERY} />
      {/* vein: up the right leg */}
      <path d="M180 278 L172 186 L166 126" fill="none" stroke={VEIN} strokeWidth="5" strokeLinecap="round" className="mb-flow" />
      <Arrow x={175} y={220} rotate={0} color={VEIN} />
      {/* lymph: dotted vessels with nodes, joining near the collarbone */}
      <g fill="none" stroke={LYMPH} strokeWidth="3" strokeDasharray="2 6" strokeLinecap="round">
        <path d="M128 270 L136 190 L140 120 L148 80" />
        <path d="M190 270 L184 190 L180 120 L172 80" />
      </g>
      <g fill={LYMPH}>
        <circle cx="137" cy="186" r="5" />
        <circle cx="183" cy="186" r="5" />
        <circle cx="142" cy="100" r="5" />
        <circle cx="178" cy="100" r="5" />
        <circle cx="160" cy="78" r="6" />
      </g>
      {/* legend */}
      <g fontSize="12" fill={INK} fontFamily="inherit">
        <rect x="222" y="40" width="14" height="6" fill={ARTERY} />
        <text x="242" y="47">{t("Arteries: out")}</text>
        <rect x="222" y="62" width="14" height="6" fill={VEIN} />
        <text x="242" y="69">{t("Veins: back")}</text>
        <circle cx="229" cy="88" r="5" fill={LYMPH} />
        <text x="242" y="92">{t("Lymph")}</text>
        <text x="8" y="47">{t("Heart pumps")}</text>
        <text x="8" y="62">{t("blood out")}</text>
        <text x="8" y="250">{t("Leg muscles")}</text>
        <text x="8" y="265">{t("help the")}</text>
        <text x="8" y="280">{t("return trip")}</text>
      </g>
    </svg>
  );
}

/**
 * The lower leg with the calf muscle, a deep vein, and two one-way valves.
 * With `animate`, the calf tightens and relaxes and the blood moves upward.
 */
export function CalfPumpArt({ squeeze = false, animate = false }: { squeeze?: boolean; animate?: boolean }) {
  const uid = useId();
  const cls = `mb-art mb-calf${animate ? " mb-anim" : ""}${squeeze ? " is-squeeze" : ""}`;
  const t = useT();
  return (
    <svg viewBox="0 0 320 300" className={cls} role="img" aria-labelledby={`${uid}-t ${uid}-d`}>
      <title id={`${uid}-t`}>{t("The calf muscle pump")}</title>
      <desc id={`${uid}-d`}>
        {t(
          "A lower leg seen from the side. The calf muscle lies at the back. A vein runs up through the leg with two small one-way valves. When the calf tightens it presses the vein and pushes blood upward toward the heart. The valve below closes so blood does not fall back.",
        )}
      </desc>
      {/* leg outline */}
      <path d="M120 20 L190 20 L196 120 Q206 180 186 236 L192 262 L250 270 Q262 284 246 290 L132 290 L134 236 Q118 170 120 20 Z" fill={SKIN} stroke={INK} strokeWidth="2" />
      {/* calf muscle */}
      <ellipse className="mb-calf-muscle" cx="186" cy="150" rx="18" ry="62" fill={MUSCLE} stroke={INK} strokeWidth="1.5" />
      {/* vein */}
      <path d="M160 270 L160 20" stroke={VEIN} strokeWidth="12" strokeLinecap="round" />
      {/* blood drops moving up */}
      <g className="mb-drops" fill="#9FC0F0">
        <circle cx="160" cy="230" r="3.5" />
        <circle cx="160" cy="170" r="3.5" />
        <circle cx="160" cy="110" r="3.5" />
        <circle cx="160" cy="50" r="3.5" />
      </g>
      {/* valves */}
      <g stroke="#fff" strokeWidth="2.5" fill="none" strokeLinecap="round">
        <path d="M154 206 L160 196 L166 206" />
        <path d="M154 96 L160 86 L166 96" />
      </g>
      {/* arrow toward the heart */}
      <path d="M232 120 L232 40" stroke={VEIN} strokeWidth="4" />
      <Arrow x={232} y={38} rotate={0} color={VEIN} />
      <g fontSize="12" fill={INK} fontFamily="inherit">
        <text x="240" y="60">{t("To the")}</text>
        <text x="240" y="75">{t("heart")}</text>
        <text x="8" y="100">{t("Vein valve")}</text>
        <path d="M70 96 L150 92" stroke={INK} strokeWidth="1" />
        <text x="8" y="160">{t("Calf muscle")}</text>
        <path d="M78 156 L168 152" stroke={INK} strokeWidth="1" />
        <text x="8" y="210">{t("Vein valve")}</text>
        <path d="M70 206 L150 202" stroke={INK} strokeWidth="1" />
      </g>
    </svg>
  );
}

/** A person sitting at a desk with a 30-minute clock. */
export function DeskSitterArt() {
  const t = useT();
  return (
    <svg viewBox="0 0 240 160" className="mb-art mb-art-sm" role="img" aria-label={t("A person sitting at a desk with a clock showing 30 minutes")}>
      <rect x="120" y="70" width="100" height="8" rx="2" fill="#8457C2" />
      <rect x="200" y="78" width="6" height="70" fill="#8457C2" />
      <rect x="150" y="44" width="40" height="26" rx="3" fill={INK} />
      <circle cx="78" cy="40" r="14" fill={SKIN} stroke={INK} strokeWidth="2" />
      <path d="M78 54 L82 100 L120 100 L122 148" fill="none" stroke={INK} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M80 70 L126 74" stroke={INK} strokeWidth="5" strokeLinecap="round" />
      <rect x="50" y="100" width="44" height="8" rx="2" fill="#A8BFAE" />
      <rect x="60" y="108" width="6" height="40" fill="#A8BFAE" />
      <circle cx="40" cy="30" r="22" fill="#fff" stroke="#F2B65D" strokeWidth="4" />
      <path d="M40 30 L40 14 M40 30 L40 46" stroke={INK} strokeWidth="2.5" strokeLinecap="round" />
      <text x="40" y="66" textAnchor="middle" fontSize="12" fill={INK} fontWeight="700">
        {t("{minutes} min", { minutes: 30 })}
      </text>
    </svg>
  );
}

/** One figure per routine step. `seated` swaps to the chair version. */
export function StepArt({ step, seated, animate }: { step: "stand" | "walk" | "heels" | "ankles" | "breathe" | "return"; seated: boolean; animate: boolean }) {
  const cls = `mb-art mb-step mb-step-${step}${seated ? " is-seated" : ""}${animate ? " mb-anim" : ""}`;
  const t = useT();
  const { locale } = useLocale();
  // English keeps the step id as before; other languages name the step.
  const name = locale === "en" ? step : t(STEP_TITLE[step] ?? step);
  const label = seated ? t("Seated figure: {step}", { step: name }) : t("Standing figure: {step}", { step: name });
  return (
    <svg viewBox="0 0 200 200" className={cls} role="img" aria-label={label}>
      <rect x="0" y="186" width="200" height="4" fill="#DDD4F2" />
      {seated || step === "heels" ? (
        <g fill="#A8BFAE">
          {/* chair or support */}
          {seated ? (
            <>
              <rect x="56" y="118" width="54" height="8" rx="2" />
              <rect x="58" y="126" width="6" height="60" />
              <rect x="102" y="126" width="6" height="60" />
              <rect x="56" y="60" width="6" height="64" />
            </>
          ) : (
            <>
              <rect x="128" y="96" width="50" height="8" rx="2" />
              <rect x="170" y="104" width="6" height="82" />
              <rect x="128" y="40" width="6" height="64" />
            </>
          )}
        </g>
      ) : null}
      <g className="mb-figure" stroke={INK} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" fill="none">
        {seated ? (
          <>
            <circle cx="88" cy="44" r="14" fill={SKIN} strokeWidth="2.5" />
            <path d="M88 58 L88 116 L130 118" />
            <path className="mb-shin" d="M130 118 L132 180" />
            <path className="mb-foot" d="M132 180 L150 182" />
            <path d="M88 76 L116 98" />
          </>
        ) : (
          <>
            <circle cx="100" cy="30" r="14" fill={SKIN} strokeWidth="2.5" />
            <path d="M100 44 L100 112" />
            <path className="mb-leg-a" d="M100 112 L88 178" />
            <path className="mb-leg-b" d="M100 112 L112 178" />
            <path className="mb-arm-a" d="M100 62 L80 96" />
            <path className="mb-arm-b" d={step === "heels" ? "M100 62 L130 96" : "M100 62 L120 96"} />
          </>
        )}
      </g>
      {step === "breathe" ? <circle className="mb-breath-ring" cx={seated ? 88 : 100} cy={seated ? 90 : 80} r="18" fill="none" stroke={LYMPH} strokeWidth="3" /> : null}
    </svg>
  );
}

