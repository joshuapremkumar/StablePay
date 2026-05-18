import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { KpiCard, PageHeader, SectionCard } from "@/components/finara/Primitives";
import { AllocationDonut, CashFlowChart } from "@/components/finara/Charts";
import { formatMoney } from "@/lib/mock";
import { demoApi } from "@/lib/demo";
import { Button } from "@/components/ui/button";
import { ArrowRightLeft, TrendingUp, Wallet, Coins, DollarSign } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/treasury")({
  head: () => ({ meta: [{ title: "Treasury & Financial Ops - Finara OS" }] }),
  component: Treasury,
});

function Treasury() {
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ["demo", "treasury"],
    queryFn: demoApi.getTreasury,
  });

  const payout = useMutation({
    mutationFn: demoApi.createPayout,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["demo"] });
      toast.success("Simulated a treasury payout and updated balances.");
    },
  });

  if (isLoading) {
    return <div className="p-6 md:p-8">Loading treasury simulation...</div>;
  }

  if (error || !data) {
    return <div className="p-6 md:p-8">Unable to load the treasury simulation.</div>;
  }

  return (
    <div className="p-6 md:p-8 max-w-[1600px] mx-auto">
      <PageHeader
        title="Treasury & Financial Ops"
        description="Multi-currency balances, allocation, and forecasting across the corporate treasury."
        actions={
          <Button size="sm" onClick={() => payout.mutate()}>
            <ArrowRightLeft className="h-4 w-4 mr-1.5" /> New transfer
          </Button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {data.currencyBalances.map((c) => (
          <KpiCard
            key={c.code}
            label={`${c.code} / ${c.label}`}
            value={formatMoney(c.balance, c.code)}
            delta={c.change}
            icon={c.code === "USDC" ? Coins : c.code === "USD" ? DollarSign : Wallet}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <SectionCard title="Cash position" description="90-day rolling" className="lg:col-span-2">
          <CashFlowChart data={data.cashflow} />
        </SectionCard>
        <SectionCard title="Allocation" description="By account">
          <AllocationDonut data={data.allocation} />
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <SectionCard title="Stablecoin to fiat" description="On-demand corporate conversion">
          <div className="space-y-3">
            <div className="rounded-lg border border-border bg-surface-elevated p-3">
              <div className="text-[11px] text-muted-foreground">From</div>
              <div className="flex items-center gap-2 mt-1">
                <select className="h-9 px-2 rounded-md border border-border bg-surface text-sm">
                  <option>USDC</option>
                  <option>USD</option>
                  <option>AED</option>
                  <option>EUR</option>
                </select>
                <input
                  defaultValue="320,000.00"
                  className="flex-1 h-9 px-3 rounded-md border border-border bg-surface text-sm tabular text-right"
                />
              </div>
            </div>
            <div className="flex justify-center">
              <div className="h-8 w-8 rounded-full bg-surface-elevated grid place-items-center border border-border">
                <ArrowRightLeft className="h-3.5 w-3.5" />
              </div>
            </div>
            <div className="rounded-lg border border-border bg-surface-elevated p-3">
              <div className="text-[11px] text-muted-foreground">To</div>
              <div className="flex items-center gap-2 mt-1">
                <select className="h-9 px-2 rounded-md border border-border bg-surface text-sm">
                  <option>AED</option>
                  <option>USD</option>
                  <option>EUR</option>
                  <option>USDC</option>
                </select>
                <input
                  defaultValue="1,175,200.00"
                  className="flex-1 h-9 px-3 rounded-md border border-border bg-surface text-sm tabular text-right"
                />
              </div>
            </div>
            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
              <span>Rate 1 USDC = 3.6725 AED</span>
              <span>Fee 0.18%</span>
            </div>
            <Button className="w-full" onClick={() => payout.mutate()}>
              Confirm conversion
            </Button>
          </div>
        </SectionCard>

        <SectionCard title="Accounts payable" description="Next 30 days" className="lg:col-span-1">
          <div className="space-y-4">
            <div>
              <div className="text-[11px] uppercase tracking-widest text-muted-foreground">
                Outstanding
              </div>
              <div className="font-display text-2xl font-semibold tabular mt-1">
                {formatMoney(data.payables30d, "AED")}
              </div>
            </div>
            <div className="space-y-2">
              {data.payablesBreakdown.map((r) => (
                <div key={r.label}>
                  <div className="flex justify-between text-xs">
                    <span>{r.label}</span>
                    <span className="tabular text-muted-foreground">{r.pct}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-surface-elevated mt-1 overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: `${r.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Payroll" description="May cycle">
          <div className="space-y-3">
            <div>
              <div className="text-[11px] uppercase tracking-widest text-muted-foreground">
                Total payroll
              </div>
              <div className="font-display text-2xl font-semibold tabular mt-1">
                {formatMoney(data.payroll.total, "AED")}
              </div>
              <div className="text-[11px] text-muted-foreground">
                {data.payroll.employees} employees / runs {data.payroll.runDate}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-md border border-border p-2">
                <div className="text-[10px] text-muted-foreground">Salaries</div>
                <div className="text-sm font-medium tabular">
                  {Math.round(data.payroll.salaries / 1000)}K
                </div>
              </div>
              <div className="rounded-md border border-border p-2">
                <div className="text-[10px] text-muted-foreground">Bonuses</div>
                <div className="text-sm font-medium tabular">
                  {Math.round(data.payroll.bonuses / 1000)}K
                </div>
              </div>
              <div className="rounded-md border border-border p-2">
                <div className="text-[10px] text-muted-foreground">EOSB</div>
                <div className="text-sm font-medium tabular">
                  {Math.round(data.payroll.eosb / 1000)}K
                </div>
              </div>
            </div>
            <Button variant="outline" size="sm" className="w-full" onClick={() => payout.mutate()}>
              Review payroll
            </Button>
          </div>
        </SectionCard>
      </div>

      <SectionCard
        title="Forecast"
        description="AI-projected positions across the next 30 / 60 / 90 days"
      >
        <div className="grid md:grid-cols-3 gap-4">
          {data.forecast.map((f) => (
            <div key={f.horizon} className="rounded-lg border border-border bg-surface-elevated p-4">
              <div className="flex items-center justify-between text-[11px] text-muted-foreground uppercase tracking-wider">
                <span>{f.horizon}</span>
                <TrendingUp className="h-3.5 w-3.5" />
              </div>
              <div className="font-display text-xl font-semibold tabular mt-2">
                {formatMoney(f.value, "AED")}
              </div>
              <div className={`text-[11px] mt-1 ${f.delta >= 0 ? "text-success" : "text-destructive"}`}>
                {(f.delta * 100).toFixed(1)}% vs today
              </div>
              <div className="text-[11px] text-muted-foreground mt-2">{f.note}</div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
