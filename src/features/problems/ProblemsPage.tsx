import { useState } from "react";
import { useNavigate } from "react-router";
import { Target, Plus, Star } from "@phosphor-icons/react";
import { PageShell } from "@/components/page/PageShell";
import { useProblems, useUpdateProblemField } from "@/db/problems";
import { useTopics } from "@/db/topics";
import { formatRelative } from "@/lib/time";
import { cn } from "@/lib/utils";
import { useUiStore } from "@/app/store";
import { ConfidenceDots, DIFFICULTIES, DifficultyChip } from "./bits";

export function ProblemsPage() {
  const navigate = useNavigate();
  const setLogOpen = useUiStore((s) => s.setQuickLogOpen);
  const [topicId, setTopicId] = useState<number | null>(null);
  const [difficulty, setDifficulty] = useState<string | null>(null);
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const { data: topics } = useTopics();
  const { data: problems } = useProblems({
    topicId,
    difficulty,
    favoritesOnly,
  });
  const updateField = useUpdateProblemField();

  return (
    <div className="h-full overflow-y-auto">
      <PageShell title="Problems" subtitle="Problem tracker">
        <div className="mb-6 flex justify-end">
          <button onClick={() => setLogOpen(true)} className="btn-primary">
            <Plus size={15} weight="bold" />
            Log problem
          </button>
        </div>

        {/* Filters */}
        <div className="mb-5 flex flex-wrap items-center gap-2">
          <select
            value={topicId ?? ""}
            onChange={(e) =>
              setTopicId(e.target.value ? Number(e.target.value) : null)
            }
            className="h-9 rounded-full border border-line bg-surface px-3 text-[12px] text-text-dim outline-none"
          >
            <option value="">All topics</option>
            {topics?.map((t) => (
              <option key={t.id} value={t.id}>
                {t.icon} {t.name}
              </option>
            ))}
          </select>
          {DIFFICULTIES.map((d) => (
            <button
              key={d}
              onClick={() => setDifficulty(difficulty === d ? null : d)}
              className={cn(
                "h-9 rounded-full px-3.5 text-[12px] font-medium transition-colors",
                difficulty === d
                  ? "bg-accent-soft text-accent ring-1 ring-accent"
                  : "border border-line text-text-dim hover:bg-surface-2",
              )}
            >
              {d}
            </button>
          ))}
          <button
            onClick={() => setFavoritesOnly(!favoritesOnly)}
            className={cn(
              "flex h-9 items-center gap-1.5 rounded-full px-3.5 text-[12px] font-medium transition-colors",
              favoritesOnly
                ? "bg-accent-soft text-accent ring-1 ring-accent"
                : "border border-line text-text-dim hover:bg-surface-2",
            )}
          >
            <Star size={12} />
            Favorites
          </button>
          {problems && (
            <span className="ml-auto font-mono text-[11px] text-text-faint">
              {problems.length} solved
            </span>
          )}
        </div>

        {problems && problems.length > 0 ? (
          <div className="card overflow-hidden">
            {problems.map((p, i) => (
              <div
                key={p.id}
                role="button"
                tabIndex={0}
                onClick={() => navigate(`/problems/${p.id}`)}
                onKeyDown={(e) => e.key === "Enter" && navigate(`/problems/${p.id}`)}
                className={cn(
                  "flex w-full cursor-pointer items-center gap-3.5 px-5 py-3.5 text-left transition-colors duration-100 hover:bg-surface-2",
                  i > 0 && "border-t border-line",
                )}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    updateField.mutate({
                      id: p.id,
                      field: "is_favorite",
                      value: p.is_favorite ? 0 : 1,
                    });
                  }}
                  className={cn(
                    "shrink-0 transition-colors",
                    p.is_favorite
                      ? "text-warning"
                      : "text-line-strong hover:text-text-dim",
                  )}
                >
                  <Star size={15} weight={p.is_favorite ? "fill" : "duotone"} />
                </button>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-medium">
                    {p.title}
                  </span>
                  <span className="mt-0.5 flex items-center gap-2 font-mono text-[10px] text-text-faint">
                    {p.platform && <span>{p.platform}</span>}
                    {p.topic_names && (
                      <span className="truncate">{p.topic_names.split(",").join(" · ")}</span>
                    )}
                  </span>
                </span>
                <DifficultyChip value={p.difficulty} />
                <ConfidenceDots value={p.confidence} />
                <span className="w-16 shrink-0 text-right font-mono text-[11px] text-text-faint">
                  {p.date_solved ? formatRelative(p.date_solved + " 00:00:00") : ""}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="card flex flex-col items-center gap-3 border-dashed py-20 text-center">
            <span className="flex size-13 items-center justify-center rounded-2xl bg-accent-soft text-accent">
              <Target size={22} />
            </span>
            <p className="text-sm font-medium">
              {favoritesOnly || difficulty || topicId
                ? "Nothing matches these filters"
                : "Every solve, remembered"}
            </p>
            <p className="max-w-sm text-[13px] text-text-dim">
              {favoritesOnly || difficulty || topicId
                ? "Try clearing a filter."
                : "Log a problem right after you solve it — while the insight is still hot. It takes under a minute."}
            </p>
          </div>
        )}
      </PageShell>
    </div>
  );
}
