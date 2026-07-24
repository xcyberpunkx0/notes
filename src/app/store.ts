import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Theme = "dark" | "light";

interface UiState {
  sidebarCollapsed: boolean;
  paletteOpen: boolean;
  quickLogOpen: boolean;
  theme: Theme;
  toggleSidebar: () => void;
  setPaletteOpen: (open: boolean) => void;
  setQuickLogOpen: (open: boolean) => void;
  toggleTheme: () => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      paletteOpen: false,
      quickLogOpen: false,
      theme: "dark",
      toggleSidebar: () =>
        set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setPaletteOpen: (open) => set({ paletteOpen: open }),
      setQuickLogOpen: (open) => set({ quickLogOpen: open }),
      toggleTheme: () =>
        set((s) => ({ theme: s.theme === "dark" ? "light" : "dark" })),
    }),
    {
      name: "dsa-vault-ui",
      partialize: (s) => ({
        sidebarCollapsed: s.sidebarCollapsed,
        theme: s.theme,
      }),
    },
  ),
);
