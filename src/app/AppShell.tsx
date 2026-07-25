import { useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router";
import { listen } from "@tauri-apps/api/event";
import { Sidebar } from "./Sidebar";
import { TitleBar } from "./TitleBar";
import { TabBar } from "./TabBar";
import { SplitPane } from "./SplitPane";
import { SplitPaneBoundary } from "./SplitPaneBoundary";
import { CommandPalette } from "@/features/palette/CommandPalette";
import { QuickLogDialog } from "@/features/problems/QuickLogDialog";
import { FontDialog } from "@/components/FontDialog";
import { ImportMarkdownDialog } from "@/features/notes/ImportMarkdownDialog";
import { useUiStore } from "./store";
import { getDb } from "@/db/client";
import { fontFamilyFor } from "@/lib/fonts";
import { checkForUpdate } from "@/lib/updater";

export function AppShell() {
  const theme = useUiStore((s) => s.theme);
  const setPaletteOpen = useUiStore((s) => s.setPaletteOpen);
  const setQuickLogOpen = useUiStore((s) => s.setQuickLogOpen);
  const quickLogOpen = useUiStore((s) => s.quickLogOpen);
  const location = useLocation();
  const navigate = useNavigate();

  const appFont = useUiStore((s) => s.appFont);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--font-sans",
      fontFamilyFor(appFont),
    );
  }, [appFont]);

  // Open the connection early so migrations run before any screen queries.
  useEffect(() => {
    getDb().catch((err) => console.error("Database failed to open:", err));
  }, []);

  // Quietly look for a newer signed release once per launch
  const setUpdateVersion = useUiStore((s) => s.setUpdateVersion);
  useEffect(() => {
    checkForUpdate().then((v) => v && setUpdateVersion(v));
  }, [setUpdateVersion]);

  // OS-level quick capture (tray / global shortcut) lands here
  useEffect(() => {
    const unlisten = listen("quick-capture", () => setQuickLogOpen(true));
    return () => {
      unlisten.then((f) => f());
    };
  }, [setQuickLogOpen]);

  // Tabs: keep the active tab in sync with navigation, restore on boot
  const setActiveTabPath = useUiStore((s) => s.setActiveTabPath);
  const tabs = useUiStore((s) => s.tabs);
  const splitPath = useUiStore((s) => s.splitPath);
  useEffect(() => {
    setActiveTabPath(location.pathname + location.search);
  }, [location, setActiveTabPath]);
  useEffect(() => {
    const active = useUiStore
      .getState()
      .tabs.find((t) => t.id === useUiStore.getState().activeTabId);
    if (active && active.path !== "/") navigate(active.path);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const mod = e.ctrlKey || e.metaKey;
      const state = useUiStore.getState();
      if (mod && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen(!state.paletteOpen);
      } else if (mod && e.shiftKey && e.key.toLowerCase() === "p") {
        e.preventDefault();
        setQuickLogOpen(true);
      } else if (mod && e.shiftKey && e.key.toLowerCase() === "r") {
        e.preventDefault();
        navigate("/review");
      } else if (mod && e.key.toLowerCase() === "t") {
        e.preventDefault();
        state.openTab("/");
        navigate("/");
      } else if (mod && e.key.toLowerCase() === "w") {
        e.preventDefault();
        state.closeTab(state.activeTabId);
        const next = useUiStore
          .getState()
          .tabs.find((t) => t.id === useUiStore.getState().activeTabId);
        if (next) navigate(next.path);
      } else if (mod && e.key === "\\") {
        e.preventDefault();
        if (state.splitPath) state.closeSplit();
        else state.openSplit(window.location.pathname);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [setPaletteOpen, setQuickLogOpen, navigate]);

  return (
    <div className="flex h-full flex-col">
      <TitleBar />
      <div className="flex min-h-0 flex-1">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          {tabs.length > 1 && <TabBar />}
          <div className="flex min-h-0 flex-1">
            <main className="relative min-w-0 flex-1 overflow-y-auto">
              <div key={location.pathname} className="page-enter h-full">
                <Outlet />
              </div>
            </main>
            {splitPath && (
              <>
                <div className="w-px shrink-0 bg-line" />
                <div className="min-w-0 flex-1">
                  <SplitPaneBoundary>
                    <SplitPane />
                  </SplitPaneBoundary>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      <CommandPalette />
      <QuickLogDialog open={quickLogOpen} onOpenChange={setQuickLogOpen} />
      <FontDialog />
      <ImportMarkdownDialog />
    </div>
  );
}
