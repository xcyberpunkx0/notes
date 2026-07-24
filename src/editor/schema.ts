import {
  BlockNoteSchema,
  createCodeBlockSpec,
  defaultBlockSpecs,
} from "@blocknote/core";
import { codeBlockOptions } from "@blocknote/code-block";
import { MermaidBlock } from "./MermaidBlock";

export const schema = BlockNoteSchema.create({
  blockSpecs: {
    ...defaultBlockSpecs,
    codeBlock: createCodeBlockSpec({
      ...codeBlockOptions,
      defaultLanguage: "cpp",
      indentLineWithTab: true,
    }),
    mermaid: MermaidBlock(),
  },
});

export type VaultEditor = typeof schema.BlockNoteEditor;
