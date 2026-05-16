from datetime import datetime
from decimal import Decimal
from typing import Optional
from sqlalchemy import Column, String, Boolean, DateTime, Numeric, Text, ForeignKey, Date, JSON
from backend.shared.models.base import Base, generate_uuid, TimestampMixin, SoftDeleteMixin, OrganizationMixin


class Transaction(Base, TimestampMixin, SoftDeleteMixin, OrganizationMixin):
    __tablename__ = "transactions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    transaction_type = Column(String(50), nullable=False)
    amount = Column(Numeric(20, 4), nullable=False)
    currency = Column(String(10), default="USDC")
    status = Column(String(20), default="pending")
    description = Column(Text, nullable=True)
    merchant_name = Column(String(255), nullable=True)
    customer_email = Column(String(255), nullable=True)
    customer_wallet = Column(String(255), nullable=True)
    checkout_session_id = Column(String(36), nullable=True)
    wallet_address = Column(String(255), nullable=True)
    tx_hash = Column(String(255), nullable=True, index=True)
    block_number = Column(String(100), nullable=True)
    network = Column(String(50), default="polygon")
    fee_amount = Column(Numeric(20, 4), default=0)
    fee_currency = Column(String(10), default="USDC")
    completed_at = Column(DateTime(timezone=True), nullable=True)
    refunded_at = Column(DateTime(timezone=True), nullable=True)
    metadata_json = Column(Text, nullable=True)


class Settlement(Base, TimestampMixin, SoftDeleteMixin, OrganizationMixin):
    __tablename__ = "settlements"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    settlement_date = Column(Date, nullable=False)
    amount = Column(Numeric(20, 4), nullable=False)
    currency = Column(String(10), default="USDC")
    status = Column(String(20), default="pending")
    transaction_count = Column(Numeric(10, 0), default=0)
    reference = Column(String(255), nullable=True)
    destination_wallet = Column(String(255), nullable=True)
    batch_tx_hash = Column(String(255), nullable=True)
    metadata_json = Column(Text, nullable=True)


class Invoice(Base, TimestampMixin, SoftDeleteMixin, OrganizationMixin):
    __tablename__ = "merchant_invoices"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    invoice_number = Column(String(50), nullable=False, index=True)
    customer_name = Column(String(255), nullable=False)
    customer_email = Column(String(255), nullable=True)
    customer_wallet = Column(String(255), nullable=True)
    amount = Column(Numeric(20, 4), nullable=False)
    currency = Column(String(10), default="USDC")
    status = Column(String(20), default="pending")
    due_date = Column(Date, nullable=True)
    issue_date = Column(Date, nullable=True)
    description = Column(Text, nullable=True)
    payment_link = Column(String(500), nullable=True)
    paid_at = Column(DateTime(timezone=True), nullable=True)
    tx_hash = Column(String(255), nullable=True)
    metadata_json = Column(Text, nullable=True)


class Refund(Base, TimestampMixin, SoftDeleteMixin, OrganizationMixin):
    __tablename__ = "refunds"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    transaction_id = Column(String(36), ForeignKey("transactions.id"), nullable=False)
    amount = Column(Numeric(20, 4), nullable=False)
    currency = Column(String(10), default="USDC")
    reason = Column(Text, nullable=True)
    status = Column(String(20), default="pending")
    processed_at = Column(DateTime(timezone=True), nullable=True)
    tx_hash = Column(String(255), nullable=True)


class PaymentLink(Base, TimestampMixin, SoftDeleteMixin, OrganizationMixin):
    __tablename__ = "payment_links"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    url = Column(String(500), unique=True, nullable=False)
    amount = Column(Numeric(20, 4), nullable=False)
    currency = Column(String(10), default="USDC")
    description = Column(Text, nullable=True)
    status = Column(String(20), default="active")
    expires_at = Column(DateTime(timezone=True), nullable=True)
    max_uses = Column(Numeric(10, 0), default=1)
    use_count = Column(Numeric(10, 0), default=0)
    metadata_json = Column(Text, nullable=True)


class CheckoutSession(Base, TimestampMixin, SoftDeleteMixin, OrganizationMixin):
    __tablename__ = "checkout_sessions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    amount = Column(Numeric(20, 4), nullable=False)
    currency = Column(String(10), default="USDC")
    description = Column(Text, nullable=True)
    merchant_name = Column(String(255), nullable=True)
    customer_email = Column(String(255), nullable=True)
    customer_wallet = Column(String(255), nullable=True)
    status = Column(String(20), default="pending")
    redirect_url = Column(String(500), nullable=True)
    cancel_url = Column(String(500), nullable=True)
    wallet_address = Column(String(255), nullable=True)
    tx_hash = Column(String(255), nullable=True)
    paid_at = Column(DateTime(timezone=True), nullable=True)
    expires_at = Column(DateTime(timezone=True), nullable=True)
    metadata_json = Column(Text, nullable=True)
