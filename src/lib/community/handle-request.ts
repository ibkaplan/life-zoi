import { isAdminEmail } from "@/lib/admin-allowlist";
import { getDefaultRepository } from "@/lib/community/runtime";
import { communityAction, communityBoard, type CommunityDeps } from "@/lib/community/service";
import { readVerifiedAccount, type VerifiedAccount } from "@/lib/supabase-user";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type CommunityHttpDeps = Partial<CommunityDeps> & {
  env?: Record<string, string | undefined>;
  readAccount?: (authorization: string | null) => Promise<VerifiedAccount | null>;
};

export async function handleCommunityRequest(
  input: { method: string; authorization: string | null; body: unknown },
  deps: CommunityHttpDeps = {},
): Promise<{ status: number; body: unknown }> {
  const env = deps.env ?? process.env;
  const resolved = deps.repo
    ? { repo: deps.repo, storage: deps.storage ?? ("memory" as const) }
    : getDefaultRepository(env);
  const serviceDeps: CommunityDeps = {
    repo: resolved.repo,
    storage: resolved.storage,
    apiKey: deps.apiKey !== undefined ? deps.apiKey : env.OPENAI_API_KEY,
    fetchImpl: deps.fetchImpl,
    now: deps.now,
    filterConfig: deps.filterConfig,
    maxProviderCallsPerHour: deps.maxProviderCallsPerHour,
    maxSubmitsPerHour: deps.maxSubmitsPerHour,
    timeoutMs: deps.timeoutMs,
  };
  const readAccount = deps.readAccount ?? readVerifiedAccount;
  const account = await readAccount(input.authorization);
  const actor = account && UUID.test(account.id) ? { id: account.id, isAdmin: isAdminEmail(account.email) } : null;
  if (input.method === "GET") return communityBoard(actor, serviceDeps);
  if (input.method !== "POST") return { status: 405, body: { error: "That action is not available." } };
  if (!actor) {
    return { status: 401, body: { error: "Sign in before using the community. The message was not published." } };
  }
  if (!input.body || typeof input.body !== "object" || Array.isArray(input.body)) {
    return { status: 400, body: { error: "The request could not be read. The message was not published." } };
  }
  const result = await communityAction(actor, input.body as Record<string, unknown>, serviceDeps);
  const secret = serviceDeps.apiKey?.trim() ?? "";
  if (secret && JSON.stringify(result.body).includes(secret)) {
    return { status: 500, body: { error: "The server could not complete that request. The message was not published." } };
  }
  return result;
}
