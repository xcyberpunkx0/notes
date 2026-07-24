import { useState } from "react";
import { useNavigate } from "react-router";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowUpRight,
  Brain,
  Eye,
  Note,
  Fire,
  Target,
  Confetti,
} from "@phosphor-icons/react";
import { PageHeader } from "@/components/PageHeader";
import {
  useDueReviews,
  useRateReview,
  useStreak,
  type DueReview,
} from "@/db/reviews";
import { checkAchievements, type AchievementDef } from "@/db/achievements";
import { Markdown } from "@/components/Markdown";
import type { Rating } from "@/lib/scheduler";
import { cn } from "@/lib/utils";

const RATINGS: { key: Rating; label: string; kbd: string; style: string }[] = [
  { key: "forgot", label: "Forgot", kbd: "1", style: "hover:border-danger/50 hover:text-danger" },
  { key: "hard", label: "Hard", kbd: "2", style: "hover:border-warning/50 hover:text-warning" },
  { key: "good", label: "Good", kbd: "3", style: "hover:border-accent/60 hover:text-accent" },
  { key: "easy", label: "Easy", kbd: "4", style: "hover:border-success/50 hover:text-success" },
];

export function ReviewPage() {
  const { data: due } = useDueReviews();
  const rate = useRateReview();
  const streak = useStreak();
  const navigate = useNavigate();
  const [revealed, setRevealed] = useState(false);
  const [doneCount, setDoneCount] = useState(0);
  const [sessionTotal, setSessionTotal] = useState<number | null>(null);
  const [newBadges, setNewBadges] = useState<AchievementDef[]>([]);

  const current: DueReview | undefined = due?.[0];
  const total = sessionTotal ?? due?.length ?? 0;
  if (sessionTotal === null && due && due.length > 0) {
    setSessionTotal(due.length);
  }

  async function onRate(rating: Rating) {
    if (!current || rate.isPending) return;
    await rate.mutateAsync({ review: current, rating });
    setRevealed(false);
    setDoneCount((c) => c + 1);
    const fresh = await checkAchievements(streak);
    if (fresh.length) setNewBadges((b) => [...b, ...fresh]);
  }

  const sessionDone = sessionTotal !== null && due !== undefined && due.length === 0;

  return (
    <div className="h-full">
      <PageHeader eyebrow="Retention loop" title="Review">
        {total > 0 && !sessionDone && (
          <span className="font-mono text-[11px] text-text-faint">
            {doneCount} / {total} today
          </span>
        )}
      </PageHeader>

      <div className="mx-auto max-w-xl px-8">
        <AnimatePresence mode="wait">
          {sessionDone ? (
            <motion.div
              key="celebrate"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 24 }}
              className="card flex flex-col items-center gap-4 py-16 text-center"
            >
              <span className="flex size-14 items-center justify-center rounded-2xl bg-accent-soft text-accent">
                <Confetti size={24} />
              </span>
              <div>
                <p className="font-(family-name:--font-display) text-lg font-bold">
                  Review done — {doneCount} item{doneCount === 1 ? "" : "s"}
                </p>
                <p className="mt-1 flex items-center justify-center gap-1.5 text-[13px] text-text-dim">
                  <Fire size={14} className="text-warning" />
                  {streak} day streak. Tomorrow keeps it alive.
                </p>
              </div>
              {newBadges.length > 0 && (
                <div className="flex flex-col gap-1.5">
                  {newBadges.map((b) => (
                    <span
                      key={b.key}
                      className="rounded-xl border border-accent/30 bg-accent-soft px-3.5 py-2 text-[13px]"
                    >
                      {b.emoji} <span className="font-medium">{b.title}</span>{" "}
                      <span className="text-text-dim">— {b.description}</span>
                    </span>
                  ))}
                </div>
              )}
            </motion.div>
          ) : current ? (
            <motion.div
              key={current.id}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.18, ease: [0.25, 0.1, 0.25, 1] }}
              className="card"
            >
              <div className="flex items-center justify-between border-b border-line px-5 py-3">
                <span className="eyebrow flex items-center gap-1.5">
                  {current.item_type === "note" ? (
                    <Note size={11} />
                  ) : (
                    <Target size={11} />
                  )}
                  {current.item_type}
                  {current.item_type === "note" && current.hint
                    ? ` · ${current.hint}`
                    : ""}
                </span>
                <span className="font-mono text-[10px] text-text-faint">
                  seen {current.reps}× · lapsed {current.lapses}×
                </span>
              </div>

              <div className="px-8 py-10 text-center">
                <p className="text-[13.5px] text-text-dim">
                  {current.item_type === "problem"
                    ? "Can you recall the approach to…"
                    : "Can you recall the key ideas of…"}
                </p>
                <p className="mt-2 font-(family-name:--font-display) text-[22px] font-bold tracking-tight">
                  {current.title}
                </p>

                <AnimatePresence>
                  {revealed && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      {current.item_type === "problem" && current.hint ? (
                        <div className="mx-auto mt-4 max-h-72 max-w-md overflow-y-auto rounded-xl bg-surface-2 p-3.5 text-left">
                          <span className="eyebrow mb-1.5 block">
                            your six-month note
                          </span>
                          <Markdown>{current.hint}</Markdown>
                        </div>
                      ) : null}
                      <button
                        onClick={() =>
                          navigate(
                            current.item_type === "note"
                              ? `/notes/${current.item_id}`
                              : `/problems/${current.item_id}`,
                          )
                        }
                        className="mt-3 inline-flex items-center gap-1 text-[13px] text-accent hover:underline"
                      >
                        Open and check yourself
                        <ArrowUpRight size={13} />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="border-t border-line p-4">
                {!revealed ? (
                  <button
                    onClick={() => setRevealed(true)}
                    className="btn-primary w-full"
                  >
                    <Eye size={15} />
                    Reveal
                  </button>
                ) : (
                  <div className="grid grid-cols-4 gap-2.5">
                    {RATINGS.map((r) => (
                      <button
                        key={r.key}
                        onClick={() => onRate(r.key)}
                        disabled={rate.isPending}
                        className={cn(
                          "flex h-11 flex-col items-center justify-center rounded-xl border border-line text-[12.5px] font-semibold text-text-dim transition-all duration-100 active:scale-[0.97]",
                          r.style,
                        )}
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ) : due !== undefined ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="card flex flex-col items-center gap-3 border-dashed py-20 text-center"
            >
              <span className="flex size-13 items-center justify-center rounded-2xl bg-accent-soft text-accent">
                <Brain size={22} />
              </span>
              <p className="text-sm font-medium">All caught up</p>
              <p className="max-w-xs text-[13px] text-text-dim">
                Nothing is due right now. New notes and problems join the queue
                a day after you create them.
              </p>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}
