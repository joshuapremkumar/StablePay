import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { KpiCard, PageHeader, SectionCard, StatusPill } from "@/components/finara/Primitives";
import { formatMoney } from "@/lib/mock";
import { demoApi } from "@/lib/demo";
import { Button } from "@/components/ui/button";
import { Ship, FileSignature, TrendingUp, Anchor, Plus, Check } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/trade-finance")({
  head: () => ({ meta: [{ title: "Trade Finance - Finara OS" }] }),
  component: TradeFinance,
});

function TradeFinance() {
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ["demo", "trade"],
    queryFn: demoApi.getTrade,
  });

  const financing = useMutation({
    mutationFn: demoApi.requestFinancing,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["demo"] });
      toast.success("Simulated a funded trade finance request.");
    },
  });

  if (isLoading) {
    return <div className="p-6 md:p-8">Loading trade finance simulation...</div>;
  }

  if (error || !data) {
    return <div className="p-6 md:p-8">Unable to load the trade finance simulation.</div>;
  }

  return (
    <div className="p-6 md:p-8 max-w-[1600px] mx-auto">
      <PageHeader
        title="Trade Finance Engine"
        description="Tokenized receivables, smart letters of credit, and financing for cross-border trade."
        actions={
          <Button size="sm" onClick={() => financing.mutate()}>
            <Plus className="h-4 w-4 mr-1.5" /> Request financing
          </Button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard label="Trade score" value={`${data.kpis.tradeScore} / 100`} delta={0.04} icon={TrendingUp} hint="Excellent" />
        <KpiCard label="Active LoCs" value={`${data.kpis.activeLocs}`} icon={FileSignature} hint={`${formatMoney(data.kpis.activeLocNotional, "USD")} notional`} />
        <KpiCard label="Listed receivables" value={formatMoney(data.kpis.listedReceivables, "AED")} delta={0.06} icon={Anchor} />
        <KpiCard label="In-transit shipments" value={`${data.kpis.inTransit}`} icon={Ship} hint="Avg ETA 14 days" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <SectionCard
          title="Smart Letters of Credit"
          description="Blockchain-settled trade contracts"
          className="lg:col-span-2"
        >
          <div className="space-y-3">
            {data.locs.map((l) => (
              <div key={l.id} className="rounded-lg border border-border bg-surface-elevated p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="text-sm font-medium">{l.counterparty}</div>
                      <StatusPill status={l.status} />
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">{l.id}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-display text-base font-semibold tabular">
                      {formatMoney(l.amount, l.currency)}
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      milestone {l.milestone} / {l.total}
                    </div>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-4 gap-2">
                  {data.shipmentMilestones.map((m, i) => {
                    const reached = i < l.milestone;
                    return (
                      <div key={m.label} className="flex flex-col items-center">
                        <div
                          className={`h-6 w-6 rounded-full grid place-items-center border ${reached ? "bg-primary border-primary text-primary-foreground" : "bg-surface border-border text-muted-foreground"}`}
                        >
                          {reached ? <Check className="h-3 w-3" /> : <span className="text-[10px]">{i + 1}</span>}
                        </div>
                        <div className="text-[10px] text-muted-foreground mt-1.5 text-center">
                          {m.label}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Financing request" description="Get capital against your receivables">
          <div className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground">Receivable</label>
              <select className="mt-1 w-full h-9 px-2 rounded-md border border-border bg-surface-elevated text-sm">
                {data.receivables.map((r) => (
                  <option key={r.id}>
                    {r.id} / {r.buyer} / {formatMoney(r.amount, r.currency)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Advance rate</label>
              <input
                defaultValue="85%"
                className="mt-1 w-full h-9 px-3 rounded-md border border-border bg-surface-elevated text-sm tabular"
              />
            </div>
            <div className="rounded-lg border border-border bg-surface-elevated p-3 space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Advance</span>
                <span className="tabular font-medium">{formatMoney(data.financingPreview.advance, "AED")}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Discount (60d, 7.2% APR)</span>
                <span className="tabular">{formatMoney(data.financingPreview.discount, "AED")}</span>
              </div>
              <div className="flex justify-between text-sm pt-2 border-t border-border">
                <span className="font-medium">Net to receive</span>
                <span className="tabular font-semibold">{formatMoney(data.financingPreview.net, "AED")}</span>
              </div>
            </div>
            <Button className="w-full" onClick={() => financing.mutate()}>
              Submit request
            </Button>
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Receivables marketplace" description="Tokenized invoices available for funding">
        <div className="-m-5 overflow-auto">
          <table className="w-full text-sm">
            <thead className="text-[11px] uppercase text-muted-foreground tracking-wider">
              <tr className="border-b border-border">
                <th className="text-left font-medium px-5 py-2.5">ID</th>
                <th className="text-left font-medium px-3 py-2.5">Buyer</th>
                <th className="text-right font-medium px-3 py-2.5">Face value</th>
                <th className="text-left font-medium px-3 py-2.5">Maturity</th>
                <th className="text-right font-medium px-3 py-2.5">APR</th>
                <th className="text-left font-medium px-5 py-2.5">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.receivables.map((r) => (
                <tr key={r.id} className="border-b border-border/60 hover:bg-surface-elevated">
                  <td className="px-5 py-3 font-mono text-[12px]">{r.id}</td>
                  <td className="px-3 py-3">{r.buyer}</td>
                  <td className="px-3 py-3 text-right tabular font-medium">
                    {formatMoney(r.amount, r.currency)}
                  </td>
                  <td className="px-3 py-3 text-muted-foreground tabular">{r.maturity}</td>
                  <td className="px-3 py-3 text-right tabular text-electric font-medium">
                    {r.apr.toFixed(1)}%
                  </td>
                  <td className="px-5 py-3">
                    <StatusPill status={r.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}
