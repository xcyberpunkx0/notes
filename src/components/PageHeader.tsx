interface PageHeaderProps {
  eyebrow: string;
  title: string;
  children?: React.ReactNode;
}

export function PageHeader({ eyebrow, title, children }: PageHeaderProps) {
  return (
    <div className="flex items-end justify-between px-8 pb-5 pt-8">
      <div>
        <p className="eyebrow mb-1.5">{eyebrow}</p>
        <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
      </div>
      {children}
    </div>
  );
}
