import { ListChecks } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";

export function ProblemsPage() {
  return (
    <div className="h-full">
      <PageHeader eyebrow="Problem tracker" title="Problems" />
      <div className="px-8">
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-line py-16 text-center">
          <span className="flex size-11 items-center justify-center rounded-xl bg-accent-soft text-accent">
            <ListChecks size={20} />
          </span>
          <p className="text-sm font-medium">Every solve, remembered</p>
          <p className="max-w-sm text-[13px] text-text-dim">
            The 60-second quick-log and the post-solve debrief arrive in an
            upcoming build step. Your solved problems will live here.
          </p>
        </div>
      </div>
    </div>
  );
}
