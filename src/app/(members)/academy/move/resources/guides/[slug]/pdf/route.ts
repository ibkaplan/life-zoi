import { guideBySlug } from "@/lib/wellness/exercise-resources/guides";
import { buildGuidePdf } from "@/lib/wellness/exercise-resources/pdf";

export async function GET(_request: Request, context: RouteContext<"/academy/move/resources/guides/[slug]/pdf">) {
  const { slug } = await context.params;
  const guide = guideBySlug(slug);
  if (!guide || guide.tier !== "free") {
    return new Response("Not found", { status: 404, headers: { "Content-Type": "text/plain; charset=utf-8" } });
  }
  const bytes = buildGuidePdf(guide);
  const body = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(body).set(bytes);
  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${guide.filename}"`,
      "Content-Length": String(bytes.byteLength),
      "Cache-Control": "public, max-age=86400",
    },
  });
}
