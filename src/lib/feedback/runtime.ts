import { createMemoryFeedbackRepository, type FeedbackRepository } from "@/lib/feedback/repository";
import { createSupabaseFeedbackRepository } from "@/lib/feedback/supabase-repository";
import { getAdminSupabase } from "@/lib/supabase-admin";

let remote: FeedbackRepository | null = null;
// Kept on globalThis so development hot reloads do not empty the in-memory store.
const holder = globalThis as typeof globalThis & { __lifezoiFeedbackMemory?: FeedbackRepository };

/**
 * Supabase when the server has the public config and the service role key,
 * otherwise memory (development only; rows are lost on restart and the page says so).
 */
export function getFeedbackRepository(env: Record<string, string | undefined> = process.env): {
  repo: FeedbackRepository;
  storage: "memory" | "account";
} {
  if (!remote) {
    const client = getAdminSupabase(env);
    if (client) remote = createSupabaseFeedbackRepository(client);
  }
  if (remote) return { repo: remote, storage: "account" };
  holder.__lifezoiFeedbackMemory ??= createMemoryFeedbackRepository();
  return { repo: holder.__lifezoiFeedbackMemory, storage: "memory" };
}
