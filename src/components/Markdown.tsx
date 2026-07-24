import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/** Renders markdown (incl. GFM tables) styled to the app's theme tokens. */
export function Markdown({ children }: { children: string }) {
  return (
    <div className="md-body">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{children}</ReactMarkdown>
    </div>
  );
}
