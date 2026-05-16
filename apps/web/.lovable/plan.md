# Finara OS — Frontend Build Plan

A premium, enterprise-grade SaaS frontend for **Finara OS — The Financial Operating System for Modern SMEs**. Corporate fintech aesthetic (Ramp / Brex / Mercury / Airwallex / Stripe Dashboard), not crypto-consumer.

## Scope

Frontend only. Mock data throughout (no backend, no auth wiring). Desktop-first, mobile-adaptive.

## Design System

**Palette (oklch tokens in `src/styles.css`)**

- Background: near-black graphite `#0B0F17` / midnight surface `#111827`
- Primary: deep navy `#0A2540`
- Secondary (health/positive): emerald `#10B981` / teal accents
- Accent (premium intelligence): electric blue `#3B82F6` + restrained gold `#D4AF7A` for trade finance highlights
- Neutrals: slate gradient for tables, borders, muted text
- Light + dark themes; dark is the hero experience for the app shell, light for the landing page hero sections

**Typography**

- Headings: `Sora` (geometric, executive)
- Body / UI: `Inter`
- Numerals: tabular-nums everywhere financial figures appear

**Visual language**

- Clean enterprise dashboard, subtle glass only on KPI bars and AI panels
- Tight 8pt spacing, sharp 8–10px radii, hairline 1px borders, restrained motion (Framer Motion: fade/slide 200ms)
- Trust-first: no neon, no gradients-as-decoration, no crypto iconography

## Architecture

**Routing (TanStack Start, file-based, separate routes for SEO)**

```text
src/routes/
  __root.tsx              -> shell, providers, fonts
  index.tsx               -> Landing page (public)
  _app.tsx                -> Authenticated app layout (sidebar + topbar + Outlet)
  _app/dashboard.tsx      -> Executive Dashboard
  _app/payments.tsx       -> Merchant Payments Hub
  _app/treasury.tsx       -> Treasury & Financial Ops
  _app/suppliers.tsx      -> Supplier & Accounts Payable
  _app/trade-finance.tsx  -> Trade Finance Engine
  _app/copilot.tsx        -> AI CFO Copilot
  _app/compliance.tsx     -> Compliance & Audit Center
```

Note: `_app.tsx` is a pathless layout (not auth-guarded since there's no backend) that renders the sidebar shell + `<Outlet />`. Each route gets its own `head()` metadata.

**Component library (`src/components/`)**

- `layout/` — `AppSidebar`, `TopBar`, `NotificationCenter`, `CommandSearch`, `RoleSwitcher`
- `kpi/` — `KpiCard`, `KpiBar`, `TrendSpark`
- `charts/` — `CashFlowChart`, `TreasuryAllocationDonut`, `MultiCurrencyBar` (Recharts)
- `tables/` — `DataTable` (TanStack Table) with filters, status pills, row actions
- `workflow/` — `ApprovalChain`, `InvoiceCard`, `PaymentStatusBadge`
- `ai/` — `AiInsightPanel`, `CopilotChat`, `RiskAlert`
- `trade/` — `MilestoneTracker`, `LoCCard`, `ReceivableListing`
- `compliance/` — `KycStatusCard`, `AuditLogTable`, `PermissionMatrix`
- `marketing/` — `Hero`, `FeatureGrid`, `ArchitectureDiagram`, `UseCaseTabs`, `TrustBar`, `CtaBand`, `MarketingFooter`

Reuse shadcn primitives (button, card, table, dialog, sheet, tabs, badge, dropdown-menu, command, sidebar, tooltip, sonner).

## Page Contents

**1. Landing (`/`)**
Hero ("The Financial Operating System for Modern SMEs"), trust bar (logo placeholders), four-pillar feature grid (Payments · Treasury · Trade Finance · AI CFO), product architecture diagram, use-case tabs (SME / Import-Export / Retail / Supplier Networks), security & compliance band, CTA, footer.

**2. Executive Dashboard (`/dashboard`)**
KPI bar (Treasury Balance, Stablecoin, Fiat, MoM Cashflow), cash flow chart (90d), upcoming payables table, supplier liabilities donut, merchant settlements feed, AI alerts panel (risk/liquidity/vendor anomaly), quick actions (Pay supplier · Issue invoice · Smart LoC · Treasury transfer).

**3. Merchant Payments (`/payments`)**
Tabs: Payment Links · QR · Transactions · Refunds · Settlements. Create-payment modal, status pills, merchant analytics widgets, multi-rail summary.

**4. Treasury (`/treasury`)**
Multi-currency balances (AED / USD / EUR / USDC), allocation donut, AP overview, payroll summary, stablecoin↔AED converter widget, forecast cards.

**5. Suppliers & AP (`/suppliers`)**
Supplier directory table, invoice upload zone, approval chain visualizer, bulk payout drawer, payment schedule calendar, outstanding liabilities, smart reminders.

**6. Trade Finance (`/trade-finance`)**
Tokenized receivables marketplace, Smart LoC cards, trade-score gauge, shipment milestone tracker, financing request form, import/export KPIs.

**7. AI CFO Copilot (`/copilot`)**
Split layout: chat thread (mock streaming responses) + right rail of suggested insights (cash forecast, vendor risk, payment optimization, fraud alerts). Prompt chips.

**8. Compliance & Audit (`/compliance`)**
KYC/KYB status cards, AML flags table, regulatory logs, audit trail (filterable), role permission matrix, export center, security posture summary.

## Cross-cutting UX

- Role switcher in topbar (Founder / CFO / Finance Mgr / Merchant / Supplier / Auditor / Compliance) — visually toggles greeting + relevant widgets (mock).
- Global ⌘K command palette.
- Notification center sheet.
- Toast system (sonner) for action confirmations.
- Empty states + skeleton loaders on every data surface.

## Technical Notes

- TanStack Start + TanStack Router file-based routes; no backend integration.
- Charts: `recharts` (add via `bun add recharts`).
- Animation: `framer-motion` (add via `bun add framer-motion`).
- Icons: `lucide-react` (already present).
- Tables: `@tanstack/react-table` (add via `bun add @tanstack/react-table`).
- Fonts loaded via `<link>` in `__root.tsx` head (Google Fonts: Sora + Inter).
- All colors via semantic tokens in `src/styles.css` (oklch). No hard-coded hex in components.
- Mock data lives in `src/lib/mock/` per domain (`treasury.ts`, `suppliers.ts`, etc.).

## Build Order

1. Tokens + fonts + global shell (sidebar, topbar, app layout route).
2. Shared components (KpiCard, DataTable, charts, AI panel).
3. Executive Dashboard (validates the system end-to-end).
4. Payments → Treasury → Suppliers → Trade Finance → Copilot → Compliance.
5. Landing page last (reuses brand tokens established by app).
6. Polish pass: empty states, responsive, motion, metadata per route.

## Out of Scope (this build)

Real auth, real data, payment rails, blockchain integrations, server functions. All interactions are mocked client-side. Backend can be added later via Lovable Cloud when requested.
