import { apiRequest } from "@/lib/api";

export type DashboardData = {
  kpis: {
    treasuryBalance: number;
    stablecoin: number;
    fiat: number;
    momCashflow: number;
    payables30d: number;
    receivables30d: number;
    tradeScore: number;
  };
  cashflow: { date: string; inflow: number; outflow: number; net: number }[];
  allocation: { name: string; value: number }[];
  upcomingPayables: { id: string; vendor: string; amount: number; currency: string; due: string; status: string }[];
  settlements: { id: string; channel: string; amount: number; currency: string; time: string; status: string }[];
  aiAlerts: { id: number; kind: string; title: string; body: string; severity: string }[];
};

export type PaymentsData = {
  kpis: {
    todaysVolume: number;
    settled7d: number;
    pending: number;
    avgTicket: number;
  };
  paymentLinks: { id: string; name: string; amount: number; currency: string; clicks: number; status: string; created: string }[];
  transactions: { id: string; customer: string; rail: string; amount: number; currency: string; status: string; date: string }[];
  refunds: { id: string }[];
};

export type TreasuryData = {
  currencyBalances: { code: string; label: string; balance: number; change: number }[];
  cashflow: { date: string; inflow: number; outflow: number; net: number }[];
  allocation: { name: string; value: number }[];
  payables30d: number;
  payablesBreakdown: { label: string; pct: number }[];
  payroll: { total: number; employees: number; runDate: string; salaries: number; bonuses: number; eosb: number };
  forecast: { horizon: string; value: number; delta: number; note: string }[];
};

export type TradeData = {
  kpis: { tradeScore: number; activeLocs: number; activeLocNotional: number; listedReceivables: number; inTransit: number };
  locs: { id: string; counterparty: string; amount: number; currency: string; status: string; milestone: number; total: number }[];
  shipmentMilestones: { label: string }[];
  receivables: { id: string; buyer: string; amount: number; currency: string; maturity: string; apr: number; status: string }[];
  financingPreview: { advance: number; discount: number; net: number };
};

export type ComplianceData = {
  summary: { kybStatus: string; amlFlags30d: number; auditEvents: number; activeSessions: number };
  kycEntities: { entity: string; type: string; expires: string; status: string }[];
  amlFlags: { id: string; entity: string; flag_type: string; severity: string; status: string; created_at: string; description: string }[];
  auditLog: { id: string; actor: string; action: string; target: string; timestamp: string; ip: string }[];
  roles: { role: string; users: number; permissions: string[] }[];
  securityPosture: { label: string; value: string; tone: string }[];
};

export const demoApi = {
  getDashboard: () => apiRequest<DashboardData>("/demo/dashboard"),
  getPayments: () => apiRequest<PaymentsData>("/demo/payments"),
  getTreasury: () => apiRequest<TreasuryData>("/demo/treasury"),
  getTrade: () => apiRequest<TradeData>("/demo/trade"),
  getCompliance: () => apiRequest<ComplianceData>("/demo/compliance"),
  createPaymentLink: () => apiRequest("/demo/actions/payment-link", { method: "POST" }),
  simulatePayment: () => apiRequest("/demo/actions/payment", { method: "POST" }),
  createPayout: () => apiRequest("/demo/actions/payout", { method: "POST" }),
  screenEntity: (entityName: string) =>
    apiRequest("/demo/actions/screen", {
      method: "POST",
      body: JSON.stringify({ entity_name: entityName }),
    }),
  requestFinancing: () => apiRequest("/demo/actions/financing", { method: "POST" }),
};
