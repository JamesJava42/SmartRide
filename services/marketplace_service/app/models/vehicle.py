from __future__ import annotations

from decimal import Decimal

from sqlalchemy import Boolean, ForeignKey, Integer, Numeric, String, text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class Vehicle(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "vehicles"
    __table_args__ = {"schema": "marketplace_schema"}

    driver_id: Mapped[str] = mapped_column(ForeignKey("marketplace_schema.drivers.id", ondelete="CASCADE"), nullable=False)
    make: Mapped[str] = mapped_column(String(64), nullable=False)
    model: Mapped[str] = mapped_column(String(64), nullable=False)
    year: Mapped[int] = mapped_column(Integer, nullable=False)
    color: Mapped[str | None] = mapped_column(String(32), nullable=True)
    plate_number: Mapped[str] = mapped_column(String(32), nullable=False)
    vehicle_type: Mapped[str] = mapped_column(String(32), nullable=False)
    seat_capacity: Mapped[int] = mapped_column(Integer, nullable=False)
    fuel_type: Mapped[str | None] = mapped_column(String(32), nullable=True)
    mileage_city: Mapped[Decimal | None] = mapped_column(Numeric(6, 2), nullable=True)
    mileage_highway: Mapped[Decimal | None] = mapped_column(Numeric(6, 2), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default=text("true"))

    driver = relationship("Driver", back_populates="vehicles")
