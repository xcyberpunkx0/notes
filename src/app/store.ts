import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Theme = "dark" | "light";

interface UiState {
  sidebarCollapsed: boolean;
  paletteOpen: boolean;
  quickLogOpen: boolean;
  mdImportOpen: boolean;
  fontDialogOpen: boolean;
  appFont: string;
  theme: Theme;
  toggleSidebar: () => void;
  setPaletteOpen: (open: boolean) => void;
  setQuickLogOpen: (open: boolean) => void;
  setMdImportOpen: (open: boolean) => void;
  setFontDialogOpen: (open: boolean) => void;
  setAppFont: (key: string) => void;
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
      theme: "dark",
      toggleSidebar: () =>
        set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setPaletteOpen: (open) => set({ paletteOpen: open }),
      setQuickLogOpen: (open) => set({ quickLogOpen: open }),
      setMdImportOpen: (open) => set({ mdImportOpen: open }),
      setFontDialogOpen: (open) => set({ fontDialogOpen: open }),
      setAppFont: (key) => set({ appFont: key }),
      toggleTheme: () =>
        set((s) => ({ theme: s.theme === "dark" ? "light" : "dark" })),
    }),
    {
      name: "dsa-vault-ui",
      partialize: (s) => ({
        sidebarCollapsed: s.sidebarCollapsed,
        theme: s.theme,
        appFont: s.appFont,
      }),
    },
  ),
);
