from fastapi import APIRouter, HTTPException
from httpx import AsyncClient
from typing import Optional

router = APIRouter()
service_url = "http://payments-service:8003"


@router.post("/checkout")
async def create_checkout_session(payload: dict):
    async with AsyncClient() as client:
        resp = await client.post(f"{service_url}/api/v1/payments/checkout", json=payload)
        if resp.status_code not in (200, 201):
            raise HTTPException(status_code=resp.status_code, detail=resp.text)
        return resp.json()


@router.get("/transactions")
async def list_transactions(organization_id: str, page: int = 1, page_size: int = 20, status: Optional[str] = None):
    params = {"organization_id": organization_id, "page": page, "page_size": page_size}
    if status:
        params["status"] = status
    async with AsyncClient() as client:
        resp = await client.get(f"{service_url}/api/v1/payments/transactions", params=params)
        if resp.status_code != 200:
            raise HTTPException(status_code=resp.status_code, detail=resp.text)
        return resp.json()


@router.get("/settlements")
async def list_settlements(organization_id: str, page: int = 1, page_size: int = 20):
    async with AsyncClient() as client:
        resp = await client.get(
            f"{service_url}/api/v1/payments/settlements",
            params={"organization_id": organization_id, "page": page, "page_size": page_size},
        )
        if resp.status_code != 200:
            raise HTTPException(status_code=resp.status_code, detail=resp.text)
        return resp.json()


@router.post("/refunds")
async def create_refund(payload: dict):
    async with AsyncClient() as client:
        resp = await client.post(f"{service_url}/api/v1/payments/refunds", json=payload)
        if resp.status_code not in (200, 201):
            raise HTTPException(status_code=resp.status_code, detail=resp.text)
        return resp.json()


@router.get("/invoices")
async def list_invoices(organization_id: str, page: int = 1, page_size: int = 20, status: Optional[str] = None):
    params = {"organization_id": organization_id, "page": page, "page_size": page_size}
    if status:
        params["status"] = status
    async with AsyncClient() as client:
        resp = await client.get(f"{service_url}/api/v1/payments/invoices", params=params)
        if resp.status_code != 200:
            raise HTTPException(status_code=resp.status_code, detail=resp.text)
        return resp.json()


@router.post("/invoices")
async def create_invoice(payload: dict):
    async with AsyncClient() as client:
        resp = await client.post(f"{service_url}/api/v1/payments/invoices", json=payload)
        if resp.status_code not in (200, 201):
            raise HTTPException(status_code=resp.status_code, detail=resp.text)
        return resp.json()
