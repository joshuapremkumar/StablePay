import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.routes.treasury import router as treasury_router
from src.models.treasury import Base
from backend.shared.utils.database import engine

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting Treasury Service...")
    Base.metadata.create_all(bind=engine)
    yield
    logger.info("Shutting down Treasury Service...")


app = FastAPI(
    title="StablePay Treasury Service",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(treasury_router, prefix="/api/v1/treasury", tags=["Treasury"])
