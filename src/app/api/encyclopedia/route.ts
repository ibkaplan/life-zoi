import { requireMember } from "@/lib/auth/require-member";
import { listForReaders } from "@/lib/encyclopedia/service";
import { encyclopediaStoreFromEnv } from "@/lib/encyclopedia/store";

/** Members: articles an editor has published or changed. The built-in articles ship with the page. */
export async function GET(request: Request) {
  const checked = await requireMember(request);
  if (!checked.ok) return checked.response;
  const result = await listForReaders(encyclopediaStoreFromEnv());
  return Response.json(result.body, { status: result.status, headers: { "Cache-Control": "private, no-store" } });
}
