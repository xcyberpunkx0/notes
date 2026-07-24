import { Library } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";

export function TopicsPage() {
  return (
    <div className="h-full">
      <PageHeader eyebrow="Concept library" title="Topics" />
      <div className="px-8">
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-line py-16 text-center">
          <span className="flex size-11 items-center justify-center rounded-xl bg-accent-soft text-accent">
            <Library size={20} />
          </span>
          <p className="text-sm font-medium">Your concept library starts here</p>
          <p className="max-w-sm text-[13px] text-text-dim">
            Topic creation and the note editor land in the next build step —
            this space will hold Arrays, Graphs, DP and everything you learn
            after.
          </p>
        </div>
      </div>
    </div>
  );
}
