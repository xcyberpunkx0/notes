import { describe, expect, it } from "vitest";
import { extractText } from "./extract-text";

describe("extractText", () => {
  it("returns empty string for empty or missing blocks", () => {
    expect(extractText([])).toBe("");
    expect(extractText(undefined)).toBe("");
    expect(extractText(null)).toBe("");
  });

  it("extracts styled inline text from paragraphs and headings", () => {
    const blocks = [
      { type: "heading", content: [{ type: "text", text: "Binary Search" }] },
      {
        type: "paragraph",
        content: [
          { type: "text", text: "Works on " },
          { type: "text", text: "sorted", styles: { bold: true } },
          { type: "text", text: " arrays." },
        ],
      },
    ];
    expect(extractText(blocks)).toBe("Binary Search\nWorks on sorted arrays.");
  });

  it("extracts code block content", () => {
    const blocks = [
      {
        type: "codeBlock",
        props: { language: "cpp" },
        content: [{ type: "text", text: "int lo = 0, hi = n - 1;" }],
      },
    ];
    expect(extractText(blocks)).toContain("int lo = 0");
  });

  it("extracts mermaid source from props.code", () => {
    const blocks = [
      { type: "mermaid", props: { code: "graph TD\n A --> B" }, content: undefined },
    ];
    expect(extractText(blocks)).toContain("A --> B");
  });

  it("recurses into children", () => {
    const blocks = [
      {
        type: "bulletListItem",
        content: [{ type: "text", text: "outer" }],
        children: [
          {
            type: "bulletListItem",
            content: [{ type: "text", text: "inner" }],
          },
        ],
      },
    ];
    expect(extractText(blocks)).toBe("outer\ninner");
  });

  it("extracts table cell text", () => {
    const blocks = [
      {
        type: "table",
        content: {
          type: "tableContent",
          rows: [
            {
              cells: [
                [{ type: "text", text: "Operation" }],
                [{ type: "text", text: "O(log n)" }],
              ],
            },
          ],
        },
      },
    ];
    expect(extractText(blocks)).toContain("O(log n)");
  });
});
