import { ReactNode } from "react";

export function PageShell({
  icon,
  title,
  subtitle,
  children,
}: {
  icon?: ReactNode;
  title: ReactNode;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <div className="max-w-[708px] mx-auto px-6 pt-12 pb-30">
      {icon && <div className="w-[60px] h-[60px] mb-3.5">{icon}</div>}
      <h1 className="text-[38px] font-bold tracking-[-0.015em] m-0 mb-1.5">
        {title}
      </h1>
      {subtitle && <div className="text-text-faint mb-8.5">{subtitle}</div>}
      {children}
    </div>
  );
}
