import { BUILT_IN_ARTICLES } from "@/lib/encyclopedia/articles";
import type { EncyclopediaStore } from "@/lib/encyclopedia/store";
import { isArticleStatus, SLUG_PATTERN, validateArticle } from "@/lib/encyclopedia/validate";
import type { Member } from "@/lib/auth/session";

export type HandlerResult = { status: number; body: Record<string, unknown> };

const NOT_SET_UP: HandlerResult = {
  status: 503,
  body: { code: "not-set-up", error: "Editorial storage is not set up on this server yet. The built-in articles are still shown." },
};

function failed(): HandlerResult {
  return { status: 503, body: { code: "unavailable", error: "The editorial records could not be read just now." } };
}

/** Members: the editor's published versions. Without storage, the built-in articles stand alone. */
export async function listForReaders(store: EncyclopediaStore | null): Promise<HandlerResult> {
  if (!store) return { status: 200, body: { records: [], storage: "not-configured" } };
  try {
    return { status: 200, body: { records: await store.listPublished(), storage: "ready" } };
  } catch {
    // A missing table (migration not applied yet) must not break reading.
    return { status: 200, body: { records: [], storage: "unavailable" } };
  }
}

export async function listForAdmin(store: EncyclopediaStore | null): Promise<HandlerResult> {
  if (!store) return NOT_SET_UP;
  try {
    return { status: 200, body: { records: await store.listAll(), builtIn: BUILT_IN_ARTICLES } };
  } catch {
    return failed();
  }
}

/** Save a draft, send it for review, publish, or archive an article in one step. */
export async function saveForAdmin(
  actor: Member,
  input: { article: unknown; status: unknown },
  store: EncyclopediaStore | null,
  today: string,
): Promise<HandlerResult> {
  if (!store) return NOT_SET_UP;
  if (!isArticleStatus(input.status)) return { status: 400, body: { error: "Choose a status." } };
  const checked = validateArticle(input.article, input.status, today);
  if (!checked.ok) return { status: 400, body: { error: checked.errors[0], errors: checked.errors } };
  try {
    await store.save({ slug: checked.value.slug, status: input.status, article: checked.value, actor: actor.id });
    return { status: 200, body: { saved: true, slug: checked.value.slug, status: input.status } };
  } catch {
    return failed();
  }
}

export async function setStatusForAdmin(
  actor: Member,
  input: { slug: unknown; status: unknown },
  store: EncyclopediaStore | null,
  today: string,
): Promise<HandlerResult> {
  if (!store) return NOT_SET_UP;
  const slug = typeof input.slug === "string" ? input.slug : "";
  if (!SLUG_PATTERN.test(slug) || !isArticleStatus(input.status)) return { status: 400, body: { error: "Choose an article and a status." } };
  try {
    const record = await store.get(slug);
    if (!record) return { status: 404, body: { error: "Save the article first." } };
    if (input.status === "published") {
      const checked = validateArticle(record.article, "published", today);
      if (!checked.ok) return { status: 400, body: { error: checked.errors[0], errors: checked.errors } };
    }
    await store.setStatus(slug, input.status, actor.id);
    return { status: 200, body: { saved: true, slug, status: input.status } };
  } catch {
    return failed();
  }
}
