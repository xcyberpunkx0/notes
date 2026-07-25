import { NavLink, useLocation } from "react-router";
import {
  Barbell,
  Brain,
  House,
  Books,
  DownloadSimple,
  Graph,
  Target,
  MoonStars,
  SidebarSimple,
  Sun,
  TextAa,
} from "@phosphor-icons/react";
import { useUiStore } from "./store";
import { useDueCount } from "@/db/reviews";
import { installPendingUpdate } from "@/lib/updater";
import { cn } from "@/lib/utils";
import { GemMark } from "@/assets/brand/GemMark";

const NAV_ITEMS = [
  { to: "/", label: "Home", icon: House, end: true },
  { to: "/review", label: "Review", icon: Brain, end: false },
  { to: "/topics", label: "Topics", icon: Books, end: false },
  { to: "/problems", label: "Problems", icon: Target, end: false },
  { to: "/resolve", label: "Re-solve", icon: Barbell, end: false },
  { to: "/graph", label: "Graph", icon: Graph, end: false },
];

export function Sidebar() {
  const collapsed = useUiStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);
  const theme = useUiStore((s) => s.theme);
  const toggleTheme = useUiStore((s) => s.toggleTheme);
  const setFontDialogOpen = useUiStore((s) => s.setFontDialogOpen);
  const updateVersion = useUiStore((s) => s.updateVersion);
  const { data: dueCount } = useDueCount();
  const { pathname } = useLocation();

  const activeIndex =
    pathname === "/"
      ? 0
      : pathname.startsWith("/review")
        ? 1
        : pathname.startsWith("/topics") || pathname.startsWith("/notes")
          ? 2
          : pathname.startsWith("/problems")
            ? 3
            : pathname.startsWith("/resolve")
              ? 4
              : pathname.startsWith("/graph")
                ? 5
                : -1;

  return (
    <aside
      style={{ width: collapsed ? 60 : 224 }}
      className="flex shrink-0 flex-col overflow-hidden border-r border-line bg-surface transition-[width] duration-200 ease-out"
    >
      {/* Brand */}
      <div
        className={cn(
          "flex h-13 items-center gap-2.5 px-4",
          collapsed && "justify-center px-0",
        )}
      >
        <GemMark className="size-4 shrink-0" />
        {!collapsed && (
          <span className="truncate text-gradient font-(family-name:--font-display) text-[15px] font-bold lowercase tracking-tight">
            trove
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav
        className={cn(
          "relative flex flex-col gap-0.5 px-2.5 pt-2",
          collapsed && "px-2",
        )}
      >
        {/* Active pill — CSS transform slide, no layout measurement */}
        {activeIndex >= 0 && (
          <span
            aria-hidden
            className={cn(
              "absolute left-2.5 right-2.5 top-2 h-9 rounded-xl bg-accent-soft transition-transform duration-200 ease-out",
              collapsed && "left-2 right-2",
            )}
            style={{ transform: `translateY(${activeIndex * 38}px)` }}
          />
        )}
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }, idx) => {
          const active = idx === activeIndex;
          return (
            <NavLink
              key={to}
              to={to}
              end={end}
              title={collapsed ? label : undefined}
              className="relative rounded-xl outline-offset-0"
            >
              <span
                className={cn(
                  "relative flex h-9 items-center gap-2.5 rounded-xl px-2.5 text-[13px] font-medium transition-colors duration-150",
                  collapsed && "justify-center px-0",
                  active
                    ? "text-text"
                    : "text-text-dim hover:bg-surface-2 hover:text-text",
                )}
              >
                <Icon
                  size={17}
                  weight={active ? "fill" : "duotone"}
                  className={cn("shrink-0", active && "text-accent")}
                />
                {!collapsed && label}
                {!collapsed &&
                  to === "/review" &&
                  dueCount != null &&
                  dueCount > 0 && (
                    <span className="ml-auto rounded-md bg-accent-soft px-1.5 py-0.5 font-mono text-[10px] font-semibold text-accent">
                      {dueCount}
                    </span>
                  )}
              </span>
            </NavLink>
          );
        })}
      </nav>

      <div className="flex-1" />

      {/* Update banner */}
      {updateVersion && (
        <button
          onClick={() => installPendingUpdate()}
          title={`Update to v${updateVersion} and restart`}
          className={cn(
            "mx-2.5 mb-2 flex items-center gap-2 rounded-xl bg-accent-soft px-3 py-2 text-[12px] font-medium text-accent transition-all hover:brightness-110",
            collapsed && "mx-2 justify-center px-0",
          )}
        >
          <DownloadSimple size={15} className="shrink-0" />
          {!collapsed && `Update to v${updateVersion}`}
        </button>
      )}

      {/* Footer controls */}
      <div
        className={cn(
          "flex items-center gap-1 border-t border-line p-2.5",
          collapsed && "flex-col",
        )}
      >
        <button
          onClick={toggleSidebar}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="flex size-8 items-center justify-center rounded-xl text-text-faint transition-colors duration-150 hover:bg-surface-2 hover:text-text"
        >
          <SidebarSimple size={16} />
        </button>
        <button
          onClick={toggleTheme}
          title="Switch theme"
          className="flex size-8 items-center justify-center rounded-xl text-text-faint transition-colors duration-150 hover:bg-surface-2 hover:text-text"
        >
          {theme === "dark" ? <Sun size={16} /> : <MoonStars size={16} />}
        </button>
        <button
          onClick={() => setFontDialogOpen(true)}
          title="Change font"
          className="flex size-8 items-center justify-center rounded-xl text-text-faint transition-colors duration-150 hover:bg-surface-2 hover:text-text"
        >
          <TextAa size={16} />
        </button>
        {!collapsed && (
          <span className="ml-auto flex items-center gap-1">
            <span className="kbd">Ctrl</span>
            <span className="kbd">K</span>
          </span>
        )}
      </div>
    </aside>
  );
}
