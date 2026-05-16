import { createFileRoute } from "@tanstack/react-router";
import { KpiCard, PageHeader, SectionCard, StatusPill } from "@/components/finara/Primitives";
import { auditLog, kycEntities, roles } from "@/lib/mock";
import { Button } from "@/components/ui/button";
import { ShieldCheck, AlertTriangle, FileCheck, Download, Lock } from "lucide-react";

export const Route = createFileRoute("/_app/compliance")({
  head: () => ({ meta: [{ title: "Compliance & Audit · Finara OS" }] }),
  component: Compliance,
});

function Compliance() {
  return (
    <div className="p-6 md:p-8 max-w-[1600px] mx-auto">
      <PageHeader
        title="Compliance & Audit"
        description="KYB, AML, regulatory logs, and full audit trail across the operating system."
        actions={
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-1.5" /> Export audit pack
          </Button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard label="KYB status" value="Verified" icon={ShieldCheck} hint="All entities" />
        <KpiCard label="AML flags (30d)" value="2" icon={AlertTriangle} hint="Both resolved" />
        <KpiCard label="Audit events" value="1,284" delta={0.083} icon={FileCheck} />
        <KpiCard label="Active sessions" value="8" icon={Lock} hint="All MFA-enforced" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <SectionCard
          title="KYB / KYC status"
          description="Per legal entity"
          className="lg:col-span-2"
        >
          <div className="space-y-3">
            {kycEntities.map((e) => (
              <div
                key={e.entity}
                className="flex items-center gap-3 rounded-lg border border-border bg-surface-elevated p-3"
              >
                <div className="h-9 w-9 rounded-md bg-surface grid place-items-center">
                  <ShieldCheck
                    className={`h-4 w-4 ${e.status === "verified" ? "text-success" : "text-warning"}`}
                  />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium">{e.entity}</div>
                  <div className="text-[11px] text-muted-foreground">
                    {e.type} · expires {e.expires}
                  </div>
                </div>
                <StatusPill status={e.status} />
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Security posture">
          <div className="space-y-3">
            {[
              { label: "SOC 2 Type II", val: "Active", c: "text-success" },
              { label: "ISO 27001", val: "Active", c: "text-success" },
              { label: "PCI DSS", val: "Level 2", c: "text-success" },
              { label: "MFA enforcement", val: "100%", c: "text-success" },
              { label: "Encryption", val: "AES-256 / TLS 1.3", c: "text-muted-foreground" },
              { label: "Data residency", val: "UAE / EU", c: "text-muted-foreground" },
            ].map((r) => (
              <div
                key={r.label}
                className="flex justify-between text-sm border-b border-border/60 pb-2 last:border-0"
              >
                <span className="text-muted-foreground">{r.label}</span>
                <span className={`font-medium ${r.c}`}>{r.val}</span>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <SectionCard title="Roles & permissions" className="lg:col-span-1">
          <div className="space-y-2">
            {roles.map((r) => (
              <div key={r.role} className="rounded-lg border border-border p-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium">{r.role}</div>
                  <div className="text-[11px] text-muted-foreground">{r.users} users</div>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {r.permissions.map((p) => (
                    <span
                      key={p}
                      className="text-[10px] px-1.5 py-0.5 rounded border border-border bg-surface-elevated text-muted-foreground"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Audit log" description="Last 12 events" className="lg:col-span-2">
          <div className="-m-5 overflow-auto">
            <table className="w-full text-sm">
              <thead className="text-[11px] uppercase text-muted-foreground tracking-wider">
                <tr className="border-b border-border">
                  <th className="text-left font-medium px-5 py-2.5">Event</th>
                  <th className="text-left font-medium px-3 py-2.5">Actor</th>
                  <th className="text-left font-medium px-3 py-2.5">Action</th>
                  <th className="text-left font-medium px-3 py-2.5">Target</th>
                  <th className="text-left font-medium px-5 py-2.5">Time · IP</th>
                </tr>
              </thead>
              <tbody>
                {auditLog.map((e) => (
                  <tr key={e.id} className="border-b border-border/60 hover:bg-surface-elevated">
                    <td className="px-5 py-3 font-mono text-[12px]">{e.id}</td>
                    <td className="px-3 py-3">{e.actor}</td>
                    <td className="px-3 py-3 text-muted-foreground">{e.action}</td>
                    <td className="px-3 py-3 font-mono text-[12px]">{e.target}</td>
                    <td className="px-5 py-3 text-[11px] text-muted-foreground tabular">
                      {e.timestamp} · {e.ip}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
