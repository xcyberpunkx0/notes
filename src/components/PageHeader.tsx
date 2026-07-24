interface PageHeaderProps {
  eyebrow: string;
  title: string;
  children?: React.ReactNode;
}

export function PageHeader({ eyebrow, title, children }: PageHeaderProps) {
  return (
    <div className="flex items-end justify-between px-10 pb-7 pt-10">
      <div>
        <p className="eyebrow mb-2">{eyebrow}</p>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
      </div>
      {children}
    </div>
  );
}
