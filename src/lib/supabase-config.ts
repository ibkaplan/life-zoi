/** DEMO BRANCH ONLY: this branch never talks to Supabase. Do not merge. */
export const DEMO_WITHOUT_SUPABASE = true;

export type PublicSupabaseConfig = {
  url: string;
  anonKey: string;
};

export function isPublicSupabaseConfig(url: string, anonKey: string): boolean {
  if (anonKey.length < 20 || anonKey.length > 4096) return false;
  if (/\s/.test(anonKey)) return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" && parsed.hostname.length > 0;
  } catch {
    return false;
  }
}

export function readPublicSupabaseConfig(
  env: Record<string, string | undefined> = process.env,
): PublicSupabaseConfig | null {
  // DEMO BRANCH ONLY: never contact Supabase, so this preview cannot touch the live database.
  if (DEMO_WITHOUT_SUPABASE) return null;
  const url = env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
  const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? "";
  if (!isPublicSupabaseConfig(url, anonKey)) return null;
  return { url, anonKey };
}
