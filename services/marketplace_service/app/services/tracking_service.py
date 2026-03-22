from __future__ import annotations

import json
from uuid import UUID

import httpx
from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.enums import RideStatus
from app.models import Driver, Ride, Rider, TrackingPing
from app.schemas.tracking import LiveRideTrackingResponse, TrackingLocationPoint, TrackingPingRequest, TrackingPingResponse
from shared.python.enums.roles import UserRole
from shared.python.events.streams import get_redis_client


def _uuid(value: str) -> UUID:
    return UUID(value)


class TrackingService:
    async def _get_osrm_route(self, start_lat: float, start_lng: float, end_lat: float, end_lng: float) -> tuple[list[TrackingLocationPoint], int, int] | None:
        url = (
            "https://router.project-osrm.org/route/v1/driving/"
            f"{start_lng},{start_lat};{end_lng},{end_lat}?overview=full&geometries=geojson"
        )
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                response = await client.get(url)
                response.raise_for_status()
        except httpx.HTTPError:
            return None

        data = response.json()
        route = (data.get("routes") or [None])[0]
        if not route:
            return None

        geometry = [
            TrackingLocationPoint(latitude=lat, longitude=lng)
            for lng, lat in route.get("geometry", {}).get("coordinates", [])
        ]
        return geometry, int(route.get("distance", 0)), int(route.get("duration", 0))

    async def record_ping(self, db: AsyncSession, driver_user_id: str, payload: TrackingPingRequest) -> TrackingPingResponse:
        driver = await db.scalar(select(Driver).where(Driver.user_id == _uuid(driver_user_id)))
        if not driver:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Driver not found")
        ping = TrackingPing(
            ride_id=payload.ride_id,
            driver_id=driver.id,
            latitude=payload.latitude,
            longitude=payload.longitude,
            heading=payload.heading,
            speed_mph=payload.speed_mph,
            accuracy_meters=payload.accuracy_meters,
        )
        db.add(ping)
        await db.commit()
        await db.refresh(ping)
        await self.update_live_location(driver.id, payload.ride_id, payload.latitude, payload.longitude, payload.heading)
        return TrackingPingResponse(driver_id=driver.id, ride_id=payload.ride_id, recorded_at=ping.recorded_at)

    async def update_live_location(self, driver_id: str, ride_id: str | None, latitude, longitude, heading) -> None:
        redis = get_redis_client()
        snapshot = {
            "latitude": str(latitude),
            "longitude": str(longitude),
            "heading": None if heading is None else str(heading),
        }
        await redis.set(f"driver:last_location:{driver_id}", json.dumps(snapshot), ex=3600)
        if ride_id:
            await redis.set(f"ride:live:{ride_id}", json.dumps(snapshot), ex=3600)

    async def get_live_ride_state(
        self,
        db: AsyncSession,
        ride_id: str,
        actor_user_id: str,
        role: UserRole,
    ) -> LiveRideTrackingResponse:
        ride = await db.get(Ride, ride_id)
        if not ride:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ride not found")
        await self._enforce_access(db, ride, actor_user_id, role)
        redis = get_redis_client()
        raw = await redis.get(f"ride:live:{ride_id}")
        driver_location = None
        if raw:
            payload = json.loads(raw)
            driver_location = TrackingLocationPoint(
                latitude=payload["latitude"],
                longitude=payload["longitude"],
                heading=payload.get("heading"),
                updated_at=ride.updated_at,
            )
        eta_minutes = None
        route_geometry = None
        route_distance_meters = None
        route_duration_seconds = None
        if driver_location and ride.status in {RideStatus.DRIVER_ASSIGNED, RideStatus.DRIVER_EN_ROUTE, RideStatus.DRIVER_ARRIVED, RideStatus.RIDE_STARTED}:
            target_lat = float(ride.dropoff_latitude if ride.status == RideStatus.RIDE_STARTED else ride.pickup_latitude)
            target_lng = float(ride.dropoff_longitude if ride.status == RideStatus.RIDE_STARTED else ride.pickup_longitude)
            route = await self._get_osrm_route(
                float(driver_location.latitude),
                float(driver_location.longitude),
                target_lat,
                target_lng,
            )
            if route:
                route_geometry, route_distance_meters, route_duration_seconds = route
                eta_minutes = max(1, round(route_duration_seconds / 60))
        return LiveRideTrackingResponse(
            ride_id=ride.id,
            status=ride.status.value,
            driver_location=driver_location,
            pickup_location={"latitude": ride.pickup_latitude, "longitude": ride.pickup_longitude},
            dropoff_location={"latitude": ride.dropoff_latitude, "longitude": ride.dropoff_longitude},
            eta_minutes=eta_minutes,
            route_geometry=route_geometry,
            route_distance_meters=route_distance_meters,
            route_duration_seconds=route_duration_seconds,
        )

    async def _enforce_access(self, db: AsyncSession, ride: Ride, actor_user_id: str, role: UserRole) -> None:
        if role == UserRole.ADMIN:
            return
        if role == UserRole.RIDER:
            rider = await db.scalar(select(Rider).where(Rider.user_id == _uuid(actor_user_id)))
            if not rider or ride.rider_id != rider.id:
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")
            return
        if role == UserRole.DRIVER:
            driver = await db.scalar(select(Driver).where(Driver.user_id == _uuid(actor_user_id)))
            if not driver or ride.driver_id != driver.id:
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")
            return
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")


tracking_service = TrackingService()
