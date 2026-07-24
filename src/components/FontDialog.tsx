import * as Dialog from "@radix-ui/react-dialog";
import { Check, X } from "@phosphor-icons/react";
import { useUiStore } from "@/app/store";
import { FONT_OPTIONS } from "@/lib/fonts";
import { cn } from "@/lib/utils";

const GROUPS = ["Clean & clear", "Serif & script", "Handwritten"] as const;

export function FontDialog() {
  const open = useUiStore((s) => s.fontDialogOpen);
  const setOpen = useUiStore((s) => s.setFontDialogOpen);
  const appFont = useUiStore((s) => s.appFont);
  const setAppFont = useUiStore((s) => s.setAppFont);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-[2px]" />
        <Dialog.Content
          className="fixed left-1/2 top-[10%] z-50 max-h-[75vh] w-[480px] -translate-x-1/2 overflow-y-auto rounded-3xl border border-line-strong bg-surface p-6 shadow-2xl shadow-black/40"
          aria-describedby={undefined}
        >
          <div className="flex items-center justify-between">
            <Dialog.Title className="text-sm font-semibold">
              Choose your font
            </Dialog.Title>
            <Dialog.Close className="flex size-7 items-center justify-center rounded-md text-text-faint hover:bg-surface-2 hover:text-text">
              <X size={14} />
            </Dialog.Close>
          </div>
          <p className="mt-1 text-[12px] text-text-dim">
            Applies to notes and the whole interface. Headings and code keep
            their own faces.
          </p>

          {GROUPS.map((group) => (
            <div key={group} className="mt-4">
              <p className="eyebrow mb-2">{group}</p>
              <div className="flex flex-col gap-1.5">
                {FONT_OPTIONS.filter((f) => f.group === group).map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setAppFont(f.key)}
                    className={cn(
                      "flex items-center justify-between rounded-xl border px-3.5 py-2.5 text-left transition-colors",
                      appFont === f.key
                        ? "border-accent bg-accent-soft"
                        : "border-line hover:border-line-strong hover:bg-surface-2",
                    )}
                  >
                    <span className="min-w-0">
                      <span className="block text-[12px] font-medium text-text-dim">
                        {f.label}
                      </span>
                      <span
                        className="mt-0.5 block truncate text-[15px] text-text"
                        style={{ fontFamily: f.family }}
                      >
                        Binary search needs a sorted array — O(log n)
                      </span>
                    </span>
                    {appFont === f.key && (
                      <Check size={15} className="shrink-0 text-accent" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
