import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import * as Dialog from "@radix-ui/react-dialog";
import { BlockNoteEditor } from "@blocknote/core";
import { FileArrowDown, X } from "@phosphor-icons/react";
import { useUiStore } from "@/app/store";
import { schema } from "@/editor/schema";
import { saveNoteContent, useCreateNote } from "@/db/notes";
import { useTopics } from "@/db/topics";
import { extractText, type BlockNode } from "@/lib/extract-text";

export function ImportMarkdownDialog() {
  const open = useUiStore((s) => s.mdImportOpen);
  const setOpen = useUiStore((s) => s.setMdImportOpen);
  const navigate = useNavigate();
  const { data: topics } = useTopics();
  const createNote = useCreateNote();
  const [markdown, setMarkdown] = useState("");
  const [topicId, setTopicId] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);

  // Headless editor used purely for markdown → blocks conversion
  const parser = useMemo(() => BlockNoteEditor.create({ schema }), []);

  async function importNow() {
    if (!markdown.trim() || !topicId) return;
    setBusy(true);
    try {
      const blocks = (await parser.tryParseMarkdownToBlocks(
        markdown,
      )) as unknown as BlockNode[];
      const firstHeading = blocks.find((b) => b.type === "heading");
      const title =
        extractText(firstHeading ? [firstHeading] : []).split("\n")[0] ||
        "Imported note";
      const id = await createNote.mutateAsync({ topic_id: topicId, title });
      await saveNoteContent(id, title, blocks);
      setOpen(false);
      setMarkdown("");
      navigate(`/notes/${id}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-[2px]" />
        <Dialog.Content
          className="fixed left-1/2 top-[8%] z-50 w-[620px] -translate-x-1/2 rounded-lg border border-line bg-surface p-6 shadow-xl shadow-black/20"
          aria-describedby={undefined}
        >
          <div className="flex items-center justify-between">
            <Dialog.Title className="flex items-center gap-2 text-[13.5px] font-semibold">
              <FileArrowDown size={15} className="text-accent" />
              New note from markdown
            </Dialog.Title>
            <Dialog.Close className="flex size-7 items-center justify-center rounded-md text-text-faint hover:bg-surface-2 hover:text-text">
              <X size={14} />
            </Dialog.Close>
          </div>
          <p className="mt-1 text-[12px] text-text-dim">
            Paste a whole document — headings, tables, and code blocks become
            real editable blocks. The first heading becomes the title.
          </p>

          <textarea
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            placeholder="# Binary Search&#10;&#10;Works on **sorted** arrays…"
            spellCheck={false}
            className="mt-4 h-64 w-full resize-y rounded-xl border border-line bg-surface-2 p-3.5 font-mono text-[12.5px] leading-relaxed outline-none transition-colors focus:border-accent"
          />

          <div className="mt-3 flex items-center gap-2">
            <select
              value={topicId ?? ""}
              onChange={(e) =>
                setTopicId(e.target.value ? Number(e.target.value) : null)
              }
              className="h-10 flex-1 rounded-xl border border-line bg-surface-2 px-3 text-sm outline-none"
            >
              <option value="">Choose a topic…</option>
              {topics?.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
            <button
              onClick={importNow}
              disabled={!markdown.trim() || !topicId || busy}
              className="btn-primary"
            >
              {busy ? "Importing…" : "Create note"}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
