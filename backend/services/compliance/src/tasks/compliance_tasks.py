from backend.shared.utils.celery_app import celery_app


@celery_app.task(bind=True)
def run_sanctions_screening(self, entity_name: str):
    print(f"Running sanctions screening for {entity_name}...")
    return {"entity_name": entity_name, "status": "completed"}


@celery_app.task(bind=True)
def generate_audit_export(self, organization_id: str, format: str = "csv"):
    print(f"Generating audit export for {organization_id} in {format} format")
    return {"organization_id": organization_id, "format": format, "status": "generated"}
