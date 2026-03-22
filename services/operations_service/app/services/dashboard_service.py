from __future__ import annotations

from math import ceil

import httpx
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.models import DriverOnboardingProfile
from app.schemas.dashboard import DashboardSummaryResponse
from app.services.region_service import region_service
from app.core.enums import OnboardingStatus


class DashboardService:
    async def get_summary(self, db: AsyncSession, auth_header: str | None) -> DashboardSummaryResponse:
        active_rides = 0
        online_drivers = 0
        async with httpx.AsyncClient(timeout=5.0) as client:
            try:
                rides_response = await client.get(
                    f"{settings.marketplace_service_url}/api/v1/internal/admin/rides/active",
                    headers={"Authorization": auth_header} if auth_header else {},
                )
                if rides_response.is_success:
                    active_rides = len(rides_response.json().get("data", []))
            except httpx.HTTPError:
                active_rides = 0

            try:
                drivers_response = await client.get(
                    f"{settings.marketplace_service_url}/api/v1/internal/admin/drivers",
                    headers={"Authorization": auth_header} if auth_header else {},
                )
                if drivers_response.is_success:
                    payload = drivers_response.json().get("data", {})
                    online_drivers = len([item for item in payload.get("items", []) if item.get("is_online")])
            except httpx.HTTPError:
                online_drivers = 0

        pending_reviews = len(
            list((await db.scalars(select(DriverOnboardingProfile).where(DriverOnboardingProfile.status == OnboardingStatus.SUBMITTED))).all())
        )
        active_regions = await region_service.list_active_regions_count(db)
        return DashboardSummaryResponse(
            active_rides=active_rides,
            online_drivers=online_drivers,
            pending_onboarding_reviews=pending_reviews,
            active_regions=active_regions,
        )

    @staticmethod
    def pagination(page: int, page_size: int, total_items: int) -> dict:
        return {
            "page": page,
            "page_size": page_size,
            "total_items": total_items,
            "total_pages": ceil(total_items / page_size) if page_size else 1,
        }


dashboard_service = DashboardService()
