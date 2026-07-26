import type { Icon } from "@phosphor-icons/react";
import {
  Binary,
  BookOpen,
  Graph,
  Hash,
  Lightning,
  LinkSimple,
  MagnifyingGlass,
  MathOperations,
  PuzzlePiece,
  Repeat,
  Ruler,
  SortAscending,
  SquaresFour,
  StackSimple,
  TextAa,
  TreeStructure,
} from "@phosphor-icons/react";

/**
 * Curated topic glyphs, keyed by a stable slug stored in topics.icon.
 * Legacy rows may still hold a raw emoji string — TopicIcon renders those as-is.
 */
export const TOPIC_ICONS: { key: string; label: string; Icon: Icon }[] = [
  { key: "grid", label: "Arrays", Icon: SquaresFour },
  { key: "text", label: "Strings", Icon: TextAa },
  { key: "chain", label: "Linked lists", Icon: LinkSimple },
  { key: "stack", label: "Stacks & queues", Icon: StackSimple },
  { key: "tree", label: "Trees", Icon: TreeStructure },
  { key: "graph", label: "Graphs", Icon: Graph },
  { key: "puzzle", label: "Dynamic programming", Icon: PuzzlePiece },
  { key: "search", label: "Searching", Icon: MagnifyingGlass },
  { key: "sort", label: "Sorting", Icon: SortAscending },
  { key: "hash", label: "Hashing", Icon: Hash },
  { key: "binary", label: "Bit manipulation", Icon: Binary },
  { key: "bolt", label: "Greedy", Icon: Lightning },
  { key: "loop", label: "Recursion", Icon: Repeat },
  { key: "math", label: "Math", Icon: MathOperations },
  { key: "ruler", label: "Geometry", Icon: Ruler },
  { key: "book", label: "General", Icon: BookOpen },
];

export const DEFAULT_TOPIC_ICON = "book";

export function TopicIcon({
  icon,
  size = 20,
  className,
}: {
  icon: string | null | undefined;
  size?: number;
  className?: string;
}) {
  const entry = TOPIC_ICONS.find((t) => t.key === icon);
  if (entry) return <entry.Icon size={size} className={className} />;
  if (icon)
    return (
      <span className={className} style={{ fontSize: Math.round(size * 0.85) }}>
        {icon}
      </span>
    );
  return <BookOpen size={size} className={className} />;
}
