import {
  BookOpen,
  Bug,
  Clock,
  GitBranch,
  Lightbulb,
  TreeStructure,
  PuzzlePiece,
  FlowArrow,
} from "@phosphor-icons/react";
import type { DefaultReactSuggestionItem } from "@blocknote/react";
import type { PartialBlock } from "@blocknote/core";
import type { schema } from "./schema";

type Editor = typeof schema.BlockNoteEditor;
type Block = PartialBlock<
  typeof schema.blockSchema,
  typeof schema.inlineContentSchema,
  typeof schema.styleSchema
>;

function heading(text: string): Block {
  return { type: "heading", props: { level: 2 }, content: text };
}

function para(text = ""): Block {
  return { type: "paragraph", content: text };
}

/** Inserts blocks at the cursor, replacing the current block if it's empty. */
function insertSection(editor: Editor, blocks: Block[]) {
  const cursor = editor.getTextCursorPosition().block;
  const isEmptyParagraph =
    cursor.type === "paragraph" &&
    Array.isArray(cursor.content) &&
    cursor.content.length === 0;
  const inserted = editor.insertBlocks(blocks, cursor, "after");
  if (isEmptyParagraph) editor.removeBlocks([cursor]);
  const last = inserted[inserted.length - 1];
  if (last) editor.setTextCursorPosition(last, "end");
}

interface TemplateDef {
  title: string;
  aliases: string[];
  subtext: string;
  icon: React.JSX.Element;
  blocks: Block[];
}

const TEMPLATES: TemplateDef[] = [
  {
    title: "Intuition",
    aliases: ["intuition", "idea"],
    subtext: "Why the approach works, in your own words",
    icon: <Lightbulb size={18} />,
    blocks: [heading("Intuition"), para()],
  },
  {
    title: "Dry run",
    aliases: ["dryrun", "trace", "walkthrough"],
    subtext: "Walk an example through the algorithm",
    icon: <FlowArrow size={18} />,
    blocks: [heading("Dry run"), para("Input: "), para()],
  },
  {
    title: "Complexity",
    aliases: ["complexity", "bigO", "time", "space"],
    subtext: "Time and space analysis",
    icon: <Clock size={18} />,
    blocks: [
      heading("Complexity"),
      para("Time: O(?) — "),
      para("Space: O(?) — "),
    ],
  },
  {
    title: "Edge cases",
    aliases: ["edgecases", "edge", "corner"],
    subtext: "Inputs that break naive solutions",
    icon: <PuzzlePiece size={18} />,
    blocks: [
      heading("Edge cases"),
      { type: "bulletListItem", content: "Empty input" },
      { type: "bulletListItem", content: "" },
    ],
  },
  {
    title: "Common mistakes",
    aliases: ["mistakes", "pitfalls", "gotchas"],
    subtext: "What you got wrong before — so you don't again",
    icon: <Bug size={18} />,
    blocks: [
      heading("Common mistakes"),
      { type: "bulletListItem", content: "" },
    ],
  },
  {
    title: "Patterns",
    aliases: ["patterns", "uses", "when"],
    subtext: "When to reach for this concept",
    icon: <GitBranch size={18} />,
    blocks: [heading("Patterns"), { type: "bulletListItem", content: "" }],
  },
  {
    title: "Code template",
    aliases: ["codetemplate", "template", "snippet"],
    subtext: "Reusable implementation, C++ by default",
    icon: <TreeStructure size={18} />,
    blocks: [
      heading("Code template"),
      { type: "codeBlock", props: { language: "cpp" } },
    ],
  },
  {
    title: "References",
    aliases: ["references", "links", "resources"],
    subtext: "Articles, videos, editorial links",
    icon: <BookOpen size={18} />,
    blocks: [heading("References"), { type: "bulletListItem", content: "" }],
  },
];

export function getDsaTemplateItems(
  editor: Editor,
): DefaultReactSuggestionItem[] {
  return TEMPLATES.map((t) => ({
    title: t.title,
    subtext: t.subtext,
    aliases: t.aliases,
    group: "DSA sections",
    icon: t.icon,
    onItemClick: () => insertSection(editor, t.blocks),
  }));
}

export function getMermaidItem(editor: Editor): DefaultReactSuggestionItem {
  return {
    title: "Mermaid diagram",
    subtext: "Flowcharts, trees and graphs from text",
    aliases: ["mermaid", "diagram", "flowchart", "graph"],
    group: "DSA sections",
    icon: <FlowArrow size={18} />,
    onItemClick: () => insertSection(editor, [{ type: "mermaid" }]),
  };
}
