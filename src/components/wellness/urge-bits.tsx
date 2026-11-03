import { WellnessSources } from "@/components/wellness/bits";
import { SUPPORT_NOTE } from "@/lib/wellness/urges";

export function SupportNotice({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <div className="card stack" role="status">
      <h2>A clinician can help</h2>
      <p>{SUPPORT_NOTE}</p>
      <WellnessSources ids={["medlineplus-emotional-eating", "niddk-binge", "samhsa-988"]} />
    </div>
  );
}

export function RecordChart({
  title,
  rows,
  empty,
}: {
  title: string;
  rows: { label: string; value: number }[];
  empty: string;
}) {
  const max = Math.max(1, ...rows.map((row) => row.value));
  const hasAny = rows.some((row) => row.value > 0);
  return (
    <section className="card stack" aria-labelledby={`chart-${title.replace(/\s+/g, "-")}`}>
      <h2 id={`chart-${title.replace(/\s+/g, "-")}`}>{title}</h2>
      <p className="hint">These bars use only records saved in this browser tab.</p>
      {hasAny ? (
        <ul className="chart-list">
          {rows.map((row) => (
            <li key={row.label}>
              <span>{row.label}</span>
              <span className="bar-track" aria-hidden="true">
                <span className="bar-fill" style={{ width: `${Math.max(0.4, (row.value / max) * 12)}rem` }} />
              </span>
              <span>{row.value}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p>{empty}</p>
      )}
    </section>
  );
}
