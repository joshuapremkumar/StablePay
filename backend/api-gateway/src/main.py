import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.shared.utils.config import settings
from backend.shared.middleware.logging_middleware import LoggingMiddleware
from backend.shared.middleware.rate_limit_middleware import RateLimitMiddleware

from src.routes.health import router as health_router
from src.routes.auth import router as auth_router
from src.routes.treasury import router as treasury_router
from src.routes.payments import router as payments_router
from src.routes.trade import router as trade_router
from src.routes.compliance import router as compliance_router
from src.routes.scoring import router as scoring_router
from src.routes.integrations import router as integrations_router
from src.routes.demo import router as demo_router

logging.basicConfig(level=getattr(logging, settings.LOG_LEVEL))
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting StablePay API Gateway...")
    yield
    logger.info("Shutting down StablePay API Gateway...")


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="SME Economic Infrastructure Platform - API Gateway",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(LoggingMiddleware)
app.add_middleware(RateLimitMiddleware)

app.include_router(health_router, prefix="/api/v1", tags=["Health"])
app.include_router(auth_router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(treasury_router, prefix="/api/v1/treasury", tags=["Treasury"])
app.include_router(payments_router, prefix="/api/v1/payments", tags=["Payments"])
app.include_router(trade_router, prefix="/api/v1/trade", tags=["Trade Finance"])
app.include_router(compliance_router, prefix="/api/v1/compliance", tags=["Compliance"])
app.include_router(scoring_router, prefix="/api/v1/scoring", tags=["AI Scoring"])
app.include_router(integrations_router, prefix="/api/v1/integrations", tags=["Integrations"])
app.include_router(demo_router, prefix="/api/v1/demo", tags=["Demo"])
