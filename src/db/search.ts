import { useQuery } from "@tanstack/react-query";
import { getDb } from "./client";

export interface SearchResult {
  type: "note" | "problem";
  id: number;
  title: string;
  snippet: string;
}

/** Turns free text into a safe FTS5 prefix-match query. */
export function toFtsQuery(input: string): string {
  const tokens = input
    .split(/\s+/)
    .map((t) => t.replace(/["'*^]/g, ""))
    .filter(Boolean);
  if (tokens.length === 0) return "";
  return tokens.map((t) => `"${t}"*`).join(" ");
}

export function useVaultSearch(rawQuery: string) {
  const fts = toFtsQuery(rawQuery);
  return useQuery({
    queryKey: ["search", fts],
    enabled: fts.length > 0,
    staleTime: 5_000,
    queryFn: async (): Promise<SearchResult[]> => {
      const db = await getDb();
      const [notes, problems] = await Promise.all([
        db.select<{ id: number; title: string; snip: string }[]>(
          `SELECT n.id, n.title, snippet(notes_fts, 1, '', '', ' … ', 10) AS snip
           FROM notes_fts JOIN notes n ON n.id = notes_fts.rowid
           WHERE notes_fts MATCH $1 ORDER BY rank LIMIT 8`,
          [fts],
        ),
        db.select<{ id: number; title: string; snip: string }[]>(
          `SELECT p.id, p.title,
                  snippet(problems_fts, 1, '', '', ' … ', 10) AS snip
           FROM problems_fts JOIN problems p ON p.id = problems_fts.rowid
           WHERE problems_fts MATCH $1 ORDER BY rank LIMIT 8`,
          [fts],
        ),
      ]);
      return [
        ...notes.map((n) => ({
          type: "note" as const,
          id: n.id,
          title: n.title || "Untitled",
          snippet: n.snip,
        })),
        ...problems.map((p) => ({
          type: "problem" as const,
          id: p.id,
          title: p.title,
          snippet: p.snip,
        })),
      ];
    },
  });
}
