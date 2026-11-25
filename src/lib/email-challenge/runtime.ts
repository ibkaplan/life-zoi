import { createHash, timingSafeEqual } from "node:crypto";
import { getAdminSupabase } from "@/lib/supabase-admin";
import { createMemoryChallengeRepository, createSupabaseChallengeRepository, type ChallengeRepository } from "./repository";

let remote: ChallengeRepository | null = null;
const holder = globalThis as typeof globalThis & { __lifezoiChallengeMemory?: ChallengeRepository };

/**
 * Supabase (service role, server only) when configured, otherwise memory.
 * Memory is for local development: rows are lost on restart, and production
 * always has the service role key.
 */
export function getChallengeRepository(env: Record<string, string | undefined> = process.env): {
  repo: ChallengeRepository;
  storage: "memory" | "database";
} {
  if (!remote) {
    const client = getAdminSupabase(env);
    if (client) remote = createSupabaseChallengeRepository(client);
  }
  if (remote) return { repo: remote, storage: "database" };
  holder.__lifezoiChallengeMemory ??= createMemoryChallengeRepository();
  return { repo: holder.__lifezoiChallengeMemory, storage: "memory" };
}

/**
 * The scheduled sending run must carry `Authorization: Bearer <CRON_SECRET>`
 * (the header Vercel Cron sends). Without CRON_SECRET on the server the run is refused.
 */
export function cronAuthorized(header: string | null, env: Record<string, string | undefined> = process.env): boolean {
  const secret = env.CRON_SECRET?.trim() ?? "";
  if (secret.length < 16 || !header) return false;
  const match = /^Bearer\s+(\S+)$/.exec(header.trim());
  if (!match) return false;
  const a = createHash("sha256").update(match[1]).digest();
  const b = createHash("sha256").update(secret).digest();
  return timingSafeEqual(a, b);
}

/** A few sign-ups per address per hour from one network address. Per server instance; the database keeps one row per email anyway. */
const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const recent = new Map<string, number[]>();

export function allowSignup(address: string, now = Date.now()): boolean {
  const times = (recent.get(address) ?? []).filter((time) => now - time < WINDOW_MS);
  if (times.length >= MAX_PER_WINDOW) {
    recent.set(address, times);
    return false;
  }
  times.push(now);
  recent.set(address, times);
  if (recent.size > 5000) recent.clear();
  return true;
}

export function clientAddress(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || request.headers.get("x-real-ip")?.trim() || "unknown";
}
