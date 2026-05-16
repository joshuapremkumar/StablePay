from datetime import datetime
from decimal import Decimal
from typing import Optional, Generic, TypeVar, List
from uuid import UUID
from pydantic import BaseModel, Field, ConfigDict

T = TypeVar("T")


class APIResponse(BaseModel, Generic[T]):
    success: bool = True
    message: str = "Success"
    data: Optional[T] = None
    error: Optional[str] = None
    metadata: Optional[dict] = None

    model_config = ConfigDict(from_attributes=True)


class PaginatedResponse(BaseModel, Generic[T]):
    items: List[T]
    total: int
    page: int
    page_size: int
    total_pages: int


class PaginationParams(BaseModel):
    page: int = Field(default=1, ge=1, description="Page number")
    page_size: int = Field(default=20, ge=1, le=100, description="Items per page")
    sort_by: Optional[str] = Field(default=None, description="Sort field")
    sort_order: Optional[str] = Field(default="desc", description="Sort direction: asc or desc")


class DateRangeFilter(BaseModel):
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None


class ErrorResponse(BaseModel):
    success: bool = False
    error: str
    message: str = "Request failed"
    status_code: int = 400
    details: Optional[dict] = None
