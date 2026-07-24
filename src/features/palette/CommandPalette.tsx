import { useNavigate } from "react-router";
import { Command } from "cmdk";
import * as Dialog from "@radix-ui/react-dialog";
import {
  Brain,
  House,
  Library,
  ListChecks,
  MoonStar,
  PenLine,
  Plus,
} from "lucide-react";
import { useUiStore } from "@/app/store";

interface Action {
  id: string;
  label: string;
  icon: React.ReactNode;
  run: () => void;
}

export function CommandPalette() {
  const open = useUiStore((s) => s.paletteOpen);
  const setOpen = useUiStore((s) => s.setPaletteOpen);
  const toggleTheme = useUiStore((s) => s.toggleTheme);
  const navigate = useNavigate();

  function runAndClose(fn: () => void) {
    setOpen(false);
    fn();
  }

  const navigation: Action[] = [
    { id: "home", label: "Go to Home", icon: <House size={15} />, run: () => navigate("/") },
    { id: "review", label: "Go to Review", icon: <Brain size={15} />, run: () => navigate("/review") },
    { id: "topics", label: "Go to Topics", icon: <Library size={15} />, run: () => navigate("/topics") },
    { id: "problems", label: "Go to Problems", icon: <ListChecks size={15} />, run: () => navigate("/problems") },
  ];

  const create: Action[] = [
    { id: "new-note", label: "New note", icon: <PenLine size={15} />, run: () => navigate("/topics") },
    { id: "log-problem", label: "Log a problem", icon: <Plus size={15} />, run: () => navigate("/problems") },
  ];

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-[2px]" />
        <Dialog.Content
          className="fixed left-1/2 top-[16%] z-50 w-[580px] -translate-x-1/2 overflow-hidden rounded-xl border border-line-strong bg-surface/90 shadow-2xl shadow-black/40 backdrop-blur-xl"
          aria-describedby={undefined}
        >
          <Dialog.Title className="sr-only">Command palette</Dialog.Title>
          <Command label="Command palette">
            <Command.Input
              autoFocus
              placeholder="Type a command or search…"
              className="h-12 w-full border-b border-line bg-transparent px-4 text-sm text-text outline-none placeholder:text-text-faint"
            />
            <Command.List className="max-h-80 overflow-y-auto p-1.5">
              <Command.Empty className="py-8 text-center text-[13px] text-text-faint">
                Nothing matches — full-text search over notes and code arrives
                soon.
              </Command.Empty>

              <Command.Group
                heading="Navigate"
                className="[&_[cmdk-group-heading]]:eyebrow [&_[cmdk-group-heading]]:px-2.5 [&_[cmdk-group-heading]]:pb-1 [&_[cmdk-group-heading]]:pt-2"
              >
                {navigation.map((a) => (
                  <PaletteItem key={a.id} action={a} onRun={runAndClose} />
                ))}
              </Command.Group>

              <Command.Group
                heading="Create"
                className="[&_[cmdk-group-heading]]:eyebrow [&_[cmdk-group-heading]]:px-2.5 [&_[cmdk-group-heading]]:pb-1 [&_[cmdk-group-heading]]:pt-2"
              >
                {create.map((a) => (
                  <PaletteItem key={a.id} action={a} onRun={runAndClose} />
                ))}
              </Command.Group>

              <Command.Group
                heading="Preferences"
                className="[&_[cmdk-group-heading]]:eyebrow [&_[cmdk-group-heading]]:px-2.5 [&_[cmdk-group-heading]]:pb-1 [&_[cmdk-group-heading]]:pt-2"
              >
                <PaletteItem
                  action={{
                    id: "theme",
                    label: "Switch theme",
                    icon: <MoonStar size={15} />,
                    run: toggleTheme,
                  }}
                  onRun={runAndClose}
                />
              </Command.Group>
            </Command.List>

            <div className="flex items-center gap-3 border-t border-line px-3 py-2 text-[11px] text-text-faint">
              <span className="flex items-center gap-1">
                <span className="kbd">↑</span>
                <span className="kbd">↓</span> navigate
              </span>
              <span className="flex items-center gap-1">
                <span className="kbd">↵</span> select
              </span>
              <span className="flex items-center gap-1">
                <span className="kbd">esc</span> close
              </span>
            </div>
          </Command>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function PaletteItem({
  action,
  onRun,
}: {
  action: Action;
  onRun: (fn: () => void) => void;
}) {
  return (
    <Command.Item
      value={action.label}
      onSelect={() => onRun(action.run)}
      className="flex h-9 cursor-default items-center gap-2.5 rounded-lg px-2.5 text-[13px] text-text-dim data-[selected=true]:bg-accent-soft data-[selected=true]:text-text"
    >
      <span className="text-text-faint">{action.icon}</span>
      {action.label}
    </Command.Item>
  );
}
