import { useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  Brain,
  FileText,
  Flame,
  Library,
  ListChecks,
  Plus,
} from "lucide-react";
import { getDb } from "@/db/client";
import { useDueCount, useStreak } from "@/db/reviews";
import { useUnlockedAchievements } from "@/db/achievements";
import { formatRelative } from "@/lib/time";

function greeting(): string {
  const h = new Date().getHours();
  if (h < 5) return "Burning the midnight oil";
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

interface RecentNote {
  id: number;
  title: string;
  updated_at: string;
  topic_name: string | null;
  topic_icon: string | null;
}

function useHomeData() {
  return useQuery({
    queryKey: ["home"],
    queryFn: async () => {
      const db = await getDb();
      const [recentNotes, counts] = await Promise.all([
        db.select<RecentNote[]>(
          `SELECT n.id, n.title, n.updated_at, t.name AS topic_name, t.icon AS topic_icon
           FROM notes n LEFT JOIN topics t ON t.id = n.topic_id
           ORDER BY n.updated_at DESC LIMIT 5`,
        ),
        db.select<{ notes: number; problems: number; topics: number }[]>(
          `SELECT (SELECT COUNT(*) FROM notes) AS notes,
                  (SELECT COUNT(*) FROM problems) AS problems,
                  (SELECT COUNT(*) FROM topics) AS topics`,
        ),
      ]);
      return { recentNotes, counts: counts[0] };
    },
  });
}

export function HomePage() {
  const navigate = useNavigate();
  const { data } = useHomeData();
  const { data: dueCount } = useDueCount();
  const streak = useStreak();
  const { data: achievements } = useUnlockedAchievements();

  const empty =
    data && data.counts.notes === 0 && data.counts.problems === 0;

  return (
    <div className="dotgrid h-full overflow-y-auto">
      <div className="mx-auto max-w-3xl px-8 pb-16 pt-14">
        <div className="flex items-end justify-between">
          <div>
            <p className="eyebrow mb-2">Your vault</p>
            <h1 className="text-2xl font-semibold tracking-tight">
              {greeting()}
              {empty ? " — ready to make something stick?" : "."}
            </h1>
          </div>
          {streak > 0 && (
            <span
              className="flex items-center gap-1.5 rounded-lg border border-warning/30 bg-warning/10 px-3 py-1.5 text-sm font-semibold text-warning"
              title={`${streak} day streak`}
            >
              <Flame size={15} />
              {streak}
            </span>
          )}
        </div>

        {/* Today's review */}
        <button
          onClick={() => navigate("/review")}
          className="group mt-8 flex w-full items-center gap-4 rounded-xl border border-line bg-surface p-5 text-left transition-all duration-150 hover:-translate-y-0.5 hover:border-accent/40"
        >
          <span className="flex size-11 items-center justify-center rounded-xl bg-accent-soft text-accent">
            <Brain size={19} />
          </span>
          <span className="flex-1">
            <span className="block text-sm font-semibold">
              {dueCount && dueCount > 0
                ? `${dueCount} item${dueCount === 1 ? "" : "s"} due for review`
                : "Nothing due for review"}
            </span>
            <span className="mt-0.5 block text-[13px] text-text-dim">
              {dueCount && dueCount > 0
                ? "A few minutes now beats an hour of re-learning later."
                : "New notes and problems join the queue a day after you add them."}
            </span>
          </span>
          {dueCount != null && dueCount > 0 && (
            <ArrowRight
              size={17}
              className="text-text-faint transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-accent"
            />
          )}
        </button>

        {/* Quick actions + stats */}
        <div className="mt-3 grid grid-cols-3 gap-3">
          <button
            onClick={() => navigate("/topics")}
            className="flex flex-col items-start gap-2.5 rounded-xl border border-line bg-surface p-4 text-left transition-all duration-150 hover:-translate-y-0.5 hover:border-line-strong hover:bg-surface-2"
          >
            <Library size={16} className="text-accent" />
            <span>
              <span className="block font-mono text-lg font-semibold leading-none">
                {data?.counts.topics ?? 0}
              </span>
              <span className="mt-1 block text-[12px] text-text-dim">
                topics
              </span>
            </span>
          </button>
          <button
            onClick={() => navigate("/topics")}
            className="flex flex-col items-start gap-2.5 rounded-xl border border-line bg-surface p-4 text-left transition-all duration-150 hover:-translate-y-0.5 hover:border-line-strong hover:bg-surface-2"
          >
            <FileText size={16} className="text-accent" />
            <span>
              <span className="block font-mono text-lg font-semibold leading-none">
                {data?.counts.notes ?? 0}
              </span>
              <span className="mt-1 block text-[12px] text-text-dim">
                notes
              </span>
            </span>
          </button>
          <button
            onClick={() => navigate("/problems")}
            className="flex flex-col items-start gap-2.5 rounded-xl border border-line bg-surface p-4 text-left transition-all duration-150 hover:-translate-y-0.5 hover:border-line-strong hover:bg-surface-2"
          >
            <ListChecks size={16} className="text-accent" />
            <span>
              <span className="block font-mono text-lg font-semibold leading-none">
                {data?.counts.problems ?? 0}
              </span>
              <span className="mt-1 block text-[12px] text-text-dim">
                problems solved
              </span>
            </span>
          </button>
        </div>

        {/* Recent notes */}
        {data && data.recentNotes.length > 0 && (
          <div className="mt-8">
            <p className="eyebrow mb-2">Continue learning</p>
            <div className="overflow-hidden rounded-xl border border-line">
              {data.recentNotes.map((n, i) => (
                <button
                  key={n.id}
                  onClick={() => navigate(`/notes/${n.id}`)}
                  className={
                    "flex w-full items-center gap-3 bg-surface px-4 py-2.5 text-left transition-colors duration-100 hover:bg-surface-2 " +
                    (i > 0 ? "border-t border-line" : "")
                  }
                >
                  <span className="text-sm">{n.topic_icon ?? "📄"}</span>
                  <span className="min-w-0 flex-1 truncate text-[13px] font-medium">
                    {n.title || "Untitled"}
                  </span>
                  {n.topic_name && (
                    <span className="font-mono text-[10px] text-text-faint">
                      {n.topic_name}
                    </span>
                  )}
                  <span className="w-14 shrink-0 text-right font-mono text-[10px] text-text-faint">
                    {formatRelative(n.updated_at)}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Achievements */}
        {achievements && achievements.length > 0 && (
          <div className="mt-8">
            <p className="eyebrow mb-2">Achievements</p>
            <div className="flex flex-wrap gap-2">
              {achievements.map((a) => (
                <span
                  key={a.key}
                  title={a.description}
                  className="flex items-center gap-1.5 rounded-lg border border-line bg-surface px-2.5 py-1.5 text-[12px]"
                >
                  <span className="text-sm">{a.emoji}</span>
                  {a.title}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* First-run CTA */}
        {empty && (
          <div className="mt-8 grid grid-cols-2 gap-3">
            <button
              onClick={() => navigate("/topics")}
              className="group flex flex-col items-start gap-3 rounded-xl border border-line bg-surface p-5 text-left transition-all duration-150 hover:-translate-y-0.5 hover:border-line-strong hover:bg-surface-2"
            >
              <span className="flex size-9 items-center justify-center rounded-lg bg-accent-soft text-accent">
                <Library size={17} />
              </span>
              <span>
                <span className="block text-sm font-medium">
                  Create your first topic
                </span>
                <span className="mt-0.5 block text-[13px] text-text-dim">
                  Arrays, graphs, DP — give each concept a home.
                </span>
              </span>
            </button>
            <button
              onClick={() => navigate("/problems")}
              className="group flex flex-col items-start gap-3 rounded-xl border border-line bg-surface p-5 text-left transition-all duration-150 hover:-translate-y-0.5 hover:border-line-strong hover:bg-surface-2"
            >
              <span className="flex size-9 items-center justify-center rounded-lg bg-accent-soft text-accent">
                <Plus size={17} />
              </span>
              <span>
                <span className="block text-sm font-medium">Log a problem</span>
                <span className="mt-0.5 block text-[13px] text-text-dim">
                  Capture what you just solved while the insight is hot.
                </span>
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
