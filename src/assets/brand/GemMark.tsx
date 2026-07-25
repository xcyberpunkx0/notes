const NODES: [number, number][] = [
  [7, 4], [17, 4], [20, 10], [12, 21], [4, 10], [12, 10],
];
const EDGES: [number, number][][] = [
  [[7, 4], [17, 4]], [[17, 4], [20, 10]], [[20, 10], [12, 21]],
  [[12, 21], [4, 10]], [[4, 10], [7, 4]],
  [[4, 10], [20, 10]], [[7, 4], [12, 10]], [[17, 4], [12, 10]],
  [[12, 10], [12, 21]],
];

export function GemMark({
  className,
  variant = "gradient",
}: {
  className?: string;
  variant?: "gradient" | "mono";
}) {
  const stroke = variant === "gradient" ? "url(#gem-grad)" : "currentColor";
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      {variant === "gradient" && (
        <defs>
          <linearGradient id="gem-grad" x1="4" y1="4" x2="20" y2="21" gradientUnits="userSpaceOnUse">
            <stop stopColor="#8e6bf5" />
            <stop offset="1" stopColor="#c084fc" />
          </linearGradient>
        </defs>
      )}
      {EDGES.map(([[x1, y1], [x2, y2]], i) => (
        <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={stroke} strokeWidth="1.5" strokeLinecap="round" />
      ))}
      {NODES.map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="1.4" fill={stroke} />
      ))}
    </svg>
  );
}
