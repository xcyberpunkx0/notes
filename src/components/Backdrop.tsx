/**
 * "Complexity landscape" backdrop — faint topographic contour lines with
 * tiny complexity-class elevation labels. Static SVG, zero runtime cost.
 */

function ContourCluster({
  rings,
  labels = [],
}: {
  rings: { scale: number; rotate: number }[];
  labels?: { text: string; x: number; y: number }[];
}) {
  // One organic closed blob, reused at different scales/rotations for
  // nested contour rings — like elevation lines on a map.
  const blob =
    "M 190,0 C 192,72 128,136 46,152 C -36,168 -142,136 -178,64 " +
    "C -212,-6 -190,-92 -122,-142 C -54,-192 58,-190 122,-142 C 172,-104 188,-58 190,0 Z";

  return (
    <svg
      viewBox="-260 -260 520 520"
      className="h-full w-full"
      aria-hidden="true"
    >
      {rings.map((r, i) => (
        <path
          key={i}
          d={blob}
          fill="none"
          stroke="var(--line-strong)"
          strokeWidth={1.1 / r.scale}
          opacity={0.5 - i * 0.045}
          transform={`rotate(${r.rotate}) scale(${r.scale})`}
        />
      ))}
      {labels.map((l) => (
        <text
          key={l.text}
          x={l.x}
          y={l.y}
          fontFamily="var(--font-mono)"
          fontSize="9.5"
          fill="var(--text-faint)"
          opacity="0.55"
        >
          {l.text}
        </text>
      ))}
    </svg>
  );
}

export function Backdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -right-36 -top-44 size-[620px]">
        <ContourCluster
          rings={[
            { scale: 0.22, rotate: 8 },
            { scale: 0.42, rotate: -6 },
            { scale: 0.62, rotate: 5 },
            { scale: 0.82, rotate: -4 },
            { scale: 1.02, rotate: 3 },
            { scale: 1.22, rotate: -2 },
          ]}
          labels={[
            { text: "O(1)", x: -14, y: 4 },
            { text: "O(log n)", x: 30, y: -108 },
            { text: "O(n)", x: 76, y: -196 },
          ]}
        />
      </div>
      <div className="absolute -bottom-56 -left-48 size-[520px] opacity-70">
        <ContourCluster
          rings={[
            { scale: 0.35, rotate: 100 },
            { scale: 0.6, rotate: 94 },
            { scale: 0.85, rotate: 106 },
            { scale: 1.1, rotate: 90 },
          ]}
        />
      </div>
    </div>
  );
}
