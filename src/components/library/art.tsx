"use client";

import { useT } from "@/components/locale-provider";
import { msg } from "@/lib/i18n/translate";
import type { ArtName } from "@/lib/library/catalog";
import type { SketchKind } from "@/lib/library/movement";

export function LibraryArt({ name, label }: { name: ArtName; label: string }) {
  return (
    <svg className="library-art" viewBox="0 0 320 180" role="img" aria-label={label}>
      <rect width="320" height="180" rx="24" fill="#EFE5FA" />
      <rect x="0" y="120" width="320" height="60" fill="#F3ECFB" />
      {name === "bowl" ? <Bowl /> : null}
      {name === "gut" ? <Gut /> : null}
      {name === "label" ? <Label /> : null}
      {name === "bread" ? <Bread /> : null}
      {name === "walk" ? <Walk /> : null}
      {name === "chair" ? <Chair /> : null}
      {name === "balance" ? <Balance /> : null}
      {name === "mind" ? <Mind /> : null}
      {name === "moon" ? <Moon /> : null}
      {name === "tree" ? <Tree /> : null}
      {name === "path" ? <Path /> : null}
      {name === "calendar" ? <Calendar /> : null}
      {name === "breath" ? <Breath /> : null}
      {name === "leaf" ? <Leaf /> : null}
    </svg>
  );
}

function Bowl() {
  return <path d="M90 100 h140 q-10 46 -70 46 q-60 0 -70 -46z" fill="#6A3DA8" />;
}

function Gut() {
  return <path d="M150 48c30 10 40 40 10 60c-20 14 -8 36 18 42" fill="none" stroke="#52288A" strokeWidth="10" strokeLinecap="round" />;
}

function Label() {
  return <rect x="118" y="42" width="84" height="100" rx="8" fill="#F9F7F2" stroke="#52288A" strokeWidth="4" />;
}

function Bread() {
  return <path d="M80 110c20-40 140-40 160 0v28H80z" fill="#6A3DA8" />;
}

function Walk() {
  return (
    <path d="M150 48 a14 14 0 1 0 0.1 0 M150 64 v36 M150 100 l-22 36 M150 100 l24 32 M150 78 l26 12" fill="#6A3DA8" stroke="#52288A" strokeWidth="6" strokeLinecap="round" />
  );
}

function Chair() {
  return <path d="M120 70 h70 v50 h-70z M120 120 h90 M110 70 v60" fill="none" stroke="#52288A" strokeWidth="8" strokeLinecap="round" />;
}

function Balance() {
  return <path d="M150 46 a12 12 0 1 0 0.1 0 M150 60 v40 M150 100 l-8 40 M142 140 h28 M210 40 v110" fill="none" stroke="#52288A" strokeWidth="6" strokeLinecap="round" />;
}

function Mind() {
  return <circle cx="160" cy="86" r="36" fill="none" stroke="#6A3DA8" strokeWidth="8" />;
}

function Moon() {
  return <path d="M180 46 a40 40 0 1 0 0 80 a28 28 0 1 1 0 -80z" fill="#6A3DA8" />;
}

function Tree() {
  return (
    <>
      <rect x="150" y="90" width="12" height="50" fill="#52288A" />
      <circle cx="156" cy="78" r="32" fill="#23706A" />
    </>
  );
}

function Path() {
  return <path d="M40 140 C120 140 120 70 200 70 C250 70 270 100 300 90" fill="none" stroke="#6A3DA8" strokeWidth="8" strokeLinecap="round" />;
}

function Calendar() {
  return <rect x="108" y="48" width="104" height="84" rx="8" fill="#F9F7F2" stroke="#52288A" strokeWidth="4" />;
}

function Breath() {
  return <circle cx="160" cy="90" r="28" fill="none" stroke="#23706A" strokeWidth="8" />;
}

function Leaf() {
  return <path d="M160 40c20 36 60 50 60 86a60 60 0 1 1-120 0c0-36 40-50 60-86z" fill="#6A3DA8" />;
}

export function MovementSketch({ kind }: { kind: SketchKind }) {
  const t = useT();
  const label = t(
    kind === "walk"
      ? msg("Simple drawing of a person walking")
      : kind === "chair"
        ? msg("Simple drawing of a seated movement")
        : kind === "balance"
          ? msg("Simple drawing of a person holding a support")
          : kind === "band"
            ? msg("Simple drawing of an arm movement")
            : kind === "hands"
              ? msg("Simple drawing of open hands")
              : kind === "feet"
                ? msg("Simple drawing of feet and ankles")
                : kind === "neck"
                  ? msg("Simple drawing of a neck and shoulder movement")
                  : kind === "back"
                    ? msg("Simple drawing of a supported seated posture")
                    : kind === "breath"
                      ? msg("Simple drawing of a seated breath")
                      : msg("Simple drawing of a stretch"),
  );
  return (
    <svg className="library-art" viewBox="0 0 320 180" role="img" aria-label={label}>
      <rect width="320" height="180" rx="24" fill="#EFE5FA" />
      <circle cx="150" cy="48" r="14" fill="#6A3DA8" />
      <path d="M150 64 v40" stroke="#52288A" strokeWidth="6" strokeLinecap="round" />
      {kind === "walk" ? <path d="M150 104 l-24 40 M150 104 l26 36 M150 80 l28 14" stroke="#23706A" strokeWidth="6" strokeLinecap="round" /> : null}
      {kind === "chair" || kind === "back" ? <path d="M118 150 h80 M150 104 v40 M132 86 h36" stroke="#23706A" strokeWidth="6" strokeLinecap="round" /> : null}
      {kind === "balance" ? <path d="M150 104 l-10 42 M140 146 h30 M230 30 v130" stroke="#23706A" strokeWidth="6" strokeLinecap="round" /> : null}
      {kind === "band" || kind === "hands" ? <path d="M110 90 h50 M200 96 h40" stroke="#23706A" strokeWidth="6" strokeLinecap="round" /> : null}
      {kind === "feet" ? <path d="M130 140 h30 M190 140 h30 M150 104 v30" stroke="#23706A" strokeWidth="6" strokeLinecap="round" /> : null}
      {kind === "neck" ? <path d="M150 64 l18 -8 M120 78 h40" stroke="#23706A" strokeWidth="6" strokeLinecap="round" /> : null}
      {kind === "stretch" ? <path d="M150 80 l36 -24 M150 104 v36" stroke="#23706A" strokeWidth="6" strokeLinecap="round" /> : null}
      {kind === "breath" ? <circle cx="210" cy="90" r="22" fill="none" stroke="#23706A" strokeWidth="6" /> : null}
    </svg>
  );
}
