import { useMemo } from "react";
import { filterSuggestionItems } from "@blocknote/core";
import { BlockNoteView } from "@blocknote/mantine";
import {
  SuggestionMenuController,
  getDefaultReactSlashMenuItems,
  useCreateBlockNote,
} from "@blocknote/react";
import "@blocknote/mantine/style.css";
import { schema } from "./schema";
import { getDsaTemplateItems, getMermaidItem } from "./dsaTemplates";
import { getVaultLinkItems } from "./VaultLink";
import { useUiStore } from "@/app/store";

interface NoteEditorProps {
  initialContent?: string; // JSON string from the database
  onChange: (blocks: unknown[]) => void;
}

export function NoteEditor({ initialContent, onChange }: NoteEditorProps) {
  const theme = useUiStore((s) => s.theme);

  const parsed = useMemo(() => {
    if (!initialContent) return undefined;
    try {
      const blocks = JSON.parse(initialContent);
      return Array.isArray(blocks) && blocks.length > 0 ? blocks : undefined;
    } catch {
      return undefined;
    }
  }, [initialContent]);

  const editor = useCreateBlockNote({
    schema,
    initialContent: parsed,
  });

  return (
    <BlockNoteView
      editor={editor}
      theme={theme}
      slashMenu={false}
      onChange={() => onChange(editor.document)}
    >
      <SuggestionMenuController
        triggerCharacter="/"
        getItems={async (query) =>
          filterSuggestionItems(
            [
              ...getDsaTemplateItems(editor),
              getMermaidItem(editor),
              ...getDefaultReactSlashMenuItems(editor),
            ],
            query,
          )
        }
      />
      <SuggestionMenuController
        triggerCharacter="@"
        getItems={(query) => getVaultLinkItems(editor, query)}
      />
    </BlockNoteView>
  );
}
