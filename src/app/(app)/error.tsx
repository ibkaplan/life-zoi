"use client";

export default function AppError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div role="alert" className="rounded-3xl border border-clay bg-sand p-5">
      <h1 className="font-display text-4xl">This page could not be shown</h1>
      <p className="mt-2 text-muted">Your saved notes were not intentionally changed. You can try the page again.</p>
      <button type="button" className="mt-4 min-h-11 rounded-full bg-forest px-4 font-semibold text-surface" onClick={reset}>
        Try again
      </button>
    </div>
  );
}
