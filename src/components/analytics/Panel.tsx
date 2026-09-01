import type { ReactNode } from "react";

export function Panel({
  title,
  description,
  tag,
  actions,
  children,
  className = "",
}: {
  title: string;
  description?: string;
  tag?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`panel p-5 ${className}`}>
      <header className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-base font-semibold">{title}</h2>
          {description ? (
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{description}</p>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          {actions}
          {tag ? (
            <span className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 font-mono text-[11px] text-primary">
              {tag}
            </span>
          ) : null}
        </div>
      </header>
      {children}
    </section>
  );
}
