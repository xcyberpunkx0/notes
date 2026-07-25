import { useQuery } from "@tanstack/react-query";
import { getDb } from "@/db/client";

const STATIC_TITLES: Record<string, string> = {
  "/": "Home",
  "/review": "Review",
  "/topics": "Topics",
  "/problems": "Problems",
  "/resolve": "Re-solve",
  "/graph": "Graph",
};

/** Pure resolver for statically-known routes (no DB lookup). */
export function pageTitleFor(path: string): string | undefined {
  const clean = path.split("?")[0];
  return STATIC_TITLES[clean];
}

/**
 * Resolves a route's display title, including DB-backed dynamic titles
 * (notes/problems/topics detail pages). Shared by TabBar and TitleBar so
 * both surfaces agree on what a page is called.
 */
export function useTabTitle(path: string): string {
  const clean = path.split("?")[0];
  const noteId = clean.match(/^\/notes\/(\d+)$/)?.[1];
  const problemId = clean.match(/^\/problems\/(\d+)$/)?.[1];
  const topicId = clean.match(/^\/topics\/(\d+)$/)?.[1];
  const dynamic = noteId ?? problemId ?? topicId;

  const { data } = useQuery({
    queryKey: ["tab-title", clean],
    enabled: !!dynamic,
    staleTime: 10_000,
    queryFn: async () => {
      const db = await getDb();
      if (noteId) {
        const rows = await db.select<{ title: string }[]>(
          `SELECT COALESCE(NULLIF(title, ''), 'Untitled') AS title FROM notes WHERE id = $1`,
          [noteId],
        );
        return rows[0]?.title ?? "Note";
      }
      if (problemId) {
        const rows = await db.select<{ title: string }[]>(
          `SELECT title FROM problems WHERE id = $1`,
          [problemId],
        );
        return rows[0]?.title ?? "Problem";
      }
      const rows = await db.select<{ name: string }[]>(
        `SELECT name FROM topics WHERE id = $1`,
        [topicId],
      );
      return rows[0]?.name ?? "Topic";
    },
  });

  if (dynamic) return data ?? "…";
  return pageTitleFor(clean) ?? "Trove";
}
