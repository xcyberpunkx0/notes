import { Suspense, lazy, useEffect, useRef, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { createReactBlockSpec } from "@blocknote/react";
import { PencilSimple } from "@phosphor-icons/react";
import { useUiStore } from "@/app/store";
import "@excalidraw/excalidraw/index.css";

const Excalidraw = lazy(() =>
  import("@excalidraw/excalidraw").then((m) => ({ default: m.Excalidraw })),
);

interface Scene {
  elements: readonly unknown[];
  files?: Record<string, unknown>;
}

function parseScene(json: string): Scene | null {
  try {
    const scene = JSON.parse(json);
    return Array.isArray(scene?.elements) ? scene : null;
  } catch {
    return null;
  }
}

function DrawingPreview({ sceneJson }: { sceneJson: string }) {
  const theme = useUiStore((s) => s.theme);
  const [svg, setSvg] = useState<string>("");

  useEffect(() => {
    let cancelled = false;
    const scene = parseScene(sceneJson);
    if (!scene || scene.elements.length === 0) {
      setSvg("");
      return;
    }
    import("@excalidraw/excalidraw").then(async ({ exportToSvg }) => {
      const node = await exportToSvg({
        elements: scene.elements as never,
        files: (scene.files ?? null) as never,
        appState: { exportBackground: false, theme },
      });
      node.style.maxWidth = "100%";
      node.style.height = "auto";
      if (!cancelled) setSvg(node.outerHTML);
    });
    return () => {
      cancelled = true;
    };
  }, [sceneJson, theme]);

  if (!svg) {
    return (
      <div className="flex items-center justify-center py-10 text-[13px] text-text-faint">
        Empty canvas — open it and sketch something.
      </div>
    );
  }
  return (
    <div
      className="flex justify-center py-2 [&_svg]:max-w-full"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

export const DrawingBlock = createReactBlockSpec(
  {
    type: "drawing" as const,
    propSchema: {
      scene: { default: "" },
    },
    content: "none" as const,
  },
  {
    render: (props) => {
      const { block, editor } = props;
      const theme = useUiStore((s) => s.theme);
      const [open, setOpen] = useState(false);
      const latest = useRef<Scene | null>(null);

      function saveAndClose() {
        if (latest.current) {
          editor.updateBlock(block, {
            props: { scene: JSON.stringify(latest.current) },
          });
        }
        setOpen(false);
      }

      return (
        <div className="my-1 w-full rounded-xl border border-line bg-surface">
          <div className="flex items-center justify-between border-b border-line px-3 py-1.5">
            <span className="eyebrow">drawing</span>
            <button
              onClick={() => setOpen(true)}
              className="flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] text-text-dim transition-colors hover:bg-surface-2 hover:text-text"
            >
              <PencilSimple size={12} />
              Open canvas
            </button>
          </div>
          <div onDoubleClick={() => setOpen(true)} className="p-2">
            <DrawingPreview sceneJson={block.props.scene} />
          </div>

          <Dialog.Root
            open={open}
            onOpenChange={(next) => (next ? setOpen(true) : saveAndClose())}
          >
            <Dialog.Portal>
              <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60" />
              <Dialog.Content
                className="fixed inset-6 z-50 overflow-hidden rounded-2xl border border-line-strong bg-surface shadow-2xl shadow-black/50"
                aria-describedby={undefined}
              >
                <Dialog.Title className="sr-only">Drawing canvas</Dialog.Title>
                <div className="flex h-11 items-center justify-between border-b border-line px-4">
                  <span className="text-[13px] font-semibold">Drawing</span>
                  <button onClick={saveAndClose} className="btn-primary !h-8 !px-3.5 !text-[12px]">
                    Save & close
                  </button>
                </div>
                <div className="h-[calc(100%-2.75rem)]">
                  <Suspense
                    fallback={
                      <div className="flex h-full items-center justify-center text-[13px] text-text-faint">
                        Loading canvas…
                      </div>
                    }
                  >
                    <Excalidraw
                      theme={theme}
                      initialData={
                        (parseScene(block.props.scene) ?? undefined) as never
                      }
                      onChange={(elements, _state, files) => {
                        latest.current = { elements, files };
                      }}
                    />
                  </Suspense>
                </div>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        </div>
      );
    },
  },
);
