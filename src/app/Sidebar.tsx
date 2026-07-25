import type { ReactNode } from "react";
import { NavLink, useNavigate } from "react-router";
import { DownloadSimple, SidebarSimple } from "@phosphor-icons/react";
import { useUiStore } from "./store";
import { useDueCount, useStreak } from "@/db/reviews";
import { useTopics } from "@/db/topics";
import { installPendingUpdate } from "@/lib/updater";
import { cn } from "@/lib/utils";
import { GemMark } from "@/assets/brand/GemMark";

/**
 * Gem-family line icons — copied verbatim (path data + stroke props) from
 * the calm-shell mockup's `.row svg` set so the sidebar matches the design
 * authority pixel-for-pixel. Kept local: nothing outside Sidebar uses them.
 */
type IconProps = { className?: string };

function IconSearch({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" className={className}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="M20 20 L16 16" />
    </svg>
  );
}

function IconHome({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M4 11 L12 4 L20 11 M6 9.5 L6 20 L18 20 L18 9.5" />
    </svg>
  );
}

function IconReview({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" className={className}>
      <path d="M18.5 9 A7 7 0 1 0 19 13.5 M19 5.5 L19 9 L15.5 9" />
    </svg>
  );
}

function IconTopics({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinejoin="round" className={className}>
      <path d="M6 5 L12 5 L14.5 8.5 L9 14 L3.5 8.5 Z M12.5 12 L17 12 L19.5 15 L15 20 L10.5 15.5" />
    </svg>
  );
}

function IconProblems({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={className}>
      <circle cx="12" cy="12" r="8" />
      <path d="M8.5 10 L15.5 10 L12 16 Z" />
    </svg>
  );
}

function IconResolve({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" className={className}>
      <path d="M12 4 C15 7.5 17.5 9.5 17.5 13 A5.5 5.5 0 0 1 6.5 13 C6.5 9.5 9 7.5 12 4 Z" />
    </svg>
  );
}

function IconGraph({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={className}>
      <circle cx="6" cy="6" r="2" />
      <circle cx="18" cy="8" r="2" />
      <circle cx="9" cy="18" r="2" />
      <path d="M8 6.5 L16 7.8 M7.8 16.2 L16.5 9.5" />
    </svg>
  );
}

function IconPlus({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" className={className}>
      <path d="M12 5 L12 19 M5 12 L19 12" />
    </svg>
  );
}

function IconStreak({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" className={className}>
      <path d="M12 8 L12 12 L15 15" />
      <circle cx="12" cy="12" r="8.5" />
    </svg>
  );
}

/** `.row svg` from the mockup: 15px, 75% opacity, never shrinks. */
const rowIconClass = "size-[15px] shrink-0 opacity-75";
/** `.row` from the mockup, minus the state-dependent color. */
const rowBase =
  "flex items-center gap-[9px] rounded-md px-2.5 py-[5px] text-[13.5px] transition-colors duration-150 w-full text-left";

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <div className="px-2.5 pb-1 pt-3.5 text-[11px] font-semibold tracking-[0.03em] text-text-faint">
      {children}
    </div>
  );
}

export function Sidebar() {
  const collapsed = useUiStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);
  const workspaceName = useUiStore((s) => s.workspaceName);
  const setPaletteOpen = useUiStore((s) => s.setPaletteOpen);
  const updateVersion = useUiStore((s) => s.updateVersion);
  const { data: dueCount } = useDueCount();
  const { data: topics } = useTopics();
  const streak = useStreak();
  const navigate = useNavigate();

  const topLevelTopics = (topics ?? []).filter((t) => !t.parent_id);

  function navRowClass({ isActive }: { isActive: boolean }) {
    return cn(
      rowBase,
      collapsed && "justify-center px-0",
      isActive
        ? "bg-accent-soft font-medium text-text"
        : "text-text-dim hover:bg-surface-2",
    );
  }

  return (
    <aside
      style={{ width: collapsed ? 60 : 244 }}
      className="flex shrink-0 flex-col overflow-hidden border-r border-line bg-sidebar p-2 transition-[width] duration-200 ease-out"
    >
      {/* Workspace header */}
      <div
        className={cn(
          "flex items-center gap-2 rounded-md px-2.5 py-2 text-[13.5px] font-semibold text-text transition-colors duration-150 hover:bg-surface-2",
          collapsed && "justify-center px-0",
        )}
      >
        <GemMark className="size-[18px] shrink-0" />
        {!collapsed && <span className="truncate">{workspaceName}</span>}
      </div>

      {/* Scrollable nav */}
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
        <button
          type="button"
          onClick={() => setPaletteOpen(true)}
          title={collapsed ? "Search" : undefined}
          className={cn(
            rowBase,
            "text-text-dim hover:bg-surface-2",
            collapsed && "justify-center px-0",
          )}
        >
          <IconSearch className={rowIconClass} />
          {!collapsed && <span className="truncate">Search</span>}
          {!collapsed && (
            <span className="ml-auto font-mono text-[10px] text-text-faint">
              Ctrl K
            </span>
          )}
        </button>

        <NavLink to="/" end title={collapsed ? "Home" : undefined} className={navRowClass}>
          <IconHome className={rowIconClass} />
          {!collapsed && <span className="truncate">Home</span>}
        </NavLink>

        <NavLink to="/review" title={collapsed ? "Review" : undefined} className={navRowClass}>
          <IconReview className={rowIconClass} />
          {!collapsed && <span className="truncate">Review</span>}
          {!collapsed && dueCount != null && (
            <span className="ml-auto rounded-[10px] bg-accent-soft px-[7px] py-px text-[11px] font-semibold text-accent">
              {dueCount}
            </span>
          )}
        </NavLink>

        {!collapsed && <SectionLabel>STUDY</SectionLabel>}

        <NavLink to="/topics" title={collapsed ? "Topics" : undefined} className={navRowClass}>
          <IconTopics className={rowIconClass} />
          {!collapsed && <span className="truncate">Topics</span>}
        </NavLink>
        <NavLink to="/problems" title={collapsed ? "Problems" : undefined} className={navRowClass}>
          <IconProblems className={rowIconClass} />
          {!collapsed && <span className="truncate">Problems</span>}
        </NavLink>
        <NavLink to="/resolve" title={collapsed ? "Re-solve" : undefined} className={navRowClass}>
          <IconResolve className={rowIconClass} />
          {!collapsed && <span className="truncate">Re-solve</span>}
        </NavLink>
        <NavLink to="/graph" title={collapsed ? "Graph" : undefined} className={navRowClass}>
          <IconGraph className={rowIconClass} />
          {!collapsed && <span className="truncate">Graph</span>}
        </NavLink>

        {!collapsed && <SectionLabel>PAGES</SectionLabel>}

        {topLevelTopics.map((topic) => (
          <NavLink
            key={topic.id}
            to={`/topics/${topic.id}`}
            title={collapsed ? topic.name : undefined}
            className={navRowClass}
          >
            <span className="w-4 shrink-0 text-center text-[13px]">◆</span>
            {!collapsed && <span className="truncate">{topic.name}</span>}
          </NavLink>
        ))}

        <button
          type="button"
          onClick={() => navigate("/topics")}
          title={collapsed ? "New topic" : undefined}
          className={cn(
            rowBase,
            "text-text-faint hover:bg-surface-2",
            collapsed && "justify-center px-0",
          )}
        >
          <IconPlus className={rowIconClass} />
          {!collapsed && <span className="truncate">New topic</span>}
        </button>
      </div>

      {/* Update available */}
      {updateVersion &&
        (collapsed ? (
          <button
            type="button"
            onClick={() => installPendingUpdate()}
            title="Update now"
            className="mt-1 flex items-center justify-center rounded-md bg-accent-soft px-0 py-[5px] text-accent transition-colors duration-150 hover:brightness-110"
          >
            <DownloadSimple size={15} className="shrink-0" />
          </button>
        ) : (
          <div className="mt-1 flex items-center gap-[9px] rounded-md bg-accent-soft px-2.5 py-[5px] text-[13.5px] text-accent">
            <DownloadSimple size={15} className="shrink-0 opacity-75" />
            <span className="flex-1 truncate">A new {workspaceName} is ready</span>
            <button
              type="button"
              onClick={() => installPendingUpdate()}
              className="shrink-0 rounded-md bg-accent px-2 py-0.5 text-[11px] font-semibold text-white transition-all hover:brightness-110"
            >
              Update
            </button>
          </div>
        ))}

      {/* Footer */}
      <div
        className={cn(
          "mt-1 flex items-center gap-1 border-t border-line pt-2",
          collapsed && "flex-col",
        )}
      >
        <div className={cn(rowBase, "flex-1 cursor-default text-text-dim", collapsed && "justify-center px-0")}>
          <IconStreak className={rowIconClass} />
          {!collapsed && <span className="truncate">{streak}-day streak</span>}
        </div>
        <button
          type="button"
          onClick={toggleSidebar}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="flex size-7 shrink-0 items-center justify-center rounded-md text-text-faint transition-colors duration-150 hover:bg-surface-2 hover:text-text"
        >
          <SidebarSimple size={15} />
        </button>
      </div>
    </aside>
  );
}
