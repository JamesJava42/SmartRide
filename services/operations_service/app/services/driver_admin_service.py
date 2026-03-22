from __future__ import annotations

import httpx

from app.config import settings


class DriverAdminService:
    async def list_drivers(self, auth_header: str | None, params: dict) -> dict:
        async with httpx.AsyncClient(timeout=5.0) as client:
            try:
                response = await client.get(
                    f"{settings.marketplace_service_url}/api/v1/internal/admin/drivers",
                    params=params,
                    headers={"Authorization": auth_header} if auth_header else {},
                )
                if response.is_success:
                    return response.json().get("data", {"items": [], "pagination": {"page": 1, "page_size": 20, "total_items": 0, "total_pages": 0}})
            except httpx.HTTPError:
                pass
        page = int(params.get("page", 1))
        page_size = int(params.get("page_size", 20))
        return {"items": [], "pagination": {"page": page, "page_size": page_size, "total_items": 0, "total_pages": 0}}

    async def suspend_driver(self, driver_id: str, reason: str, auth_header: str | None) -> dict:
        async with httpx.AsyncClient(timeout=5.0) as client:
            try:
                response = await client.post(
                    f"{settings.marketplace_service_url}/api/v1/internal/admin/drivers/{driver_id}/suspend",
                    json={"reason": reason},
                    headers={"Authorization": auth_header} if auth_header else {},
                )
                if response.is_success:
                    return response.json().get("data", {"driver_id": driver_id, "status": "SUSPENDED"})
            except httpx.HTTPError:
                pass
        return {"driver_id": driver_id, "status": "SUSPENDED"}

    async def get_driver_stats(self, driver_id: str, auth_header: str | None) -> dict:
        async with httpx.AsyncClient(timeout=10.0) as client:
            try:
                response = await client.get(
                    f"{settings.marketplace_service_url}/api/v1/internal/admin/drivers/{driver_id}/stats",
                    headers={"Authorization": auth_header} if auth_header else {},
                )
                if response.is_success:
                    return response.json().get("data", {})
            except httpx.HTTPError:
                pass
        return {
            "total_rides": 0, "total_completed_rides": 0, "total_miles": 0.0,
            "total_payout": 0.0, "today_payout": 0.0, "week_payout": 0.0,
            "month_payout": 0.0, "total_online_hours": 0.0,
        }

    async def get_driver_rides(self, driver_id: str, page: int, page_size: int, auth_header: str | None) -> dict:
        async with httpx.AsyncClient(timeout=10.0) as client:
            try:
                response = await client.get(
                    f"{settings.marketplace_service_url}/api/v1/internal/admin/drivers/{driver_id}/rides",
                    params={"page": page, "page_size": page_size},
                    headers={"Authorization": auth_header} if auth_header else {},
                )
                if response.is_success:
                    return response.json().get("data", {"items": [], "pagination": {"page": 1, "page_size": 20, "total_items": 0, "total_pages": 0}})
            except httpx.HTTPError:
                pass
        return {"items": [], "pagination": {"page": page, "page_size": page_size, "total_items": 0, "total_pages": 0}}

    async def get_driver_payouts(self, driver_id: str, page: int, page_size: int, auth_header: str | None) -> dict:
        rides_payload = await self.get_driver_rides(driver_id, page, page_size, auth_header)
        items = []
        for ride in rides_payload.get("items", []):
            amount = ride.get("driver_payout_amount")
            if amount is None:
                continue
            status = "COMPLETED" if ride.get("status") == "RIDE_COMPLETED" else "PENDING"
            items.append(
                {
                    "id": str(ride.get("ride_id")),
                    "created_at": ride.get("completed_at") or ride.get("requested_at"),
                    "amount": float(amount),
                    "method": "Driver payout",
                    "status": status,
                }
            )
        return {
            "items": items,
            "total": rides_payload.get("pagination", {}).get("total_items", len(items)),
        }

    async def list_active_rides(self, auth_header: str | None, params: dict) -> list[dict]:
        async with httpx.AsyncClient(timeout=5.0) as client:
            try:
                response = await client.get(
                    f"{settings.marketplace_service_url}/api/v1/internal/admin/rides/active",
                    params=params,
                    headers={"Authorization": auth_header} if auth_header else {},
                )
                if response.is_success:
                    return response.json().get("data", [])
            except httpx.HTTPError:
                pass
        return []

    async def get_unmatched_rides_report(self, auth_header: str | None) -> dict:
        async with httpx.AsyncClient(timeout=5.0) as client:
            try:
                response = await client.get(
                    f"{settings.marketplace_service_url}/api/v1/internal/admin/rides/unmatched-report",
                    headers={"Authorization": auth_header} if auth_header else {},
                )
                if response.is_success:
                    return response.json().get("data", {"total_unmatched_rides": 0, "max_dispatch_retries": 0, "items": []})
            except httpx.HTTPError:
                pass
        return {"total_unmatched_rides": 0, "max_dispatch_retries": 0, "items": []}


driver_admin_service = DriverAdminService()
