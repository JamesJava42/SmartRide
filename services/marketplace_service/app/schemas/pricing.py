from __future__ import annotations

from decimal import Decimal

from pydantic import BaseModel


class FareEstimateRequest(BaseModel):
    pickup_address: str
    pickup_latitude: Decimal
    pickup_longitude: Decimal
    dropoff_address: str
    dropoff_latitude: Decimal
    dropoff_longitude: Decimal
    ride_type: str
    vehicle_type: str


class FareEstimateResponse(BaseModel):
    estimate_id: str
    vehicle_type: str
    distance_miles: Decimal
    duration_minutes: int
    base_fare: Decimal
    distance_fare: Decimal
    time_fare: Decimal
    booking_fee: Decimal
    platform_fee: Decimal
    surge_multiplier: Decimal
    total_estimated_fare: Decimal
    driver_payout_estimate: Decimal | None = None
