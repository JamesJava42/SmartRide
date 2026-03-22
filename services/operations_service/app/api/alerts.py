from __future__ import annotations

from fastapi import APIRouter, Depends, Header, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.core.deps import TokenPayload, require_role
from app.db.session import get_db_session
from app.schemas.alerts import InternalAlertReportRequest
from app.services.alert_service import alert_service
from shared.python.enums.roles import UserRole
from shared.python.schemas.responses import SuccessResponse


router = APIRouter(prefix="/api/v1/admin/alerts", tags=["admin-alerts"])
internal_router = APIRouter(prefix="/api/v1/internal/admin-alerts", tags=["internal-admin-alerts"])


@router.get("", response_model=SuccessResponse)
async def list_admin_alerts(
    include_resolved: bool = Query(default=False),
    user: TokenPayload = Depends(require_role(UserRole.ADMIN)),
    db: AsyncSession = Depends(get_db_session),
    authorization: str | None = Header(default=None),
) -> SuccessResponse:
    response = await alert_service.list_alerts(db, authorization, include_resolved=include_resolved)
    return SuccessResponse(data=response.model_dump(mode="json"))


@internal_router.post("/report", response_model=SuccessResponse, status_code=201)
async def report_admin_alert(
    payload: InternalAlertReportRequest,
    db: AsyncSession = Depends(get_db_session),
    x_internal_service_token: str | None = Header(default=None, alias="X-Internal-Service-Token"),
) -> SuccessResponse:
    if x_internal_service_token != settings.internal_service_token:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")
    alert = await alert_service.create_reported_alert(db, payload)
    return SuccessResponse(message="Alert recorded", data=alert.model_dump(mode="json"))
