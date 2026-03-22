from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import require_role
from app.db.session import get_db_session
from app.services.notification_service import notification_service
from shared.python.enums.roles import UserRole
from shared.python.schemas.responses import SuccessResponse

router = APIRouter(prefix="/api/v1/notifications", tags=["notifications"])


@router.get("/jobs", response_model=SuccessResponse)
async def list_notification_jobs(
    page: int = 1,
    page_size: int = 20,
    db: AsyncSession = Depends(get_db_session),
    _admin=Depends(require_role(UserRole.ADMIN)),
):
    return SuccessResponse(data=await notification_service.list_jobs(db, page, min(page_size, 100)))
