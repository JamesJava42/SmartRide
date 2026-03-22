from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import require_role
from app.db.session import get_db_session
from app.schemas.dispatch import RejectOfferRequest
from app.services.dispatch_service import dispatch_service
from shared.python.enums.roles import UserRole
from shared.python.schemas.responses import SuccessResponse

router = APIRouter(tags=["dispatch"])


@router.get("/api/v1/driver/offers/active", response_model=SuccessResponse)
async def list_active_offers(
    db: AsyncSession = Depends(get_db_session),
    user=Depends(require_role(UserRole.DRIVER)),
):
    return SuccessResponse(data=await dispatch_service.list_active_offers(db, user.user_id))


@router.post("/api/v1/driver/offers/{offer_id}/accept", response_model=SuccessResponse)
async def accept_offer(
    offer_id: str,
    db: AsyncSession = Depends(get_db_session),
    user=Depends(require_role(UserRole.DRIVER)),
):
    return SuccessResponse(message="Ride offer accepted", data=await dispatch_service.accept_offer(db, user.user_id, offer_id))


@router.post("/api/v1/driver/offers/{offer_id}/reject", response_model=SuccessResponse)
async def reject_offer(
    offer_id: str,
    payload: RejectOfferRequest,
    db: AsyncSession = Depends(get_db_session),
    user=Depends(require_role(UserRole.DRIVER)),
):
    return SuccessResponse(message="Ride offer rejected", data=await dispatch_service.reject_offer(db, user.user_id, offer_id, payload.reason))
