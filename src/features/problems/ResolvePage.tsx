import { useState } from "react";
import { useNavigate } from "react-router";
import {
  ArrowSquareOut,
  ArrowsClockwise,
  Barbell,
  Eye,
} from "@phosphor-icons/react";
import { PageHeader } from "@/components/PageHeader";
import { useRandomProblem, useUpdateProblemField } from "@/db/problems";
import { formatRelative } from "@/lib/time";
import { CodePanel } from "./CodePanel";
import { ConfidenceDots, DifficultyChip } from "./bits";

export function ResolvePage() {
  const [seed, setSeed] = useState(1);
  const [revealed, setRevealed] = useState(false);
  const { data: problem } = useRandomProblem(seed);
  const updateField = useUpdateProblemField();
  const navigate = useNavigate();

  function nextProblem() {
    setRevealed(false);
    setSeed((s) => s + 1);
  }

  return (
    <div className="h-full overflow-y-auto">
      <PageHeader eyebrow="Deliberate practice" title="Re-solve">
        <button onClick={nextProblem} className="btn-ghost">
          <ArrowsClockwise size={15} />
          Another one
        </button>
      </PageHeader>

      <div className="mx-auto max-w-3xl px-10 pb-16">
        {problem === null ? (
          <div className="card flex flex-col items-center gap-3 border-dashed py-20 text-center">
            <span className="flex size-13 items-center justify-center rounded-2xl bg-accent-soft text-accent">
              <Barbell size={22} />
            </span>
            <p className="max-w-sm text-[13px] text-text-dim">
              Log a few problems first — then come back and re-solve them
              cold.
            </p>
          </div>
        ) : problem ? (
          <div className="card">
            <div className="border-b border-line px-6 py-5">
              <p className="eyebrow mb-1.5">
                {problem.platform ?? "Problem"}
                {problem.date_solved &&
                  ` · solved ${formatRelative(problem.date_solved + " 00:00:00")}`}
              </p>
              <h2 className="flex items-center gap-2.5 text-xl font-bold tracking-tight">
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
              </h2>
              <div className="mt-2 flex items-center gap-3">
                <DifficultyChip value={problem.difficulty} />
                {problem.topic_names && (
                  <span className="font-mono text-[11px] text-text-faint">
                    {problem.topic_names.split(",").join(" · ")}
                  </span>
                )}
              </div>
            </div>

            <div className="px-6 py-6">
              {!revealed ? (
                <div className="flex flex-col items-center gap-4 py-6 text-center">
                  <p className="max-w-md text-[13.5px] leading-relaxed text-text-dim">
                    Solve it again from scratch — on the platform or on paper.
                    No peeking. When you're done (or truly stuck), compare with
                    what past-you wrote.
                  </p>
                  <button
                    onClick={() => setRevealed(true)}
                    className="btn-primary"
                  >
                    <Eye size={15} />
                    Show my old solution
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <CodePanel problemId={problem.id} />
                  <div className="flex items-center justify-between rounded-xl bg-surface-2 px-4 py-3">
                    <span className="text-[13px] text-text-dim">
                      How confident do you feel now?
                    </span>
                    <ConfidenceDots
                      value={problem.confidence}
                      size="md"
                      onChange={(v) =>
                        updateField.mutate({
                          id: problem.id,
                          field: "confidence",
                          value: v,
                        })
                      }
                    />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={nextProblem} className="btn-primary flex-1">
                      <ArrowsClockwise size={15} />
                      Next problem
                    </button>
                    <button
                      onClick={() => navigate(`/problems/${problem.id}`)}
                      className="btn-ghost"
                    >
                      Open full debrief
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
