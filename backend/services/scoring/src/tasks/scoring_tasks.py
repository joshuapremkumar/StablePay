from backend.shared.utils.celery_app import celery_app


@celery_app.task(bind=True)
def batch_score_transactions(self, organization_id: str):
    print(f"Batch scoring transactions for {organization_id}")
    return {"organization_id": organization_id, "scored": 100}


@celery_app.task(bind=True)
def recalculate_credit_score(self, organization_id: str):
    print(f"Recalculating credit score for {organization_id}")
    return {"organization_id": organization_id, "status": "completed"}
