import { useNavigate, useParams } from "react-router";
import { Note, Plus, Trash } from "@phosphor-icons/react";
import { useNotesByTopic, useCreateNote } from "@/db/notes";
import { useDeleteTopic, useTopic, useTopics } from "@/db/topics";
import { formatRelative } from "@/lib/time";
import { PageShell } from "@/components/page/PageShell";

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
    <div className="h-full overflow-y-auto">
      <PageShell
        icon={
          <span
            className="flex size-full items-center justify-center rounded-2xl text-[26px]"
            style={{ backgroundColor: `${topic.color ?? "#8e6bf5"}24` }}
          >
            {topic.icon || "📚"}
          </span>
        }
        title={topic.name}
        subtitle="Topic"
      >
        <div className="mb-6 flex items-center justify-end gap-2">
          <button
            onClick={removeTopic}
            title="Delete topic"
            className="flex size-10 items-center justify-center rounded-xl border border-line text-text-faint transition-colors duration-150 hover:border-danger/40 hover:text-danger"
          >
            <Trash size={15} />
          </button>
          <button
            onClick={newNote}
            disabled={createNote.isPending}
            className="btn-primary"
          >
            <Plus size={15} />
            New note
          </button>
        </div>

        {subtopics.length > 0 && (
          <div className="mb-5">
            <p className="eyebrow mb-2">Subtopics</p>
            <div className="flex flex-wrap gap-2">
              {subtopics.map((s) => (
                <button
                  key={s.id}
                  onClick={() => navigate(`/topics/${s.id}`)}
                  className="flex h-9 items-center gap-1.5 rounded-full border border-line px-3.5 text-[13px] text-text-dim transition-colors duration-150 hover:bg-surface-2 hover:text-text"
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
          <div className="card overflow-hidden">
            {notes.map((note, i) => (
              <button
                key={note.id}
                onClick={() => navigate(`/notes/${note.id}`)}
                className={
                  "flex w-full items-center gap-3.5 px-5 py-3.5 text-left transition-colors duration-100 hover:bg-surface-2 " +
                  (i > 0 ? "border-t border-line" : "")
                }
              >
                <Note size={15} className="shrink-0 text-text-faint" />
                <span className="min-w-0 flex-1 truncate text-sm font-medium">
                  {note.title || "Untitled"}
                </span>
                <span className="shrink-0 font-mono text-[11px] text-text-faint">
                  {formatRelative(note.updated_at)}
                </span>
              </button>
            ))}
          </div>
        ) : (
          <div className="card flex flex-col items-center gap-3 border-dashed py-16 text-center">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-accent-soft text-accent">
              <Note size={19} />
            </span>
            <p className="text-sm font-medium">No notes here yet</p>
            <p className="max-w-xs text-[13px] text-text-dim">
              Hit <span className="font-medium text-text">New note</span> and
              type <span className="kbd">/</span> in the editor for DSA
              sections like Intuition, Dry run and Complexity.
            </p>
          </div>
        )}
      </PageShell>
    </div>
  );
}
