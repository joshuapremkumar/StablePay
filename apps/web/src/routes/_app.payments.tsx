import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { KpiCard, PageHeader, SectionCard, StatusPill } from "@/components/finara/Primitives";
import { formatMoney } from "@/lib/mock";
import { demoApi } from "@/lib/demo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  CreditCard,
  QrCode,
  Link2,
  RefreshCcw,
  Plus,
  Download,
  BarChart3,
  Wallet,
  ExternalLink,
  Copy,
  CheckCircle2,
  TrendingUp,
  Activity,
  Zap,
  DollarSign,
  Clock,
  ArrowUpRight,
  Filter,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useState } from "react";

export const Route = createFileRoute("/_app/payments")({
  head: () => ({ meta: [{ title: "Merchant Payments - Finara OS" }] }),
  component: Payments,
});

function Payments() {
  const queryClient = useQueryClient();
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["demo", "payments"],
    queryFn: demoApi.getPayments,
    refetchInterval: 5000, // Auto-refresh
  });

  const createLink = useMutation({
    mutationFn: demoApi.createPaymentLink,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["demo"] });
      toast.success("✅ Payment link created successfully!");
    },
  });

  const settlePayment = useMutation({
    mutationFn: demoApi.simulatePayment,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["demo"] });
      toast.success("✅ Payment settled and treasury updated!");
    },
  });

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(id);
    toast.success("Link copied to clipboard!");
    setTimeout(() => setCopiedLink(null), 2000);
  };

  if (isLoading) {
    return (
      <div className="p-6 md:p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading payments data...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return <div className="p-6 md:p-8">Unable to load the payments simulation.</div>;
  }

  return (
    <div className="p-6 md:p-8 max-w-[1800px] mx-auto">
      <PageHeader
        title="Merchant Payments"
        description="Accept payments across cards, bank rails, QR, and stablecoins. Settle to any treasury account."
        actions={
          <>
            <Badge variant="outline" className="gap-2">
              <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
              Live Processing
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => settlePayment.mutate()}
              disabled={settlePayment.isPending}
            >
              <Zap className="h-4 w-4 mr-1.5" /> Simulate Settlement
            </Button>
            <Button size="sm" onClick={() => createLink.mutate()} disabled={createLink.isPending}>
              <Plus className="h-4 w-4 mr-1.5" /> New Payment Link
            </Button>
          </>
        }
      />

      {/* Enhanced KPI Cards with Animations */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <div className="rounded-xl border border-border bg-gradient-to-br from-primary/5 to-primary/10 p-6 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary grid place-items-center">
                <BarChart3 className="h-5 w-5" />
              </div>
              <Badge className="bg-success/10 text-success border-success/20">+12.4%</Badge>
            </div>
            <div className="text-2xl font-bold tabular">{formatMoney(data.kpis.todaysVolume, "AED")}</div>
            <div className="text-sm text-muted-foreground mt-1">Today's Volume</div>
            <div className="flex items-center gap-1 mt-3 text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3" />
              vs yesterday
            </div>
          </div>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <div className="rounded-xl border border-border bg-gradient-to-br from-success/5 to-success/10 p-6 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="h-10 w-10 rounded-lg bg-success/10 text-success grid place-items-center">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <Badge className="bg-success/10 text-success border-success/20">+8.3%</Badge>
            </div>
            <div className="text-2xl font-bold tabular">{formatMoney(data.kpis.settled7d, "AED")}</div>
            <div className="text-sm text-muted-foreground mt-1">Settled (7d)</div>
            <div className="flex items-center gap-1 mt-3 text-xs text-muted-foreground">
              <Activity className="h-3 w-3" />
              234 transactions
            </div>
          </div>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <div className="rounded-xl border border-border bg-gradient-to-br from-warning/5 to-warning/10 p-6 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="h-10 w-10 rounded-lg bg-warning/10 text-warning grid place-items-center">
                <Clock className="h-5 w-5" />
              </div>
              <Badge className="bg-warning/10 text-warning border-warning/20">-2.1%</Badge>
            </div>
            <div className="text-2xl font-bold tabular">{formatMoney(data.kpis.pending, "AED")}</div>
            <div className="text-sm text-muted-foreground mt-1">Pending</div>
            <div className="flex items-center gap-1 mt-3 text-xs text-muted-foreground">
              <RefreshCcw className="h-3 w-3" />
              12 in queue
            </div>
          </div>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <div className="rounded-xl border border-border bg-gradient-to-br from-electric/5 to-electric/10 p-6 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="h-10 w-10 rounded-lg bg-electric/10 text-electric grid place-items-center">
                <DollarSign className="h-5 w-5" />
              </div>
              <Badge className="bg-electric/10 text-electric border-electric/20">+3.4%</Badge>
            </div>
            <div className="text-2xl font-bold tabular">{formatMoney(data.kpis.avgTicket, "AED")}</div>
            <div className="text-sm text-muted-foreground mt-1">Avg Ticket</div>
            <div className="flex items-center gap-1 mt-3 text-xs text-muted-foreground">
              <Wallet className="h-3 w-3" />
              per transaction
            </div>
          </div>
        </motion.div>
      </div>

      {/* Enhanced Tabs with Better Styling */}
      <Tabs defaultValue="links" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList className="bg-surface-elevated">
            <TabsTrigger value="links" className="gap-2">
              <Link2 className="h-3.5 w-3.5" /> Payment Links
            </TabsTrigger>
            <TabsTrigger value="qr" className="gap-2">
              <QrCode className="h-3.5 w-3.5" /> QR Codes
            </TabsTrigger>
            <TabsTrigger value="txn" className="gap-2">
              <CreditCard className="h-3.5 w-3.5" /> Transactions
            </TabsTrigger>
            <TabsTrigger value="refunds" className="gap-2">
              <RefreshCcw className="h-3.5 w-3.5" /> Refunds
            </TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-1.5" /> Filter
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-1.5" /> Export
            </Button>
          </div>
        </div>

        <TabsContent value="links">
          <SectionCard
            title="Active payment links"
            description="Click any link to view details or copy"
          >
            <div className="-m-5 overflow-auto">
              <table className="w-full text-sm">
                <thead className="text-[11px] uppercase text-muted-foreground tracking-wider">
                  <tr className="border-b border-border">
                    <th className="text-left font-medium px-5 py-2.5">Link</th>
                    <th className="text-right font-medium px-3 py-2.5">Amount</th>
                    <th className="text-right font-medium px-3 py-2.5">Clicks</th>
                    <th className="text-left font-medium px-3 py-2.5">Created</th>
                    <th className="text-left font-medium px-5 py-2.5">Status</th>
                    <th className="text-right font-medium px-5 py-2.5">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.paymentLinks.map((p) => (
                    <motion.tr
                      key={p.id}
                      className="border-b border-border/60 hover:bg-surface-elevated cursor-pointer"
                      whileHover={{ backgroundColor: "rgba(var(--surface-elevated), 0.5)" }}
                    >
                      <td className="px-5 py-3">
                        <div className="font-medium">{p.name}</div>
                        <div className="text-[11px] text-muted-foreground flex items-center gap-2">
                          pay.finara.os/{p.id.toLowerCase()}
                          <button
                            onClick={() =>
                              copyToClipboard(`https://pay.finara.os/${p.id.toLowerCase()}`, p.id)
                            }
                            className="hover:text-primary transition-colors"
                          >
                            {copiedLink === p.id ? (
                              <CheckCircle2 className="h-3 w-3 text-success" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-right tabular font-medium">
                        {formatMoney(p.amount, p.currency)}
                      </td>
                      <td className="px-3 py-3 text-right tabular text-muted-foreground">
                        <Badge variant="outline" className="text-xs">
                          {p.clicks} views
                        </Badge>
                      </td>
                      <td className="px-3 py-3 text-muted-foreground tabular">{p.created}</td>
                      <td className="px-5 py-3">
                        <StatusPill status={p.status} />
                      </td>
                      <td className="px-5 py-3 text-right">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <ExternalLink className="h-3.5 w-3.5" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Payment Link Details</DialogTitle>
                              <DialogDescription>{p.name}</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 rounded-lg border">
                                  <div className="text-sm text-muted-foreground">Amount</div>
                                  <div className="text-2xl font-bold mt-1">
                                    {formatMoney(p.amount, p.currency)}
                                  </div>
                                </div>
                                <div className="p-4 rounded-lg border">
                                  <div className="text-sm text-muted-foreground">Clicks</div>
                                  <div className="text-2xl font-bold mt-1">{p.clicks}</div>
                                </div>
                              </div>
                              <div className="p-4 rounded-lg border bg-surface-elevated">
                                <div className="text-sm font-medium mb-2">Payment URL</div>
                                <div className="flex items-center gap-2">
                                  <code className="flex-1 text-xs bg-background p-2 rounded">
                                    https://pay.finara.os/{p.id.toLowerCase()}
                                  </code>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                      copyToClipboard(
                                        `https://pay.finara.os/${p.id.toLowerCase()}`,
                                        p.id
                                      )
                                    }
                                  >
                                    <Copy className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button className="flex-1" variant="outline">
                                  View Analytics
                                </Button>
                                <Button className="flex-1">Share Link</Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionCard>
        </TabsContent>

        <TabsContent value="qr">
          <div className="grid md:grid-cols-2 gap-6">
            <SectionCard
              title="Generate QR Code"
              description="One-tap acceptance for in-store and field collections"
            >
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-muted-foreground font-medium">Amount</label>
                  <div className="mt-1 flex gap-2">
                    <select className="h-10 px-3 rounded-lg border border-border bg-surface-elevated text-sm hover:border-primary/40 transition-colors">
                      <option>AED</option>
                      <option>USD</option>
                      <option>EUR</option>
                      <option>USDC</option>
                    </select>
                    <input
                      defaultValue="1,240.00"
                      className="flex-1 h-10 px-3 rounded-lg border border-border bg-surface-elevated text-sm tabular hover:border-primary/40 transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground font-medium">Reference</label>
                  <input
                    defaultValue="ORDER-22841"
                    className="mt-1 w-full h-10 px-3 rounded-lg border border-border bg-surface-elevated text-sm hover:border-primary/40 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground font-medium">Expiry</label>
                  <select className="mt-1 w-full h-10 px-3 rounded-lg border border-border bg-surface-elevated text-sm hover:border-primary/40 transition-colors">
                    <option>10 minutes</option>
                    <option>30 minutes</option>
                    <option>1 hour</option>
                    <option>24 hours</option>
                  </select>
                </div>
                <Button
                  className="w-full"
                  onClick={() => createLink.mutate()}
                  disabled={createLink.isPending}
                >
                  <QrCode className="h-4 w-4 mr-2" />
                  Generate QR Code
                </Button>
              </div>
            </SectionCard>
            <SectionCard title="QR Preview" description="Scan to test payment flow">
              <div className="flex flex-col items-center justify-center py-6">
                <motion.div
                  className="h-48 w-48 rounded-xl bg-gradient-to-br from-surface-elevated to-surface border border-border grid place-items-center shadow-lg"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
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
                </motion.div>
                <div className="mt-4 text-lg font-bold tabular">AED 1,240.00</div>
                <div className="text-sm text-muted-foreground">ORDER-22841</div>
                <Badge variant="outline" className="mt-2 gap-1">
                  <Clock className="h-3 w-3" />
                  Expires in 10 min
                </Badge>
                <div className="flex gap-2 mt-4">
                  <Button variant="outline" size="sm">
                    <Download className="h-3.5 w-3.5 mr-1.5" />
                    Download
                  </Button>
                  <Button variant="outline" size="sm">
                    <Copy className="h-3.5 w-3.5 mr-1.5" />
                    Copy Link
                  </Button>
                </div>
              </div>
            </SectionCard>
          </div>
        </TabsContent>

        <TabsContent value="txn">
          <SectionCard
            title="Recent Transactions"
            description="Last 30 days / all payment rails"
            actions={
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            }
          >
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
                    <th className="text-right font-medium px-5 py-2.5">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.transactions.map((t) => (
                    <motion.tr
                      key={t.id}
                      className="border-b border-border/60 hover:bg-surface-elevated cursor-pointer"
                      whileHover={{ x: 4 }}
                    >
                      <td className="px-5 py-3 font-mono text-[12px]">{t.id}</td>
                      <td className="px-3 py-3">{t.customer}</td>
                      <td className="px-3 py-3">
                        <Badge variant="outline" className="text-xs">
                          {t.rail}
                        </Badge>
                      </td>
                      <td className="px-3 py-3 text-right tabular font-medium">
                        {formatMoney(t.amount, t.currency)}
                      </td>
                      <td className="px-3 py-3 text-muted-foreground tabular">{t.date}</td>
                      <td className="px-5 py-3">
                        <StatusPill status={t.status} />
                      </td>
                      <td className="px-5 py-3 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedTransaction(t)}
                        >
                          <ArrowUpRight className="h-3.5 w-3.5" />
                        </Button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionCard>
        </TabsContent>

        <TabsContent value="refunds">
          <SectionCard
            title="Refunds & Disputes"
            description={
              data.refunds.length
                ? `Showing ${data.refunds.length} refund records`
                : "No active refund requests"
            }
          >
            <div className="py-16 text-center">
              <div className="h-16 w-16 rounded-full bg-success/10 text-success grid place-items-center mx-auto mb-4">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <div className="text-lg font-medium mb-2">All Clear!</div>
              <div className="text-sm text-muted-foreground max-w-md mx-auto">
                {data.refunds.length
                  ? "Refund simulation data is available through the transaction timeline."
                  : "All transactions settled cleanly in the last 30 days. No refunds or disputes."}
              </div>
              <Button variant="outline" className="mt-6">
                View Transaction History
              </Button>
            </div>
          </SectionCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Made with Bob
