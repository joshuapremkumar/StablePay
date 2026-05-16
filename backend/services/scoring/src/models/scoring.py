from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, Numeric, Text, ForeignKey, JSON
from backend.shared.models.base import Base, generate_uuid, TimestampMixin


class FraudDetectionResult(Base, TimestampMixin):
    __tablename__ = "fraud_detection_results"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    transaction_id = Column(String(36), nullable=False, index=True)
    fraud_score = Column(Numeric(5, 2), nullable=False)
    risk_level = Column(String(20), nullable=False)
    is_fraudulent = Column(Boolean, default=False)
    flags = Column(Text, nullable=True)
    model_version = Column(String(20), nullable=True)
    analyzed_at = Column(DateTime(timezone=True), default=datetime.utcnow)


class CreditScore(Base, TimestampMixin):
    __tablename__ = "credit_scores"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    organization_id = Column(String(36), nullable=False, index=True)
    score = Column(Numeric(7, 2), nullable=False)
    rating = Column(String(5), nullable=True)
    factors = Column(Text, nullable=True)
    recommended_limit = Column(Numeric(20, 4), nullable=True)
    model_version = Column(String(20), nullable=True)
    calculated_at = Column(DateTime(timezone=True), default=datetime.utcnow)


class CashFlowPrediction(Base, TimestampMixin):
    __tablename__ = "cash_flow_predictions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    organization_id = Column(String(36), nullable=False, index=True)
    prediction_date = Column(DateTime(timezone=True), nullable=False)
    predicted_inflow = Column(Numeric(20, 4), nullable=False)
    predicted_outflow = Column(Numeric(20, 4), nullable=False)
    predicted_balance = Column(Numeric(20, 4), nullable=False)
    confidence = Column(Numeric(5, 2), nullable=False)
    model_version = Column(String(20), nullable=True)


class TreasuryHealthScore(Base, TimestampMixin):
    __tablename__ = "treasury_health_scores"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    organization_id = Column(String(36), nullable=False, index=True)
    health_score = Column(Numeric(5, 2), nullable=False)
    status = Column(String(20), nullable=False)
    metrics = Column(Text, nullable=True)
    recommendations = Column(Text, nullable=True)
    calculated_at = Column(DateTime(timezone=True), default=datetime.utcnow)
