from __future__ import annotations

from collections.abc import Callable

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import ExpiredSignatureError, JWTError, jwt

from app.config import settings
from shared.python.enums.roles import UserRole

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


class TokenPayload:
    def __init__(self, user_id: str, role: UserRole):
        self.user_id = user_id
        self.role = role


async def get_current_user(token: str = Depends(oauth2_scheme)) -> TokenPayload:
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


def require_role(*roles: UserRole) -> Callable:
    async def dependency(user: TokenPayload = Depends(get_current_user)) -> TokenPayload:
        if user.role not in roles:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")
        return user

    return dependency
