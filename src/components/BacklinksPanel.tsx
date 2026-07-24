import { useNavigate } from "react-router";
import { Link2 } from "lucide-react";
import { useBacklinks, type LinkableType } from "@/db/links";

const PATHS: Record<LinkableType, string> = {
  note: "/notes",
  problem: "/problems",
  topic: "/topics",
};

export function BacklinksPanel({
  targetType,
  targetId,
}: {
  targetType: LinkableType;
  targetId: number;
}) {
  const { data: backlinks } = useBacklinks(targetType, targetId);
  const navigate = useNavigate();

  if (!backlinks || backlinks.length === 0) return null;

  return (
    <section className="mt-8 border-t border-line pt-4">
      <p className="eyebrow mb-2 flex items-center gap-1.5">
        <Link2 size={11} />
        Linked from
      </p>
      <div className="flex flex-wrap gap-1.5">
        {backlinks.map((b) => (
          <button
            key={`${b.source_type}-${b.source_id}`}
            onClick={() => navigate(`${PATHS[b.source_type]}/${b.source_id}`)}
            className="flex h-8 items-center gap-1.5 rounded-full border border-line px-3 text-[12px] text-text-dim transition-colors duration-150 hover:bg-surface-2 hover:text-text"
          >
            {b.title}
            <span className="font-mono text-[9px] uppercase text-text-faint">
              {b.source_type}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
