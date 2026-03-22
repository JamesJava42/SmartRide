from __future__ import annotations

from datetime import datetime, timezone
from uuid import UUID

from fastapi import APIRouter, Depends, File, Form, Header, HTTPException, Query, UploadFile, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import TokenPayload, require_role
from app.core.enums import DocumentType, VerificationStatus
from app.db.session import get_db_session
from app.models import Admin, AdminAuditLog, DriverDocument, DriverOnboardingProfile, DriverRecord, Region, VehicleRecord
from app.schemas.admin import SuspendDriverRequest
from app.schemas.alerts import InternalAlertReportRequest
from app.schemas.onboarding import AdminDriverDetailResponse, AdminDriverDocumentResponse, AdminDriverOnboardingResponse, AdminDriverVehicleResponse, CreateDriverRequest
from app.services.document_storage import DocumentStorageError, document_storage
from app.services.document_requirements import get_document_requirement
from app.services.alert_service import alert_service
from app.services.onboarding_service import onboarding_service
from app.services.audit_service import audit_service
from app.services.driver_admin_service import driver_admin_service
from shared.python.enums.roles import UserRole
from shared.python.schemas.responses import SuccessResponse


class AdminCreateVehicleRequest(BaseModel):
    make: str
    model: str
    year: int
    color: str | None = None
    plate_number: str
    vehicle_type: str
    seat_capacity: int
    fuel_type: str | None = None
    mileage_city: float | None = None
    mileage_highway: float | None = None
    is_active: bool = True


class AdminUpdateVehicleRequest(BaseModel):
    make: str | None = None
    model: str | None = None
    year: int | None = None
    color: str | None = None
    plate_number: str | None = None
    vehicle_type: str | None = None
    seat_capacity: int | None = None
    fuel_type: str | None = None
    mileage_city: float | None = None
    mileage_highway: float | None = None
    is_active: bool | None = None


class AdminUpdateRegionRequest(BaseModel):
    region_id: str


class DriverNoteRequest(BaseModel):
    note: str


class DriverRequestInfoRequest(BaseModel):
    message: str


class DriverDocumentReuploadRequest(BaseModel):
    message: str


router = APIRouter(prefix="/api/v1/admin/drivers", tags=["admin-drivers"])


async def _get_admin_record(db: AsyncSession, user: TokenPayload) -> Admin:
    try:
        user_id = UUID(user.user_id)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="JWT invalid") from exc
    admin = await db.scalar(select(Admin).where(Admin.user_id == user_id, Admin.is_active.is_(True)))
    if not admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")
    return admin


def _parse_datetime_input(value: str | None) -> datetime | None:
    if not value or not value.strip():
        return None
    normalized = value.strip()
    parsed = datetime.fromisoformat(f"{normalized}T00:00:00") if len(normalized) == 10 else datetime.fromisoformat(normalized.replace("Z", "+00:00"))
    if parsed.tzinfo is None:
        parsed = parsed.replace(tzinfo=timezone.utc)
    return parsed


@router.post("", response_model=SuccessResponse, status_code=201)
async def create_driver(
    payload: CreateDriverRequest,
    user: TokenPayload = Depends(require_role(UserRole.ADMIN)),
    db: AsyncSession = Depends(get_db_session),
) -> SuccessResponse:
    admin = await _get_admin_record(db, user)
    detail = await onboarding_service.create_driver(db, payload=payload)
    await audit_service.log(
        db,
        admin_id=admin.id,
        action_type="CREATED_DRIVER",
        entity_type="DRIVER",
        entity_id=detail.driver_id,
        details_json={"email": detail.driver_email, "region_name": detail.region_name},
    )
    return SuccessResponse(message="Driver profile created", data=detail.model_dump(mode="json"))


@router.get("", response_model=SuccessResponse)
async def list_drivers(
    status: str | None = Query(default=None),
    region_id: str | None = Query(default=None),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    _user: TokenPayload = Depends(require_role(UserRole.ADMIN)),
    db: AsyncSession = Depends(get_db_session),
    authorization: str | None = Header(default=None),
) -> SuccessResponse:
    data = await driver_admin_service.list_drivers(
        authorization,
        {"status": status, "region_id": region_id, "page": page, "page_size": page_size},
    )
    items = data.get("items", [])
    driver_ids = [item.get("driver_id") for item in items if item.get("driver_id")]
    if driver_ids:
        driver_rows = (
            await db.execute(select(DriverRecord).where(DriverRecord.id.in_(driver_ids)))
        ).scalars().all()
        driver_map = {str(driver_row.id): driver_row for driver_row in driver_rows}

        region_ids = [driver_row.region_id for driver_row in driver_rows if driver_row.region_id]
        region_rows = (
            await db.execute(select(Region).where(Region.id.in_(region_ids)))
        ).scalars().all() if region_ids else []
        region_map = {str(region_row.id): region_row for region_row in region_rows}

        vehicle_rows = (
            await db.execute(
                select(VehicleRecord).where(VehicleRecord.driver_id.in_(driver_ids), VehicleRecord.is_active.is_(True))
            )
        ).scalars().all()
        vehicle_map = {str(vehicle_row.driver_id): vehicle_row for vehicle_row in vehicle_rows}

        data["items"] = [
            {
                **item,
                "phone_number": driver_map[str(item["driver_id"])].phone_number if str(item["driver_id"]) in driver_map else None,
                "region_id": str(driver_map[str(item["driver_id"])].region_id) if str(item["driver_id"]) in driver_map and driver_map[str(item["driver_id"])].region_id else None,
                "region_name": (
                    region_map[str(driver_map[str(item["driver_id"])].region_id)].name
                    if str(item["driver_id"]) in driver_map and driver_map[str(item["driver_id"])].region_id and str(driver_map[str(item["driver_id"])].region_id) in region_map
                    else None
                ),
                "rating": (
                    float(driver_map[str(item["driver_id"])].rating_avg)
                    if str(item["driver_id"]) in driver_map and driver_map[str(item["driver_id"])].rating_avg is not None
                    else None
                ),
                "vehicle": (
                    {
                        "id": str(vehicle_map[str(item["driver_id"])].id),
                        "driver_id": str(vehicle_map[str(item["driver_id"])].driver_id),
                        "make": vehicle_map[str(item["driver_id"])].make,
                        "model": vehicle_map[str(item["driver_id"])].model,
                        "year": vehicle_map[str(item["driver_id"])].year,
                        "color": vehicle_map[str(item["driver_id"])].color,
                        "plate_number": vehicle_map[str(item["driver_id"])].plate_number,
                        "vehicle_type": vehicle_map[str(item["driver_id"])].vehicle_type,
                        "seat_capacity": vehicle_map[str(item["driver_id"])].seat_capacity,
                        "fuel_type": vehicle_map[str(item["driver_id"])].fuel_type,
                        "mileage_city": float(vehicle_map[str(item["driver_id"])].mileage_city) if vehicle_map[str(item["driver_id"])].mileage_city is not None else None,
                        "mileage_highway": float(vehicle_map[str(item["driver_id"])].mileage_highway) if vehicle_map[str(item["driver_id"])].mileage_highway is not None else None,
                        "is_active": vehicle_map[str(item["driver_id"])].is_active,
                    }
                    if str(item["driver_id"]) in vehicle_map
                    else None
                ),
            }
            for item in items
        ]
    return SuccessResponse(data=data)


@router.post("/{driver_id}/suspend", response_model=SuccessResponse)
async def suspend_driver(
    driver_id: str,
    payload: SuspendDriverRequest,
    user: TokenPayload = Depends(require_role(UserRole.ADMIN)),
    db: AsyncSession = Depends(get_db_session),
    authorization: str | None = Header(default=None),
) -> SuccessResponse:
    try:
        user_id = UUID(user.user_id)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="JWT invalid") from exc
    admin = await db.scalar(select(Admin).where(Admin.user_id == user_id, Admin.is_active.is_(True)))
    if not admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")
    data = await driver_admin_service.suspend_driver(driver_id, payload.reason, authorization)
    await audit_service.log(
        db,
        admin_id=admin.id,
        action_type="SUSPENDED_DRIVER",
        entity_type="DRIVER",
        entity_id=driver_id,
        details_json={"reason": payload.reason},
    )
    return SuccessResponse(message="Driver suspended", data=data)


@router.get("/{driver_id}/stats", response_model=SuccessResponse)
async def get_driver_stats(
    driver_id: str,
    _user: TokenPayload = Depends(require_role(UserRole.ADMIN)),
    authorization: str | None = Header(default=None),
) -> SuccessResponse:
    data = await driver_admin_service.get_driver_stats(driver_id, authorization)
    return SuccessResponse(data=data)


@router.get("/{driver_id}/rides", response_model=SuccessResponse)
async def get_driver_rides(
    driver_id: str,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    _user: TokenPayload = Depends(require_role(UserRole.ADMIN)),
    authorization: str | None = Header(default=None),
) -> SuccessResponse:
    data = await driver_admin_service.get_driver_rides(driver_id, page, page_size, authorization)
    return SuccessResponse(data=data)


@router.get("/{driver_id}/payouts", response_model=SuccessResponse)
async def get_driver_payouts(
    driver_id: str,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    _user: TokenPayload = Depends(require_role(UserRole.ADMIN)),
    authorization: str | None = Header(default=None),
) -> SuccessResponse:
    data = await driver_admin_service.get_driver_payouts(driver_id, page, page_size, authorization)
    return SuccessResponse(data=data)


@router.get("/{driver_id}/notes", response_model=SuccessResponse)
async def get_driver_notes(
    driver_id: str,
    _user: TokenPayload = Depends(require_role(UserRole.ADMIN)),
    db: AsyncSession = Depends(get_db_session),
) -> SuccessResponse:
    logs = (
        await db.execute(
            select(AdminAuditLog)
            .where(
                AdminAuditLog.entity_type == "DRIVER",
                AdminAuditLog.entity_id == driver_id,
                AdminAuditLog.action_type == "DRIVER_NOTE",
            )
            .order_by(AdminAuditLog.created_at.desc())
        )
    ).scalars().all()
    admin_ids = [log.admin_id for log in logs if log.admin_id]
    admins = (
        await db.execute(select(Admin).where(Admin.id.in_(admin_ids)))
    ).scalars().all() if admin_ids else []
    admin_map = {str(admin.id): admin.display_name for admin in admins}
    items = [
        {
            "id": str(log.id),
            "created_at": log.created_at.isoformat() if log.created_at else None,
            "admin_name": admin_map.get(str(log.admin_id), "Admin"),
            "note": (log.details_json or {}).get("note", "") if isinstance(log.details_json, dict) else "",
        }
        for log in logs
    ]
    return SuccessResponse(data=items)


@router.post("/{driver_id}/notes", response_model=SuccessResponse, status_code=201)
async def create_driver_note(
    driver_id: str,
    payload: DriverNoteRequest,
    user: TokenPayload = Depends(require_role(UserRole.ADMIN)),
    db: AsyncSession = Depends(get_db_session),
) -> SuccessResponse:
    admin = await _get_admin_record(db, user)
    driver = await db.scalar(select(DriverRecord).where(DriverRecord.id == driver_id))
    if not driver:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Driver not found")
    note = payload.note.strip()
    if not note:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Note is required")
    log = await audit_service.log(
        db,
        admin_id=admin.id,
        action_type="DRIVER_NOTE",
        entity_type="DRIVER",
        entity_id=driver_id,
        details_json={"note": note},
    )
    return SuccessResponse(
        message="Note saved",
        data={
            "id": str(log.id),
            "created_at": log.created_at.isoformat(),
            "admin_name": admin.display_name,
            "note": note,
        },
    )


@router.get("/{driver_id}/compliance", response_model=SuccessResponse)
async def get_driver_compliance(
    driver_id: str,
    _user: TokenPayload = Depends(require_role(UserRole.ADMIN)),
    db: AsyncSession = Depends(get_db_session),
) -> SuccessResponse:
    driver = await db.scalar(select(DriverRecord).where(DriverRecord.id == driver_id))
    if not driver:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Driver not found")
    documents = (
        await db.execute(select(DriverDocument).where(DriverDocument.driver_id == driver_id))
    ).scalars().all()
    vehicle = await db.scalar(
        select(VehicleRecord).where(VehicleRecord.driver_id == driver_id, VehicleRecord.is_active.is_(True))
    )

    def by_type(doc_type: DocumentType) -> DriverDocument | None:
        return next((doc for doc in documents if doc.document_type == doc_type), None)

    def doc_status(doc: DriverDocument | None) -> tuple[str, str | None, str | None]:
        if not doc:
            return "NOT_CHECKED", None, None
        if doc.verification_status == VerificationStatus.REJECTED:
            return "FAIL", doc.rejection_reason or doc.notes, None
        if doc.verification_status in {VerificationStatus.SUBMITTED, VerificationStatus.UNDER_REVIEW}:
            return "PENDING", "Awaiting admin review", doc.expires_at.isoformat() if doc.expires_at else None
        if doc.expires_at and doc.expires_at < datetime.now(timezone.utc):
            return "EXPIRED", "Document has expired", doc.expires_at.isoformat()
        return "PASS", "Verified", doc.expires_at.isoformat() if doc.expires_at else None

    identity_front = by_type(DocumentType.GOVT_ID_FRONT)
    identity_back = by_type(DocumentType.GOVT_ID_BACK)
    if identity_front and identity_back and identity_front.verification_status == VerificationStatus.APPROVED and identity_back.verification_status == VerificationStatus.APPROVED:
        identity_status, identity_detail = "PASS", "Front and back ID verified"
    elif any(doc and doc.verification_status == VerificationStatus.REJECTED for doc in [identity_front, identity_back]):
        identity_status, identity_detail = "FAIL", "Identity document rejected"
    elif identity_front or identity_back:
        identity_status, identity_detail = "PENDING", "Identity documents awaiting review"
    else:
        identity_status, identity_detail = "NOT_CHECKED", None

    license_status, license_detail, license_expiry = doc_status(by_type(DocumentType.DRIVER_LICENSE))
    insurance_status, insurance_detail, insurance_expiry = doc_status(by_type(DocumentType.INSURANCE))
    registration_status, registration_detail, registration_expiry = doc_status(by_type(DocumentType.VEHICLE_REGISTRATION))
    items = [
        {"label": "Identity Check", "status": identity_status, "detail": identity_detail, "expires_at": None},
        {"label": "Background Check", "status": "NOT_CHECKED", "detail": None, "expires_at": None},
        {"label": "License Validation", "status": license_status, "detail": license_detail, "expires_at": license_expiry},
        {"label": "Insurance Validation", "status": insurance_status, "detail": insurance_detail, "expires_at": insurance_expiry},
        {"label": "Vehicle Registration", "status": registration_status, "detail": registration_detail, "expires_at": registration_expiry},
        {
            "label": "Vehicle Inspection",
            "status": "PASS" if vehicle else "NOT_CHECKED",
            "detail": "Active vehicle on file" if vehicle else None,
            "expires_at": None,
        },
        {
            "label": "Regional Eligibility",
            "status": "PASS" if driver.region_id else "NOT_CHECKED",
            "detail": "Driver assigned to region" if driver.region_id else None,
            "expires_at": None,
        },
        {"label": "Safety Flags", "status": "NOT_CHECKED", "detail": None, "expires_at": None},
        {"label": "Fraud Flags", "status": "NOT_CHECKED", "detail": None, "expires_at": None},
    ]
    return SuccessResponse(data=items)


@router.post("/{driver_id}/request-info", response_model=SuccessResponse)
async def request_driver_info(
    driver_id: str,
    payload: DriverRequestInfoRequest,
    user: TokenPayload = Depends(require_role(UserRole.ADMIN)),
    db: AsyncSession = Depends(get_db_session),
) -> SuccessResponse:
    admin = await _get_admin_record(db, user)
    driver = await db.scalar(select(DriverRecord).where(DriverRecord.id == driver_id))
    if not driver:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Driver not found")
    message = payload.message.strip()
    if not message:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Message is required")
    await audit_service.log(
        db,
        admin_id=admin.id,
        action_type="REQUESTED_DRIVER_INFO",
        entity_type="DRIVER",
        entity_id=driver_id,
        details_json={"message": message},
    )
    return SuccessResponse(message="Additional information requested", data={"driver_id": driver_id, "message": message})


@router.post("/{driver_id}/documents", response_model=SuccessResponse, status_code=201)
async def admin_upload_document(
    driver_id: str,
    document_type: str = Form(...),
    document_number: str | None = Form(default=None),
    issuing_state: str | None = Form(default=None),
    issuing_country: str | None = Form(default=None),
    issued_at: str | None = Form(default=None),
    expires_at: str | None = Form(default=None),
    file: UploadFile = File(...),
    _user: TokenPayload = Depends(require_role(UserRole.ADMIN)),
    db: AsyncSession = Depends(get_db_session),
) -> SuccessResponse:
    driver = await db.scalar(select(DriverRecord).where(DriverRecord.id == driver_id))
    if not driver:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Driver not found")
    try:
        doc_type = DocumentType(document_type)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=f"Invalid document_type: {document_type}")
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
    try:
        stored_file = await document_storage.save_upload(
            entity_type="driver_documents",
            owner_id=driver_id,
            document_type=doc_type.value,
            file=file,
        )
    except DocumentStorageError as exc:
        await alert_service.create_reported_alert(
            db,
            InternalAlertReportRequest(
                alert_type="FILE_UPLOAD_FAILURE",
                severity="MEDIUM",
                title="Admin document upload failed",
                message=f"Admin upload for driver {driver_id} failed for {doc_type.value}: {exc}",
                source_service="operations_service",
                region_id=str(driver.region_id) if driver.region_id else None,
            ),
        )
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(exc)) from exc

    existing = await db.scalar(
        select(DriverDocument).where(
            DriverDocument.driver_id == driver_id,
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
        existing.metadata_json = {"storage_provider": "local", "uploaded_by": "admin"}
        existing.verification_status = VerificationStatus.SUBMITTED
        existing.submitted_at = datetime.now(timezone.utc)
        existing.reviewed_at = None
        existing.reviewed_by_admin_id = None
        existing.notes = None
        existing.rejection_reason = None
        db.add(existing)
        await db.commit()
        doc_id = str(existing.id)
    else:
        doc = DriverDocument(
            driver_id=driver_id,
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
            metadata_json={"storage_provider": "local", "uploaded_by": "admin"},
        )
        db.add(doc)
        await db.commit()
        await db.refresh(doc)
        doc_id = str(doc.id)
    return SuccessResponse(message="Document uploaded", data={"id": doc_id})


@router.get("/{driver_id}/documents", response_model=SuccessResponse)
async def admin_list_documents(
    driver_id: str,
    _user: TokenPayload = Depends(require_role(UserRole.ADMIN)),
    db: AsyncSession = Depends(get_db_session),
) -> SuccessResponse:
    doc_rows = (await db.execute(select(DriverDocument).where(DriverDocument.driver_id == driver_id))).scalars().all()
    return SuccessResponse(
        data=[
            AdminDriverDocumentResponse(
                id=str(doc.id),
                driver_id=str(doc.driver_id),
                document_type=doc.document_type.value,
                file_url=doc.file_url,
                file_path=doc.file_path,
                original_file_name=doc.original_file_name,
                mime_type=doc.mime_type,
                file_size=doc.file_size,
                document_number=doc.document_number,
                issuing_state=doc.issuing_state,
                issuing_country=doc.issuing_country,
                issued_at=doc.issued_at,
                expires_at=doc.expires_at,
                download_path=f"/api/v1/admin/documents/{doc.id}/download" if doc.file_path else None,
                verification_status=doc.verification_status.value,
                submitted_at=doc.submitted_at,
                reviewed_at=doc.reviewed_at,
                reviewed_by_admin_id=str(doc.reviewed_by_admin_id) if doc.reviewed_by_admin_id else None,
                notes=doc.notes,
                rejection_reason=doc.rejection_reason,
                metadata_json=doc.metadata_json,
            ).model_dump(mode="json")
            for doc in doc_rows
        ]
    )


@router.post("/{driver_id}/documents/{document_type}/request-reupload", response_model=SuccessResponse)
async def request_document_reupload(
    driver_id: str,
    document_type: str,
    payload: DriverDocumentReuploadRequest,
    user: TokenPayload = Depends(require_role(UserRole.ADMIN)),
    db: AsyncSession = Depends(get_db_session),
) -> SuccessResponse:
    admin = await _get_admin_record(db, user)
    driver = await db.scalar(select(DriverRecord).where(DriverRecord.id == driver_id))
    if not driver:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Driver not found")
    try:
        doc_type = DocumentType(document_type)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Invalid document type") from exc
    document = await db.scalar(
        select(DriverDocument).where(
            DriverDocument.driver_id == driver_id,
            DriverDocument.document_type == doc_type,
        )
    )
    if not document:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")
    message = payload.message.strip()
    if not message:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Message is required")
    document.verification_status = VerificationStatus.REJECTED
    document.rejection_reason = message
    document.notes = message
    document.reviewed_at = datetime.now(timezone.utc)
    document.reviewed_by_admin_id = admin.id
    db.add(document)
    await db.commit()
    await audit_service.log(
        db,
        admin_id=admin.id,
        action_type="REQUESTED_DOCUMENT_REUPLOAD",
        entity_type="DRIVER_DOCUMENT",
        entity_id=str(document.id),
        details_json={"driver_id": driver_id, "document_type": document_type, "message": message},
    )
    return SuccessResponse(message="Document reupload requested", data={"document_id": str(document.id)})


@router.get("/{driver_id}/vehicle", response_model=SuccessResponse)
async def admin_get_vehicle(
    driver_id: str,
    _user: TokenPayload = Depends(require_role(UserRole.ADMIN)),
    db: AsyncSession = Depends(get_db_session),
) -> SuccessResponse:
    vehicle = await db.scalar(
        select(VehicleRecord).where(VehicleRecord.driver_id == driver_id, VehicleRecord.is_active.is_(True))
    )
    if not vehicle:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No active vehicle found")
    return SuccessResponse(
        data=AdminDriverVehicleResponse(
            id=str(vehicle.id),
            driver_id=str(vehicle.driver_id),
            make=vehicle.make,
            model=vehicle.model,
            year=vehicle.year,
            color=vehicle.color,
            plate_number=vehicle.plate_number,
            vehicle_type=vehicle.vehicle_type,
            seat_capacity=vehicle.seat_capacity,
            fuel_type=vehicle.fuel_type,
            mileage_city=float(vehicle.mileage_city) if vehicle.mileage_city is not None else None,
            mileage_highway=float(vehicle.mileage_highway) if vehicle.mileage_highway is not None else None,
            is_active=vehicle.is_active,
        ).model_dump(mode="json")
    )


@router.post("/{driver_id}/vehicle", response_model=SuccessResponse, status_code=201)
async def admin_create_vehicle(
    driver_id: str,
    payload: AdminCreateVehicleRequest,
    user: TokenPayload = Depends(require_role(UserRole.ADMIN)),
    db: AsyncSession = Depends(get_db_session),
) -> SuccessResponse:
    admin = await _get_admin_record(db, user)
    driver = await db.scalar(select(DriverRecord).where(DriverRecord.id == driver_id))
    if not driver:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Driver not found")
    # Deactivate any existing active vehicle first
    existing = await db.scalar(
        select(VehicleRecord).where(VehicleRecord.driver_id == driver_id, VehicleRecord.is_active.is_(True))
    )
    if existing:
        existing.is_active = False
        db.add(existing)
    vehicle = VehicleRecord(
        driver_id=driver_id,
        make=payload.make,
        model=payload.model,
        year=payload.year,
        color=payload.color,
        plate_number=payload.plate_number,
        vehicle_type=payload.vehicle_type,
        seat_capacity=payload.seat_capacity,
        fuel_type=payload.fuel_type,
        mileage_city=payload.mileage_city,
        mileage_highway=payload.mileage_highway,
        is_active=payload.is_active,
    )
    db.add(vehicle)
    await db.commit()
    await db.refresh(vehicle)
    await audit_service.log(
        db,
        admin_id=admin.id,
        action_type="CREATED_VEHICLE",
        entity_type="VEHICLE",
        entity_id=str(vehicle.id),
        details_json={"driver_id": driver_id, **payload.model_dump(mode="json")},
    )
    return SuccessResponse(
        message="Vehicle created",
        data=AdminDriverVehicleResponse(
            id=str(vehicle.id),
            driver_id=str(vehicle.driver_id),
            make=vehicle.make,
            model=vehicle.model,
            year=vehicle.year,
            color=vehicle.color,
            plate_number=vehicle.plate_number,
            vehicle_type=vehicle.vehicle_type,
            seat_capacity=vehicle.seat_capacity,
            fuel_type=vehicle.fuel_type,
            mileage_city=float(vehicle.mileage_city) if vehicle.mileage_city is not None else None,
            mileage_highway=float(vehicle.mileage_highway) if vehicle.mileage_highway is not None else None,
            is_active=vehicle.is_active,
        ).model_dump(mode="json"),
    )


@router.patch("/{driver_id}/vehicle", response_model=SuccessResponse)
async def admin_update_vehicle(
    driver_id: str,
    payload: AdminUpdateVehicleRequest,
    user: TokenPayload = Depends(require_role(UserRole.ADMIN)),
    db: AsyncSession = Depends(get_db_session),
) -> SuccessResponse:
    admin = await _get_admin_record(db, user)
    vehicle = await db.scalar(
        select(VehicleRecord).where(VehicleRecord.driver_id == driver_id, VehicleRecord.is_active.is_(True))
    )
    if not vehicle:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No active vehicle found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(vehicle, field, value)
    db.add(vehicle)
    await db.commit()
    await db.refresh(vehicle)
    await audit_service.log(
        db,
        admin_id=admin.id,
        action_type="UPDATED_VEHICLE",
        entity_type="VEHICLE",
        entity_id=str(vehicle.id),
        details_json={"driver_id": driver_id, **payload.model_dump(exclude_unset=True, mode="json")},
    )
    return SuccessResponse(
        message="Vehicle updated",
        data=AdminDriverVehicleResponse(
            id=str(vehicle.id),
            driver_id=str(vehicle.driver_id),
            make=vehicle.make,
            model=vehicle.model,
            year=vehicle.year,
            color=vehicle.color,
            plate_number=vehicle.plate_number,
            vehicle_type=vehicle.vehicle_type,
            seat_capacity=vehicle.seat_capacity,
            fuel_type=vehicle.fuel_type,
            mileage_city=float(vehicle.mileage_city) if vehicle.mileage_city is not None else None,
            mileage_highway=float(vehicle.mileage_highway) if vehicle.mileage_highway is not None else None,
            is_active=vehicle.is_active,
        ).model_dump(mode="json"),
    )


@router.patch("/{driver_id}/region", response_model=SuccessResponse)
async def admin_update_driver_region(
    driver_id: str,
    payload: AdminUpdateRegionRequest,
    user: TokenPayload = Depends(require_role(UserRole.ADMIN)),
    db: AsyncSession = Depends(get_db_session),
) -> SuccessResponse:
    admin = await _get_admin_record(db, user)
    driver = await db.scalar(select(DriverRecord).where(DriverRecord.id == driver_id))
    if not driver:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Driver not found")
    previous_region_id = str(driver.region_id) if driver.region_id else None
    driver.region_id = payload.region_id
    db.add(driver)
    await db.commit()
    await audit_service.log(
        db,
        admin_id=admin.id,
        action_type="UPDATED_DRIVER_REGION",
        entity_type="DRIVER",
        entity_id=driver_id,
        details_json={"previous_region_id": previous_region_id, "region_id": payload.region_id},
    )
    return SuccessResponse(message="Driver region updated", data={"region_id": payload.region_id})


@router.get("/{driver_id}", response_model=SuccessResponse)
async def get_driver_detail(
    driver_id: str,
    _user: TokenPayload = Depends(require_role(UserRole.ADMIN)),
    db: AsyncSession = Depends(get_db_session),
) -> SuccessResponse:
    driver = await db.scalar(select(DriverRecord).where(DriverRecord.id == driver_id))
    if not driver:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Driver not found")

    vehicle_row = await db.scalar(
        select(VehicleRecord).where(VehicleRecord.driver_id == driver_id, VehicleRecord.is_active.is_(True))
    )
    onboarding_row = await db.scalar(
        select(DriverOnboardingProfile).where(DriverOnboardingProfile.driver_id == driver_id)
    )
    doc_rows = (await db.execute(
        select(DriverDocument).where(DriverDocument.driver_id == driver_id)
    )).scalars().all()

    vehicle = AdminDriverVehicleResponse(
        id=str(vehicle_row.id),
        driver_id=str(vehicle_row.driver_id),
        make=vehicle_row.make,
        model=vehicle_row.model,
        year=vehicle_row.year,
        color=vehicle_row.color,
        plate_number=vehicle_row.plate_number,
        vehicle_type=vehicle_row.vehicle_type,
        seat_capacity=vehicle_row.seat_capacity,
        fuel_type=vehicle_row.fuel_type,
        mileage_city=float(vehicle_row.mileage_city) if vehicle_row.mileage_city is not None else None,
        mileage_highway=float(vehicle_row.mileage_highway) if vehicle_row.mileage_highway is not None else None,
        is_active=vehicle_row.is_active,
    ) if vehicle_row else None

    onboarding = AdminDriverOnboardingResponse(
        driver_id=str(onboarding_row.driver_id),
        region_id=str(onboarding_row.region_id),
        status=onboarding_row.status.value,
        submitted_at=onboarding_row.submitted_at,
        review_started_at=onboarding_row.review_started_at,
        reviewed_at=onboarding_row.reviewed_at,
        reviewed_by_admin_id=str(onboarding_row.reviewed_by_admin_id) if onboarding_row.reviewed_by_admin_id else None,
        review_notes=onboarding_row.review_notes,
        rejection_reason=onboarding_row.rejection_reason,
    ) if onboarding_row else None

    documents = [
        AdminDriverDocumentResponse(
            id=str(doc.id),
            driver_id=str(doc.driver_id),
            document_type=doc.document_type.value,
            file_url=doc.file_url,
            file_path=doc.file_path,
            original_file_name=doc.original_file_name,
            mime_type=doc.mime_type,
            file_size=doc.file_size,
            document_number=doc.document_number,
            issuing_state=doc.issuing_state,
            issuing_country=doc.issuing_country,
            issued_at=doc.issued_at,
            expires_at=doc.expires_at,
            download_path=f"/api/v1/admin/documents/{doc.id}/download" if doc.file_path else None,
            verification_status=doc.verification_status.value,
            submitted_at=doc.submitted_at,
            reviewed_at=doc.reviewed_at,
            reviewed_by_admin_id=str(doc.reviewed_by_admin_id) if doc.reviewed_by_admin_id else None,
            notes=doc.notes,
            rejection_reason=doc.rejection_reason,
            metadata_json=doc.metadata_json,
        )
        for doc in doc_rows
    ]

    detail = AdminDriverDetailResponse(
        driver_id=str(driver.id),
        user_id=str(driver.user_id),
        first_name=driver.first_name,
        last_name=driver.last_name,
        phone_number=driver.phone_number,
        region_id=driver.region_id,
        status=driver.status,
        is_approved=driver.is_approved,
        is_online=driver.is_online,
        is_available=driver.is_available,
        rating_avg=float(driver.rating_avg) if driver.rating_avg is not None else None,
        total_rides_completed=driver.total_rides_completed,
        created_at=driver.created_at,
        vehicle=vehicle,
        onboarding=onboarding,
        documents=documents,
    )
    return SuccessResponse(data=detail.model_dump(mode="json"))
