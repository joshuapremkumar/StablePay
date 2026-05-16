"""
Cash Flow Prediction Model - Placeholder for time series forecasting.

Uses statistical methods or lightweight ML for cash flow prediction.
Replace with Prophet, LSTM, or XGBoost in production.
"""

import numpy as np
from typing import Dict, Any, List
from datetime import datetime, timedelta


class CashFlowPredictor:
    def __init__(self):
        self.model = None

    def predict(self, historical_data: List[Dict], days: int = 30) -> Dict[str, Any]:
        """
        Predict cash flow for the next N days based on historical patterns.

        Args:
            historical_data: List of daily cash flow records
            days: Number of days to forecast

        Returns:
            Dict with predictions and summary statistics
        """
        if not historical_data:
            return self._generate_placeholder_predictions(days)

        inflows = np.array([d.get("inflow", 0) for d in historical_data[-90:]])
        outflows = np.array([d.get("outflow", 0) for d in historical_data[-90:]])
        balances = np.array([d.get("balance", 0) for d in historical_data[-90:]])

        avg_inflow = np.mean(inflows) if len(inflows) > 0 else 0
        avg_outflow = np.mean(outflows) if len(outflows) > 0 else 0
        std_inflow = np.std(inflows) if len(inflows) > 0 else avg_inflow * 0.3
        std_outflow = np.std(outflows) if len(outflows) > 0 else avg_outflow * 0.3

        predictions = []
        current_balance = balances[-1] if len(balances) > 0 else 0

        for d in range(days):
            pred_inflow = max(0, np.random.normal(avg_inflow, std_inflow * 0.5))
            pred_outflow = max(0, np.random.normal(avg_outflow, std_outflow * 0.5))

            if d % 7 == 0:
                pred_inflow *= 1.2
            if d % 30 == 0:
                pred_outflow *= 1.5

            current_balance = current_balance + pred_inflow - pred_outflow
            confidence = max(0.7, 1.0 - (d / days) * 0.3)

            predictions.append({
                "date": (datetime.utcnow() + timedelta(days=d)).strftime("%Y-%m-%d"),
                "predicted_inflow": round(pred_inflow, 2),
                "predicted_outflow": round(pred_outflow, 2),
                "predicted_balance": round(current_balance, 2),
                "confidence": round(confidence, 2),
            })

        return {
            "predictions": predictions,
            "summary": {
                "avg_daily_inflow": round(avg_inflow, 2),
                "avg_daily_outflow": round(avg_outflow, 2),
                "projected_end_balance": round(current_balance, 2),
                "cash_runway_days": self._calculate_runway(current_balance, avg_outflow),
            },
        }

    def _generate_placeholder_predictions(self, days: int) -> Dict[str, Any]:
        today = datetime.utcnow()
        predictions = []
        balance = 100000

        for d in range(days):
            inflow = np.random.uniform(10000, 100000)
            outflow = np.random.uniform(5000, 80000)
            balance += inflow - outflow
            predictions.append({
                "date": (today + timedelta(days=d)).strftime("%Y-%m-%d"),
                "predicted_inflow": round(inflow, 2),
                "predicted_outflow": round(outflow, 2),
                "predicted_balance": round(balance, 2),
                "confidence": round(np.random.uniform(0.7, 0.99), 2),
            })

        return {
            "predictions": predictions,
            "summary": {
                "avg_daily_inflow": round(sum(p["predicted_inflow"] for p in predictions) / days, 2),
                "avg_daily_outflow": round(sum(p["predicted_outflow"] for p in predictions) / days, 2),
                "projected_end_balance": round(balance, 2),
                "cash_runway_days": np.random.randint(60, 365),
            },
        }

    def _calculate_runway(self, balance: float, avg_outflow: float) -> int:
        if avg_outflow <= 0:
            return 365
        return min(int(balance / avg_outflow), 365)
