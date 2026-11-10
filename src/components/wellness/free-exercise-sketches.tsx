"use client";

import { useT } from "@/components/locale-provider";
import { msg } from "@/lib/i18n/translate";
import type { SketchKind } from "@/lib/wellness/exercise-resources/routines";

const labels: Record<SketchKind, string> = {
  chair: msg("Simple original drawing of a person seated and lifting one foot."),
  morning: msg("Simple original drawing of a seated person lifting one arm in the morning."),
  balance: msg("Simple original drawing of a person holding a chair while standing."),
  hands: msg("Simple original drawing of two open hands."),
  feet: msg("Simple original drawing of two feet and ankles."),
  strength: msg("Simple original drawing of a seated arm raise beside a wall."),
};

export function RoutineSketch({ kind }: { kind: SketchKind }) {
  const t = useT();
  return (
    <svg className="free-sketch" viewBox="0 0 320 180" role="img" aria-label={t(labels[kind])}>
      <rect width="320" height="180" rx="24" fill="#EFE5FA" />
      <circle cx="40" cy="28" r="10" fill="#F3ECFB" />
      <circle cx="150" cy="36" r="16" fill="#172554" />
      <path d="M150 52 v46" stroke="#172554" strokeWidth="6" strokeLinecap="round" />
      {kind === "chair" ? (
        <>
          <path d="M118 128 h70 M132 98 v30 M196 78 v52" stroke="#52288A" strokeWidth="6" strokeLinecap="round" />
          <path d="M150 78 h28 M150 98 l-22 28 M150 98 l26 8" stroke="#23706A" strokeWidth="6" strokeLinecap="round" />
        </>
      ) : null}
      {kind === "morning" ? (
        <>
          <path d="M150 78 l26 -28 M150 98 v30 M150 98 l-18 26" stroke="#23706A" strokeWidth="6" strokeLinecap="round" />
          <circle cx="248" cy="42" r="16" fill="#23706A" />
        </>
      ) : null}
      {kind === "balance" ? (
        <>
          <path d="M210 40 v110" stroke="#52288A" strokeWidth="6" strokeLinecap="round" />
          <path d="M196 78 h28" stroke="#52288A" strokeWidth="6" strokeLinecap="round" />
          <path d="M150 70 h46 M150 98 l-8 34 M142 132 h18 M150 98 l16 30" stroke="#23706A" strokeWidth="6" strokeLinecap="round" />
        </>
      ) : null}
      {kind === "hands" ? (
        <>
          <path d="M70 110 h36 M78 92 v28 M88 88 v30 M98 90 v30 M108 96 v24" stroke="#23706A" strokeWidth="5" strokeLinecap="round" />
          <path d="M190 110 h36 M198 92 v28 M208 88 v30 M218 90 v30 M228 96 v24" stroke="#52288A" strokeWidth="5" strokeLinecap="round" />
        </>
      ) : null}
      {kind === "feet" ? (
        <>
          <path d="M150 98 v18" stroke="#172554" strokeWidth="6" strokeLinecap="round" />
          <ellipse cx="132" cy="132" rx="22" ry="12" fill="#23706A" />
          <ellipse cx="186" cy="132" rx="22" ry="12" fill="#52288A" />
          <path d="M132 112 v12 M186 112 v12" stroke="#172554" strokeWidth="5" strokeLinecap="round" />
        </>
      ) : null}
      {kind === "strength" ? (
        <>
          <path d="M248 36 v112" stroke="#52288A" strokeWidth="8" strokeLinecap="round" />
          <path d="M150 78 l8 -30 M150 98 v32 M150 98 l-16 28" stroke="#23706A" strokeWidth="6" strokeLinecap="round" />
          <path d="M118 130 h40" stroke="#52288A" strokeWidth="6" strokeLinecap="round" />
        </>
      ) : null}
    </svg>
  );
}
