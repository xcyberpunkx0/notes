import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import { NoteEditor } from "@/editor/NoteEditor";
import { BacklinksPanel } from "@/components/BacklinksPanel";
import { saveNoteContent, useNote } from "@/db/notes";
import type { BlockNode } from "@/lib/extract-text";

export function NotePage() {
  const params = useParams();
  const noteId = Number(params.noteId);
  const { data: note, isLoading } = useNote(noteId);

  if (isLoading || !note) return null;
  // Key by id so switching notes rebuilds the editor with fresh content
  return <NoteView key={note.id} noteId={note.id} initialTitle={note.title} initialContent={note.content_json} />;
}

function NoteView({
  noteId,
  initialTitle,
  initialContent,
}: {
  noteId: number;
  initialTitle: string;
  initialContent: string;
}) {
  const qc = useQueryClient();
  const [title, setTitle] = useState(initialTitle);
  const [saveState, setSaveState] = useState<"saved" | "saving" | "idle">(
    "idle",
  );

  const latest = useRef<{ title: string; blocks: BlockNode[] | null }>({
    title: initialTitle,
    blocks: null,
  });
  const timer = useRef<number | null>(null);

  const flush = useCallback(async () => {
    if (timer.current) {
      window.clearTimeout(timer.current);
      timer.current = null;
    }
    const { title, blocks } = latest.current;
    if (blocks === null && title === initialTitle) return;
    setSaveState("saving");
    try {
      await saveNoteContent(
        noteId,
        title,
        blocks ?? (JSON.parse(initialContent || "[]") as BlockNode[]),
      );
      setSaveState("saved");
      qc.invalidateQueries({ queryKey: ["notes", "topic"] });
      qc.invalidateQueries({ queryKey: ["backlinks"] });
    } catch (err) {
      console.error("Autosave failed:", err);
      setSaveState("idle");
    }
  }, [noteId, initialContent, initialTitle, qc]);

  const scheduleSave = useCallback(() => {
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(flush, 800);
  }, [flush]);

  // Flush pending changes when leaving the note
  useEffect(() => {
    return () => {
      void flush();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="mx-auto h-full max-w-3xl px-8">
      <div className="flex items-center justify-between pt-10">
        <input
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            latest.current.title = e.target.value;
            scheduleSave();
          }}
          placeholder="Untitled"
          className="w-full bg-transparent text-[28px] font-semibold tracking-tight outline-none placeholder:text-text-faint"
        />
        <span className="shrink-0 font-mono text-[10px] uppercase tracking-widest text-text-faint">
          {saveState === "saving" ? "Saving…" : saveState === "saved" ? "Saved" : ""}
        </span>
      </div>

      <div className="-mx-[54px] pt-4">
        <NoteEditor
          initialContent={initialContent}
          onChange={(blocks) => {
            latest.current.blocks = blocks as BlockNode[];
            scheduleSave();
          }}
        />
      </div>

      <div className="pb-24">
        <BacklinksPanel targetType="note" targetId={noteId} />
      </div>
    </div>
  );
}
