import { describe, expect, it } from "vitest";
import { autoLook, LOOK_BOOT_SCRIPT, parseLookChoice, resolveLook } from "./appearance";

describe("page backgrounds", () => {
  it("chooses automatically only from a female or male questionnaire answer", () => {
    expect(autoLook("male")).toBe("blue");
    expect(autoLook("female")).toBe("rose");
    expect(autoLook("another")).toBe("ivory");
    expect(autoLook("prefer-not")).toBe("ivory");
    expect(autoLook("")).toBe("ivory");
    expect(autoLook(null)).toBe("ivory");
    expect(autoLook(undefined)).toBe("ivory");
  });

  it("lets the person's own choice win over the questionnaire", () => {
    expect(resolveLook("ivory", "female")).toBe("ivory");
    expect(resolveLook("rose", "male")).toBe("rose");
    expect(resolveLook("blue", null)).toBe("blue");
    expect(resolveLook("auto", "male")).toBe("blue");
  });

  it("reads a saved choice and falls back to automatic", () => {
    expect(parseLookChoice("rose")).toBe("rose");
    expect(parseLookChoice("auto")).toBe("auto");
    expect(parseLookChoice("dark")).toBe("auto");
    expect(parseLookChoice(null)).toBe("auto");
  });

  it("boot script sets only a known look", () => {
    const set: string[] = [];
    const run = (stored: string | null) =>
      new Function("localStorage", "document", LOOK_BOOT_SCRIPT)(
        { getItem: () => stored },
        { documentElement: { setAttribute: (_: string, value: string) => set.push(value) } },
      );
    run("blue");
    run("<script>");
    run(null);
    expect(set).toEqual(["blue"]);
  });
});
