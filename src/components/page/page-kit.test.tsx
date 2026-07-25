import { describe, expect, it } from "vitest";
import { renderToString } from "react-dom/server";
import { PageShell } from "./PageShell";
import { Callout } from "./Callout";
import { PropertyChips } from "./PropertyChips";
import { ListRow } from "./ListRow";

describe("page kit components", () => {
  it("PageShell renders centered container with title and children", () => {
    const html = renderToString(
      <PageShell title="Test Title">
        <div>Test content</div>
      </PageShell>
    );
    expect(html).toContain("max-w-[708px]");
    expect(html).toContain("mx-auto");
    expect(html).toContain("px-6");
    expect(html).toContain("pt-12");
    expect(html).toContain("pb-30");
    expect(html).toContain("Test Title");
    expect(html).toContain("Test content");
  });

  it("PageShell renders optional icon", () => {
    const html = renderToString(
      <PageShell title="Test" icon={<svg data-testid="icon" />}>
        Content
      </PageShell>
    );
    expect(html).toContain('data-testid="icon"');
    expect(html).toContain("w-[60px]");
    expect(html).toContain("h-[60px]");
  });

  it("PageShell renders optional subtitle with faint styling", () => {
    const html = renderToString(
      <PageShell title="Test" subtitle="Subtitle text">
        Content
      </PageShell>
    );
    expect(html).toContain("Subtitle text");
    expect(html).toContain("text-text-faint");
  });

  it("Callout renders icon, title, and body with surface background", () => {
    const html = renderToString(
      <Callout
        icon={<svg data-testid="callout-icon" />}
        title="Callout Title"
        body="Callout body text"
      />
    );
    expect(html).toContain('data-testid="callout-icon"');
    expect(html).toContain("bg-surface");
    expect(html).toContain("rounded-lg");
    expect(html).toContain("Callout Title");
    expect(html).toContain("Callout body text");
    expect(html).toContain("font-semibold");
  });

  it("PropertyChips renders labels and values in horizontal row", () => {
    const html = renderToString(
      <PropertyChips
        items={[
          { icon: <svg data-testid="icon1" />, label: "Topics", value: "5" },
          { icon: <svg data-testid="icon2" />, label: "Notes", value: "12" },
        ]}
      />
    );
    expect(html).toContain("Topics");
    expect(html).toContain("Notes");
    expect(html).toContain("5");
    expect(html).toContain("12");
    expect(html).toContain("flex");
    expect(html).toContain("border-b");
    expect(html).toContain("border-line");
  });

  it("PropertyChips renders zero value with dim color class", () => {
    const html = renderToString(
      <PropertyChips
        items={[
          { icon: <svg />, label: "Solved", value: 0 },
          { icon: <svg />, label: "Streak", value: "0" },
        ]}
      />
    );
    // Check that both numeric 0 and string "0" get the dim class
    const matches = html.match(/text-text-dim/g);
    expect(matches).toBeTruthy();
    expect(matches?.length).toBeGreaterThanOrEqual(2);
  });

  it("PropertyChips renders non-zero values with normal font-semibold", () => {
    const html = renderToString(
      <PropertyChips
        items={[{ icon: <svg />, label: "Solved", value: "42" }]}
      />
    );
    expect(html).toContain("42");
    expect(html).toContain("font-semibold");
    expect(html).not.toContain("text-text-dim");
  });

  it("ListRow renders with children and optional icon", () => {
    const html = renderToString(
      <ListRow icon={<svg data-testid="row-icon" />}>
        Arrays &amp; Hashing
      </ListRow>
    );
    expect(html).toContain("flex");
    expect(html).toContain("items-center");
    expect(html).toContain("rounded-md");
    expect(html).toContain("text-text-dim");
    expect(html).toContain("text-[13.5px]");
    expect(html).toContain("Arrays &amp; Hashing");
    expect(html).toContain('data-testid="row-icon"');
  });

  it("ListRow renders optional tag with accent-soft styling", () => {
    const html = renderToString(
      <ListRow tag="topic">
        Arrays &amp; Hashing
      </ListRow>
    );
    expect(html).toContain("topic");
    expect(html).toContain("text-accent");
    expect(html).toContain("bg-accent-soft");
    expect(html).toContain("text-[11px]");
  });

  it("ListRow renders optional glyph", () => {
    const html = renderToString(
      <ListRow glyph="◆">
        Test Topic
      </ListRow>
    );
    expect(html).toContain("◆");
    expect(html).toContain("Test Topic");
  });
});
