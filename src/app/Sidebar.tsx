import { NavLink } from "react-router";
import { motion } from "motion/react";
import {
  Brain,
  House,
  Library,
  ListChecks,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  SunMedium,
} from "lucide-react";
import { useUiStore } from "./store";
import { useDueCount } from "@/db/reviews";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { to: "/", label: "Home", icon: House, end: true },
  { to: "/review", label: "Review", icon: Brain, end: false },
  { to: "/topics", label: "Topics", icon: Library, end: false },
  { to: "/problems", label: "Problems", icon: ListChecks, end: false },
];

export function Sidebar() {
  const collapsed = useUiStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);
  const theme = useUiStore((s) => s.theme);
  const toggleTheme = useUiStore((s) => s.toggleTheme);
  const { data: dueCount } = useDueCount();

  return (
    <motion.aside
      animate={{ width: collapsed ? 60 : 224 }}
      transition={{ type: "spring", stiffness: 420, damping: 40 }}
      className="flex shrink-0 flex-col border-r border-line bg-surface"
    >
      {/* Brand */}
      <div
        className={cn(
          "flex h-13 items-center gap-2.5 px-4",
          collapsed && "justify-center px-0",
        )}
      >
        <div className="flex size-6 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-accent to-accent-2">
          <span className="text-[13px] font-bold leading-none text-white">
            ◇
          </span>
        </div>
        {!collapsed && (
          <span className="truncate text-sm font-semibold tracking-tight">
            DSA Vault
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className={cn("flex flex-col gap-0.5 px-2.5 pt-2", collapsed && "px-2")}>
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            title={collapsed ? label : undefined}
            className="relative rounded-lg outline-offset-0"
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.span
                    layoutId="nav-active"
                    className="absolute inset-0 rounded-lg bg-accent-soft"
                    transition={{ type: "spring", stiffness: 500, damping: 42 }}
                  />
                )}
                <span
                  className={cn(
                    "relative flex h-9 items-center gap-2.5 rounded-lg px-2.5 text-[13px] font-medium transition-colors duration-150",
                    collapsed && "justify-center px-0",
                    isActive
                      ? "text-text"
                      : "text-text-dim hover:bg-surface-2 hover:text-text",
                  )}
                >
                  <Icon
                    size={16}
                    strokeWidth={2}
                    className={cn("shrink-0", isActive && "text-accent")}
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
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="flex-1" />

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
          className="flex size-8 items-center justify-center rounded-lg text-text-faint transition-colors duration-150 hover:bg-surface-2 hover:text-text"
        >
          {collapsed ? <PanelLeftOpen size={15} /> : <PanelLeftClose size={15} />}
        </button>
        <button
          onClick={toggleTheme}
          title="Switch theme"
          className="flex size-8 items-center justify-center rounded-lg text-text-faint transition-colors duration-150 hover:bg-surface-2 hover:text-text"
        >
          {theme === "dark" ? <SunMedium size={15} /> : <Moon size={15} />}
        </button>
        {!collapsed && (
          <span className="ml-auto flex items-center gap-1">
            <span className="kbd">Ctrl</span>
            <span className="kbd">K</span>
          </span>
        )}
      </div>
    </motion.aside>
  );
}
