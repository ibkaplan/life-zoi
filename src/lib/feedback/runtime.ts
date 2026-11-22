import { createMemoryFeedbackRepository, type FeedbackRepository } from "@/lib/feedback/repository";
import { createSupabaseFeedbackRepository } from "@/lib/feedback/supabase-repository";
import { getAdminSupabase } from "@/lib/supabase-admin";

let memory: FeedbackRepository | null = null;
let remote: FeedbackRepository | null = null;

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
  if (!memory) memory = createMemoryFeedbackRepository();
  return { repo: memory, storage: "memory" };
}
