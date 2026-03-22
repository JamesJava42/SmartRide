from __future__ import annotations

from datetime import datetime
from decimal import Decimal

from sqlalchemy import Boolean, DateTime, Numeric, String, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class PricingRateCard(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "pricing_rate_cards"
    __table_args__ = {"schema": "marketplace_schema"}

    region_id: Mapped[str] = mapped_column(UUID(as_uuid=False), nullable=False)
    vehicle_type: Mapped[str] = mapped_column(String(32), nullable=False)
    base_fare: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    per_mile_rate: Mapped[Decimal] = mapped_column(Numeric(10, 4), nullable=False)
    per_minute_rate: Mapped[Decimal] = mapped_column(Numeric(10, 4), nullable=False)
    minimum_fare: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    booking_fee: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False, server_default="0.00")
    platform_fee: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False, server_default="0.00")
    driver_payout_percent: Mapped[Decimal | None] = mapped_column(Numeric(5, 2), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default=text("true"))
    effective_from: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    effective_to: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
