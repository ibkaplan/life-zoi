"use client";

import { useT } from "@/components/locale-provider";
import type { Source } from "@/lib/types";

/** Organization names and page titles stay as published. */
export function SourceList({ sources }: { sources: Source[] }) {
  const t = useT();
  if (sources.length === 0) return null;
  return (
    <>
      <h3>{t("Sources")}</h3>
      <ul className="source-list">
        {sources.map((source) => (
          <li key={source.url}>
            <a href={source.url} target="_blank" rel="noopener noreferrer">
              {source.name}: {source.title}
            </a>
          </li>
        ))}
      </ul>
    </>
  );
}

export function LoadingState({ label }: { label: string }) {
  return (
    <p className="card" role="status">
      {label}
    </p>
  );
}

export function EmptyState({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="card empty">
      <h2>{title}</h2>
      {children}
    </div>
  );
}
