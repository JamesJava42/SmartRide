from __future__ import annotations

from fastapi import APIRouter, Depends, Header
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import TokenPayload, require_role
from app.db.session import get_db_session
from app.services.dashboard_service import dashboard_service
from shared.python.enums.roles import UserRole
from shared.python.schemas.responses import SuccessResponse

router = APIRouter(prefix="/api/v1/admin/dashboard", tags=["admin-dashboard"])


@router.get("/summary", response_model=SuccessResponse)
async def get_dashboard_summary(
    db: AsyncSession = Depends(get_db_session),
    _user: TokenPayload = Depends(require_role(UserRole.ADMIN)),
    authorization: str | None = Header(default=None),
) -> SuccessResponse:
    summary = await dashboard_service.get_summary(db, authorization)
    return SuccessResponse(data=summary.model_dump(mode="json"))
