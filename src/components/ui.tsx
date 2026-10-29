import Link from "next/link";
import type { ReactNode } from "react";
import { getSource, type SourceId } from "@/lib/sources";

const buttonStyles = {
  primary: "bg-forest text-surface hover:bg-forest-dark",
  secondary: "border border-forest bg-surface text-forest hover:bg-sage",
  quiet: "text-forest underline-offset-4 hover:underline",
  danger: "bg-danger text-white hover:bg-[#6f241f]",
  inverse: "bg-surface text-forest hover:bg-sand",
} as const;

export function buttonClass(variant: keyof typeof buttonStyles = "primary", className = ""): string {
  return `inline-flex min-h-11 items-center justify-center rounded-full px-4 py-2 text-center text-base font-semibold transition-colors ${buttonStyles[variant]} ${className}`;
}

export function Button({
  variant = "primary",
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: keyof typeof buttonStyles }) {
  return <button className={buttonClass(variant, className)} {...props} />;
}

export function ButtonLink({
  href,
  variant = "primary",
  className = "",
  children,
}: {
  href: "/dashboard" | "/profile" | "/assessment" | "/what-if" | "/progress" | "/recommendations" | "/settings" | "/privacy" | `/what-if/${string}`;
  variant?: keyof typeof buttonStyles;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link href={href} className={buttonClass(variant, className)}>
      {children}
    </Link>
  );
}

export function Card({
  children,
  className = "",
  tone = "default",
}: {
  children: ReactNode;
  className?: string;
  tone?: "default" | "forest";
}) {
  const toneClass =
    tone === "forest" ? "border-forest bg-forest text-[#f7fbf8]" : "border-line bg-surface text-ink";
  return <section className={`rounded-3xl border p-5 shadow-[0_1px_2px_rgba(27,40,34,0.05)] ${toneClass} ${className}`}>{children}</section>;
}

export function Alert({
  title,
  children,
  tone = "info",
}: {
  title: string;
  children: ReactNode;
  tone?: "info" | "warning";
}) {
  const styles = tone === "warning" ? "border-clay bg-sand text-ink" : "border-forest bg-sage text-ink";
  return (
    <div className={`rounded-2xl border px-4 py-3 ${styles}`} role={tone === "warning" ? "alert" : "status"}>
      <p className="font-semibold">{title}</p>
      <div className="mt-1 text-muted">{children}</div>
    </div>
  );
}

export function EmptyState({ title, children, action }: { title: string; children: ReactNode; action?: ReactNode }) {
  return (
    <div className="rounded-3xl border border-dashed border-line bg-sand/70 p-5">
      <h2 className="font-display text-2xl text-ink">{title}</h2>
      <div className="mt-2 max-w-xl text-muted">{children}</div>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

export function PageHeader({ eyebrow, title, lede }: { eyebrow?: string; title: string; lede: string }) {
  return (
    <header className="max-w-2xl">
      {eyebrow ? <p className="text-sm font-semibold tracking-[0.14em] text-forest uppercase">{eyebrow}</p> : null}
      <h1 className="mt-2 font-display text-4xl leading-tight text-ink sm:text-5xl">{title}</h1>
      <p className="mt-3 text-lg leading-relaxed text-muted">{lede}</p>
    </header>
  );
}

export function FieldError({ children }: { children: ReactNode }) {
  if (!children) return null;
  return (
    <p role="alert" className="mt-2 text-sm font-semibold text-danger">
      {children}
    </p>
  );
}

export function TextField({
  id,
  label,
  hint,
  error,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string; error?: string }) {
  return (
    <label className="block" htmlFor={id}>
      <span className="font-semibold">{label}</span>
      {hint ? <span className="mt-1 block text-sm text-muted">{hint}</span> : null}
      <input
        id={id}
        className="mt-2 min-h-11 w-full rounded-2xl border border-line bg-surface px-3 text-base text-ink"
        aria-invalid={error ? true : undefined}
        {...props}
      />
      <FieldError>{error}</FieldError>
    </label>
  );
}

export function TextAreaField({
  id,
  label,
  hint,
  error,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; hint?: string; error?: string }) {
  return (
    <label className="block" htmlFor={id}>
      <span className="font-semibold">{label}</span>
      {hint ? <span className="mt-1 block text-sm text-muted">{hint}</span> : null}
      <textarea
        id={id}
        className="mt-2 min-h-24 w-full rounded-2xl border border-line bg-surface px-3 py-2 text-base text-ink"
        aria-invalid={error ? true : undefined}
        {...props}
      />
      <FieldError>{error}</FieldError>
    </label>
  );
}

export function ChoiceGroup({
  legend,
  name,
  hint,
  value,
  options,
  error,
  onChange,
}: {
  legend: string;
  name: string;
  hint?: string;
  value: string;
  options: readonly { value: string; label: string }[];
  error?: string;
  onChange: (value: string) => void;
}) {
  return (
    <fieldset>
      <legend className="text-lg font-semibold">{legend}</legend>
      {hint ? <p className="mt-1 text-sm text-muted">{hint}</p> : null}
      <div className="mt-3 grid gap-2">
        {options.map((option) => (
          <label
            key={option.value}
            className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-2xl border px-3 py-2 ${value === option.value ? "border-forest bg-sage" : "border-line bg-surface"}`}
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              className="size-4 accent-forest"
            />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
      <FieldError>{error}</FieldError>
    </fieldset>
  );
}

export function SourceList({ ids }: { ids: readonly SourceId[] }) {
  return (
    <ul className="mt-3 space-y-2 text-sm">
      {ids.map((id) => {
        const source = getSource(id);
        return (
          <li key={id}>
            <a className="font-semibold text-forest underline-offset-4 hover:underline" href={source.url} target="_blank" rel="noreferrer">
              {source.title}
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
            <span className="text-muted"> — {source.publisher}</span>
          </li>
        );
      })}
    </ul>
  );
}

export function DisclaimerBlock() {
  return (
    <p className="text-sm leading-relaxed text-muted">
      lifeZoi offers general wellness education. It does not provide a diagnosis, recommend medication changes, estimate lifespan, or predict a date of death. Talk with a qualified clinician about personal medical decisions.{" "}
      <Link href="/privacy" className="font-semibold text-forest underline-offset-4 hover:underline">
        Privacy and data notes
      </Link>
      . If you might act on thoughts of suicide, call or text 988 in the United States, or contact local emergency services.
    </p>
  );
}
