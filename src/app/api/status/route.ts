import { getAppStatus } from "@/lib/status";

export async function GET() {
  return Response.json(getAppStatus());
}
