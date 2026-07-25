import { ReactNode } from "react";

export function Callout({
  icon,
  title,
  body,
}: {
  icon: ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="flex gap-3 bg-surface rounded-lg p-4 mb-2">
      <div className="w-5 h-5 flex-none mt-0.25">{icon}</div>
      <div>
        <div className="font-semibold">{title}</div>
        <p className="m-0 mt-0.5 text-text-dim text-[13.5px]">{body}</p>
      </div>
    </div>
  );
}
