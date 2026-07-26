import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getDb } from "./client";
import { enrollInReview } from "./reviews";

export interface Problem {
  id: number;
  title: string;
  platform: string | null;
  url: string | null;
  difficulty: string | null;
  date_solved: string | null;
  confidence: number | null;
  time_taken_min: number | null;
  solved_myself: number;
  hints_used: number;
  is_favorite: number;
  solution_link: string | null;
  video_link: string | null;
  concept_taught: string | null;
  wrong_approach: string | null;
  stuck_where: string | null;
  concepts_recalled: string | null;
  mistake_made: string | null;
  unlock_pattern: string | null;
  remember_next: string | null;
  six_month_note: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProblemRow extends Problem {
  topic_names: string | null; // "🕸️ Graphs,🔍 Binary Search"
  topic_ids: string | null;
}

export interface ProblemCode {
  id: number;
  problem_id: number;
  language: string;
  variant: string;
  code: string;
}

export const DEBRIEF_FIELDS = [
  "concept_taught",
  "wrong_approach",
  "stuck_where",
  "concepts_recalled",
  "mistake_made",
  "unlock_pattern",
  "remember_next",
  "six_month_note",
] as const;
export type DebriefField = (typeof DEBRIEF_FIELDS)[number];

const EDITABLE_FIELDS = new Set<string>([
  ...DEBRIEF_FIELDS,
  "title",
  "difficulty",
  "confidence",
  "is_favorite",
  "time_taken_min",
  "solved_myself",
  "hints_used",
  "solution_link",
  "video_link",
]);

export interface ProblemFilters {
  topicId?: number | null;
  difficulty?: string | null;
  platform?: string | null;
  favoritesOnly?: boolean;
}

export function useProblems(filters: ProblemFilters) {
  return useQuery({
    queryKey: ["problems", filters],
    queryFn: async () => {
      const db = await getDb();
      const where: string[] = [];
      const params: unknown[] = [];
      if (filters.difficulty) {
        params.push(filters.difficulty);
        where.push(`p.difficulty = $${params.length}`);
      }
      if (filters.platform) {
        params.push(filters.platform);
        where.push(`p.platform = $${params.length}`);
      }
      if (filters.favoritesOnly) {
        where.push(`p.is_favorite = 1`);
      }
      if (filters.topicId) {
        params.push(filters.topicId);
        where.push(
          `EXISTS (SELECT 1 FROM problem_topics x WHERE x.problem_id = p.id AND x.topic_id = $${params.length})`,
        );
      }
      const sql = `
        SELECT p.*,
          (SELECT GROUP_CONCAT(t.name, ', ')
             FROM problem_topics pt JOIN topics t ON t.id = pt.topic_id
            WHERE pt.problem_id = p.id) AS topic_names,
          (SELECT GROUP_CONCAT(pt.topic_id)
             FROM problem_topics pt WHERE pt.problem_id = p.id) AS topic_ids
        FROM problems p
        ${where.length ? "WHERE " + where.join(" AND ") : ""}
        ORDER BY p.date_solved DESC, p.id DESC`;
      return db.select<ProblemRow[]>(sql, params);
    },
  });
}

export interface RecentProblem {
  id: number;
  title: string;
  difficulty: string | null;
  date_solved: string | null;
}

/** Most recently solved problems, for the home page's "Recently solved" list. */
export function useRecentProblems(limit = 5) {
  return useQuery({
    queryKey: ["problems", "recent", limit],
    queryFn: async () => {
      const db = await getDb();
      return db.select<RecentProblem[]>(
        `SELECT id, title, difficulty, date_solved FROM problems
         ORDER BY date_solved DESC, id DESC LIMIT $1`,
        [limit],
      );
    },
  });
}

export function useProblem(id: number) {
  return useQuery({
    queryKey: ["problems", "detail", id],
    queryFn: async () => {
      const db = await getDb();
      const rows = await db.select<ProblemRow[]>(
        `SELECT p.*,
          (SELECT GROUP_CONCAT(t.name, ', ')
             FROM problem_topics pt JOIN topics t ON t.id = pt.topic_id
            WHERE pt.problem_id = p.id) AS topic_names,
          (SELECT GROUP_CONCAT(pt.topic_id)
             FROM problem_topics pt WHERE pt.problem_id = p.id) AS topic_ids
         FROM problems p WHERE p.id = $1`,
        [id],
      );
      return rows[0] ?? null;
    },
  });
}

async function syncProblemFts(problemId: number) {
  const db = await getDb();
  const rows = await db.select<Problem[]>(
    `SELECT * FROM problems WHERE id = $1`,
    [problemId],
  );
  const p = rows[0];
  if (!p) return;
  const codes = await db.select<ProblemCode[]>(
    `SELECT * FROM problem_code WHERE problem_id = $1`,
    [problemId],
  );
  const debrief = DEBRIEF_FIELDS.map((f) => p[f])
    .filter(Boolean)
    .join("\n");
  const codeText = codes.map((c) => c.code).join("\n");
  await db.execute(`DELETE FROM problems_fts WHERE rowid = $1`, [problemId]);
  await db.execute(
    `INSERT INTO problems_fts (rowid, title, debrief_text, code_text) VALUES ($1, $2, $3, $4)`,
    [problemId, p.title, debrief, codeText],
  );
}

export interface QuickLogInput {
  title: string;
  url: string;
  platform: string | null;
  difficulty: string;
  topic_ids: number[];
  confidence: number;
  solved_myself: boolean;
  hints_used: boolean;
}

export function useQuickLogProblem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: QuickLogInput) => {
      const db = await getDb();
      const result = await db.execute(
        `INSERT INTO problems (title, url, platform, difficulty, confidence, solved_myself, hints_used, date_solved)
         VALUES ($1, $2, $3, $4, $5, $6, $7, date('now'))`,
        [
          input.title,
          input.url || null,
          input.platform,
          input.difficulty,
          input.confidence,
          input.solved_myself ? 1 : 0,
          input.hints_used ? 1 : 0,
        ],
      );
      const id = result.lastInsertId as number;
      for (const topicId of input.topic_ids) {
        await db.execute(
          `INSERT OR IGNORE INTO problem_topics (problem_id, topic_id) VALUES ($1, $2)`,
          [id, topicId],
        );
      }
      const today = new Date().toISOString().slice(0, 10);
      await db.execute(
        `INSERT INTO activity (date, problems_logged) VALUES ($1, 1)
         ON CONFLICT(date) DO UPDATE SET problems_logged = problems_logged + 1`,
        [today],
      );
      await syncProblemFts(id);
      await enrollInReview("problem", id);
      return id;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["problems"] });
      qc.invalidateQueries({ queryKey: ["home"] });
      qc.invalidateQueries({ queryKey: ["reviews"] });
    },
  });
}

export function useUpdateProblemField() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      id: number;
      field: string;
      value: string | number | null;
    }) => {
      if (!EDITABLE_FIELDS.has(input.field)) {
        throw new Error(`Field not editable: ${input.field}`);
      }
      const db = await getDb();
      await db.execute(
        `UPDATE problems SET ${input.field} = $1, updated_at = datetime('now') WHERE id = $2`,
        [input.value, input.id],
      );
      await syncProblemFts(input.id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["problems"] }),
  });
}

export function useProblemCode(problemId: number) {
  return useQuery({
    queryKey: ["problem-code", problemId],
    queryFn: async () => {
      const db = await getDb();
      return db.select<ProblemCode[]>(
        `SELECT * FROM problem_code WHERE problem_id = $1`,
        [problemId],
      );
    },
  });
}

export async function saveProblemCode(
  problemId: number,
  language: string,
  variant: string,
  code: string,
) {
  const db = await getDb();
  const existing = await db.select<ProblemCode[]>(
    `SELECT id FROM problem_code WHERE problem_id = $1 AND language = $2 AND variant = $3`,
    [problemId, language, variant],
  );
  if (existing.length > 0) {
    await db.execute(`UPDATE problem_code SET code = $1 WHERE id = $2`, [
      code,
      existing[0].id,
    ]);
  } else {
    await db.execute(
      `INSERT INTO problem_code (problem_id, language, variant, code) VALUES ($1, $2, $3, $4)`,
      [problemId, language, variant, code],
    );
  }
  await syncProblemFts(problemId);
}

/** A random problem for re-solve practice — favors older solves and lapses. */
export function useRandomProblem(seed: number) {
  return useQuery({
    queryKey: ["problems", "random", seed],
    staleTime: Infinity,
    queryFn: async () => {
      const db = await getDb();
      const rows = await db.select<ProblemRow[]>(
        `SELECT p.*,
          (SELECT GROUP_CONCAT(t.name, ', ')
             FROM problem_topics pt JOIN topics t ON t.id = pt.topic_id
            WHERE pt.problem_id = p.id) AS topic_names,
          (SELECT GROUP_CONCAT(pt.topic_id)
             FROM problem_topics pt WHERE pt.problem_id = p.id) AS topic_ids
         FROM problems p
         ORDER BY (julianday('now') - julianday(COALESCE(p.date_solved, p.created_at)))
                  * (1 + COALESCE((SELECT r.lapses FROM reviews r WHERE r.item_type = 'problem' AND r.item_id = p.id), 0))
                  * (0.5 + (ABS(RANDOM()) % 1000) / 1000.0) DESC
         LIMIT 1`,
      );
      return rows[0] ?? null;
    },
  });
}

export function useDeleteProblem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const db = await getDb();
      await db.execute(`DELETE FROM problems WHERE id = $1`, [id]);
      await db.execute(`DELETE FROM problems_fts WHERE rowid = $1`, [id]);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["problems"] }),
  });
}
