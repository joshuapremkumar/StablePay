from fastapi import APIRouter, HTTPException, Depends, status
from httpx import AsyncClient

from backend.shared.utils.config import settings
from backend.shared.schemas.users import UserLogin, UserCreate, TokenResponse, UserResponse

router = APIRouter()
auth_service_url = "http://auth-service:8001"


@router.post("/login", response_model=TokenResponse)
async def login(payload: UserLogin):
    async with AsyncClient() as client:
        resp = await client.post(f"{auth_service_url}/api/v1/auth/login", json=payload.model_dump())
        if resp.status_code != 200:
            raise HTTPException(status_code=resp.status_code, detail=resp.json().get("detail", "Authentication failed"))
        return resp.json()


@router.post("/register", response_model=TokenResponse)
async def register(payload: UserCreate):
    async with AsyncClient() as client:
        resp = await client.post(f"{auth_service_url}/api/v1/auth/register", json=payload.model_dump())
        if resp.status_code != 201:
            raise HTTPException(status_code=resp.status_code, detail=resp.json().get("detail", "Registration failed"))
        return resp.json()


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(refresh_token: str):
    async with AsyncClient() as client:
        resp = await client.post(f"{auth_service_url}/api/v1/auth/refresh", json={"refresh_token": refresh_token})
        if resp.status_code != 200:
            raise HTTPException(status_code=resp.status_code, detail="Token refresh failed")
        return resp.json()


@router.post("/logout")
async def logout():
    return {"message": "Logged out successfully"}


@router.get("/me", response_model=UserResponse)
async def get_current_user():
    async with AsyncClient() as client:
        resp = await client.get(f"{auth_service_url}/api/v1/auth/me")
        if resp.status_code != 200:
            raise HTTPException(status_code=resp.status_code, detail="Failed to fetch user")
        return resp.json()
