const MAX_BODY = 20_000;

export async function readJson(
  request: Request,
): Promise<{ ok: true; value: unknown } | { ok: false; status: number; error: string }> {
  let text = "";
  try {
    text = await request.text();
  } catch {
    return { ok: false, status: 400, error: "The request could not be read." };
  }
  if (text.length > MAX_BODY) {
    return { ok: false, status: 413, error: "That request is too large." };
  }
  try {
    return { ok: true, value: text ? (JSON.parse(text) as unknown) : null };
  } catch {
    return { ok: false, status: 400, error: "The request could not be read." };
  }
}

export function jsonError(error: string, status: number, fields?: Record<string, string>) {
  return Response.json(fields ? { error, fields } : { error }, { status });
}
