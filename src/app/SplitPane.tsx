import { useMemo } from "react";
import {
  createMemoryRouter,
  Outlet,
  RouterProvider,
  useNavigate,
} from "react-router";
import { CaretLeft, X } from "@phosphor-icons/react";
import { childRoutes } from "./router";
import { RouterIsolation } from "./router-isolation";
import { useUiStore } from "./store";

function PaneFrame() {
  const navigate = useNavigate();
  const closeSplit = useUiStore((s) => s.closeSplit);
  return (
    <div className="flex h-full flex-col bg-bg">
      <div className="flex h-10 shrink-0 items-center justify-between border-b border-line px-2">
        <div className="flex items-center gap-1">
          <button
            onClick={() => navigate(-1)}
            title="Back"
            className="flex size-7 items-center justify-center rounded-lg text-text-faint transition-colors hover:bg-surface-2 hover:text-text"
          >
            <CaretLeft size={14} />
          </button>
          <span className="eyebrow">Split view</span>
        </div>
        <button
          onClick={closeSplit}
          title="Close split (Ctrl+\)"
          className="flex size-7 items-center justify-center rounded-lg text-text-faint transition-colors hover:bg-surface-2 hover:text-text"
        >
          <X size={14} />
        </button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <Outlet />
      </div>
    </div>
  );
}

/**
 * A second, independent navigation surface. Memory router keeps its own
 * history; links and @-mentions inside it navigate within the pane.
 */
export function SplitPane() {
  const splitPath = useUiStore((s) => s.splitPath);
  const splitEpoch = useUiStore((s) => s.splitEpoch);

  const paneRouter = useMemo(
    () =>
      createMemoryRouter(
        [{ path: "/", element: <PaneFrame />, children: childRoutes }],
        { initialEntries: [splitPath ?? "/"] },
      ),
    // Recreate only when a new split is opened, not on internal navigation
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [splitEpoch],
  );

  if (!splitPath) return null;
  return (
    <RouterIsolation>
      <RouterProvider router={paneRouter} />
    </RouterIsolation>
  );
}
