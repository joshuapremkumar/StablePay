// Mock data for Finara OS

export const kpis = {
  treasuryBalance: 12_487_320,
  stablecoin: 4_120_500,
  fiat: 8_366_820,
  momCashflow: 0.182,
  payables30d: 1_842_400,
  receivables30d: 3_204_900,
  tradeScore: 87,
};

export const cashflow = Array.from({ length: 90 }).map((_, i) => {
  const base = 8_000_000 + i * 48000;
  const inflow = base + Math.sin(i / 6) * 600000 + Math.random() * 200000;
  const outflow = base * 0.78 + Math.cos(i / 5) * 400000 + Math.random() * 150000;
  const d = new Date();
  d.setDate(d.getDate() - (90 - i));
  return {
    date: d.toISOString().slice(5, 10),
    inflow: Math.round(inflow),
    outflow: Math.round(outflow),
    net: Math.round(inflow - outflow),
  };
});

export const allocation = [
  { name: "AED Operating", value: 4_820_000 },
  { name: "USD Reserve", value: 3_120_000 },
  { name: "EUR Trade", value: 1_426_320 },
  { name: "USDC Treasury", value: 4_120_500 - 1_000_000 + 1_000_000 },
];

export const currencyBalances = [
  { code: "AED", label: "UAE Dirham", balance: 4_820_000, change: 0.024 },
  { code: "USD", label: "US Dollar", balance: 3_120_000, change: -0.008 },
  { code: "EUR", label: "Euro", balance: 1_426_320, change: 0.012 },
  { code: "USDC", label: "USD Coin", balance: 4_120_500, change: 0.041 },
];

export const upcomingPayables = [
  {
    id: "PAY-2841",
    vendor: "Gulf Logistics DMCC",
    amount: 124_800,
    currency: "AED",
    due: "2026-05-18",
    status: "scheduled",
  },
  {
    id: "PAY-2842",
    vendor: "Shenzhen Components Ltd",
    amount: 86_200,
    currency: "USD",
    due: "2026-05-19",
    status: "approval",
  },
  {
    id: "PAY-2843",
    vendor: "Emirates Power & Water",
    amount: 18_540,
    currency: "AED",
    due: "2026-05-20",
    status: "scheduled",
  },
  {
    id: "PAY-2844",
    vendor: "Adriatic Freight SRL",
    amount: 42_180,
    currency: "EUR",
    due: "2026-05-22",
    status: "draft",
  },
  {
    id: "PAY-2845",
    vendor: "Nordic Cloud Services",
    amount: 12_400,
    currency: "USD",
    due: "2026-05-23",
    status: "scheduled",
  },
  {
    id: "PAY-2846",
    vendor: "Al Futtaim Trading",
    amount: 240_000,
    currency: "AED",
    due: "2026-05-25",
    status: "approval",
  },
];

export const settlements = [
  {
    id: "STL-9921",
    channel: "Card · Stripe",
    amount: 28_420,
    currency: "AED",
    time: "10:42",
    status: "settled",
  },
  {
    id: "STL-9922",
    channel: "Bank Transfer",
    amount: 142_800,
    currency: "AED",
    time: "10:21",
    status: "settled",
  },
  {
    id: "STL-9923",
    channel: "Stablecoin · USDC",
    amount: 64_200,
    currency: "USDC",
    time: "09:58",
    status: "settled",
  },
  {
    id: "STL-9924",
    channel: "QR · Mada",
    amount: 1_240,
    currency: "AED",
    time: "09:44",
    status: "pending",
  },
  {
    id: "STL-9925",
    channel: "Card · Stripe",
    amount: 8_640,
    currency: "AED",
    time: "09:30",
    status: "settled",
  },
];

export const aiAlerts = [
  {
    id: 1,
    kind: "liquidity" as const,
    title: "USD reserve trending below 30d cover",
    body: "Forecast shows USD operating reserve will dip under 30-day cover by May 24 at current burn. Recommend converting 320K AED.",
    severity: "high" as const,
  },
  {
    id: 2,
    kind: "vendor" as const,
    title: "Anomalous invoice from Shenzhen Components Ltd",
    body: "Invoice INV-44820 is 38% above the trailing 90-day average for this vendor. Flagged for review.",
    severity: "medium" as const,
  },
  {
    id: 3,
    kind: "risk" as const,
    title: "Trade exposure concentration",
    body: "Single-counterparty exposure to Al Futtaim Trading at 22% of receivables. Consider diversification.",
    severity: "low" as const,
  },
];

export const paymentLinks = [
  {
    id: "PL-7741",
    name: "Q2 Wholesale Order #4421",
    amount: 84_200,
    currency: "AED",
    clicks: 14,
    status: "active",
    created: "2026-05-12",
  },
  {
    id: "PL-7742",
    name: "Annual License — Acme Co",
    amount: 12_000,
    currency: "USD",
    clicks: 6,
    status: "active",
    created: "2026-05-11",
  },
  {
    id: "PL-7743",
    name: "Pilot Deposit — Nordic",
    amount: 5_000,
    currency: "EUR",
    clicks: 22,
    status: "paid",
    created: "2026-05-09",
  },
  {
    id: "PL-7744",
    name: "Custom Build — Marwa Group",
    amount: 220_000,
    currency: "AED",
    clicks: 3,
    status: "draft",
    created: "2026-05-08",
  },
];

export const transactions = Array.from({ length: 18 }).map((_, i) => ({
  id: `TXN-${10240 + i}`,
  customer: [
    "Marwa Group",
    "Nordic Cloud",
    "Al Futtaim",
    "Shenzhen Co",
    "Gulf Logistics",
    "Acme Co",
  ][i % 6],
  rail: ["Card", "Bank", "USDC", "QR"][i % 4],
  amount: Math.round(2000 + Math.random() * 80000),
  currency: ["AED", "USD", "EUR", "USDC"][i % 4],
  status: (["settled", "pending", "settled", "settled", "refunded"] as const)[i % 5],
  date: `2026-05-${(20 - (i % 18)).toString().padStart(2, "0")}`,
}));

export const suppliers = [
  {
    id: "SUP-001",
    name: "Gulf Logistics DMCC",
    country: "UAE",
    category: "Logistics",
    outstanding: 248_000,
    currency: "AED",
    trustScore: 92,
    status: "active",
  },
  {
    id: "SUP-002",
    name: "Shenzhen Components Ltd",
    country: "China",
    category: "Components",
    outstanding: 186_200,
    currency: "USD",
    trustScore: 78,
    status: "review",
  },
  {
    id: "SUP-003",
    name: "Adriatic Freight SRL",
    country: "Italy",
    category: "Freight",
    outstanding: 64_180,
    currency: "EUR",
    trustScore: 88,
    status: "active",
  },
  {
    id: "SUP-004",
    name: "Nordic Cloud Services",
    country: "Sweden",
    category: "SaaS",
    outstanding: 12_400,
    currency: "USD",
    trustScore: 95,
    status: "active",
  },
  {
    id: "SUP-005",
    name: "Al Futtaim Trading",
    country: "UAE",
    category: "Distribution",
    outstanding: 540_000,
    currency: "AED",
    trustScore: 90,
    status: "active",
  },
  {
    id: "SUP-006",
    name: "Mumbai Textiles Pvt",
    country: "India",
    category: "Materials",
    outstanding: 88_240,
    currency: "USD",
    trustScore: 81,
    status: "active",
  },
];

export const approvals = [
  {
    id: "APR-441",
    invoice: "INV-44820",
    vendor: "Shenzhen Components Ltd",
    amount: 86_200,
    currency: "USD",
    step: 2,
    total: 3,
    owner: "Layla H.",
  },
  {
    id: "APR-442",
    invoice: "INV-44821",
    vendor: "Al Futtaim Trading",
    amount: 240_000,
    currency: "AED",
    step: 1,
    total: 3,
    owner: "Omar K.",
  },
  {
    id: "APR-443",
    invoice: "INV-44822",
    vendor: "Gulf Logistics DMCC",
    amount: 32_180,
    currency: "AED",
    step: 3,
    total: 3,
    owner: "Mei T.",
  },
];

export const receivables = [
  {
    id: "RCV-220",
    buyer: "Carrefour MENA",
    amount: 480_000,
    currency: "AED",
    maturity: "2026-07-15",
    apr: 7.2,
    status: "listed",
  },
  {
    id: "RCV-221",
    buyer: "Lulu Group Intl",
    amount: 312_000,
    currency: "AED",
    maturity: "2026-06-30",
    apr: 6.8,
    status: "funded",
  },
  {
    id: "RCV-222",
    buyer: "Migros Turkey",
    amount: 188_000,
    currency: "USD",
    maturity: "2026-08-02",
    apr: 8.4,
    status: "listed",
  },
  {
    id: "RCV-223",
    buyer: "Spinneys Dubai",
    amount: 96_400,
    currency: "AED",
    maturity: "2026-06-12",
    apr: 6.2,
    status: "matured",
  },
];

export const locs = [
  {
    id: "LOC-118",
    counterparty: "Shenzhen Components Ltd",
    amount: 420_000,
    currency: "USD",
    status: "in transit",
    milestone: 3,
    total: 5,
  },
  {
    id: "LOC-119",
    counterparty: "Mumbai Textiles Pvt",
    amount: 188_000,
    currency: "USD",
    status: "issued",
    milestone: 1,
    total: 5,
  },
  {
    id: "LOC-120",
    counterparty: "Adriatic Freight SRL",
    amount: 64_000,
    currency: "EUR",
    status: "delivered",
    milestone: 5,
    total: 5,
  },
];

export const shipmentMilestones = [
  { label: "PO Issued", done: true },
  { label: "Goods Shipped", done: true },
  { label: "In Transit", done: true },
  { label: "Customs Cleared", done: false },
  { label: "Delivered", done: false },
];

export const auditLog = Array.from({ length: 12 }).map((_, i) => ({
  id: `EVT-${88210 - i}`,
  actor: ["Layla H.", "Omar K.", "System", "Mei T.", "Auditor"][i % 5],
  action: [
    "approved invoice",
    "issued payment",
    "rotated API key",
    "added supplier",
    "exported report",
  ][i % 5],
  target: ["INV-44820", "PAY-2842", "key_prod_4f", "SUP-006", "audit_2026Q1"][i % 5],
  timestamp: `2026-05-${(15 - (i % 14)).toString().padStart(2, "0")} 1${i % 9}:${(10 + i) % 60}`,
  ip: `185.${i + 12}.${(40 + i) % 255}.${(i * 13) % 255}`,
}));

export const kycEntities = [
  { entity: "Finara Holdings FZ-LLC", type: "Parent", status: "verified", expires: "2027-03-12" },
  { entity: "Finara Trading Co", type: "Subsidiary", status: "verified", expires: "2026-11-04" },
  { entity: "Finara Payments DMCC", type: "Subsidiary", status: "review", expires: "2026-06-22" },
];

export const roles = [
  { role: "Founder", users: 2, permissions: ["full"] },
  { role: "CFO", users: 1, permissions: ["treasury", "approvals", "reports"] },
  { role: "Finance Manager", users: 4, permissions: ["ap", "ar", "approvals"] },
  { role: "Merchant Operator", users: 6, permissions: ["payments", "refunds"] },
  { role: "Auditor", users: 2, permissions: ["read-only", "exports"] },
  { role: "Compliance Officer", users: 1, permissions: ["kyc", "aml", "audit"] },
];

export const copilotSuggestions = [
  "Forecast next 30 days of cash flow",
  "Which suppliers have the highest payment risk?",
  "Optimize FX conversion this week",
  "Summarize April treasury performance",
];

export const copilotThread = [
  { role: "user" as const, content: "What's our 30-day liquidity outlook?" },
  {
    role: "assistant" as const,
    content:
      "Across all currencies you're projected to hold 11.2M AED equivalent on day 30, down 4.1% from today. USD coverage tightens to 26 days; I'd recommend converting 320K AED→USD this week to maintain 35-day cover.",
  },
  { role: "user" as const, content: "Any vendor risks I should know about?" },
  {
    role: "assistant" as const,
    content:
      "Two flags: Shenzhen Components Ltd submitted INV-44820 at 38% above their 90-day average — worth a review. Concentration risk with Al Futtaim Trading at 22% of receivables; consider diversifying buyer exposure.",
  },
];

export function formatMoney(n: number, currency = "AED") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency === "USDC" ? "USD" : currency,
    maximumFractionDigits: 0,
  })
    .format(n)
    .replace("USD", currency === "USDC" ? "USDC" : "USD");
}

export function formatCompact(n: number) {
  return new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(
    n,
  );
}
