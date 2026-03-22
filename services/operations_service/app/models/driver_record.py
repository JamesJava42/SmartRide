from __future__ import annotations

from decimal import Decimal

from sqlalchemy import Boolean, Integer, Numeric, String, text
from sqlalchemy.dialects.postgresql import ENUM, UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin

# Reference the existing enum type without letting SQLAlchemy manage it
# (enum lives in public schema / default search path, not in marketplace_schema)
_driver_status_enum = ENUM(
    "PENDING_APPROVAL", "ACTIVE", "SUSPENDED", "INACTIVE",
    name="driver_status", create_type=False,
)


class DriverRecord(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """Read/write access to marketplace_schema.drivers."""

    __tablename__ = "drivers"
    __table_args__ = {"schema": "marketplace_schema"}

    user_id: Mapped[str] = mapped_column(UUID(as_uuid=False), nullable=False, unique=True)
    first_name: Mapped[str] = mapped_column(String(100), nullable=False)
    last_name: Mapped[str | None] = mapped_column(String(100), nullable=True)
    phone_number: Mapped[str] = mapped_column(String(32), nullable=False)
    region_id: Mapped[str | None] = mapped_column(UUID(as_uuid=False), nullable=True)
    status: Mapped[str] = mapped_column(_driver_status_enum, nullable=False)
    is_online: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default=text("false"))
    is_available: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default=text("false"))
    is_approved: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default=text("false"))
    rating_avg: Mapped[Decimal | None] = mapped_column(Numeric(3, 2), nullable=True)
    total_rides_completed: Mapped[int] = mapped_column(Integer, nullable=False, server_default=text("0"))
