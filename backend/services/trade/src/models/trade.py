from datetime import datetime
from decimal import Decimal
from sqlalchemy import Column, String, Boolean, DateTime, Numeric, Text, ForeignKey, Date, JSON
from backend.shared.models.base import Base, generate_uuid, TimestampMixin, SoftDeleteMixin, OrganizationMixin


class LetterOfCredit(Base, TimestampMixin, SoftDeleteMixin, OrganizationMixin):
    __tablename__ = "letters_of_credit"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    loc_number = Column(String(50), unique=True, nullable=False, index=True)
    loc_type = Column(String(30), default="standby")
    amount = Column(Numeric(20, 4), nullable=False)
    currency = Column(String(10), default="USDC")
    status = Column(String(20), default="issued")
    applicant_name = Column(String(255), nullable=False)
    applicant_address = Column(Text, nullable=True)
    beneficiary_name = Column(String(255), nullable=False)
    beneficiary_address = Column(Text, nullable=True)
    issue_date = Column(DateTime(timezone=True), nullable=True)
    expiry_date = Column(DateTime(timezone=True), nullable=True)
    terms_conditions = Column(Text, nullable=True)
    supporting_docs = Column(Text, nullable=True)
    smart_contract_address = Column(String(255), nullable=True)
    tx_hash = Column(String(255), nullable=True)
    approved_by = Column(String(36), nullable=True)
    approved_at = Column(DateTime(timezone=True), nullable=True)
    metadata_json = Column(Text, nullable=True)


class InvoiceFinancing(Base, TimestampMixin, SoftDeleteMixin, OrganizationMixin):
    __tablename__ = "invoice_financing"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    invoice_number = Column(String(50), nullable=False, index=True)
    invoice_amount = Column(Numeric(20, 4), nullable=False)
    funding_amount = Column(Numeric(20, 4), nullable=False)
    currency = Column(String(10), default="USDC")
    status = Column(String(20), default="pending")
    interest_rate = Column(Numeric(5, 2), default=0)
    advance_rate = Column(Numeric(5, 2), default=0)
    funding_date = Column(DateTime(timezone=True), nullable=True)
    maturity_date = Column(DateTime(timezone=True), nullable=True)
    repayment_date = Column(DateTime(timezone=True), nullable=True)
    debtor_name = Column(String(255), nullable=True)
    debtor_address = Column(Text, nullable=True)
    invoice_due_date = Column(DateTime(timezone=True), nullable=True)
    supporting_docs = Column(Text, nullable=True)
    smart_contract_address = Column(String(255), nullable=True)
    token_id = Column(String(100), nullable=True)
    tx_hash = Column(String(255), nullable=True)
    metadata_json = Column(Text, nullable=True)


class ReceivableListing(Base, TimestampMixin, SoftDeleteMixin, OrganizationMixin):
    __tablename__ = "receivable_listings"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    invoice_number = Column(String(50), nullable=False)
    amount = Column(Numeric(20, 4), nullable=False)
    currency = Column(String(10), default="USDC")
    discount_rate = Column(Numeric(5, 2), nullable=False)
    remaining_days = Column(Numeric(10, 0), nullable=True)
    debtor_name = Column(String(255), nullable=True)
    debtor_rating = Column(String(10), nullable=True)
    status = Column(String(20), default="active")
    invoice_financing_id = Column(String(36), ForeignKey("invoice_financing.id"), nullable=True)
    smart_contract_address = Column(String(255), nullable=True)
    metadata_json = Column(Text, nullable=True)


class EscrowAgreement(Base, TimestampMixin, SoftDeleteMixin, OrganizationMixin):
    __tablename__ = "escrow_agreements"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    escrow_number = Column(String(50), unique=True, nullable=False, index=True)
    amount = Column(Numeric(20, 4), nullable=False)
    currency = Column(String(10), default="USDC")
    status = Column(String(20), default="pending")
    buyer_name = Column(String(255), nullable=False)
    seller_name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    terms_conditions = Column(Text, nullable=True)
    milestone_count = Column(Numeric(5, 0), default=0)
    completed_milestones = Column(Numeric(5, 0), default=0)
    released_amount = Column(Numeric(20, 4), default=0)
    expires_at = Column(DateTime(timezone=True), nullable=True)
    released_at = Column(DateTime(timezone=True), nullable=True)
    smart_contract_address = Column(String(255), nullable=True)
    tx_hash = Column(String(255), nullable=True)
    metadata_json = Column(Text, nullable=True)


class ShipmentMilestone(Base, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "shipment_milestones"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    escrow_id = Column(String(36), ForeignKey("escrow_agreements.id"), nullable=False, index=True)
    milestone_number = Column(Numeric(5, 0), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String(20), default="pending")
    trigger_condition = Column(Text, nullable=True)
    amount_to_release = Column(Numeric(20, 4), default=0)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    verified_by = Column(String(36), nullable=True)
    tx_hash = Column(String(255), nullable=True)


class SMETradeScore(Base, TimestampMixin):
    __tablename__ = "sme_trade_scores"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    organization_id = Column(String(36), nullable=False, index=True)
    overall_score = Column(Numeric(5, 2), nullable=False)
    payment_history_score = Column(Numeric(5, 2), default=0)
    trade_volume_score = Column(Numeric(5, 2), default=0)
    invoice_performance_score = Column(Numeric(5, 2), default=0)
    time_in_business_score = Column(Numeric(5, 2), default=0)
    dispute_ratio_score = Column(Numeric(5, 2), default=0)
    tier = Column(String(20), nullable=True)
    calculated_at = Column(DateTime(timezone=True), default=datetime.utcnow)


class SupplierFinancing(Base, TimestampMixin, SoftDeleteMixin, OrganizationMixin):
    __tablename__ = "supplier_financing"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    supplier_id = Column(String(36), nullable=False, index=True)
    financing_amount = Column(Numeric(20, 4), nullable=False)
    currency = Column(String(10), default="USDC")
    interest_rate = Column(Numeric(5, 2), nullable=False)
    status = Column(String(20), default="pending")
    term_days = Column(Numeric(5, 0), nullable=True)
    funded_at = Column(DateTime(timezone=True), nullable=True)
    repayment_date = Column(DateTime(timezone=True), nullable=True)
    smart_contract_address = Column(String(255), nullable=True)
    metadata_json = Column(Text, nullable=True)
