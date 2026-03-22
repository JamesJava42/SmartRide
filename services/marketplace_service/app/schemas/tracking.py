from __future__ import annotations

from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel


class TrackingPingRequest(BaseModel):
    ride_id: str | None = None
    latitude: Decimal
    longitude: Decimal
    heading: Decimal | None = None
    speed_mph: Decimal | None = None
    accuracy_meters: Decimal | None = None


class TrackingPingResponse(BaseModel):
    driver_id: str
    ride_id: str | None = None
    recorded_at: datetime


class TrackingLocationPoint(BaseModel):
    latitude: Decimal
    longitude: Decimal
    heading: Decimal | None = None
    updated_at: datetime | None = None


class FixedLocationPoint(BaseModel):
    latitude: Decimal
    longitude: Decimal


class RouteLocationPoint(BaseModel):
    latitude: Decimal
    longitude: Decimal


class LiveRideTrackingResponse(BaseModel):
    ride_id: str
    status: str
    driver_location: TrackingLocationPoint | None = None
    pickup_location: FixedLocationPoint
    dropoff_location: FixedLocationPoint
    eta_minutes: int | None = None
    route_geometry: list[RouteLocationPoint] | None = None
    route_distance_meters: int | None = None
    route_duration_seconds: int | None = None
