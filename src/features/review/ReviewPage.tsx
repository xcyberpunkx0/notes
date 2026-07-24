import { Brain } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";

export function ReviewPage() {
  return (
    <div className="h-full">
      <PageHeader eyebrow="Retention loop" title="Review" />
      <div className="px-8">
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-line py-16 text-center">
          <span className="flex size-11 items-center justify-center rounded-xl bg-accent-soft text-accent">
            <Brain size={20} />
          </span>
          <p className="text-sm font-medium">Nothing to review yet</p>
          <p className="max-w-sm text-[13px] text-text-dim">
            Once you write notes and log problems, they return here on a
            spaced schedule so they actually stick.
          </p>
        </div>
      </div>
    </div>
  );
}
