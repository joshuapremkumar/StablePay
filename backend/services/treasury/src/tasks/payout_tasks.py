from backend.shared.utils.celery_app import celery_app


@celery_app.task(bind=True)
def process_payout(self, payout_id: str):
    print(f"Processing payout {payout_id}...")
    return {"payout_id": payout_id, "status": "processing"}


@celery_app.task(bind=True)
def send_payout_notification(self, payout_id: str, recipient_email: str):
    print(f"Sending notification for payout {payout_id} to {recipient_email}")
    return {"sent": True, "recipient": recipient_email}
