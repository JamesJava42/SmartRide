from __future__ import annotations

from pydantic import BaseModel

from shared.python.enums.roles import UserRole


class CurrentUserResponse(BaseModel):
    user_id: str
    email: str | None = None
    phone_number: str | None = None
    role: UserRole
    is_active: bool
