import { ReactNode } from "react";

export function ListRow({
  icon,
  glyph,
  children,
  tag,
  onClick,
}: {
  icon?: ReactNode;
  glyph?: string;
  children: ReactNode;
  tag?: string;
  onClick?: () => void;
}) {
  return (
    <div
      className="flex items-center gap-2.5 py-1.75 px-1.5 rounded-md text-text-dim text-[13.5px] hover:bg-surface-2 transition-colors cursor-default"
      onClick={onClick}
    >
      {icon && <div className="w-3.75 h-3.75 opacity-70 flex-none">{icon}</div>}
      {glyph && <div className="w-4 flex-none text-center text-[13px]">{glyph}</div>}
      <div>{children}</div>
      {tag && (
        <div className="ml-auto text-[11px] py-0.25 px-2 rounded-full bg-accent-soft text-accent">
          {tag}
        </div>
      )}
    </div>
  );
}
