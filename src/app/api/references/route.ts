import { HEALTH_REFERENCES } from "@/lib/references/library";
import { lookupLabReference } from "@/lib/medlineplus";

export async function GET(request: Request) {
  const loinc = new URL(request.url).searchParams.get("loinc");
  if (!loinc) {
    return Response.json({
      references: HEALTH_REFERENCES,
      note: "Curated public links. A LOINC query is sent to MedlinePlus only when you ask for a verified code, and the query does not include a personal result.",
    });
  }
  const result = await lookupLabReference(loinc);
  return Response.json(result.body, { status: result.status });
}
