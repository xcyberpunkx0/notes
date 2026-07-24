import { useEffect, useRef, useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { cpp } from "@codemirror/lang-cpp";
import { javascript } from "@codemirror/lang-javascript";
import { oneDark } from "@codemirror/theme-one-dark";
import { Code2 } from "lucide-react";
import { saveProblemCode, useProblemCode } from "@/db/problems";
import { useUiStore } from "@/app/store";
import { cn } from "@/lib/utils";

const VARIANTS = [
  { key: "optimized", label: "Optimized" },
  { key: "brute", label: "Brute force" },
];
const LANGUAGES = [
  { key: "cpp", label: "C++", ext: cpp },
  { key: "javascript", label: "JS/TS", ext: () => javascript({ typescript: true }) },
];

export function CodePanel({ problemId }: { problemId: number }) {
  const { data: codes, refetch } = useProblemCode(problemId);
  const theme = useUiStore((s) => s.theme);
  const [variant, setVariant] = useState("optimized");
  const [language, setLanguage] = useState("cpp");
  const [value, setValue] = useState("");
  const timer = useRef<number | null>(null);

  const stored =
    codes?.find((c) => c.variant === variant && c.language === language)
      ?.code ?? "";

  // Reload editor content when switching tabs or when data arrives
  useEffect(() => {
    setValue(stored);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [variant, language, codes === undefined]);

  function onChange(next: string) {
    setValue(next);
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(async () => {
      await saveProblemCode(problemId, language, variant, next);
      refetch();
    }, 900);
  }

  const langDef = LANGUAGES.find((l) => l.key === language) ?? LANGUAGES[0];

  return (
    <section className="card overflow-hidden">
      <header className="flex items-center gap-1 border-b border-line px-4 py-2.5">
        <span className="mr-2 flex items-center gap-2 text-[13px] font-semibold">
          <Code2 size={14} className="text-accent" />
          Code
        </span>
        {VARIANTS.map((v) => (
          <button
            key={v.key}
            onClick={() => setVariant(v.key)}
            className={cn(
              "h-7 rounded-md px-2.5 text-[12px] font-medium transition-colors",
              variant === v.key
                ? "bg-accent-soft text-accent"
                : "text-text-dim hover:bg-surface-2",
            )}
          >
            {v.label}
          </button>
        ))}
        <span className="ml-auto flex gap-1">
          {LANGUAGES.map((l) => (
            <button
              key={l.key}
              onClick={() => setLanguage(l.key)}
              className={cn(
                "h-7 rounded-md px-2 font-mono text-[11px] transition-colors",
                language === l.key
                  ? "bg-accent-soft text-accent"
                  : "text-text-faint hover:bg-surface-2",
              )}
            >
              {l.label}
            </button>
          ))}
        </span>
      </header>
      <CodeMirror
        value={value}
        onChange={onChange}
        theme={theme === "dark" ? oneDark : undefined}
        extensions={[langDef.ext()]}
        placeholder={`// ${variant === "brute" ? "Your first working solution" : "Your best solution"} — autosaves as you type`}
        minHeight="180px"
        style={{ fontSize: "13px", fontFamily: "var(--font-mono)" }}
        basicSetup={{ foldGutter: false, searchKeymap: false }}
      />
    </section>
  );
}
