import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getDb } from "./client";
import { extractLinks, extractText, type BlockNode } from "@/lib/extract-text";
import { syncLinks } from "./links";

export interface NoteSummary {
  id: number;
  topic_id: number | null;
  title: string;
  is_pinned: number;
  is_favorite: number;
  created_at: string;
  updated_at: string;
}

export interface Note extends NoteSummary {
  content_json: string;
}

export function useNotesByTopic(topicId: number) {
  return useQuery({
    queryKey: ["notes", "topic", topicId],
    queryFn: async () => {
      const db = await getDb();
      return db.select<NoteSummary[]>(
        `SELECT id, topic_id, title, is_pinned, is_favorite, created_at, updated_at
         FROM notes WHERE topic_id = $1 ORDER BY updated_at DESC`,
        [topicId],
      );
    },
  });
}

export function useNote(id: number) {
  return useQuery({
    queryKey: ["notes", id],
    queryFn: async () => {
      const db = await getDb();
      const rows = await db.select<Note[]>(
        `SELECT * FROM notes WHERE id = $1`,
        [id],
      );
      return rows[0] ?? null;
    },
  });
}

export function useCreateNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { topic_id: number; title?: string }) => {
      const db = await getDb();
      const result = await db.execute(
        `INSERT INTO notes (topic_id, title) VALUES ($1, $2)`,
        [input.topic_id, input.title ?? ""],
      );
      const id = result.lastInsertId as number;
      await db.execute(
        `INSERT INTO notes_fts (rowid, title, content_text) VALUES ($1, $2, $3)`,
        [id, input.title ?? "", ""],
      );
      const today = new Date().toISOString().slice(0, 10);
      await db.execute(
        `INSERT INTO activity (date, notes_created) VALUES ($1, 1)
         ON CONFLICT(date) DO UPDATE SET notes_created = notes_created + 1`,
        [today],
      );
      return id;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notes"] }),
  });
}

export async function saveNoteContent(
  id: number,
  title: string,
  blocks: BlockNode[],
) {
  const db = await getDb();
  const contentJson = JSON.stringify(blocks);
  const contentText = extractText(blocks);
  await db.execute(
    `UPDATE notes SET title = $1, content_json = $2, updated_at = datetime('now') WHERE id = $3`,
    [title, contentJson, id],
  );
  await db.execute(`DELETE FROM notes_fts WHERE rowid = $1`, [id]);
  await db.execute(
    `INSERT INTO notes_fts (rowid, title, content_text) VALUES ($1, $2, $3)`,
    [id, title, contentText],
  );
  await syncLinks("note", id, extractLinks(blocks));
}

export function useDeleteNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const db = await getDb();
      await db.execute(`DELETE FROM notes WHERE id = $1`, [id]);
      await db.execute(`DELETE FROM notes_fts WHERE rowid = $1`, [id]);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notes"] }),
  });
}
