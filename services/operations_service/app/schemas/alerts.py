from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel

from app.core.enums import AlertSeverity


class AdminAlertResponse(BaseModel):
    id: str
    alert_type: str
    severity: AlertSeverity
    title: str
    message: str
    source_service: str | None = None
    region_id: str | None = None
    is_resolved: bool
    resolved_at: datetime | None = None
    created_at: datetime


class AdminAlertListResponse(BaseModel):
    items: list[AdminAlertResponse]


class InternalAlertReportRequest(BaseModel):
    alert_type: str
    severity: AlertSeverity
    title: str
    message: str
    source_service: str
    region_id: str | None = None
