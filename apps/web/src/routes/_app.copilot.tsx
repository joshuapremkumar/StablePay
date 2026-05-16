import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, SectionCard } from "@/components/finara/Primitives";
import { copilotSuggestions, copilotThread } from "@/lib/mock";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  Send,
  TrendingUp,
  ShieldAlert,
  AlertTriangle,
  ArrowRightLeft,
} from "lucide-react";

export const Route = createFileRoute("/_app/copilot")({
  head: () => ({ meta: [{ title: "AI CFO Copilot · Finara OS" }] }),
  component: Copilot,
});

function Copilot() {
  return (
    <div className="p-6 md:p-8 max-w-[1600px] mx-auto">
      <PageHeader
        title="AI CFO Copilot"
        description="Conversational financial intelligence grounded in your live treasury, payables, and trade data."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-xl border border-border bg-card flex flex-col h-[640px]">
          <div className="px-5 py-4 border-b border-border flex items-center gap-2">
            <div className="h-7 w-7 rounded-md bg-gradient-to-br from-electric to-primary grid place-items-center">
              <Sparkles className="h-3.5 w-3.5 text-primary-foreground" />
            </div>
            <div>
              <div className="text-sm font-medium">Finara Copilot</div>
              <div className="text-[11px] text-muted-foreground">Grounded · gpt-fin-4</div>
            </div>
          </div>

          <div className="flex-1 overflow-auto p-5 space-y-4">
            {copilotThread.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    m.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-sm"
                      : "bg-surface-elevated border border-border rounded-bl-sm"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
          </div>

          <div className="px-5 py-3 border-t border-border space-y-2">
            <div className="flex gap-2 flex-wrap">
              {copilotSuggestions.map((s) => (
                <button
                  key={s}
                  className="text-[11px] px-2.5 py-1 rounded-full border border-border bg-surface-elevated hover:border-primary/40 hover:bg-primary/5 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 h-11 px-3 rounded-lg border border-border bg-surface-elevated">
              <input
                placeholder="Ask Copilot anything about treasury, AP, or trade…"
                className="flex-1 bg-transparent text-sm outline-none"
              />
              <Button size="icon" className="h-7 w-7">
                <Send className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <SectionCard title="Strategic insights">
            <div className="space-y-3">
              {[
                {
                  i: AlertTriangle,
                  t: "USD cover trending below 30 days",
                  b: "Convert 320K AED→USDC to extend cover.",
                  c: "text-warning",
                },
                {
                  i: TrendingUp,
                  t: "FX timing opportunity",
                  b: "EUR is 1.4% above 30d average; consider settling supplier invoices now.",
                  c: "text-electric",
                },
                {
                  i: ShieldAlert,
                  t: "Vendor risk: Shenzhen Co",
                  b: "Invoice 38% above average — review before approving.",
                  c: "text-destructive",
                },
                {
                  i: ArrowRightLeft,
                  t: "Idle treasury",
                  b: "1.2M AED idle for 14+ days. Allocate to USDC yield account?",
                  c: "text-success",
                },
              ].map((s, i) => (
                <div key={i} className="rounded-lg border border-border p-3">
                  <div className="flex items-start gap-2">
                    <s.i className={`h-4 w-4 mt-0.5 ${s.c}`} />
                    <div>
                      <div className="text-sm font-medium leading-snug">{s.t}</div>
                      <div className="text-[11px] text-muted-foreground mt-1">{s.b}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Connected data">
            <div className="space-y-2 text-xs">
              {[
                "Treasury accounts (12)",
                "AP ledger (live)",
                "Receivables (live)",
                "FX rates (Reuters)",
                "Trade documents (47)",
              ].map((s) => (
                <div key={s} className="flex items-center justify-between text-muted-foreground">
                  <span>{s}</span>
                  <span className="text-success">●</span>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
