import { useNavigate } from "react-router";
import { Plus, X } from "@phosphor-icons/react";
import { useUiStore, type TabInfo } from "./store";
import { useTabTitle } from "@/lib/page-title";
import { cn } from "@/lib/utils";

function Tab({ tab, active }: { tab: TabInfo; active: boolean }) {
  const navigate = useNavigate();
  const activateTab = useUiStore((s) => s.activateTab);
  const closeTab = useUiStore((s) => s.closeTab);
  const tabCount = useUiStore((s) => s.tabs.length);
  const title = useTabTitle(tab.path);

  return (
    <div
      role="tab"
      aria-selected={active}
      onClick={() => {
        activateTab(tab.id);
        navigate(tab.path);
      }}
      onAuxClick={(e) => {
        if (e.button === 1 && tabCount > 1) closeTab(tab.id);
      }}
      className={cn(
        "group flex h-7 max-w-44 min-w-0 cursor-default items-center gap-1.5 rounded-lg px-2.5 text-[12px] transition-colors",
        active
          ? "bg-surface-2 font-medium text-text"
          : "text-text-dim hover:bg-surface-2/60 hover:text-text",
      )}
    >
      <span className="truncate">{title}</span>
      {tabCount > 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            closeTab(tab.id);
          }}
          title="Close tab (Ctrl+W)"
          className={cn(
            "flex size-4 shrink-0 items-center justify-center rounded text-text-faint hover:bg-surface-3 hover:text-text",
            !active && "opacity-0 group-hover:opacity-100",
          )}
        >
          <X size={10} weight="regular" />
        </button>
      )}
    </div>
  );
}

export function TabBar() {
  const tabs = useUiStore((s) => s.tabs);
  const activeTabId = useUiStore((s) => s.activeTabId);
  const openTab = useUiStore((s) => s.openTab);
  const navigate = useNavigate();

  return (
    <div className="flex h-10 shrink-0 items-center gap-1 border-b border-line px-2">
      <div className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto">
        {tabs.map((tab) => (
          <Tab key={tab.id} tab={tab} active={tab.id === activeTabId} />
        ))}
      </div>
      <button
        onClick={() => {
          openTab("/");
          navigate("/");
        }}
        title="New tab (Ctrl+T)"
        className="flex size-7 shrink-0 items-center justify-center rounded-lg text-text-faint transition-colors hover:bg-surface-2 hover:text-text"
      >
        <Plus size={14} weight="regular" />
      </button>
    </div>
  );
}
