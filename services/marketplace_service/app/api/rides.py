from __future__ import annotations

from fastapi import APIRouter, Depends, Header
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.enums import RideStatus
from app.core.deps import get_current_user, require_role
from app.db.session import get_db_session
from app.schemas.ride import (
    AcknowledgeRideCompletionRequest,
    CancelRideRequest,
    CompleteRideRequest,
    RideRequestCreate,
    SubmitRideFeedbackRequest,
)
from app.services.ride_service import ride_service
from app.services.idempotency_service import idempotency_service
from shared.python.enums.roles import UserRole
from shared.python.schemas.responses import SuccessResponse
from fastapi.responses import Response

router = APIRouter(tags=["rides"])
@router.post("/api/v1/rides/request", response_model=SuccessResponse)
async def create_ride_request(
    payload: RideRequestCreate,
    idempotency_key: str | None = Header(default=None, alias="Idempotency-Key"),
    db: AsyncSession = Depends(get_db_session),
    user=Depends(require_role(UserRole.RIDER)),
):
    record, replay = await idempotency_service.begin(
        db,
        actor_user_id=user.user_id,
        action_scope="RIDE_CREATE",
        idempotency_key=idempotency_key,
        payload=payload.model_dump(mode="json"),
    )
    if replay:
        return SuccessResponse(message=replay.get("message"), data=replay.get("data"))

    result = await ride_service.create_ride(db, user.user_id, payload)
    await idempotency_service.complete(
        db,
        record,
        {
            "message": "Ride requested successfully",
            "data": result.model_dump(mode="json"),
        },
    )
    return SuccessResponse(message="Ride requested successfully", data=result)


@router.get("/api/v1/rides/{ride_id}", response_model=SuccessResponse)
async def get_ride_detail(
    ride_id: str,
    db: AsyncSession = Depends(get_db_session),
    user=Depends(get_current_user),
):
    return SuccessResponse(data=await ride_service.get_ride_detail(db, ride_id, user.user_id, user.role))


@router.get("/api/v1/rides/me/history", response_model=SuccessResponse)
async def list_rider_ride_history(
    page: int = 1,
    page_size: int = 10,
    db: AsyncSession = Depends(get_db_session),
    user=Depends(require_role(UserRole.RIDER)),
):
    return SuccessResponse(data=await ride_service.list_rider_history(db, user.user_id, page, page_size))


@router.post("/api/v1/rides/{ride_id}/cancel", response_model=SuccessResponse)
async def cancel_ride(
    ride_id: str,
    payload: CancelRideRequest,
    db: AsyncSession = Depends(get_db_session),
    user=Depends(get_current_user),
):
    return SuccessResponse(message="Ride cancelled", data=await ride_service.cancel_ride(db, ride_id, user.user_id, user.role, payload))


@router.post("/api/v1/rides/{ride_id}/driver-en-route", response_model=SuccessResponse)
async def mark_driver_en_route(
    ride_id: str,
    db: AsyncSession = Depends(get_db_session),
    user=Depends(require_role(UserRole.DRIVER)),
):
    return SuccessResponse(message="Ride updated to driver en route", data=await ride_service.driver_status_action(db, ride_id, user.user_id, action=RideStatus.DRIVER_EN_ROUTE))


@router.post("/api/v1/rides/{ride_id}/arrived", response_model=SuccessResponse)
async def mark_driver_arrived(
    ride_id: str,
    db: AsyncSession = Depends(get_db_session),
    user=Depends(require_role(UserRole.DRIVER)),
):
    return SuccessResponse(message="Driver marked as arrived", data=await ride_service.driver_status_action(db, ride_id, user.user_id, action=RideStatus.DRIVER_ARRIVED))


@router.post("/api/v1/rides/{ride_id}/start", response_model=SuccessResponse)
async def start_ride(
    ride_id: str,
    db: AsyncSession = Depends(get_db_session),
    user=Depends(require_role(UserRole.DRIVER)),
):
    return SuccessResponse(message="Ride started", data=await ride_service.driver_status_action(db, ride_id, user.user_id, action=RideStatus.RIDE_STARTED))


@router.post("/api/v1/rides/{ride_id}/complete", response_model=SuccessResponse)
async def complete_ride(
    ride_id: str,
    payload: CompleteRideRequest | None = None,
    db: AsyncSession = Depends(get_db_session),
    user=Depends(require_role(UserRole.DRIVER)),
):
    return SuccessResponse(message="Ride completed", data=await ride_service.complete_ride(db, ride_id, user.user_id, payload or CompleteRideRequest()))


@router.post("/api/v1/rider/rides/{ride_id}/rate", response_model=SuccessResponse)
async def submit_ride_feedback(
    ride_id: str,
    payload: SubmitRideFeedbackRequest,
    db: AsyncSession = Depends(get_db_session),
    user=Depends(require_role(UserRole.RIDER)),
):
    return SuccessResponse(
        message="Ride feedback submitted",
        data=await ride_service.submit_rider_feedback(db, ride_id, user.user_id, payload),
    )


@router.post("/api/v1/rider/rides/{ride_id}/acknowledge-completion", response_model=SuccessResponse)
async def acknowledge_completion(
    ride_id: str,
    payload: AcknowledgeRideCompletionRequest,
    db: AsyncSession = Depends(get_db_session),
    user=Depends(require_role(UserRole.RIDER)),
):
    return SuccessResponse(
        message="Ride completion acknowledged",
        data=await ride_service.acknowledge_completion(db, ride_id, user.user_id, payload.feedback_status),
    )


@router.get("/api/v1/rider/rides/{ride_id}/receipt")
async def download_rider_receipt(
    ride_id: str,
    db: AsyncSession = Depends(get_db_session),
    user=Depends(require_role(UserRole.RIDER)),
):
    filename, content = await ride_service.generate_rider_receipt(db, ride_id, user.user_id)
    return Response(
        content=content,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.get("/api/v1/internal/admin/rides/active", response_model=SuccessResponse)
async def internal_active_rides(
    db: AsyncSession = Depends(get_db_session),
    _admin=Depends(require_role(UserRole.ADMIN)),
):
    return SuccessResponse(data=await ride_service.list_active_for_admin(db))


@router.get("/api/v1/internal/admin/rides/unmatched-report", response_model=SuccessResponse)
async def internal_unmatched_rides_report(
    db: AsyncSession = Depends(get_db_session),
    _admin=Depends(require_role(UserRole.ADMIN)),
):
    return SuccessResponse(data=await ride_service.get_unmatched_rides_report(db))


@router.post("/api/v1/internal/admin/rides/{ride_id}/redispatch", response_model=SuccessResponse)
async def internal_redispatch_ride(
    ride_id: str,
    db: AsyncSession = Depends(get_db_session),
    _admin=Depends(require_role(UserRole.ADMIN)),
):
    from app.services.dispatch_service import dispatch_service

    return SuccessResponse(
        message="Ride redispatch started",
        data=await dispatch_service.admin_redispatch_ride(db, ride_id),
    )
