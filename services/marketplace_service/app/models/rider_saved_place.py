from __future__ import annotations

from decimal import Decimal

from sqlalchemy import ForeignKey, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class RiderSavedPlace(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "rider_saved_places"
    __table_args__ = {"schema": "marketplace_schema"}

    rider_id: Mapped[str] = mapped_column(ForeignKey("marketplace_schema.riders.id", ondelete="CASCADE"), nullable=False)
    label: Mapped[str] = mapped_column(String(64), nullable=False)
    address_line: Mapped[str] = mapped_column(String(255), nullable=False)
    latitude: Mapped[Decimal] = mapped_column(Numeric(10, 7), nullable=False)
    longitude: Mapped[Decimal] = mapped_column(Numeric(10, 7), nullable=False)
    place_provider_id: Mapped[str | None] = mapped_column(String(128), nullable=True)

    rider = relationship("Rider", back_populates="saved_places")
