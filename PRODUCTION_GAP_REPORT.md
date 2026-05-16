# StablePay / Finara OS Production Gap Report

Date: 2026-05-16
Repository: `D:\Hykr\StablePay`
Assessment scope: Next.js web app, FastAPI gateway and services, PostgreSQL initialization schema, Solidity contracts, AI modules, Docker/CI, and compliance/integration surfaces.

## Executive Summary

StablePay is currently a broad and well-organized product scaffold for an SME financial operating system, not yet a production-grade fintech platform. The repository has useful domain boundaries across payments, treasury, trade, compliance, scoring, integrations, blockchain, and frontend, but most high-risk business flows are implemented as direct CRUD-style workflows with minimal validation, weak state machines, no durable ledger, placeholder AI/compliance/integration logic, and limited operational controls.

The highest-risk blockers are concentrated in Tier 1: payments, treasury, authentication, tenant isolation, and ledger integrity. Before this platform can safely process real funds or regulated business activity, it needs hardened auth/session controls, request validation, idempotency, immutable accounting, auditable state transitions, real settlement/reconciliation flows, database constraints, and production-grade observability.

## Severity Definitions

- Critical: Blocks handling real money, regulated data, or production tenants. Exploitable or likely to cause financial loss, compliance breach, or data corruption.
- High: Blocks enterprise readiness or creates material operational/security risk.
- Medium: Needed for production maturity, scalability, maintainability, or auditability.
- Low: Important hardening, cleanup, or future-proofing but not a launch blocker.

## Audit Evidence

Representative findings from the codebase:

- `backend/services/*/src/routes/*.py` uses many `payload: dict` request bodies instead of typed Pydantic schemas.
- `backend/shared/utils/config.py` defaults secrets and database credentials to development values such as `JWT_SECRET="change-me"` and `stablepay:stablepay`.
- `backend/shared/middleware/rate_limit_middleware.py` uses per-process in-memory IP rate limiting, which does not work across replicas and is bypass-prone behind proxies.
- `backend/services/auth/src/routes/auth.py` issues JWT refresh tokens but does not persist, rotate, revoke, bind, or audit them.
- `backend/services/payments/src/routes/payments.py` marks checkout sessions completed from client-supplied `tx_hash` without on-chain verification or idempotency.
- `backend/services/compliance/src/routes/compliance.py` sanctions screening always returns clear with `placeholder_sanctions_list`.
- `ai/models/fraud/model.py` and `ai/models/cashflow/model.py` contain explicit placeholder scoring/prediction logic.
- `docker/docker-compose.yml` exposes infrastructure ports and uses default Postgres credentials.
- `blockchain/contracts/*` provide initial funds-flow primitives but lack role granularity, pause coverage across trade contracts, upgrade planning, oracle/event verification patterns, and formal audit artifacts.
- Frontend pages contain mostly static dashboard data and rely on `localStorage` bearer tokens with limited error, refresh, RBAC, and multi-org behavior.

## Critical Gaps

| Area | Gap | Risk | Business Impact | Recommended Implementation Path |
| --- | --- | --- | --- | --- |
| Auth | Refresh tokens are stateless JWTs with no persistence, rotation family, reuse detection, session revocation, or device binding. | Stolen refresh tokens remain usable until expiry; account takeover cannot be reliably contained. | Enterprise customers cannot satisfy security reviews; regulated activity is unsafe. | Add `sessions`, `refresh_tokens`, `login_events`, and `session_revocations` tables. Store hashed refresh token identifiers, rotate on every refresh, revoke token families on reuse, bind sessions to device/IP metadata, and emit audit events. |
| Auth | RBAC is split between a simple `users.role` field and partial `roles/user_roles` tables without enforced permission checks. | Horizontal privilege escalation and unauthorized access to payment/treasury/compliance actions. | CFO/admin/auditor separation cannot be trusted. | Define permission constants, resource scopes, and dependency-based authorization in all services. Enforce org membership and role grants per request. Add tests for denied paths. |
| Tenant isolation | Most APIs accept `organization_id` from query/body rather than deriving it from authenticated claims and membership. | Cross-tenant data access by changing `organization_id`. | Catastrophic SaaS data breach. | Resolve active org from token/session plus membership. Reject arbitrary org IDs unless user has explicit membership. Add row-level query helpers and PostgreSQL RLS migration plan. |
| Payments | Checkout confirmation trusts client-supplied `wallet_address` and `tx_hash` and immediately creates completed transactions. | Fake payments, double-spend acceptance, replay, and settlement mismatch. | Direct financial loss and unreconciled balances. | Add blockchain transaction verification service, network confirmation thresholds, unique tx hash constraints, payer/payee/amount/token validation, and asynchronous confirmation state machine. |
| Payments | No idempotency key support for money-moving endpoints. | Duplicate checkout, payout, invoice, refund, or settlement records under retry. | Double charge/refund/payout risk. | Add `idempotency_keys` table keyed by org, endpoint, method, key, and request hash. Return cached result on retry and reject mismatched request hashes. |
| Payments/Treasury | No double-entry ledger or immutable journal. Current balances are derived from mutable workflow records. | Balances can drift, be overwritten, or fail audit. | Platform cannot be trusted for financial operations. | Introduce `ledger_accounts`, `ledger_journals`, `ledger_entries`, and `ledger_posting_batches`. Enforce balanced debits/credits, immutable posted entries, correction journals, and reconciliation reports. |
| Treasury | Payouts are created as status records only, without approval chain, funding source, bank/wallet rail abstraction, ledger posting, or reconciliation. | Unauthorized or duplicate payout; no reliable cash control. | CFO workflows are unsafe for real treasury use. | Implement payout state machine: draft -> submitted -> approved -> scheduled -> processing -> settled/failed/reversed. Require approvals by policy, idempotency, balance checks, ledger holds, and rail adapters. |
| Compliance | Sanctions screening is a placeholder that always clears. AML logic is manual flag storage only. | Sanctioned entities can transact; AML monitoring is ineffective. | Regulatory breach, account shutdown, penalties. | Build screening provider abstraction, watchlist ingestion, fuzzy matching, case management, ongoing monitoring, and screening audit records. Add blocking controls in onboarding and payment flows. |
| Database | Many status/currency/amount fields lack check constraints; unique constraints are missing for domain identifiers per tenant; some ORM models omit foreign keys present in SQL or vice versa. | Invalid states, duplicate invoices, negative amounts, orphan records. | Data corruption and audit failure. | Move from one init SQL file to Alembic migrations. Add constraints, FK consistency, enum/check constraints, partial unique indexes, non-negative amount checks, and migration tests. |
| Secrets | Development secrets and default credentials are permitted by default. | Accidental production deployment with weak credentials. | Immediate compromise risk. | Use Pydantic settings validation. Fail startup in non-development when secrets are missing/default. Integrate Vault/secret manager references in deployment docs. |

## High Gaps

| Area | Gap | Risk | Business Impact | Recommended Implementation Path |
| --- | --- | --- | --- | --- |
| API validation | Domain services and gateway use raw `dict` payloads for most write endpoints. | Missing required fields, invalid amounts/dates/currencies, inconsistent errors. | Poor reliability and increased support/compliance risk. | Add Pydantic request/response schemas per domain. Validate currency, precision, date order, state-specific requirements, and metadata size. |
| API gateway | Gateway forwards requests but does not consistently propagate auth context, correlation IDs, idempotency keys, or trace headers. | Weak observability and inconsistent enforcement. | Incidents become hard to diagnose; policies drift across services. | Add gateway middleware for request IDs, auth context, tenant context, idempotency forwarding, and standardized error envelopes. |
| Audit logging | Audit tables exist but critical operations do not write durable audit logs. | No forensic record of money movement, access, or compliance decisions. | Enterprise and regulator audits fail. | Add audit event service with append-only records for auth, payment, payout, approval, compliance, configuration, and contract actions. |
| Webhooks | Incoming webhook signature handling is not production-grade; outgoing delivery lacks retry policy, delivery logs, signing version, and replay protection. | Spoofed inbound events and unreliable customer integrations. | Data sync failures and security exposure. | Implement HMAC signature verification over raw body, timestamp tolerance, replay nonce store, delivery attempts, exponential backoff, dead-letter queue, and customer-facing logs. |
| Settlements | Settlement records are passive database rows without batch construction, cutoffs, settlement windows, failure handling, or rail reconciliation. | Merchant balances and payouts become incorrect. | Payments product cannot close daily books. | Implement settlement batches with eligible transaction selection, ledger postings, reconciliation states, chain/bank confirmation, and settlement reporting. |
| Refunds | Refund endpoint mutates transaction status immediately and creates a pending refund without original amount caps or multi-refund accounting. | Over-refunds and incorrect transaction lifecycle. | Financial loss and customer disputes. | Add refundable balance calculation, partial refund support, refund state machine, rail execution, ledger postings, and transaction/refund constraints. |
| Treasury | Cash flow and overview endpoints calculate simple aggregates over current records. | Forecasts and balances are not ledger-backed. | CFO analytics may be misleading. | Rebase treasury overview on ledger accounts, aging schedules, commitments, receivables/payables, and forecast scenarios. |
| Trade | Letters of credit, invoice financing, escrow, receivables marketplace, and supplier financing lack complete lifecycle rules and underwriting controls. | Premature funding, invalid milestone completion, legal mismatch. | Trade finance product is not bank-grade. | Define explicit workflow state machines, document requirements, approval gates, risk checks, disbursement conditions, and ledger/contract integration points. |
| Blockchain | Trade contracts lack `Pausable`, granular `AccessControl`, oracle/attestation architecture, dispute handling, and upgrade/migration plan. | Funds can be locked/released under weak authority assumptions. | Protocol cannot be safely administered in production. | Add role-based access, emergency pause, attestation/oracle registry, dispute states, timelocks, upgrade decision record, and comprehensive security tests. |
| Blockchain | Invoice financing contract sends funds directly to borrower and repayment directly to lender without platform controls, collateral registry, or receivable ownership enforcement. | Fraudulent invoice financing and weak recovery/default handling. | Trade financing cannot be trusted by lenders. | Introduce invoice asset registry/NFT or tokenized claim, borrower/lender verification, funding escrow, servicing logic, default claims, and off-chain legal metadata hooks. |
| AI | Fraud, credit, cash flow, and treasury health outputs are heuristic/demo-based with no training pipeline, model registry, validation, or drift monitoring. | False confidence in automated decisions. | Bad approvals, missed fraud, and compliance explainability gaps. | Build feature store tables, training jobs, model registry, metrics, explainability outputs, manual override flow, and human-in-the-loop review queues. |
| Frontend | Dashboard pages contain static data and incomplete real API/state integration. | Operators see stale or misleading business data. | Product cannot support real customer operations. | Replace static data with typed API hooks, loading/error/empty states, RBAC-aware nav, org switcher, and audit-visible actions. |
| Frontend auth | Access token stored in `localStorage`; refresh flow and route protection are incomplete. | XSS token theft and broken session handling. | Enterprise security review failure. | Prefer httpOnly secure cookies or hardened BFF pattern. Add route guards, refresh handling, session expiration UX, and device/session management. |
| DevOps | Docker Compose is development-oriented; no production Kubernetes, network policies, secret management, or hardened container config. | Unsafe deployment posture. | Cannot deploy to enterprise/cloud environments safely. | Add production Dockerfiles, Helm/Kubernetes manifests, non-root users, health/readiness probes, resource limits, network policies, and secret references. |
| Observability | No Prometheus metrics, structured tracing, Sentry initialization, business event monitoring, or alerting. | Slow incident detection and poor supportability. | Production operations are brittle. | Add OpenTelemetry tracing, Prometheus metrics, Sentry, structured JSON logs, dashboards, and alerts for auth, payments, ledger, queue, DB, chain, and webhook failures. |
| Testing | Minimal/no backend service tests, frontend tests, AI validation tests, load tests, or attack simulations beyond a basic contract test file. | Regressions in money movement and compliance flows. | Unsafe release process. | Create risk-based test matrix: unit, integration, contract, E2E, property-based ledger tests, concurrency tests, load tests, and blockchain attack simulations. |

## Medium Gaps

| Area | Gap | Risk | Business Impact | Recommended Implementation Path |
| --- | --- | --- | --- | --- |
| Configuration | Settings use a hand-rolled class instead of validated environment models. | Type/format errors surface at runtime. | Deployment instability. | Adopt `pydantic-settings`, environment-specific validation, and secret redaction in logs. |
| Rate limiting | In-memory IP limiter is not distributed and does not understand user/org/API key. | Bypass under multiple replicas; bad customer experience under NAT. | Weak API protection. | Move rate limiting to Redis with org/user/API-key buckets and endpoint-specific policies. |
| API keys | API key helper exists but no full API key lifecycle is implemented. | Integrations cannot be safely delegated. | Enterprise integrations blocked. | Add hashed API keys, scopes, expiry, rotation, last-used tracking, and audit logs. |
| Data privacy | Sensitive fields such as bank account, mfa secret, webhook secret, legal representative IDs, and documents are stored as plain text. | PII/payment data exposure. | Compliance and customer trust risk. | Add field-level encryption, key rotation, tokenization, and data classification. |
| Retention | No retention, deletion, legal hold, or archival policy is implemented. | Over-retention or premature deletion of regulated data. | Regulatory and privacy risk. | Define retention policies by domain and implement purge/archive jobs with audit trails. |
| Integrations | ERP, banking, shipment, and customs integrations are placeholders or static data. | External connectivity claims are not real. | Enterprise sales and onboarding risk. | Build provider adapters with normalized events, OAuth/API-key credential vaulting, sync cursors, retry handling, and reconciliation. |
| Background jobs | Celery tasks are mostly stubs returning simple status messages. | Critical async work is not performed. | Settlement, scoring, sync, and notifications do not run reliably. | Implement task payload schemas, idempotent workers, retries, DLQs, observability, and scheduled jobs. |
| CI/CD | CI installs only gateway dependencies for backend and lacks security scans, migrations, multi-service tests, or Docker image checks. | Broken services can pass CI. | Release confidence is low. | Add per-service dependency install/test, Alembic migration tests, SAST/dependency scanning, contract coverage, frontend E2E, and image scanning. |
| Documentation | README is broad but production architecture/security/API/deployment docs are missing. | Team cannot operate or audit the system. | Slow delivery and enterprise diligence failure. | Generate and maintain the required doc set after implementation decisions stabilize. |

## Placeholder and Mock Implementation Inventory

| Location | Type | Production Replacement |
| --- | --- | --- |
| `ai/models/fraud/model.py` | Placeholder fraud scoring fallback | Trained fraud model, feature engineering, explainability, monitoring. |
| `ai/models/cashflow/model.py` | Placeholder cash flow predictions when insufficient data | Forecast pipeline with confidence intervals and scenario inputs. |
| `backend/services/compliance/src/routes/compliance.py` | Sanctions endpoint always returns clear | Real screening provider/list ingestion and case workflow. |
| `backend/services/integrations/src/routes/integrations.py` | Placeholder ERP/bank/customs responses | Provider adapters and sync engine. |
| `backend/services/*/src/tasks/*.py` | Stub Celery jobs | Idempotent production background workflows. |
| `apps/web/src/app/(dashboard)/dashboard/page.tsx` | Static dashboard metrics/activity | API-backed CFO/merchant dashboard. |
| `blockchain/scripts/deploy.ts` | Deploys mock tokens | Environment-aware deployment using verified production token addresses. |

## Domain Implementation Roadmap

### Tier 1: Payments + Treasury

1. Establish platform primitives:
   - Auth session model, RBAC, tenant enforcement, audit service.
   - Idempotency service and standardized API errors.
   - Alembic migration baseline and database constraints.
   - Immutable double-entry ledger.

2. Harden payments:
   - Checkout/session state machine.
   - On-chain transaction verification.
   - Unique transaction hash and replay protection.
   - Refund state machine and partial refunds.
   - Settlement batching and reconciliation.
   - Webhook signing, retries, and delivery logs.

3. Harden treasury:
   - Ledger-backed cash accounts and balances.
   - Payout approval policies and segregation of duties.
   - Payout rail abstraction for bank/stablecoin/manual.
   - Accounts payable lifecycle and reconciliation.
   - Cash forecast using real historical ledger/cashflow data.

### Tier 2: Compliance + Trade

1. Compliance:
   - KYB case lifecycle and required document rules.
   - Sanctions/PEP/adverse media provider abstraction.
   - AML transaction monitoring jobs and risk flags.
   - Regulatory audit exports and immutable event logs.

2. Trade:
   - Invoice lifecycle and debtor validation.
   - Underwriting queue and approval gates.
   - Receivable tokenization/claim registry design.
   - LoC, escrow, and financing state machines.
   - Smart contract/legal metadata bridge.

### Tier 3: AI + Credit

1. Feature engineering:
   - Transaction, ledger, invoice, vendor, compliance, and behavioral features.
   - Feature snapshots for explainability and reproducibility.

2. Model operations:
   - Training pipelines, validation metrics, model registry.
   - Drift detection and scoring audit trails.
   - Human override and risk review workflows.

3. Product integration:
   - Fraud holds in payments.
   - Credit recommendations in trade finance.
   - Liquidity warnings in treasury.

## Database Productionization Plan

Required migrations:

- Baseline existing schema into Alembic.
- Add check constraints for positive amounts, valid status values, currency codes, date ordering, and percentage bounds.
- Add unique indexes:
  - `(organization_id, invoice_number)` for merchant and supplier invoices.
  - `(organization_id, payout_number)`.
  - `(organization_id, loc_number)`.
  - `(network, tx_hash)` where `tx_hash IS NOT NULL`.
  - Idempotency keys by `(organization_id, method, route, key)`.
- Add FK consistency to ORM models for organization/user references.
- Add ledger tables:
  - `ledger_accounts`
  - `ledger_journals`
  - `ledger_entries`
  - `ledger_entry_links`
  - `ledger_reconciliation_runs`
- Add auth/session tables:
  - `auth_sessions`
  - `refresh_tokens`
  - `mfa_factors`
  - `login_events`
- Add event/audit tables:
  - `audit_events`
  - `domain_events`
  - `webhook_deliveries`
  - `compliance_cases`
- Add encrypted sensitive fields or encrypted payload tables for PII and payment credentials.
- Define tenant isolation strategy using application-level enforcement first, then PostgreSQL RLS once query paths are centralized.

## Smart Contract Risk Summary

| Contract | Key Risks | Recommended Path |
| --- | --- | --- |
| `StablePayPayment.sol` | Basic payment escrow exists, but no role granularity, no protocol-level settlement integration, no dispute or confirmation model. | Add `AccessControl`, emergency operations, event schema review, settlement adapter, and invariant tests. |
| `StablePaySettlement.sol` | Settlement completion is owner/payment-contract controlled but not linked to real batch accounting or merchant claims. | Link settlement IDs to backend ledger batch hashes, add batch integrity proofs/events, and failure/reversal states. |
| `StablePayLetterOfCredit.sol` | Beneficiary/owner can draw funds with limited document/milestone/oracle controls. | Add document attestation registry, approval states, expiry/dispute states, and role separation. |
| `StablePayEscrow.sol` | Milestone completion can be triggered by buyer, seller, or owner. | Replace with buyer acceptance, seller submission, optional arbitrator/oracle, dispute windows, and partial release controls. |
| `StablePayInvoiceFinancing.sol` | No invoice ownership, debtor confirmation, platform underwriting, collateral token, or legal claim tracking. | Build invoice asset registry/token architecture, funding escrow, claim assignment, servicing, and default handling. |
| `StablePayToken.sol` | Mock token only. | Restrict to local/test deployments; production uses verified external token addresses. |

Required contract testing:

- Reentrancy and malicious ERC20 simulation.
- Unauthorized role attempts.
- Pause/emergency behavior.
- State transition invariants.
- Double funding/double repayment attempts.
- Expiry/default edge cases.
- Gas snapshots for critical flows.
- Fuzz tests for milestone arrays, fees, and amounts.

## Security and Compliance Hardening Plan

- Auth:
  - Refresh rotation, MFA factors, OAuth/SAML-ready identity provider abstraction, API keys, service-to-service auth.
- Authorization:
  - Permission matrix by role and domain, org membership checks, resource ownership checks.
- Data protection:
  - Field encryption, key rotation, PII classification, document storage policy, secure webhook/API secrets.
- Compliance:
  - KYB/KYC cases, AML rules engine, sanctions provider, audit export, retention policies, regulator-ready logs.
- AppSec:
  - SAST, dependency scanning, secrets scanning, container scanning, SBOMs, threat model, abuse cases.
- Runtime:
  - WAF recommendations, Redis-backed rate limits, IP/device risk scoring, request signing for webhooks.

## Documentation Deliverables To Generate After Hardening

The following files should be produced as implementation stabilizes:

- `SYSTEM_ARCHITECTURE_FINAL.md`
- `SECURITY_MODEL.md`
- `SMART_CONTRACT_AUDIT.md`
- `AI_MODEL_FRAMEWORK.md`
- `API_REFERENCE.md`
- `DEPLOYMENT_GUIDE.md`
- `COMPLIANCE_FRAMEWORK.md`

Recommended order:

1. `SECURITY_MODEL.md`
2. `SYSTEM_ARCHITECTURE_FINAL.md`
3. `API_REFERENCE.md`
4. `DEPLOYMENT_GUIDE.md`
5. `SMART_CONTRACT_AUDIT.md`
6. `COMPLIANCE_FRAMEWORK.md`
7. `AI_MODEL_FRAMEWORK.md`

## Immediate Next Implementation Slice

The safest first productionization slice is not frontend polish or contract expansion. It should be the shared financial and security substrate:

1. Add Alembic and baseline migrations.
2. Add Pydantic settings validation that refuses default secrets outside development.
3. Add typed schemas for auth and payments writes.
4. Add persisted auth sessions and refresh token rotation.
5. Add tenant authorization dependency.
6. Add idempotency table and middleware/dependency for write endpoints.
7. Add ledger tables and posting service.
8. Convert checkout confirmation and refund creation onto idempotent, ledger-aware state machines.
9. Add tests for auth rotation, tenant isolation, idempotency, ledger balance invariants, payment confirmation, and refund limits.

This sequence creates the foundation needed for the rest of the platform to become real without repeatedly reworking money movement and access control.
