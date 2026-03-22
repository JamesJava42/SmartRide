from __future__ import annotations

from decimal import Decimal
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy import desc, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Ride, Rider, RiderSavedPlace
from app.schemas.rider import (
    CreateSavedPlaceRequest,
    RiderPaymentItemResponse,
    RiderPaymentSettingsResponse,
    RiderPaymentSettingsUpdateRequest,
    RiderPaymentSummaryResponse,
    RiderProfileResponse,
    RiderProfileUpdateRequest,
    SavedPlaceResponse,
)


def _uuid(value: str) -> UUID:
    return UUID(value)


class RiderService:
    async def get_rider(self, db: AsyncSession, user_id: str) -> Rider | None:
        return await db.scalar(select(Rider).where(Rider.user_id == _uuid(user_id)))

    async def get_rider_or_404(self, db: AsyncSession, user_id: str) -> Rider:
        rider = await self.get_rider(db, user_id)
        if not rider:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Rider profile not found. Complete rider setup before using rider features.",
            )
        return rider

    async def bootstrap_rider(self, db: AsyncSession, user_id: str) -> RiderProfileResponse:
        rider = await self.get_rider(db, user_id)
        if not rider:
            rider = Rider(user_id=_uuid(user_id), first_name="Rider", last_name=None)
            db.add(rider)
            await db.commit()
            await db.refresh(rider)
        return RiderProfileResponse.model_validate(rider, from_attributes=True)

    async def get_or_create_rider_for_write(self, db: AsyncSession, user_id: str) -> Rider:
        rider = await db.scalar(select(Rider).where(Rider.user_id == _uuid(user_id)))
        if rider:
            return rider
        rider = Rider(user_id=_uuid(user_id), first_name="Rider", last_name=None)
        db.add(rider)
        await db.commit()
        await db.refresh(rider)
        return rider

    async def get_profile(self, db: AsyncSession, user_id: str) -> RiderProfileResponse:
        rider = await self.get_rider_or_404(db, user_id)
        return RiderProfileResponse.model_validate(rider, from_attributes=True)

    async def update_profile(self, db: AsyncSession, user_id: str, payload: RiderProfileUpdateRequest) -> RiderProfileResponse:
        rider = await self.get_or_create_rider_for_write(db, user_id)
        rider.first_name = payload.first_name
        rider.last_name = payload.last_name
        db.add(rider)
        await db.commit()
        await db.refresh(rider)
        return RiderProfileResponse.model_validate(rider, from_attributes=True)

    async def list_saved_places(self, db: AsyncSession, user_id: str) -> list[SavedPlaceResponse]:
        rider = await self.get_rider_or_404(db, user_id)
        rows = (await db.execute(select(RiderSavedPlace).where(RiderSavedPlace.rider_id == rider.id))).scalars().all()
        return [SavedPlaceResponse.model_validate(row, from_attributes=True) for row in rows]

    async def create_saved_place(self, db: AsyncSession, user_id: str, payload: CreateSavedPlaceRequest) -> SavedPlaceResponse:
        rider = await self.get_or_create_rider_for_write(db, user_id)
        place = RiderSavedPlace(
            rider_id=rider.id,
            label=payload.label,
            address_line=payload.address_line,
            latitude=payload.latitude,
            longitude=payload.longitude,
        )
        db.add(place)
        await db.commit()
        await db.refresh(place)
        return SavedPlaceResponse.model_validate(place, from_attributes=True)

    async def get_payment_settings(self, db: AsyncSession, user_id: str) -> RiderPaymentSettingsResponse:
        rider = await self.get_rider_or_404(db, user_id)
        return RiderPaymentSettingsResponse(default_payment_method=rider.default_payment_method)

    async def update_payment_settings(
        self,
        db: AsyncSession,
        user_id: str,
        payload: RiderPaymentSettingsUpdateRequest,
    ) -> RiderPaymentSettingsResponse:
        rider = await self.get_or_create_rider_for_write(db, user_id)
        rider.default_payment_method = payload.default_payment_method.strip().upper()
        db.add(rider)
        await db.commit()
        await db.refresh(rider)
        return RiderPaymentSettingsResponse(default_payment_method=rider.default_payment_method)

    async def list_payments(self, db: AsyncSession, user_id: str, limit: int = 20) -> list[RiderPaymentItemResponse]:
        rider = await self.get_rider_or_404(db, user_id)
        rows = (
            await db.execute(
                select(Ride)
                .where(Ride.rider_id == rider.id, Ride.final_fare_amount.is_not(None))
                .order_by(desc(Ride.completed_at), desc(Ride.created_at))
                .limit(limit)
            )
        ).scalars().all()

        return [
            RiderPaymentItemResponse(
                ride_id=str(row.id),
                created_at=row.created_at,
                completed_at=row.completed_at,
                pickup_address=row.pickup_address,
                dropoff_address=row.dropoff_address,
                amount=row.final_fare_amount or Decimal("0.00"),
                payment_method=row.payment_method or rider.default_payment_method or "CASH",
                payment_status="PROCESSED" if row.final_fare_amount is not None else "PENDING",
                ride_status=row.status.value if hasattr(row.status, "value") else str(row.status),
            )
            for row in rows
        ]

    async def get_payment_summary(self, db: AsyncSession, user_id: str) -> RiderPaymentSummaryResponse:
        rider = await self.get_rider_or_404(db, user_id)
        payments = await self.list_payments(db, user_id, limit=500)
        total_spent = sum((payment.amount for payment in payments), Decimal("0.00"))
        trip_count = len(payments)
        avg_trip_cost = (total_spent / trip_count) if trip_count else Decimal("0.00")

        return RiderPaymentSummaryResponse(
            total_spent=total_spent,
            trip_count=trip_count,
            avg_trip_cost=avg_trip_cost,
            fees_total=Decimal("0.00"),
            tips_total=Decimal("0.00"),
            discounts_total=Decimal("0.00"),
            wallet_balance=Decimal("0.00"),
            ride_credits=Decimal("0.00"),
            default_payment_method=rider.default_payment_method,
        )


rider_service = RiderService()
