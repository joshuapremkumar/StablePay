from datetime import datetime
from decimal import Decimal
from typing import Optional
from sqlalchemy import Column, String, Boolean, DateTime, Numeric, Text, ForeignKey, Date, Enum as SAEnum
import enum
from backend.shared.models.base import Base, generate_uuid, TimestampMixin, SoftDeleteMixin, OrganizationMixin, UserMixin


class InvoiceStatus(str, enum.Enum):
    DRAFT = "draft"
    PENDING = "pending"
    APPROVED = "approved"
    PAID = "paid"
    OVERDUE = "overdue"
    CANCELLED = "cancelled"


class PayoutStatus(str, enum.Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class ExpenseCategory(str, enum.Enum):
    OPERATIONS = "operations"
    PAYROLL = "payroll"
    MARKETING = "marketing"
    TECHNOLOGY = "technology"
    OFFICE = "office"
    TRAVEL = "travel"
    PROFESSIONAL_SERVICES = "professional_services"
    UTILITIES = "utilities"
    OTHER = "other"


class Invoice(Base, TimestampMixin, SoftDeleteMixin, OrganizationMixin):
    __tablename__ = "invoices"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    invoice_number = Column(String(50), nullable=False, index=True)
    supplier_id = Column(String(36), ForeignKey("suppliers.id"), nullable=True)
    supplier_name = Column(String(255), nullable=False)
    supplier_email = Column(String(255), nullable=True)
    amount = Column(Numeric(20, 4), nullable=False)
    currency = Column(String(3), default="AED")
    status = Column(String(20), default=InvoiceStatus.PENDING.value)
    due_date = Column(Date, nullable=True)
    issue_date = Column(Date, nullable=True)
    description = Column(Text, nullable=True)
    category = Column(String(50), nullable=True)
    tax_amount = Column(Numeric(20, 4), default=0)
    tax_rate = Column(Numeric(5, 2), default=0)
    file_url = Column(String(500), nullable=True)
    approved_by = Column(String(36), nullable=True)
    approved_at = Column(DateTime(timezone=True), nullable=True)
    paid_at = Column(DateTime(timezone=True), nullable=True)
    metadata_json = Column(Text, nullable=True)


class Supplier(Base, TimestampMixin, SoftDeleteMixin, OrganizationMixin):
    __tablename__ = "suppliers"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(255), nullable=False)
    contact_name = Column(String(255), nullable=True)
    email = Column(String(255), nullable=True)
    phone = Column(String(20), nullable=True)
    address = Column(Text, nullable=True)
    tax_id = Column(String(100), nullable=True)
    payment_terms = Column(String(50), default="net_30")
    payment_method = Column(String(50), default="bank_transfer")
    bank_account = Column(Text, nullable=True)
    currency = Column(String(3), default="AED")
    status = Column(String(20), default="active")
    total_invoiced = Column(Numeric(20, 4), default=0)
    total_paid = Column(Numeric(20, 4), default=0)
    balance = Column(Numeric(20, 4), default=0)
    category = Column(String(100), nullable=True)
    metadata_json = Column(Text, nullable=True)


class Payout(Base, TimestampMixin, SoftDeleteMixin, OrganizationMixin):
    __tablename__ = "payouts"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    payout_number = Column(String(50), nullable=True, index=True)
    amount = Column(Numeric(20, 4), nullable=False)
    currency = Column(String(3), default="AED")
    payment_method = Column(String(50), default="bank_transfer")
    status = Column(String(20), default=PayoutStatus.PENDING.value)
    description = Column(Text, nullable=True)
    reference = Column(String(255), nullable=True)
    created_by = Column(String(36), nullable=True)
    approved_by = Column(String(36), nullable=True)
    approved_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    failure_reason = Column(Text, nullable=True)
    metadata_json = Column(Text, nullable=True)


class PayoutItem(Base, TimestampMixin):
    __tablename__ = "payout_items"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    payout_id = Column(String(36), ForeignKey("payouts.id"), nullable=False, index=True)
    invoice_id = Column(String(36), nullable=True)
    supplier_id = Column(String(36), nullable=True)
    amount = Column(Numeric(20, 4), nullable=False)
    description = Column(Text, nullable=True)


class PayrollRun(Base, TimestampMixin, SoftDeleteMixin, OrganizationMixin):
    __tablename__ = "payroll_runs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    pay_period_start = Column(Date, nullable=False)
    pay_period_end = Column(Date, nullable=False)
    total_amount = Column(Numeric(20, 4), nullable=False)
    currency = Column(String(3), default="AED")
    status = Column(String(20), default="draft")
    employee_count = Column(Numeric(10, 0), default=0)
    processed_by = Column(String(36), nullable=True)
    processed_at = Column(DateTime(timezone=True), nullable=True)
    metadata_json = Column(Text, nullable=True)


class CashFlowEntry(Base, TimestampMixin, SoftDeleteMixin, OrganizationMixin):
    __tablename__ = "cash_flow_entries"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    date = Column(Date, nullable=False)
    entry_type = Column(String(20), nullable=False)
    amount = Column(Numeric(20, 4), nullable=False)
    currency = Column(String(3), default="AED")
    category = Column(String(100), nullable=True)
    description = Column(Text, nullable=True)
    reference = Column(String(255), nullable=True)
    source = Column(String(50), nullable=True)


class Expense(Base, TimestampMixin, SoftDeleteMixin, OrganizationMixin):
    __tablename__ = "expenses"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    date = Column(Date, nullable=False)
    category = Column(String(50), nullable=False)
    amount = Column(Numeric(20, 4), nullable=False)
    currency = Column(String(3), default="AED")
    description = Column(Text, nullable=True)
    vendor = Column(String(255), nullable=True)
    status = Column(String(20), default="pending")
    receipt_url = Column(String(500), nullable=True)
    approved_by = Column(String(36), nullable=True)
    approved_at = Column(DateTime(timezone=True), nullable=True)


class TaxLog(Base, TimestampMixin, SoftDeleteMixin, OrganizationMixin):
    __tablename__ = "tax_logs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    tax_type = Column(String(50), nullable=False)
    tax_period = Column(String(7), nullable=False)
    amount = Column(Numeric(20, 4), nullable=False)
    currency = Column(String(3), default="AED")
    status = Column(String(20), default="pending")
    filing_date = Column(Date, nullable=True)
    reference = Column(String(255), nullable=True)
    notes = Column(Text, nullable=True)
