from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, EmailStr


class OrganizationBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=255)
    legal_name: Optional[str] = None
    registration_number: Optional[str] = None
    tax_id: Optional[str] = None
    business_type: Optional[str] = None
    industry: Optional[str] = None
    country: Optional[str] = None
    timezone: str = Field(default="UTC")
    logo_url: Optional[str] = None
    website: Optional[str] = None


class OrganizationCreate(OrganizationBase):
    pass


class OrganizationUpdate(BaseModel):
    name: Optional[str] = None
    legal_name: Optional[str] = None
    tax_id: Optional[str] = None
    business_type: Optional[str] = None
    industry: Optional[str] = None
    country: Optional[str] = None
    timezone: Optional[str] = None
    logo_url: Optional[str] = None
    website: Optional[str] = None


class OrganizationResponse(OrganizationBase):
    id: str
    status: str
    kyb_status: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class OrganizationList(BaseModel):
    items: List[OrganizationResponse]
    total: int
