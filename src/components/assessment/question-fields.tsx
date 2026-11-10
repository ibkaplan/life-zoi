"use client";

import type { HTMLAttributes, ReactNode } from "react";
import "./questionnaire.css";
import { useT } from "@/components/locale-provider";

/**
 * Shared questionnaire controls. Every answer area is visible before it is
 * touched: a bordered box for typing, and bordered cards with a check mark for
 * choices. Labels stay above the field, and an error names the question.
 */

function Check() {
  return (
    <svg viewBox="0 0 20 20" width="20" height="20" aria-hidden="true" focusable="false">
      <path d="M4.5 10.5l3.5 3.5 7.5-8" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function FieldError({ id, children }: { id: string; children: ReactNode }) {
  return (
    <p className="qz-error" id={id} role="alert">
      <span className="qz-error-icon" aria-hidden="true">!</span>
      <span>{children}</span>
    </p>
  );
}

export function TextQuestion({
  id,
  label,
  hint,
  value,
  onChange,
  placeholder,
  error,
  maxLength,
  unit,
  inputMode,
  multiline = false,
}: {
  id: string;
  label: string;
  hint?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  error?: string;
  maxLength?: number;
  /** Shown inside the box after the number, for example "cm". */
  unit?: string;
  inputMode?: HTMLAttributes<HTMLInputElement>["inputMode"];
  multiline?: boolean;
}) {
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy = [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(" ") || undefined;
  // Numbers use a real number box, so phones open the number keypad.
  const numeric = inputMode === "numeric" || inputMode === "decimal";
  const shared = {
    id,
    name: id,
    value,
    placeholder,
    maxLength,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": describedBy,
  } as const;
  return (
    <div className={`qz-field${error ? " qz-invalid" : ""}`}>
      <label className="qz-label" htmlFor={id}>
        {label}
      </label>
      {hint ? (
        <p className="qz-hint" id={hintId}>
          {hint}
        </p>
      ) : null}
      {multiline ? (
        <textarea className="qz-input qz-textarea" {...shared} onChange={(event) => onChange(event.target.value)} />
      ) : (
        <div className="qz-input-wrap">
          <input
            className="qz-input"
            type={numeric ? "number" : "text"}
            inputMode={inputMode}
            min={numeric ? 0 : undefined}
            step={inputMode === "decimal" ? "any" : numeric ? 1 : undefined}
            autoComplete="off"
            {...shared}
            onChange={(event) => onChange(event.target.value)}
          />
          {unit ? (
            <span className="qz-unit" aria-hidden="true">
              {unit}
            </span>
          ) : null}
        </div>
      )}
      {error ? <FieldError id={errorId}>{error}</FieldError> : null}
    </div>
  );
}

type Option<T extends string> = { value: T; label: string };

function OptionCard({
  type,
  name,
  checked,
  label,
  onChange,
}: {
  type: "radio" | "checkbox";
  name: string;
  checked: boolean;
  label: string;
  onChange: (checked: boolean) => void;
}) {
  const t = useT();
  return (
    <label className={`qz-option qz-option-${type}${checked ? " is-selected" : ""}`}>
      <input
        className="qz-option-input"
        type={type}
        name={name}
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span className="qz-option-box" aria-hidden="true">
        {checked ? <Check /> : null}
      </span>
      <span className="qz-option-text">{label}</span>
      {checked ? <span className="qz-option-state">{t("Selected")}</span> : null}
    </label>
  );
}

function Group({
  id,
  legend,
  hint,
  error,
  children,
}: {
  id: string;
  legend: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy = [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(" ") || undefined;
  return (
    <fieldset
      id={id}
      className={`qz-field qz-group${error ? " qz-invalid" : ""}`}
      aria-invalid={error ? true : undefined}
      aria-describedby={describedBy}
    >
      <legend className="qz-label">{legend}</legend>
      {hint ? (
        <p className="qz-hint" id={hintId}>
          {hint}
        </p>
      ) : null}
      <div className="qz-options">{children}</div>
      {error ? <FieldError id={errorId}>{error}</FieldError> : null}
    </fieldset>
  );
}

/** One answer from a list, shown as large selectable cards. */
export function ChoiceQuestion<T extends string>({
  legend,
  name,
  hint,
  value,
  options,
  onChange,
  error,
}: {
  legend: string;
  name: string;
  hint?: string;
  value: T | "";
  options: Option<T>[];
  onChange: (value: T) => void;
  error?: string;
}) {
  const t = useT();
  return (
    <Group id={name} legend={legend} hint={hint ?? t("Choose one.")} error={error}>
      {options.map((option) => (
        <OptionCard
          key={option.value}
          type="radio"
          name={name}
          label={option.label}
          checked={value === option.value}
          onChange={() => onChange(option.value)}
        />
      ))}
    </Group>
  );
}

/** Any number of answers from a list, shown as large selectable cards. */
export function CheckQuestion<T extends string>({
  id,
  legend,
  hint,
  values,
  options,
  onChange,
  error,
}: {
  id: string;
  legend: string;
  hint?: string;
  values: T[];
  options: Option<T>[];
  onChange: (values: T[]) => void;
  error?: string;
}) {
  const t = useT();
  return (
    <Group id={id} legend={legend} hint={hint ?? t("Choose all that apply.")} error={error}>
      {options.map((option) => (
        <OptionCard
          key={option.value}
          type="checkbox"
          name={id}
          label={option.label}
          checked={values.includes(option.value)}
          onChange={(on) =>
            onChange(on ? (values.includes(option.value) ? values : [...values, option.value]) : values.filter((item) => item !== option.value))
          }
        />
      ))}
    </Group>
  );
}
