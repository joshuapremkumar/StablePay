from fastapi import APIRouter, HTTPException
from httpx import AsyncClient
from typing import Optional

router = APIRouter()
service_url = "http://compliance-service:8005"


@router.post("/kyb")
async def submit_kyb(payload: dict):
    async with AsyncClient() as client:
        resp = await client.post(f"{service_url}/api/v1/compliance/kyb", json=payload)
        if resp.status_code not in (200, 201):
            raise HTTPException(status_code=resp.status_code, detail=resp.text)
        return resp.json()


@router.get("/kyb/{organization_id}")
async def get_kyb_status(organization_id: str):
    async with AsyncClient() as client:
        resp = await client.get(f"{service_url}/api/v1/compliance/kyb/{organization_id}")
        if resp.status_code != 200:
            raise HTTPException(status_code=resp.status_code, detail=resp.text)
        return resp.json()


@router.get("/aml/flags")
async def list_aml_flags(organization_id: str, page: int = 1, page_size: int = 20):
    async with AsyncClient() as client:
        resp = await client.get(
            f"{service_url}/api/v1/compliance/aml/flags",
            params={"organization_id": organization_id, "page": page, "page_size": page_size},
        )
        if resp.status_code != 200:
            raise HTTPException(status_code=resp.status_code, detail=resp.text)
        return resp.json()


@router.post("/sanctions/screen")
async def screen_entity(payload: dict):
    async with AsyncClient() as client:
        resp = await client.post(f"{service_url}/api/v1/compliance/sanctions/screen", json=payload)
        if resp.status_code != 200:
            raise HTTPException(status_code=resp.status_code, detail=resp.text)
        return resp.json()


@router.get("/audit-logs")
async def list_audit_logs(organization_id: str, page: int = 1, page_size: int = 50):
    async with AsyncClient() as client:
        resp = await client.get(
            f"{service_url}/api/v1/compliance/audit-logs",
            params={"organization_id": organization_id, "page": page, "page_size": page_size},
        )
        if resp.status_code != 200:
            raise HTTPException(status_code=resp.status_code, detail=resp.text)
        return resp.json()


@router.get("/reports")
async def generate_compliance_report(organization_id: str, report_type: str = "summary"):
    async with AsyncClient() as client:
        resp = await client.get(
            f"{service_url}/api/v1/compliance/reports",
            params={"organization_id": organization_id, "report_type": report_type},
        )
        if resp.status_code != 200:
            raise HTTPException(status_code=resp.status_code, detail=resp.text)
        return resp.json()
