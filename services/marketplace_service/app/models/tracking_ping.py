from __future__ import annotations

from datetime import datetime
from decimal import Decimal

from sqlalchemy import DateTime, ForeignKey, Numeric, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, UUIDPrimaryKeyMixin


class TrackingPing(UUIDPrimaryKeyMixin, Base):
    __tablename__ = "tracking_pings"
    __table_args__ = {"schema": "marketplace_schema"}

    ride_id: Mapped[str | None] = mapped_column(ForeignKey("marketplace_schema.rides.id", ondelete="SET NULL"), nullable=True)
    driver_id: Mapped[str] = mapped_column(ForeignKey("marketplace_schema.drivers.id", ondelete="CASCADE"), nullable=False)
    latitude: Mapped[Decimal] = mapped_column(Numeric(10, 7), nullable=False)
    longitude: Mapped[Decimal] = mapped_column(Numeric(10, 7), nullable=False)
    heading: Mapped[Decimal | None] = mapped_column(Numeric(6, 2), nullable=True)
    speed_mph: Mapped[Decimal | None] = mapped_column(Numeric(6, 2), nullable=True)
    accuracy_meters: Mapped[Decimal | None] = mapped_column(Numeric(6, 2), nullable=True)
    recorded_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())
