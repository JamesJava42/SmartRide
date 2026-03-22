from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel


class DashboardSummaryResponse(BaseModel):
    active_rides: int
    online_drivers: int
    pending_onboarding_reviews: int
    active_regions: int


class ActiveRideItem(BaseModel):
    ride_id: str
    status: str
    rider_name: str
    driver_name: str | None = None
    pickup_address: str
    dropoff_address: str
    requested_at: datetime | str


class DriverListItem(BaseModel):
    driver_id: str
    first_name: str
    last_name: str | None = None
    status: str
    is_online: bool
    is_available: bool
    is_approved: bool


class DriverListResponse(BaseModel):
    items: list[DriverListItem]
    pagination: dict
