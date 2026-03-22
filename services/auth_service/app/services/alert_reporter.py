from __future__ import annotations

from app.config import settings
from shared.python.utils.internal_alerts import report_internal_alert


async def report_auth_failure(message: str) -> None:
    await report_internal_alert(
        operations_service_url=settings.operations_service_url,
        internal_service_token=settings.internal_service_token,
        alert_type="AUTH_FAILURE",
        severity="MEDIUM",
        title="Authentication failures detected",
        message=message,
        source_service="auth_service",
    )


async def report_database_error(message: str) -> None:
    await report_internal_alert(
        operations_service_url=settings.operations_service_url,
        internal_service_token=settings.internal_service_token,
        alert_type="DATABASE_ERROR",
        severity="CRITICAL",
        title="auth_service database error",
        message=message,
        source_service="auth_service",
    )
