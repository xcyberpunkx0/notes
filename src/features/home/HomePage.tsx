import { useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { getDb } from "@/db/client";
import { useDueCount, useStreak } from "@/db/reviews";
import { useRecentProblems } from "@/db/problems";
import { greeting } from "@/lib/greeting";
import { GemMark } from "@/assets/brand/GemMark";
import { PageShell } from "@/components/page/PageShell";
import { Callout } from "@/components/page/Callout";
import { PropertyChips } from "@/components/page/PropertyChips";
import { ListRow } from "@/components/page/ListRow";

interface RecentNote {
  id: number;
  title: string;
  updated_at: string;
  topic_id: number | null;
  topic_name: string | null;
  topic_icon: string | null;
}

function useHomeData() {
  return useQuery({
    queryKey: ["home"],
    queryFn: async () => {
      const db = await getDb();
      const [recentNotes, counts] = await Promise.all([
        db.select<RecentNote[]>(
          `SELECT n.id, n.title, n.updated_at, t.id AS topic_id, t.name AS topic_name, t.icon AS topic_icon
           FROM notes n LEFT JOIN topics t ON t.id = n.topic_id
           ORDER BY n.updated_at DESC LIMIT 5`,
        ),
        db.select<{ notes: number; problems: number; topics: number }[]>(
          `SELECT (SELECT COUNT(*) FROM notes) AS notes,
                  (SELECT COUNT(*) FROM problems) AS problems,
                  (SELECT COUNT(*) FROM topics) AS topics`,
        ),
      ]);
      return { recentNotes, counts: counts[0] };
    },
  });
}

/**
 * Gem-family line icons — copied verbatim (path data + stroke props) from
 * the calm-shell mockup's `.callout svg` / `.prop .k svg` sets so the home
 * page matches the design authority pixel-for-pixel. Kept local: nothing
 * outside this page uses them.
 */
type IconProps = { className?: string };

function IconReview({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" className={className}>
      <path d="M18.5 9 A7 7 0 1 0 19 13.5 M19 5.5 L19 9 L15.5 9" />
    </svg>
  );
}

function IconTopics({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinejoin="round" className={className}>
      <path d="M6 5 L12 5 L14.5 8.5 L9 14 L3.5 8.5 Z" />
    </svg>
  );
}

function IconNotes({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className}>
      <path d="M5 4 L15 4 L19 8 L19 20 L5 20 Z" />
    </svg>
  );
}

function IconSolved({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className}>
      <circle cx="12" cy="12" r="8" />
    </svg>
  );
}

function IconStreak({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" className={className}>
      <path d="M12 4 C15 7.5 17.5 9.5 17.5 13 A5.5 5.5 0 0 1 6.5 13 C6.5 9.5 9 7.5 12 4 Z" />
    </svg>
  );
}

function longDate(now: Date = new Date()): string {
  return now.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export function HomePage() {
  const navigate = useNavigate();
  const { data } = useHomeData();
  const { data: dueCount } = useDueCount();
  const { data: recentProblems } = useRecentProblems(5);
  const streak = useStreak();

  const due = dueCount ?? 0;

  const recentTopics = (data?.recentNotes ?? [])
    .filter((n): n is RecentNote & { topic_id: number } => n.topic_id != null)
    .filter((n, i, arr) => arr.findIndex((x) => x.topic_id === n.topic_id) === i)
    .slice(0, 3);

  return (
    <div className="h-full overflow-y-auto">
      <PageShell
        icon={<GemMark className="size-[60px]" />}
        title={greeting()}
        subtitle={longDate()}
      >
        <div
          onClick={due > 0 ? () => navigate("/review") : undefined}
          className={due > 0 ? "cursor-pointer" : undefined}
        >
          <Callout
            icon={<IconReview className="size-full text-accent" />}
            title={due > 0 ? `${due} to review — keep them warm` : "Nothing due. You're clear."}
            body={
              due > 0
                ? "A few minutes now beats an hour of re-learning later."
                : "New notes and problems join the queue a day after you add them."
            }
          />
        </div>

        <PropertyChips
          items={[
            { icon: <IconTopics className="size-full" />, label: "Topics", value: data?.counts.topics ?? 0 },
            { icon: <IconNotes className="size-full" />, label: "Notes", value: data?.counts.notes ?? 0 },
            { icon: <IconSolved className="size-full" />, label: "Solved", value: data?.counts.problems ?? 0 },
            { icon: <IconStreak className="size-full" />, label: "Streak", value: streak },
          ]}
        />

        <div className="flex items-center justify-between mt-6.5 mb-1.5">
          <h2 className="text-[15px] font-semibold m-0">Recently solved</h2>
          <button
            onClick={() => navigate("/problems")}
            className="text-text-faint text-[12.5px] hover:text-text-dim transition-colors"
          >
            See all →
          </button>
        </div>
        <div>
          {recentProblems && recentProblems.length > 0 ? (
            recentProblems.map((p) => (
              <ListRow
                key={p.id}
                tag={p.difficulty ?? undefined}
                onClick={() => navigate(`/problems/${p.id}`)}
              >
                {p.title}
              </ListRow>
            ))
          ) : (
            <div className="text-text-faint text-[13.5px] py-2 px-1.5">
              Every solve, remembered. Log one right after you solve it —{" "}
              <kbd className="font-mono text-[11px] bg-surface-2 text-text-dim rounded px-1.5 py-0.5">
                Ctrl Shift P
              </kbd>{" "}
              from anywhere.
            </div>
          )}
        </div>

        {recentTopics.length > 0 && (
          <>
            <div className="flex items-center justify-between mt-6.5 mb-1.5">
              <h2 className="text-[15px] font-semibold m-0">
                Pick up where you left off
              </h2>
            </div>
            <div>
              {recentTopics.map((n) => (
                <ListRow
                  key={n.topic_id}
                  glyph="◆"
                  tag="topic"
                  onClick={() => navigate(`/topics/${n.topic_id}`)}
                >
                  {n.topic_name}
                </ListRow>
              ))}
            </div>
          </>
        )}
      </PageShell>
    </div>
  );
}
