from __future__ import annotations

from datetime import datetime
from decimal import Decimal

from sqlalchemy import Boolean, DateTime, Enum, ForeignKey, Integer, Numeric, SmallInteger, String, Text, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.enums import CancelledBy, RideFeedbackStatus, RideStatus, RideType
from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class Ride(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "rides"
    __table_args__ = {"schema": "marketplace_schema"}

    rider_id: Mapped[str] = mapped_column(ForeignKey("marketplace_schema.riders.id", ondelete="CASCADE"), nullable=False)
    driver_id: Mapped[str | None] = mapped_column(ForeignKey("marketplace_schema.drivers.id", ondelete="SET NULL"), nullable=True)
    vehicle_id: Mapped[str | None] = mapped_column(ForeignKey("marketplace_schema.vehicles.id", ondelete="SET NULL"), nullable=True)
    region_id: Mapped[str | None] = mapped_column(UUID(as_uuid=False), nullable=True)
    status: Mapped[RideStatus] = mapped_column(Enum(RideStatus, name="ride_status"), nullable=False)
    ride_type: Mapped[RideType] = mapped_column(Enum(RideType, name="ride_type"), nullable=False)
    pickup_address: Mapped[str] = mapped_column(String(255), nullable=False)
    pickup_latitude: Mapped[Decimal] = mapped_column(Numeric(10, 7), nullable=False)
    pickup_longitude: Mapped[Decimal] = mapped_column(Numeric(10, 7), nullable=False)
    dropoff_address: Mapped[str] = mapped_column(String(255), nullable=False)
    dropoff_latitude: Mapped[Decimal] = mapped_column(Numeric(10, 7), nullable=False)
    dropoff_longitude: Mapped[Decimal] = mapped_column(Numeric(10, 7), nullable=False)
    payment_method: Mapped[str] = mapped_column(String(64), nullable=False, server_default="CASH", default="CASH")
    requested_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    assigned_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    driver_en_route_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    driver_arrived_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    started_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    cancelled_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    cancelled_by: Mapped[CancelledBy | None] = mapped_column(Enum(CancelledBy, name="cancelled_by_actor"), nullable=True)
    cancel_reason: Mapped[str | None] = mapped_column(Text, nullable=True)
    estimated_distance_miles: Mapped[Decimal | None] = mapped_column(Numeric(10, 2), nullable=True)
    estimated_duration_minutes: Mapped[int | None] = mapped_column(Integer, nullable=True)
    dispatch_retry_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0, server_default="0")
    actual_distance_miles: Mapped[Decimal | None] = mapped_column(Numeric(10, 2), nullable=True)
    actual_duration_minutes: Mapped[int | None] = mapped_column(Integer, nullable=True)
    fare_estimate_id: Mapped[str | None] = mapped_column(ForeignKey("marketplace_schema.fare_estimates.id", ondelete="SET NULL"), nullable=True)
    final_fare_amount: Mapped[Decimal | None] = mapped_column(Numeric(10, 2), nullable=True)
    driver_payout_amount: Mapped[Decimal | None] = mapped_column(Numeric(10, 2), nullable=True)
    rider_rating: Mapped[int | None] = mapped_column(SmallInteger, nullable=True)
    rider_comment: Mapped[str | None] = mapped_column(Text, nullable=True)
    feedback_status: Mapped[RideFeedbackStatus] = mapped_column(
        Enum(RideFeedbackStatus, name="ride_feedback_status"),
        nullable=False,
        server_default=text("'PENDING'"),
        default=RideFeedbackStatus.PENDING,
    )
    completion_acknowledged: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default=text("false"), default=False)

    rider = relationship("Rider", back_populates="rides")
    driver = relationship("Driver")
    vehicle = relationship("Vehicle")
