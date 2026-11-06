import { handleCommunityRequest } from "@/lib/community/handle-request";
import { jsonError, readJson } from "@/lib/http";

function respond(result: { status: number; body: unknown }) {
  return Response.json(result.body, {
    status: result.status,
    headers: { "Cache-Control": "no-store" },
  });
}

export async function GET(request: Request) {
  return respond(
    await handleCommunityRequest({
      method: "GET",
      authorization: request.headers.get("authorization"),
      body: null,
    }),
  );
}

export async function POST(request: Request) {
  const body = await readJson(request, 8_000);
  if (!body.ok) return jsonError(body.error, body.status);
  return respond(
    await handleCommunityRequest({
      method: "POST",
      authorization: request.headers.get("authorization"),
      body: body.value,
    }),
  );
}
