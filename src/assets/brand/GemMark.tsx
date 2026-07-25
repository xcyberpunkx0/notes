const OUTLINE = "M7 3.5 L17 3.5 L21 10 L12 21.5 L3 10 Z";
const FACETS = "M3 10 L21 10 M7 3.5 L12 10 L17 3.5 M12 10 L12 21.5";

export function GemMark({
  className,
  variant = "gradient",
  knockout = "var(--color-bg)",
}: {
  className?: string;
  variant?: "gradient" | "mono";
  /** Facet-line color; defaults to the app background so lines read as cuts. */
  knockout?: string;
}) {
  const paint = variant === "gradient" ? "url(#gem-grad)" : "currentColor";
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
      <path d={OUTLINE} fill={paint} />
      <path
        d={FACETS}
        stroke={knockout}
        strokeWidth="1.3"
        strokeLinejoin="round"
        fill="none"
        opacity="0.9"
      />
    </svg>
  );
}
