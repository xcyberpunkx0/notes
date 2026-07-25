import { describe, expect, it } from "vitest";
import { renderToString } from "react-dom/server";
import { GemMark } from "./GemMark";
import { FacetMotif } from "./FacetMotif";

describe("brand marks", () => {
  it("GemMark renders node circles and facet edges", () => {
    const html = renderToString(<GemMark />);
    expect(html).toContain("<svg");
    expect((html.match(/<circle/g) ?? []).length).toBeGreaterThanOrEqual(6);
    expect((html.match(/<line/g) ?? []).length).toBeGreaterThanOrEqual(8);
  });

  it("GemMark mono variant uses currentColor, no gradient", () => {
    const html = renderToString(<GemMark variant="mono" />);
    expect(html).toContain("currentColor");
    expect(html).not.toContain("linearGradient");
  });

  it("FacetMotif is decorative", () => {
    const html = renderToString(<FacetMotif />);
    expect(html).toContain('aria-hidden="true"');
  });
});
