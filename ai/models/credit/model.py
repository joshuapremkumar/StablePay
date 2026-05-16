"""
Credit Scoring Model - Placeholder for XGBoost/LightGBM integration.

Provides SME trade credit scoring, vendor risk assessment,
and treasury health evaluation.
"""

import numpy as np
from typing import Dict, Any, Optional
from datetime import datetime, timedelta


class SMECreditScorer:
    def __init__(self, model_path: Optional[str] = None):
        self.model_path = model_path
        self.model = None

    def load_model(self):
        try:
            if self.model_path:
                import joblib
                self.model = joblib.load(self.model_path)
        except Exception as e:
            print(f"Model not found: {e}")

    def calculate_score(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Calculate SME trade credit score based on:
        - Payment history (35%)
        - Trade volume (20%)
        - Invoice performance (20%)
        - Time in business (15%)
        - Dispute ratio (10%)
        """
        payment_history = min(data.get("payment_history_score", 50) / 100, 1.0)
        trade_volume = min(data.get("trade_volume_score", 50) / 100, 1.0)
        invoice_performance = min(data.get("invoice_performance_score", 50) / 100, 1.0)
        time_in_business = min(data.get("time_in_business_score", 50) / 100, 1.0)
        dispute_ratio = 1.0 - min(data.get("dispute_ratio_score", 50) / 100, 1.0)

        overall = (
            payment_history * 0.35
            + trade_volume * 0.20
            + invoice_performance * 0.20
            + time_in_business * 0.15
            + dispute_ratio * 0.10
        )

        score = int(overall * 850)
        rating = self._score_to_rating(score)
        tier = self._score_to_tier(score)

        return {
            "credit_score": score,
            "rating": rating,
            "tier": tier,
            "components": {
                "payment_history": float(payment_history * 100),
                "trade_volume": float(trade_volume * 100),
                "invoice_performance": float(invoice_performance * 100),
                "time_in_business": float(time_in_business * 100),
                "dispute_ratio": float(dispute_ratio * 100),
            },
            "recommended_limit": self._calculate_recommended_limit(score, data.get("annual_revenue", 0)),
        }

    def _score_to_rating(self, score: int) -> str:
        if score >= 800: return "AAA"
        if score >= 750: return "AA"
        if score >= 700: return "A"
        if score >= 650: return "BBB"
        if score >= 600: return "BB"
        if score >= 500: return "B"
        if score >= 400: return "CCC"
        if score >= 300: return "CC"
        return "D"

    def _score_to_tier(self, score: int) -> str:
        if score >= 700: return "platinum"
        if score >= 600: return "gold"
        if score >= 500: return "silver"
        if score >= 400: return "bronze"
        return "basic"

    def _calculate_recommended_limit(self, score: int, revenue: float) -> float:
        if revenue <= 0:
            revenue = 100000
        base_limit = revenue * 0.15
        score_multiplier = score / 500
        return round(base_limit * score_multiplier, 2)


class VendorRiskAssessor:
    def assess(self, vendor_data: Dict[str, Any]) -> Dict[str, Any]:
        delinquency = vendor_data.get("payment_delinquency_rate", 0)
        discrepancy = vendor_data.get("invoice_discrepancy_rate", 0)
        verification = vendor_data.get("business_verification_score", 50)

        risk_score = (
            delinquency * 0.40
            + discrepancy * 0.30
            + (100 - verification) * 0.30
        )

        return {
            "vendor_id": vendor_data.get("vendor_id", ""),
            "risk_score": float(round(risk_score, 2)),
            "risk_level": "low" if risk_score < 30 else "medium" if risk_score < 60 else "high",
            "payment_reliability": float(round(100 - delinquency, 2)),
        }


class TreasuryHealthAnalyzer:
    def analyze(self, metrics: Dict[str, Any]) -> Dict[str, Any]:
        liquidity = metrics.get("liquidity_ratio", 1.0)
        dpo = metrics.get("days_payable_outstanding", 30)
        dso = metrics.get("days_sales_outstanding", 30)
        burn_rate = metrics.get("burn_rate", 0)
        cash_reserves = metrics.get("cash_reserves", 0)

        liquidity_score = min(liquidity / 2.0, 1.0) * 35
        efficiency_score = max(0, 1 - abs(dpo - dso) / 60) * 25
        runway_score = min((cash_reserves / (burn_rate or 1)) / 12, 1.0) * 25
        stability_score = 15

        health_score = liquidity_score + efficiency_score + runway_score + stability_score

        return {
            "health_score": float(round(health_score, 2)),
            "status": "healthy" if health_score >= 70 else "warning" if health_score >= 40 else "critical",
            "insights": {
                "liquidity_position": "strong" if liquidity > 1.5 else "adequate" if liquidity > 1.0 else "weak",
                "cash_conversion_cycle": dso - dpo,
                "runway_months": round(cash_reserves / (burn_rate or 1), 1),
            },
            "recommendations": self._generate_recommendations(liquidity, dpo, dso, health_score),
        }

    def _generate_recommendations(self, liquidity: float, dpo: int, dso: int, score: float) -> list:
        recs = []
        if liquidity < 1.0:
            recs.append("Improve liquidity ratio by reducing short-term liabilities")
        if dso > 45:
            recs.append("Accelerate receivables collection - consider invoice factoring")
        if dpo < 30:
            recs.append("Negotiate extended payment terms with suppliers")
        if score < 40:
            recs.append("Consider restructuring debt to improve cash flow")
        return recs
