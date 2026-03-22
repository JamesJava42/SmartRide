from __future__ import annotations

from datetime import datetime
from decimal import Decimal

from sqlalchemy import DateTime, ForeignKey, Integer, Numeric, String, func
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, UUIDPrimaryKeyMixin


class FareEstimate(UUIDPrimaryKeyMixin, Base):
    __tablename__ = "fare_estimates"
    __table_args__ = {"schema": "marketplace_schema"}

    ride_id: Mapped[str | None] = mapped_column(ForeignKey("marketplace_schema.rides.id", ondelete="SET NULL"), nullable=True)
    vehicle_type: Mapped[str] = mapped_column(String(32), nullable=False)
    region_id: Mapped[str | None] = mapped_column(UUID(as_uuid=False), nullable=True)
    distance_miles: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    duration_minutes: Mapped[int] = mapped_column(Integer, nullable=False)
    base_fare: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    distance_fare: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    time_fare: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    surge_multiplier: Mapped[Decimal] = mapped_column(Numeric(5, 2), nullable=False, server_default="1.00")
    booking_fee: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False, server_default="0.00")
    platform_fee: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False, server_default="0.00")
    total_estimated_fare: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    driver_payout_estimate: Mapped[Decimal | None] = mapped_column(Numeric(10, 2), nullable=True)
    pricing_snapshot: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())
