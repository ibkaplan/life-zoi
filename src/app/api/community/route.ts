import { requireMember } from "@/lib/auth/require-member";
import { handleCommunityRequest } from "@/lib/community/handle-request";
import { jsonError, readJson } from "@/lib/http";

function respond(result: { status: number; body: unknown }) {
  return Response.json(result.body, {
    status: result.status,
    headers: { "Cache-Control": "no-store" },
  });
}

export async function GET(request: Request) {
  const checked = await requireMember(request);
  if (!checked.ok) return checked.response;
  return respond(
    await handleCommunityRequest({
      method: "GET",
      authorization: request.headers.get("authorization"),
      body: null,
    }, { readAccount: async () => checked.member }),
  );
}

export async function POST(request: Request) {
  const checked = await requireMember(request);
  if (!checked.ok) return checked.response;
  const body = await readJson(request, 8_000);
  if (!body.ok) return jsonError(body.error, body.status);
  return respond(
    await handleCommunityRequest({
      method: "POST",
      authorization: request.headers.get("authorization"),
      body: body.value,
    }, { readAccount: async () => checked.member }),
  );
}
