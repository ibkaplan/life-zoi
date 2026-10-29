export type AppStatus = {
  product: "lifeZoi";
  persistence: "development";
  authentication: "not-configured";
  supabaseVariablesPresent: boolean;
  detail: string;
};

export function getAppStatus(
  env: Record<string, string | undefined> = process.env,
): AppStatus {
  const url = env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
  const anon = env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? "";
  const supabaseVariablesPresent = url.length > 0 && anon.length > 0;
  return {
    product: "lifeZoi",
    persistence: "development",
    authentication: "not-configured",
    supabaseVariablesPresent,
    detail: supabaseVariablesPresent
      ? "Supabase variables are present, but this build does not connect to Supabase. There is no account sign-in and no database storage. Requests are not saved on the server."
      : "Supabase URL and anon key are not set. There is no account sign-in and no database storage. Requests are not saved on the server.",
  };
}
