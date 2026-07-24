import {
  BlockNoteSchema,
  createCodeBlockSpec,
  defaultBlockSpecs,
  defaultInlineContentSpecs,
} from "@blocknote/core";
import { codeBlockOptions } from "@blocknote/code-block";
import { MermaidBlock } from "./MermaidBlock";
import { VaultLink } from "./VaultLink";

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
  inlineContentSpecs: {
    ...defaultInlineContentSpecs,
    vaultLink: VaultLink,
  },
});

export type VaultEditor = typeof schema.BlockNoteEditor;
