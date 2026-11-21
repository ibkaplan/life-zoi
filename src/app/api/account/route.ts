import { memberFromRequest } from "@/lib/auth/session";

/** The signed-in member's own sign-in facts. Never another person's. */
export async function GET(request: Request) {
  const state = await memberFromRequest(request);
  const headers = { "Cache-Control": "private, no-store" };
  if (state.status !== "member") {
    return Response.json({ signedIn: false, isAdmin: false, email: null }, { status: 401, headers });
  }
  return Response.json(
    { signedIn: true, isAdmin: state.member.isAdmin, email: state.member.email },
    { headers },
  );
}
