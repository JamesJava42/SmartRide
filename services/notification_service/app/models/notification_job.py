from __future__ import annotations

from datetime import datetime

from sqlalchemy import DateTime, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class NotificationJob(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "notification_jobs"
    __table_args__ = {"schema": "notification_schema"}

    event_type: Mapped[str] = mapped_column(String(64), nullable=False)
    recipient_type: Mapped[str] = mapped_column(String(32), nullable=False)
    recipient_id: Mapped[str] = mapped_column(UUID(as_uuid=False), nullable=False)
    channel: Mapped[str] = mapped_column(String(32), nullable=False)
    subject: Mapped[str | None] = mapped_column(String(255), nullable=True)
    body_template: Mapped[str | None] = mapped_column(String(128), nullable=True)
    payload_json: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    status: Mapped[str] = mapped_column(String(32), nullable=False)
    scheduled_for: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    sent_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    failed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    failure_reason: Mapped[str | None] = mapped_column(Text, nullable=True)
