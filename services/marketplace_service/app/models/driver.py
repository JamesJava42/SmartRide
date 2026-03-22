from __future__ import annotations

from decimal import Decimal

from sqlalchemy import Boolean, Enum, ForeignKey, Integer, Numeric, String, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.enums import DriverStatus
from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class Driver(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "drivers"
    __table_args__ = {"schema": "marketplace_schema"}

    user_id: Mapped[str] = mapped_column(ForeignKey("auth_schema.users.id", ondelete="CASCADE"), nullable=False, unique=True)
    first_name: Mapped[str] = mapped_column(String(100), nullable=False)
    last_name: Mapped[str | None] = mapped_column(String(100), nullable=True)
    phone_number: Mapped[str] = mapped_column(String(32), nullable=False)
    region_id: Mapped[str | None] = mapped_column(UUID(as_uuid=False), nullable=True)
    status: Mapped[DriverStatus] = mapped_column(Enum(DriverStatus, name="driver_status"), nullable=False)
    is_online: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default=text("false"))
    is_available: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default=text("false"))
    is_approved: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default=text("false"))
    rating_avg: Mapped[Decimal | None] = mapped_column(Numeric(3, 2), nullable=True)
    total_rides_completed: Mapped[int] = mapped_column(Integer, nullable=False, server_default=text("0"))

    vehicles = relationship("Vehicle", back_populates="driver", cascade="all, delete-orphan")
    offers = relationship("DriverOffer", back_populates="driver")
