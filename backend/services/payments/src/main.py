import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.routes.payments import router as payments_router
from src.models.payments import Base
from backend.shared.utils.database import engine

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting Payments Service...")
    Base.metadata.create_all(bind=engine)
    yield
    logger.info("Shutting down Payments Service...")


app = FastAPI(title="StablePay Payments Service", version="0.1.0", lifespan=lifespan)
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])
app.include_router(payments_router, prefix="/api/v1/payments", tags=["Payments"])
