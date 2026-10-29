import { samplePreview } from "@/lib/sample-data";

export function SampleExample() {
  return (
    <details className="rounded-3xl border border-line bg-surface p-4">
      <summary className="min-h-11 cursor-pointer font-semibold">Show a labeled example</summary>
      <div className="mt-4">
        <p className="inline-flex rounded-full bg-sand px-3 py-1 text-sm font-semibold text-ink">{samplePreview.label}</p>
        <h3 className="mt-3 font-display text-2xl">{samplePreview.title}</h3>
        <p className="mt-2 text-muted">{samplePreview.notice}</p>
        <ul className="mt-3 list-disc space-y-1 pl-5">
          {samplePreview.lines.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
        <p className="mt-3 text-sm text-muted">
          {samplePreview.month.label}: {samplePreview.month.done} done, {samplePreview.month.partial} partial, {samplePreview.month.skipped} skipped. {samplePreview.month.note}
        </p>
      </div>
    </details>
  );
}
