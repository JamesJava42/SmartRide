from __future__ import annotations

from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, UUIDPrimaryKeyMixin


class NotificationDeliveryLog(UUIDPrimaryKeyMixin, Base):
    __tablename__ = "notification_delivery_logs"
    __table_args__ = {"schema": "notification_schema"}

    notification_job_id: Mapped[str] = mapped_column(
        ForeignKey("notification_schema.notification_jobs.id", ondelete="CASCADE"),
        nullable=False,
    )
    provider: Mapped[str | None] = mapped_column(String(64), nullable=True)
    provider_message_id: Mapped[str | None] = mapped_column(String(128), nullable=True)
    delivery_status: Mapped[str] = mapped_column(String(32), nullable=False)
    delivery_payload: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())
