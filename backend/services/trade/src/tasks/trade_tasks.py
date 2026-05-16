from backend.shared.utils.celery_app import celery_app


@celery_app.task(bind=True)
def process_letter_of_credit(self, loc_id: str):
    print(f"Processing letter of credit {loc_id}...")
    return {"loc_id": loc_id, "status": "processing"}


@celery_app.task(bind=True)
def fund_invoice_financing(self, financing_id: str):
    print(f"Funding invoice financing {financing_id}...")
    return {"financing_id": financing_id, "status": "funded"}
