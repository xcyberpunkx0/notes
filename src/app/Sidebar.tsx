import type { ReactNode } from "react";
import { NavLink, useNavigate } from "react-router";
import {
  Barbell,
  Books,
  Brain,
  DownloadSimple,
  Flame,
  Graph,
  House,
  MagnifyingGlass,
  Plus,
  Target,
  MoonStars,
  SidebarSimple,
  Sun,
  TextAa,
} from "@phosphor-icons/react";
import { useUiStore } from "./store";
import { useDueCount, useStreak } from "@/db/reviews";
import { useTopics } from "@/db/topics";
import { installPendingUpdate } from "@/lib/updater";
import { cn } from "@/lib/utils";
import { GemMark } from "@/assets/brand/GemMark";

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
  const theme = useUiStore((s) => s.theme);
  const toggleTheme = useUiStore((s) => s.toggleTheme);
  const setFontDialogOpen = useUiStore((s) => s.setFontDialogOpen);
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
          <MagnifyingGlass size={15} className="shrink-0 opacity-75" />
          {!collapsed && <span className="truncate">Search</span>}
          {!collapsed && (
            <span className="ml-auto font-mono text-[10px] text-text-faint">
              Ctrl K
            </span>
          )}
        </button>

        <NavLink to="/" end title={collapsed ? "Home" : undefined} className={navRowClass}>
          <House size={15} className="shrink-0 opacity-75" />
          {!collapsed && <span className="truncate">Home</span>}
        </NavLink>

        <NavLink to="/review" title={collapsed ? "Review" : undefined} className={navRowClass}>
          <Brain size={15} className="shrink-0 opacity-75" />
          {!collapsed && <span className="truncate">Review</span>}
          {!collapsed && dueCount != null && (
            <span className="ml-auto rounded-[10px] bg-accent-soft px-[7px] py-px text-[11px] font-semibold text-accent">
              {dueCount}
            </span>
          )}
        </NavLink>

        {!collapsed && <SectionLabel>STUDY</SectionLabel>}

        <NavLink to="/topics" end title={collapsed ? "Topics" : undefined} className={navRowClass}>
          <Books size={15} className="shrink-0 opacity-75" />
          {!collapsed && <span className="truncate">Topics</span>}
        </NavLink>
        <NavLink to="/problems" title={collapsed ? "Problems" : undefined} className={navRowClass}>
          <Target size={15} className="shrink-0 opacity-75" />
          {!collapsed && <span className="truncate">Problems</span>}
        </NavLink>
        <NavLink to="/resolve" title={collapsed ? "Re-solve" : undefined} className={navRowClass}>
          <Barbell size={15} className="shrink-0 opacity-75" />
          {!collapsed && <span className="truncate">Re-solve</span>}
        </NavLink>
        <NavLink to="/graph" title={collapsed ? "Graph" : undefined} className={navRowClass}>
          <Graph size={15} className="shrink-0 opacity-75" />
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
          <Plus size={15} weight="regular" className="shrink-0 opacity-75" />
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
          <Flame size={15} className="shrink-0 opacity-75" />
          {!collapsed && <span className="truncate">{streak}-day streak</span>}
        </div>
        <button
          type="button"
          onClick={toggleTheme}
          title="Switch theme"
          className="flex size-7 shrink-0 items-center justify-center rounded-md text-text-faint transition-colors duration-150 hover:bg-surface-2 hover:text-text"
        >
          {theme === "dark" ? <Sun size={15} /> : <MoonStars size={15} />}
        </button>
        <button
          type="button"
          onClick={() => setFontDialogOpen(true)}
          title="Change font"
          className="flex size-7 shrink-0 items-center justify-center rounded-md text-text-faint transition-colors duration-150 hover:bg-surface-2 hover:text-text"
        >
          <TextAa size={15} />
        </button>
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
