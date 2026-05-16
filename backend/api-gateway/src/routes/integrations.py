from fastapi import APIRouter, HTTPException
from httpx import AsyncClient
from typing import Optional

router = APIRouter()
service_url = "http://integrations-service:8007"


@router.post("/webhooks")
async def register_webhook(payload: dict):
    async with AsyncClient() as client:
        resp = await client.post(f"{service_url}/api/v1/integrations/webhooks", json=payload)
        if resp.status_code not in (200, 201):
            raise HTTPException(status_code=resp.status_code, detail=resp.text)
        return resp.json()


@router.get("/webhooks")
async def list_webhooks(organization_id: str):
    async with AsyncClient() as client:
        resp = await client.get(f"{service_url}/api/v1/integrations/webhooks", params={"organization_id": organization_id})
        if resp.status_code != 200:
            raise HTTPException(status_code=resp.status_code, detail=resp.text)
        return resp.json()


@router.post("/erp/sync")
async def sync_erp(payload: dict):
    async with AsyncClient() as client:
        resp = await client.post(f"{service_url}/api/v1/integrations/erp/sync", json=payload)
        if resp.status_code != 200:
            raise HTTPException(status_code=resp.status_code, detail=resp.text)
        return resp.json()


@router.get("/banking/accounts")
async def list_bank_accounts(organization_id: str):
    async with AsyncClient() as client:
        resp = await client.get(f"{service_url}/api/v1/integrations/banking/accounts", params={"organization_id": organization_id})
        if resp.status_code != 200:
            raise HTTPException(status_code=resp.status_code, detail=resp.text)
        return resp.json()


@router.post("/banking/transactions/sync")
async def sync_bank_transactions(payload: dict):
    async with AsyncClient() as client:
        resp = await client.post(f"{service_url}/api/v1/integrations/banking/transactions/sync", json=payload)
        if resp.status_code != 200:
            raise HTTPException(status_code=resp.status_code, detail=resp.text)
        return resp.json()
