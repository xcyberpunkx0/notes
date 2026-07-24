import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Theme = "dark" | "light";

export interface TabInfo {
  id: string;
  path: string;
}

interface UiState {
  sidebarCollapsed: boolean;
  paletteOpen: boolean;
  quickLogOpen: boolean;
  mdImportOpen: boolean;
  fontDialogOpen: boolean;
  appFont: string;
  updateVersion: string | null;
  tabs: TabInfo[];
  activeTabId: string;
  splitPath: string | null;
  splitEpoch: number;
  theme: Theme;
  toggleSidebar: () => void;
  setPaletteOpen: (open: boolean) => void;
  setQuickLogOpen: (open: boolean) => void;
  setMdImportOpen: (open: boolean) => void;
  setFontDialogOpen: (open: boolean) => void;
  setAppFont: (key: string) => void;
  setUpdateVersion: (v: string | null) => void;
  openTab: (path: string) => void;
  closeTab: (id: string) => void;
  activateTab: (id: string) => void;
  setActiveTabPath: (path: string) => void;
  openSplit: (path: string) => void;
  closeSplit: () => void;
  toggleTheme: () => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      paletteOpen: false,
      quickLogOpen: false,
      mdImportOpen: false,
      fontDialogOpen: false,
      appFont: "instrument",
      updateVersion: null,
      tabs: [{ id: "tab-1", path: "/" }],
      activeTabId: "tab-1",
      splitPath: null,
      splitEpoch: 0,
      theme: "dark",
      toggleSidebar: () =>
        set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setPaletteOpen: (open) => set({ paletteOpen: open }),
      setQuickLogOpen: (open) => set({ quickLogOpen: open }),
      setMdImportOpen: (open) => set({ mdImportOpen: open }),
      setFontDialogOpen: (open) => set({ fontDialogOpen: open }),
      setAppFont: (key) => set({ appFont: key }),
      setUpdateVersion: (v) => set({ updateVersion: v }),
      openTab: (path) => {
        const id = `tab-${crypto.randomUUID().slice(0, 8)}`;
        set((s) => ({ tabs: [...s.tabs, { id, path }], activeTabId: id }));
      },
      closeTab: (id) =>
        set((s) => {
          if (s.tabs.length <= 1) return s;
          const idx = s.tabs.findIndex((t) => t.id === id);
          const tabs = s.tabs.filter((t) => t.id !== id);
          const activeTabId =
            s.activeTabId === id
              ? tabs[Math.max(0, idx - 1)].id
              : s.activeTabId;
          return { tabs, activeTabId };
        }),
      activateTab: (id) => set({ activeTabId: id }),
      setActiveTabPath: (path) =>
        set((s) => ({
          tabs: s.tabs.map((t) =>
            t.id === s.activeTabId ? { ...t, path } : t,
          ),
        })),
      openSplit: (path) =>
        set((s) => ({ splitPath: path, splitEpoch: s.splitEpoch + 1 })),
      closeSplit: () => set({ splitPath: null }),
      toggleTheme: () =>
        set((s) => ({ theme: s.theme === "dark" ? "light" : "dark" })),
    }),
    {
      name: "dsa-vault-ui",
      partialize: (s) => ({
        sidebarCollapsed: s.sidebarCollapsed,
        theme: s.theme,
        appFont: s.appFont,
        tabs: s.tabs,
        activeTabId: s.activeTabId,
      }),
    },
  ),
);
