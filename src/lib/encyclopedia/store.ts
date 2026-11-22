import type { SupabaseClient } from "@supabase/supabase-js";
import type { EditorialRecord } from "@/lib/encyclopedia/catalog";
import type { Article, ArticleStatus } from "@/lib/encyclopedia/types";
import { getAdminSupabase } from "@/lib/supabase-admin";

/**
 * Editorial storage in public.encyclopedia_articles, used only on the server
 * through the service role. Row level security is on with no browser policies,
 * so the browser roles cannot read or write the table directly.
 */
export type EncyclopediaStore = {
  listPublished: () => Promise<EditorialRecord[]>;
  listAll: () => Promise<(EditorialRecord & { updatedBy: string | null })[]>;
  save: (row: { slug: string; status: ArticleStatus; article: Article; actor: string }) => Promise<void>;
  setStatus: (slug: string, status: ArticleStatus, actor: string) => Promise<boolean>;
  get: (slug: string) => Promise<EditorialRecord | null>;
};

type Row = { slug: string; status: ArticleStatus; article: Article; updated_at: string; updated_by: string | null };

const toRecord = (row: Row) => ({ slug: row.slug, status: row.status, article: row.article, updatedAt: row.updated_at, updatedBy: row.updated_by });

export function createSupabaseEncyclopediaStore(client: SupabaseClient): EncyclopediaStore {
  const table = () => client.from("encyclopedia_articles");
  return {
    async listPublished() {
      const { data, error } = await table().select("slug, status, article, updated_at, updated_by").eq("status", "published").limit(500);
      if (error) throw error;
      return ((data ?? []) as Row[]).map(toRecord);
    },
    async listAll() {
      const { data, error } = await table().select("slug, status, article, updated_at, updated_by").order("updated_at", { ascending: false }).limit(500);
      if (error) throw error;
      return ((data ?? []) as Row[]).map(toRecord);
    },
    async save({ slug, status, article, actor }) {
      const { error } = await table().upsert(
        { slug, status, article, category: article.category, updated_by: actor, updated_at: new Date().toISOString() },
        { onConflict: "slug" },
      );
      if (error) throw error;
    },
    async setStatus(slug, status, actor) {
      const { data, error } = await table().update({ status, updated_by: actor, updated_at: new Date().toISOString() }).eq("slug", slug).select("slug");
      if (error) throw error;
      return (data ?? []).length > 0;
    },
    async get(slug) {
      const { data, error } = await table().select("slug, status, article, updated_at, updated_by").eq("slug", slug).maybeSingle();
      if (error) throw error;
      return data ? toRecord(data as Row) : null;
    },
  };
}

export function encyclopediaStoreFromEnv(): EncyclopediaStore | null {
  const client = getAdminSupabase();
  return client ? createSupabaseEncyclopediaStore(client) : null;
}
