import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.routes.compliance import router as compliance_router
from src.models.compliance import Base
from backend.shared.utils.database import engine

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting Compliance Service...")
    Base.metadata.create_all(bind=engine)
    yield
    logger.info("Shutting down Compliance Service...")

app = FastAPI(title="StablePay Compliance Service", version="0.1.0", lifespan=lifespan)
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])
app.include_router(compliance_router, prefix="/api/v1/compliance", tags=["Compliance"])
