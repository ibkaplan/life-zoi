export type DataMode = {
  kind: "local";
  reason: "missing-credentials" | "remote-not-activated";
};

export function describeDataMode(env: {
  supabaseUrl?: string;
  supabaseAnonKey?: string;
}): DataMode {
  const hasUrl = Boolean(env.supabaseUrl?.trim());
  const hasKey = Boolean(env.supabaseAnonKey?.trim());
  if (hasUrl && hasKey) {
    return { kind: "local", reason: "remote-not-activated" };
  }
  return { kind: "local", reason: "missing-credentials" };
}

export const dataMode = describeDataMode({
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
});

export function dataModeSummary(mode: DataMode): string {
  if (mode.reason === "remote-not-activated") {
    return "Supabase keys are present, but this version still stores entries only in this browser. Remote accounts are not active, so those keys are not protecting this data.";
  }
  return "Local development mode. Entries stay in this browser. There is no account and no secure server copy.";
}
