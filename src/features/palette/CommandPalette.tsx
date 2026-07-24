import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Command } from "cmdk";
import * as Dialog from "@radix-ui/react-dialog";
import {
  Brain,
  Note,
  House,
  Books,
  Target,
  MoonStars,
  PencilSimpleLine,
  Plus,
} from "@phosphor-icons/react";
import { useUiStore } from "@/app/store";
import { useVaultSearch } from "@/db/search";

interface Action {
  id: string;
  label: string;
  icon: React.ReactNode;
  run: () => void;
}

export function CommandPalette() {
  const open = useUiStore((s) => s.paletteOpen);
  const setOpen = useUiStore((s) => s.setPaletteOpen);
  const setQuickLogOpen = useUiStore((s) => s.setQuickLogOpen);
  const toggleTheme = useUiStore((s) => s.toggleTheme);
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const { data: results } = useVaultSearch(query.trim());

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  function runAndClose(fn: () => void) {
    setOpen(false);
    fn();
  }

  const matches = (label: string) =>
    label.toLowerCase().includes(query.trim().toLowerCase());

  const navigation: Action[] = [
    { id: "home", label: "Go to Home", icon: <House size={16} />, run: () => navigate("/") },
    { id: "review", label: "Go to Review", icon: <Brain size={16} />, run: () => navigate("/review") },
    { id: "topics", label: "Go to Topics", icon: <Books size={16} />, run: () => navigate("/topics") },
    { id: "problems", label: "Go to Problems", icon: <Target size={16} />, run: () => navigate("/problems") },
  ];

  const create: Action[] = [
    { id: "new-note", label: "New note", icon: <PencilSimpleLine size={16} />, run: () => navigate("/topics") },
    { id: "log-problem", label: "Log a problem", icon: <Plus size={16} />, run: () => setQuickLogOpen(true) },
  ];

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-[2px]" />
        <Dialog.Content
          className="fixed left-1/2 top-[16%] z-50 w-[600px] -translate-x-1/2 overflow-hidden rounded-3xl border border-line-strong bg-surface/90 shadow-2xl shadow-black/40 backdrop-blur-xl"
          aria-describedby={undefined}
        >
          <Dialog.Title className="sr-only">Command palette</Dialog.Title>
          <Command label="Command palette" shouldFilter={false}>
            <Command.Input
              autoFocus
              value={query}
              onValueChange={setQuery}
              placeholder="Search notes, problems, code — or type a command…"
              className="h-12 w-full border-b border-line bg-transparent px-4 text-sm text-text outline-none placeholder:text-text-faint"
            />
            <Command.List className="max-h-80 overflow-y-auto p-1.5">
              <Command.Empty className="py-8 text-center text-[13px] text-text-faint">
                No notes match "{query}" yet.
              </Command.Empty>

              {results && results.length > 0 && (
                <Command.Group
                  heading="In your notes"
                  className="[&_[cmdk-group-heading]]:eyebrow [&_[cmdk-group-heading]]:px-2.5 [&_[cmdk-group-heading]]:pb-1 [&_[cmdk-group-heading]]:pt-2"
                >
                  {results.map((r) => (
                    <Command.Item
                      key={`${r.type}-${r.id}`}
                      value={`result-${r.type}-${r.id}`}
                      onSelect={() =>
                        runAndClose(() =>
                          navigate(
                            r.type === "note"
                              ? `/notes/${r.id}`
                              : `/problems/${r.id}`,
                          ),
                        )
                      }
                      className="flex cursor-default items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13px] text-text-dim data-[selected=true]:bg-accent-soft data-[selected=true]:text-text"
                    >
                      <span className="shrink-0 text-text-faint">
                        {r.type === "note" ? (
                          <Note size={16} />
                        ) : (
                          <Target size={16} />
                        )}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate font-medium">
                          {r.title}
                        </span>
                        {r.snippet && (
                          <span className="block truncate text-[11px] text-text-faint">
                            {r.snippet}
                          </span>
                        )}
                      </span>
                    </Command.Item>
                  ))}
                </Command.Group>
              )}

              {navigation.some((a) => matches(a.label)) && (
                <Command.Group
                  heading="Navigate"
                  className="[&_[cmdk-group-heading]]:eyebrow [&_[cmdk-group-heading]]:px-2.5 [&_[cmdk-group-heading]]:pb-1 [&_[cmdk-group-heading]]:pt-2"
                >
                  {navigation
                    .filter((a) => matches(a.label))
                    .map((a) => (
                      <PaletteItem key={a.id} action={a} onRun={runAndClose} />
                    ))}
                </Command.Group>
              )}

              {create.some((a) => matches(a.label)) && (
                <Command.Group
                  heading="Create"
                  className="[&_[cmdk-group-heading]]:eyebrow [&_[cmdk-group-heading]]:px-2.5 [&_[cmdk-group-heading]]:pb-1 [&_[cmdk-group-heading]]:pt-2"
                >
                  {create
                    .filter((a) => matches(a.label))
                    .map((a) => (
                      <PaletteItem key={a.id} action={a} onRun={runAndClose} />
                    ))}
                </Command.Group>
              )}

              {matches("Switch theme") && (
                <Command.Group
                  heading="Preferences"
                  className="[&_[cmdk-group-heading]]:eyebrow [&_[cmdk-group-heading]]:px-2.5 [&_[cmdk-group-heading]]:pb-1 [&_[cmdk-group-heading]]:pt-2"
                >
                  <PaletteItem
                    action={{
                      id: "theme",
                      label: "Switch theme",
                      icon: <MoonStars size={16} />,
                      run: toggleTheme,
                    }}
                    onRun={runAndClose}
                  />
                </Command.Group>
              )}
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
      className="flex h-10 cursor-default items-center gap-3 rounded-xl px-3 text-[13px] text-text-dim data-[selected=true]:bg-accent-soft data-[selected=true]:text-text"
    >
      <span className="text-text-faint">{action.icon}</span>
      {action.label}
    </Command.Item>
  );
}
