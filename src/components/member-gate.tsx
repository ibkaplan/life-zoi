import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { memberFromCookies } from "@/lib/auth/session";

/**
 * Server check for every members' page. It confirms the sign-in cookie with
 * Supabase Auth before anything inside it is rendered, so a page is never sent
 * to a visitor even if a request skipped the proxy.
 */
export async function MemberGate({ children }: { children: React.ReactNode }) {
  const store = await cookies();
  const state = await memberFromCookies({ getAll: () => store.getAll() });
  if (state.status !== "member") redirect("/sign-in");
  return <>{children}</>;
}
