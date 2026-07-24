import { useNavigate } from "react-router";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { useUiStore } from "./store";

export function Topbar() {
  const navigate = useNavigate();
  const setPaletteOpen = useUiStore((s) => s.setPaletteOpen);

  return (
    <header className="flex h-13 shrink-0 items-center gap-1.5 border-b border-line px-3">
      <button
        onClick={() => navigate(-1)}
        title="Go back"
        className="flex size-8 items-center justify-center rounded-lg text-text-faint transition-colors duration-150 hover:bg-surface-2 hover:text-text"
      >
        <ChevronLeft size={16} />
      </button>
      <button
        onClick={() => navigate(1)}
        title="Go forward"
        className="flex size-8 items-center justify-center rounded-lg text-text-faint transition-colors duration-150 hover:bg-surface-2 hover:text-text"
      >
        <ChevronRight size={16} />
      </button>

      <button
        onClick={() => setPaletteOpen(true)}
        className="ml-2 flex h-8 w-72 items-center gap-2 rounded-lg border border-line bg-surface px-2.5 text-[13px] text-text-faint transition-colors duration-150 hover:border-line-strong hover:text-text-dim"
      >
        <Search size={13} />
        <span>Search the vault…</span>
        <span className="ml-auto flex items-center gap-1">
          <span className="kbd">Ctrl</span>
          <span className="kbd">K</span>
        </span>
      </button>
    </header>
  );
}
