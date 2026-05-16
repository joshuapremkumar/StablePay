"""
AI Model Inference API - FastAPI service for model serving.

Provides REST endpoints for fraud detection, credit scoring,
cash flow prediction, and treasury health analysis.
"""

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

from models.fraud.model import FraudDetectionModel, InvoiceAnomalyDetector
from models.credit.model import SMECreditScorer, VendorRiskAssessor, TreasuryHealthAnalyzer
from models.cashflow.model import CashFlowPredictor

app = FastAPI(
    title="StablePay AI Inference Service",
    version="0.1.0",
    description="AI/ML model serving for fraud detection, credit scoring, and cash flow prediction",
)

fraud_detector = FraudDetectionModel()
invoice_anomaly = InvoiceAnomalyDetector()
credit_scorer = SMECreditScorer()
vendor_risk = VendorRiskAssessor()
treasury_health = TreasuryHealthAnalyzer()
cashflow_predictor = CashFlowPredictor()


class FraudCheckRequest(BaseModel):
    transaction_id: str
    features: Dict[str, Any]


class FraudCheckResponse(BaseModel):
    transaction_id: str
    fraud_probability: float
    risk_level: str
    is_fraudulent: bool
    model_version: str


class CreditScoreRequest(BaseModel):
    organization_id: str
    payment_history_score: float = 50
    trade_volume_score: float = 50
    invoice_performance_score: float = 50
    time_in_business_score: float = 50
    dispute_ratio_score: float = 50


class CashFlowRequest(BaseModel):
    organization_id: str
    days: int = 30
    historical_data: Optional[List[Dict]] = None


class TreasuryHealthRequest(BaseModel):
    organization_id: str
    liquidity_ratio: float = 1.0
    days_payable_outstanding: int = 30
    days_sales_outstanding: int = 30
    burn_rate: float = 0
    cash_reserves: float = 0


@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "service": "stablepay-ai-inference",
        "timestamp": datetime.utcnow().isoformat(),
    }


@app.post("/v1/fraud/check", response_model=FraudCheckResponse)
async def check_fraud(request: FraudCheckRequest):
    result = fraud_detector.predict(request.features)
    return FraudCheckResponse(
        transaction_id=request.transaction_id,
        **result,
    )


@app.post("/v1/fraud/invoice-anomaly")
async def detect_invoice_anomaly(data: Dict[str, Any]):
    return invoice_anomaly.detect(data)


@app.post("/v1/credit/sme-score")
async def get_sme_credit_score(request: CreditScoreRequest):
    result = credit_scorer.calculate_score(request.model_dump())
    return {"organization_id": request.organization_id, **result}


@app.post("/v1/credit/vendor-risk")
async def assess_vendor_risk(data: Dict[str, Any]):
    return vendor_risk.assess(data)


@app.post("/v1/cashflow/predict")
async def predict_cashflow(request: CashFlowRequest):
    result = cashflow_predictor.predict(request.historical_data, request.days)
    return {"organization_id": request.organization_id, **result}


@app.post("/v1/treasury/health")
async def analyze_treasury_health(request: TreasuryHealthRequest):
    result = treasury_health.analyze(request.model_dump())
    return {"organization_id": request.organization_id, **result}
