from __future__ import annotations

from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, Field


class RiderProfileResponse(BaseModel):
    id: str
    user_id: str
    first_name: str
    last_name: str | None = None
    default_payment_method: str | None = None
    rating_avg: Decimal | None = None


class RiderProfileUpdateRequest(BaseModel):
    first_name: str = Field(min_length=1, max_length=100)
    last_name: str | None = Field(default=None, max_length=100)


class SavedPlaceResponse(BaseModel):
    id: str
    label: str
    address_line: str
    latitude: Decimal
    longitude: Decimal


class CreateSavedPlaceRequest(BaseModel):
    label: str = Field(min_length=1, max_length=64)
    address_line: str = Field(min_length=1, max_length=255)
    latitude: Decimal
    longitude: Decimal


class RiderPaymentSettingsResponse(BaseModel):
    default_payment_method: str | None = None


class RiderPaymentSettingsUpdateRequest(BaseModel):
    default_payment_method: str = Field(min_length=1, max_length=64)


class RiderPaymentItemResponse(BaseModel):
    ride_id: str
    created_at: datetime | None = None
    completed_at: datetime | None = None
    pickup_address: str
    dropoff_address: str
    amount: Decimal
    payment_method: str
    payment_status: str
    ride_status: str


class RiderPaymentSummaryResponse(BaseModel):
    total_spent: Decimal
    trip_count: int
    avg_trip_cost: Decimal
    fees_total: Decimal
    tips_total: Decimal
    discounts_total: Decimal
    wallet_balance: Decimal
    ride_credits: Decimal
    default_payment_method: str | None = None
