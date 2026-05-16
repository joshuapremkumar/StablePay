from backend.shared.utils.celery_app import celery_app


@celery_app.task(bind=True)
def sync_erp_data(self, organization_id: str):
    print(f"Syncing ERP data for {organization_id}")
    return {"organization_id": organization_id, "status": "synced"}


@celery_app.task(bind=True)
def sync_bank_transactions(self, organization_id: str):
    print(f"Syncing bank transactions for {organization_id}")
    return {"organization_id": organization_id, "status": "synced"}
