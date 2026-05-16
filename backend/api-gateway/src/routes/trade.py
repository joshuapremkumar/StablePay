from fastapi import APIRouter, HTTPException
from httpx import AsyncClient
from typing import Optional

router = APIRouter()
service_url = "http://trade-service:8004"


@router.get("/letters-of-credit")
async def list_letters_of_credit(organization_id: str, page: int = 1, page_size: int = 20):
    async with AsyncClient() as client:
        resp = await client.get(
            f"{service_url}/api/v1/trade/letters-of-credit",
            params={"organization_id": organization_id, "page": page, "page_size": page_size},
        )
        if resp.status_code != 200:
            raise HTTPException(status_code=resp.status_code, detail=resp.text)
        return resp.json()


@router.post("/letters-of-credit")
async def create_letter_of_credit(payload: dict):
    async with AsyncClient() as client:
        resp = await client.post(f"{service_url}/api/v1/trade/letters-of-credit", json=payload)
        if resp.status_code not in (200, 201):
            raise HTTPException(status_code=resp.status_code, detail=resp.text)
        return resp.json()


@router.get("/invoice-financing")
async def list_invoice_financing(organization_id: str, page: int = 1, page_size: int = 20):
    async with AsyncClient() as client:
        resp = await client.get(
            f"{service_url}/api/v1/trade/invoice-financing",
            params={"organization_id": organization_id, "page": page, "page_size": page_size},
        )
        if resp.status_code != 200:
            raise HTTPException(status_code=resp.status_code, detail=resp.text)
        return resp.json()


@router.post("/invoice-financing")
async def create_invoice_financing(payload: dict):
    async with AsyncClient() as client:
        resp = await client.post(f"{service_url}/api/v1/trade/invoice-financing", json=payload)
        if resp.status_code not in (200, 201):
            raise HTTPException(status_code=resp.status_code, detail=resp.text)
        return resp.json()


@router.get("/receivables-marketplace")
async def list_receivables(page: int = 1, page_size: int = 20, min_amount: Optional[float] = None, max_amount: Optional[float] = None):
    params = {"page": page, "page_size": page_size}
    if min_amount:
        params["min_amount"] = min_amount
    if max_amount:
        params["max_amount"] = max_amount
    async with AsyncClient() as client:
        resp = await client.get(f"{service_url}/api/v1/trade/receivables-marketplace", params=params)
        if resp.status_code != 200:
            raise HTTPException(status_code=resp.status_code, detail=resp.text)
        return resp.json()


@router.get("/sme-score/{organization_id}")
async def get_sme_score(organization_id: str):
    async with AsyncClient() as client:
        resp = await client.get(f"{service_url}/api/v1/trade/sme-score/{organization_id}")
        if resp.status_code != 200:
            raise HTTPException(status_code=resp.status_code, detail=resp.text)
        return resp.json()


@router.post("/escrow")
async def create_escrow(payload: dict):
    async with AsyncClient() as client:
        resp = await client.post(f"{service_url}/api/v1/trade/escrow", json=payload)
        if resp.status_code not in (200, 201):
            raise HTTPException(status_code=resp.status_code, detail=resp.text)
        return resp.json()
