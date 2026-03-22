from __future__ import annotations

from datetime import datetime

from sqlalchemy import Boolean, DateTime, Enum, ForeignKey, String, Text, text
from sqlalchemy.orm import Mapped, mapped_column

from app.core.enums import AlertSeverity
from app.db.base import Base, UUIDPrimaryKeyMixin


class AdminAlert(UUIDPrimaryKeyMixin, Base):
    __tablename__ = "admin_alerts"
    __table_args__ = {"schema": "operations_schema"}

    region_id: Mapped[str | None] = mapped_column(ForeignKey("operations_schema.regions.id", ondelete="SET NULL"), nullable=True)
    alert_type: Mapped[str] = mapped_column(String(64), nullable=False)
    severity: Mapped[AlertSeverity] = mapped_column(Enum(AlertSeverity, name="alert_severity"), nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    is_resolved: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default=text("false"))
    resolved_by_admin_id: Mapped[str | None] = mapped_column(ForeignKey("operations_schema.admins.id", ondelete="SET NULL"), nullable=True)
    resolved_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
