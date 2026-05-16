from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, Numeric, Text, ForeignKey, Date, JSON
from backend.shared.models.base import Base, generate_uuid, TimestampMixin, SoftDeleteMixin


class KYBRecord(Base, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "kyb_records"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    organization_id = Column(String(36), nullable=False, index=True)
    status = Column(String(20), default="pending_review")
    business_name = Column(String(255), nullable=False)
    registration_number = Column(String(100), nullable=True)
    tax_id = Column(String(100), nullable=True)
    business_type = Column(String(50), nullable=True)
    country = Column(String(3), nullable=True)
    legal_representative_name = Column(String(255), nullable=True)
    legal_representative_id = Column(String(100), nullable=True)
    documents_submitted = Column(Text, nullable=True)
    reviewer_notes = Column(Text, nullable=True)
    reviewed_by = Column(String(36), nullable=True)
    reviewed_at = Column(DateTime(timezone=True), nullable=True)
    risk_rating = Column(String(20), nullable=True)


class AMLFlag(Base, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "aml_flags"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    organization_id = Column(String(36), nullable=False, index=True)
    flag_type = Column(String(50), nullable=False)
    severity = Column(String(20), default="medium")
    description = Column(Text, nullable=True)
    entity_name = Column(String(255), nullable=True)
    entity_id = Column(String(36), nullable=True)
    transaction_id = Column(String(36), nullable=True)
    status = Column(String(20), default="open")
    resolved_by = Column(String(36), nullable=True)
    resolved_at = Column(DateTime(timezone=True), nullable=True)
    resolution_notes = Column(Text, nullable=True)


class SanctionsHit(Base, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "sanctions_hits"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    organization_id = Column(String(36), nullable=True, index=True)
    entity_name = Column(String(255), nullable=False)
    entity_type = Column(String(20), default="individual")
    country = Column(String(3), nullable=True)
    list_name = Column(String(100), nullable=True)
    matched_term = Column(String(255), nullable=True)
    match_score = Column(Numeric(5, 2), default=0)
    status = Column(String(20), default="clear")


class AuditLog(Base, TimestampMixin):
    __tablename__ = "audit_logs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    organization_id = Column(String(36), nullable=False, index=True)
    user_id = Column(String(36), nullable=True, index=True)
    action = Column(String(100), nullable=False)
    resource_type = Column(String(50), nullable=False)
    resource_id = Column(String(36), nullable=True)
    details = Column(Text, nullable=True)
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(String(500), nullable=True)


class ComplianceReport(Base, TimestampMixin):
    __tablename__ = "compliance_reports"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    organization_id = Column(String(36), nullable=False, index=True)
    report_type = Column(String(50), nullable=False)
    status = Column(String(20), default="pending")
    report_data = Column(Text, nullable=True)
    generated_by = Column(String(36), nullable=True)
    export_format = Column(String(10), default="json")
