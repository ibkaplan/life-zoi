import { msg } from "@/lib/i18n/translate";
import { SESSION_ADAPTER, type SessionAdapterKind } from "@/lib/session-adapter";
import { isPublicSupabaseConfig } from "@/lib/supabase-config";

export type AppStatus = {
  product: "lifeZoi";
  persistence: "development" | "account";
  authentication: "not-configured" | "supabase";
  supabaseVariablesPresent: boolean;
  detail: string;
};

export function getAppStatus(
  env: Record<string, string | undefined> = process.env,
  options: { adapter?: SessionAdapterKind } = {},
): AppStatus {
  const url = env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
  const anon = env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? "";
  const supabaseVariablesPresent = url.length > 0 && anon.length > 0;
  const adapter = options.adapter ?? SESSION_ADAPTER;
  const connected = adapter === "supabase" && isPublicSupabaseConfig(url, anon);
  if (!connected) {
    return {
      product: "lifeZoi",
      persistence: "development",
      authentication: "not-configured",
      supabaseVariablesPresent,
      detail: supabaseVariablesPresent
        ? msg("Supabase variables are present, but this environment is not using the account adapter. Members cannot sign in here, so the members' pages stay closed.")
        : msg("Supabase URL and anon key are not set. There is no account sign-in, so the members' pages stay closed."),
    };
  }
  return {
    product: "lifeZoi",
    persistence: "account",
    authentication: "supabase",
    supabaseVariablesPresent: true,
    detail: msg(
      "Signed-in assessment answers, scenarios, goals, and check-ins are stored in that person’s Supabase rows. Row level security uses auth.uid(). LifeZoi is for invited members, and every members' page and API checks the sign-in on the server. Sample data is not saved to an account.",
    ),
  };
}
