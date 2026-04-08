from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, Field, model_validator

from shared.python.enums.roles import UserRole


class SignUpRequest(BaseModel):
    email: str | None = None
    phone_number: str | None = None
    password: str = Field(min_length=8, max_length=128)
    role: UserRole

    @model_validator(mode="after")
    def validate_identity_and_role(self) -> "SignUpRequest":
        # Treat empty strings as None so duplicate checks and DB constraints work
        if self.email is not None and not self.email.strip():
            self.email = None
        if self.phone_number is not None and not self.phone_number.strip():
            self.phone_number = None
        if not self.email and not self.phone_number:
            raise ValueError("Either email or phone_number must be provided")
        return self


class LoginRequest(BaseModel):
    email_or_phone: str
    password: str = Field(min_length=8, max_length=128)


class RefreshRequest(BaseModel):
    refresh_token: str


class TokenPayload(BaseModel):
    user_id: str
    role: UserRole
    token_type: str
    exp: int


class AuthUserResponse(BaseModel):
    user_id: str
    role: UserRole
    is_active: bool


class AuthTokensResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: AuthUserResponse


class GoogleLoginRequest(BaseModel):
    id_token: str
    role: UserRole = UserRole.RIDER


class RefreshTokenRecord(BaseModel):
    user_id: str
    token_hash: str
    expires_at: datetime
    revoked_at: datetime | None = None
