import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import {
  forceCenter,
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
  type SimulationLinkDatum,
  type SimulationNodeDatum,
} from "d3-force";
import { Graph } from "@phosphor-icons/react";
import { useGraphData, type GraphNode } from "@/db/links";

const W = 960;
const H = 620;

interface SimNode extends SimulationNodeDatum, GraphNode {}

const PATHS = { note: "/notes", problem: "/problems", topic: "/topics" };

export function GraphPage() {
  const { data } = useGraphData();
  const navigate = useNavigate();
  const [hovered, setHovered] = useState<string | null>(null);

  const layout = useMemo(() => {
    if (!data || data.nodes.length === 0) return null;
    const nodes: SimNode[] = data.nodes.map((n) => ({ ...n }));
    const links: SimulationLinkDatum<SimNode>[] = data.edges.map((e) => ({
      source: e.source,
      target: e.target,
    }));
    const sim = forceSimulation(nodes)
      .force(
        "link",
        forceLink<SimNode, SimulationLinkDatum<SimNode>>(links)
          .id((d) => d.key)
          .distance(70)
          .strength(0.6),
      )
      .force("charge", forceManyBody().strength(-120))
      .force("center", forceCenter(W / 2, H / 2))
      .force(
        "collide",
        forceCollide<SimNode>().radius((d) => (d.type === "topic" ? 34 : 22)),
      )
      .stop();
    sim.tick(300);
    return { nodes, links };
  }, [data]);

  const connected = useMemo(() => {
    if (!hovered || !layout) return null;
    const set = new Set<string>([hovered]);
    for (const l of layout.links) {
      const s = (l.source as SimNode).key;
      const t = (l.target as SimNode).key;
      if (s === hovered) set.add(t);
      if (t === hovered) set.add(s);
    }
    return set;
  }, [hovered, layout]);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-end justify-between px-10 pb-6 pt-10">
        <div>
          <h1 className="m-0 mb-1 text-[28px] font-bold tracking-[-0.015em]">
            Graph
          </h1>
          <div className="text-[13.5px] text-text-faint">Connections</div>
        </div>
        {layout && (
          <span className="font-mono text-[11px] text-text-faint">
            {layout.nodes.length} nodes · {layout.links.length} edges
          </span>
        )}
      </div>

      <div className="min-h-0 flex-1 px-10 pb-10">
        {!layout ? (
          <div className="card flex flex-col items-center gap-3 border-dashed py-20 text-center">
            <span className="flex size-13 items-center justify-center rounded-2xl bg-accent-soft text-accent">
              <Graph size={22} />
            </span>
            <p className="max-w-sm text-[13px] text-text-dim">
              The graph grows as you link notes and problems — every
              @-mention becomes an edge.
            </p>
          </div>
        ) : (
          <div className="card h-full overflow-hidden">
            <svg
              viewBox={`0 0 ${W} ${H}`}
              className="h-full w-full"
              onMouseLeave={() => setHovered(null)}
            >
              {layout.links.map((l, i) => {
                const s = l.source as SimNode;
                const t = l.target as SimNode;
                const dim = connected && !(connected.has(s.key) && connected.has(t.key));
                return (
                  <line
                    key={i}
                    x1={s.x}
                    y1={s.y}
                    x2={t.x}
                    y2={t.y}
                    stroke="var(--line-strong)"
                    strokeWidth={1}
                    opacity={dim ? 0.15 : 0.6}
                  />
                );
              })}
              {layout.nodes.map((n) => {
                const r = n.type === "topic" ? 14 : n.type === "problem" ? 7 : 8;
                const fill =
                  n.type === "topic"
                    ? (n.color ?? "var(--accent)")
                    : n.type === "problem"
                      ? "var(--accent-2)"
                      : "var(--accent)";
                const dim = connected && !connected.has(n.key);
                const showLabel =
                  n.type === "topic" || hovered === n.key || (connected?.has(n.key) ?? false);
                return (
                  <g
                    key={n.key}
                    transform={`translate(${n.x},${n.y})`}
                    opacity={dim ? 0.2 : 1}
                    className="cursor-pointer"
                    onMouseEnter={() => setHovered(n.key)}
                    onClick={() => navigate(`${PATHS[n.type]}/${n.id}`)}
                  >
                    <circle
                      r={r}
                      fill={fill}
                      fillOpacity={n.type === "topic" ? 0.9 : 0.75}
                      stroke="var(--surface)"
                      strokeWidth={1.5}
                    />
                    {showLabel && (
                      <text
                        y={r + 12}
                        textAnchor="middle"
                        fontSize={n.type === "topic" ? 11 : 9.5}
                        fontFamily="var(--font-sans)"
                        fill="var(--text-dim)"
                      >
                        {n.label.length > 28
                          ? n.label.slice(0, 27) + "…"
                          : n.label}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>
        )}
      </div>
    </div>
  );
}
