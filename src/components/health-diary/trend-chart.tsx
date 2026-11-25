"use client";

import { niceRange, type SeriesPoint } from "@/lib/health-diary/series";

export type ChartLine = { key: string; name: string; points: SeriesPoint[]; tone: number; dashed?: boolean };
export type ChartGuide = { value: number; label: string };

/**
 * A small SVG line chart that stays readable on a phone: the lines differ by
 * shape (solid, dashed, dotted) and by marker, not by color alone, and every
 * reading is also in the table beneath it.
 */
export function TrendChart({
  lines,
  guides,
  unit,
  title,
  format,
  compact = false,
}: {
  lines: ChartLine[];
  guides: ChartGuide[];
  unit: string;
  title: string;
  format: (at: number) => string;
  /** Phone layout: a narrower drawing so text stays full size on a small screen. */
  compact?: boolean;
}) {
  const width = compact ? 340 : 640;
  const height = compact ? 250 : 340;
  const pad = { left: compact ? 44 : 62, right: 10, top: 16, bottom: 36 };
  const all = lines.flatMap((line) => line.points);
  if (all.length === 0) return null;
  const { min, max } = niceRange(
    all.map((point) => point.value),
    guides.map((guide) => guide.value),
  );
  const times = all.map((point) => point.at);
  let start = Math.min(...times);
  let end = Math.max(...times);
  if (start === end) {
    start -= 86_400_000;
    end += 86_400_000;
  }
  const x = (at: number) => pad.left + ((at - start) / (end - start)) * (width - pad.left - pad.right);
  const y = (value: number) => pad.top + (1 - (value - min) / (max - min)) * (height - pad.top - pad.bottom);
  const ticks = niceTicks(min, max);
  const dateTicks = [start, start + (end - start) / 2, end];
  const dash = ["", "8 5", "2 5", "12 4 2 4"];

  return (
    <svg className="hd-chart" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={title}>
      {ticks.map((tick) => (
        <g key={tick}>
          <line className="hd-grid" x1={pad.left} x2={width - pad.right} y1={y(tick)} y2={y(tick)} />
          <text className="hd-tick" x={pad.left - 8} y={y(tick) + 6} textAnchor="end">
            {tick}
          </text>
        </g>
      ))}
      {guides
        .filter((guide) => guide.value >= min && guide.value <= max)
        .map((guide) => (
          <g key={`${guide.label}-${guide.value}`}>
            <line className="hd-guide" x1={pad.left} x2={width - pad.right} y1={y(guide.value)} y2={y(guide.value)} />
            <text className="hd-guideLabel" x={width - pad.right - 4} y={y(guide.value) - 4} textAnchor="end">
              {guide.label}
            </text>
          </g>
        ))}
      {dateTicks.map((at, index) => (
        <text key={at} className="hd-tick" x={x(at)} y={height - 6} textAnchor={index === 0 ? "start" : index === 2 ? "end" : "middle"}>
          {format(at)}
        </text>
      ))}
      {lines.map((line, index) => {
        const path = line.points.map((point, at) => `${at === 0 ? "M" : "L"}${x(point.at).toFixed(1)},${y(point.value).toFixed(1)}`).join(" ");
        return (
          <g key={line.key} className={`hd-line hd-tone${line.tone}`}>
            {line.points.length > 1 ? <path d={path} fill="none" strokeDasharray={dash[index % dash.length]} /> : null}
            {line.points.map((point) =>
              index % 2 === 0 ? (
                <circle key={point.at} cx={x(point.at)} cy={y(point.value)} r={4}>
                  <title>{`${line.name}: ${point.value} ${unit}, ${format(point.at)}`}</title>
                </circle>
              ) : (
                <rect key={point.at} x={x(point.at) - 4} y={y(point.value) - 4} width={8} height={8}>
                  <title>{`${line.name}: ${point.value} ${unit}, ${format(point.at)}`}</title>
                </rect>
              ),
            )}
          </g>
        );
      })}
    </svg>
  );
}

/** Four or five evenly spaced round values between min and max. */
export function niceTicks(min: number, max: number): number[] {
  const span = max - min;
  if (!(span > 0)) return [min];
  const raw = span / 4;
  const power = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((factor) => factor * power).find((candidate) => candidate >= raw) ?? raw;
  const out: number[] = [];
  for (let value = Math.ceil(min / step) * step; value <= max + 1e-9; value += step) out.push(Math.round(value * 100) / 100);
  return out;
}

/** The key under a chart, matching each line's dash and marker. */
export function ChartKey({ lines, unit }: { lines: ChartLine[]; unit: string }) {
  const dash = ["", "8 5", "2 5", "12 4 2 4"];
  return (
    <ul className="hd-key">
      {lines.map((line, index) => (
        <li key={line.key} className={`hd-tone${line.tone}`}>
          <svg width="34" height="12" aria-hidden="true">
            <line x1="1" x2="33" y1="6" y2="6" strokeDasharray={dash[index % dash.length]} />
            {index % 2 === 0 ? <circle cx="17" cy="6" r="4" /> : <rect x="13" y="2" width="8" height="8" />}
          </svg>
          {line.name}
        </li>
      ))}
      <li className="hint">{unit}</li>
    </ul>
  );
}
