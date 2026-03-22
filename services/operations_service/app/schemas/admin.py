from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel

from app.core.enums import AdminRole


class AdminSummary(BaseModel):
    id: str
    user_id: str
    display_name: str
    admin_role: AdminRole
    is_active: bool


class SuspendDriverRequest(BaseModel):
    reason: str


class SuspendDriverResponse(BaseModel):
    driver_id: str
    status: str


class AuditLogItem(BaseModel):
    id: str
    admin_id: str | None
    action_type: str
    entity_type: str
    entity_id: str | None
    details_json: dict | None
    created_at: datetime
