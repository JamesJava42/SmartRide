from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db_session
from app.schemas.auth import LoginRequest
from app.services.auth_service import auth_service
from shared.python.enums.roles import UserRole
from shared.python.schemas.responses import SuccessResponse

router = APIRouter(prefix="/api/v1/admin/auth", tags=["admin-auth"])


@router.post("/login", response_model=SuccessResponse)
async def admin_login(payload: LoginRequest, db: AsyncSession = Depends(get_db_session)) -> SuccessResponse:
    auth = await auth_service.login(db, payload, expected_role=UserRole.ADMIN)
    return SuccessResponse(message="Admin login successful", data=auth.model_dump(mode="json"))
