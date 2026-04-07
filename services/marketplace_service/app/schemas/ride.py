from __future__ import annotations

from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, Field


class RideRequestCreate(BaseModel):
    pickup_address: str
    pickup_latitude: Decimal
    pickup_longitude: Decimal
    dropoff_address: str
    dropoff_latitude: Decimal
    dropoff_longitude: Decimal
    ride_type: str
    vehicle_type: str
    payment_method: str = "CASH"
    fare_estimate_id: str | None = None


class RideRequestedResponse(BaseModel):
    ride_id: str
    status: str
    requested_at: datetime


class RideDriverSummary(BaseModel):
    id: str
    first_name: str
    last_name: str | None = None
    full_name: str = ""
    rating_avg: Decimal | None = None

    def model_post_init(self, __context: object) -> None:
        if not self.full_name:
            parts = [self.first_name, self.last_name]
            self.full_name = " ".join(p for p in parts if p)


class RideVehicleSummary(BaseModel):
    make: str
    model: str
    plate_number: str
    vehicle_type: str
    color: str | None = None


class RideFareBreakdownResponse(BaseModel):
    base_fare: Decimal
    distance_fare: Decimal
    time_fare: Decimal
    booking_fee: Decimal
    platform_fee: Decimal
    total: Decimal


class RideStatusResponse(BaseModel):
    """Lightweight status-only response for polling."""
    ride_id: str
    status: str
    driver: RideDriverSummary | None = None
    eta_minutes: int | None = None


class RideDetailResponse(BaseModel):
    id: str
    status: str
    ride_type: str
    vehicle_type: str = "ECONOMY"
    estimated_fare: Decimal = Decimal("0")
    payment_method: str
    pickup_address: str
    dropoff_address: str
    driver: RideDriverSummary | None = None
    vehicle: RideVehicleSummary | None = None
    requested_at: datetime | None = None
    assigned_at: datetime | None = None
    driver_en_route_at: datetime | None = None
    driver_arrived_at: datetime | None = None
    started_at: datetime | None = None
    completed_at: datetime | None = None
    estimated_distance_miles: Decimal | None = None
    estimated_duration_minutes: int | None = None
    dispatch_retry_count: int = 0
    actual_distance_miles: Decimal | None = None
    actual_duration_minutes: int | None = None
    final_fare_amount: Decimal | None = None
    rider_rating: int | None = None
    rider_comment: str | None = None
    feedback_status: str = "PENDING"
    completion_acknowledged: bool = False
    payment_status: str = "PENDING"
    receipt_available: bool = False
    can_rate_driver: bool = False
    can_tip: bool = False
    fare_breakdown: RideFareBreakdownResponse | None = None


class RideHistoryItem(BaseModel):
    ride_id: str
    pickup_address: str
    dropoff_address: str
    status: str
    completed_at: datetime | None = None
    final_fare_amount: Decimal | None = None


class PaginationResponse(BaseModel):
    page: int
    page_size: int
    total_items: int
    total_pages: int


class RideHistoryResponse(BaseModel):
    items: list[RideHistoryItem]
    pagination: PaginationResponse


class CancelRideRequest(BaseModel):
    cancel_reason: str | None = None


class RideCancelledResponse(BaseModel):
    ride_id: str
    status: str
    cancelled_at: datetime | None = None


class RideStatusActionResponse(BaseModel):
    ride_id: str
    status: str
    dispatch_retry_count: int | None = None
    driver_en_route_at: datetime | None = None
    driver_arrived_at: datetime | None = None
    started_at: datetime | None = None
    completed_at: datetime | None = None
    final_fare_amount: Decimal | None = None
    driver_payout_amount: Decimal | None = None


class CompleteRideRequest(BaseModel):
    actual_distance_miles: Decimal | None = None
    actual_duration_minutes: int | None = None


class SubmitRideFeedbackRequest(BaseModel):
    rating: int = Field(ge=1, le=5)
    comment: str | None = Field(default=None, max_length=500)


class AcknowledgeRideCompletionRequest(BaseModel):
    feedback_status: str | None = None


class InternalAdminDriverItem(BaseModel):
    driver_id: str
    first_name: str
    last_name: str | None = None
    status: str
    is_online: bool
    is_available: bool
    is_approved: bool
    total_rides_completed: int


class InternalAdminDriversResponse(BaseModel):
    items: list[InternalAdminDriverItem]
    pagination: PaginationResponse


class InternalActiveRideItem(BaseModel):
    ride_id: str
    status: str
    pickup_address: str
    dropoff_address: str
    rider_id: str
    rider_name: str
    driver_id: str | None = None
    driver_name: str | None = None
    region_id: str | None = None
    region: str | None = None
    requested_at: datetime | None = None
    eta_minutes: int | None = None
    fare: Decimal | None = None
    product_type: str | None = None
    driver_lat: Decimal | None = None
    driver_lng: Decimal | None = None
    dispatch_retry_count: int = 0


class UnmatchedRideReportItem(BaseModel):
    ride_id: str
    rider_name: str
    pickup_address: str
    dropoff_address: str
    requested_at: datetime | None = None
    dispatch_retry_count: int = 0
    recent_activity: str


class UnmatchedRideReportResponse(BaseModel):
    total_unmatched_rides: int
    max_dispatch_retries: int
    items: list[UnmatchedRideReportItem]
