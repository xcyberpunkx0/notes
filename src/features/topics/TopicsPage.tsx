import { useState } from "react";
import { useNavigate } from "react-router";
import * as Dialog from "@radix-ui/react-dialog";
import { Books, Plus, Sparkle, X } from "@phosphor-icons/react";
import { PageShell } from "@/components/page/PageShell";
import { FacetMotif } from "@/assets/brand/FacetMotif";
import { useCreateTopic, useTopics, type Topic } from "@/db/topics";
import { useTopicStats, type TopicStats } from "@/db/reviews";
import {
  STARTER_TOPICS,
  TOPIC_COLORS,
  TOPIC_EMOJI,
} from "@/lib/topic-meta";
import { cn } from "@/lib/utils";

export function TopicsPage() {
  const { data: topics, isLoading } = useTopics();
  const [dialogOpen, setDialogOpen] = useState(false);
  const createTopic = useCreateTopic();

  async function addStarterTopics() {
    for (const t of STARTER_TOPICS) {
      await createTopic.mutateAsync(t);
    }
  }

  return (
    <div className="h-full overflow-y-auto">
      <PageShell title="Topics" subtitle="Concept Books">
        <div className="mb-6 flex justify-end">
          <button
            onClick={() => setDialogOpen(true)}
            className="btn-primary"
          >
            <Plus size={15} />
            New topic
          </button>
        </div>

        {isLoading ? null : topics && topics.length > 0 ? (
          <TopicGrid topics={topics} />
        ) : (
          <div className="card relative flex flex-col items-center gap-4 overflow-hidden border-dashed py-20 text-center">
            <FacetMotif className="pointer-events-none absolute inset-0 text-text opacity-[0.05]" />
            <span className="flex size-13 items-center justify-center rounded-2xl bg-accent-soft text-accent">
              <Books size={20} />
            </span>
            <div>
              <p className="text-sm font-medium">Your Trove starts here</p>
              <p className="mx-auto mt-1 max-w-sm text-[13px] text-text-dim">
                Create a topic for the first thing you want to truly know.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setDialogOpen(true)}
                className="btn-primary"
              >
                <Plus size={15} />
                Create a topic
              </button>
              <button
                onClick={addStarterTopics}
                disabled={createTopic.isPending}
                className="btn-ghost"
              >
                <Sparkle size={14} />
                Add 8 starter topics
              </button>
            </div>
          </div>
        )}
      </PageShell>

      <NewTopicDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        topics={topics ?? []}
      />
    </div>
  );
}

function MasteryRing({ value, color }: { value: number; color: string }) {
  const r = 13;
  const c = 2 * Math.PI * r;
  return (
    <span
      className="relative inline-flex size-8 items-center justify-center"
      title={`${Math.round(value * 100)}% retained`}
    >
      <svg viewBox="0 0 32 32" className="size-8 -rotate-90">
        <circle
          cx="16"
          cy="16"
          r={r}
          fill="none"
          stroke="var(--line)"
          strokeWidth="3"
        />
        <circle
          cx="16"
          cy="16"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={`${c * Math.max(0.02, value)} ${c}`}
        />
      </svg>
      <span className="absolute font-mono text-[8px] font-semibold text-text-dim">
        {Math.round(value * 100)}
      </span>
    </span>
  );
}

function TopicGrid({ topics }: { topics: Topic[] }) {
  const navigate = useNavigate();
  const { data: stats } = useTopicStats();
  const statsFor = (id: number): TopicStats | undefined =>
    stats?.find((s) => s.topic_id === id);
  const roots = topics.filter((t) => !t.parent_id);
  const childrenOf = (id: number) => topics.filter((t) => t.parent_id === id);

  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(210px,1fr))] gap-3">
      {roots.map((topic) => {
        const children = childrenOf(topic.id);
        return (
          <button
            key={topic.id}
            onClick={() => navigate(`/topics/${topic.id}`)}
            className="card group flex flex-col items-start gap-4 p-5 text-left transition-colors duration-150 hover:bg-surface-2 hover:border-line-strong"
          >
            <span className="flex w-full items-start justify-between">
              <span
                className="flex size-12 items-center justify-center rounded-2xl text-xl"
                style={{ backgroundColor: `${topic.color ?? "#8e6bf5"}24` }}
              >
                {topic.icon || "📚"}
              </span>
              {statsFor(topic.id) && (
                <MasteryRing
                  value={statsFor(topic.id)!.mastery}
                  color={topic.color ?? "#8e6bf5"}
                />
              )}
            </span>
            <span className="min-w-0">
              <span className="block truncate font-(family-name:--font-display) text-[15px] font-bold">
                {topic.name}
              </span>
              <span className="mt-1 block font-mono text-[11px] text-text-faint">
                {topic.note_count} {topic.note_count === 1 ? "note" : "notes"}
                {children.length > 0 && ` · ${children.length} sub`}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

function NewTopicDialog({
  open,
  onOpenChange,
  topics,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  topics: Topic[];
}) {
  const navigate = useNavigate();
  const createTopic = useCreateTopic();
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("🧮");
  const [color, setColor] = useState(TOPIC_COLORS[0].value);
  const [parentId, setParentId] = useState<number | null>(null);

  async function submit() {
    if (!name.trim()) return;
    const id = await createTopic.mutateAsync({
      name: name.trim(),
      icon,
      color,
      parent_id: parentId,
    });
    onOpenChange(false);
    setName("");
    setParentId(null);
    if (id) navigate(`/topics/${id}`);
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-[2px]" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-50 w-[440px] -translate-x-1/2 -translate-y-1/2 rounded-lg border border-line bg-surface p-6 shadow-xl shadow-black/20"
          aria-describedby={undefined}
        >
          <div className="flex items-center justify-between">
            <Dialog.Title className="text-[13.5px] font-semibold">
              New topic
            </Dialog.Title>
            <Dialog.Close className="flex size-7 items-center justify-center rounded-md text-text-faint hover:bg-surface-2 hover:text-text">
              <X size={14} />
            </Dialog.Close>
          </div>

          <div className="mt-4 flex flex-col gap-4">
            <div>
              <label className="eyebrow mb-1.5 block">Name</label>
              <input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submit()}
                placeholder="e.g. Graphs"
                className="h-10 w-full rounded-xl border border-line bg-surface-2 px-3.5 text-sm outline-none transition-colors focus:border-accent"
              />
            </div>

            <div>
              <label className="eyebrow mb-1.5 block">Icon</label>
              <div className="flex flex-wrap gap-1">
                {TOPIC_EMOJI.map((e) => (
                  <button
                    key={e}
                    onClick={() => setIcon(e)}
                    className={cn(
                      "flex size-8 items-center justify-center rounded-lg text-base transition-colors",
                      icon === e
                        ? "bg-accent-soft ring-1 ring-accent"
                        : "hover:bg-surface-2",
                    )}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="eyebrow mb-1.5 block">Color</label>
              <div className="flex gap-1.5">
                {TOPIC_COLORS.map((c) => (
                  <button
                    key={c.value}
                    title={c.name}
                    onClick={() => setColor(c.value)}
                    className={cn(
                      "size-6 rounded-full transition-transform",
                      color === c.value
                        ? "scale-110 ring-2 ring-text ring-offset-2 ring-offset-surface"
                        : "hover:scale-110",
                    )}
                    style={{ backgroundColor: c.value }}
                  />
                ))}
              </div>
            </div>

            {topics.length > 0 && (
              <div>
                <label className="eyebrow mb-1.5 block">
                  Parent topic (optional)
                </label>
                <select
                  value={parentId ?? ""}
                  onChange={(e) =>
                    setParentId(e.target.value ? Number(e.target.value) : null)
                  }
                  className="h-10 w-full rounded-xl border border-line bg-surface-2 px-3 text-sm outline-none"
                >
                  <option value="">None — top level</option>
                  {topics
                    .filter((t) => !t.parent_id)
                    .map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.icon} {t.name}
                      </option>
                    ))}
                </select>
              </div>
            )}

            <button
              onClick={submit}
              disabled={!name.trim() || createTopic.isPending}
              className="btn-primary w-full"
            >
              Create topic
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
