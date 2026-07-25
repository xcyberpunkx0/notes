import { useLocation, useNavigate } from "react-router";
import {
  CaretLeft,
  CaretRight,
  Minus,
  Square,
  SquareSplitHorizontal,
  X,
} from "@phosphor-icons/react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { useUiStore } from "./store";
import { useTabTitle } from "@/lib/page-title";
import { cn } from "@/lib/utils";

/** Window-control actions no-op quietly outside a real Tauri window (e.g. `vite dev` in a browser). */
function winAction(fn: () => unknown) {
  try {
    const result = fn();
    if (result instanceof Promise) result.catch(() => {});
  } catch {
    // not running under Tauri
  }
}

/**
 * Custom frameless-window titlebar: workspace/page breadcrumb, a drag
 * region for the OS window, the split-view toggle, and minimize/maximize/
 * close controls. Topmost, full-width row — sits above the sidebar.
 */
export function TitleBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const workspaceName = useUiStore((s) => s.workspaceName);
  const splitPath = useUiStore((s) => s.splitPath);
  const openSplit = useUiStore((s) => s.openSplit);
  const closeSplit = useUiStore((s) => s.closeSplit);
  const pageTitle = useTabTitle(location.pathname + location.search);

  return (
    <div
      data-tauri-drag-region
      className="flex h-11 shrink-0 select-none items-center gap-0.5 border-b border-line pl-1.5"
    >
      <button
        onClick={() => navigate(-1)}
        title="Go back"
        className="flex size-7 shrink-0 items-center justify-center rounded-lg text-text-faint transition-colors duration-150 hover:bg-surface-2 hover:text-text"
      >
        <CaretLeft size={14} />
      </button>
      <button
        onClick={() => navigate(1)}
        title="Go forward"
        className="flex size-7 shrink-0 items-center justify-center rounded-lg text-text-faint transition-colors duration-150 hover:bg-surface-2 hover:text-text"
      >
        <CaretRight size={14} />
      </button>

      <div
        data-tauri-drag-region
        className="flex min-w-0 flex-1 items-center truncate px-2 text-[13px] text-text-dim"
      >
        <span data-tauri-drag-region className="truncate">
          {workspaceName} / <b className="font-medium text-text">{pageTitle}</b>
        </span>
      </div>

      <button
        onClick={() =>
          splitPath ? closeSplit() : openSplit(location.pathname)
        }
        title={
          splitPath
            ? "Close split view (Ctrl+\\)"
            : "Open this page in split view (Ctrl+\\)"
        }
        className={cn(
          "flex size-7 shrink-0 items-center justify-center rounded-lg transition-colors duration-150",
          splitPath
            ? "bg-accent-soft text-accent"
            : "text-text-faint hover:bg-surface-2 hover:text-text",
        )}
      >
        <SquareSplitHorizontal size={15} />
      </button>

      <div className="ml-1 flex h-full shrink-0 items-center">
        <button
          onClick={() => winAction(() => getCurrentWindow().minimize())}
          title="Minimize"
          className="flex size-9 items-center justify-center text-text-faint transition-colors duration-150 hover:bg-surface-2 hover:text-text"
        >
          <Minus size={14} />
        </button>
        <button
          onClick={() => winAction(() => getCurrentWindow().toggleMaximize())}
          title="Maximize"
          className="flex size-9 items-center justify-center text-text-faint transition-colors duration-150 hover:bg-surface-2 hover:text-text"
        >
          <Square size={12} />
        </button>
        <button
          onClick={() => winAction(() => getCurrentWindow().close())}
          title="Close"
          className="flex size-9 items-center justify-center text-text-faint transition-colors duration-150 hover:bg-[#e5484d] hover:text-white"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
