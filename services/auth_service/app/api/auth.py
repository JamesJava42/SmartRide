from __future__ import annotations

from fastapi import APIRouter, Depends, Header, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.core.deps import get_current_user
from app.db.session import get_db_session
from app.models.user import User
from app.schemas.auth import GoogleLoginRequest, LoginRequest, RefreshRequest, SignUpRequest, TokenPayload
from app.services.auth_service import auth_service
from shared.python.schemas.responses import SuccessResponse

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])


@router.post("/signup", response_model=SuccessResponse)
async def signup(payload: SignUpRequest, db: AsyncSession = Depends(get_db_session)) -> SuccessResponse:
    user = await auth_service.signup(db, payload)
    return SuccessResponse(message="Account created successfully", data={"user_id": user.user_id, "role": user.role.value})


@router.post("/login", response_model=SuccessResponse)
async def login(payload: LoginRequest, db: AsyncSession = Depends(get_db_session)) -> SuccessResponse:
    auth = await auth_service.login(db, payload)
    return SuccessResponse(message="Login successful", data=auth.model_dump(mode="json"))


@router.post("/refresh", response_model=SuccessResponse)
async def refresh(payload: RefreshRequest, db: AsyncSession = Depends(get_db_session)) -> SuccessResponse:
    auth = await auth_service.refresh(db, payload.refresh_token)
    return SuccessResponse(message="Token refreshed successfully", data=auth.model_dump(mode="json"))


@router.get("/me", response_model=SuccessResponse)
async def me(current_user: TokenPayload = Depends(get_current_user), db: AsyncSession = Depends(get_db_session)) -> SuccessResponse:
    user = await auth_service.get_current_user(db, current_user.user_id)
    return SuccessResponse(data=user.model_dump(mode="json"))


@router.post("/google", response_model=SuccessResponse)
async def google_login(payload: GoogleLoginRequest, db: AsyncSession = Depends(get_db_session)) -> SuccessResponse:
    auth = await auth_service.google_login(db, payload)
    return SuccessResponse(message="Login successful", data=auth.model_dump(mode="json"))


@router.delete("/users/{user_id}", response_model=SuccessResponse)
async def delete_user(
    user_id: str,
    db: AsyncSession = Depends(get_db_session),
    x_internal_service_token: str | None = Header(default=None, alias="X-Internal-Service-Token"),
) -> SuccessResponse:
    """Internal endpoint: delete a user by ID (used for compensating transactions)."""
    if x_internal_service_token != settings.internal_service_token:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")
    user = await db.scalar(select(User).where(User.id == user_id))
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    await db.delete(user)
    await db.commit()
    return SuccessResponse(message="User deleted")
