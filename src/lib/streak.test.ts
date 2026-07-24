import { describe, expect, it } from "vitest";
import { computeStreak } from "@/db/reviews";

describe("computeStreak", () => {
  it("counts consecutive days ending today", () => {
    expect(
      computeStreak(["2026-07-24", "2026-07-23", "2026-07-22"], "2026-07-24"),
    ).toBe(3);
  });

  it("survives when today has no activity yet (ends yesterday)", () => {
    expect(computeStreak(["2026-07-23", "2026-07-22"], "2026-07-24")).toBe(2);
  });

  it("breaks on a missed day", () => {
    expect(computeStreak(["2026-07-24", "2026-07-22"], "2026-07-24")).toBe(1);
  });

  it("is zero with no recent activity", () => {
    expect(computeStreak(["2026-07-20"], "2026-07-24")).toBe(0);
    expect(computeStreak([], "2026-07-24")).toBe(0);
  });
});
