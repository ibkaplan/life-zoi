import { requireAdmin } from "@/lib/auth/require-member";
import { localISODate } from "@/lib/dates";
import { listForAdmin, saveForAdmin, setStatusForAdmin } from "@/lib/encyclopedia/service";
import { encyclopediaStoreFromEnv } from "@/lib/encyclopedia/store";
import { jsonError, readJson } from "@/lib/http";

const NO_STORE = { "Cache-Control": "private, no-store" };

/** Administrator only: every editorial record, including drafts and archived articles. */
export async function GET(request: Request) {
  const checked = await requireAdmin(request);
  if (!checked.ok) return checked.response;
  const result = await listForAdmin(encyclopediaStoreFromEnv());
  return Response.json(result.body, { status: result.status, headers: NO_STORE });
}

/** Save an article with a status (draft, in review, published, archived). */
export async function POST(request: Request) {
  const checked = await requireAdmin(request);
  if (!checked.ok) return checked.response;
  const body = await readJson(request, 120_000);
  if (!body.ok) return jsonError(body.error, body.status);
  const value = (body.value && typeof body.value === "object" ? body.value : {}) as { article?: unknown; status?: unknown };
  const result = await saveForAdmin(checked.member, { article: value.article, status: value.status }, encyclopediaStoreFromEnv(), localISODate());
  return Response.json(result.body, { status: result.status, headers: NO_STORE });
}

/** Change only the status of a saved article. */
export async function PATCH(request: Request) {
  const checked = await requireAdmin(request);
  if (!checked.ok) return checked.response;
  const body = await readJson(request, 1_000);
  if (!body.ok) return jsonError(body.error, body.status);
  const value = (body.value && typeof body.value === "object" ? body.value : {}) as { slug?: unknown; status?: unknown };
  const result = await setStatusForAdmin(checked.member, { slug: value.slug, status: value.status }, encyclopediaStoreFromEnv(), localISODate());
  return Response.json(result.body, { status: result.status, headers: NO_STORE });
}
