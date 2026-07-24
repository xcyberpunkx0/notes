import { useNavigate, useParams } from "react-router";
import { FileText, Plus, Trash2 } from "lucide-react";
import { useNotesByTopic, useCreateNote } from "@/db/notes";
import { useDeleteTopic, useTopic, useTopics } from "@/db/topics";
import { formatRelative } from "@/lib/time";

export function TopicDetailPage() {
  const params = useParams();
  const topicId = Number(params.topicId);
  const navigate = useNavigate();
  const { data: topic } = useTopic(topicId);
  const { data: allTopics } = useTopics();
  const { data: notes } = useNotesByTopic(topicId);
  const createNote = useCreateNote();
  const deleteTopic = useDeleteTopic();

  const subtopics =
    allTopics?.filter((t) => t.parent_id === topicId) ?? [];

  async function newNote() {
    const id = await createNote.mutateAsync({ topic_id: topicId });
    navigate(`/notes/${id}`);
  }

  async function removeTopic() {
    if (
      !window.confirm(
        `Delete "${topic?.name}" and its subtopics? Notes inside will be kept but unfiled.`,
      )
    )
      return;
    await deleteTopic.mutateAsync(topicId);
    navigate("/topics");
  }

  if (!topic) return null;

  return (
    <div className="h-full">
      <div className="flex items-end justify-between px-8 pb-5 pt-8">
        <div className="flex items-center gap-3.5">
          <span
            className="flex size-12 items-center justify-center rounded-xl text-2xl"
            style={{ backgroundColor: `${topic.color ?? "#7c8cf8"}1f` }}
          >
            {topic.icon || "📚"}
          </span>
          <div>
            <p className="eyebrow mb-1">Topic</p>
            <h1 className="text-xl font-semibold tracking-tight">
              {topic.name}
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={removeTopic}
            title="Delete topic"
            className="flex size-9 items-center justify-center rounded-lg border border-line text-text-faint transition-colors duration-150 hover:border-danger/40 hover:text-danger"
          >
            <Trash2 size={15} />
          </button>
          <button
            onClick={newNote}
            disabled={createNote.isPending}
            className="flex h-9 items-center gap-2 rounded-lg bg-accent px-3.5 text-[13px] font-medium text-white transition-all duration-150 hover:brightness-110 active:scale-[0.98]"
          >
            <Plus size={15} />
            New note
          </button>
        </div>
      </div>

      <div className="px-8 pb-10">
        {subtopics.length > 0 && (
          <div className="mb-5">
            <p className="eyebrow mb-2">Subtopics</p>
            <div className="flex flex-wrap gap-2">
              {subtopics.map((s) => (
                <button
                  key={s.id}
                  onClick={() => navigate(`/topics/${s.id}`)}
                  className="flex h-8 items-center gap-1.5 rounded-lg border border-line px-2.5 text-[13px] text-text-dim transition-colors duration-150 hover:bg-surface-2 hover:text-text"
                >
                  <span className="text-sm">{s.icon}</span>
                  {s.name}
                  <span className="font-mono text-[10px] text-text-faint">
                    {s.note_count}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {notes && notes.length > 0 ? (
          <div className="overflow-hidden rounded-xl border border-line">
            {notes.map((note, i) => (
              <button
                key={note.id}
                onClick={() => navigate(`/notes/${note.id}`)}
                className={
                  "flex w-full items-center gap-3 bg-surface px-4 py-3 text-left transition-colors duration-100 hover:bg-surface-2 " +
                  (i > 0 ? "border-t border-line" : "")
                }
              >
                <FileText size={15} className="shrink-0 text-text-faint" />
                <span className="min-w-0 flex-1 truncate text-[13px] font-medium">
                  {note.title || "Untitled"}
                </span>
                <span className="shrink-0 font-mono text-[11px] text-text-faint">
                  {formatRelative(note.updated_at)}
                </span>
              </button>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-line py-14 text-center">
            <span className="flex size-10 items-center justify-center rounded-lg bg-accent-soft text-accent">
              <FileText size={17} />
            </span>
            <p className="text-sm font-medium">No notes here yet</p>
            <p className="max-w-xs text-[13px] text-text-dim">
              Hit <span className="font-medium text-text">New note</span> and
              type <span className="kbd">/</span> in the editor for DSA
              sections like Intuition, Dry run and Complexity.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
