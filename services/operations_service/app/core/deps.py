from __future__ import annotations

from collections.abc import Callable

from fastapi import Depends, HTTPException, Query, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, ExpiredSignatureError, jwt

from app.config import settings
from shared.python.enums.roles import UserRole

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/admin/auth/login")
optional_oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/admin/auth/login", auto_error=False)


class TokenPayload:
    def __init__(self, user_id: str, role: UserRole):
        self.user_id = user_id
        self.role = role


def decode_token(token: str) -> TokenPayload:
    try:
        payload = jwt.decode(
            token,
            settings.jwt_secret_key,
            algorithms=[settings.jwt_algorithm],
            issuer=settings.jwt_issuer,
        )
    except ExpiredSignatureError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="JWT expired") from exc
    except JWTError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="JWT invalid") from exc

    try:
        role = UserRole(payload["role"])
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="JWT invalid") from exc

    return TokenPayload(user_id=payload["sub"], role=role)


async def get_current_user(token: str = Depends(oauth2_scheme)) -> TokenPayload:
    return decode_token(token)


async def get_current_user_from_header_or_query(
    token: str | None = Depends(optional_oauth2_scheme),
    access_token: str | None = Query(default=None, alias="access_token"),
) -> TokenPayload:
    resolved_token = token or access_token
    if not resolved_token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    return decode_token(resolved_token)


def require_role(*roles: UserRole) -> Callable:
    async def dependency(user: TokenPayload = Depends(get_current_user)) -> TokenPayload:
        if user.role not in roles:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")
        return user

    return dependency


def require_role_from_header_or_query(*roles: UserRole) -> Callable:
    async def dependency(user: TokenPayload = Depends(get_current_user_from_header_or_query)) -> TokenPayload:
        if user.role not in roles:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")
        return user

    return dependency
