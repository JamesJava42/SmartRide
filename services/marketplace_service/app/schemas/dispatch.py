from __future__ import annotations

from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel


class DriverOfferListItem(BaseModel):
    offer_id: str
    ride_id: str
    pickup_address: str
    dropoff_address: str
    distance_to_pickup_miles: Decimal
    trip_distance_miles: Decimal
    estimated_payout: Decimal | None = None
    expires_at: datetime
    offer_status: str


class AcceptOfferResponse(BaseModel):
    offer_id: str
    ride_id: str
    offer_status: str
    ride_status: str
    assigned_at: datetime | None = None


class RejectOfferRequest(BaseModel):
    reason: str | None = None


class RejectOfferResponse(BaseModel):
    offer_id: str
    offer_status: str
