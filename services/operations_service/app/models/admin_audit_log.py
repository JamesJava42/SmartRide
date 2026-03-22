from __future__ import annotations

from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, JSON, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, UUIDPrimaryKeyMixin


class AdminAuditLog(UUIDPrimaryKeyMixin, Base):
    __tablename__ = "admin_audit_logs"
    __table_args__ = {"schema": "operations_schema"}

    admin_id: Mapped[str | None] = mapped_column(UUID(as_uuid=False), ForeignKey("operations_schema.admins.id", ondelete="SET NULL"), nullable=True)
    action_type: Mapped[str] = mapped_column(String(64), nullable=False)
    entity_type: Mapped[str] = mapped_column(String(64), nullable=False)
    entity_id: Mapped[str | None] = mapped_column(UUID(as_uuid=False), nullable=True)
    details_json: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
