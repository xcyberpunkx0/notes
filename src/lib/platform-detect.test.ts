import { describe, expect, it } from "vitest";
import { detectPlatform, titleFromUrl } from "./platform-detect";

describe("detectPlatform", () => {
  it("detects major platforms from URLs", () => {
    expect(detectPlatform("https://leetcode.com/problems/two-sum/")).toBe("LeetCode");
    expect(detectPlatform("https://codeforces.com/problemset/problem/1/A")).toBe("Codeforces");
    expect(detectPlatform("https://atcoder.jp/contests/abc001/tasks/abc001_1")).toBe("AtCoder");
    expect(detectPlatform("https://www.codechef.com/problems/TEST")).toBe("CodeChef");
    expect(detectPlatform("https://cses.fi/problemset/task/1068")).toBe("CSES");
  });

  it("handles URLs without protocol", () => {
    expect(detectPlatform("leetcode.com/problems/two-sum")).toBe("LeetCode");
  });

  it("returns Other for unknown hosts and null for empty/invalid", () => {
    expect(detectPlatform("https://example.com/p/1")).toBe("Other");
    expect(detectPlatform("")).toBeNull();
    expect(detectPlatform("   ")).toBeNull();
  });
});

describe("titleFromUrl", () => {
  it("builds a title from a LeetCode slug", () => {
    expect(titleFromUrl("https://leetcode.com/problems/koko-eating-bananas/")).toBe(
      "Koko Eating Bananas",
    );
  });

  it("returns null when there is no usable slug", () => {
    expect(titleFromUrl("https://codeforces.com/problemset/problem/1/A")).toBeNull();
  });
});
