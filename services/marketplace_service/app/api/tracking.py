from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_current_user, require_role
from app.db.session import get_db_session
from app.schemas.tracking import TrackingPingRequest
from app.services.tracking_service import tracking_service
from shared.python.enums.roles import UserRole
from shared.python.schemas.responses import SuccessResponse

router = APIRouter(tags=["tracking"])


@router.post("/api/v1/tracking/location", response_model=SuccessResponse)
async def submit_driver_location(
    payload: TrackingPingRequest,
    db: AsyncSession = Depends(get_db_session),
    user=Depends(require_role(UserRole.DRIVER)),
):
    return SuccessResponse(message="Location received", data=await tracking_service.record_ping(db, user.user_id, payload))


@router.get("/api/v1/tracking/rides/{ride_id}/live", response_model=SuccessResponse)
async def get_live_ride_tracking(
    ride_id: str,
    db: AsyncSession = Depends(get_db_session),
    user=Depends(get_current_user),
):
    return SuccessResponse(data=await tracking_service.get_live_ride_state(db, ride_id, user.user_id, user.role))
