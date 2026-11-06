"use client";

import { useEffect } from "react";
import { useAccount } from "@/lib/account-store";
import { noteRegistrationIfNeeded } from "@/lib/share-care";
import { supabaseGateway } from "@/lib/share-care-store";
import { getBrowserSupabase } from "@/lib/supabase-browser";

/** Counts a registration after a signed-out welcome visit in this tab. Renders nothing. */
export function CareInviteWatcher() {
  const account = useAccount();
  const phase = account.phase;

  useEffect(() => {
    const supabase = getBrowserSupabase();
    if (!supabase) return;
    const gateway = supabaseGateway(supabase);
    void noteRegistrationIfNeeded(window.sessionStorage, phase, (token) => gateway.note(token, "register"));
  }, [phase]);

  return null;
}
