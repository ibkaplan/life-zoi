"use client";

import { useState } from "react";
import { useT } from "@/components/locale-provider";

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
  const t = useT();
  const [note, setNote] = useState<string | null>(null);

  async function copy() {
    const url = pageUrl(path);
    try {
      await navigator.clipboard.writeText(url);
      setNote(t("Link copied."));
    } catch {
      setNote(t("Select the link and copy it."));
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
      setNote(t("Share sheet opened."));
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      await copy();
    }
  }

  return (
    <div className="stack no-print">
      <div className="actions">
        <button className="btn btn-secondary" type="button" onClick={() => window.print()}>
          {t("Print")}
        </button>
        {pdfHref ? (
          <a className="btn btn-primary" href={pdfHref} download>
            {t("Download PDF")}
          </a>
        ) : null}
        <button className="btn btn-secondary" type="button" onClick={share}>
          {t("Share")}
        </button>
        <button className="btn btn-secondary" type="button" onClick={copy}>
          {t("Copy link")}
        </button>
      </div>
      <label className="field">
        <span>{t("Page link")}</span>
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
        <p className="hint">{t("The text above is the preview. The PDF downloads only when you use the button.")}</p>
      ) : null}
    </div>
  );
}
