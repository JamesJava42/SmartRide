from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import TokenPayload, require_role
from app.db.session import get_db_session
from app.models import Admin
from app.schemas.region import RegionResponse, RegionUpdateRequest
from app.services.audit_service import audit_service
from app.services.region_service import region_service
from shared.python.enums.roles import UserRole
from shared.python.schemas.responses import SuccessResponse

router = APIRouter(prefix="/api/v1/admin/regions", tags=["admin-regions"])


async def _get_admin_record(db: AsyncSession, user: TokenPayload) -> Admin:
    user_id = UUID(user.user_id)
    admin = await db.scalar(select(Admin).where(Admin.user_id == user_id, Admin.is_active.is_(True)))
    if not admin:
        from fastapi import HTTPException, status

        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")
    return admin


@router.get("", response_model=SuccessResponse)
async def list_regions(
    _user: TokenPayload = Depends(require_role(UserRole.ADMIN)),
    db: AsyncSession = Depends(get_db_session),
) -> SuccessResponse:
    regions = await region_service.list_regions(db)
    return SuccessResponse(data=[r.model_dump() for r in regions])


@router.put("/{region_id}", response_model=SuccessResponse)
async def update_region(
    region_id: str,
    payload: RegionUpdateRequest,
    user: TokenPayload = Depends(require_role(UserRole.ADMIN)),
    db: AsyncSession = Depends(get_db_session),
) -> SuccessResponse:
    admin = await _get_admin_record(db, user)
    region = await region_service.update_region(db, region_id=region_id, payload=payload)
    await audit_service.log(
        db,
        admin_id=admin.id,
        action_type="UPDATED_REGION",
        entity_type="REGION",
        entity_id=region_id,
        details_json=payload.model_dump(mode="json"),
    )
    return SuccessResponse(message="Region updated", data=region.model_dump())


@router.post("/{region_id}/toggle-active", response_model=SuccessResponse)
async def toggle_region_active(
    region_id: str,
    user: TokenPayload = Depends(require_role(UserRole.ADMIN)),
    db: AsyncSession = Depends(get_db_session),
) -> SuccessResponse:
    admin = await _get_admin_record(db, user)
    region = await region_service.toggle_active(db, region_id=region_id)
    status_label = "activated" if region.is_active else "deactivated"
    await audit_service.log(
        db,
        admin_id=admin.id,
        action_type="TOGGLED_REGION_ACTIVE",
        entity_type="REGION",
        entity_id=region_id,
        details_json={"is_active": region.is_active},
    )
    return SuccessResponse(message=f"Region {status_label}", data=region.model_dump())
