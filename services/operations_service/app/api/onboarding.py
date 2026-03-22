from __future__ import annotations
from datetime import datetime, timezone
from uuid import UUID

from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile, status
from fastapi.responses import FileResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import TokenPayload, require_role, require_role_from_header_or_query
from app.core.enums import DocumentType, VerificationStatus
from app.db.session import get_db_session
from app.models import Admin, DriverDocument, DriverRecord
from app.schemas.region import RegionResponse
from app.schemas.onboarding import (
    ApproveOnboardingRequest,
    DriverSelfRegisterRequest,
    RejectOnboardingRequest,
    RequestInfoRequest,
    SaveNotesRequest,
)
from app.schemas.alerts import InternalAlertReportRequest
from app.services.document_storage import DocumentStorageError, document_storage
from app.services.document_requirements import get_document_requirement
from app.services.alert_service import alert_service
from app.services.region_service import region_service
from app.services.onboarding_service import onboarding_service
from shared.python.enums.roles import UserRole
from shared.python.schemas.responses import SuccessResponse

router = APIRouter(prefix="/api/v1/admin/onboarding", tags=["admin-onboarding"])
public_router = APIRouter(prefix="/api/v1/onboarding", tags=["driver-onboarding"])


def _parse_datetime_input(value: str | None) -> datetime | None:
    if not value or not value.strip():
        return None
    normalized = value.strip()
    try:
        parsed = datetime.fromisoformat(f"{normalized}T00:00:00") if len(normalized) == 10 else datetime.fromisoformat(normalized.replace("Z", "+00:00"))
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=f"Invalid date value: {value}") from exc
    if parsed.tzinfo is None:
        parsed = parsed.replace(tzinfo=timezone.utc)
    return parsed


async def _get_admin_record(db: AsyncSession, user: TokenPayload) -> Admin:
    try:
        user_id = UUID(user.user_id)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="JWT invalid") from exc
    admin = await db.scalar(select(Admin).where(Admin.user_id == user_id, Admin.is_active.is_(True)))
    if not admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")
    return admin


@router.get("/queue", response_model=SuccessResponse)
async def list_queue(
    status: str | None = Query(default=None),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    _user: TokenPayload = Depends(require_role(UserRole.ADMIN)),
    db: AsyncSession = Depends(get_db_session),
) -> SuccessResponse:
    queue = await onboarding_service.list_queue(db, status_filter=status, page=page, page_size=page_size)
    return SuccessResponse(data=queue.model_dump(mode="json"))


@router.post("/{driver_id}/approve", response_model=SuccessResponse)
async def approve_onboarding(
    driver_id: str,
    payload: ApproveOnboardingRequest,
    user: TokenPayload = Depends(require_role(UserRole.ADMIN)),
    db: AsyncSession = Depends(get_db_session),
) -> SuccessResponse:
    admin = await _get_admin_record(db, user)
    result = await onboarding_service.approve(db, driver_id=driver_id, admin=admin, review_notes=payload.review_notes)
    return SuccessResponse(message="Driver approved successfully", data=result.model_dump(mode="json"))


@router.post("/{driver_id}/reject", response_model=SuccessResponse)
async def reject_onboarding(
    driver_id: str,
    payload: RejectOnboardingRequest,
    user: TokenPayload = Depends(require_role(UserRole.ADMIN)),
    db: AsyncSession = Depends(get_db_session),
) -> SuccessResponse:
    admin = await _get_admin_record(db, user)
    result = await onboarding_service.reject(db, driver_id=driver_id, admin=admin, rejection_reason=payload.rejection_reason)
    return SuccessResponse(message="Driver onboarding rejected", data=result.model_dump(mode="json"))


@router.get("/{driver_id}", response_model=SuccessResponse)
async def get_onboarding_detail(
    driver_id: str,
    _user: TokenPayload = Depends(require_role(UserRole.ADMIN)),
    db: AsyncSession = Depends(get_db_session),
) -> SuccessResponse:
    detail = await onboarding_service.get_detail(db, driver_id=driver_id)
    return SuccessResponse(data=detail.model_dump(mode="json"))


@router.patch("/{driver_id}/notes", response_model=SuccessResponse)
async def save_review_notes(
    driver_id: str,
    payload: SaveNotesRequest,
    user: TokenPayload = Depends(require_role(UserRole.ADMIN)),
    db: AsyncSession = Depends(get_db_session),
) -> SuccessResponse:
    from uuid import UUID
    from sqlalchemy import select as _select
    from app.models import DriverOnboardingProfile
    driver_uuid = UUID(driver_id)
    profile = await db.scalar(_select(DriverOnboardingProfile).where(DriverOnboardingProfile.driver_id == driver_uuid))
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Onboarding profile not found")
    profile.review_notes = payload.review_notes
    db.add(profile)
    await db.commit()
    return SuccessResponse(message="Notes saved")


@router.post("/{driver_id}/request-info", response_model=SuccessResponse)
async def request_onboarding_info(
    driver_id: str,
    payload: RequestInfoRequest,
    user: TokenPayload = Depends(require_role(UserRole.ADMIN)),
    db: AsyncSession = Depends(get_db_session),
) -> SuccessResponse:
    admin = await _get_admin_record(db, user)
    result = await onboarding_service.request_info(db, driver_id=driver_id, admin=admin, notes=payload.notes)
    return SuccessResponse(message="Additional info requested", data=result.model_dump(mode="json"))


@public_router.post("/driver-register", response_model=SuccessResponse, status_code=201)
async def self_register_driver(
    payload: DriverSelfRegisterRequest,
    db: AsyncSession = Depends(get_db_session),
) -> SuccessResponse:
    detail = await onboarding_service.self_register_driver(db, payload=payload)
    return SuccessResponse(message="Driver registration submitted", data=detail.model_dump(mode="json"))


@public_router.get("/regions", response_model=SuccessResponse)
async def list_public_onboarding_regions(
    db: AsyncSession = Depends(get_db_session),
) -> SuccessResponse:
    regions = await region_service.list_regions(db)
    active_regions = [region for region in regions if region.is_active]
    return SuccessResponse(data=[RegionResponse.model_validate(region).model_dump() for region in active_regions])


@public_router.get("/me/documents", response_model=SuccessResponse)
async def list_driver_self_documents(
    user: TokenPayload = Depends(require_role(UserRole.DRIVER)),
    db: AsyncSession = Depends(get_db_session),
) -> SuccessResponse:
    driver = await db.scalar(select(DriverRecord).where(DriverRecord.user_id == user.user_id))
    if not driver:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Driver onboarding profile not found")

    documents = (
        await db.execute(select(DriverDocument).where(DriverDocument.driver_id == str(driver.id)).order_by(DriverDocument.submitted_at.desc()))
    ).scalars().all()

    return SuccessResponse(
        data=[
            {
                "id": str(document.id),
                "document_type": document.document_type.value,
                "file_url": document.file_url,
                "file_path": document.file_path,
                "original_file_name": document.original_file_name,
                "mime_type": document.mime_type,
                "file_size": document.file_size,
                "document_number": document.document_number,
                "issuing_state": document.issuing_state,
                "issuing_country": document.issuing_country,
                "issued_at": document.issued_at.isoformat() if document.issued_at else None,
                "expires_at": document.expires_at.isoformat() if document.expires_at else None,
                "download_path": f"/api/v1/onboarding/me/documents/{document.id}/download" if document.file_path else None,
                "verification_status": document.verification_status.value,
                "submitted_at": document.submitted_at.isoformat() if document.submitted_at else None,
                "reviewed_at": document.reviewed_at.isoformat() if document.reviewed_at else None,
                "notes": document.notes,
                "rejection_reason": document.rejection_reason,
                "metadata_json": document.metadata_json,
            }
            for document in documents
        ]
    )


@public_router.post("/me/documents", response_model=SuccessResponse, status_code=201)
async def upload_driver_self_document(
    document_type: str = Form(...),
    document_number: str | None = Form(default=None),
    issuing_state: str | None = Form(default=None),
    issuing_country: str | None = Form(default=None),
    issued_at: str | None = Form(default=None),
    expires_at: str | None = Form(default=None),
    file: UploadFile = File(...),
    user: TokenPayload = Depends(require_role(UserRole.DRIVER)),
    db: AsyncSession = Depends(get_db_session),
) -> SuccessResponse:
    driver = await db.scalar(select(DriverRecord).where(DriverRecord.user_id == user.user_id))
    if not driver:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Driver onboarding profile not found")

    try:
        doc_type = DocumentType(document_type)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Invalid document type") from exc

    try:
        stored_file = await document_storage.save_upload(
            entity_type="driver_documents",
            owner_id=str(driver.id),
            document_type=doc_type.value,
            file=file,
        )
    except DocumentStorageError as exc:
        await alert_service.create_reported_alert(
            db,
            InternalAlertReportRequest(
                alert_type="FILE_UPLOAD_FAILURE",
                severity="MEDIUM",
                title="Driver document upload failed",
                message=f"Driver {driver.id} failed to upload {doc_type.value}: {exc}",
                source_service="operations_service",
                region_id=str(driver.region_id) if driver.region_id else None,
            ),
        )
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(exc)) from exc

    metadata = {
        "storage_provider": "local",
        "uploaded_by": "driver",
    }
    parsed_issued_at = _parse_datetime_input(issued_at)
    parsed_expires_at = _parse_datetime_input(expires_at)
    requirement = await get_document_requirement(
        db,
        entity_type="DRIVER",
        document_type=doc_type,
        region_id=str(driver.region_id) if driver.region_id else None,
    )
    if requirement:
        if requirement.requires_document_number and not (document_number or "").strip():
            raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Document number is required")
        if requirement.requires_expiry and not parsed_expires_at:
            raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Expiry date is required")
        if requirement.requires_issuing_state and not (issuing_state or "").strip():
            raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Issuing state is required")
        if requirement.requires_issuing_country and not (issuing_country or "").strip():
            raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Issuing country is required")
        if requirement.requires_issued_at and not parsed_issued_at:
            raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Issued date is required")

    existing = await db.scalar(
        select(DriverDocument).where(
            DriverDocument.driver_id == str(driver.id),
            DriverDocument.document_type == doc_type,
        )
    )

    if existing:
        document_storage.delete(existing.file_path)
        existing.file_url = None
        existing.file_path = stored_file.file_path
        existing.original_file_name = stored_file.original_file_name
        existing.mime_type = stored_file.mime_type
        existing.file_size = stored_file.file_size
        existing.document_number = (document_number or "").strip() or None
        existing.issuing_state = (issuing_state or "").strip() or None
        existing.issuing_country = (issuing_country or "").strip() or None
        existing.issued_at = parsed_issued_at
        existing.expires_at = parsed_expires_at
        existing.metadata_json = metadata
        existing.verification_status = VerificationStatus.SUBMITTED
        existing.submitted_at = datetime.now(timezone.utc)
        existing.reviewed_at = None
        existing.reviewed_by_admin_id = None
        existing.notes = None
        existing.rejection_reason = None
        db.add(existing)
        document_id = str(existing.id)
    else:
        document = DriverDocument(
            driver_id=str(driver.id),
            document_type=doc_type,
            file_url=None,
            file_path=stored_file.file_path,
            original_file_name=stored_file.original_file_name,
            mime_type=stored_file.mime_type,
            file_size=stored_file.file_size,
            document_number=(document_number or "").strip() or None,
            issuing_state=(issuing_state or "").strip() or None,
            issuing_country=(issuing_country or "").strip() or None,
            issued_at=parsed_issued_at,
            expires_at=parsed_expires_at,
            verification_status=VerificationStatus.SUBMITTED,
            submitted_at=datetime.now(timezone.utc),
            notes=None,
            metadata_json=metadata,
        )
        db.add(document)
        await db.flush()
        document_id = str(document.id)

    await db.commit()
    return SuccessResponse(message="Document uploaded", data={"id": document_id})


@public_router.get("/me/documents/{document_id}/download")
async def download_driver_self_document(
    document_id: str,
    user: TokenPayload = Depends(require_role_from_header_or_query(UserRole.DRIVER)),
    db: AsyncSession = Depends(get_db_session),
):
    driver = await db.scalar(select(DriverRecord).where(DriverRecord.user_id == user.user_id))
    if not driver:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Driver onboarding profile not found")

    document = await db.scalar(
        select(DriverDocument).where(
            DriverDocument.id == document_id,
            DriverDocument.driver_id == str(driver.id),
        )
    )
    if not document or not document.file_path:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document file not found")

    try:
        absolute_path = document_storage.resolve(document.file_path)
    except DocumentStorageError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    if not absolute_path.exists():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document file not found")

    return FileResponse(
        path=absolute_path,
        media_type=document.mime_type or "application/octet-stream",
        filename=document.original_file_name or absolute_path.name,
    )
