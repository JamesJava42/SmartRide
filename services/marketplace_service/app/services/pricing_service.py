from __future__ import annotations

from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlalchemy import and_, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import FareEstimate, PricingRateCard
from app.schemas.pricing import FareEstimateRequest, FareEstimateResponse
from app.services.common import haversine_miles, to_decimal


class PricingService:
    async def estimate_fare(self, db: AsyncSession, payload: FareEstimateRequest) -> FareEstimateResponse:
        rate_card = await db.scalar(
            select(PricingRateCard)
            .where(
                and_(
                    PricingRateCard.vehicle_type == payload.vehicle_type,
                    PricingRateCard.is_active.is_(True),
                    PricingRateCard.effective_from <= datetime.now(timezone.utc),
                    or_(PricingRateCard.effective_to.is_(None), PricingRateCard.effective_to >= datetime.now(timezone.utc)),
                )
            )
            .order_by(PricingRateCard.effective_from.desc())
        )
        if not rate_card:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pricing rate card not found")

        distance = haversine_miles(
            float(payload.pickup_latitude),
            float(payload.pickup_longitude),
            float(payload.dropoff_latitude),
            float(payload.dropoff_longitude),
        )
        duration_minutes = max(1, round((distance / 28.0) * 60))
        distance_fare = to_decimal(distance * float(rate_card.per_mile_rate))
        time_fare = to_decimal(duration_minutes * float(rate_card.per_minute_rate))
        subtotal = to_decimal(float(rate_card.base_fare) + float(distance_fare) + float(time_fare))
        total = max(subtotal, rate_card.minimum_fare)
        total = to_decimal(float(total) + float(rate_card.booking_fee) + float(rate_card.platform_fee))
        payout_percent = float(rate_card.driver_payout_percent or 80)
        payout = to_decimal(float(total) * payout_percent / 100)

        estimate = FareEstimate(
            vehicle_type=payload.vehicle_type,
            region_id=rate_card.region_id,
            distance_miles=to_decimal(distance),
            duration_minutes=duration_minutes,
            base_fare=to_decimal(rate_card.base_fare),
            distance_fare=distance_fare,
            time_fare=time_fare,
            surge_multiplier=to_decimal(1),
            booking_fee=to_decimal(rate_card.booking_fee),
            platform_fee=to_decimal(rate_card.platform_fee),
            total_estimated_fare=total,
            driver_payout_estimate=payout,
            pricing_snapshot={
                "rate_card_id": rate_card.id,
                "per_mile_rate": str(rate_card.per_mile_rate),
                "per_minute_rate": str(rate_card.per_minute_rate),
                "minimum_fare": str(rate_card.minimum_fare),
            },
        )
        db.add(estimate)
        await db.commit()
        await db.refresh(estimate)
        return FareEstimateResponse(
            estimate_id=estimate.id,
            vehicle_type=estimate.vehicle_type,
            distance_miles=estimate.distance_miles,
            duration_minutes=estimate.duration_minutes,
            base_fare=estimate.base_fare,
            distance_fare=estimate.distance_fare,
            time_fare=estimate.time_fare,
            booking_fee=estimate.booking_fee,
            platform_fee=estimate.platform_fee,
            surge_multiplier=estimate.surge_multiplier,
            total_estimated_fare=estimate.total_estimated_fare,
            driver_payout_estimate=estimate.driver_payout_estimate,
        )


pricing_service = PricingService()
