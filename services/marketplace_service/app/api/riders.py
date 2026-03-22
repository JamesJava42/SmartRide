from __future__ import annotations

from fastapi import APIRouter, Depends, Header
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_current_user, require_role
from app.db.session import get_db_session
from app.schemas.rider import (
    CreateSavedPlaceRequest,
    RiderPaymentSettingsUpdateRequest,
    RiderProfileUpdateRequest,
)
from app.services.rider_service import rider_service
from app.services.idempotency_service import idempotency_service
from shared.python.enums.roles import UserRole
from shared.python.schemas.responses import SuccessResponse

router = APIRouter(prefix="/api/v1/riders", tags=["riders"])


@router.post("/me/bootstrap", response_model=SuccessResponse)
async def bootstrap_rider_profile(
    db: AsyncSession = Depends(get_db_session),
    user=Depends(require_role(UserRole.RIDER)),
):
    return SuccessResponse(message="Rider profile ready", data=await rider_service.bootstrap_rider(db, user.user_id))


@router.get("/me", response_model=SuccessResponse)
async def get_rider_profile(
    db: AsyncSession = Depends(get_db_session),
    user=Depends(require_role(UserRole.RIDER)),
):
    return SuccessResponse(data=await rider_service.get_profile(db, user.user_id))


@router.patch("/me", response_model=SuccessResponse)
async def update_rider_profile(
    payload: RiderProfileUpdateRequest,
    db: AsyncSession = Depends(get_db_session),
    user=Depends(require_role(UserRole.RIDER)),
):
    return SuccessResponse(message="Profile updated", data=await rider_service.update_profile(db, user.user_id, payload))


@router.get("/me/saved-places", response_model=SuccessResponse)
async def list_saved_places(
    db: AsyncSession = Depends(get_db_session),
    user=Depends(require_role(UserRole.RIDER)),
):
    return SuccessResponse(data=await rider_service.list_saved_places(db, user.user_id))


@router.post("/me/saved-places", response_model=SuccessResponse)
async def create_saved_place(
    payload: CreateSavedPlaceRequest,
    db: AsyncSession = Depends(get_db_session),
    user=Depends(require_role(UserRole.RIDER)),
):
    return SuccessResponse(message="Saved place created", data=await rider_service.create_saved_place(db, user.user_id, payload))


@router.get("/me/payment-settings", response_model=SuccessResponse)
async def get_payment_settings(
    db: AsyncSession = Depends(get_db_session),
    user=Depends(require_role(UserRole.RIDER)),
):
    return SuccessResponse(data=await rider_service.get_payment_settings(db, user.user_id))


@router.patch("/me/payment-settings", response_model=SuccessResponse)
async def update_payment_settings(
    payload: RiderPaymentSettingsUpdateRequest,
    idempotency_key: str | None = Header(default=None, alias="Idempotency-Key"),
    db: AsyncSession = Depends(get_db_session),
    user=Depends(require_role(UserRole.RIDER)),
):
    record, replay = await idempotency_service.begin(
        db,
        actor_user_id=user.user_id,
        action_scope="RIDER_PAYMENT_SETTINGS_UPDATE",
        idempotency_key=idempotency_key,
        payload=payload.model_dump(mode="json"),
    )
    if replay:
        return SuccessResponse(message=replay.get("message"), data=replay.get("data"))
    result = await rider_service.update_payment_settings(db, user.user_id, payload)
    await idempotency_service.complete(
        db,
        record,
        {
            "message": "Payment settings updated",
            "data": result.model_dump(mode="json"),
        },
    )
    return SuccessResponse(message="Payment settings updated", data=result)


@router.get("/me/payment-summary", response_model=SuccessResponse)
async def get_payment_summary(
    db: AsyncSession = Depends(get_db_session),
    user=Depends(require_role(UserRole.RIDER)),
):
    return SuccessResponse(data=await rider_service.get_payment_summary(db, user.user_id))


@router.get("/me/payments", response_model=SuccessResponse)
async def list_payments(
    limit: int = 20,
    db: AsyncSession = Depends(get_db_session),
    user=Depends(require_role(UserRole.RIDER)),
):
    return SuccessResponse(data=await rider_service.list_payments(db, user.user_id, limit))
