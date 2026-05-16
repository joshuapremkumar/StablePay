-- =============================================================================
-- StablePay - SME Economic Infrastructure Platform
-- PostgreSQL Initialization Script
-- =============================================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- ORGANIZATIONS & USERS
-- =============================================================================

CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    legal_name VARCHAR(255),
    registration_number VARCHAR(100),
    tax_id VARCHAR(100),
    business_type VARCHAR(50),
    industry VARCHAR(100),
    country VARCHAR(3),
    timezone VARCHAR(50) DEFAULT 'UTC',
    logo_url VARCHAR(500),
    website VARCHAR(500),
    status VARCHAR(20) DEFAULT 'active',
    kyb_status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(128) NOT NULL,
    last_name VARCHAR(128) NOT NULL,
    phone VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'member',
    organization_id UUID REFERENCES organizations(id),
    is_active BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE,
    mfa_enabled BOOLEAN DEFAULT FALSE,
    mfa_secret VARCHAR(100),
    last_login_at TIMESTAMPTZ,
    avatar_url VARCHAR(500),
    locale VARCHAR(10) DEFAULT 'en',
    metadata_json JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_organization ON users(organization_id);

-- =============================================================================
-- ROLES & PERMISSIONS
-- =============================================================================

CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    permissions JSONB,
    is_system BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) NOT NULL,
    role_id UUID REFERENCES roles(id) NOT NULL,
    organization_id UUID REFERENCES organizations(id) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_roles_user ON user_roles(user_id);
CREATE INDEX idx_user_roles_org ON user_roles(organization_id);

-- =============================================================================
-- MERCHANT PAYMENTS
-- =============================================================================

CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) NOT NULL,
    transaction_type VARCHAR(50) NOT NULL,
    amount NUMERIC(20, 4) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USDC',
    status VARCHAR(20) DEFAULT 'pending',
    description TEXT,
    merchant_name VARCHAR(255),
    customer_email VARCHAR(255),
    customer_wallet VARCHAR(255),
    checkout_session_id UUID,
    wallet_address VARCHAR(255),
    tx_hash VARCHAR(255),
    block_number VARCHAR(100),
    network VARCHAR(50) DEFAULT 'polygon',
    fee_amount NUMERIC(20, 4) DEFAULT 0,
    fee_currency VARCHAR(10) DEFAULT 'USDC',
    completed_at TIMESTAMPTZ,
    refunded_at TIMESTAMPTZ,
    metadata_json JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_transactions_org ON transactions(organization_id);
CREATE INDEX idx_transactions_tx_hash ON transactions(tx_hash);
CREATE INDEX idx_transactions_status ON transactions(status);

CREATE TABLE IF NOT EXISTS checkout_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) NOT NULL,
    amount NUMERIC(20, 4) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USDC',
    description TEXT,
    merchant_name VARCHAR(255),
    customer_email VARCHAR(255),
    customer_wallet VARCHAR(255),
    status VARCHAR(20) DEFAULT 'pending',
    redirect_url VARCHAR(500),
    cancel_url VARCHAR(500),
    wallet_address VARCHAR(255),
    tx_hash VARCHAR(255),
    paid_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    metadata_json JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS settlements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) NOT NULL,
    settlement_date DATE NOT NULL,
    amount NUMERIC(20, 4) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USDC',
    status VARCHAR(20) DEFAULT 'pending',
    transaction_count NUMERIC(10, 0) DEFAULT 0,
    reference VARCHAR(255),
    destination_wallet VARCHAR(255),
    batch_tx_hash VARCHAR(255),
    metadata_json JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS merchant_invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) NOT NULL,
    invoice_number VARCHAR(50) NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255),
    customer_wallet VARCHAR(255),
    amount NUMERIC(20, 4) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USDC',
    status VARCHAR(20) DEFAULT 'pending',
    due_date DATE,
    issue_date DATE,
    description TEXT,
    payment_link VARCHAR(500),
    paid_at TIMESTAMPTZ,
    tx_hash VARCHAR(255),
    metadata_json JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS refunds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) NOT NULL,
    transaction_id UUID REFERENCES transactions(id) NOT NULL,
    amount NUMERIC(20, 4) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USDC',
    reason TEXT,
    status VARCHAR(20) DEFAULT 'pending',
    processed_at TIMESTAMPTZ,
    tx_hash VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS payment_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) NOT NULL,
    url VARCHAR(500) UNIQUE NOT NULL,
    amount NUMERIC(20, 4) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USDC',
    description TEXT,
    status VARCHAR(20) DEFAULT 'active',
    expires_at TIMESTAMPTZ,
    max_uses NUMERIC(10, 0) DEFAULT 1,
    use_count NUMERIC(10, 0) DEFAULT 0,
    metadata_json JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMPTZ
);

-- =============================================================================
-- TREASURY & ACCOUNTS PAYABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS suppliers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) NOT NULL,
    name VARCHAR(255) NOT NULL,
    contact_name VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(20),
    address TEXT,
    tax_id VARCHAR(100),
    payment_terms VARCHAR(50) DEFAULT 'net_30',
    payment_method VARCHAR(50) DEFAULT 'bank_transfer',
    bank_account TEXT,
    currency VARCHAR(3) DEFAULT 'AED',
    status VARCHAR(20) DEFAULT 'active',
    total_invoiced NUMERIC(20, 4) DEFAULT 0,
    total_paid NUMERIC(20, 4) DEFAULT 0,
    balance NUMERIC(20, 4) DEFAULT 0,
    category VARCHAR(100),
    metadata_json JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) NOT NULL,
    invoice_number VARCHAR(50) NOT NULL,
    supplier_id UUID REFERENCES suppliers(id),
    supplier_name VARCHAR(255) NOT NULL,
    supplier_email VARCHAR(255),
    amount NUMERIC(20, 4) NOT NULL,
    currency VARCHAR(3) DEFAULT 'AED',
    status VARCHAR(20) DEFAULT 'pending',
    due_date DATE,
    issue_date DATE,
    description TEXT,
    category VARCHAR(50),
    tax_amount NUMERIC(20, 4) DEFAULT 0,
    tax_rate NUMERIC(5, 2) DEFAULT 0,
    file_url VARCHAR(500),
    approved_by UUID,
    approved_at TIMESTAMPTZ,
    paid_at TIMESTAMPTZ,
    metadata_json JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS payouts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) NOT NULL,
    payout_number VARCHAR(50),
    amount NUMERIC(20, 4) NOT NULL,
    currency VARCHAR(3) DEFAULT 'AED',
    payment_method VARCHAR(50) DEFAULT 'bank_transfer',
    status VARCHAR(20) DEFAULT 'pending',
    description TEXT,
    reference VARCHAR(255),
    created_by UUID,
    approved_by UUID,
    approved_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    failure_reason TEXT,
    metadata_json JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS payout_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payout_id UUID REFERENCES payouts(id) NOT NULL,
    invoice_id UUID,
    supplier_id UUID,
    amount NUMERIC(20, 4) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payroll_runs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) NOT NULL,
    pay_period_start DATE NOT NULL,
    pay_period_end DATE NOT NULL,
    total_amount NUMERIC(20, 4) NOT NULL,
    currency VARCHAR(3) DEFAULT 'AED',
    status VARCHAR(20) DEFAULT 'draft',
    employee_count NUMERIC(10, 0) DEFAULT 0,
    processed_by UUID,
    processed_at TIMESTAMPTZ,
    metadata_json JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS cash_flow_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) NOT NULL,
    date DATE NOT NULL,
    entry_type VARCHAR(20) NOT NULL,
    amount NUMERIC(20, 4) NOT NULL,
    currency VARCHAR(3) DEFAULT 'AED',
    category VARCHAR(100),
    description TEXT,
    reference VARCHAR(255),
    source VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) NOT NULL,
    date DATE NOT NULL,
    category VARCHAR(50) NOT NULL,
    amount NUMERIC(20, 4) NOT NULL,
    currency VARCHAR(3) DEFAULT 'AED',
    description TEXT,
    vendor VARCHAR(255),
    status VARCHAR(20) DEFAULT 'pending',
    receipt_url VARCHAR(500),
    approved_by UUID,
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS tax_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) NOT NULL,
    tax_type VARCHAR(50) NOT NULL,
    tax_period VARCHAR(7) NOT NULL,
    amount NUMERIC(20, 4) NOT NULL,
    currency VARCHAR(3) DEFAULT 'AED',
    status VARCHAR(20) DEFAULT 'pending',
    filing_date DATE,
    reference VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMPTZ
);

-- =============================================================================
-- TRADE FINANCE
-- =============================================================================

CREATE TABLE IF NOT EXISTS letters_of_credit (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) NOT NULL,
    loc_number VARCHAR(50) UNIQUE NOT NULL,
    loc_type VARCHAR(30) DEFAULT 'standby',
    amount NUMERIC(20, 4) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USDC',
    status VARCHAR(20) DEFAULT 'issued',
    applicant_name VARCHAR(255) NOT NULL,
    applicant_address TEXT,
    beneficiary_name VARCHAR(255) NOT NULL,
    beneficiary_address TEXT,
    issue_date TIMESTAMPTZ,
    expiry_date TIMESTAMPTZ,
    terms_conditions TEXT,
    supporting_docs TEXT,
    smart_contract_address VARCHAR(255),
    tx_hash VARCHAR(255),
    approved_by UUID,
    approved_at TIMESTAMPTZ,
    metadata_json JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS invoice_financing (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) NOT NULL,
    invoice_number VARCHAR(50) NOT NULL,
    invoice_amount NUMERIC(20, 4) NOT NULL,
    funding_amount NUMERIC(20, 4) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USDC',
    status VARCHAR(20) DEFAULT 'pending',
    interest_rate NUMERIC(5, 2) DEFAULT 0,
    advance_rate NUMERIC(5, 2) DEFAULT 0,
    funding_date TIMESTAMPTZ,
    maturity_date TIMESTAMPTZ,
    repayment_date TIMESTAMPTZ,
    debtor_name VARCHAR(255),
    debtor_address TEXT,
    invoice_due_date TIMESTAMPTZ,
    supporting_docs TEXT,
    smart_contract_address VARCHAR(255),
    token_id VARCHAR(100),
    tx_hash VARCHAR(255),
    metadata_json JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS receivable_listings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) NOT NULL,
    invoice_number VARCHAR(50) NOT NULL,
    amount NUMERIC(20, 4) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USDC',
    discount_rate NUMERIC(5, 2) NOT NULL,
    remaining_days NUMERIC(10, 0),
    debtor_name VARCHAR(255),
    debtor_rating VARCHAR(10),
    status VARCHAR(20) DEFAULT 'active',
    invoice_financing_id UUID REFERENCES invoice_financing(id),
    smart_contract_address VARCHAR(255),
    metadata_json JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS escrow_agreements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) NOT NULL,
    escrow_number VARCHAR(50) UNIQUE NOT NULL,
    amount NUMERIC(20, 4) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USDC',
    status VARCHAR(20) DEFAULT 'pending',
    buyer_name VARCHAR(255) NOT NULL,
    seller_name VARCHAR(255) NOT NULL,
    description TEXT,
    terms_conditions TEXT,
    milestone_count NUMERIC(5, 0) DEFAULT 0,
    completed_milestones NUMERIC(5, 0) DEFAULT 0,
    released_amount NUMERIC(20, 4) DEFAULT 0,
    expires_at TIMESTAMPTZ,
    released_at TIMESTAMPTZ,
    smart_contract_address VARCHAR(255),
    tx_hash VARCHAR(255),
    metadata_json JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS shipment_milestones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    escrow_id UUID REFERENCES escrow_agreements(id) NOT NULL,
    milestone_number NUMERIC(5, 0) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'pending',
    trigger_condition TEXT,
    amount_to_release NUMERIC(20, 4) DEFAULT 0,
    completed_at TIMESTAMPTZ,
    verified_by UUID,
    tx_hash VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS supplier_financing (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) NOT NULL,
    supplier_id UUID NOT NULL,
    financing_amount NUMERIC(20, 4) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USDC',
    interest_rate NUMERIC(5, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    term_days NUMERIC(5, 0),
    funded_at TIMESTAMPTZ,
    repayment_date TIMESTAMPTZ,
    smart_contract_address VARCHAR(255),
    metadata_json JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS sme_trade_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) NOT NULL,
    overall_score NUMERIC(5, 2) NOT NULL,
    payment_history_score NUMERIC(5, 2) DEFAULT 0,
    trade_volume_score NUMERIC(5, 2) DEFAULT 0,
    invoice_performance_score NUMERIC(5, 2) DEFAULT 0,
    time_in_business_score NUMERIC(5, 2) DEFAULT 0,
    dispute_ratio_score NUMERIC(5, 2) DEFAULT 0,
    tier VARCHAR(20),
    calculated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- COMPLIANCE
-- =============================================================================

CREATE TABLE IF NOT EXISTS kyb_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending_review',
    business_name VARCHAR(255) NOT NULL,
    registration_number VARCHAR(100),
    tax_id VARCHAR(100),
    business_type VARCHAR(50),
    country VARCHAR(3),
    legal_representative_name VARCHAR(255),
    legal_representative_id VARCHAR(100),
    documents_submitted TEXT,
    reviewer_notes TEXT,
    reviewed_by UUID,
    reviewed_at TIMESTAMPTZ,
    risk_rating VARCHAR(20),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS aml_flags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) NOT NULL,
    flag_type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) DEFAULT 'medium',
    description TEXT,
    entity_name VARCHAR(255),
    entity_id UUID,
    transaction_id UUID,
    status VARCHAR(20) DEFAULT 'open',
    resolved_by UUID,
    resolved_at TIMESTAMPTZ,
    resolution_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS sanctions_hits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID,
    entity_name VARCHAR(255) NOT NULL,
    entity_type VARCHAR(20) DEFAULT 'individual',
    country VARCHAR(3),
    list_name VARCHAR(100),
    matched_term VARCHAR(255),
    match_score NUMERIC(5, 2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'clear',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) NOT NULL,
    user_id UUID,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    resource_id UUID,
    details JSONB,
    ip_address VARCHAR(45),
    user_agent VARCHAR(500),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_org ON audit_logs(organization_id);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);

CREATE TABLE IF NOT EXISTS compliance_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) NOT NULL,
    report_type VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    report_data JSONB,
    generated_by UUID,
    export_format VARCHAR(10) DEFAULT 'json',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- AI/ML SCORING
-- =============================================================================

CREATE TABLE IF NOT EXISTS fraud_detection_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id UUID NOT NULL,
    fraud_score NUMERIC(5, 2) NOT NULL,
    risk_level VARCHAR(20) NOT NULL,
    is_fraudulent BOOLEAN DEFAULT FALSE,
    flags JSONB,
    model_version VARCHAR(20),
    analyzed_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS credit_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) NOT NULL,
    score NUMERIC(7, 2) NOT NULL,
    rating VARCHAR(5),
    factors JSONB,
    recommended_limit NUMERIC(20, 4),
    model_version VARCHAR(20),
    calculated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS treasury_health_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) NOT NULL,
    health_score NUMERIC(5, 2) NOT NULL,
    status VARCHAR(20) NOT NULL,
    metrics JSONB,
    recommendations JSONB,
    calculated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- INTEGRATIONS
-- =============================================================================

CREATE TABLE IF NOT EXISTS webhook_endpoints (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) NOT NULL,
    url VARCHAR(500) NOT NULL,
    secret VARCHAR(255) NOT NULL,
    events JSONB,
    status VARCHAR(20) DEFAULT 'active',
    description TEXT,
    last_sent_at TIMESTAMPTZ,
    failure_count NUMERIC(10, 0) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS webhook_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    endpoint_id UUID REFERENCES webhook_endpoints(id) NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    payload JSONB,
    status VARCHAR(20) DEFAULT 'pending',
    response_code NUMERIC(5, 0),
    response_body TEXT,
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS erp_sync_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) NOT NULL,
    sync_type VARCHAR(20) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    records_synced NUMERIC(10, 0) DEFAULT 0,
    errors JSONB,
    sync_duration NUMERIC(10, 2),
    provider VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- SEED DATA
-- =============================================================================

-- Default roles
INSERT INTO roles (name, description, permissions, is_system) VALUES
    ('admin', 'Full system access', '{"all": true}', TRUE),
    ('cfo', 'Treasury and financial operations', '{"treasury": "all", "payments": "read", "reports": "all", "approvals": "all"}', TRUE),
    ('merchant', 'Merchant payment operations', '{"payments": "all", "transactions": "read", "settlements": "read", "invoices": "write"}', TRUE),
    ('supplier', 'Supplier portal access', '{"invoices": "read", "payouts": "read", "profile": "write"}', TRUE),
    ('auditor', 'Read-only audit access', '{"reports": "read", "audit_logs": "read", "transactions": "read"}', TRUE)
ON CONFLICT (name) DO NOTHING;
