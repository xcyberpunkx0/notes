import type { ActivityDay } from "@/db/reviews";

const WEEKS = 17;
const MS_DAY = 86_400_000;
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function cellColor(count: number): string {
  if (count <= 0) return "var(--surface-2)";
  const pct = count >= 6 ? 100 : count >= 4 ? 75 : count >= 2 ? 50 : 28;
  return `color-mix(in srgb, var(--accent) ${pct}%, var(--surface-2))`;
}

export function Heatmap({ activity }: { activity: ActivityDay[] }) {
  const counts = new Map<string, number>();
  for (const a of activity) {
    counts.set(a.date, a.notes_created + a.problems_logged + a.reviews_done);
  }

  // Activity rows are keyed by UTC date; stay in UTC so cells line up
  const now = new Date();
  const today = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
  // First cell = Sunday of the week WEEKS-1 weeks ago
  const start = new Date(
    today.getTime() - (today.getUTCDay() + (WEEKS - 1) * 7) * MS_DAY,
  );

  const weeks: { label: string | null; days: (Date | null)[] }[] = [];
  let lastMonth = -1;
  for (let w = 0; w < WEEKS; w++) {
    const days: (Date | null)[] = [];
    let label: string | null = null;
    for (let d = 0; d < 7; d++) {
      const date = new Date(start.getTime() + (w * 7 + d) * MS_DAY);
      if (date.getTime() > today.getTime()) {
        days.push(null);
        continue;
      }
      if (date.getUTCMonth() !== lastMonth) {
        lastMonth = date.getUTCMonth();
        if (w > 0 || d === 0) label = MONTHS[lastMonth];
      }
      days.push(date);
    }
    weeks.push({ label, days });
  }

  const total = [...counts.entries()]
    .filter(([date]) => new Date(date + "T00:00:00") >= start)
    .reduce((sum, [, n]) => sum + n, 0);

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <p className="eyebrow">Activity</p>
        <span className="font-mono text-[10px] text-text-faint">
          {total} in the last {WEEKS} weeks
        </span>
      </div>
      <div className="card overflow-x-auto p-4">
        <div className="flex gap-[3px]">
          {weeks.map((week, w) => (
            <div key={w} className="flex flex-col gap-[3px]">
              <span className="h-3 font-mono text-[8px] leading-3 text-text-faint">
                {week.label ?? ""}
              </span>
              {week.days.map((date, d) =>
                date === null ? (
                  <span key={d} className="size-3" />
                ) : (
                  <span
                    key={d}
                    title={`${counts.get(date.toISOString().slice(0, 10)) ?? 0} activities · ${MONTHS[date.getUTCMonth()]} ${date.getUTCDate()}`}
                    className="size-3 rounded-[3px]"
                    style={{
                      background: cellColor(
                        counts.get(date.toISOString().slice(0, 10)) ?? 0,
                      ),
                    }}
                  />
                ),
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
