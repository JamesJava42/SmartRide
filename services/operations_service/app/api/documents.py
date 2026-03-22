from __future__ import annotations

from datetime import datetime, timezone
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import FileResponse
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import TokenPayload, require_role, require_role_from_header_or_query
from app.core.enums import VerificationStatus
from app.db.session import get_db_session
from app.models import Admin, DriverDocument
from app.services.audit_service import audit_service
from app.services.document_storage import DocumentStorageError, document_storage
from shared.python.enums.roles import UserRole
from shared.python.schemas.responses import SuccessResponse

router = APIRouter(prefix="/api/v1/admin/documents", tags=["admin-documents"])


class RejectDocumentRequest(BaseModel):
    rejection_reason: str


async def _get_admin_record(db: AsyncSession, user: TokenPayload) -> Admin:
    try:
        user_id = UUID(user.user_id)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="JWT invalid") from exc
    admin = await db.scalar(select(Admin).where(Admin.user_id == user_id, Admin.is_active.is_(True)))
    if not admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")
    return admin


@router.post("/{document_id}/approve", response_model=SuccessResponse)
async def approve_document(
    document_id: str,
    user: TokenPayload = Depends(require_role(UserRole.ADMIN)),
    db: AsyncSession = Depends(get_db_session),
) -> SuccessResponse:
    admin = await _get_admin_record(db, user)
    doc = await db.scalar(select(DriverDocument).where(DriverDocument.id == document_id))
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")
    doc.verification_status = VerificationStatus.APPROVED
    doc.reviewed_at = datetime.now(timezone.utc)
    doc.reviewed_by_admin_id = str(admin.id)
    doc.notes = "Approved"
    doc.rejection_reason = None
    db.add(doc)
    await db.commit()
    await audit_service.log(
        db,
        admin_id=admin.id,
        action_type="APPROVED_DOCUMENT",
        entity_type="DRIVER_DOCUMENT",
        entity_id=str(doc.id),
        details_json={"driver_id": str(doc.driver_id), "document_type": doc.document_type.value},
    )
    return SuccessResponse(message="Document approved")


@router.post("/{document_id}/reject", response_model=SuccessResponse)
async def reject_document(
    document_id: str,
    payload: RejectDocumentRequest,
    user: TokenPayload = Depends(require_role(UserRole.ADMIN)),
    db: AsyncSession = Depends(get_db_session),
) -> SuccessResponse:
    admin = await _get_admin_record(db, user)
    doc = await db.scalar(select(DriverDocument).where(DriverDocument.id == document_id))
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")
    doc.verification_status = VerificationStatus.REJECTED
    doc.reviewed_at = datetime.now(timezone.utc)
    doc.reviewed_by_admin_id = str(admin.id)
    doc.notes = payload.rejection_reason
    doc.rejection_reason = payload.rejection_reason
    db.add(doc)
    await db.commit()
    await audit_service.log(
        db,
        admin_id=admin.id,
        action_type="REJECTED_DOCUMENT",
        entity_type="DRIVER_DOCUMENT",
        entity_id=str(doc.id),
        details_json={
            "driver_id": str(doc.driver_id),
            "document_type": doc.document_type.value,
            "rejection_reason": payload.rejection_reason,
        },
    )
    return SuccessResponse(message="Document rejected")


@router.post("/{document_id}/under-review", response_model=SuccessResponse)
async def mark_document_under_review(
    document_id: str,
    user: TokenPayload = Depends(require_role(UserRole.ADMIN)),
    db: AsyncSession = Depends(get_db_session),
) -> SuccessResponse:
    admin = await _get_admin_record(db, user)
    doc = await db.scalar(select(DriverDocument).where(DriverDocument.id == document_id))
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")
    doc.verification_status = VerificationStatus.UNDER_REVIEW
    doc.reviewed_by_admin_id = str(admin.id)
    doc.reviewed_at = datetime.now(timezone.utc)
    doc.notes = "Under review"
    db.add(doc)
    await db.commit()
    await audit_service.log(
        db,
        admin_id=admin.id,
        action_type="MARKED_DOCUMENT_UNDER_REVIEW",
        entity_type="DRIVER_DOCUMENT",
        entity_id=str(doc.id),
        details_json={"driver_id": str(doc.driver_id), "document_type": doc.document_type.value},
    )
    return SuccessResponse(message="Document marked under review")


@router.get("/{document_id}/download")
async def download_document(
    document_id: str,
    _user: TokenPayload = Depends(require_role_from_header_or_query(UserRole.ADMIN)),
    db: AsyncSession = Depends(get_db_session),
):
    doc = await db.scalar(select(DriverDocument).where(DriverDocument.id == document_id))
    if not doc or not doc.file_path:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document file not found")
    try:
        absolute_path = document_storage.resolve(doc.file_path)
    except DocumentStorageError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    if not absolute_path.exists():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document file not found")

    return FileResponse(
        path=absolute_path,
        media_type=doc.mime_type or "application/octet-stream",
        filename=doc.original_file_name or absolute_path.name,
    )
