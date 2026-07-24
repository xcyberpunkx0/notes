import { useNavigate } from "react-router";
import { CaretLeft, CaretRight, MagnifyingGlass } from "@phosphor-icons/react";
import { useUiStore } from "./store";

export function Topbar() {
  const navigate = useNavigate();
  const setPaletteOpen = useUiStore((s) => s.setPaletteOpen);

  return (
    <header className="flex h-13 shrink-0 items-center gap-1.5 border-b border-line px-3">
      <button
        onClick={() => navigate(-1)}
        title="Go back"
        className="flex size-8 items-center justify-center rounded-xl text-text-faint transition-colors duration-150 hover:bg-surface-2 hover:text-text"
      >
        <CaretLeft size={16} />
      </button>
      <button
        onClick={() => navigate(1)}
        title="Go forward"
        className="flex size-8 items-center justify-center rounded-xl text-text-faint transition-colors duration-150 hover:bg-surface-2 hover:text-text"
      >
        <CaretRight size={16} />
      </button>

      <button
        onClick={() => setPaletteOpen(true)}
        className="ml-2 flex h-9 w-72 items-center gap-2.5 rounded-xl border border-line bg-surface px-3 text-[13px] text-text-faint transition-colors duration-150 hover:border-line-strong hover:text-text-dim"
      >
        <MagnifyingGlass size={14} />
        <span>Search notes…</span>
        <span className="ml-auto flex items-center gap-1">
          <span className="kbd">Ctrl</span>
          <span className="kbd">K</span>
        </span>
      </button>
    </header>
  );
}
