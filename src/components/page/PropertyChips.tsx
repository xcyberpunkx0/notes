import { ReactNode } from "react";

export function PropertyChips({
  items,
}: {
  items: Array<{
    icon: ReactNode;
    label: string;
    value: number | string;
  }>;
}) {
  const isZero = (val: number | string): boolean => {
    return val === 0 || val === "0";
  };

  return (
    <div className="flex gap-6.5 py-4.5 px-0.5 border-b border-line mb-2.5">
      {items.map((item, idx) => (
        <div key={idx} className="flex flex-col gap-0.75">
          <div className="text-[12px] text-text-faint flex gap-1.25 items-center">
            <div className="w-3 h-3">{item.icon}</div>
            {item.label}
          </div>
          <div
            className={`text-[15px] font-semibold ${
              isZero(item.value) ? "text-text-dim" : ""
            }`}
          >
            {item.value}
          </div>
        </div>
      ))}
    </div>
  );
}
