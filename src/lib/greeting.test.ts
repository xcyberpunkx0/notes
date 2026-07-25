import { describe, expect, it } from "vitest";
import { greeting, GREETINGS } from "./greeting";

describe("greeting", () => {
  it("uses the morning bucket before noon", () => {
    expect(GREETINGS.morning).toContain(greeting(new Date(2026, 6, 25, 9)));
  });
  it("uses the evening bucket after 17:00", () => {
    expect(GREETINGS.evening).toContain(greeting(new Date(2026, 6, 25, 21)));
  });
  it("is stable within a day", () => {
    expect(greeting(new Date(2026, 6, 25, 13))).toBe(
      greeting(new Date(2026, 6, 25, 16)),
    );
  });
  it("rotates across days", () => {
    const a = greeting(new Date(2026, 6, 25, 13));
    const b = greeting(new Date(2026, 6, 26, 13));
    expect(a).not.toBe(b);
  });
});
