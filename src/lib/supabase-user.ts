import { createClient } from "@supabase/supabase-js";
import { isAdminEmail } from "@/lib/admin-allowlist";
import { readPublicSupabaseConfig } from "@/lib/supabase-config";

export type VerifiedAccount = {
  id: string;
  email: string;
  isAdmin: boolean;
};

function bearerToken(header: string | null): string | null {
  if (!header) return null;
  const match = /^Bearer\s+(\S+)$/i.exec(header.trim());
  if (!match) return null;
  const token = match[1];
  if (token.length < 20 || token.length > 8192) return null;
  return token;
}

/** Confirms the caller's Supabase session with the anon key. Does not use the service role. */
export async function readVerifiedAccount(authorization: string | null): Promise<VerifiedAccount | null> {
  const config = readPublicSupabaseConfig();
  const accessToken = bearerToken(authorization);
  if (!config || !accessToken) return null;
  const supabase = createClient(config.url, config.anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
  const { data, error } = await supabase.auth.getUser(accessToken);
  if (error || !data.user?.id || !data.user.email) return null;
  return {
    id: data.user.id,
    email: data.user.email,
    isAdmin: isAdminEmail(data.user.email),
  };
}
