from __future__ import annotations

import logging
from typing import Any

import httpx


logger = logging.getLogger(__name__)


async def report_internal_alert(
    *,
    operations_service_url: str,
    internal_service_token: str,
    alert_type: str,
    severity: str,
    title: str,
    message: str,
    source_service: str,
    region_id: str | None = None,
    timeout: float = 3.0,
) -> None:
    try:
        async with httpx.AsyncClient(timeout=timeout) as client:
            await client.post(
                f"{operations_service_url.rstrip('/')}/api/v1/internal/admin-alerts/report",
                headers={"X-Internal-Service-Token": internal_service_token},
                json={
                    "alert_type": alert_type,
                    "severity": severity,
                    "title": title,
                    "message": message,
                    "source_service": source_service,
                    "region_id": region_id,
                },
            )
    except Exception:
        logger.exception("Failed to report internal alert", extra={"alert_type": alert_type, "source_service": source_service})
