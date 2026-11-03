"use client";

import Link from "next/link";
import { useState } from "react";
import { EVIDENCE_LABELS, sourcesByIds } from "@/lib/wellness/sources";
import type { EvidenceKind, Practice } from "@/lib/wellness/types";
import { useWellness } from "@/components/wellness/use-wellness";

export function ReadOnlyNote({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p className="banner banner-sample" role="status">
      {message}
    </p>
  );
}

export function EvidenceLine({ kind, note }: { kind: EvidenceKind; note: string }) {
  return (
    <p className="hint">
      <strong>{EVIDENCE_LABELS[kind]}.</strong> {note}
    </p>
  );
}

export function WellnessSources({ ids }: { ids: readonly string[] }) {
  const sources = sourcesByIds(ids);
  if (sources.length === 0) return null;
  return (
    <ul className="source-list">
      {sources.map((source) => (
        <li key={source.id}>
          <a href={source.url} target="_blank" rel="noopener noreferrer">
            {source.publisher}: {source.name}
          </a>
          {source.dataUpdated ? ` Updated ${source.dataUpdated}.` : " No update date was listed."} Checked{" "}
          {source.lastChecked}.
        </li>
      ))}
    </ul>
  );
}

export function PracticeCard({ item }: { item: Practice }) {
  const wellness = useWellness();
  const [note, setNote] = useState(wellness.reflection(item.id));
  const [message, setMessage] = useState<string | null>(null);
  const done = wellness.checked(item.id);

  return (
    <article className="card stack learn-card">
      <h3>{item.title}</h3>
      <p><strong>Why it may help.</strong> {item.why}</p>
      <p><strong>What to do.</strong> {item.what}</p>
      <p><strong>When.</strong> {item.when}</p>
      <p><strong>Supplies.</strong> {item.supplies}</p>
      <p><strong>An easier option.</strong> {item.alternative}</p>
      <EvidenceLine kind={item.evidence} note={item.evidenceNote} />
      <WellnessSources ids={item.sourceIds} />
      <ReadOnlyNote message={wellness.readOnlyMessage} />
      {message ? <p role="status">{message}</p> : null}
      <div className="actions">
        <button
          className="btn btn-primary"
          type="button"
          aria-pressed={done}
          onClick={() => setMessage(wellness.toggleCheck(item.id, note))}
        >
          {done ? "Marked for today" : "Mark today’s check-in"}
        </button>
      </div>
      <label className="field">
        <span>Short reflection for today</span>
        <textarea
          value={note}
          maxLength={280}
          rows={3}
          onChange={(event) => setNote(event.target.value)}
        />
      </label>
      <button
        className="btn btn-secondary"
        type="button"
        onClick={() => setMessage(wellness.saveReflection(item.id, note))}
      >
        Save reflection
      </button>
    </article>
  );
}

export function ModuleLinks({
  links,
}: {
  links: { href: string; title: string; text: string }[];
}) {
  return (
    <div className="stack">
      {links.map((link) => (
        <Link key={link.href} className="card learn-link" href={link.href}>
          <h2>{link.title}</h2>
          <p>{link.text}</p>
        </Link>
      ))}
    </div>
  );
}
