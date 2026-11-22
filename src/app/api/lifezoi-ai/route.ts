import { requireMember } from "@/lib/auth/require-member";
import { handleQuestion } from "@/lib/encyclopedia/ai/handle";
import { chooseProvider } from "@/lib/encyclopedia/ai/provider";
import { visibleArticles, type EditorialRecord } from "@/lib/encyclopedia/catalog";
import { encyclopediaStoreFromEnv } from "@/lib/encyclopedia/store";
import { jsonError, readJson } from "@/lib/http";

const NO_STORE = { "Cache-Control": "private, no-store" };

let cached: { at: number; records: EditorialRecord[] } | null = null;

/** Published editorial records, kept for a minute so each question does not read the database. */
async function publishedRecords(): Promise<EditorialRecord[]> {
  if (cached && Date.now() - cached.at < 60_000) return cached.records;
  const store = encyclopediaStoreFromEnv();
  let records: EditorialRecord[] = [];
  if (store) {
    try {
      records = await store.listPublished();
    } catch {
      records = [];
    }
  }
  cached = { at: Date.now(), records };
  return records;
}

/**
 * LifeZoi AI. Members only. The question is answered on this server from the
 * encyclopedia articles; it is not stored and not sent to any outside AI service.
 */
export async function POST(request: Request) {
  const checked = await requireMember(request);
  if (!checked.ok) return checked.response;
  const body = await readJson(request, 12_000);
  if (!body.ok) return jsonError(body.error, body.status);
  const value = (body.value && typeof body.value === "object" ? body.value : {}) as { turns?: unknown; length?: unknown; focus?: unknown };
  const result = await handleQuestion(
    { memberId: checked.member.id, turns: value.turns, length: value.length, focusSlug: value.focus },
    { choice: chooseProvider(), articles: visibleArticles(await publishedRecords()) },
  );
  return Response.json(result.body, { status: result.status, headers: NO_STORE });
}
