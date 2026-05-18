from __future__ import annotations

from copy import deepcopy
from dataclasses import dataclass, field
from datetime import date, datetime, timedelta
from decimal import Decimal
from threading import Lock
from typing import Any
from uuid import uuid4


def _iso_day(value: date | datetime) -> str:
    if isinstance(value, datetime):
        return value.date().isoformat()
    return value.isoformat()


def _money(value: float | Decimal) -> float:
    return round(float(value), 2)


@dataclass
class DemoState:
    organization_id: str = "org-finara-demo"
    stablecoin_balance: float = 4_120_500.0
    fiat_balances: dict[str, float] = field(
        default_factory=lambda: {"AED": 4_820_000.0, "USD": 3_120_000.0, "EUR": 1_426_320.0}
    )
    payment_links: list[dict[str, Any]] = field(default_factory=list)
    transactions: list[dict[str, Any]] = field(default_factory=list)
    settlements: list[dict[str, Any]] = field(default_factory=list)
    upcoming_payables: list[dict[str, Any]] = field(default_factory=list)
    payouts: list[dict[str, Any]] = field(default_factory=list)
    cashflow: list[dict[str, Any]] = field(default_factory=list)
    ai_alerts: list[dict[str, Any]] = field(default_factory=list)
    locs: list[dict[str, Any]] = field(default_factory=list)
    receivables: list[dict[str, Any]] = field(default_factory=list)
    kyc_entities: list[dict[str, Any]] = field(default_factory=list)
    aml_flags: list[dict[str, Any]] = field(default_factory=list)
    audit_logs: list[dict[str, Any]] = field(default_factory=list)
    roles: list[dict[str, Any]] = field(default_factory=list)
    security_posture: list[dict[str, str]] = field(default_factory=list)
    active_sessions: int = 8

    def __post_init__(self) -> None:
        today = date.today()
        self.payment_links = [
            {
                "id": "PL-7741",
                "name": "Q2 Wholesale Order #4421",
                "amount": 84_200,
                "currency": "AED",
                "clicks": 14,
                "status": "active",
                "created": (today - timedelta(days=6)).isoformat(),
            },
            {
                "id": "PL-7742",
                "name": "Annual License - Acme Co",
                "amount": 12_000,
                "currency": "USD",
                "clicks": 6,
                "status": "active",
                "created": (today - timedelta(days=7)).isoformat(),
            },
            {
                "id": "PL-7743",
                "name": "Pilot Deposit - Nordic",
                "amount": 5_000,
                "currency": "EUR",
                "clicks": 22,
                "status": "paid",
                "created": (today - timedelta(days=9)).isoformat(),
            },
        ]
        self.transactions = [
            {
                "id": "TXN-10240",
                "customer": "Marwa Group",
                "rail": "Card",
                "amount": 28_420,
                "currency": "AED",
                "status": "settled",
                "date": today.isoformat(),
            },
            {
                "id": "TXN-10241",
                "customer": "Nordic Cloud",
                "rail": "Bank",
                "amount": 142_800,
                "currency": "AED",
                "status": "settled",
                "date": today.isoformat(),
            },
            {
                "id": "TXN-10242",
                "customer": "Acme Co",
                "rail": "USDC",
                "amount": 64_200,
                "currency": "USDC",
                "status": "pending",
                "date": today.isoformat(),
            },
        ]
        self.settlements = [
            {
                "id": "STL-9921",
                "channel": "Card / Stripe",
                "amount": 28_420,
                "currency": "AED",
                "time": "10:42",
                "status": "settled",
            },
            {
                "id": "STL-9922",
                "channel": "Bank Transfer",
                "amount": 142_800,
                "currency": "AED",
                "time": "10:21",
                "status": "settled",
            },
            {
                "id": "STL-9923",
                "channel": "Stablecoin / USDC",
                "amount": 64_200,
                "currency": "USDC",
                "time": "09:58",
                "status": "pending",
            },
        ]
        self.upcoming_payables = [
            {
                "id": "PAY-2841",
                "vendor": "Gulf Logistics DMCC",
                "amount": 124_800,
                "currency": "AED",
                "due": today.isoformat(),
                "status": "scheduled",
            },
            {
                "id": "PAY-2842",
                "vendor": "Shenzhen Components Ltd",
                "amount": 86_200,
                "currency": "USD",
                "due": (today + timedelta(days=1)).isoformat(),
                "status": "approval",
            },
            {
                "id": "PAY-2843",
                "vendor": "Adriatic Freight SRL",
                "amount": 42_180,
                "currency": "EUR",
                "due": (today + timedelta(days=3)).isoformat(),
                "status": "draft",
            },
        ]
        self.cashflow = []
        base_balance = 8_000_000
        for i in range(90):
            day = today - timedelta(days=89 - i)
            inflow = base_balance + (i * 48_000) + ((i % 6) * 32_500)
            outflow = (base_balance * 0.78) + ((i % 5) * 24_000)
            self.cashflow.append(
                {
                    "date": day.isoformat(),
                    "inflow": int(inflow),
                    "outflow": int(outflow),
                    "net": int(inflow - outflow),
                }
            )
        self.ai_alerts = [
            {
                "id": 1,
                "kind": "liquidity",
                "title": "USD reserve trending below 30d cover",
                "body": "Forecast shows USD reserve dips under 30-day cover. Simulated conversion recommendation: 320K AED to USD.",
                "severity": "high",
            },
            {
                "id": 2,
                "kind": "vendor",
                "title": "Anomalous invoice from Shenzhen Components Ltd",
                "body": "Invoice amount is 38% above the trailing average for this supplier. Route to review before funding.",
                "severity": "medium",
            },
        ]
        self.locs = [
            {
                "id": "LOC-2201",
                "counterparty": "Carrefour MENA",
                "amount": 240_000,
                "currency": "USD",
                "status": "issued",
                "milestone": 2,
                "total": 4,
            },
            {
                "id": "LOC-2202",
                "counterparty": "Migros Turkey",
                "amount": 188_000,
                "currency": "USD",
                "status": "in transit",
                "milestone": 3,
                "total": 4,
            },
        ]
        self.receivables = [
            {
                "id": "RCV-220",
                "buyer": "Carrefour MENA",
                "amount": 480_000,
                "currency": "AED",
                "maturity": (today + timedelta(days=42)).isoformat(),
                "apr": 7.2,
                "status": "listed",
            },
            {
                "id": "RCV-222",
                "buyer": "Migros Turkey",
                "amount": 188_000,
                "currency": "USD",
                "maturity": (today + timedelta(days=58)).isoformat(),
                "apr": 8.1,
                "status": "listed",
            },
        ]
        self.kyc_entities = [
            {
                "entity": "Finara Holdings Ltd",
                "type": "Holding company",
                "expires": (today + timedelta(days=140)).isoformat(),
                "status": "verified",
            },
            {
                "entity": "StablePay Trading LLC",
                "type": "Operating entity",
                "expires": (today + timedelta(days=95)).isoformat(),
                "status": "verified",
            },
            {
                "entity": "Supplier Wallet Program",
                "type": "Partner program",
                "expires": (today + timedelta(days=21)).isoformat(),
                "status": "review",
            },
        ]
        self.aml_flags = [
            {
                "id": "AML-110",
                "entity": "Shenzhen Components Ltd",
                "flag_type": "invoice_spike",
                "severity": "medium",
                "status": "open",
                "created_at": datetime.utcnow().isoformat(),
                "description": "Invoice value materially above the normal supplier pattern.",
            }
        ]
        self.roles = [
            {"role": "Admin", "users": 2, "permissions": ["users", "policy", "finance", "compliance"]},
            {"role": "CFO", "users": 3, "permissions": ["treasury", "payouts", "trade", "reporting"]},
            {"role": "Merchant", "users": 5, "permissions": ["checkout", "invoices", "refunds"]},
            {"role": "Auditor", "users": 2, "permissions": ["audit", "compliance", "read_only"]},
        ]
        self.security_posture = [
            {"label": "SOC 2 Type II", "value": "Demo simulated", "tone": "text-success"},
            {"label": "ISO 27001", "value": "Demo simulated", "tone": "text-success"},
            {"label": "PCI DSS", "value": "Level 2 target", "tone": "text-muted-foreground"},
            {"label": "MFA enforcement", "value": "100%", "tone": "text-success"},
            {"label": "Encryption", "value": "AES-256 / TLS 1.3", "tone": "text-muted-foreground"},
            {"label": "Data residency", "value": "UAE / EU", "tone": "text-muted-foreground"},
        ]
        self.audit_logs = []
        self._seed_audit()

    def _seed_audit(self) -> None:
        events = [
            ("Layla", "payment.confirmed", "TXN-10240", "203.0.113.12"),
            ("Ahmed", "payout.approved", "PAY-2841", "203.0.113.18"),
            ("Nina", "kyb.reviewed", "StablePay Trading LLC", "203.0.113.22"),
            ("Layla", "trade.loc.issued", "LOC-2201", "203.0.113.12"),
        ]
        for offset, event in enumerate(events):
            self.audit_logs.append(
                {
                    "id": f"EVT-{9000 + offset}",
                    "actor": event[0],
                    "action": event[1],
                    "target": event[2],
                    "timestamp": (datetime.utcnow() - timedelta(minutes=offset * 18)).isoformat(timespec="minutes"),
                    "ip": event[3],
                }
            )

    @property
    def treasury_balance(self) -> float:
        return _money(self.stablecoin_balance + sum(self.fiat_balances.values()))

    @property
    def fiat_balance_total(self) -> float:
        return _money(sum(self.fiat_balances.values()))

    def _append_audit(self, actor: str, action: str, target: str, ip: str = "203.0.113.10") -> None:
        self.audit_logs.insert(
            0,
            {
                "id": f"EVT-{10000 + len(self.audit_logs)}",
                "actor": actor,
                "action": action,
                "target": target,
                "timestamp": datetime.utcnow().isoformat(timespec="minutes"),
                "ip": ip,
            },
        )

    def _append_cashflow(self, entry_type: str, amount: float, currency: str, description: str, reference: str) -> None:
        today = date.today().isoformat()
        signed_amount = int(amount)
        record = next((item for item in self.cashflow if item["date"] == today), None)
        if record is None:
            record = {"date": today, "inflow": 0, "outflow": 0, "net": 0}
            self.cashflow.append(record)
            self.cashflow = self.cashflow[-90:]
        if entry_type == "inflow":
            record["inflow"] += signed_amount
        else:
            record["outflow"] += signed_amount
        record["net"] = record["inflow"] - record["outflow"]
        self._append_audit("System", f"cashflow.{entry_type}", reference)

    def get_dashboard(self) -> dict[str, Any]:
        payables_30d = sum(item["amount"] for item in self.upcoming_payables)
        receivables_30d = sum(item["amount"] for item in self.receivables)
        return {
            "kpis": {
                "treasuryBalance": self.treasury_balance,
                "stablecoin": _money(self.stablecoin_balance),
                "fiat": self.fiat_balance_total,
                "momCashflow": 0.182,
                "payables30d": payables_30d,
                "receivables30d": receivables_30d,
                "tradeScore": 87,
            },
            "cashflow": [
                {
                    "date": item["date"][5:],
                    "inflow": item["inflow"],
                    "outflow": item["outflow"],
                    "net": item["net"],
                }
                for item in self.cashflow[-90:]
            ],
            "allocation": self._allocation(),
            "upcomingPayables": deepcopy(self.upcoming_payables[:6]),
            "settlements": deepcopy(self.settlements[:5]),
            "aiAlerts": deepcopy(self.ai_alerts[:3]),
        }

    def get_payments(self) -> dict[str, Any]:
        settled_7d = sum(item["amount"] for item in self.transactions if item["status"] == "settled")
        pending = sum(item["amount"] for item in self.transactions if item["status"] == "pending")
        avg_ticket = settled_7d / max(1, len([item for item in self.transactions if item["status"] == "settled"]))
        return {
            "kpis": {
                "todaysVolume": sum(item["amount"] for item in self.transactions if item["date"] == date.today().isoformat()),
                "settled7d": settled_7d,
                "pending": pending,
                "avgTicket": _money(avg_ticket),
            },
            "paymentLinks": deepcopy(self.payment_links),
            "transactions": deepcopy(self.transactions[:12]),
            "refunds": [
                item for item in self.transactions if item["status"] == "refunded"
            ],
        }

    def get_treasury(self) -> dict[str, Any]:
        payables_total = sum(item["amount"] for item in self.upcoming_payables)
        return {
            "currencyBalances": [
                {"code": "AED", "label": "UAE Dirham", "balance": _money(self.fiat_balances["AED"]), "change": 0.024},
                {"code": "USD", "label": "US Dollar", "balance": _money(self.fiat_balances["USD"]), "change": -0.008},
                {"code": "EUR", "label": "Euro", "balance": _money(self.fiat_balances["EUR"]), "change": 0.012},
                {"code": "USDC", "label": "USD Coin", "balance": _money(self.stablecoin_balance), "change": 0.041},
            ],
            "cashflow": [
                {
                    "date": item["date"][5:],
                    "inflow": item["inflow"],
                    "outflow": item["outflow"],
                    "net": item["net"],
                }
                for item in self.cashflow[-90:]
            ],
            "allocation": self._allocation(),
            "payables30d": payables_total,
            "payablesBreakdown": [
                {"label": "Logistics", "pct": 38},
                {"label": "Components", "pct": 28},
                {"label": "SaaS & Cloud", "pct": 14},
                {"label": "Distribution", "pct": 20},
            ],
            "payroll": {
                "total": 842_400,
                "employees": 42,
                "runDate": (date.today() + timedelta(days=7)).isoformat(),
                "salaries": 724_000,
                "bonuses": 82_000,
                "eosb": 36_400,
            },
            "forecast": [
                {"horizon": "30 days", "value": 11_240_000, "delta": -0.041, "note": "Payroll and AP cycle ahead."},
                {"horizon": "60 days", "value": 12_980_000, "delta": 0.042, "note": "Receivables normalize and collections improve."},
                {"horizon": "90 days", "value": 14_120_000, "delta": 0.131, "note": "Trade financing inflow assumed."},
            ],
        }

    def get_trade(self) -> dict[str, Any]:
        return {
            "kpis": {
                "tradeScore": 87,
                "activeLocs": len(self.locs),
                "activeLocNotional": sum(item["amount"] for item in self.locs),
                "listedReceivables": sum(item["amount"] for item in self.receivables),
                "inTransit": len([item for item in self.locs if item["status"] == "in transit"]),
            },
            "locs": deepcopy(self.locs),
            "shipmentMilestones": [
                {"label": "Issued"},
                {"label": "Docs"},
                {"label": "Shipment"},
                {"label": "Settlement"},
            ],
            "receivables": deepcopy(self.receivables),
            "financingPreview": {
                "advance": 408_000,
                "discount": 4_896,
                "net": 403_104,
            },
        }

    def get_compliance(self) -> dict[str, Any]:
        return {
            "summary": {
                "kybStatus": "Verified",
                "amlFlags30d": len(self.aml_flags),
                "auditEvents": len(self.audit_logs),
                "activeSessions": self.active_sessions,
            },
            "kycEntities": deepcopy(self.kyc_entities),
            "amlFlags": deepcopy(self.aml_flags[:8]),
            "auditLog": deepcopy(self.audit_logs[:12]),
            "roles": deepcopy(self.roles),
            "securityPosture": deepcopy(self.security_posture),
        }

    def create_payment_link(self) -> dict[str, Any]:
        amount = 18_500 + (len(self.payment_links) * 1_750)
        currency = ["AED", "USD", "EUR", "USDC"][len(self.payment_links) % 4]
        item = {
            "id": f"PL-{7740 + len(self.payment_links) + 1}",
            "name": f"Demo Collection Batch #{len(self.payment_links) + 1}",
            "amount": amount,
            "currency": currency,
            "clicks": 0,
            "status": "active",
            "created": date.today().isoformat(),
        }
        self.payment_links.insert(0, item)
        self._append_audit("Layla", "payment_link.created", item["id"])
        return item

    def simulate_payment(self) -> dict[str, Any]:
        source_link = next((item for item in self.payment_links if item["status"] == "active"), None)
        currency = source_link["currency"] if source_link else "AED"
        amount = source_link["amount"] if source_link else 42_500
        customer = source_link["name"] if source_link else "Demo customer"
        txn = {
            "id": f"TXN-{10240 + len(self.transactions) + 1}",
            "customer": customer,
            "rail": "USDC" if currency == "USDC" else "Bank",
            "amount": amount,
            "currency": currency,
            "status": "settled",
            "date": date.today().isoformat(),
        }
        settlement = {
            "id": f"STL-{9920 + len(self.settlements) + 1}",
            "channel": "Stablecoin / USDC" if currency == "USDC" else "Bank Transfer",
            "amount": amount,
            "currency": currency,
            "time": datetime.utcnow().strftime("%H:%M"),
            "status": "settled",
        }
        self.transactions.insert(0, txn)
        self.settlements.insert(0, settlement)
        if currency == "USDC":
            self.stablecoin_balance += amount
        else:
            self.fiat_balances.setdefault(currency, 0.0)
            self.fiat_balances[currency] += amount
        self._append_cashflow("inflow", amount, currency, "Simulated merchant settlement", txn["id"])
        if source_link:
            source_link["status"] = "paid"
            source_link["clicks"] += 1
        self._append_audit("Layla", "payment.settled", txn["id"])
        return txn

    def create_payout(self) -> dict[str, Any]:
        payable = next((item for item in self.upcoming_payables if item["status"] in {"approval", "scheduled", "draft"}), None)
        if payable is None:
            payable = {
                "id": f"PAY-{2840 + len(self.upcoming_payables) + 1}",
                "vendor": "Fallback Supplier",
                "amount": 24_000,
                "currency": "AED",
                "due": date.today().isoformat(),
                "status": "approval",
            }
            self.upcoming_payables.insert(0, payable)
        amount = payable["amount"]
        currency = payable["currency"]
        payout = {
            "id": payable["id"],
            "vendor": payable["vendor"],
            "amount": amount,
            "currency": currency,
            "status": "settled",
            "created": datetime.utcnow().isoformat(timespec="minutes"),
        }
        payable["status"] = "settled"
        self.payouts.insert(0, payout)
        if currency == "USDC":
            self.stablecoin_balance -= amount
        else:
            self.fiat_balances.setdefault(currency, 0.0)
            self.fiat_balances[currency] -= amount
        self._append_cashflow("outflow", amount, currency, "Simulated supplier payout", payout["id"])
        self._append_audit("Ahmed", "payout.settled", payout["id"])
        return payout

    def screen_entity(self, entity_name: str) -> dict[str, Any]:
        normalized = entity_name.lower()
        flagged = any(term in normalized for term in ("shenzhen", "sanction", "watch", "risk"))
        result = {
            "entity_name": entity_name,
            "matches": [],
            "match_count": 0,
            "overall_status": "clear",
            "message": "Sanctions screening completed. No matches found.",
        }
        if flagged:
            flag = {
                "id": f"AML-{110 + len(self.aml_flags) + 1}",
                "entity": entity_name,
                "flag_type": "sanctions_watchlist",
                "severity": "high",
                "status": "open",
                "created_at": datetime.utcnow().isoformat(),
                "description": "Name matched the demo watchlist. Manual review required.",
            }
            self.aml_flags.insert(0, flag)
            result["matches"] = [{"name": entity_name, "list": "demo_watchlist", "score": 92}]
            result["match_count"] = 1
            result["overall_status"] = "flagged"
            result["message"] = "Potential sanctions match detected. Review is required."
            self._append_audit("Nina", "compliance.flagged", flag["id"])
        else:
            self._append_audit("Nina", "compliance.cleared", entity_name)
        return result

    def request_financing(self) -> dict[str, Any]:
        receivable = self.receivables[0]
        funded = {
            "id": f"FND-{310 + len(self.locs)}",
            "buyer": receivable["buyer"],
            "amount": int(receivable["amount"] * 0.85),
            "currency": receivable["currency"],
            "status": "funded",
            "created": datetime.utcnow().isoformat(timespec="minutes"),
        }
        self.stablecoin_balance += funded["amount"] if funded["currency"] == "USDC" else 0
        if funded["currency"] != "USDC":
            self.fiat_balances.setdefault(funded["currency"], 0.0)
            self.fiat_balances[funded["currency"]] += funded["amount"]
        self._append_cashflow("inflow", funded["amount"], funded["currency"], "Simulated trade finance funding", funded["id"])
        self._append_audit("Layla", "trade.financing.funded", funded["id"])
        return funded

    def _allocation(self) -> list[dict[str, Any]]:
        return [
            {"name": "AED Operating", "value": _money(self.fiat_balances["AED"])},
            {"name": "USD Reserve", "value": _money(self.fiat_balances["USD"])},
            {"name": "EUR Trade", "value": _money(self.fiat_balances["EUR"])},
            {"name": "USDC Treasury", "value": _money(self.stablecoin_balance)},
        ]


class DemoStore:
    def __init__(self) -> None:
        self._lock = Lock()
        self._state = DemoState()

    def snapshot(self, section: str) -> dict[str, Any]:
        with self._lock:
            if section == "dashboard":
                return deepcopy(self._state.get_dashboard())
            if section == "payments":
                return deepcopy(self._state.get_payments())
            if section == "treasury":
                return deepcopy(self._state.get_treasury())
            if section == "trade":
                return deepcopy(self._state.get_trade())
            if section == "compliance":
                return deepcopy(self._state.get_compliance())
            raise ValueError(f"Unknown demo section: {section}")

    def create_payment_link(self) -> dict[str, Any]:
        with self._lock:
            return deepcopy(self._state.create_payment_link())

    def simulate_payment(self) -> dict[str, Any]:
        with self._lock:
            return deepcopy(self._state.simulate_payment())

    def create_payout(self) -> dict[str, Any]:
        with self._lock:
            return deepcopy(self._state.create_payout())

    def screen_entity(self, entity_name: str) -> dict[str, Any]:
        with self._lock:
            return deepcopy(self._state.screen_entity(entity_name))

    def request_financing(self) -> dict[str, Any]:
        with self._lock:
            return deepcopy(self._state.request_financing())


demo_store = DemoStore()
