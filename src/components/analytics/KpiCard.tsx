import type { LucideIcon } from "lucide-react";

export function KpiCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "primary",
}: {
  label: string;
  value: string;
  hint?: string;
  icon: LucideIcon;
  tone?: "primary" | "warning" | "success" | "destructive" | "muted";
}) {
  const tones: Record<string, string> = {
    primary: "bg-primary/12 text-primary",
    warning: "bg-warning/12 text-warning",
    success: "bg-success/12 text-success",
    destructive: "bg-destructive/12 text-destructive",
    muted: "bg-muted text-muted-foreground",
  };

  return (
    <div className="panel p-4 transition-colors hover:border-primary/35">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{label}</p>
        <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${tones[tone]}`}>
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <p className="metric-value mt-3">{value}</p>
      {hint ? <p className="mt-1.5 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}
