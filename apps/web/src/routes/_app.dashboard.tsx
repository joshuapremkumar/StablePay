import { createFileRoute, Link } from "@tanstack/react-router";
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
  ExternalLink,
  CreditCard,
  Ship,
  Users,
  BarChart3,
  Zap,
  Globe,
  Lock,
  Activity,
  DollarSign,
  TrendingDown,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export const Route = createFileRoute("/_app/dashboard")({
  head: () => ({ meta: [{ title: "Executive Dashboard - Finara OS" }] }),
  component: Dashboard,
});

function Dashboard() {
  const queryClient = useQueryClient();
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const { data, isLoading, error } = useQuery({
    queryKey: ["demo", "dashboard"],
    queryFn: demoApi.getDashboard,
    refetchInterval: autoRefresh ? 5000 : false, // Auto-refresh every 5 seconds
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
          ? "✅ Merchant payment settled successfully"
          : kind === "payout"
            ? "✅ Supplier payout initiated"
            : "✅ Trade financing approved",
      );
    },
  });

  // Simulate real-time updates
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        queryClient.invalidateQueries({ queryKey: ["demo", "dashboard"] });
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, queryClient]);

  if (isLoading) {
    return (
      <div className="p-6 md:p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your financial dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 md:p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <p className="text-muted-foreground">Unable to load dashboard. Please refresh.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-[1800px] mx-auto">
      {/* Header with Live Status */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Hello StablePay User</h1>
            <p className="text-muted-foreground mt-1">
              Unified view of treasury, payables, and merchant operations
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="gap-2">
              <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
              Live Data
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => action.mutate("payment")}
              disabled={action.isPending}
            >
              <Zap className="h-4 w-4 mr-1.5" /> Simulate Transaction
            </Button>
          </div>
        </div>
      </div>

      {/* Interactive KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="cursor-pointer"
        >
          <Dialog>
            <DialogTrigger asChild>
              <div className="rounded-xl border border-border bg-gradient-to-br from-card to-card/50 p-6 hover:shadow-lg transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary grid place-items-center">
                    <Wallet className="h-5 w-5" />
                  </div>
                  <Badge className="bg-success/10 text-success border-success/20">
                    +{(data.kpis.momCashflow * 100).toFixed(1)}%
                  </Badge>
                </div>
                <div className="text-2xl font-bold tabular">
                  {formatMoney(data.kpis.treasuryBalance, "AED")}
                </div>
                <div className="text-sm text-muted-foreground mt-1">Treasury Balance</div>
                <div className="flex items-center gap-1 mt-3 text-xs text-muted-foreground">
                  <TrendingUp className="h-3 w-3" />
                  vs last month
                </div>
              </div>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Treasury Balance Details</DialogTitle>
                <DialogDescription>
                  Comprehensive breakdown of your treasury position
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg border">
                    <div className="text-sm text-muted-foreground">Total Balance</div>
                    <div className="text-2xl font-bold mt-1">
                      {formatMoney(data.kpis.treasuryBalance, "AED")}
                    </div>
                  </div>
                  <div className="p-4 rounded-lg border">
                    <div className="text-sm text-muted-foreground">Available</div>
                    <div className="text-2xl font-bold mt-1 text-success">
                      {formatMoney(data.kpis.treasuryBalance * 0.85, "AED")}
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Liquid Assets</span>
                    <span className="font-medium">78%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-success w-[78%]" />
                  </div>
                </div>
                <Button className="w-full" asChild>
                  <Link to="/treasury">View Full Treasury Dashboard</Link>
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="cursor-pointer"
        >
          <Dialog>
            <DialogTrigger asChild>
              <div className="rounded-xl border border-border bg-gradient-to-br from-card to-card/50 p-6 hover:shadow-lg transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-10 w-10 rounded-lg bg-electric/10 text-electric grid place-items-center">
                    <Coins className="h-5 w-5" />
                  </div>
                  <Badge className="bg-electric/10 text-electric border-electric/20">
                    +4.1%
                  </Badge>
                </div>
                <div className="text-2xl font-bold tabular">
                  {formatMoney(data.kpis.stablecoin, "USDC")}
                </div>
                <div className="text-sm text-muted-foreground mt-1">Stablecoin Reserve</div>
                <div className="flex items-center gap-1 mt-3 text-xs text-muted-foreground">
                  <Activity className="h-3 w-3" />
                  USDC on Polygon
                </div>
              </div>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Stablecoin Holdings</DialogTitle>
                <DialogDescription>Your on-chain treasury position</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="p-4 rounded-lg border bg-electric/5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">USDC Balance</span>
                    <Badge variant="outline">Polygon</Badge>
                  </div>
                  <div className="text-3xl font-bold">{formatMoney(data.kpis.stablecoin, "USDC")}</div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Recent Transactions</span>
                    <span className="text-success">+12 today</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Avg. Settlement Time</span>
                    <span className="font-medium">3.2s</span>
                  </div>
                </div>
                <Button className="w-full" variant="outline">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View on Blockchain Explorer
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="cursor-pointer"
        >
          <div className="rounded-xl border border-border bg-gradient-to-br from-card to-card/50 p-6 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="h-10 w-10 rounded-lg bg-warning/10 text-warning grid place-items-center">
                <Banknote className="h-5 w-5" />
              </div>
              <Badge className="bg-warning/10 text-warning border-warning/20">+1.8%</Badge>
            </div>
            <div className="text-2xl font-bold tabular">{formatMoney(data.kpis.fiat, "AED")}</div>
            <div className="text-sm text-muted-foreground mt-1">Fiat Holdings</div>
            <div className="flex items-center gap-1 mt-3 text-xs text-muted-foreground">
              <Globe className="h-3 w-3" />
              3 currencies
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="cursor-pointer"
        >
          <div className="rounded-xl border border-border bg-gradient-to-br from-card to-card/50 p-6 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="h-10 w-10 rounded-lg bg-success/10 text-success grid place-items-center">
                <TrendingUp className="h-5 w-5" />
              </div>
              <Badge className="bg-success/10 text-success border-success/20">+9.2%</Badge>
            </div>
            <div className="text-2xl font-bold tabular">
              {formatMoney(data.kpis.receivables30d - data.kpis.payables30d, "AED")}
            </div>
            <div className="text-sm text-muted-foreground mt-1">Net 30d Cashflow</div>
            <div className="flex items-center gap-1 mt-3 text-xs text-muted-foreground">
              <BarChart3 className="h-3 w-3" />
              receivables - payables
            </div>
          </div>
        </motion.div>
      </div>

      {/* Quick Action Cards - Highly Interactive */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Link to="/payments">
            <div className="rounded-xl border border-border bg-gradient-to-br from-primary/5 to-primary/10 p-6 hover:shadow-lg transition-all cursor-pointer group">
              <div className="flex items-center justify-between mb-3">
                <div className="h-12 w-12 rounded-lg bg-primary text-primary-foreground grid place-items-center group-hover:scale-110 transition-transform">
                  <CreditCard className="h-6 w-6" />
                </div>
                <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <div className="font-semibold text-lg mb-1">Payments</div>
              <div className="text-sm text-muted-foreground mb-3">
                Process merchant settlements
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  <Activity className="h-3 w-3 mr-1" />
                  Live
                </Badge>
                <span className="text-xs text-muted-foreground">234 today</span>
              </div>
            </div>
          </Link>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Link to="/trade-finance">
            <div className="rounded-xl border border-border bg-gradient-to-br from-electric/5 to-electric/10 p-6 hover:shadow-lg transition-all cursor-pointer group">
              <div className="flex items-center justify-between mb-3">
                <div className="h-12 w-12 rounded-lg bg-electric text-primary-foreground grid place-items-center group-hover:scale-110 transition-transform">
                  <Ship className="h-6 w-6" />
                </div>
                <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-electric transition-colors" />
              </div>
              <div className="font-semibold text-lg mb-1">Trade Finance</div>
              <div className="text-sm text-muted-foreground mb-3">
                Letters of credit & financing
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Active
                </Badge>
                <span className="text-xs text-muted-foreground">12 open</span>
              </div>
            </div>
          </Link>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Link to="/suppliers">
            <div className="rounded-xl border border-border bg-gradient-to-br from-warning/5 to-warning/10 p-6 hover:shadow-lg transition-all cursor-pointer group">
              <div className="flex items-center justify-between mb-3">
                <div className="h-12 w-12 rounded-lg bg-warning text-primary-foreground grid place-items-center group-hover:scale-110 transition-transform">
                  <Users className="h-6 w-6" />
                </div>
                <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-warning transition-colors" />
              </div>
              <div className="font-semibold text-lg mb-1">Suppliers</div>
              <div className="text-sm text-muted-foreground mb-3">
                Manage vendor relationships
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  <Clock className="h-3 w-3 mr-1" />
                  Pending
                </Badge>
                <span className="text-xs text-muted-foreground">8 approvals</span>
              </div>
            </div>
          </Link>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Link to="/copilot">
            <div className="rounded-xl border border-border bg-gradient-to-br from-success/5 to-success/10 p-6 hover:shadow-lg transition-all cursor-pointer group">
              <div className="flex items-center justify-between mb-3">
                <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-electric to-primary text-primary-foreground grid place-items-center group-hover:scale-110 transition-transform">
                  <Sparkles className="h-6 w-6" />
                </div>
                <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-success transition-colors" />
              </div>
              <div className="font-semibold text-lg mb-1">AI Copilot</div>
              <div className="text-sm text-muted-foreground mb-3">
                Financial intelligence assistant
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs bg-gradient-to-r from-electric/10 to-primary/10">
                  <Sparkles className="h-3 w-3 mr-1" />
                  AI Powered
                </Badge>
              </div>
            </div>
          </Link>
        </motion.div>
      </div>

      {/* Charts Section */}
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

      {/* Tables and Insights */}
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
                  <motion.tr
                    key={p.id}
                    className="border-b border-border/60 hover:bg-surface-elevated cursor-pointer"
                    whileHover={{ backgroundColor: "rgba(var(--surface-elevated), 0.5)" }}
                  >
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
                  </motion.tr>
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
              <motion.div
                key={a.id}
                className="rounded-lg border border-border bg-surface-elevated p-3 hover:shadow-md transition-all cursor-pointer"
                whileHover={{ scale: 1.02 }}
              >
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
              </motion.div>
            ))}
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => action.mutate("financing")}
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Ask AI Copilot
            </Button>
          </div>
        </SectionCard>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SectionCard title="Recent merchant settlements" description="Today">
          <div className="space-y-2">
            {data.settlements.map((s) => (
              <motion.div
                key={s.id}
                className="flex items-center gap-3 py-2 border-b border-border/60 last:border-0 hover:bg-surface-elevated px-2 -mx-2 rounded cursor-pointer"
                whileHover={{ x: 4 }}
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
              </motion.div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Quick actions" description="Most-used CFO workflows">
          <div className="grid grid-cols-2 gap-3">
            {[
              {
                icon: Send,
                label: "Pay supplier",
                desc: "Single or batch",
                kind: "payout" as const,
                color: "primary",
              },
              {
                icon: FileText,
                label: "Issue invoice",
                desc: "With payment link",
                kind: "payment" as const,
                color: "electric",
              },
              {
                icon: ShieldAlert,
                label: "Smart LoC",
                desc: "Trade finance",
                kind: "financing" as const,
                color: "warning",
              },
              {
                icon: ArrowRightLeft,
                label: "Treasury transfer",
                desc: "Across currencies",
                kind: "payment" as const,
                color: "success",
              },
            ].map((a) => (
              <motion.button
                key={a.label}
                className="text-left p-4 rounded-lg border border-border bg-surface-elevated hover:border-primary/40 hover:bg-primary/5 transition-colors group"
                onClick={() => action.mutate(a.kind)}
                disabled={action.isPending}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <a.icon className="h-5 w-5 text-electric mb-3 group-hover:scale-110 transition-transform" />
                <div className="text-sm font-medium">{a.label}</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">{a.desc}</div>
              </motion.button>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

// Made with Bob
