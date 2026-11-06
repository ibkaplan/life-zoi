"use client";

import { useState } from "react";

function pageUrl(path: string) {
  if (typeof window === "undefined") return path;
  return `${window.location.origin}${path}`;
}

export function ShareBar({
  title,
  path,
  pdfHref,
}: {
  title: string;
  path: string;
  pdfHref?: string;
}) {
  const [note, setNote] = useState<string | null>(null);

  async function copy() {
    const url = pageUrl(path);
    try {
      await navigator.clipboard.writeText(url);
      setNote("Link copied.");
    } catch {
      setNote("Select the link and copy it.");
    }
  }

  async function share() {
    const url = pageUrl(path);
    if (!navigator.share) {
      await copy();
      return;
    }
    try {
      await navigator.share({ title, text: title, url });
      setNote("Share sheet opened.");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      await copy();
    }
  }

  return (
    <div className="stack no-print">
      <div className="actions">
        <button className="btn btn-secondary" type="button" onClick={() => window.print()}>
          Print
        </button>
        {pdfHref ? (
          <a className="btn btn-primary" href={pdfHref} download>
            Download PDF
          </a>
        ) : null}
        <button className="btn btn-secondary" type="button" onClick={share}>
          Share
        </button>
        <button className="btn btn-secondary" type="button" onClick={copy}>
          Copy link
        </button>
      </div>
      <label className="field">
        <span>Page link</span>
        <input
          readOnly
          defaultValue={path}
          ref={(node) => {
            if (node) node.value = pageUrl(path);
          }}
          onFocus={(event) => event.currentTarget.select()}
        />
      </label>
      {note ? <p role="status">{note}</p> : null}
      {pdfHref ? (
        <p className="hint">The text above is the preview. The PDF downloads only when you use the button.</p>
      ) : null}
    </div>
  );
}
