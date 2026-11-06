import { createMemoryRepository, type CommunityRepository } from "@/lib/community/repository";
import { communityRepositoryFromEnv, connectCommunityDatabase } from "@/lib/community/supabase-repository";
import { readPublicSupabaseConfig } from "@/lib/supabase-config";

let memorySingleton: CommunityRepository | null = null;
let remoteSingleton: CommunityRepository | null = null;

export function getDefaultRepository(env: Record<string, string | undefined> = process.env): {
  repo: CommunityRepository;
  storage: "memory" | "account";
} {
  const config = readPublicSupabaseConfig(env);
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY?.trim() ?? "";
  if (config && serviceKey.length >= 20) {
    if (!remoteSingleton) {
      remoteSingleton = communityRepositoryFromEnv(env, connectCommunityDatabase);
    }
    if (remoteSingleton) return { repo: remoteSingleton, storage: "account" };
  }
  if (!memorySingleton) memorySingleton = createMemoryRepository();
  return { repo: memorySingleton, storage: "memory" };
}
