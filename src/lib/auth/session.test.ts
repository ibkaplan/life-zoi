import { describe, expect, it } from "vitest";
import { bearerToken, jwtPayload, memberFromCookies, memberFromRequest, stateFor, verifyAccessToken } from "@/lib/auth/session";

const ID = "00000000-0000-4000-8000-000000000001";

describe("server sign-in state", () => {
  it("needs an id and email to count as a member", () => {
    expect(stateFor(null, "aal1")).toEqual({ status: "signed-out" });
    expect(stateFor({ id: "not-a-uuid", email: "a@example.org" }, "aal1")).toEqual({ status: "signed-out" });
    expect(stateFor({ id: ID, email: "" }, "aal1")).toEqual({ status: "signed-out" });
    expect(stateFor({ id: ID, email: "a@example.org" }, "aal1")).toEqual({
      status: "member",
      member: { id: ID, email: "a@example.org", isAdmin: false },
    });
  });

  it("asks for the authenticator code when a factor is confirmed", () => {
    const user = { id: ID, email: "a@example.org", factors: [{ status: "verified" }] };
    expect(stateFor(user, "aal1")).toEqual({ status: "needs-mfa" });
    expect(stateFor(user, "aal2").status).toBe("member");
    expect(stateFor({ ...user, factors: [{ status: "unverified" }] }, "aal1").status).toBe("member");
  });

  it("reads only a well-formed bearer header", () => {
    expect(bearerToken(null)).toBeNull();
    expect(bearerToken("Basic abc")).toBeNull();
    expect(bearerToken("Bearer short")).toBeNull();
    expect(bearerToken(`Bearer ${"a".repeat(30)}`)).toBe("a".repeat(30));
  });

  it("decodes a JWT payload", () => {
    const payload = Buffer.from(JSON.stringify({ aal: "aal2" })).toString("base64url");
    expect(jwtPayload(`x.${payload}.y`)).toEqual({ aal: "aal2" });
    expect(jwtPayload("nonsense")).toBeNull();
  });

  it("fails closed when Supabase is not configured", async () => {
    expect(await verifyAccessToken("a".repeat(40), {})).toEqual({ status: "not-configured" });
    expect(await memberFromCookies({ getAll: () => [{ name: "sb-x-auth-token", value: "v" }] }, { env: {} })).toEqual({
      status: "not-configured",
    });
    expect(await memberFromRequest(new Request("http://localhost/api/what-if"), {})).toEqual({ status: "not-configured" });
  });

  it("treats a request without a session cookie as signed out without calling Supabase", async () => {
    const env = { NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co", NEXT_PUBLIC_SUPABASE_ANON_KEY: "public-anon-key-value" };
    expect(await memberFromCookies({ getAll: () => [{ name: "lifezoi.locale", value: "en" }] }, { env, quick: true })).toEqual({
      status: "signed-out",
    });
  });
});
