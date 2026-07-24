/**
 * SM-2-lite spaced repetition scheduler. Pure functions, no I/O.
 *
 * Ratings: forgot (lapse), hard, good, easy.
 * Intervals grow multiplicatively with an ease factor clamped to [1.3, 3.0].
 */

export type Rating = "forgot" | "hard" | "good" | "easy";

export interface ReviewState {
  interval_days: number;
  ease: number;
  reps: number;
  lapses: number;
}

export interface ScheduleResult {
  next: ReviewState;
  dueAt: Date;
}

export const INITIAL_REVIEW_STATE: ReviewState = {
  interval_days: 0,
  ease: 2.5,
  reps: 0,
  lapses: 0,
};

const MIN_EASE = 1.3;
const MAX_EASE = 3.0;
const MS_PER_DAY = 86_400_000;

function clampEase(ease: number): number {
  return Math.min(MAX_EASE, Math.max(MIN_EASE, ease));
}

export function schedule(
  state: ReviewState,
  rating: Rating,
  now: Date,
): ScheduleResult {
  let { interval_days, ease, reps, lapses } = state;

  switch (rating) {
    case "forgot":
      lapses += 1;
      reps = 0;
      ease = clampEase(ease - 0.2);
      interval_days = 1;
      break;
    case "hard":
      reps += 1;
      ease = clampEase(ease - 0.15);
      interval_days = reps <= 1 ? 1 : Math.max(1, interval_days * 1.2);
      break;
    case "good":
      reps += 1;
      interval_days =
        reps === 1 ? 1 : reps === 2 ? 3 : Math.max(1, interval_days * ease);
      break;
    case "easy":
      reps += 1;
      ease = clampEase(ease + 0.05);
      interval_days =
        reps === 1
          ? 2
          : reps === 2
            ? 5
            : Math.max(1, interval_days * ease * 1.3);
      break;
  }

  interval_days = Math.round(interval_days * 10) / 10;
  const dueAt = new Date(now.getTime() + interval_days * MS_PER_DAY);
  return { next: { interval_days, ease, reps, lapses }, dueAt };
}
