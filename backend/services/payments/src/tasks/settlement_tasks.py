from backend.shared.utils.celery_app import celery_app


@celery_app.task(bind=True)
def process_settlement(self, settlement_id: str):
    print(f"Processing settlement {settlement_id}...")
    return {"settlement_id": settlement_id, "status": "processing"}


@celery_app.task(bind=True)
def verify_blockchain_transaction(self, tx_hash: str):
    print(f"Verifying transaction {tx_hash} on blockchain...")
    return {"tx_hash": tx_hash, "verified": True}
