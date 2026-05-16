from fastapi import APIRouter, HTTPException
from httpx import AsyncClient

router = APIRouter()
service_url = "http://scoring-service:8006"


@router.get("/fraud/check")
async def check_fraud(transaction_id: str):
    async with AsyncClient() as client:
        resp = await client.get(f"{service_url}/api/v1/scoring/fraud/check", params={"transaction_id": transaction_id})
        if resp.status_code != 200:
            raise HTTPException(status_code=resp.status_code, detail=resp.text)
        return resp.json()


@router.post("/fraud/analyze")
async def analyze_fraud(payload: dict):
    async with AsyncClient() as client:
        resp = await client.post(f"{service_url}/api/v1/scoring/fraud/analyze", json=payload)
        if resp.status_code != 200:
            raise HTTPException(status_code=resp.status_code, detail=resp.text)
        return resp.json()


@router.get("/credit/sme-score/{organization_id}")
async def get_sme_credit_score(organization_id: str):
    async with AsyncClient() as client:
        resp = await client.get(f"{service_url}/api/v1/scoring/credit/sme-score/{organization_id}")
        if resp.status_code != 200:
            raise HTTPException(status_code=resp.status_code, detail=resp.text)
        return resp.json()


@router.get("/credit/vendor-risk/{vendor_id}")
async def get_vendor_risk_score(vendor_id: str):
    async with AsyncClient() as client:
        resp = await client.get(f"{service_url}/api/v1/scoring/credit/vendor-risk/{vendor_id}")
        if resp.status_code != 200:
            raise HTTPException(status_code=resp.status_code, detail=resp.text)
        return resp.json()


@router.get("/cashflow/predict")
async def predict_cashflow(organization_id: str, days: int = 30):
    async with AsyncClient() as client:
        resp = await client.get(
            f"{service_url}/api/v1/scoring/cashflow/predict",
            params={"organization_id": organization_id, "days": days},
        )
        if resp.status_code != 200:
            raise HTTPException(status_code=resp.status_code, detail=resp.text)
        return resp.json()


@router.get("/treasury-health/{organization_id}")
async def get_treasury_health(organization_id: str):
    async with AsyncClient() as client:
        resp = await client.get(f"{service_url}/api/v1/scoring/treasury-health/{organization_id}")
        if resp.status_code != 200:
            raise HTTPException(status_code=resp.status_code, detail=resp.text)
        return resp.json()
