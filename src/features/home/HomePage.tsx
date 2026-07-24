import { useNavigate } from "react-router";
import { Brain, Library, ListChecks, Plus } from "lucide-react";

function greeting(): string {
  const h = new Date().getHours();
  if (h < 5) return "Burning the midnight oil";
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="dotgrid h-full">
      <div className="mx-auto max-w-3xl px-8 pt-16">
        <p className="eyebrow mb-2">Your vault</p>
        <h1 className="text-2xl font-semibold tracking-tight">
          {greeting()} — ready to make something stick?
        </h1>
        <p className="mt-2 text-sm text-text-dim">
          Every note you write and problem you log comes back to you at the
          right moment. Start small.
        </p>

        <div className="mt-10 grid grid-cols-2 gap-3">
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

        <div className="mt-3 flex items-center gap-3 rounded-xl border border-dashed border-line p-4 text-[13px] text-text-faint">
          <Brain size={15} className="shrink-0" />
          Nothing due for review yet — the revision loop wakes up once your
          first notes and problems are in.
          <ListChecks size={15} className="ml-auto shrink-0 opacity-0" />
        </div>
      </div>
    </div>
  );
}
