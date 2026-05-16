from datetime import datetime
from typing import Optional
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from backend.shared.models.base import Base, generate_uuid, TimestampMixin, SoftDeleteMixin


class Organization(Base, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "organizations"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(255), nullable=False)
    legal_name = Column(String(255), nullable=True)
    registration_number = Column(String(100), nullable=True)
    tax_id = Column(String(100), nullable=True)
    business_type = Column(String(50), nullable=True)
    industry = Column(String(100), nullable=True)
    country = Column(String(3), nullable=True)
    timezone = Column(String(50), default="UTC")
    logo_url = Column(String(500), nullable=True)
    website = Column(String(500), nullable=True)
    status = Column(String(20), default="active")
    kyb_status = Column(String(20), default="pending")

    users = relationship("User", back_populates="organization", lazy="selectin")


class User(Base, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    email = Column(String(255), unique=True, nullable=False, index=True)
    first_name = Column(String(128), nullable=False)
    last_name = Column(String(128), nullable=False)
    phone = Column(String(20), nullable=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(20), default="member")
    organization_id = Column(String(36), ForeignKey("organizations.id"), nullable=True, index=True)
    is_active = Column(Boolean, default=True)
    email_verified = Column(Boolean, default=False)
    mfa_enabled = Column(Boolean, default=False)
    mfa_secret = Column(String(100), nullable=True)
    last_login_at = Column(DateTime(timezone=True), nullable=True)
    avatar_url = Column(String(500), nullable=True)
    locale = Column(String(10), default="en")
    metadata_json = Column(Text, nullable=True)

    organization = relationship("Organization", back_populates="users", lazy="selectin")
