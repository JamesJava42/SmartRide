from __future__ import annotations

from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import RefreshToken, User
from app.schemas.auth import AuthTokensResponse, AuthUserResponse, LoginRequest, SignUpRequest
from app.schemas.user import CurrentUserResponse
from app.services.alert_reporter import report_auth_failure
from app.services.password_service import password_service
from app.services.token_service import token_service
from shared.python.enums.roles import UserRole


class AuthService:
    async def signup(self, db: AsyncSession, payload: SignUpRequest) -> AuthUserResponse:
        if payload.role == UserRole.ADMIN:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin accounts cannot be created via signup")

        conditions = []
        if payload.email:
            conditions.append(User.email == payload.email)
        if payload.phone_number:
            conditions.append(User.phone_number == payload.phone_number)

        existing = await db.scalar(select(User).where(or_(*conditions)))
        if existing:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Account already exists")

        user = User(
            email=payload.email,
            phone_number=payload.phone_number,
            password_hash=password_service.hash_password(payload.password),
            role=payload.role,
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)
        return self._serialize_user(user)

    async def login(
        self,
        db: AsyncSession,
        payload: LoginRequest,
        *,
        expected_role: UserRole | None = None,
    ) -> AuthTokensResponse:
        user = await db.scalar(
            select(User).where(or_(User.email == payload.email_or_phone, User.phone_number == payload.email_or_phone))
        )
        if not user or not password_service.verify_password(payload.password, user.password_hash):
            await report_auth_failure(f"Invalid credentials for identifier {payload.email_or_phone}")
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
        if expected_role is not None and user.role != expected_role:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")
        if not user.is_active:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is inactive")

        access_token = token_service.generate_access_token(user.id, user.role)
        refresh_token, refresh_expires_at = token_service.generate_refresh_token(user.id, user.role)
        db.add(
            RefreshToken(
                user_id=user.id,
                token_hash=token_service.hash_token(refresh_token),
                expires_at=refresh_expires_at,
                created_at=datetime.now(timezone.utc),
            )
        )
        user.last_login_at = datetime.now(timezone.utc)
        db.add(user)
        await db.commit()

        return AuthTokensResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            user=self._serialize_user(user),
        )

    async def refresh(self, db: AsyncSession, refresh_token: str) -> AuthTokensResponse:
        payload = token_service.verify_token(refresh_token)
        if payload.token_type != "refresh":
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")

        stored = await db.scalar(select(RefreshToken).where(RefreshToken.token_hash == token_service.hash_token(refresh_token)))
        if not stored or stored.revoked_at is not None or stored.expires_at < datetime.now(timezone.utc):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token expired")

        user = await db.get(User, payload.user_id)
        if not user or not user.is_active:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")

        stored.revoked_at = datetime.now(timezone.utc)
        db.add(stored)

        access_token = token_service.generate_access_token(user.id, user.role)
        new_refresh_token, refresh_expires_at = token_service.generate_refresh_token(user.id, user.role)
        db.add(
            RefreshToken(
                user_id=user.id,
                token_hash=token_service.hash_token(new_refresh_token),
                expires_at=refresh_expires_at,
                created_at=datetime.now(timezone.utc),
            )
        )
        await db.commit()

        return AuthTokensResponse(
            access_token=access_token,
            refresh_token=new_refresh_token,
            user=self._serialize_user(user),
        )

    async def get_current_user(self, db: AsyncSession, user_id: str) -> CurrentUserResponse:
        user = await db.get(User, user_id)
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        return CurrentUserResponse(
            user_id=user.id,
            email=user.email,
            phone_number=user.phone_number,
            role=user.role,
            is_active=user.is_active,
        )

    def _serialize_user(self, user: User) -> AuthUserResponse:
        return AuthUserResponse(
            user_id=user.id,
            role=user.role,
            is_active=user.is_active,
        )


auth_service = AuthService()
