import type { FieldError } from "@/lib/assessment";

export async function readJson(request: Request): Promise<{ ok: true; value: unknown } | { ok: false; status: number; message: string }> {
  const length = request.headers.get("content-length");
  if (length && Number(length) > 20_000) {
    return { ok: false, status: 413, message: "Request is too large." };
  }
  const text = await request.text();
  if (text.length > 20_000) {
    return { ok: false, status: 413, message: "Request is too large." };
  }
  try {
    return { ok: true, value: JSON.parse(text) as unknown };
  } catch {
    return { ok: false, status: 400, message: "Send a JSON body." };
  }
}

export function validationResponse(errors: FieldError[]): Response {
  return Response.json({ ok: false, errors }, { status: 400 });
}

export function acceptedResponse(): Response {
  return Response.json({ ok: true });
}

export function failureResponse(status: number, message: string): Response {
  return Response.json({ ok: false, message }, { status });
}
