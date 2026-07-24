import { useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router";
import { AnimatePresence, motion } from "motion/react";
import { listen } from "@tauri-apps/api/event";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { CommandPalette } from "@/features/palette/CommandPalette";
import { QuickLogDialog } from "@/features/problems/QuickLogDialog";
import { useUiStore } from "./store";
import { getDb } from "@/db/client";

export function AppShell() {
  const theme = useUiStore((s) => s.theme);
  const setPaletteOpen = useUiStore((s) => s.setPaletteOpen);
  const setQuickLogOpen = useUiStore((s) => s.setQuickLogOpen);
  const quickLogOpen = useUiStore((s) => s.quickLogOpen);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  // Open the connection early so migrations run before any screen queries.
  useEffect(() => {
    getDb().catch((err) => console.error("Database failed to open:", err));
  }, []);

  // OS-level quick capture (tray / global shortcut) lands here
  useEffect(() => {
    const unlisten = listen("quick-capture", () => setQuickLogOpen(true));
    return () => {
      unlisten.then((f) => f());
    };
  }, [setQuickLogOpen]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const mod = e.ctrlKey || e.metaKey;
      if (mod && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen(!useUiStore.getState().paletteOpen);
      } else if (mod && e.shiftKey && e.key.toLowerCase() === "p") {
        e.preventDefault();
        setQuickLogOpen(true);
      } else if (mod && e.shiftKey && e.key.toLowerCase() === "r") {
        e.preventDefault();
        navigate("/review");
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [setPaletteOpen, setQuickLogOpen, navigate]);

  return (
    <div className="flex h-full">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="relative flex-1 overflow-y-auto">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={location.pathname}
              className="h-full"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.18, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
      <CommandPalette />
      <QuickLogDialog open={quickLogOpen} onOpenChange={setQuickLogOpen} />
    </div>
  );
}
