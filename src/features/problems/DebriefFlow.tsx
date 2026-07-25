import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, CaretRight, PencilSimple, Sparkle } from "@phosphor-icons/react";
import { Markdown } from "@/components/Markdown";
import {
  DEBRIEF_FIELDS,
  useUpdateProblemField,
  type DebriefField,
  type ProblemRow,
} from "@/db/problems";
import { cn } from "@/lib/utils";

export const PROMPTS: Record<DebriefField, { question: string; hint: string }> = {
  concept_taught: {
    question: "What concept did this problem teach you?",
    hint: "The core idea — e.g. “binary search on the answer space”.",
  },
  wrong_approach: {
    question: "What was your first (wrong) approach?",
    hint: "Naive or misguided attempts are the best teachers.",
  },
  stuck_where: {
    question: "Where exactly did you get stuck?",
    hint: "The specific step where progress stopped.",
  },
  concepts_recalled: {
    question: "Which older concepts did you forget — or reuse — to solve this?",
    hint: "e.g. prefix sums came back; forgot how lower_bound treats duplicates.",
  },
  mistake_made: {
    question: "What mistake did you make?",
    hint: "Off-by-one? Wrong data structure? Missed constraint?",
  },
  unlock_pattern: {
    question: "What pattern unlocked the solution?",
    hint: "The realization that made it click.",
  },
  remember_next: {
    question: "What should you remember next time?",
    hint: "A rule of thumb for future-you.",
  },
  six_month_note: {
    question: "Six months from now, what's the ONE thing to remember?",
    hint: "If everything else fades, keep this.",
  },
};

export function DebriefFlow({ problem }: { problem: ProblemRow }) {
  const updateField = useUpdateProblemField();
  const unanswered = useMemo(
    () => DEBRIEF_FIELDS.filter((f) => !problem[f]),
    [problem],
  );
  const answered = DEBRIEF_FIELDS.filter((f) => problem[f]);
  const [active, setActive] = useState<DebriefField | null>(
    unanswered[0] ?? null,
  );
  const [draft, setDraft] = useState("");
  const [editing, setEditing] = useState<DebriefField | null>(null);

  function advance(from: DebriefField) {
    const rest = unanswered.filter((f) => f !== from);
    setActive(rest[0] ?? null);
    setDraft("");
  }

  async function saveActive() {
    if (!active || !draft.trim()) return advance(active!);
    await updateField.mutateAsync({
      id: problem.id,
      field: active,
      value: draft.trim(),
    });
    advance(active);
  }

  const done = answered.length;
  const total = DEBRIEF_FIELDS.length;

  return (
    <section className="card">
      <header className="flex items-center justify-between border-b border-line px-5 py-3">
        <span className="flex items-center gap-2 text-[13px] font-semibold">
          <Sparkle size={14} weight="regular" className="text-accent" />
          Debrief
        </span>
        <span className="flex items-center gap-1.5">
          {DEBRIEF_FIELDS.map((f) => (
            <span
              key={f}
              className={cn(
                "size-1.5 rounded-full transition-colors",
                problem[f] ? "bg-accent" : "bg-line-strong",
              )}
            />
          ))}
          <span className="ml-1 font-mono text-[10px] text-text-faint">
            {done}/{total}
          </span>
        </span>
      </header>

      <div className="p-5">
        {/* Answered nuggets */}
        {answered.length > 0 && (
          <div className="mb-4 flex flex-col gap-2">
            {answered.map((f) =>
              editing === f ? (
                <EditNugget
                  key={f}
                  field={f}
                  initial={problem[f] ?? ""}
                  onDone={async (value) => {
                    await updateField.mutateAsync({
                      id: problem.id,
                      field: f,
                      value: value.trim() || null,
                    });
                    setEditing(null);
                  }}
                />
              ) : (
                <div
                  key={f}
                  className="group rounded-xl border border-line bg-surface-2/50 px-3.5 py-2.5 transition-colors hover:border-line-strong"
                >
                  <div className="flex items-center justify-between">
                    <span className="eyebrow flex items-center gap-1.5">
                      <Check size={10} className="text-success" />
                      {PROMPTS[f].question}
                    </span>
                    <button
                      onClick={() => setEditing(f)}
                      title="Edit answer"
                      className="flex size-6 items-center justify-center rounded-md text-text-faint opacity-0 transition-opacity hover:bg-surface-3 hover:text-text group-hover:opacity-100"
                    >
                      <PencilSimple size={12} />
                    </button>
                  </div>
                  <div className="mt-1.5 max-h-[420px] overflow-y-auto pr-1">
                    <Markdown>{problem[f] ?? ""}</Markdown>
                  </div>
                </div>
              ),
            )}
          </div>
        )}

        {/* Active prompt */}
        <AnimatePresence mode="wait">
          {active ? (
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.16 }}
            >
              <p className="text-sm font-medium">{PROMPTS[active].question}</p>
              <p className="mt-0.5 text-[12px] text-text-faint">
                {PROMPTS[active].hint}
              </p>
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) saveActive();
                }}
                rows={3}
                autoFocus
                placeholder="Write it while it's fresh — markdown works, paste freely…"
                className="mt-3 w-full resize-y rounded-xl border border-line bg-surface-2 p-3.5 text-[13px] leading-relaxed outline-none transition-colors focus:border-accent"
              />
              <div className="mt-2 flex items-center gap-2">
                <button
                  onClick={saveActive}
                  disabled={!draft.trim() || updateField.isPending}
                  className="btn-primary !h-9 !px-3.5 !text-[12px]"
                >
                  Save
                  <CaretRight size={13} />
                </button>
                <button
                  onClick={() => advance(active)}
                  className="h-8 rounded-lg px-2.5 text-[12px] text-text-faint transition-colors hover:bg-surface-2 hover:text-text-dim"
                >
                  Skip for now
                </button>
                <span className="ml-auto font-mono text-[10px] text-text-faint">
                  Ctrl ↵ to save
                </span>
              </div>
            </motion.div>
          ) : done === total ? (
            <motion.p
              key="done"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2 text-[13px] text-text-dim"
            >
              <Check size={14} className="text-success" />
              Debrief complete — future-you says thanks.
            </motion.p>
          ) : (
            <motion.button
              key="resume"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={() => setActive(unanswered[0] ?? null)}
              className="text-[13px] text-accent hover:underline"
            >
              {unanswered.length} prompt{unanswered.length === 1 ? "" : "s"}{" "}
              skipped — pick up where you left off
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

function EditNugget({
  field,
  initial,
  onDone,
}: {
  field: DebriefField;
  initial: string;
  onDone: (value: string) => void;
}) {
  const [value, setValue] = useState(initial);
  return (
    <div className="rounded-lg border border-accent/40 bg-surface-2/50 px-3 py-2">
      <span className="eyebrow">{PROMPTS[field].question}</span>
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        autoFocus
        rows={3}
        onBlur={() => onDone(value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) onDone(value);
        }}
        className="mt-1 w-full resize-y rounded-md bg-transparent text-[13px] leading-relaxed outline-none"
      />
    </div>
  );
}
