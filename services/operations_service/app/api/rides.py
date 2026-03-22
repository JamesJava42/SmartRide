from __future__ import annotations

from fastapi import APIRouter, Depends, Header, Query

from app.core.deps import TokenPayload, require_role
from app.services.driver_admin_service import driver_admin_service
from shared.python.enums.roles import UserRole
from shared.python.schemas.responses import SuccessResponse

router = APIRouter(prefix="/api/v1/admin/rides", tags=["admin-rides"])


@router.get("/active", response_model=SuccessResponse)
async def list_active_rides(
    region_id: str | None = Query(default=None),
    _user: TokenPayload = Depends(require_role(UserRole.ADMIN)),
    authorization: str | None = Header(default=None),
) -> SuccessResponse:
    rides = await driver_admin_service.list_active_rides(authorization, {"region_id": region_id})
    return SuccessResponse(data=rides)


@router.get("/unmatched-report", response_model=SuccessResponse)
async def get_unmatched_rides_report(
    _user: TokenPayload = Depends(require_role(UserRole.ADMIN)),
    authorization: str | None = Header(default=None),
) -> SuccessResponse:
    report = await driver_admin_service.get_unmatched_rides_report(authorization)
    return SuccessResponse(data=report)
