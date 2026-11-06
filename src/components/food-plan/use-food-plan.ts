"use client";

import { useSession } from "@/components/session-provider";
import { useAccount } from "@/lib/account-store";
import type { FoodPlanState } from "@/lib/food-plan/types";

export function useFoodPlan() {
  const api = useSession();
  const account = useAccount();
  return {
    ready: api.ready,
    sample: api.sample,
    state: api.session.foodPlan,
    phase: account.phase,
    save(next: FoodPlanState) {
      if (api.sample) return "Sample data is read-only. Turn off the sample to record your own answers.";
      api.saveFoodPlan(next);
      return null;
    },
  };
}

export function storageLine(phase: string): string {
  if (phase === "loading") return "Checking sign-in…";
  if (phase === "ready") return "Signed in. This food plan is saved with your account.";
  if (phase === "needs-mfa") return "Finish sign-in in Settings before this food plan can be saved to an account.";
  if (phase === "off") return "Browser-only. Account sign-in is not configured, so this food plan stays in this browser tab until the tab closes.";
  return "Browser-only until you sign in. This food plan stays in this browser tab.";
}
