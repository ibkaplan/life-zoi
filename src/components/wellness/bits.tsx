"use client";

import Link from "next/link";
import { useState } from "react";
import { useT } from "@/components/locale-provider";
import { EVIDENCE_LABELS, sourcesByIds } from "@/lib/wellness/sources";
import type { EvidenceKind, Practice } from "@/lib/wellness/types";
import { useWellness } from "@/components/wellness/use-wellness";

/** Shows a status message. English messages are translated here, so callers can pass the English text. */
export function ReadOnlyNote({ message }: { message: string | null }) {
  const t = useT();
  if (!message) return null;
  return (
    <p className="banner banner-sample" role="status">
      {t(message)}
    </p>
  );
}

export function EvidenceLine({ kind, note }: { kind: EvidenceKind; note: string }) {
  const t = useT();
  return (
    <p className="hint">
      <strong>{t(EVIDENCE_LABELS[kind])}.</strong> {t(note)}
    </p>
  );
}

export function WellnessSources({ ids }: { ids: readonly string[] }) {
  const t = useT();
  const sources = sourcesByIds(ids);
  if (sources.length === 0) return null;
  return (
    <ul className="source-list">
      {sources.map((source) => (
        <li key={source.id}>
          <a href={source.url} target="_blank" rel="noopener noreferrer">
            {source.publisher}: {source.name}
          </a>
          {source.dataUpdated
            ? t(" Updated {date}.", { date: source.dataUpdated })
            : t(" No update date was listed.")}
          {t(" Checked {date}.", { date: source.lastChecked })}
        </li>
      ))}
    </ul>
  );
}

export function PracticeCard({ item }: { item: Practice }) {
  const t = useT();
  const wellness = useWellness();
  const [note, setNote] = useState(wellness.reflection(item.id));
  const [message, setMessage] = useState<string | null>(null);
  const done = wellness.checked(item.id);

  return (
    <article className="card stack learn-card">
      <h3>{t(item.title)}</h3>
      <p><strong>{t("Why it may help.")}</strong> {t(item.why)}</p>
      <p><strong>{t("What to do.")}</strong> {t(item.what)}</p>
      <p><strong>{t("When.")}</strong> {t(item.when)}</p>
      <p><strong>{t("Supplies.")}</strong> {t(item.supplies)}</p>
      <p><strong>{t("An easier option.")}</strong> {t(item.alternative)}</p>
      <EvidenceLine kind={item.evidence} note={item.evidenceNote} />
      <WellnessSources ids={item.sourceIds} />
      <ReadOnlyNote message={wellness.readOnlyMessage} />
      {message ? <p role="status">{t(message)}</p> : null}
      <div className="actions">
        <button
          className="btn btn-primary"
          type="button"
          aria-pressed={done}
          onClick={() => setMessage(wellness.toggleCheck(item.id, note))}
        >
          {done ? t("Marked for today") : t("Mark today’s check-in")}
        </button>
      </div>
      <label className="field">
        <span>{t("Short reflection for today")}</span>
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
        {t("Save reflection")}
      </button>
    </article>
  );
}

/** Link cards. Titles and text are English and translated here. */
export function ModuleLinks({
  links,
}: {
  links: { href: string; title: string; text: string }[];
}) {
  const t = useT();
  return (
    <div className="stack">
      {links.map((link) => (
        <Link key={link.href} className="card learn-link" href={link.href}>
          <h2>{t(link.title)}</h2>
          <p>{t(link.text)}</p>
        </Link>
      ))}
    </div>
  );
}
