from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, Numeric, Text, ForeignKey, JSON
from backend.shared.models.base import Base, generate_uuid, TimestampMixin, SoftDeleteMixin


class WebhookEndpoint(Base, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "webhook_endpoints"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    organization_id = Column(String(36), nullable=False, index=True)
    url = Column(String(500), nullable=False)
    secret = Column(String(255), nullable=False)
    events = Column(Text, nullable=True)
    status = Column(String(20), default="active")
    description = Column(Text, nullable=True)
    last_sent_at = Column(DateTime(timezone=True), nullable=True)
    failure_count = Column(Numeric(10, 0), default=0)


class WebhookEvent(Base, TimestampMixin):
    __tablename__ = "webhook_events"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    endpoint_id = Column(String(36), ForeignKey("webhook_endpoints.id"), nullable=False)
    event_type = Column(String(100), nullable=False)
    payload = Column(Text, nullable=True)
    status = Column(String(20), default="pending")
    response_code = Column(Numeric(5, 0), nullable=True)
    response_body = Column(Text, nullable=True)
    sent_at = Column(DateTime(timezone=True), nullable=True)


class ERPSyncLog(Base, TimestampMixin):
    __tablename__ = "erp_sync_logs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    organization_id = Column(String(36), nullable=False, index=True)
    sync_type = Column(String(20), nullable=False)
    status = Column(String(20), default="pending")
    records_synced = Column(Numeric(10, 0), default=0)
    errors = Column(Text, nullable=True)
    sync_duration = Column(Numeric(10, 2), nullable=True)
    provider = Column(String(50), nullable=True)
