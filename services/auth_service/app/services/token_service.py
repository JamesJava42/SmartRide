from __future__ import annotations

import hashlib
import secrets
from datetime import datetime, timedelta, timezone

from jose import JWTError, ExpiredSignatureError, jwt

from app.config import settings
from app.schemas.auth import TokenPayload
from shared.python.enums.roles import UserRole


class TokenService:
    def _encode(self, payload: dict) -> str:
        return jwt.encode(payload, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)

    def generate_access_token(self, user_id: str, role: UserRole) -> str:
        expires_at = datetime.now(timezone.utc) + timedelta(minutes=settings.jwt_access_token_expire_minutes)
        payload = {
            "sub": user_id,
            "role": role.value,
            "token_type": "access",
            "iss": settings.jwt_issuer,
            "exp": int(expires_at.timestamp()),
        }
        return self._encode(payload)

    def generate_refresh_token(self, user_id: str, role: UserRole) -> tuple[str, datetime]:
        expires_at = datetime.now(timezone.utc) + timedelta(days=settings.jwt_refresh_token_expire_days)
        payload = {
            "sub": user_id,
            "role": role.value,
            "token_type": "refresh",
            "jti": secrets.token_urlsafe(24),
            "iss": settings.jwt_issuer,
            "exp": int(expires_at.timestamp()),
        }
        return self._encode(payload), expires_at

    def verify_token(self, token: str) -> TokenPayload:
        try:
            data = jwt.decode(
                token,
                settings.jwt_secret_key,
                algorithms=[settings.jwt_algorithm],
                issuer=settings.jwt_issuer,
            )
        except ExpiredSignatureError as exc:
            raise ValueError("TOKEN_EXPIRED") from exc
        except JWTError as exc:
            raise ValueError("TOKEN_INVALID") from exc

        return TokenPayload(
            user_id=data["sub"],
            role=UserRole(data["role"]),
            token_type=data["token_type"],
            exp=int(data["exp"]),
        )

    def decode_claims(self, token: str) -> dict:
        return jwt.get_unverified_claims(token)

    def hash_token(self, token: str) -> str:
        return hashlib.sha256(token.encode("utf-8")).hexdigest()


token_service = TokenService()
