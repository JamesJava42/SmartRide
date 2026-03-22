from __future__ import annotations

from decimal import Decimal

from sqlalchemy import ForeignKey, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class Rider(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "riders"
    __table_args__ = {"schema": "marketplace_schema"}

    user_id: Mapped[str] = mapped_column(ForeignKey("auth_schema.users.id", ondelete="CASCADE"), nullable=False, unique=True)
    first_name: Mapped[str] = mapped_column(String(100), nullable=False)
    last_name: Mapped[str | None] = mapped_column(String(100), nullable=True)
    default_payment_method: Mapped[str | None] = mapped_column(String(64), nullable=True)
    rating_avg: Mapped[Decimal | None] = mapped_column(Numeric(3, 2), nullable=True)

    saved_places = relationship("RiderSavedPlace", back_populates="rider", cascade="all, delete-orphan")
    rides = relationship("Ride", back_populates="rider")
