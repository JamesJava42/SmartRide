from __future__ import annotations

from collections.abc import Callable

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

from app.schemas.auth import TokenPayload
from app.services.token_service import token_service
from shared.python.enums.roles import UserRole

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


async def get_current_user(token: str = Depends(oauth2_scheme)) -> TokenPayload:
    try:
        payload = token_service.verify_token(token)
    except ValueError as exc:
        code = str(exc)
        detail = "JWT expired" if code == "TOKEN_EXPIRED" else "JWT invalid"
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=detail) from exc
    if payload.token_type != "access":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="JWT invalid")
    return payload


def require_role(*roles: UserRole) -> Callable:
    async def dependency(user: TokenPayload = Depends(get_current_user)) -> TokenPayload:
        if user.role not in roles:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")
        return user

    return dependency
