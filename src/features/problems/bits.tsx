import { useNavigate } from "react-router";
import { useTopics } from "@/db/topics";
import { TopicIcon } from "@/lib/topic-icons";
import { cn } from "@/lib/utils";

export const DIFFICULTIES = ["Easy", "Medium", "Hard"] as const;

/**
 * Chips for a problem's topics from its GROUP_CONCAT'd topic_ids string —
 * glyph tinted in the topic color, navigates to the topic on click.
 */
export function TopicChips({ ids }: { ids: string | null }) {
  const { data: topics } = useTopics();
  const navigate = useNavigate();
  if (!ids || !topics) return null;
  const linked = ids
    .split(",")
    .map((id) => topics.find((t) => t.id === Number(id)))
    .filter((t): t is NonNullable<typeof t> => !!t);
  if (linked.length === 0) return null;
  return (
    <span className="inline-flex flex-wrap items-center gap-1.5">
      {linked.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/topics/${t.id}`);
          }}
          className="flex h-6 items-center gap-1.5 rounded-full border border-line px-2.5 text-[11px] text-text-dim transition-colors duration-100 hover:bg-surface-2 hover:text-text"
        >
          <span
            className="flex items-center"
            style={{ color: t.color ?? undefined }}
          >
            <TopicIcon icon={t.icon} size={12} />
          </span>
          {t.name}
        </button>
      ))}
    </span>
  );
}

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
