import { createFileRoute } from "@tanstack/react-router";
import { KpiCard, PageHeader, SectionCard, StatusPill } from "@/components/finara/Primitives";
import { approvals, formatMoney, suppliers } from "@/lib/mock";
import { Button } from "@/components/ui/button";
import { Upload, Plus, Users, Clock, Wallet, AlertTriangle, Check } from "lucide-react";

export const Route = createFileRoute("/_app/suppliers")({
  head: () => ({ meta: [{ title: "Suppliers & Accounts Payable · Finara OS" }] }),
  component: Suppliers,
});

function Suppliers() {
  return (
    <div className="p-6 md:p-8 max-w-[1600px] mx-auto">
      <PageHeader
        title="Suppliers & Accounts Payable"
        description="Centralize vendor relationships, invoice approvals, and bulk payouts."
        actions={
          <>
            <Button variant="outline" size="sm">
              <Upload className="h-4 w-4 mr-1.5" /> Upload invoice
            </Button>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1.5" /> Add supplier
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard label="Active suppliers" value="124" delta={0.05} icon={Users} />
        <KpiCard
          label="Outstanding AP"
          value={formatMoney(1_842_400, "AED")}
          delta={-0.032}
          icon={Wallet}
        />
        <KpiCard label="Awaiting approval" value="9" icon={Clock} hint="3 high-priority" />
        <KpiCard label="Scheduled payouts" value="14" icon={Check} hint="Next: May 18" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <SectionCard
          title="Approval queue"
          description="Multi-step workflow"
          className="lg:col-span-2"
        >
          <div className="space-y-3">
            {approvals.map((a) => (
              <div key={a.id} className="rounded-lg border border-border bg-surface-elevated p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-medium">{a.vendor}</div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">
                      {a.invoice} · owner {a.owner}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-display text-base font-semibold tabular">
                      {formatMoney(a.amount, a.currency)}
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      step {a.step} of {a.total}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 mt-3">
                  {Array.from({ length: a.total }).map((_, i) => (
                    <div
                      key={i}
                      className={`h-1.5 flex-1 rounded-full ${i < a.step ? "bg-primary" : "bg-border"}`}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <Button size="sm" variant="outline">
                    Reject
                  </Button>
                  <Button size="sm">Approve</Button>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Smart reminders" description="AI-suggested actions">
          <div className="space-y-3">
            {[
              {
                i: AlertTriangle,
                t: "Vendor anomaly",
                b: "INV-44820 is 38% above Shenzhen's 90d average.",
                c: "text-warning",
              },
              {
                i: Clock,
                t: "Early-pay discount",
                b: "Gulf Logistics offers 1.5% off if paid by May 17.",
                c: "text-electric",
              },
              {
                i: Check,
                t: "Recurring invoice ready",
                b: "Nordic Cloud monthly invoice auto-drafted.",
                c: "text-success",
              },
            ].map((r, i) => (
              <div key={i} className="rounded-lg border border-border p-3">
                <div className="flex items-start gap-2">
                  <r.i className={`h-4 w-4 mt-0.5 ${r.c}`} />
                  <div>
                    <div className="text-sm font-medium">{r.t}</div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">{r.b}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <SectionCard
        title="Supplier directory"
        actions={
          <Button variant="outline" size="sm">
            Filter
          </Button>
        }
      >
        <div className="-m-5 overflow-auto">
          <table className="w-full text-sm">
            <thead className="text-[11px] uppercase text-muted-foreground tracking-wider">
              <tr className="border-b border-border">
                <th className="text-left font-medium px-5 py-2.5">Supplier</th>
                <th className="text-left font-medium px-3 py-2.5">Country</th>
                <th className="text-left font-medium px-3 py-2.5">Category</th>
                <th className="text-right font-medium px-3 py-2.5">Outstanding</th>
                <th className="text-right font-medium px-3 py-2.5">Trust score</th>
                <th className="text-left font-medium px-5 py-2.5">Status</th>
              </tr>
            </thead>
            <tbody>
              {suppliers.map((s) => (
                <tr key={s.id} className="border-b border-border/60 hover:bg-surface-elevated">
                  <td className="px-5 py-3">
                    <div className="font-medium">{s.name}</div>
                    <div className="text-[11px] text-muted-foreground">{s.id}</div>
                  </td>
                  <td className="px-3 py-3 text-muted-foreground">{s.country}</td>
                  <td className="px-3 py-3 text-muted-foreground">{s.category}</td>
                  <td className="px-3 py-3 text-right tabular font-medium">
                    {formatMoney(s.outstanding, s.currency)}
                  </td>
                  <td className="px-3 py-3 text-right">
                    <span
                      className={`tabular font-medium ${s.trustScore >= 90 ? "text-success" : s.trustScore >= 80 ? "text-warning" : "text-destructive"}`}
                    >
                      {s.trustScore}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <StatusPill status={s.status} />
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
