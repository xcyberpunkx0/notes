/**
 * Extracts plain text from BlockNote block JSON for full-text indexing.
 * Walks blocks recursively, collecting inline text, code content, and
 * table cell text. Pure function — unit tested.
 */

interface InlineNode {
  type?: string;
  text?: string;
  content?: unknown;
}

export interface BlockNode {
  type?: string;
  content?: unknown;
  children?: BlockNode[];
  props?: Record<string, unknown>;
}

function inlineText(content: unknown): string {
  if (typeof content === "string") return content;
  if (!Array.isArray(content)) return "";
  return content
    .map((node: InlineNode) => {
      if (typeof node?.text === "string") return node.text;
      if (node?.content) return inlineText(node.content);
      return "";
    })
    .join("");
}

function tableText(content: unknown): string {
  const rows = (content as { rows?: { cells?: unknown[] }[] })?.rows;
  if (!Array.isArray(rows)) return "";
  return rows
    .map((row) =>
      (row.cells ?? [])
        .map((cell) =>
          inlineText((cell as { content?: unknown })?.content ?? cell),
        )
        .join(" "),
    )
    .join("\n");
}

export function extractText(blocks: BlockNode[] | undefined | null): string {
  if (!Array.isArray(blocks)) return "";
  const parts: string[] = [];
  for (const block of blocks) {
    if (block.type === "table") {
      parts.push(tableText(block.content));
    } else if (typeof block.props?.code === "string") {
      // custom blocks (e.g. mermaid) that keep source in props.code
      parts.push(block.props.code);
    } else {
      parts.push(inlineText(block.content));
    }
    if (block.children?.length) parts.push(extractText(block.children));
  }
  return parts.filter(Boolean).join("\n");
}
