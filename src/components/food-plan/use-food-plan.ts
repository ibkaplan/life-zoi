"use client";

import { useSession } from "@/components/session-provider";
import { useAccount } from "@/lib/account-store";
import type { FoodPlanState } from "@/lib/food-plan/types";
import { msg } from "@/lib/i18n/translate";

export function useFoodPlan() {
  const api = useSession();
  const account = useAccount();
  return {
    ready: api.ready,
    sample: api.sample,
    state: api.session.foodPlan,
    phase: account.phase,
    save(next: FoodPlanState) {
      if (api.sample) return msg("Sample data is read-only. Turn off the sample to record your own answers.");
      api.saveFoodPlan(next);
      return null;
    },
  };
}

export function storageLine(phase: string): string {
  if (phase === "loading") return msg("Checking sign-in…");
  if (phase === "ready") return msg("Signed in. This food plan is saved with your account.");
  if (phase === "needs-mfa") return msg("Finish sign-in in Settings before this food plan can be saved to an account.");
  if (phase === "off") return msg("Browser-only. Account sign-in is not configured, so this food plan stays in this browser tab until the tab closes.");
  return msg("Browser-only until you sign in. This food plan stays in this browser tab.");
}
