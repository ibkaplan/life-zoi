import { describe, expect, it } from "vitest";
import { decideGate, isPublicPath, MEMBER_HOME, PUBLIC_PAGES, safeNextPath, signInLocation } from "@/lib/auth/public-paths";

describe("members-only gate", () => {
  it("lets a visitor open only the public pages", () => {
    for (const page of PUBLIC_PAGES) {
      expect(decideGate({ pathname: page, status: "signed-out" })).toEqual({ kind: "next" });
    }
    expect(decideGate({ pathname: "/sign-in/", status: "signed-out" })).toEqual({ kind: "next" });
  });

  it("sends a visitor who types a members' address to sign-in, keeping where they were going", () => {
    for (const path of ["/dashboard", "/assessment", "/what-if", "/ai-assistant", "/library/music", "/brain-quiz/games", "/academy/move/library", "/settings", "/admin/invitations"]) {
      const decision = decideGate({ pathname: path, status: "signed-out" });
      expect(decision).toEqual({ kind: "redirect", location: `/sign-in?next=${encodeURIComponent(path)}` });
    }
    expect(decideGate({ pathname: "/what-if", search: "?habit=walk", status: "signed-out" })).toEqual({
      kind: "redirect",
      location: `/sign-in?next=${encodeURIComponent("/what-if?habit=walk")}`,
    });
  });

  it("treats an unfinished two-step sign-in and a missing configuration as signed out", () => {
    expect(decideGate({ pathname: "/dashboard", status: "needs-mfa" }).kind).toBe("redirect");
    expect(decideGate({ pathname: "/dashboard", status: "not-configured" }).kind).toBe("redirect");
    expect(decideGate({ pathname: "/api/what-if", status: "needs-mfa" })).toEqual({ kind: "deny", status: 401 });
    expect(decideGate({ pathname: "/api/what-if", status: "not-configured" })).toEqual({ kind: "deny", status: 503 });
  });

  it("answers 401 to members' APIs and leaves the two public APIs open", () => {
    for (const api of ["/api/what-if", "/api/recommendations", "/api/ai-assistant", "/api/ai-assistant/wellness", "/api/news", "/api/references", "/api/community", "/api/account", "/api/admin/invitations"]) {
      expect(decideGate({ pathname: api, status: "signed-out" })).toEqual({ kind: "deny", status: 401 });
      expect(decideGate({ pathname: api, status: "member" })).toEqual({ kind: "next" });
    }
    expect(decideGate({ pathname: "/api/status", status: "signed-out" })).toEqual({ kind: "next" });
    expect(decideGate({ pathname: "/api/register", status: "signed-out" })).toEqual({ kind: "next" });
  });

  it("serves the members' home at / for a member and the landing page for a visitor", () => {
    expect(decideGate({ pathname: "/", status: "member" })).toEqual({ kind: "rewrite", pathname: MEMBER_HOME });
    expect(decideGate({ pathname: "/", status: "signed-out" })).toEqual({ kind: "next" });
    expect(decideGate({ pathname: MEMBER_HOME, status: "signed-out" })).toEqual({ kind: "redirect", location: "/sign-in" });
  });

  it("does not treat look-alike paths as public", () => {
    expect(isPublicPath("/sign-in-now")).toBe(false);
    expect(isPublicPath("/welcome/../dashboard")).toBe(false);
    expect(isPublicPath("/privacy/extra")).toBe(false);
    expect(isPublicPath("/api/status/extra")).toBe(false);
    expect(isPublicPath("/home")).toBe(false);
    expect(isPublicPath("/home/hero-meadow.webp")).toBe(true);
    expect(isPublicPath("/audio/classical/track.mp3")).toBe(false);
  });
});

describe("return address after sign-in", () => {
  it("keeps only same-site paths", () => {
    expect(safeNextPath("/what-if?habit=walk")).toBe("/what-if?habit=walk");
    expect(safeNextPath("/")).toBe("/");
    for (const bad of ["https://evil.example/", "//evil.example", "/\\evil.example", "javascript:alert(1)", "", null, "/sign-in", "/accept-invite", "/api/account", "/home", "/x\u0000"]) {
      expect(safeNextPath(bad as string | null)).toBeNull();
    }
    expect(signInLocation("/")).toBe("/sign-in");
  });
});
