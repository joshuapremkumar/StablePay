import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.routes.scoring import router as scoring_router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting AI Scoring Service...")
    yield
    logger.info("Shutting down AI Scoring Service...")

app = FastAPI(title="StablePay AI Scoring Service", version="0.1.0", lifespan=lifespan)
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])
app.include_router(scoring_router, prefix="/api/v1/scoring", tags=["AI Scoring"])
