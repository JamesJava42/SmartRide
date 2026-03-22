from __future__ import annotations

from datetime import datetime

from sqlalchemy import DateTime, Enum, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.core.enums import OnboardingStatus
from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class DriverOnboardingProfile(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "driver_onboarding_profiles"
    __table_args__ = {"schema": "operations_schema"}

    driver_id: Mapped[str] = mapped_column(UUID(as_uuid=False), nullable=False, unique=True)
    region_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey("operations_schema.regions.id", ondelete="RESTRICT"), nullable=False)
    status: Mapped[OnboardingStatus] = mapped_column(Enum(OnboardingStatus, name="onboarding_status"), nullable=False)
    submitted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    review_started_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    reviewed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    reviewed_by_admin_id: Mapped[str | None] = mapped_column(UUID(as_uuid=False), ForeignKey("operations_schema.admins.id", ondelete="SET NULL"), nullable=True)
    review_notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    rejection_reason: Mapped[str | None] = mapped_column(Text, nullable=True)
