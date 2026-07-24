import { describe, expect, it } from "vitest";
import {
  INITIAL_REVIEW_STATE,
  schedule,
  type ReviewState,
} from "./scheduler";

const NOW = new Date("2026-07-24T12:00:00Z");
const DAY = 86_400_000;

describe("schedule", () => {
  it("first good review comes back in 1 day, second in 3", () => {
    const first = schedule(INITIAL_REVIEW_STATE, "good", NOW);
    expect(first.next.interval_days).toBe(1);
    expect(first.dueAt.getTime()).toBe(NOW.getTime() + DAY);

    const second = schedule(first.next, "good", NOW);
    expect(second.next.interval_days).toBe(3);
  });

  it("intervals grow multiplicatively after the second rep", () => {
    let state: ReviewState = INITIAL_REVIEW_STATE;
    for (let i = 0; i < 3; i++) state = schedule(state, "good", NOW).next;
    // third good: 3 * 2.5 = 7.5 days
    expect(state.interval_days).toBe(7.5);
  });

  it("forgot resets reps, records a lapse, and comes back tomorrow", () => {
    let state: ReviewState = INITIAL_REVIEW_STATE;
    for (let i = 0; i < 3; i++) state = schedule(state, "good", NOW).next;
    const lapsed = schedule(state, "forgot", NOW).next;
    expect(lapsed.reps).toBe(0);
    expect(lapsed.lapses).toBe(1);
    expect(lapsed.interval_days).toBe(1);
    expect(lapsed.ease).toBeLessThan(2.5);
  });

  it("ease never drops below 1.3 or rises above 3.0", () => {
    let state: ReviewState = INITIAL_REVIEW_STATE;
    for (let i = 0; i < 20; i++) state = schedule(state, "forgot", NOW).next;
    expect(state.ease).toBe(1.3);

    let up: ReviewState = INITIAL_REVIEW_STATE;
    for (let i = 0; i < 20; i++) up = schedule(up, "easy", NOW).next;
    expect(up.ease).toBeLessThanOrEqual(3.0);
  });

  it("easy grows faster than good", () => {
    let good: ReviewState = INITIAL_REVIEW_STATE;
    let easy: ReviewState = INITIAL_REVIEW_STATE;
    for (let i = 0; i < 4; i++) {
      good = schedule(good, "good", NOW).next;
      easy = schedule(easy, "easy", NOW).next;
    }
    expect(easy.interval_days).toBeGreaterThan(good.interval_days);
  });

  it("hard keeps the item close without resetting progress", () => {
    let state: ReviewState = INITIAL_REVIEW_STATE;
    for (let i = 0; i < 3; i++) state = schedule(state, "good", NOW).next;
    const before = state.interval_days;
    const after = schedule(state, "hard", NOW).next;
    expect(after.reps).toBe(state.reps + 1);
    expect(after.interval_days).toBeLessThan(before * 2.5);
    expect(after.interval_days).toBeGreaterThanOrEqual(before);
  });
});
