import { useState } from "react";
import { useNavigate } from "react-router";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Lightning } from "@phosphor-icons/react";
import { useQuickLogProblem } from "@/db/problems";
import { useTopics } from "@/db/topics";
import { detectPlatform, titleFromUrl } from "@/lib/platform-detect";
import { cn } from "@/lib/utils";
import { ConfidenceDots, DIFFICULTIES } from "./bits";

export function QuickLogDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const navigate = useNavigate();
  const { data: topics } = useTopics();
  const quickLog = useQuickLogProblem();

  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [difficulty, setDifficulty] = useState("Medium");
  const [topicIds, setTopicIds] = useState<number[]>([]);
  const [confidence, setConfidence] = useState(3);
  const [solvedMyself, setSolvedMyself] = useState(true);
  const [hintsUsed, setHintsUsed] = useState(false);

  const platform = detectPlatform(url);

  function onUrlChange(value: string) {
    setUrl(value);
    if (!title.trim()) {
      const guessed = titleFromUrl(value);
      if (guessed) setTitle(guessed);
    }
  }

  function toggleTopic(id: number) {
    setTopicIds((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id],
    );
  }

  async function submit(thenDebrief: boolean) {
    if (!title.trim()) return;
    const id = await quickLog.mutateAsync({
      title: title.trim(),
      url: url.trim(),
      platform,
      difficulty,
      topic_ids: topicIds,
      confidence,
      solved_myself: solvedMyself,
      hints_used: hintsUsed,
    });
    onOpenChange(false);
    setUrl("");
    setTitle("");
    setTopicIds([]);
    setConfidence(3);
    if (thenDebrief) navigate(`/problems/${id}`);
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-[2px]" />
        <Dialog.Content
          className="fixed left-1/2 top-[12%] z-50 w-[520px] -translate-x-1/2 rounded-lg border border-line bg-surface p-6 shadow-xl shadow-black/20"
          aria-describedby={undefined}
        >
          <div className="flex items-center justify-between">
            <Dialog.Title className="flex items-center gap-2 text-[13.5px] font-semibold">
              <Lightning size={15} className="text-accent" />
              Log a problem
            </Dialog.Title>
            <Dialog.Close className="flex size-7 items-center justify-center rounded-md text-text-faint hover:bg-surface-2 hover:text-text">
              <X size={14} />
            </Dialog.Close>
          </div>

          <div className="mt-4 flex flex-col gap-3.5">
            <div>
              <label className="eyebrow mb-1.5 flex items-center justify-between">
                <span>Problem URL</span>
                {platform && (
                  <span className="normal-case tracking-normal text-accent">
                    {platform}
                  </span>
                )}
              </label>
              <input
                autoFocus
                value={url}
                onChange={(e) => onUrlChange(e.target.value)}
                placeholder="Paste the link — platform and title auto-fill"
                className="h-10 w-full rounded-xl border border-line bg-surface-2 px-3.5 text-sm outline-none transition-colors focus:border-accent"
              />
            </div>

            <div>
              <label className="eyebrow mb-1.5 block">Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Koko Eating Bananas"
                className="h-10 w-full rounded-xl border border-line bg-surface-2 px-3.5 text-sm outline-none transition-colors focus:border-accent"
              />
            </div>

            <div className="flex items-end justify-between gap-4">
              <div>
                <label className="eyebrow mb-1.5 block">Difficulty</label>
                <div className="flex gap-1">
                  {DIFFICULTIES.map((d) => (
                    <button
                      key={d}
                      onClick={() => setDifficulty(d)}
                      className={cn(
                        "h-9 rounded-full px-3.5 text-[12px] font-medium transition-colors",
                        difficulty === d
                          ? "bg-accent-soft text-accent ring-1 ring-accent"
                          : "border border-line text-text-dim hover:bg-surface-2",
                      )}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="eyebrow mb-2 block">Confidence</label>
                <ConfidenceDots value={confidence} onChange={setConfidence} size="md" />
              </div>
            </div>

            {topics && topics.length > 0 && (
              <div>
                <label className="eyebrow mb-1.5 block">Topics</label>
                <div className="flex max-h-24 flex-wrap gap-1 overflow-y-auto">
                  {topics.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => toggleTopic(t.id)}
                      className={cn(
                        "flex h-8 items-center gap-1.5 rounded-full px-3 text-[12px] transition-colors",
                        topicIds.includes(t.id)
                          ? "bg-accent-soft text-accent ring-1 ring-accent"
                          : "border border-line text-text-dim hover:bg-surface-2",
                      )}
                    >
                      <span>{t.icon}</span>
                      {t.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-4">
              <label className="flex cursor-pointer items-center gap-2 text-[13px] text-text-dim">
                <input
                  type="checkbox"
                  checked={solvedMyself}
                  onChange={(e) => setSolvedMyself(e.target.checked)}
                  className="size-3.5 accent-(--accent)"
                />
                Solved it myself
              </label>
              <label className="flex cursor-pointer items-center gap-2 text-[13px] text-text-dim">
                <input
                  type="checkbox"
                  checked={hintsUsed}
                  onChange={(e) => setHintsUsed(e.target.checked)}
                  className="size-3.5 accent-(--accent)"
                />
                Used hints
              </label>
            </div>

            <div className="mt-1 flex gap-2">
              <button
                onClick={() => submit(true)}
                disabled={!title.trim() || quickLog.isPending}
                className="btn-primary flex-1"
              >
                Log & debrief →
              </button>
              <button
                onClick={() => submit(false)}
                disabled={!title.trim() || quickLog.isPending}
                className="btn-ghost disabled:opacity-40"
              >
                Just log it
              </button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
