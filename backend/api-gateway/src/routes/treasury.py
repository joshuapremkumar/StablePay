from fastapi import APIRouter, HTTPException, Depends
from httpx import AsyncClient
from typing import Optional
from datetime import datetime

from backend.shared.schemas.base import PaginationParams, DateRangeFilter

router = APIRouter()
service_url = "http://treasury-service:8002"


@router.get("/overview")
async def get_treasury_overview(organization_id: str):
    async with AsyncClient() as client:
        resp = await client.get(f"{service_url}/api/v1/treasury/overview", params={"organization_id": organization_id})
        if resp.status_code != 200:
            raise HTTPException(status_code=resp.status_code, detail=resp.text)
        return resp.json()


@router.get("/cashflow")
async def get_cashflow(organization_id: str, start_date: Optional[str] = None, end_date: Optional[str] = None):
    params = {"organization_id": organization_id}
    if start_date:
        params["start_date"] = start_date
    if end_date:
        params["end_date"] = end_date
    async with AsyncClient() as client:
        resp = await client.get(f"{service_url}/api/v1/treasury/cashflow", params=params)
        if resp.status_code != 200:
            raise HTTPException(status_code=resp.status_code, detail=resp.text)
        return resp.json()


@router.get("/accounts-payable")
async def list_accounts_payable(organization_id: str, page: int = 1, page_size: int = 20):
    async with AsyncClient() as client:
        resp = await client.get(
            f"{service_url}/api/v1/treasury/accounts-payable",
            params={"organization_id": organization_id, "page": page, "page_size": page_size},
        )
        if resp.status_code != 200:
            raise HTTPException(status_code=resp.status_code, detail=resp.text)
        return resp.json()


@router.get("/suppliers")
async def list_suppliers(organization_id: str, page: int = 1, page_size: int = 20):
    async with AsyncClient() as client:
        resp = await client.get(
            f"{service_url}/api/v1/treasury/suppliers",
            params={"organization_id": organization_id, "page": page, "page_size": page_size},
        )
        if resp.status_code != 200:
            raise HTTPException(status_code=resp.status_code, detail=resp.text)
        return resp.json()


@router.post("/payouts")
async def create_payout(payload: dict):
    async with AsyncClient() as client:
        resp = await client.post(f"{service_url}/api/v1/treasury/payouts", json=payload)
        if resp.status_code not in (200, 201):
            raise HTTPException(status_code=resp.status_code, detail=resp.text)
        return resp.json()


@router.get("/expenses")
async def list_expenses(organization_id: str, page: int = 1, page_size: int = 20, category: Optional[str] = None):
    params = {"organization_id": organization_id, "page": page, "page_size": page_size}
    if category:
        params["category"] = category
    async with AsyncClient() as client:
        resp = await client.get(f"{service_url}/api/v1/treasury/expenses", params=params)
        if resp.status_code != 200:
            raise HTTPException(status_code=resp.status_code, detail=resp.text)
        return resp.json()


@router.get("/tax-logs")
async def list_tax_logs(organization_id: str, page: int = 1, page_size: int = 50):
    async with AsyncClient() as client:
        resp = await client.get(
            f"{service_url}/api/v1/treasury/tax-logs",
            params={"organization_id": organization_id, "page": page, "page_size": page_size},
        )
        if resp.status_code != 200:
            raise HTTPException(status_code=resp.status_code, detail=resp.text)
        return resp.json()
