from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from typing import Optional
from datetime import datetime, timedelta
from decimal import Decimal

from backend.shared.utils.database import get_db
from src.models.treasury import (
    Invoice, Supplier, Payout, PayrollRun,
    CashFlowEntry, Expense, TaxLog, PayoutItem,
)

router = APIRouter()


@router.get("/overview")
async def get_treasury_overview(organization_id: str, db: Session = Depends(get_db)):
    total_payables = db.query(func.sum(Invoice.amount)).filter(
        Invoice.organization_id == organization_id,
        Invoice.status.in_(["pending", "overdue"]),
        Invoice.is_deleted == False,
    ).scalar() or 0

    total_paid = db.query(func.sum(Payout.amount)).filter(
        Payout.organization_id == organization_id,
        Payout.status == "completed",
        Payout.is_deleted == False,
    ).scalar() or 0

    cash_balance = db.query(func.sum(CashFlowEntry.amount)).filter(
        CashFlowEntry.organization_id == organization_id,
        CashFlowEntry.is_deleted == False,
    ).scalar() or 0

    pending_payouts = db.query(func.count(Payout.id)).filter(
        Payout.organization_id == organization_id,
        Payout.status == "pending",
        Payout.is_deleted == False,
    ).scalar() or 0

    supplier_count = db.query(func.count(Supplier.id)).filter(
        Supplier.organization_id == organization_id,
        Supplier.is_deleted == False,
    ).scalar() or 0

    return {
        "organization_id": organization_id,
        "total_payables": float(total_payables),
        "total_paid": float(total_paid),
        "cash_balance": float(cash_balance),
        "pending_payouts": pending_payouts,
        "active_suppliers": supplier_count,
        "currency": "AED",
        "updated_at": datetime.utcnow().isoformat(),
    }


@router.get("/cashflow")
async def get_cashflow(
    organization_id: str,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    db: Session = Depends(get_db),
):
    query = db.query(CashFlowEntry).filter(
        CashFlowEntry.organization_id == organization_id,
        CashFlowEntry.is_deleted == False,
    )
    if start_date:
        query = query.filter(CashFlowEntry.date >= datetime.fromisoformat(start_date))
    if end_date:
        query = query.filter(CashFlowEntry.date <= datetime.fromisoformat(end_date))
    query = query.order_by(CashFlowEntry.date.desc()).limit(90)
    entries = query.all()

    return {
        "organization_id": organization_id,
        "entries": [
            {
                "id": e.id,
                "date": e.date.isoformat() if e.date else None,
                "type": e.entry_type,
                "amount": float(e.amount),
                "category": e.category,
                "description": e.description,
                "reference": e.reference,
            }
            for e in entries
        ],
        "summary": {
            "inflow": float(sum(e.amount for e in entries if e.entry_type == "inflow")),
            "outflow": float(sum(e.amount for e in entries if e.entry_type == "outflow")),
            "net": float(sum(e.amount for e in entries if e.entry_type == "inflow") - sum(e.amount for e in entries if e.entry_type == "outflow")),
        },
    }


@router.get("/accounts-payable")
async def list_accounts_payable(
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
                "supplier_id": inv.supplier_id,
                "supplier_name": inv.supplier_name,
                "amount": float(inv.amount),
                "currency": inv.currency,
                "status": inv.status,
                "due_date": inv.due_date.isoformat() if inv.due_date else None,
                "description": inv.description,
                "created_at": inv.created_at.isoformat(),
            }
            for inv in items
        ],
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size,
    }


@router.get("/suppliers")
async def list_suppliers(
    organization_id: str,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    query = db.query(Supplier).filter(
        Supplier.organization_id == organization_id,
        Supplier.is_deleted == False,
    )
    total = query.count()
    items = query.order_by(Supplier.name).offset((page - 1) * page_size).limit(page_size).all()

    return {
        "items": [
            {
                "id": s.id,
                "name": s.name,
                "contact_name": s.contact_name,
                "email": s.email,
                "phone": s.phone,
                "status": s.status,
                "payment_terms": s.payment_terms,
                "total_invoiced": float(s.total_invoiced or 0),
                "total_paid": float(s.total_paid or 0),
                "balance": float(s.balance or 0),
                "created_at": s.created_at.isoformat(),
            }
            for s in items
        ],
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size,
    }


@router.post("/payouts")
async def create_payout(payload: dict, db: Session = Depends(get_db)):
    payout = Payout(
        organization_id=payload["organization_id"],
        amount=Decimal(str(payload["amount"])),
        currency=payload.get("currency", "AED"),
        payment_method=payload.get("payment_method", "bank_transfer"),
        description=payload.get("description", ""),
        status="pending",
        created_by=payload.get("user_id"),
    )
    db.add(payout)
    db.flush()

    for item in payload.get("items", []):
        payout_item = PayoutItem(
            payout_id=payout.id,
            invoice_id=item.get("invoice_id"),
            supplier_id=item.get("supplier_id"),
            amount=Decimal(str(item["amount"])),
            description=item.get("description", ""),
        )
        db.add(payout_item)

    db.commit()
    db.refresh(payout)

    return {
        "id": payout.id,
        "amount": float(payout.amount),
        "currency": payout.currency,
        "status": payout.status,
        "item_count": len(payload.get("items", [])),
        "created_at": payout.created_at.isoformat(),
    }


@router.get("/expenses")
async def list_expenses(
    organization_id: str,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    category: Optional[str] = None,
    db: Session = Depends(get_db),
):
    query = db.query(Expense).filter(
        Expense.organization_id == organization_id,
        Expense.is_deleted == False,
    )
    if category:
        query = query.filter(Expense.category == category)
    total = query.count()
    items = query.order_by(desc(Expense.date)).offset((page - 1) * page_size).limit(page_size).all()

    return {
        "items": [
            {
                "id": e.id,
                "date": e.date.isoformat() if e.date else None,
                "category": e.category,
                "amount": float(e.amount),
                "currency": e.currency,
                "description": e.description,
                "vendor": e.vendor,
                "status": e.status,
                "receipt_url": e.receipt_url,
            }
            for e in items
        ],
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size,
    }


@router.get("/tax-logs")
async def list_tax_logs(
    organization_id: str,
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
):
    query = db.query(TaxLog).filter(
        TaxLog.organization_id == organization_id,
        TaxLog.is_deleted == False,
    )
    total = query.count()
    items = query.order_by(desc(TaxLog.tax_period)).offset((page - 1) * page_size).limit(page_size).all()

    return {
        "items": [
            {
                "id": t.id,
                "tax_type": t.tax_type,
                "tax_period": t.tax_period,
                "amount": float(t.amount),
                "currency": t.currency,
                "status": t.status,
                "filing_date": t.filing_date.isoformat() if t.filing_date else None,
                "reference": t.reference,
            }
            for t in items
        ],
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size,
    }
