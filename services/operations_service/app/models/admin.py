from __future__ import annotations

from sqlalchemy import Boolean, Enum, ForeignKey, String, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.core.enums import AdminRole
from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class Admin(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "admins"
    __table_args__ = {"schema": "operations_schema"}

    user_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey("auth_schema.users.id", ondelete="CASCADE"), nullable=False, unique=True)
    display_name: Mapped[str] = mapped_column(String(100), nullable=False)
    admin_role: Mapped[AdminRole] = mapped_column(Enum(AdminRole, name="admin_role"), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default=text("true"))
