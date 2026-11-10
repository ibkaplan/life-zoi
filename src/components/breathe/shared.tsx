"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AGE_FIGURE_NOTE,
  BREATHE_SOURCES,
  EVIDENCE_LABELS,
  MEDICAL_CAUTION,
  PROGRAM_LIMITS,
  REPORTED_BREATHLESSNESS,
  SAFETY_RULES,
  STOP_SIGNS,
  type EvidenceLevel,
} from "@/lib/breathe/content";
import { HABIT_LABELS } from "@/lib/breathe/program";
import type { BreatheHabits } from "@/lib/breathe/state";

const TABS = [
  { href: "/breathe", label: "Overview" },
  { href: "/breathe/practice", label: "Breathe" },
  { href: "/breathe/learn", label: "Learn" },
  { href: "/breathe/foods", label: "Foods" },
  { href: "/breathe/challenge", label: "30-day challenge" },
];

export function BreatheNav() {
  const pathname = usePathname();
  return (
    <nav className="bf-nav" aria-label="Breathe for Life">
      {TABS.map((tab) => (
        <Link key={tab.href} href={tab.href} className="bf-nav-link" aria-current={pathname === tab.href ? "page" : undefined}>
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}

export function EvidenceBadge({ level }: { level: EvidenceLevel }) {
  return (
    <span className="bf-badge" data-level={level} title={EVIDENCE_LABELS[level].text}>
      {EVIDENCE_LABELS[level].label}
    </span>
  );
}

export function EvidenceLegend() {
  return (
    <section className="card stack" aria-labelledby="bf-evidence">
      <h2 id="bf-evidence">How to read the labels</h2>
      <ul className="bf-legend">
        {(Object.keys(EVIDENCE_LABELS) as EvidenceLevel[]).map((level) => (
          <li key={level}>
            <EvidenceBadge level={level} /> <span>{EVIDENCE_LABELS[level].text}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function SafetyCard({ breathless = false, compact = false }: { breathless?: boolean; compact?: boolean }) {
  return (
    <section className="card stack bf-safety" aria-labelledby="bf-safety">
      <h2 id="bf-safety">Breathe safely</h2>
      {breathless ? <p className="alert">{REPORTED_BREATHLESSNESS}</p> : null}
      <ul>
        {SAFETY_RULES.map((rule) => (
          <li key={rule}>{rule}</li>
        ))}
      </ul>
      <p>
        <strong>{STOP_SIGNS}</strong>
      </p>
      {!compact ? <p>{MEDICAL_CAUTION}</p> : null}
      <p className="hint">{PROGRAM_LIMITS}</p>
    </section>
  );
}

export function SourcesList() {
  return (
    <section className="card stack" aria-labelledby="bf-sources">
      <h2 id="bf-sources">Sources</h2>
      <p className="hint">Each source is described only as far as it supports what this feature says.</p>
      <ol className="bf-sources">
        {BREATHE_SOURCES.map((source) => (
          <li key={source.id}>
            <a href={source.url} target="_blank" rel="noreferrer">
              {source.title}
            </a>
            <span className="hint">
              {" "}
              {source.authors} {source.year}. {source.where}.
            </span>
            <p>{source.supports}</p>
          </li>
        ))}
      </ol>
      <div className="alert">
        <strong>{AGE_FIGURE_NOTE.title}.</strong> {AGE_FIGURE_NOTE.text}
      </div>
    </section>
  );
}

const SCALE = [1, 2, 3, 4, 5] as const;

export function ScalePicker({
  legend,
  value,
  onChange,
  disabled,
}: {
  legend: string;
  value: number | null;
  onChange: (value: number | null) => void;
  disabled?: boolean;
}) {
  return (
    <fieldset className="field">
      <legend>{legend}</legend>
      <div className="lz-tabs">
        {SCALE.map((n) => (
          <button key={n} type="button" className="lz-tab bf-scale" disabled={disabled} aria-pressed={value === n} onClick={() => onChange(value === n ? null : n)}>
            {n}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

function Choice<K extends keyof typeof HABIT_LABELS>({
  legend,
  field,
  value,
  onChange,
  disabled,
}: {
  legend: string;
  field: K;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  const options = HABIT_LABELS[field] as Record<string, string>;
  return (
    <fieldset className="field">
      <legend>{legend}</legend>
      <div className="lz-tabs">
        {Object.entries(options).map(([id, label]) => (
          <button key={id} type="button" className="lz-tab" disabled={disabled} aria-pressed={value === id} onClick={() => onChange(value === id ? "" : id)}>
            {label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

/** The short habit questions asked at the start and the end of the challenge. */
export function HabitQuestions({ value, onChange, disabled }: { value: BreatheHabits; onChange: (next: BreatheHabits) => void; disabled?: boolean }) {
  const set = (patch: Partial<BreatheHabits>) => onChange({ ...value, ...patch });
  return (
    <div className="stack">
      <Choice legend="How often do you practice breathing exercises?" field="practice" value={value.practice} disabled={disabled} onChange={(v) => set({ practice: v as BreatheHabits["practice"] })} />
      <Choice legend="How often do you notice yourself breathing through your mouth?" field="mouthBreathing" value={value.mouthBreathing} disabled={disabled} onChange={(v) => set({ mouthBreathing: v as BreatheHabits["mouthBreathing"] })} />
      <Choice legend="How often do you eat leafy greens or beetroot?" field="greens" value={value.greens} disabled={disabled} onChange={(v) => set({ greens: v as BreatheHabits["greens"] })} />
      <Choice legend="How often do you walk for ten minutes or more?" field="walking" value={value.walking} disabled={disabled} onChange={(v) => set({ walking: v as BreatheHabits["walking"] })} />
      <ScalePicker legend="Stress lately (1 calm, 5 very stressed)" value={value.stress} disabled={disabled} onChange={(v) => set({ stress: v })} />
      <ScalePicker legend="How easily you relax (1 hard, 5 easy)" value={value.relaxation} disabled={disabled} onChange={(v) => set({ relaxation: v })} />
      <p className="hint">These are your own impressions, not measurements. Skip any question you like.</p>
    </div>
  );
}
