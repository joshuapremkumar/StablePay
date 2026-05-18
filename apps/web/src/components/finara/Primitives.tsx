import { ArrowDownRight, ArrowUpRight, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-semibold tracking-tight">{title}</h1>
        {description && (
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

export function KpiCard({
  label,
  value,
  delta,
  icon: Icon,
  hint,
}: {
  label: string;
  value: string;
  delta?: number;
  icon?: LucideIcon;
  hint?: string;
}) {
  const positive = (delta ?? 0) >= 0;
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between text-xs text-muted-foreground uppercase tracking-wider">
        <span>{label}</span>
        {Icon && <Icon className="h-4 w-4" />}
      </div>
      <div className="mt-3 font-display text-2xl md:text-3xl font-semibold tabular tracking-tight">
        {value}
      </div>
      <div className="mt-2 flex items-center gap-2 text-xs">
        {typeof delta === "number" && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded font-medium",
              positive ? "text-success bg-success/10" : "text-destructive bg-destructive/10",
            )}
          >
            {positive ? (
              <ArrowUpRight className="h-3 w-3" />
            ) : (
              <ArrowDownRight className="h-3 w-3" />
            )}
            {(delta * 100).toFixed(1)}%
          </span>
        )}
        {hint && <span className="text-muted-foreground">{hint}</span>}
      </div>
    </div>
  );
}

export function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    settled: "bg-success/10 text-success border-success/30",
    paid: "bg-success/10 text-success border-success/30",
    funded: "bg-success/10 text-success border-success/30",
    verified: "bg-success/10 text-success border-success/30",
    active: "bg-success/10 text-success border-success/30",
    delivered: "bg-success/10 text-success border-success/30",
    clear: "bg-success/10 text-success border-success/30",
    matured: "bg-muted text-muted-foreground border-border",
    pending: "bg-warning/10 text-warning border-warning/30",
    approval: "bg-warning/10 text-warning border-warning/30",
    review: "bg-warning/10 text-warning border-warning/30",
    open: "bg-warning/10 text-warning border-warning/30",
    confirmed: "bg-warning/10 text-warning border-warning/30",
    flagged: "bg-destructive/10 text-destructive border-destructive/30",
    scheduled: "bg-primary/10 text-primary border-primary/30",
    listed: "bg-electric/10 text-electric border-electric/30",
    "in transit": "bg-electric/10 text-electric border-electric/30",
    issued: "bg-electric/10 text-electric border-electric/30",
    under_review: "bg-electric/10 text-electric border-electric/30",
    draft: "bg-muted text-muted-foreground border-border",
    refunded: "bg-destructive/10 text-destructive border-destructive/30",
  };
  const cls = map[status.toLowerCase()] ?? "bg-muted text-muted-foreground border-border";
  return (
    <span
      className={cn(
        "inline-flex items-center text-[10px] uppercase tracking-wider font-medium border rounded px-1.5 py-0.5",
        cls,
      )}
    >
      {status}
    </span>
  );
}

export function SectionCard({
  title,
  description,
  actions,
  children,
  className,
}: {
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-xl border border-border bg-card", className)}>
      {(title || actions) && (
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div>
            {title && <div className="font-medium text-sm">{title}</div>}
            {description && (
              <div className="text-xs text-muted-foreground mt-0.5">{description}</div>
            )}
          </div>
          {actions}
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
}
