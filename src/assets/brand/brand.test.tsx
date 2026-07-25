import { describe, expect, it } from "vitest";
import { renderToString } from "react-dom/server";
import { GemMark } from "./GemMark";
import { FacetMotif } from "./FacetMotif";

describe("brand marks", () => {
  it("GemMark renders a solid gem with knocked-out facet lines", () => {
    const html = renderToString(<GemMark />);
    expect(html).toContain('fill="url(#gem-grad)"');
    expect(html).toContain('stroke="var(--color-bg)"');
  });

  it("GemMark mono variant uses currentColor, no gradient", () => {
    const html = renderToString(<GemMark variant="mono" />);
    expect(html).toContain('fill="currentColor"');
    expect(html).not.toContain("linearGradient");
  });

  it("FacetMotif is decorative", () => {
    const html = renderToString(<FacetMotif />);
    expect(html).toContain('aria-hidden="true"');
  });
});
