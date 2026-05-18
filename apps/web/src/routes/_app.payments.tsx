import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { KpiCard, PageHeader, SectionCard, StatusPill } from "@/components/finara/Primitives";
import { formatMoney } from "@/lib/mock";
import { demoApi } from "@/lib/demo";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CreditCard,
  QrCode,
  Link2,
  RefreshCcw,
  Plus,
  Download,
  BarChart3,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/payments")({
  head: () => ({ meta: [{ title: "Merchant Payments - Finara OS" }] }),
  component: Payments,
});

function Payments() {
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ["demo", "payments"],
    queryFn: demoApi.getPayments,
  });

  const createLink = useMutation({
    mutationFn: demoApi.createPaymentLink,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["demo"] });
      toast.success("Created a simulated payment link.");
    },
  });

  const settlePayment = useMutation({
    mutationFn: demoApi.simulatePayment,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["demo"] });
      toast.success("Simulated a settled payment and treasury update.");
    },
  });

  if (isLoading) {
    return <div className="p-6 md:p-8">Loading payments simulation...</div>;
  }

  if (error || !data) {
    return <div className="p-6 md:p-8">Unable to load the payments simulation.</div>;
  }

  return (
    <div className="p-6 md:p-8 max-w-[1600px] mx-auto">
      <PageHeader
        title="Merchant Payments"
        description="Accept payments across cards, bank rails, QR, and stablecoins. Settle to any treasury account."
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => settlePayment.mutate()}>
              <Download className="h-4 w-4 mr-1.5" /> Simulate settlement
            </Button>
            <Button size="sm" onClick={() => createLink.mutate()}>
              <Plus className="h-4 w-4 mr-1.5" /> New payment link
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard label="Today's volume" value={formatMoney(data.kpis.todaysVolume, "AED")} delta={0.124} icon={BarChart3} />
        <KpiCard label="Settled (7d)" value={formatMoney(data.kpis.settled7d, "AED")} delta={0.083} icon={CreditCard} />
        <KpiCard label="Pending" value={formatMoney(data.kpis.pending, "AED")} delta={-0.021} icon={RefreshCcw} />
        <KpiCard label="Avg ticket" value={formatMoney(data.kpis.avgTicket, "AED")} delta={0.034} icon={Wallet} />
      </div>

      <Tabs defaultValue="links" className="space-y-4">
        <TabsList>
          <TabsTrigger value="links">
            <Link2 className="h-3.5 w-3.5 mr-1.5" /> Payment Links
          </TabsTrigger>
          <TabsTrigger value="qr">
            <QrCode className="h-3.5 w-3.5 mr-1.5" /> QR
          </TabsTrigger>
          <TabsTrigger value="txn">
            <CreditCard className="h-3.5 w-3.5 mr-1.5" /> Transactions
          </TabsTrigger>
          <TabsTrigger value="refunds">
            <RefreshCcw className="h-3.5 w-3.5 mr-1.5" /> Refunds
          </TabsTrigger>
        </TabsList>

        <TabsContent value="links">
          <SectionCard title="Active payment links">
            <div className="-m-5 overflow-auto">
              <table className="w-full text-sm">
                <thead className="text-[11px] uppercase text-muted-foreground tracking-wider">
                  <tr className="border-b border-border">
                    <th className="text-left font-medium px-5 py-2.5">Link</th>
                    <th className="text-right font-medium px-3 py-2.5">Amount</th>
                    <th className="text-right font-medium px-3 py-2.5">Clicks</th>
                    <th className="text-left font-medium px-3 py-2.5">Created</th>
                    <th className="text-left font-medium px-5 py-2.5">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.paymentLinks.map((p) => (
                    <tr key={p.id} className="border-b border-border/60 hover:bg-surface-elevated">
                      <td className="px-5 py-3">
                        <div className="font-medium">{p.name}</div>
                        <div className="text-[11px] text-muted-foreground">
                          pay.finara.os/{p.id.toLowerCase()}
                        </div>
                      </td>
                      <td className="px-3 py-3 text-right tabular font-medium">
                        {formatMoney(p.amount, p.currency)}
                      </td>
                      <td className="px-3 py-3 text-right tabular text-muted-foreground">
                        {p.clicks}
                      </td>
                      <td className="px-3 py-3 text-muted-foreground tabular">{p.created}</td>
                      <td className="px-5 py-3">
                        <StatusPill status={p.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionCard>
        </TabsContent>

        <TabsContent value="qr">
          <div className="grid md:grid-cols-2 gap-6">
            <SectionCard
              title="Generate QR"
              description="One-tap acceptance for in-store and field collections"
            >
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-muted-foreground">Amount</label>
                  <div className="mt-1 flex gap-2">
                    <select className="h-9 px-2 rounded-md border border-border bg-surface-elevated text-sm">
                      <option>AED</option>
                      <option>USD</option>
                      <option>EUR</option>
                      <option>USDC</option>
                    </select>
                    <input
                      defaultValue="1,240.00"
                      className="flex-1 h-9 px-3 rounded-md border border-border bg-surface-elevated text-sm tabular"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Reference</label>
                  <input
                    defaultValue="ORDER-22841"
                    className="mt-1 w-full h-9 px-3 rounded-md border border-border bg-surface-elevated text-sm"
                  />
                </div>
                <Button className="w-full" onClick={() => createLink.mutate()}>
                  Generate QR
                </Button>
              </div>
            </SectionCard>
            <SectionCard title="Preview">
              <div className="flex flex-col items-center justify-center py-6">
                <div className="h-44 w-44 rounded-xl bg-gradient-to-br from-surface-elevated to-surface border border-border grid place-items-center">
                  <div className="grid grid-cols-8 gap-0.5 p-3">
                    {Array.from({ length: 64 }).map((_, i) => (
                      <div
                        key={i}
                        className="h-3 w-3 rounded-[2px]"
                        style={{
                          background:
                            i % 3 === 0 || i % 5 === 0 ? "var(--color-foreground)" : "transparent",
                        }}
                      />
                    ))}
                  </div>
                </div>
                <div className="mt-4 text-sm font-medium tabular">AED 1,240.00</div>
                <div className="text-[11px] text-muted-foreground">
                  ORDER-22841 / expires in 10 min
                </div>
              </div>
            </SectionCard>
          </div>
        </TabsContent>

        <TabsContent value="txn">
          <SectionCard title="Transactions" description="Last 30 days / all rails">
            <div className="-m-5 overflow-auto">
              <table className="w-full text-sm">
                <thead className="text-[11px] uppercase text-muted-foreground tracking-wider">
                  <tr className="border-b border-border">
                    <th className="text-left font-medium px-5 py-2.5">ID</th>
                    <th className="text-left font-medium px-3 py-2.5">Customer</th>
                    <th className="text-left font-medium px-3 py-2.5">Rail</th>
                    <th className="text-right font-medium px-3 py-2.5">Amount</th>
                    <th className="text-left font-medium px-3 py-2.5">Date</th>
                    <th className="text-left font-medium px-5 py-2.5">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.transactions.map((t) => (
                    <tr key={t.id} className="border-b border-border/60 hover:bg-surface-elevated">
                      <td className="px-5 py-3 font-mono text-[12px]">{t.id}</td>
                      <td className="px-3 py-3">{t.customer}</td>
                      <td className="px-3 py-3 text-muted-foreground">{t.rail}</td>
                      <td className="px-3 py-3 text-right tabular font-medium">
                        {formatMoney(t.amount, t.currency)}
                      </td>
                      <td className="px-3 py-3 text-muted-foreground tabular">{t.date}</td>
                      <td className="px-5 py-3">
                        <StatusPill status={t.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionCard>
        </TabsContent>

        <TabsContent value="refunds">
          <SectionCard
            title="Refunds"
            description={
              data.refunds.length
                ? `Showing ${data.refunds.length} simulated refund records`
                : "No active refund requests"
            }
          >
            <div className="py-12 text-center text-sm text-muted-foreground">
              <RefreshCcw className="h-8 w-8 mx-auto mb-3 text-muted-foreground/60" />
              {data.refunds.length
                ? "Refund simulation data is available through the transaction timeline."
                : "All transactions settled cleanly in the last 30 days."}
            </div>
          </SectionCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}
