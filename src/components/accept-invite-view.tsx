"use client";

import { useEffect, useState } from "react";
import { NewPasswordForm } from "@/components/password-forms";
import { useMessages } from "@/components/locale-provider";
import { fmt } from "@/lib/i18n/config";
import { retryAccountLoad, useAccount } from "@/lib/account-store";
import { readInviteArrival } from "@/lib/invitations/accept";
import { getBrowserSupabase } from "@/lib/supabase-browser";

type LinkState = "checking" | "ok" | "failed" | "none";

let started = false;

/** Where an invite email lands. It opens the invited account, then asks for a password. */
export function AcceptInviteView() {
  const account = useAccount();
  const m = useMessages();
  const a = m.access;
  const [link, setLink] = useState<LinkState>("checking");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (started) return;
    started = true;
    const arrival = readInviteArrival(window.location.search, window.location.hash);
    // Remove the one-time values from the address bar and history.
    window.history.replaceState(null, "", "/accept-invite");
    const supabase = getBrowserSupabase();
    void (async () => {
      if (!supabase) return setLink("failed");
      if (arrival.kind === "error") return setLink("failed");
      if (arrival.kind === "none") return setLink("none");
      const result =
        arrival.kind === "token-hash"
          ? await supabase.auth.verifyOtp({ token_hash: arrival.tokenHash, type: arrival.type })
          : await supabase.auth.setSession({ access_token: arrival.accessToken, refresh_token: arrival.refreshToken });
      if (result.error) return setLink("failed");
      retryAccountLoad();
      setLink("ok");
    })();
    return () => {
      started = false;
    };
  }, []);

  let body: React.ReactNode;
  if (account.phase === "off") {
    body = <p>{a.signInOff}</p>;
  } else if (saved) {
    body = (
      <>
        <p className="alert alert-ok" role="status">
          {a.acceptDone}
        </p>
        <div className="actions">
          <button className="btn btn-primary" type="button" onClick={() => window.location.assign("/")}>
            {a.acceptContinue}
          </button>
        </div>
      </>
    );
  } else if (account.phase === "ready" && link !== "failed") {
    body = (
      <>
        <p>{fmt(a.acceptSignedInAs, { email: account.email ?? m.common.yourAccount })}</p>
        <NewPasswordForm onSaved={() => setSaved(true)} />
      </>
    );
  } else if (link === "checking" || account.phase === "loading") {
    body = <p role="status">{a.acceptChecking}</p>;
  } else {
    body = (
      <p className="alert alert-error" role="alert">
        {link === "none" ? a.acceptOpenLink : a.acceptFailed}
      </p>
    );
  }

  return (
    <div className="stack-lg narrow">
      <div>
        <p className="kicker">{a.acceptKicker}</p>
        <h1>{a.acceptTitle}</h1>
      </div>
      <section className="card stack">{body}</section>
    </div>
  );
}
