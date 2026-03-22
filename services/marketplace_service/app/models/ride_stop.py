from __future__ import annotations

from datetime import datetime
from decimal import Decimal

from sqlalchemy import DateTime, ForeignKey, Integer, Numeric, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, UUIDPrimaryKeyMixin


class RideStop(UUIDPrimaryKeyMixin, Base):
    __tablename__ = "ride_stops"
    __table_args__ = {"schema": "marketplace_schema"}

    ride_id: Mapped[str] = mapped_column(ForeignKey("marketplace_schema.rides.id", ondelete="CASCADE"), nullable=False)
    stop_order: Mapped[int] = mapped_column(Integer, nullable=False)
    address: Mapped[str] = mapped_column(String(255), nullable=False)
    latitude: Mapped[Decimal] = mapped_column(Numeric(10, 7), nullable=False)
    longitude: Mapped[Decimal] = mapped_column(Numeric(10, 7), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())
