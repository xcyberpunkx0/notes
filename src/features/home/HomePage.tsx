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

  const empty = data && data.counts.notes === 0 && data.counts.problems === 0;
  const due = dueCount ?? 0;

  return (
    <div className="aurora h-full overflow-y-auto">
      <div className="mx-auto max-w-4xl px-10 pb-20 pt-16">
        {/* Hero */}
        <div className="flex items-end justify-between">
          <div>
            <p className="eyebrow mb-2.5">Your vault</p>
            <h1 className="text-[32px] font-bold leading-tight tracking-tight">
              {greeting()}
              {empty ? (
                <>
                  {" — ready to make it "}
                  <span className="text-gradient">stick</span>?
                </>
              ) : (
                "."
              )}
            </h1>
          </div>
          {streak > 0 && (
            <span
              className="flex items-center gap-2 rounded-2xl border border-warning/25 bg-warning/10 px-4 py-2.5 font-(family-name:--font-display) text-lg font-bold text-warning"
              title={`${streak} day streak`}
            >
              <Flame size={19} />
              {streak}
            </span>
          )}
        </div>

        {/* Today's review — the one thing to do right now */}
        <button
          onClick={() => navigate("/review")}
          className="card card-hover group mt-10 flex w-full items-center gap-5 p-6 text-left"
          style={
            due > 0
              ? {
                  background:
                    "linear-gradient(120deg, var(--accent-soft), transparent 60%), var(--surface)",
                  borderColor:
                    "color-mix(in srgb, var(--accent) 35%, var(--line))",
                }
              : undefined
          }
        >
          <span className="flex size-13 shrink-0 items-center justify-center rounded-2xl bg-accent-soft text-accent">
            <Brain size={23} />
          </span>
          <span className="flex-1">
            <span className="block font-(family-name:--font-display) text-[17px] font-bold">
              {due > 0
                ? `${due} item${due === 1 ? "" : "s"} ready for review`
                : "Nothing due for review"}
            </span>
            <span className="mt-1 block text-[13.5px] text-text-dim">
              {due > 0
                ? "A few minutes now beats an hour of re-learning later."
                : "New notes and problems join the queue a day after you add them."}
            </span>
          </span>
          {due > 0 && (
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent text-white transition-transform duration-150 group-hover:translate-x-1">
              <ArrowRight size={17} />
            </span>
          )}
        </button>

        {/* Stats */}
        <div className="mt-4 grid grid-cols-3 gap-4">
          {[
            { icon: Library, n: data?.counts.topics ?? 0, label: "topics", to: "/topics" },
            { icon: FileText, n: data?.counts.notes ?? 0, label: "notes", to: "/topics" },
            { icon: ListChecks, n: data?.counts.problems ?? 0, label: "problems solved", to: "/problems" },
          ].map((s) => (
            <button
              key={s.label}
              onClick={() => navigate(s.to)}
              className="card card-hover flex flex-col items-start gap-3 p-5 text-left"
            >
              <s.icon size={17} className="text-accent" />
              <span>
                <span className="block font-(family-name:--font-display) text-2xl font-bold leading-none">
                  {s.n}
                </span>
                <span className="mt-1.5 block text-[12.5px] text-text-dim">
                  {s.label}
                </span>
              </span>
            </button>
          ))}
        </div>

        {/* Continue learning + achievements */}
        {(data?.recentNotes.length ?? 0) > 0 && (
          <div className="mt-10 grid grid-cols-[2fr_1fr] items-start gap-4">
            <div>
              <p className="eyebrow mb-3">Continue learning</p>
              <div className="card overflow-hidden">
                {data!.recentNotes.map((n, i) => (
                  <button
                    key={n.id}
                    onClick={() => navigate(`/notes/${n.id}`)}
                    className={
                      "flex w-full items-center gap-3.5 px-5 py-3.5 text-left transition-colors duration-100 hover:bg-surface-2 " +
                      (i > 0 ? "border-t border-line" : "")
                    }
                  >
                    <span className="text-base">{n.topic_icon ?? "📄"}</span>
                    <span className="min-w-0 flex-1 truncate text-sm font-medium">
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

            <div>
              <p className="eyebrow mb-3">Achievements</p>
              {achievements && achievements.length > 0 ? (
                <div className="flex flex-col gap-2.5">
                  {achievements.map((a) => (
                    <span
                      key={a.key}
                      title={a.description}
                      className="card flex items-center gap-3 px-4 py-3 text-[13px] font-medium"
                    >
                      <span className="text-lg">{a.emoji}</span>
                      {a.title}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="card border-dashed px-4 py-6 text-center text-[12.5px] text-text-faint">
                  Unlock badges by writing, logging and reviewing.
                </div>
              )}
            </div>
          </div>
        )}

        {/* First-run CTA */}
        {empty && (
          <div className="mt-10 grid grid-cols-2 gap-4">
            <button
              onClick={() => navigate("/topics")}
              className="card card-hover group flex flex-col items-start gap-4 p-6 text-left"
            >
              <span className="flex size-11 items-center justify-center rounded-2xl bg-accent-soft text-accent">
                <Library size={19} />
              </span>
              <span>
                <span className="block font-(family-name:--font-display) text-[15px] font-bold">
                  Create your first topic
                </span>
                <span className="mt-1 block text-[13.5px] text-text-dim">
                  Arrays, graphs, DP — give each concept a home.
                </span>
              </span>
            </button>
            <button
              onClick={() => navigate("/problems")}
              className="card card-hover group flex flex-col items-start gap-4 p-6 text-left"
            >
              <span className="flex size-11 items-center justify-center rounded-2xl bg-accent-soft text-accent">
                <Plus size={19} />
              </span>
              <span>
                <span className="block font-(family-name:--font-display) text-[15px] font-bold">
                  Log a problem
                </span>
                <span className="mt-1 block text-[13.5px] text-text-dim">
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
