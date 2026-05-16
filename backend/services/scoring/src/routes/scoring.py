from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from datetime import datetime, timedelta
import random

router = APIRouter()


@router.get("/fraud/check")
async def check_fraud(transaction_id: str):
    score = random.uniform(0, 100)
    is_fraudulent = score > 95
    return {
        "transaction_id": transaction_id,
        "fraud_score": round(score, 2),
        "is_fraudulent": is_fraudulent,
        "risk_level": "high" if score > 90 else "medium" if score > 70 else "low",
        "flags": ["amount_anomaly"] if score > 85 else [],
        "recommendation": "block" if is_fraudulent else "approve",
        "model_version": "0.1.0",
        "analyzed_at": datetime.utcnow().isoformat(),
    }


@router.post("/fraud/analyze")
async def analyze_fraud(payload: dict):
    transaction = payload.get("transaction", {})
    score = random.uniform(0, 100)
    return {
        "fraud_score": round(score, 2),
        "risk_level": "high" if score > 90 else "medium" if score > 70 else "low",
        "indicators": [
            {"name": "amount_anomaly", "weight": 0.3, "score": round(random.uniform(0, 100), 2)},
            {"name": "velocity_check", "weight": 0.2, "score": round(random.uniform(0, 100), 2)},
            {"name": "address_mismatch", "weight": 0.2, "score": round(random.uniform(0, 100), 2)},
            {"name": "historical_pattern", "weight": 0.3, "score": round(random.uniform(0, 100), 2)},
        ],
        "model_version": "0.1.0",
    }


@router.get("/credit/sme-score/{organization_id}")
async def get_sme_credit_score(organization_id: str):
    score = round(random.uniform(300, 850), 2)
    return {
        "organization_id": organization_id,
        "credit_score": score,
        "rating": "AAA" if score > 800 else "AA" if score > 750 else "A" if score > 700 else "BBB" if score > 650 else "BB" if score > 600 else "B" if score > 500 else "CCC",
        "factors": {
            "payment_history": round(random.uniform(0, 100), 2),
            "debt_ratio": round(random.uniform(0, 100), 2),
            "business_tenure": round(random.uniform(0, 100), 2),
            "industry_risk": round(random.uniform(0, 100), 2),
            "cash_flow_stability": round(random.uniform(0, 100), 2),
        },
        "recommended_limit": round(random.uniform(50000, 500000), 2),
        "model_version": "0.1.0",
        "calculated_at": datetime.utcnow().isoformat(),
    }


@router.get("/credit/vendor-risk/{vendor_id}")
async def get_vendor_risk_score(vendor_id: str):
    return {
        "vendor_id": vendor_id,
        "risk_score": round(random.uniform(0, 100), 2),
        "risk_level": "low" if random.random() > 0.7 else "medium" if random.random() > 0.4 else "high",
        "factors": {
            "payment_delinquency": round(random.uniform(0, 100), 2),
            "invoice_discrepancy_rate": round(random.uniform(0, 100), 2),
            "business_verification": round(random.uniform(0, 100), 2),
            "market_reputation": round(random.uniform(0, 100), 2),
        },
        "recommendation": "approved" if random.random() > 0.3 else "review",
        "model_version": "0.1.0",
    }


@router.get("/cashflow/predict")
async def predict_cashflow(organization_id: str, days: int = 30):
    today = datetime.utcnow()
    predictions = []
    for d in range(days):
        day = today + timedelta(days=d)
        predictions.append({
            "date": day.strftime("%Y-%m-%d"),
            "predicted_inflow": round(random.uniform(10000, 100000), 2),
            "predicted_outflow": round(random.uniform(5000, 80000), 2),
            "predicted_balance": round(random.uniform(50000, 500000), 2),
            "confidence": round(random.uniform(0.7, 0.99), 2),
        })
    return {
        "organization_id": organization_id,
        "predictions": predictions,
        "summary": {
            "avg_daily_inflow": round(sum(p["predicted_inflow"] for p in predictions) / days, 2),
            "avg_daily_outflow": round(sum(p["predicted_outflow"] for p in predictions) / days, 2),
            "projected_end_balance": predictions[-1]["predicted_balance"],
            "cash_runway_days": random.randint(60, 365),
        },
        "model_version": "0.1.0",
        "generated_at": datetime.utcnow().isoformat(),
    }


@router.get("/treasury-health/{organization_id}")
async def get_treasury_health(organization_id: str):
    score = round(random.uniform(0, 100), 2)
    return {
        "organization_id": organization_id,
        "health_score": score,
        "status": "healthy" if score > 70 else "warning" if score > 40 else "critical",
        "metrics": {
            "liquidity_ratio": round(random.uniform(0.5, 3.0), 2),
            "days_payable_outstanding": random.randint(15, 90),
            "days_sales_outstanding": random.randint(15, 60),
            "operating_cash_flow_ratio": round(random.uniform(0.5, 2.5), 2),
            "burn_rate": round(random.uniform(5000, 50000), 2),
            "runway_months": random.randint(3, 24),
        },
        "recommendations": [
            "Consider negotiating longer payment terms with suppliers",
            "Invoice aging > 60 days represents 15% of receivables",
        ],
        "model_version": "0.1.0",
    }
