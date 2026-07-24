import { useNavigate, useParams } from "react-router";
import { ArrowSquareOut, Star, Trash } from "@phosphor-icons/react";
import {
  useDeleteProblem,
  useProblem,
  useUpdateProblemField,
} from "@/db/problems";
import { cn } from "@/lib/utils";
import { BacklinksPanel } from "@/components/BacklinksPanel";
import { ConfidenceDots, DifficultyChip } from "./bits";
import { DebriefFlow } from "./DebriefFlow";
import { CodePanel } from "./CodePanel";

export function ProblemDetailPage() {
  const params = useParams();
  const problemId = Number(params.problemId);
  const navigate = useNavigate();
  const { data: problem } = useProblem(problemId);
  const updateField = useUpdateProblemField();
  const deleteProblem = useDeleteProblem();

  if (!problem) return null;

  async function remove() {
    if (!window.confirm(`Delete "${problem!.title}" and its debrief?`)) return;
    await deleteProblem.mutateAsync(problemId);
    navigate("/problems");
  }

  return (
    <div className="mx-auto max-w-3xl px-8 pb-16">
      <div className="flex items-start justify-between pt-10">
        <div className="min-w-0">
          <p className="eyebrow mb-1.5 flex items-center gap-2">
            {problem.platform ?? "Problem"}
            {problem.date_solved && <span>· solved {problem.date_solved}</span>}
          </p>
          <h1 className="flex items-center gap-2.5 text-2xl font-bold tracking-tight">
            <span className="truncate">{problem.title}</span>
            {problem.url && (
              <a
                href={problem.url}
                target="_blank"
                rel="noreferrer"
                title="Open on platform"
                className="shrink-0 text-text-faint transition-colors hover:text-accent"
              >
                <ArrowSquareOut size={16} />
              </a>
            )}
          </h1>
          <div className="mt-2.5 flex flex-wrap items-center gap-3">
            <DifficultyChip value={problem.difficulty} />
            <ConfidenceDots
              value={problem.confidence}
              size="md"
              onChange={(v) =>
                updateField.mutate({ id: problemId, field: "confidence", value: v })
              }
            />
            {problem.topic_names && (
              <span className="font-mono text-[11px] text-text-faint">
                {problem.topic_names.split(",").join(" · ")}
              </span>
            )}
            {!problem.solved_myself && (
              <span className="rounded-md bg-surface-3 px-1.5 py-0.5 font-mono text-[10px] text-text-dim">
                needed help
              </span>
            )}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1.5 pt-1">
          <button
            onClick={() =>
              updateField.mutate({
                id: problemId,
                field: "is_favorite",
                value: problem.is_favorite ? 0 : 1,
              })
            }
            title="Favorite"
            className={cn(
              "flex size-10 items-center justify-center rounded-xl border border-line transition-colors",
              problem.is_favorite
                ? "text-warning"
                : "text-text-faint hover:text-text-dim",
            )}
          >
            <Star size={16} weight={problem.is_favorite ? "fill" : "duotone"} />
          </button>
          <button
            onClick={remove}
            title="Delete problem"
            className="flex size-10 items-center justify-center rounded-xl border border-line text-text-faint transition-colors hover:border-danger/40 hover:text-danger"
          >
            <Trash size={15} />
          </button>
        </div>
      </div>

      <div className="mt-7 flex flex-col gap-4">
        <DebriefFlow problem={problem} />
        <CodePanel problemId={problemId} />
      </div>

      <BacklinksPanel targetType="problem" targetId={problemId} />
    </div>
  );
}
