from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import TokenPayload, require_role
from app.db.session import get_db_session
from app.services.audit_service import audit_service
from shared.python.enums.roles import UserRole
from shared.python.schemas.responses import SuccessResponse

router = APIRouter(prefix="/api/v1/admin/audit-logs", tags=["admin-audit-logs"])


@router.get("", response_model=SuccessResponse)
async def list_audit_logs(
    _user: TokenPayload = Depends(require_role(UserRole.ADMIN)),
    db: AsyncSession = Depends(get_db_session),
) -> SuccessResponse:
    logs = await audit_service.list_logs(db)
    data = [
        {
            "id": log.id,
            "admin_id": log.admin_id,
            "action_type": log.action_type,
            "entity_type": log.entity_type,
            "entity_id": log.entity_id,
            "details_json": log.details_json,
            "created_at": log.created_at,
        }
        for log in logs
    ]
    return SuccessResponse(data=data)
