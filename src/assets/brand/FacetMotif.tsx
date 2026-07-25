/**
 * Faint facet-line background texture. Parent controls color via
 * `currentColor` and placement; keep opacity in the 0.04–0.08 range.
 */
export function FacetMotif({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 400 300"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <g stroke="currentColor" strokeWidth="1">
        <path d="M40 220 L120 60 L260 40 L370 150 L300 270 L110 280 Z" />
        <path d="M120 60 L300 270 M260 40 L110 280 M40 220 L370 150" />
      </g>
      <g fill="currentColor">
        {[[40, 220], [120, 60], [260, 40], [370, 150], [300, 270], [110, 280]].map(
          ([cx, cy], i) => <circle key={i} cx={cx} cy={cy} r="3" />,
        )}
      </g>
    </svg>
  );
}
