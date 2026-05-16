# StablePay - SME Financial Operating System

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![CI](https://github.com/your-org/stablepay/actions/workflows/ci.yml/badge.svg)](https://github.com/your-org/stablepay/actions)

**Blockchain-native financial infrastructure for modern SMEs.**

StablePay is an open-source, modular enterprise fintech operating system that enables SMEs to accept, move, manage, borrow, and trade money globally. Built on Polygon with stablecoin settlement, compliant with CBUAE/PTSR standards, and ready for AI-powered financial intelligence.

---

## 🏗️ Architecture

```
├── apps/
│   ├── web/              # Next.js 14 frontend (TypeScript, Tailwind, ShadCN)
│   └── docs/             # Documentation
├── backend/
│   ├── api-gateway/      # FastAPI gateway (port 8000)
│   ├── services/
│   │   ├── auth/         # Authentication & RBAC (8001)
│   │   ├── treasury/     # Treasury, AP, Suppliers, Payroll (8002)
│   │   ├── payments/     # Merchant payments, checkout, invoices (8003)
│   │   ├── trade/        # Letters of Credit, Invoice financing, Escrow (8004)
│   │   ├── compliance/   # KYB/KYC, AML, Sanctions, Audit (8005)
│   │   ├── scoring/      # AI/ML scoring, fraud, credit (8006)
│   │   └── integrations/ # Webhooks, ERP, Banking APIs (8007)
│   ├── shared/           # Shared models, schemas, utilities
│   └── migrations/       # PostgreSQL initialization
├── blockchain/
│   ├── contracts/        # Solidity smart contracts
│   │   ├── payments/     # Payment processing, Settlement
│   │   ├── trade/        # Letters of Credit, Escrow, Invoice Financing
│   │   └── tokens/       # USDC/AE Coin mock tokens
│   ├── test/             # Contract tests
│   └── scripts/          # Deployment scripts
├── ai/
│   ├── models/           # ML model definitions
│   │   ├── fraud/        # XGBoost fraud detection
│   │   ├── credit/       # SME credit scoring
│   │   └── cashflow/     # Cash flow prediction
│   ├── services/         # FastAPI inference service
│   └── notebooks/        # Jupyter notebooks
└── docker/               # Docker Compose configurations
```

## 🚀 Quick Start

### Prerequisites

- Docker & Docker Compose
- Node.js 20+
- Python 3.12+
- PostgreSQL 16
- Redis 7

### Local Development

1. **Clone and setup environment:**

```bash
git clone https://github.com/your-org/stablepay.git
cd stablepay
cp .env.example .env
# Edit .env with your configuration
```

2. **Start infrastructure:**

```bash
docker compose -f docker/docker-compose.yml up -d postgres redis
```

3. **Start backend services:**

```bash
# API Gateway
cd backend/api-gateway
pip install -r requirements.txt
uvicorn src.main:app --reload --port 8000

# Auth Service
cd backend/services/auth
pip install -r requirements.txt
uvicorn src.main:app --reload --port 8001

# Repeat for other services (treasury:8002, payments:8003, trade:8004, etc.)
```

4. **Start frontend:**

```bash
cd apps/web
npm install
npm run dev
```

5. **Deploy smart contracts (testnet):**

```bash
cd blockchain
npm install
npx hardhat compile
npx hardhat run scripts/deploy.ts --network polygonAmoy
```

### Docker (Full Stack)

```bash
docker compose -f docker/docker-compose.yml up --build
```

Access:
- Frontend: http://localhost:3000
- API Gateway: http://localhost:8000/docs
- API Gateway ReDoc: http://localhost:8000/redoc

## 📦 Services Overview

### Merchant Payments Hub
- QR-based stablecoin checkout (USDC/AE Coin)
- POS dashboard with real-time transaction monitoring
- Invoice payment links with shareable URLs
- WalletConnect integration
- Settlement engine with batch processing
- Refund workflow management

### Treasury & Financial Operations
- Accounts payable management with approval workflows
- Supplier management with payment terms tracking
- Bulk payout processing
- Payroll architecture (ready for HR integration)
- Cash flow visualization with charts
- Expense categorization and tracking
- VAT/tax log management

### Trade Finance Engine
- Smart contract Letters of Credit (standby & commercial)
- Invoice financing with advance rates
- Receivables marketplace for invoice trading
- Escrow agreements with milestone-based release
- SME trade credit scoring
- Supplier financing workflows

### AI Risk & Credit Engine
- Real-time fraud detection scoring
- Invoice anomaly detection
- SME trade credit score calculation
- Vendor risk assessment
- Cash flow prediction (30/60/90 day forecasts)
- Treasury health score
- AI CFO assistant architecture (LLM-ready)

### Compliance Core
- KYB/KYC document management
- AML flag monitoring and severity tracking
- Sanctions screening (OFAC/EU/UN lists)
- Complete audit trail
- Compliance report generation
- Role-based access control (Admin/CFO/Merchant/Supplier/Auditor)

### Integration Layer
- RESTful API with OpenAPI docs
- GraphQL-ready architecture
- ERP integration placeholders
- Banking API abstraction layer
- Customs/logistics integration
- Webhook management system

## 🔗 API Endpoints

### Authentication (`/api/v1/auth`)
- `POST /login` - User authentication
- `POST /register` - User registration
- `POST /refresh` - Token refresh
- `GET /me` - Current user info

### Treasury (`/api/v1/treasury`)
- `GET /overview` - Treasury dashboard data
- `GET /cashflow` - Cash flow entries
- `GET /accounts-payable` - Invoice list
- `GET /suppliers` - Supplier management
- `POST /payouts` - Create payout
- `GET /expenses` - Expense list
- `GET /tax-logs` - Tax records

### Payments (`/api/v1/payments`)
- `POST /checkout` - Create checkout session
- `GET /transactions` - Transaction history
- `GET /settlements` - Settlement records
- `POST /refunds` - Process refund
- `GET /invoices` - Invoice list
- `POST /invoices` - Create invoice

### Trade (`/api/v1/trade`)
- `GET/POST /letters-of-credit` - LoC management
- `GET/POST /invoice-financing` - Financing requests
- `GET /receivables-marketplace` - Invoice marketplace
- `GET /sme-score/{org_id}` - Trade score
- `POST /escrow` - Create escrow

### Compliance (`/api/v1/compliance`)
- `POST /kyb` - Submit KYB
- `GET /kyb/{org_id}` - KYB status
- `GET /aml/flags` - AML flags
- `POST /sanctions/screen` - Sanctions check
- `GET /audit-logs` - Audit trail
- `GET /reports` - Compliance reports

### Scoring (`/api/v1/scoring`)
- `GET /fraud/check` - Fraud detection
- `GET /credit/sme-score/{org_id}` - Credit score
- `GET /credit/vendor-risk/{vendor_id}` - Vendor risk
- `GET /cashflow/predict` - Cash flow forecast
- `GET /treasury-health/{org_id}` - Health score

## 🔐 User Roles

| Role | Permissions |
|------|-------------|
| **Admin** | Full system access |
| **CFO** | Treasury, payments (read), reports, approvals |
| **Merchant** | Payments (all), transactions, settlements, invoices |
| **Supplier** | Invoices (read), payouts (read), profile |
| **Auditor** | Reports (read), audit logs, transactions (read) |

## 🧠 AI/ML Models

### Fraud Detection (XGBoost)
- Real-time transaction scoring
- Feature engineering: velocity, amount anomalies, behavioral patterns
- Demo notebook: `ai/notebooks/fraud_detection_demo.ipynb`

### Credit Scoring
- SME trade credit score (300-850)
- Factors: payment history, trade volume, invoice performance
- Automated tier assignment (Platinum/Gold/Silver/Bronze)

### Cash Flow Prediction
- Time series forecasting
- 30/60/90 day projections
- Confidence scoring
- Cash runway analysis

## 📜 Smart Contracts (Polygon)

| Contract | Description |
|----------|-------------|
| `StablePayPayment.sol` | Payment processing with fee collection |
| `StablePaySettlement.sol` | Batch settlement management |
| `StablePayLetterOfCredit.sol` | On-chain letters of credit |
| `StablePayEscrow.sol` | Milestone-based escrow |
| `StablePayInvoiceFinancing.sol` | Invoice-backed lending |
| `StablePayToken.sol` | Mock USDC/AE Coin token |

## 🐳 Docker Compose

```bash
# Full stack
docker compose -f docker/docker-compose.yml up --build

# With hot reload
docker compose -f docker/docker-compose.yml -f docker/docker-compose.dev.yml up

# Production
docker compose -f docker/docker-compose.yml -f docker/docker-compose.prod.yml up -d
```

Services: api-gateway, auth-service, treasury-service, payments-service, trade-service, compliance-service, scoring-service, integrations-service, postgres, redis, celery-worker, frontend

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 🌐 Enterprise Enhancement

This base version is designed for enhancement with:
- **IBM Bob** - Enterprise AI copilot integration
- **IBM watsonx** - Advanced AI/ML model serving
- **Enterprise SSO** - SAML/OIDC integration
- **High Availability** - Kubernetes deployment
- **Multi-region** - Global deployment support

---

Built with ❤️ for the future of SME finance.
