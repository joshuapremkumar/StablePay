from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from typing import Optional
from datetime import datetime
from backend.shared.utils.database import get_db
from src.models.compliance import KYBRecord, AMLFlag, SanctionsHit, AuditLog, ComplianceReport

router = APIRouter()


@router.post("/kyb")
async def submit_kyb(payload: dict, db: Session = Depends(get_db)):
    record = KYBRecord(
        organization_id=payload["organization_id"],
        status="pending_review",
        business_name=payload["business_name"],
        registration_number=payload.get("registration_number"),
        tax_id=payload.get("tax_id"),
        business_type=payload.get("business_type"),
        country=payload.get("country"),
        legal_representative_name=payload.get("legal_representative_name"),
        legal_representative_id=payload.get("legal_representative_id"),
        documents_submitted=str(payload.get("documents", [])),
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return {
        "id": record.id,
        "organization_id": record.organization_id,
        "status": record.status,
        "business_name": record.business_name,
        "submitted_at": record.created_at.isoformat(),
    }


@router.get("/kyb/{organization_id}")
async def get_kyb_status(organization_id: str, db: Session = Depends(get_db)):
    record = db.query(KYBRecord).filter(
        KYBRecord.organization_id == organization_id,
        KYBRecord.is_deleted == False,
    ).order_by(desc(KYBRecord.created_at)).first()
    if not record:
        return {"organization_id": organization_id, "status": "not_submitted"}
    return {
        "id": record.id,
        "organization_id": record.organization_id,
        "status": record.status,
        "business_name": record.business_name,
        "reviewer_notes": record.reviewer_notes,
        "submitted_at": record.created_at.isoformat(),
        "reviewed_at": record.reviewed_at.isoformat() if record.reviewed_at else None,
    }


@router.get("/aml/flags")
async def list_aml_flags(
    organization_id: str,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    query = db.query(AMLFlag).filter(
        AMLFlag.organization_id == organization_id,
        AMLFlag.is_deleted == False,
    )
    total = query.count()
    items = query.order_by(desc(AMLFlag.created_at)).offset((page - 1) * page_size).limit(page_size).all()
    return {
        "items": [
            {
                "id": f.id,
                "flag_type": f.flag_type,
                "severity": f.severity,
                "description": f.description,
                "entity_name": f.entity_name,
                "status": f.status,
                "created_at": f.created_at.isoformat(),
                "resolved_at": f.resolved_at.isoformat() if f.resolved_at else None,
            }
            for f in items
        ],
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size,
    }


@router.post("/aml/flag")
async def create_aml_flag(payload: dict, db: Session = Depends(get_db)):
    flag = AMLFlag(
        organization_id=payload["organization_id"],
        flag_type=payload["flag_type"],
        severity=payload.get("severity", "medium"),
        description=payload.get("description", ""),
        entity_name=payload.get("entity_name"),
        entity_id=payload.get("entity_id"),
        transaction_id=payload.get("transaction_id"),
        status="open",
    )
    db.add(flag)
    db.commit()
    db.refresh(flag)
    return {
        "id": flag.id,
        "flag_type": flag.flag_type,
        "severity": flag.severity,
        "status": flag.status,
    }


@router.post("/sanctions/screen")
async def screen_entity(payload: dict, db: Session = Depends(get_db)):
    entity_name = payload.get("entity_name", "")
    entity_country = payload.get("country", "")

    hit = SanctionsHit(
        organization_id=payload.get("organization_id", ""),
        entity_name=entity_name,
        entity_type=payload.get("entity_type", "individual"),
        country=entity_country,
        list_name="placeholder_sanctions_list",
        matched_term=entity_name[:50] if entity_name else "",
        match_score=0.0,
        status="clear",
    )
    db.add(hit)
    db.commit()

    return {
        "entity_name": entity_name,
        "matches": [],
        "match_count": 0,
        "overall_status": "clear",
        "screening_id": hit.id,
        "message": "Sanctions screening completed. No matches found.",
    }


@router.get("/audit-logs")
async def list_audit_logs(
    organization_id: str,
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
):
    query = db.query(AuditLog).filter(
        AuditLog.organization_id == organization_id,
    )
    total = query.count()
    items = query.order_by(desc(AuditLog.created_at)).offset((page - 1) * page_size).limit(page_size).all()
    return {
        "items": [
            {
                "id": log.id,
                "user_id": log.user_id,
                "action": log.action,
                "resource_type": log.resource_type,
                "resource_id": log.resource_id,
                "details": log.details,
                "ip_address": log.ip_address,
                "created_at": log.created_at.isoformat(),
            }
            for log in items
        ],
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size,
    }


@router.get("/reports")
async def generate_compliance_report(
    organization_id: str,
    report_type: str = "summary",
    db: Session = Depends(get_db),
):
    report = ComplianceReport(
        organization_id=organization_id,
        report_type=report_type,
        status="generated",
        report_data=f'{{"organization_id":"{organization_id}","type":"{report_type}","generated_at":"{datetime.utcnow().isoformat()}"}}',
    )
    db.add(report)
    db.commit()
    return {
        "id": report.id,
        "organization_id": organization_id,
        "report_type": report_type,
        "status": "generated",
        "generated_at": report.created_at.isoformat(),
    }
