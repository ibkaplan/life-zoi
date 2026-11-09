import { describe, expect, it } from "vitest";
import { departmentFor } from "@/lib/departments";

describe("department themes", () => {
  it("maps existing sections to their accent", () => {
    expect(departmentFor("/food-plan/profile")).toBe("nutrition");
    expect(departmentFor("/academy/move/library")).toBe("yoga");
    expect(departmentFor("/academy/move/studio/find")).toBe("movement");
    expect(departmentFor("/brain-quiz/games")).toBe("brain");
    expect(departmentFor("/library/music")).toBe("reading");
    expect(departmentFor("/progress")).toBe("progress");
    expect(departmentFor("/my-day")).toBe("plan");
    expect(departmentFor("/settings")).toBe("home");
  });
});
