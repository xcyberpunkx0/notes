import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getDb } from "./client";
import { schedule, type Rating, type ReviewState } from "@/lib/scheduler";

export interface DueReview {
  id: number;
  item_type: "note" | "problem";
  item_id: number;
  due_at: string;
  interval_days: number;
  ease: number;
  reps: number;
  lapses: number;
  title: string;
  hint: string | null; // six_month_note for problems, topic name for notes
}

/** Enrolls an item into spaced repetition, due tomorrow. No-op if enrolled. */
export async function enrollInReview(
  itemType: "note" | "problem",
  itemId: number,
) {
  const db = await getDb();
  await db.execute(
    `INSERT OR IGNORE INTO reviews (item_type, item_id, due_at, interval_days, ease, reps, lapses)
     VALUES ($1, $2, datetime('now', '+1 day'), 0, 2.5, 0, 0)`,
    [itemType, itemId],
  );
}

export function useDueReviews() {
  return useQuery({
    queryKey: ["reviews", "due"],
    queryFn: async () => {
      const db = await getDb();
      return db.select<DueReview[]>(
        `SELECT r.*,
          CASE r.item_type
            WHEN 'note' THEN COALESCE(NULLIF((SELECT title FROM notes WHERE id = r.item_id), ''), 'Untitled')
            WHEN 'problem' THEN (SELECT title FROM problems WHERE id = r.item_id)
          END AS title,
          CASE r.item_type
            WHEN 'problem' THEN (SELECT COALESCE(six_month_note, unlock_pattern) FROM problems WHERE id = r.item_id)
            WHEN 'note' THEN (SELECT t.name FROM notes n LEFT JOIN topics t ON t.id = n.topic_id WHERE n.id = r.item_id)
          END AS hint
         FROM reviews r
         WHERE r.due_at <= datetime('now')
         ORDER BY r.due_at ASC
         LIMIT 30`,
      );
    },
    select: (rows: DueReview[]) => rows.filter((r) => r.title != null),
  });
}

export function useDueCount() {
  return useQuery({
    queryKey: ["reviews", "due-count"],
    queryFn: async () => {
      const db = await getDb();
      const rows = await db.select<{ n: number }[]>(
        `SELECT COUNT(*) AS n FROM reviews r
         WHERE r.due_at <= datetime('now')
           AND (
             (r.item_type = 'note' AND EXISTS (SELECT 1 FROM notes WHERE id = r.item_id))
             OR (r.item_type = 'problem' AND EXISTS (SELECT 1 FROM problems WHERE id = r.item_id))
           )`,
      );
      return rows[0]?.n ?? 0;
    },
  });
}

export function useRateReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { review: DueReview; rating: Rating }) => {
      const db = await getDb();
      const state: ReviewState = {
        interval_days: input.review.interval_days,
        ease: input.review.ease,
        reps: input.review.reps,
        lapses: input.review.lapses,
      };
      const { next, dueAt } = schedule(state, input.rating, new Date());
      await db.execute(
        `UPDATE reviews SET interval_days = $1, ease = $2, reps = $3, lapses = $4,
           due_at = $5, last_reviewed_at = datetime('now') WHERE id = $6`,
        [
          next.interval_days,
          next.ease,
          next.reps,
          next.lapses,
          dueAt.toISOString().replace("T", " ").slice(0, 19),
          input.review.id,
        ],
      );
      await db.execute(
        `INSERT INTO review_log (review_id, rating) VALUES ($1, $2)`,
        [input.review.id, input.rating],
      );
      const today = new Date().toISOString().slice(0, 10);
      await db.execute(
        `INSERT INTO activity (date, reviews_done) VALUES ($1, 1)
         ON CONFLICT(date) DO UPDATE SET reviews_done = reviews_done + 1`,
        [today],
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reviews"] });
      qc.invalidateQueries({ queryKey: ["activity"] });
    },
  });
}

export interface ActivityDay {
  date: string;
  notes_created: number;
  problems_logged: number;
  reviews_done: number;
}

export function useActivity() {
  return useQuery({
    queryKey: ["activity"],
    queryFn: async () => {
      const db = await getDb();
      return db.select<ActivityDay[]>(
        `SELECT * FROM activity ORDER BY date DESC LIMIT 400`,
      );
    },
  });
}

/**
 * Consecutive active days ending today or yesterday (a streak survives
 * until a full day is missed). Pure — unit tested.
 */
export function computeStreak(
  activeDates: string[],
  todayIso: string,
): number {
  const active = new Set(activeDates);
  const today = new Date(todayIso + "T00:00:00Z");
  let cursor = active.has(todayIso)
    ? today
    : new Date(today.getTime() - 86_400_000);
  let streak = 0;
  for (;;) {
    const iso = cursor.toISOString().slice(0, 10);
    if (!active.has(iso)) break;
    streak += 1;
    cursor = new Date(cursor.getTime() - 86_400_000);
  }
  return streak;
}

export function useStreak() {
  const { data: activity } = useActivity();
  if (!activity) return 0;
  const activeDates = activity
    .filter(
      (a) => a.notes_created + a.problems_logged + a.reviews_done > 0,
    )
    .map((a) => a.date);
  return computeStreak(activeDates, new Date().toISOString().slice(0, 10));
}
