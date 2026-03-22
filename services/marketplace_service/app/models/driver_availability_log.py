from __future__ import annotations

from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, UUIDPrimaryKeyMixin


class DriverAvailabilityLog(UUIDPrimaryKeyMixin, Base):
    __tablename__ = "driver_availability_logs"
    __table_args__ = {"schema": "marketplace_schema"}

    driver_id: Mapped[str] = mapped_column(ForeignKey("marketplace_schema.drivers.id", ondelete="CASCADE"), nullable=False)
    is_online: Mapped[bool] = mapped_column(Boolean, nullable=False)
    is_available: Mapped[bool] = mapped_column(Boolean, nullable=False)
    reason: Mapped[str | None] = mapped_column(String(64), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())
