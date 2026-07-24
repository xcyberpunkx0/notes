import { useEffect, useId, useState } from "react";
import { createReactBlockSpec } from "@blocknote/react";
import { Pencil, Eye } from "lucide-react";
import mermaid from "mermaid";
import { useUiStore } from "@/app/store";

function MermaidPreview({ code }: { code: string }) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, "");
  const theme = useUiStore((s) => s.theme);
  const [svg, setSvg] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    mermaid.initialize({
      startOnLoad: false,
      theme: theme === "dark" ? "dark" : "neutral",
      securityLevel: "strict",
      fontFamily: "Inter Variable, sans-serif",
    });
    mermaid
      .render(`mmd-${id}`, code)
      .then(({ svg }) => {
        if (!cancelled) {
          setSvg(svg);
          setError(null);
        }
      })
      .catch((e: Error) => {
        if (!cancelled) setError(e.message);
      });
    return () => {
      cancelled = true;
    };
  }, [code, theme, id]);

  if (error) {
    return (
      <div className="rounded-lg bg-danger/10 p-3 font-mono text-xs text-danger">
        Diagram has a syntax error — switch to edit to fix it.
      </div>
    );
  }
  return (
    <div
      className="flex justify-center overflow-x-auto py-2 [&_svg]:max-w-full"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

export const MermaidBlock = createReactBlockSpec(
  {
    type: "mermaid" as const,
    propSchema: {
      code: {
        default: "graph TD\n  A[Start] --> B{Sorted?}\n  B -->|Yes| C[Binary search]\n  B -->|No| D[Sort first]",
      },
    },
    content: "none" as const,
  },
  {
    render: (props) => {
      const { block, editor } = props;
      const [editing, setEditing] = useState(false);
      const [draft, setDraft] = useState(block.props.code);

      function commit() {
        editor.updateBlock(block, { props: { code: draft } });
        setEditing(false);
      }

      return (
        <div className="my-1 w-full rounded-xl border border-line bg-surface">
          <div className="flex items-center justify-between border-b border-line px-3 py-1.5">
            <span className="eyebrow">mermaid</span>
            <button
              onClick={() => (editing ? commit() : setEditing(true))}
              className="flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] text-text-dim transition-colors hover:bg-surface-2 hover:text-text"
            >
              {editing ? <Eye size={12} /> : <Pencil size={12} />}
              {editing ? "Preview" : "Edit"}
            </button>
          </div>
          <div className="p-3">
            {editing ? (
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onBlur={commit}
                autoFocus
                spellCheck={false}
                rows={Math.max(4, draft.split("\n").length + 1)}
                className="w-full resize-y rounded-lg bg-surface-2 p-3 font-mono text-[13px] leading-relaxed text-text outline-none"
              />
            ) : (
              <div onDoubleClick={() => setEditing(true)}>
                <MermaidPreview code={block.props.code} />
              </div>
            )}
          </div>
        </div>
      );
    },
  },
);
