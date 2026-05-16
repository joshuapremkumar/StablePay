import { createFileRoute } from "@tanstack/react-router";
import { KpiCard, PageHeader, SectionCard } from "@/components/finara/Primitives";
import { AllocationDonut, CashFlowChart } from "@/components/finara/Charts";
import { allocation, cashflow, currencyBalances, formatMoney, kpis } from "@/lib/mock";
import { Button } from "@/components/ui/button";
import { ArrowRightLeft, TrendingUp, Wallet, Coins, DollarSign } from "lucide-react";

export const Route = createFileRoute("/_app/treasury")({
  head: () => ({ meta: [{ title: "Treasury & Financial Ops · Finara OS" }] }),
  component: Treasury,
});

function Treasury() {
  return (
    <div className="p-6 md:p-8 max-w-[1600px] mx-auto">
      <PageHeader
        title="Treasury & Financial Ops"
        description="Multi-currency balances, allocation, and forecasting across the corporate treasury."
        actions={
          <Button size="sm">
            <ArrowRightLeft className="h-4 w-4 mr-1.5" /> New transfer
          </Button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {currencyBalances.map((c) => (
          <KpiCard
            key={c.code}
            label={`${c.code} · ${c.label}`}
            value={formatMoney(c.balance, c.code)}
            delta={c.change}
            icon={c.code === "USDC" ? Coins : c.code === "USD" ? DollarSign : Wallet}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <SectionCard title="Cash position" description="90-day rolling" className="lg:col-span-2">
          <CashFlowChart data={cashflow} />
        </SectionCard>
        <SectionCard title="Allocation" description="By account">
          <AllocationDonut data={allocation} />
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <SectionCard title="Stablecoin ↔ Fiat" description="On-demand corporate conversion">
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
            <Button className="w-full">Confirm conversion</Button>
          </div>
        </SectionCard>

        <SectionCard title="Accounts payable" description="Next 30 days" className="lg:col-span-1">
          <div className="space-y-4">
            <div>
              <div className="text-[11px] uppercase tracking-widest text-muted-foreground">
                Outstanding
              </div>
              <div className="font-display text-2xl font-semibold tabular mt-1">
                {formatMoney(kpis.payables30d, "AED")}
              </div>
            </div>
            <div className="space-y-2">
              {[
                { label: "Logistics", pct: 38 },
                { label: "Components", pct: 28 },
                { label: "SaaS & Cloud", pct: 14 },
                { label: "Distribution", pct: 20 },
              ].map((r) => (
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
                {formatMoney(842_400, "AED")}
              </div>
              <div className="text-[11px] text-muted-foreground">42 employees · runs May 25</div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-md border border-border p-2">
                <div className="text-[10px] text-muted-foreground">Salaries</div>
                <div className="text-sm font-medium tabular">724K</div>
              </div>
              <div className="rounded-md border border-border p-2">
                <div className="text-[10px] text-muted-foreground">Bonuses</div>
                <div className="text-sm font-medium tabular">82K</div>
              </div>
              <div className="rounded-md border border-border p-2">
                <div className="text-[10px] text-muted-foreground">EOSB</div>
                <div className="text-sm font-medium tabular">36K</div>
              </div>
            </div>
            <Button variant="outline" size="sm" className="w-full">
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
          {[
            { h: "30 days", v: 11_240_000, d: -0.041, note: "Below current — payroll + AP cycle" },
            { h: "60 days", v: 12_980_000, d: 0.042, note: "Receivables Q2 net positive" },
            { h: "90 days", v: 14_120_000, d: 0.131, note: "Trade financing inflow expected" },
          ].map((f) => (
            <div key={f.h} className="rounded-lg border border-border bg-surface-elevated p-4">
              <div className="flex items-center justify-between text-[11px] text-muted-foreground uppercase tracking-wider">
                <span>{f.h}</span>
                <TrendingUp className="h-3.5 w-3.5" />
              </div>
              <div className="font-display text-xl font-semibold tabular mt-2">
                {formatMoney(f.v, "AED")}
              </div>
              <div className={`text-[11px] mt-1 ${f.d >= 0 ? "text-success" : "text-destructive"}`}>
                {(f.d * 100).toFixed(1)}% vs today
              </div>
              <div className="text-[11px] text-muted-foreground mt-2">{f.note}</div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
