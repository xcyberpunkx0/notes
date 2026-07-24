import { cn } from "@/lib/utils";

export const DIFFICULTIES = ["Easy", "Medium", "Hard"] as const;

const DIFF_STYLES: Record<string, string> = {
  Easy: "text-success bg-success/10",
  Medium: "text-warning bg-warning/10",
  Hard: "text-danger bg-danger/10",
};

export function DifficultyChip({ value }: { value: string | null }) {
  if (!value) return null;
  return (
    <span
      className={cn(
        "inline-flex h-5.5 items-center rounded-md px-2 font-mono text-[10px] font-medium uppercase tracking-wider",
        DIFF_STYLES[value] ?? "bg-surface-3 text-text-dim",
      )}
    >
      {value}
    </span>
  );
}

export function ConfidenceDots({
  value,
  onChange,
  size = "sm",
}: {
  value: number | null;
  onChange?: (v: number) => void;
  size?: "sm" | "md";
}) {
  const dots = [1, 2, 3, 4, 5];
  return (
    <span className="inline-flex items-center gap-1" title={`Confidence ${value ?? 0}/5`}>
      {dots.map((d) => (
        <button
          key={d}
          type="button"
          disabled={!onChange}
          onClick={(e) => {
            e.stopPropagation();
            onChange?.(d);
          }}
          className={cn(
            "rounded-full transition-all duration-100",
            size === "sm" ? "size-1.5" : "size-2.5",
            (value ?? 0) >= d ? "bg-accent" : "bg-line-strong",
            onChange && "hover:scale-125 cursor-pointer",
          )}
        />
      ))}
    </span>
  );
}
