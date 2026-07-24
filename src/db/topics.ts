import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getDb } from "./client";

export interface Topic {
  id: number;
  parent_id: number | null;
  name: string;
  slug: string;
  icon: string | null;
  color: string | null;
  sort_order: number;
  created_at: string;
  note_count: number;
}

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function listTopics(): Promise<Topic[]> {
  const db = await getDb();
  return db.select<Topic[]>(
    `SELECT t.*, (SELECT COUNT(*) FROM notes n WHERE n.topic_id = t.id) AS note_count
     FROM topics t
     ORDER BY t.sort_order, t.name`,
  );
}

export function useTopics() {
  return useQuery({ queryKey: ["topics"], queryFn: listTopics });
}

export function useTopic(id: number) {
  return useQuery({
    queryKey: ["topics", id],
    queryFn: async () => {
      const db = await getDb();
      const rows = await db.select<Topic[]>(
        `SELECT t.*, (SELECT COUNT(*) FROM notes n WHERE n.topic_id = t.id) AS note_count
         FROM topics t WHERE t.id = $1`,
        [id],
      );
      return rows[0] ?? null;
    },
  });
}

export function useCreateTopic() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      name: string;
      icon: string;
      color: string;
      parent_id?: number | null;
    }) => {
      const db = await getDb();
      const slug = slugify(input.name) || `topic-${Date.now()}`;
      const result = await db.execute(
        `INSERT INTO topics (name, slug, icon, color, parent_id)
         VALUES ($1, $2, $3, $4, $5)`,
        [input.name, slug, input.icon, input.color, input.parent_id ?? null],
      );
      return result.lastInsertId;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["topics"] }),
  });
}

export function useDeleteTopic() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const db = await getDb();
      await db.execute(`DELETE FROM topics WHERE id = $1`, [id]);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["topics"] });
      qc.invalidateQueries({ queryKey: ["notes"] });
    },
  });
}
