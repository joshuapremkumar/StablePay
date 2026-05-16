from fastapi import APIRouter
from datetime import datetime

router = APIRouter()


@router.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "stablepay-api-gateway",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "0.1.0",
    }


@router.get("/health/ready")
async def readiness_check():
    return {"status": "ready", "timestamp": datetime.utcnow().isoformat()}
