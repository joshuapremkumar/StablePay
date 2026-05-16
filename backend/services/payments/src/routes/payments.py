from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from typing import Optional
from datetime import datetime, timedelta
from decimal import Decimal

from backend.shared.utils.database import get_db
from src.models.payments import Transaction, Settlement, Invoice, Refund, PaymentLink, CheckoutSession

router = APIRouter()


@router.post("/checkout")
async def create_checkout_session(payload: dict, db: Session = Depends(get_db)):
    session = CheckoutSession(
        organization_id=payload["organization_id"],
        amount=Decimal(str(payload["amount"])),
        currency=payload.get("currency", "USDC"),
        description=payload.get("description", ""),
        merchant_name=payload.get("merchant_name", ""),
        customer_email=payload.get("customer_email"),
        redirect_url=payload.get("redirect_url"),
        cancel_url=payload.get("cancel_url"),
        status="pending",
        expires_at=datetime.utcnow() + timedelta(hours=1),
        metadata_json=str(payload.get("metadata", {})),
    )
    db.add(session)
    db.commit()
    db.refresh(session)

    return {
        "id": session.id,
        "checkout_url": f"/checkout/{session.id}",
        "amount": float(session.amount),
        "currency": session.currency,
        "status": session.status,
        "expires_at": session.expires_at.isoformat(),
        "merchant_name": session.merchant_name,
        "qr_data": f"stablepay:pay:{session.id}",
    }


@router.post("/checkout/{session_id}/confirm")
async def confirm_checkout(session_id: str, payload: dict, db: Session = Depends(get_db)):
    session = db.query(CheckoutSession).filter(CheckoutSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Checkout session not found")
    if session.status != "pending":
        raise HTTPException(status_code=400, detail="Session already processed")

    session.status = "completed"
    session.paid_at = datetime.utcnow()
    session.wallet_address = payload.get("wallet_address")
    session.tx_hash = payload.get("tx_hash")

    transaction = Transaction(
        organization_id=session.organization_id,
        transaction_type="payment",
        amount=session.amount,
        currency=session.currency,
        status="completed",
        description=session.description,
        merchant_name=session.merchant_name,
        customer_email=session.customer_email,
        checkout_session_id=session.id,
        wallet_address=session.wallet_address,
        tx_hash=session.tx_hash,
    )
    db.add(transaction)
    db.commit()

    return {
        "id": transaction.id,
        "status": "completed",
        "amount": float(transaction.amount),
        "currency": transaction.currency,
        "tx_hash": transaction.tx_hash,
        "confirmed_at": datetime.utcnow().isoformat(),
    }


@router.get("/transactions")
async def list_transactions(
    organization_id: str,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status: Optional[str] = None,
    db: Session = Depends(get_db),
):
    query = db.query(Transaction).filter(
        Transaction.organization_id == organization_id,
        Transaction.is_deleted == False,
    )
    if status:
        query = query.filter(Transaction.status == status)
    total = query.count()
    items = query.order_by(desc(Transaction.created_at)).offset((page - 1) * page_size).limit(page_size).all()

    return {
        "items": [
            {
                "id": t.id,
                "type": t.transaction_type,
                "amount": float(t.amount),
                "currency": t.currency,
                "status": t.status,
                "description": t.description,
                "merchant_name": t.merchant_name,
                "customer_email": t.customer_email,
                "wallet_address": t.wallet_address,
                "tx_hash": t.tx_hash,
                "created_at": t.created_at.isoformat(),
                "completed_at": t.completed_at.isoformat() if t.completed_at else None,
            }
            for t in items
        ],
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size,
    }


@router.get("/settlements")
async def list_settlements(
    organization_id: str,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    query = db.query(Settlement).filter(
        Settlement.organization_id == organization_id,
        Settlement.is_deleted == False,
    )
    total = query.count()
    items = query.order_by(desc(Settlement.created_at)).offset((page - 1) * page_size).limit(page_size).all()

    return {
        "items": [
            {
                "id": s.id,
                "settlement_date": s.settlement_date.isoformat() if s.settlement_date else None,
                "amount": float(s.amount),
                "currency": s.currency,
                "status": s.status,
                "transaction_count": s.transaction_count,
                "reference": s.reference,
                "created_at": s.created_at.isoformat(),
            }
            for s in items
        ],
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size,
    }


@router.post("/refunds")
async def create_refund(payload: dict, db: Session = Depends(get_db)):
    transaction = db.query(Transaction).filter(
        Transaction.id == payload.get("transaction_id"),
        Transaction.organization_id == payload["organization_id"],
    ).first()
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    if transaction.status == "refunded":
        raise HTTPException(status_code=400, detail="Transaction already refunded")

    refund = Refund(
        organization_id=payload["organization_id"],
        transaction_id=payload["transaction_id"],
        amount=Decimal(str(payload.get("amount", transaction.amount))),
        currency=payload.get("currency", transaction.currency),
        reason=payload.get("reason", ""),
        status="pending",
    )
    db.add(refund)
    transaction.status = "refunded"
    transaction.refunded_at = datetime.utcnow()
    db.commit()
    db.refresh(refund)

    return {
        "id": refund.id,
        "transaction_id": refund.transaction_id,
        "amount": float(refund.amount),
        "currency": refund.currency,
        "status": refund.status,
        "reason": refund.reason,
    }


@router.get("/invoices")
async def list_invoices(
    organization_id: str,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status: Optional[str] = None,
    db: Session = Depends(get_db),
):
    query = db.query(Invoice).filter(
        Invoice.organization_id == organization_id,
        Invoice.is_deleted == False,
    )
    if status:
        query = query.filter(Invoice.status == status)
    total = query.count()
    items = query.order_by(desc(Invoice.created_at)).offset((page - 1) * page_size).limit(page_size).all()

    return {
        "items": [
            {
                "id": inv.id,
                "invoice_number": inv.invoice_number,
                "customer_name": inv.customer_name,
                "customer_email": inv.customer_email,
                "amount": float(inv.amount),
                "currency": inv.currency,
                "status": inv.status,
                "due_date": inv.due_date.isoformat() if inv.due_date else None,
                "description": inv.description,
                "payment_link": inv.payment_link,
                "created_at": inv.created_at.isoformat(),
            }
            for inv in items
        ],
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size,
    }


@router.post("/invoices")
async def create_invoice(payload: dict, db: Session = Depends(get_db)):
    import uuid
    invoice = Invoice(
        organization_id=payload["organization_id"],
        invoice_number=f"INV-{datetime.utcnow().strftime('%Y%m')}-{uuid.uuid4().hex[:8].upper()}",
        customer_name=payload["customer_name"],
        customer_email=payload.get("customer_email"),
        amount=Decimal(str(payload["amount"])),
        currency=payload.get("currency", "USDC"),
        status="pending",
        due_date=datetime.fromisoformat(payload["due_date"]) if payload.get("due_date") else None,
        description=payload.get("description", ""),
        payment_link=f"/pay/invoice/{uuid.uuid4().hex[:12]}",
    )
    db.add(invoice)
    db.commit()
    db.refresh(invoice)

    return {
        "id": invoice.id,
        "invoice_number": invoice.invoice_number,
        "amount": float(invoice.amount),
        "currency": invoice.currency,
        "status": invoice.status,
        "payment_link": invoice.payment_link,
        "due_date": invoice.due_date.isoformat() if invoice.due_date else None,
    }
