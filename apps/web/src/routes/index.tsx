import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Banknote,
  Bot,
  CheckCircle2,
  CreditCard,
  Globe2,
  Layers,
  Lock,
  Network,
  Ship,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Wallet,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Finara OS — The Financial Operating System for Modern SMEs" },
      {
        name: "description",
        content:
          "Payments, treasury, supplier management, trade finance, and an AI CFO Copilot — unified in one corporate financial operating system.",
      },
      { property: "og:title", content: "Finara OS — Financial OS for Modern SMEs" },
      {
        property: "og:description",
        content: "Smarter Treasury. Faster Settlement. Payments, treasury, and trade — unified.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />
      <Hero />
      <TrustBar />
      <Pillars />
      <Architecture />
      <UseCases />
      <Compliance />
      <Cta />
      <Footer />
    </div>
  );
}

function Nav() {
  return (
    <header className="border-b border-border bg-background/80 backdrop-blur sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center gap-8">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-md bg-gradient-to-br from-primary to-electric grid place-items-center">
            <span className="font-display font-bold text-primary-foreground">F</span>
          </div>
          <span className="font-display font-semibold tracking-tight">Finara OS</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
          <a href="#pillars" className="hover:text-foreground">
            Platform
          </a>
          <a href="#architecture" className="hover:text-foreground">
            Architecture
          </a>
          <a href="#use-cases" className="hover:text-foreground">
            Use cases
          </a>
          <a href="#compliance" className="hover:text-foreground">
            Security
          </a>
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/login">Sign in</Link>
          </Button>
          <Button size="sm" asChild>
            <Link to="/dashboard">
              Open dashboard <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border">
      <div className="absolute inset-0 grid-bg opacity-40 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />
      <div className="absolute -top-32 right-0 h-[480px] w-[480px] rounded-full bg-electric/10 blur-3xl" />
      <div className="absolute -bottom-32 left-0 h-[480px] w-[480px] rounded-full bg-primary/10 blur-3xl" />
      <div className="relative max-w-7xl mx-auto px-6 pt-20 pb-24 md:pt-28 md:pb-32">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-success" />
          Blockchain-native SME financial infrastructure
        </div>
        <h1 className="mt-6 font-display text-4xl md:text-6xl font-semibold tracking-tight max-w-4xl leading-[1.05]">
          The Financial Operating System
          <br />
          <span className="bg-gradient-to-r from-primary via-electric to-primary bg-clip-text text-transparent">
            for Modern SMEs.
          </span>
        </h1>
        <p className="mt-6 text-base md:text-lg text-muted-foreground max-w-2xl leading-relaxed">
          Payments, treasury, supplier management, trade finance, and an AI CFO Copilot — unified in
          one corporate operating system. Built for finance leaders who run real businesses.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Button size="lg" asChild>
            <Link to="/dashboard">
              Open the dashboard <ArrowRight className="h-4 w-4 ml-1.5" />
            </Link>
          </Button>
          <Button size="lg" variant="outline">
            Book a CFO walkthrough
          </Button>
        </div>
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl">
          {[
            { k: "$2.4B+", v: "Annualized volume" },
            { k: "98.9%", v: "Settlement on-time" },
            { k: "180+", v: "Currencies & rails" },
            { k: "< 4s", v: "Avg payout" },
          ].map((s) => (
            <div key={s.v}>
              <div className="font-display text-2xl font-semibold tabular">{s.k}</div>
              <div className="text-xs text-muted-foreground mt-1">{s.v}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TrustBar() {
  const logos = [
    "AURORA CAPITAL",
    "MERIDIAN BANK",
    "CARRELLE GROUP",
    "LULU HOLDINGS",
    "GULF TRADE FZ",
    "NORDIC TREASURY",
  ];
  return (
    <section className="border-b border-border py-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-[11px] uppercase tracking-widest text-muted-foreground text-center mb-6">
          Powering finance teams at growth-stage SMEs and corporates
        </div>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-6 items-center">
          {logos.map((l) => (
            <div
              key={l}
              className="text-center text-xs tracking-[0.2em] text-muted-foreground/70 font-medium"
            >
              {l}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Pillars() {
  const items = [
    {
      i: CreditCard,
      t: "Merchant Payments",
      b: "Accept across cards, bank rails, QR, and stablecoins. Settle to any treasury account in seconds.",
    },
    {
      i: Wallet,
      t: "Corporate Treasury",
      b: "Real-time multi-currency positions, allocation, and forecasting across every entity.",
    },
    {
      i: Ship,
      t: "Trade Finance",
      b: "Tokenized receivables, smart letters of credit, and on-demand financing for cross-border trade.",
    },
    {
      i: Bot,
      t: "AI CFO Copilot",
      b: "Conversational intelligence grounded in your live treasury, payables, and trade data.",
    },
    {
      i: Network,
      t: "Supplier Network & AP",
      b: "Centralized vendor relationships, approval workflows, and bulk payouts in any currency.",
    },
    {
      i: ShieldCheck,
      t: "Compliance & Audit",
      b: "KYB, AML, and full audit trail built in. SOC 2, ISO 27001, PCI DSS.",
    },
  ];
  return (
    <section id="pillars" className="border-b border-border py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-6">
        <div className="max-w-2xl mb-12">
          <div className="text-xs uppercase tracking-widest text-electric font-medium">
            Platform
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-semibold tracking-tight mt-3">
            One operating system. Every corporate finance workflow.
          </h2>
          <p className="text-muted-foreground mt-4">
            No more stitched-together banking, accounting, and treasury tools. Finara OS replaces
            the patchwork with a single ledger and a single workflow.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-border rounded-xl overflow-hidden border border-border">
          {items.map((it) => (
            <div key={it.t} className="bg-background p-6 hover:bg-surface transition-colors">
              <div className="h-10 w-10 rounded-md bg-primary/10 text-primary grid place-items-center">
                <it.i className="h-5 w-5" />
              </div>
              <div className="font-display text-lg font-semibold mt-4">{it.t}</div>
              <div className="text-sm text-muted-foreground mt-2 leading-relaxed">{it.b}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Architecture() {
  return (
    <section
      id="architecture"
      className="border-b border-border py-20 md:py-28 bg-surface-elevated"
    >
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <div className="text-xs uppercase tracking-widest text-electric font-medium">
            Architecture
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-semibold tracking-tight mt-3">
            A unified ledger, modern rails, programmable money.
          </h2>
          <p className="text-muted-foreground mt-4">
            Every transaction — fiat or stablecoin, inbound or outbound — settles to one canonical
            ledger. Combine traditional banking rails with on-chain settlement without your team
            noticing the difference.
          </p>
          <div className="mt-6 space-y-3">
            {[
              "Single double-entry ledger across all entities and currencies",
              "Programmable approval workflows with policy-as-code",
              "Native stablecoin treasury alongside fiat accounts",
              "Open API with webhooks and read replicas",
            ].map((p) => (
              <div key={p} className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-success mt-0.5" />
                <span>{p}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-2xl shadow-primary/5">
          <div className="grid grid-cols-3 gap-3">
            {[
              { i: CreditCard, l: "Payments" },
              { i: Wallet, l: "Treasury" },
              { i: Ship, l: "Trade" },
              { i: Network, l: "Suppliers" },
              { i: Bot, l: "Copilot" },
              { i: ShieldCheck, l: "Compliance" },
            ].map((b) => (
              <div
                key={b.l}
                className="rounded-lg border border-border bg-surface-elevated p-3 text-center"
              >
                <b.i className="h-4 w-4 mx-auto text-electric" />
                <div className="text-[11px] mt-1.5">{b.l}</div>
              </div>
            ))}
          </div>
          <div className="my-4 flex items-center gap-2">
            <div className="flex-1 h-px bg-border" />
            <Layers className="h-4 w-4 text-muted-foreground" />
            <div className="flex-1 h-px bg-border" />
          </div>
          <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 text-center">
            <div className="text-[11px] uppercase tracking-widest text-primary font-medium">
              Finara Unified Ledger
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Double-entry · Multi-currency · Multi-entity
            </div>
          </div>
          <div className="my-4 flex items-center gap-2">
            <div className="flex-1 h-px bg-border" />
            <Globe2 className="h-4 w-4 text-muted-foreground" />
            <div className="flex-1 h-px bg-border" />
          </div>
          <div className="grid grid-cols-4 gap-2 text-center">
            {["SWIFT", "SEPA", "ACH", "USDC"].map((r) => (
              <div
                key={r}
                className="rounded-md border border-border bg-surface-elevated py-2 text-[11px] font-medium tracking-wider"
              >
                {r}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function UseCases() {
  const cases = [
    {
      i: TrendingUp,
      t: "Growth-stage SMEs",
      b: "Unify finance ops as you scale from one entity to ten across markets.",
    },
    {
      i: Ship,
      t: "Import / Export",
      b: "Trade finance, letters of credit, and FX execution at institutional rates.",
    },
    {
      i: Banknote,
      t: "Retail & Hospitality",
      b: "Multi-rail acceptance, fast settlement, and merchant analytics.",
    },
    {
      i: Network,
      t: "Supplier Networks",
      b: "Centralize payouts and onboarding for hundreds of vendors.",
    },
  ];
  return (
    <section id="use-cases" className="border-b border-border py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-6">
        <div className="max-w-2xl mb-12">
          <div className="text-xs uppercase tracking-widest text-electric font-medium">
            Use cases
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-semibold tracking-tight mt-3">
            Built for the businesses that run global trade.
          </h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {cases.map((c) => (
            <div
              key={c.t}
              className="rounded-xl border border-border bg-card p-6 hover:border-primary/30 transition-colors"
            >
              <c.i className="h-5 w-5 text-electric" />
              <div className="font-display text-lg font-semibold mt-4">{c.t}</div>
              <div className="text-sm text-muted-foreground mt-2 leading-relaxed">{c.b}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Compliance() {
  return (
    <section id="compliance" className="border-b border-border py-20 md:py-28 bg-surface-elevated">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="text-xs uppercase tracking-widest text-electric font-medium">
              Security & Compliance
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-semibold tracking-tight mt-3">
              Institutional-grade by default.
            </h2>
            <p className="text-muted-foreground mt-4">
              Every transaction, approval, and access event is logged. Audit-ready in one click.
              Regulator-friendly by design.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { i: ShieldCheck, t: "SOC 2 Type II" },
              { i: Lock, t: "ISO 27001" },
              { i: ShieldCheck, t: "PCI DSS L2" },
              { i: Lock, t: "GDPR · UAE PDPL" },
            ].map((b) => (
              <div key={b.t} className="rounded-lg border border-border bg-card p-4">
                <b.i className="h-5 w-5 text-success" />
                <div className="text-sm font-medium mt-3">{b.t}</div>
                <div className="text-[11px] text-muted-foreground mt-1">
                  Active · audited annually
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Cta() {
  return (
    <section className="border-b border-border py-20 md:py-28">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <Sparkles className="h-6 w-6 mx-auto text-electric" />
        <h2 className="font-display text-3xl md:text-5xl font-semibold tracking-tight mt-4">
          Corporate financial infrastructure, rebuilt.
        </h2>
        <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
          Move your treasury, payments, AP, and trade onto one system. Your finance team will thank
          you on day one.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button size="lg" asChild>
            <Link to="/dashboard">
              Explore the product <ArrowRight className="h-4 w-4 ml-1.5" />
            </Link>
          </Button>
          <Button size="lg" variant="outline">
            Talk to sales
          </Button>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="py-12">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-md bg-gradient-to-br from-primary to-electric grid place-items-center">
            <span className="font-display font-bold text-primary-foreground text-xs">F</span>
          </div>
          <span className="font-display font-semibold">Finara OS</span>
          <span className="text-xs text-muted-foreground ml-2">© 2026 Finara Holdings FZ-LLC</span>
        </div>
        <div className="flex items-center gap-6 text-xs text-muted-foreground">
          <a href="#" className="hover:text-foreground">
            Privacy
          </a>
          <a href="#" className="hover:text-foreground">
            Terms
          </a>
          <a href="#" className="hover:text-foreground">
            Status
          </a>
          <a href="#" className="hover:text-foreground">
            Docs
          </a>
        </div>
      </div>
    </footer>
  );
}
