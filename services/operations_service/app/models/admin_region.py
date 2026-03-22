from __future__ import annotations

from datetime import datetime

from sqlalchemy import DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, UUIDPrimaryKeyMixin


class AdminRegion(UUIDPrimaryKeyMixin, Base):
    __tablename__ = "admin_regions"
    __table_args__ = {"schema": "operations_schema"}

    admin_id: Mapped[str] = mapped_column(ForeignKey("operations_schema.admins.id", ondelete="CASCADE"), nullable=False)
    region_id: Mapped[str] = mapped_column(ForeignKey("operations_schema.regions.id", ondelete="CASCADE"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
