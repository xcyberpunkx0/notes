import { createReactInlineContentSpec } from "@blocknote/react";
import type { DefaultReactSuggestionItem } from "@blocknote/react";
import { useNavigate } from "react-router";
import { FileText, Hash, ListChecks } from "lucide-react";
import { searchLinkTargets } from "@/db/links";

export const VaultLink = createReactInlineContentSpec(
  {
    type: "vaultLink" as const,
    propSchema: {
      itemType: { default: "note" },
      itemId: { default: 0 },
      title: { default: "" },
    },
    content: "none" as const,
  },
  {
    render: (props) => {
      const { itemType, itemId, title } = props.inlineContent.props;
      const navigate = useNavigate();
      const path =
        itemType === "note"
          ? `/notes/${itemId}`
          : itemType === "problem"
            ? `/problems/${itemId}`
            : `/topics/${itemId}`;
      return (
        <button
          onClick={() => navigate(path)}
          className="mx-0.5 inline-flex cursor-pointer items-baseline gap-1 rounded-md bg-accent-soft px-1.5 py-0.5 text-[0.9em] font-medium text-accent transition-colors hover:brightness-110"
          title={`Open ${itemType}`}
        >
          {title}
        </button>
      );
    },
  },
);

const TYPE_ICON: Record<string, React.JSX.Element> = {
  note: <FileText size={16} />,
  problem: <ListChecks size={16} />,
  topic: <Hash size={16} />,
};

// The editor type is structurally compatible; typing it exactly would couple
// this file to the full schema generics for no benefit.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getVaultLinkItems(
  editor: any,
  query: string,
): Promise<DefaultReactSuggestionItem[]> {
  const targets = await searchLinkTargets(query);
  return targets.map((t) => ({
    title: t.title,
    subtext: t.subtitle ?? undefined,
    group: "Link to",
    icon: TYPE_ICON[t.type],
    onItemClick: () => {
      editor.insertInlineContent([
        {
          type: "vaultLink",
          props: { itemType: t.type, itemId: t.id, title: t.title },
        },
        " ",
      ]);
    },
  }));
}
