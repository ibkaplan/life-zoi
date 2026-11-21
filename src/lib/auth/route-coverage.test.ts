import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";
import { PUBLIC_APIS, PUBLIC_PAGES } from "@/lib/auth/public-paths";

const APP = join(process.cwd(), "src", "app");

function files(dir: string, name: RegExp): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) return files(path, name);
    return name.test(entry) ? [path] : [];
  });
}

/** "/api/ai-assistant/wellness" from "src/app/api/ai-assistant/wellness/route.ts", dropping (groups). */
function urlOf(file: string): string {
  const parts = relative(APP, file).split("/").slice(0, -1).filter((part) => !/^\(.*\)$/.test(part));
  return `/${parts.join("/")}`;
}

describe("every page and API is members-only unless it is on the public list", () => {
  it("guards every members' API route on the server", () => {
    const routes = files(join(APP, "api"), /^route\.ts$/);
    expect(routes.length).toBeGreaterThan(8);
    for (const file of routes) {
      const url = urlOf(file);
      if ((PUBLIC_APIS as readonly string[]).includes(url)) continue;
      const code = readFileSync(file, "utf8");
      const handlers = code.match(/export async function (GET|POST|PUT|PATCH|DELETE)/g) ?? [];
      const checks = code.match(/await (requireMember|requireAdmin|memberFromRequest)\(request\)/g) ?? [];
      expect(handlers.length, url).toBeGreaterThan(0);
      expect(checks.length, `${url}: every handler checks the sign-in`).toBe(handlers.length);
    }
  });

  it("keeps route handlers inside members' pages behind the sign-in check too", () => {
    const routes = files(join(APP, "(members)"), /^route\.ts$/);
    for (const file of routes) {
      expect(urlOf(file).startsWith("/api"), file).toBe(false);
    }
  });

  it("puts each page either in the members' group, behind MemberGate, or on the public list", () => {
    const pages = files(APP, /^page\.tsx$/);
    const publicPages = new Set<string>();
    for (const file of pages) {
      const rel = relative(APP, file);
      const url = urlOf(file);
      if (rel.startsWith("(members)/")) continue;
      if (rel.startsWith("(public)/") || rel === "page.tsx") {
        publicPages.add(url);
        continue;
      }
      expect(readFileSync(file, "utf8"), rel).toContain("<MemberGate>");
    }
    expect([...publicPages].sort()).toEqual([...PUBLIC_PAGES].sort());
    const members = readFileSync(join(APP, "(members)", "layout.tsx"), "utf8");
    expect(members).toContain("<MemberGate>");
  });

  it("never imports the service role client into browser code", () => {
    for (const file of files(join(process.cwd(), "src"), /\.tsx?$/)) {
      const code = readFileSync(file, "utf8");
      if (!/^["']use client["']/.test(code.trimStart())) continue;
      expect(code, file).not.toMatch(/supabase-admin|invitations\/supabase-store|SUPABASE_SERVICE_ROLE_KEY/);
    }
  });

  it("matches the proxy on every page and API, leaving out only build files and landing images", () => {
    const proxy = readFileSync(join(process.cwd(), "src", "proxy.ts"), "utf8");
    expect(proxy).toContain("export async function proxy");
    expect(proxy).toContain('"/((?!_next/static|_next/image|__nextjs|icon\\\\.svg|favicon\\\\.ico|home/).*)"');
  });
});
