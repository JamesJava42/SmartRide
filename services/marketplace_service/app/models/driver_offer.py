from __future__ import annotations

from datetime import datetime

from sqlalchemy import DateTime, Enum, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.enums import OfferStatus
from app.db.base import Base, UUIDPrimaryKeyMixin


class DriverOffer(UUIDPrimaryKeyMixin, Base):
    __tablename__ = "driver_offers"
    __table_args__ = {"schema": "marketplace_schema"}

    ride_id: Mapped[str] = mapped_column(ForeignKey("marketplace_schema.rides.id", ondelete="CASCADE"), nullable=False)
    driver_id: Mapped[str] = mapped_column(ForeignKey("marketplace_schema.drivers.id", ondelete="CASCADE"), nullable=False)
    offer_status: Mapped[OfferStatus] = mapped_column(Enum(OfferStatus, name="offer_status"), nullable=False)
    offered_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    responded_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    driver = relationship("Driver", back_populates="offers")
