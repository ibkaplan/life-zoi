"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import "@/components/email-challenge/challenge.css";
import { useT } from "@/components/locale-provider";

/**
 * The page a link in an email opens. It acts only when the person presses the
 * button, so a mail scanner that opens links cannot confirm or stop anything.
 */
export function TokenAction({ kind }: { kind: "confirm" | "stop" }) {
  const t = useT();
  const token = useSearchParams()?.get("token") ?? "";
  const [state, setState] = useState<"idle" | "working" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  async function act() {
    setState("working");
    setError(null);
    try {
      const response = await fetch(kind === "confirm" ? "/api/challenge/confirm" : "/api/challenge/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const body = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) {
        setError(t(body.error ?? "That did not work. Try again later."));
        setState("idle");
        return;
      }
      setState("done");
    } catch {
      setError(t("That did not work. Try again later."));
      setState("idle");
    }
  }

  const title = kind === "confirm" ? t("Confirm the 7-day challenge") : t("Stop the challenge emails");
  return (
    <article className="stack-lg narrow">
      <section className="ch-hero">
        <p className="kicker">{t("The LifeZoi 7-day challenge")}</p>
        <h1>{title}</h1>
        {state === "done" ? (
          <p className="ch-status" role="status">
            {kind === "confirm"
              ? t("Confirmed. Your first task will arrive by email within a day. Every email has a link to stop.")
              : t("Done. No more challenge emails will be sent, and your address was deleted.")}
          </p>
        ) : !token ? (
          <p className="field-error" role="alert">
            {t("This link is not complete. Open it again from the email.")}
          </p>
        ) : (
          <>
            <p>
              {kind === "confirm"
                ? t("Press the button to start getting one short task a day for seven days.")
                : t("Press the button to stop the emails. Your address will be deleted.")}
            </p>
            {error ? (
              <p className="field-error" role="alert">
                {error}
              </p>
            ) : null}
            <p>
              <button type="button" className="btn btn-primary" onClick={act} disabled={state === "working"}>
                {kind === "confirm" ? t("Yes, start the challenge") : t("Stop the emails")}
              </button>
            </p>
          </>
        )}
        <p>
          <Link href="/free/challenge">{t("See the seven days")}</Link>
        </p>
      </section>
    </article>
  );
}
