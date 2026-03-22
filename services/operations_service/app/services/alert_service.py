from __future__ import annotations

from datetime import datetime, timezone

import httpx
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.core.enums import AlertSeverity
from app.models import AdminAlert
from app.schemas.alerts import AdminAlertListResponse, AdminAlertResponse, InternalAlertReportRequest


class AlertService:
    async def list_alerts(self, db: AsyncSession, auth_header: str | None, *, include_resolved: bool = False) -> AdminAlertListResponse:
        await self.refresh_live_alerts(db, auth_header)
        statement = select(AdminAlert).order_by(AdminAlert.is_resolved.asc(), AdminAlert.created_at.desc())
        if not include_resolved:
            statement = statement.where(AdminAlert.is_resolved.is_(False))
        alerts = (await db.execute(statement)).scalars().all()
        return AdminAlertListResponse(items=[self._serialize(alert) for alert in alerts])

    async def create_reported_alert(self, db: AsyncSession, payload: InternalAlertReportRequest) -> AdminAlertResponse:
        alert = await self._upsert_alert(
            db,
            alert_type=payload.alert_type,
            severity=payload.severity,
            title=payload.title,
            message=payload.message,
            region_id=payload.region_id,
            source_service=payload.source_service,
        )
        await db.commit()
        return self._serialize(alert)

    async def refresh_live_alerts(self, db: AsyncSession, auth_header: str | None) -> None:
        await self._refresh_service_health_alerts(db)
        await self._refresh_dispatch_failure_alert(db, auth_header)
        await db.commit()

    async def _refresh_service_health_alerts(self, db: AsyncSession) -> None:
        services = [
            ("auth_service", settings.auth_service_url),
            ("marketplace_service", settings.marketplace_service_url),
            ("notification_service", settings.notification_service_url),
        ]
        async with httpx.AsyncClient(timeout=2.5) as client:
            for service_name, service_url in services:
                is_healthy = False
                try:
                    response = await client.get(f"{service_url.rstrip('/')}/api/v1/health")
                    is_healthy = response.is_success
                except httpx.HTTPError:
                    is_healthy = False

                if is_healthy:
                    await self._resolve_alert(db, alert_type="SERVICE_DOWNTIME", title=f"{service_name} is unavailable")
                else:
                    await self._upsert_alert(
                        db,
                        alert_type="SERVICE_DOWNTIME",
                        severity=AlertSeverity.CRITICAL,
                        title=f"{service_name} is unavailable",
                        message=f"{service_name} health check failed. Admin actions depending on this service may be degraded.",
                        source_service=service_name,
                    )

    async def _refresh_dispatch_failure_alert(self, db: AsyncSession, auth_header: str | None) -> None:
        no_driver_found_count = 0
        try:
            async with httpx.AsyncClient(timeout=4.0) as client:
                response = await client.get(
                    f"{settings.marketplace_service_url.rstrip('/')}/api/v1/internal/admin/rides/active",
                    headers={"Authorization": auth_header} if auth_header else {},
                )
                if response.is_success:
                    rides = response.json().get("data", [])
                    no_driver_found_count = len(
                        [ride for ride in rides if str(ride.get("status", "")).upper() == "NO_DRIVERS_FOUND"]
                    )
        except httpx.HTTPError:
            no_driver_found_count = 0

        if no_driver_found_count:
            await self._upsert_alert(
                db,
                alert_type="DISPATCH_FAILURE",
                severity=AlertSeverity.HIGH,
                title="Dispatch failures require attention",
                message=f"{no_driver_found_count} ride(s) are in NO_DRIVERS_FOUND and may need manual redispatch.",
                source_service="marketplace_service",
            )
        else:
            await self._resolve_alert(db, alert_type="DISPATCH_FAILURE", title="Dispatch failures require attention")

    async def record_database_error(
        self,
        db: AsyncSession,
        *,
        source_service: str,
        message: str,
    ) -> AdminAlert:
        return await self._upsert_alert(
            db,
            alert_type="DATABASE_ERROR",
            severity=AlertSeverity.CRITICAL,
            title=f"{source_service} database error",
            message=message,
            source_service=source_service,
        )

    async def _upsert_alert(
        self,
        db: AsyncSession,
        *,
        alert_type: str,
        severity: AlertSeverity,
        title: str,
        message: str,
        source_service: str,
        region_id: str | None = None,
    ) -> AdminAlert:
        existing = await db.scalar(
            select(AdminAlert).where(
                AdminAlert.alert_type == alert_type,
                AdminAlert.title == title,
                AdminAlert.is_resolved.is_(False),
            )
        )
        metadata_message = f"[source_service={source_service}] {message}"
        if existing:
            existing.severity = severity
            existing.message = metadata_message
            existing.region_id = region_id
            db.add(existing)
            return existing

        alert = AdminAlert(
            alert_type=alert_type,
            severity=severity,
            title=title,
            message=metadata_message,
            region_id=region_id,
            is_resolved=False,
            created_at=datetime.now(timezone.utc),
        )
        db.add(alert)
        await db.flush()
        return alert

    async def _resolve_alert(self, db: AsyncSession, *, alert_type: str, title: str) -> None:
        existing = await db.scalar(
            select(AdminAlert).where(
                AdminAlert.alert_type == alert_type,
                AdminAlert.title == title,
                AdminAlert.is_resolved.is_(False),
            )
        )
        if not existing:
            return
        existing.is_resolved = True
        existing.resolved_at = datetime.now(timezone.utc)
        db.add(existing)

    @staticmethod
    def _serialize(alert: AdminAlert) -> AdminAlertResponse:
        source_service = None
        if alert.message.startswith("[source_service="):
            prefix, _, remainder = alert.message.partition("] ")
            source_service = prefix.removeprefix("[source_service=").strip()
            message = remainder or alert.message
        else:
            message = alert.message
        return AdminAlertResponse(
            id=str(alert.id),
            alert_type=alert.alert_type,
            severity=alert.severity,
            title=alert.title,
            message=message,
            source_service=source_service,
            region_id=str(alert.region_id) if alert.region_id else None,
            is_resolved=alert.is_resolved,
            resolved_at=alert.resolved_at,
            created_at=alert.created_at,
        )


alert_service = AlertService()
