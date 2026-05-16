from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from typing import Optional
from datetime import datetime, timedelta
from decimal import Decimal

from backend.shared.utils.database import get_db
from src.models.trade import LetterOfCredit, InvoiceFinancing, ReceivableListing, EscrowAgreement, ShipmentMilestone, SMETradeScore, SupplierFinancing

router = APIRouter()


@router.get("/letters-of-credit")
async def list_letters_of_credit(
    organization_id: str,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    query = db.query(LetterOfCredit).filter(
        LetterOfCredit.organization_id == organization_id,
        LetterOfCredit.is_deleted == False,
    )
    total = query.count()
    items = query.order_by(desc(LetterOfCredit.created_at)).offset((page - 1) * page_size).limit(page_size).all()

    return {
        "items": [
            {
                "id": loc.id,
                "loc_number": loc.loc_number,
                "type": loc.loc_type,
                "amount": float(loc.amount),
                "currency": loc.currency,
                "status": loc.status,
                "applicant": loc.applicant_name,
                "beneficiary": loc.beneficiary_name,
                "issue_date": loc.issue_date.isoformat() if loc.issue_date else None,
                "expiry_date": loc.expiry_date.isoformat() if loc.expiry_date else None,
                "created_at": loc.created_at.isoformat(),
            }
            for loc in items
        ],
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size,
    }


@router.post("/letters-of-credit")
async def create_letter_of_credit(payload: dict, db: Session = Depends(get_db)):
    import uuid
    loc = LetterOfCredit(
        organization_id=payload["organization_id"],
        loc_number=f"LOC-{datetime.utcnow().strftime('%Y%m')}-{uuid.uuid4().hex[:8].upper()}",
        loc_type=payload.get("loc_type", "standby"),
        amount=Decimal(str(payload["amount"])),
        currency=payload.get("currency", "USDC"),
        status="issued",
        applicant_name=payload["applicant_name"],
        applicant_address=payload.get("applicant_address"),
        beneficiary_name=payload["beneficiary_name"],
        beneficiary_address=payload.get("beneficiary_address"),
        issue_date=datetime.utcnow(),
        expiry_date=datetime.fromisoformat(payload["expiry_date"]) if payload.get("expiry_date") else None,
        terms_conditions=payload.get("terms_conditions"),
        supporting_docs=str(payload.get("supporting_docs", [])),
    )
    db.add(loc)
    db.commit()
    db.refresh(loc)

    return {
        "id": loc.id,
        "loc_number": loc.loc_number,
        "amount": float(loc.amount),
        "currency": loc.currency,
        "status": loc.status,
        "applicant": loc.applicant_name,
        "beneficiary": loc.beneficiary_name,
        "expiry_date": loc.expiry_date.isoformat() if loc.expiry_date else None,
    }


@router.get("/invoice-financing")
async def list_invoice_financing(
    organization_id: str,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    query = db.query(InvoiceFinancing).filter(
        InvoiceFinancing.organization_id == organization_id,
        InvoiceFinancing.is_deleted == False,
    )
    total = query.count()
    items = query.order_by(desc(InvoiceFinancing.created_at)).offset((page - 1) * page_size).limit(page_size).all()

    return {
        "items": [
            {
                "id": f.id,
                "invoice_number": f.invoice_number,
                "invoice_amount": float(f.invoice_amount),
                "funding_amount": float(f.funding_amount),
                "currency": f.currency,
                "status": f.status,
                "interest_rate": float(f.interest_rate),
                "funding_date": f.funding_date.isoformat() if f.funding_date else None,
                "maturity_date": f.maturity_date.isoformat() if f.maturity_date else None,
                "created_at": f.created_at.isoformat(),
            }
            for f in items
        ],
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size,
    }


@router.post("/invoice-financing")
async def create_invoice_financing(payload: dict, db: Session = Depends(get_db)):
    import uuid
    invoice_amount = Decimal(str(payload["invoice_amount"]))
    advance_rate = Decimal(str(payload.get("advance_rate", "0.8")))
    funding_amount = invoice_amount * advance_rate

    financing = InvoiceFinancing(
        organization_id=payload["organization_id"],
        invoice_number=payload["invoice_number"],
        invoice_amount=invoice_amount,
        funding_amount=funding_amount,
        currency=payload.get("currency", "USDC"),
        status="pending",
        interest_rate=Decimal(str(payload.get("interest_rate", "0.05"))),
        advance_rate=advance_rate,
        funding_date=None,
        maturity_date=datetime.fromisoformat(payload["maturity_date"]) if payload.get("maturity_date") else None,
        debtor_name=payload.get("debtor_name"),
        debtor_address=payload.get("debtor_address"),
        invoice_due_date=datetime.fromisoformat(payload["invoice_due_date"]) if payload.get("invoice_due_date") else None,
        supporting_docs=str(payload.get("supporting_docs", [])),
    )
    db.add(financing)
    db.commit()
    db.refresh(financing)

    return {
        "id": financing.id,
        "invoice_number": financing.invoice_number,
        "invoice_amount": float(financing.invoice_amount),
        "funding_amount": float(financing.funding_amount),
        "advance_rate": float(financing.advance_rate),
        "interest_rate": float(financing.interest_rate),
        "status": financing.status,
        "maturity_date": financing.maturity_date.isoformat() if financing.maturity_date else None,
    }


@router.get("/receivables-marketplace")
async def list_receivables(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    min_amount: Optional[float] = None,
    max_amount: Optional[float] = None,
    db: Session = Depends(get_db),
):
    query = db.query(ReceivableListing).filter(
        ReceivableListing.is_deleted == False,
        ReceivableListing.status == "active",
    )
    if min_amount:
        query = query.filter(ReceivableListing.amount >= Decimal(str(min_amount)))
    if max_amount:
        query = query.filter(ReceivableListing.amount <= Decimal(str(max_amount)))
    total = query.count()
    items = query.order_by(desc(ReceivableListing.created_at)).offset((page - 1) * page_size).limit(page_size).all()

    return {
        "items": [
            {
                "id": r.id,
                "organization_id": r.organization_id,
                "invoice_number": r.invoice_number,
                "amount": float(r.amount),
                "currency": r.currency,
                "discount_rate": float(r.discount_rate),
                "remaining_days": r.remaining_days,
                "debtor_name": r.debtor_name,
                "debtor_rating": r.debtor_rating,
                "status": r.status,
                "created_at": r.created_at.isoformat(),
            }
            for r in items
        ],
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size,
    }


@router.get("/sme-score/{organization_id}")
async def get_sme_score(organization_id: str, db: Session = Depends(get_db)):
    score = db.query(SMETradeScore).filter(
        SMETradeScore.organization_id == organization_id,
    ).order_by(desc(SMETradeScore.calculated_at)).first()

    if not score:
        return {
            "organization_id": organization_id,
            "overall_score": None,
            "components": {},
            "tier": "unrated",
            "message": "Score not yet calculated. Submit trade data to generate score.",
        }

    return {
        "organization_id": organization_id,
        "overall_score": float(score.overall_score),
        "components": {
            "payment_history": float(score.payment_history_score),
            "trade_volume": float(score.trade_volume_score),
            "invoice_performance": float(score.invoice_performance_score),
            "time_in_business": float(score.time_in_business_score),
            "dispute_ratio": float(score.dispute_ratio_score),
        },
        "tier": score.tier,
        "calculated_at": score.calculated_at.isoformat(),
    }


@router.post("/escrow")
async def create_escrow(payload: dict, db: Session = Depends(get_db)):
    escrow = EscrowAgreement(
        organization_id=payload["organization_id"],
        escrow_number=f"ESC-{datetime.utcnow().strftime('%Y%m')}-{uuid.uuid4().hex[:8].upper()}",
        amount=Decimal(str(payload["amount"])),
        currency=payload.get("currency", "USDC"),
        status="pending",
        buyer_name=payload["buyer_name"],
        seller_name=payload["seller_name"],
        description=payload.get("description", ""),
        terms_conditions=payload.get("terms_conditions"),
        expires_at=datetime.fromisoformat(payload["expires_at"]) if payload.get("expires_at") else None,
    )
    db.add(escrow)
    db.commit()
    db.refresh(escrow)

    return {
        "id": escrow.id,
        "escrow_number": escrow.escrow_number,
        "amount": float(escrow.amount),
        "currency": escrow.currency,
        "status": escrow.status,
        "buyer": escrow.buyer_name,
        "seller": escrow.seller_name,
    }
