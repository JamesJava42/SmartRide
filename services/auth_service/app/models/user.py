from __future__ import annotations

from datetime import datetime

from sqlalchemy import Boolean, DateTime, Enum, String, text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin
from shared.python.enums.roles import UserRole


class User(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "users"
    __table_args__ = {"schema": "auth_schema"}

    email: Mapped[str | None] = mapped_column(String(255), unique=True, nullable=True)
    phone_number: Mapped[str | None] = mapped_column(String(32), unique=True, nullable=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[UserRole] = mapped_column(Enum(UserRole, name="user_role"), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default=text("true"))
    is_verified: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default=text("false"))
    last_login_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
