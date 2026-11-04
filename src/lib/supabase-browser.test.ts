import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("browser Supabase config", () => {
  it("reads public settings as direct property accesses so Next can inline them", () => {
    const browser = readFileSync("src/lib/supabase-browser.ts", "utf8");
    const code = browser
      .split("\n")
      .filter((line) => !line.trim().startsWith("//") && !line.trim().startsWith("*"))
      .join("\n");
    expect(code).toContain("process.env.NEXT_PUBLIC_SUPABASE_URL");
    expect(code).toContain("process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY");
    expect(code).not.toContain("readPublicSupabaseConfig");

    const store = readFileSync("src/lib/account-store.ts", "utf8");
    expect(store).not.toContain("readPublicSupabaseConfig");
    expect(store).toContain("getBrowserSupabase");
  });
});
