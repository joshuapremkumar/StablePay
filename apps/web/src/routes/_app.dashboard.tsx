import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { KpiCard, PageHeader, SectionCard, StatusPill } from "@/components/finara/Primitives";
import { AllocationDonut, CashFlowChart } from "@/components/finara/Charts";
import { formatMoney } from "@/lib/mock";
import { demoApi } from "@/lib/demo";
import {
  Banknote,
  Coins,
  TrendingUp,
  Wallet,
  FileText,
  ShieldAlert,
  Send,
  Sparkles,
  ArrowRightLeft,
  Plus,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/dashboard")({
  head: () => ({ meta: [{ title: "Executive Dashboard - Finara OS" }] }),
  component: Dashboard,
});

function Dashboard() {
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ["demo", "dashboard"],
    queryFn: demoApi.getDashboard,
  });

  const action = useMutation({
    mutationFn: async (kind: "payment" | "payout" | "financing") => {
      if (kind === "payment") return demoApi.simulatePayment();
      if (kind === "payout") return demoApi.createPayout();
      return demoApi.requestFinancing();
    },
    onSuccess: async (_, kind) => {
      await queryClient.invalidateQueries({ queryKey: ["demo"] });
      toast.success(
        kind === "payment"
          ? "Simulated a settled merchant payment."
          : kind === "payout"
            ? "Simulated a supplier payout."
            : "Simulated a trade financing event.",
      );
    },
  });

  if (isLoading) {
    return <div className="p-6 md:p-8">Loading dashboard simulation...</div>;
  }

  if (error || !data) {
    return <div className="p-6 md:p-8">Unable to load the dashboard simulation.</div>;
  }

  return (
    <div className="p-6 md:p-8 max-w-[1600px] mx-auto">
      <PageHeader
        title="Good morning, Layla"
        description="Here's a unified view of treasury, payables, and merchant operations across all entities."
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => action.mutate("payment")}
              disabled={action.isPending}
            >
              <ArrowRightLeft className="h-4 w-4 mr-1.5" /> Simulate settlement
            </Button>
            <Button size="sm" onClick={() => action.mutate("payout")} disabled={action.isPending}>
              <Plus className="h-4 w-4 mr-1.5" /> Pay supplier
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard
          label="Treasury balance"
          value={formatMoney(data.kpis.treasuryBalance, "AED")}
          delta={data.kpis.momCashflow}
          icon={Wallet}
          hint="vs last month"
        />
        <KpiCard
          label="Stablecoin"
          value={formatMoney(data.kpis.stablecoin, "USDC")}
          delta={0.041}
          icon={Coins}
          hint="USDC reserve"
        />
        <KpiCard
          label="Fiat"
          value={formatMoney(data.kpis.fiat, "AED")}
          delta={0.018}
          icon={Banknote}
          hint="across 3 currencies"
        />
        <KpiCard
          label="Net 30d cashflow"
          value={formatMoney(data.kpis.receivables30d - data.kpis.payables30d, "AED")}
          delta={0.092}
          icon={TrendingUp}
          hint="receivables - payables"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <SectionCard
          title="Cash flow"
          description="Inflow vs outflow / last 90 days"
          actions={
            <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-chart-2" />
                Inflow
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-chart-1" />
                Outflow
              </span>
            </div>
          }
          className="lg:col-span-2"
        >
          <CashFlowChart data={data.cashflow} />
        </SectionCard>

        <SectionCard title="Treasury allocation" description="Across currencies">
          <AllocationDonut data={data.allocation} />
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <SectionCard title="Upcoming payables" description="Next 7 days" className="lg:col-span-2">
          <div className="-m-5 overflow-auto">
            <table className="w-full text-sm">
              <thead className="text-[11px] uppercase text-muted-foreground tracking-wider">
                <tr className="border-b border-border">
                  <th className="text-left font-medium px-5 py-2.5">Vendor</th>
                  <th className="text-left font-medium px-3 py-2.5">Due</th>
                  <th className="text-right font-medium px-3 py-2.5">Amount</th>
                  <th className="text-left font-medium px-5 py-2.5">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.upcomingPayables.map((p) => (
                  <tr key={p.id} className="border-b border-border/60 hover:bg-surface-elevated">
                    <td className="px-5 py-3">
                      <div className="font-medium">{p.vendor}</div>
                      <div className="text-[11px] text-muted-foreground">{p.id}</div>
                    </td>
                    <td className="px-3 py-3 text-muted-foreground tabular">{p.due}</td>
                    <td className="px-3 py-3 text-right font-medium tabular">
                      {formatMoney(p.amount, p.currency)}
                    </td>
                    <td className="px-5 py-3">
                      <StatusPill status={p.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>

        <SectionCard
          title="AI CFO insights"
          description="Live signal from your operations"
          actions={<Sparkles className="h-4 w-4 text-electric" />}
        >
          <div className="space-y-3">
            {data.aiAlerts.map((a) => (
              <div key={a.id} className="rounded-lg border border-border bg-surface-elevated p-3">
                <div className="flex items-start gap-2">
                  {a.kind === "liquidity" && (
                    <AlertTriangle className="h-4 w-4 text-warning mt-0.5" />
                  )}
                  {a.kind === "vendor" && (
                    <ShieldAlert className="h-4 w-4 text-destructive mt-0.5" />
                  )}
                  {a.kind === "risk" && <TrendingUp className="h-4 w-4 text-electric mt-0.5" />}
                  <div className="flex-1">
                    <div className="text-sm font-medium leading-snug">{a.title}</div>
                    <div className="text-[12px] text-muted-foreground mt-1 leading-relaxed">
                      {a.body}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <Button variant="outline" size="sm" className="w-full" onClick={() => action.mutate("financing")}>
              Open Copilot
            </Button>
          </div>
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SectionCard title="Recent merchant settlements" description="Today">
          <div className="space-y-2">
            {data.settlements.map((s) => (
              <div
                key={s.id}
                className="flex items-center gap-3 py-2 border-b border-border/60 last:border-0"
              >
                <div className="h-8 w-8 rounded-md bg-surface-elevated grid place-items-center text-[10px] text-muted-foreground">
                  {s.time}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium">{s.channel}</div>
                  <div className="text-[11px] text-muted-foreground">{s.id}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium tabular">
                    {formatMoney(s.amount, s.currency)}
                  </div>
                  <StatusPill status={s.status} />
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Quick actions" description="Most-used CFO workflows">
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: Send, label: "Pay supplier", desc: "Single or batch", kind: "payout" as const },
              { icon: FileText, label: "Issue invoice", desc: "With payment link", kind: "payment" as const },
              { icon: ShieldAlert, label: "Smart LoC", desc: "Trade finance", kind: "financing" as const },
              { icon: ArrowRightLeft, label: "Treasury transfer", desc: "Across currencies", kind: "payment" as const },
            ].map((a) => (
              <button
                key={a.label}
                className="text-left p-4 rounded-lg border border-border bg-surface-elevated hover:border-primary/40 hover:bg-primary/5 transition-colors group"
                onClick={() => action.mutate(a.kind)}
              >
                <a.icon className="h-5 w-5 text-electric mb-3" />
                <div className="text-sm font-medium">{a.label}</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">{a.desc}</div>
              </button>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
