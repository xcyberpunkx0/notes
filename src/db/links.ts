import { useQuery } from "@tanstack/react-query";
import { getDb } from "./client";

export type LinkableType = "note" | "problem" | "topic";

export interface LinkTarget {
  type: LinkableType;
  id: number;
  title: string;
  subtitle: string | null;
}

/** Searches notes, problems and topics by title for the @-mention menu. */
export async function searchLinkTargets(query: string): Promise<LinkTarget[]> {
  const db = await getDb();
  const like = `%${query}%`;
  const [notes, problems, topics] = await Promise.all([
    db.select<{ id: number; title: string }[]>(
      `SELECT id, title FROM notes WHERE title LIKE $1 ORDER BY updated_at DESC LIMIT 6`,
      [like],
    ),
    db.select<{ id: number; title: string; platform: string | null }[]>(
      `SELECT id, title, platform FROM problems WHERE title LIKE $1 ORDER BY updated_at DESC LIMIT 6`,
      [like],
    ),
    db.select<{ id: number; name: string; icon: string | null }[]>(
      `SELECT id, name, icon FROM topics WHERE name LIKE $1 LIMIT 4`,
      [like],
    ),
  ]);
  return [
    ...notes.map((n) => ({
      type: "note" as const,
      id: n.id,
      title: n.title || "Untitled",
      subtitle: "Note",
    })),
    ...problems.map((p) => ({
      type: "problem" as const,
      id: p.id,
      title: p.title,
      subtitle: p.platform ?? "Problem",
    })),
    ...topics.map((t) => ({
      type: "topic" as const,
      id: t.id,
      title: t.name,
      subtitle: "Topic",
    })),
  ];
}

export interface OutgoingLink {
  target_type: LinkableType;
  target_id: number;
}

/** Replaces all outgoing links for a source with the given set. */
export async function syncLinks(
  sourceType: LinkableType,
  sourceId: number,
  targets: OutgoingLink[],
) {
  const db = await getDb();
  await db.execute(
    `DELETE FROM links WHERE source_type = $1 AND source_id = $2`,
    [sourceType, sourceId],
  );
  for (const t of targets) {
    await db.execute(
      `INSERT OR IGNORE INTO links (source_type, source_id, target_type, target_id) VALUES ($1, $2, $3, $4)`,
      [sourceType, sourceId, t.target_type, t.target_id],
    );
  }
}

export interface Backlink {
  source_type: LinkableType;
  source_id: number;
  title: string;
}

export interface GraphNode {
  key: string; // "topic-3", "note-7", "problem-2"
  type: LinkableType;
  id: number;
  label: string;
  color: string | null;
}

export interface GraphEdge {
  source: string;
  target: string;
}

/** Nodes and edges for the knowledge-graph view. */
export function useGraphData() {
  return useQuery({
    queryKey: ["graph"],
    queryFn: async () => {
      const db = await getDb();
      const [topics, notes, problems, links, problemTopics] =
        await Promise.all([
          db.select<{ id: number; name: string; icon: string | null; color: string | null }[]>(
            `SELECT id, name, icon, color FROM topics`,
          ),
          db.select<{ id: number; title: string; topic_id: number | null }[]>(
            `SELECT id, title, topic_id FROM notes`,
          ),
          db.select<{ id: number; title: string }[]>(
            `SELECT id, title FROM problems`,
          ),
          db.select<{ source_type: string; source_id: number; target_type: string; target_id: number }[]>(
            `SELECT source_type, source_id, target_type, target_id FROM links`,
          ),
          db.select<{ problem_id: number; topic_id: number }[]>(
            `SELECT problem_id, topic_id FROM problem_topics`,
          ),
        ]);

      const nodes: GraphNode[] = [
        ...topics.map((t) => ({
          key: `topic-${t.id}`,
          type: "topic" as const,
          id: t.id,
          label: t.name,
          color: t.color,
        })),
        ...notes.map((n) => ({
          key: `note-${n.id}`,
          type: "note" as const,
          id: n.id,
          label: n.title || "Untitled",
          color: null,
        })),
        ...problems.map((p) => ({
          key: `problem-${p.id}`,
          type: "problem" as const,
          id: p.id,
          label: p.title,
          color: null,
        })),
      ];
      const keys = new Set(nodes.map((n) => n.key));

      const edges: GraphEdge[] = [
        ...notes
          .filter((n) => n.topic_id)
          .map((n) => ({
            source: `note-${n.id}`,
            target: `topic-${n.topic_id}`,
          })),
        ...problemTopics.map((pt) => ({
          source: `problem-${pt.problem_id}`,
          target: `topic-${pt.topic_id}`,
        })),
        ...links.map((l) => ({
          source: `${l.source_type}-${l.source_id}`,
          target: `${l.target_type}-${l.target_id}`,
        })),
      ].filter((e) => keys.has(e.source) && keys.has(e.target));

      return { nodes, edges };
    },
  });
}

export function useBacklinks(targetType: LinkableType, targetId: number) {
  return useQuery({
    queryKey: ["backlinks", targetType, targetId],
    queryFn: async () => {
      const db = await getDb();
      return db.select<Backlink[]>(
        `SELECT l.source_type, l.source_id,
                CASE l.source_type
                  WHEN 'note' THEN COALESCE(NULLIF((SELECT title FROM notes WHERE id = l.source_id), ''), 'Untitled')
                  WHEN 'problem' THEN (SELECT title FROM problems WHERE id = l.source_id)
                  WHEN 'topic' THEN (SELECT name FROM topics WHERE id = l.source_id)
                END AS title
         FROM links l
         WHERE l.target_type = $1 AND l.target_id = $2
         ORDER BY l.id DESC`,
        [targetType, targetId],
      );
    },
  });
}
