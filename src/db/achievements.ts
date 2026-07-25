import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getDb } from "./client";

export interface AchievementDef {
  key: string;
  emoji: string;
  title: string;
  description: string;
}

export const ACHIEVEMENTS: AchievementDef[] = [
  {
    key: "first_note",
    emoji: "📝",
    title: "Opening lines",
    description: "Wrote your first note",
  },
  {
    key: "first_problem",
    emoji: "🎯",
    title: "First gem",
    description: "Added your first solved problem to the Trove",
  },
  {
    key: "first_debrief",
    emoji: "💡",
    title: "First Facet",
    description: "Cut a solve into a full debrief",
  },
  {
    key: "first_review",
    emoji: "🧠",
    title: "The loop begins",
    description: "Finished your first review",
  },
  {
    key: "problems_10",
    emoji: "⚔️",
    title: "Ten gems deep",
    description: "Ten solved problems in the Trove",
  },
  {
    key: "streak_7",
    emoji: "🔥",
    title: "One week strong",
    description: "Showed up seven days straight",
  },
];

/**
 * Checks all achievement conditions and unlocks any newly earned ones.
 * Returns the defs unlocked by this call (for celebration UI).
 */
export async function checkAchievements(
  currentStreak: number,
): Promise<AchievementDef[]> {
  const db = await getDb();
  const unlocked = new Set(
    (
      await db.select<{ key: string }[]>(`SELECT key FROM achievements`)
    ).map((r) => r.key),
  );

  const [noteCount, problemCount, debriefCount, reviewCount] =
    await Promise.all([
      count(`SELECT COUNT(*) AS n FROM notes`),
      count(`SELECT COUNT(*) AS n FROM problems`),
      count(
        `SELECT COUNT(*) AS n FROM problems WHERE concept_taught IS NOT NULL AND six_month_note IS NOT NULL`,
      ),
      count(`SELECT COUNT(*) AS n FROM review_log`),
    ]);

  const earned: Record<string, boolean> = {
    first_note: noteCount >= 1,
    first_problem: problemCount >= 1,
    first_debrief: debriefCount >= 1,
    first_review: reviewCount >= 1,
    problems_10: problemCount >= 10,
    streak_7: currentStreak >= 7,
  };

  const fresh: AchievementDef[] = [];
  for (const def of ACHIEVEMENTS) {
    if (earned[def.key] && !unlocked.has(def.key)) {
      await db.execute(`INSERT OR IGNORE INTO achievements (key) VALUES ($1)`, [
        def.key,
      ]);
      fresh.push(def);
    }
  }
  return fresh;
}

async function count(sql: string): Promise<number> {
  const db = await getDb();
  const rows = await db.select<{ n: number }[]>(sql);
  return rows[0]?.n ?? 0;
}

export function useUnlockedAchievements() {
  return useQuery({
    queryKey: ["achievements"],
    queryFn: async () => {
      const db = await getDb();
      const rows = await db.select<{ key: string; unlocked_at: string }[]>(
        `SELECT key, unlocked_at FROM achievements ORDER BY unlocked_at DESC`,
      );
      return rows
        .map((r) => ({
          ...ACHIEVEMENTS.find((a) => a.key === r.key)!,
          unlocked_at: r.unlocked_at,
        }))
        .filter((a) => a.key);
    },
  });
}

export function useInvalidateAchievements() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: ["achievements"] });
}
