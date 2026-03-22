from __future__ import annotations

from datetime import datetime

from sqlalchemy import BigInteger, DateTime, Enum, ForeignKey, JSON, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.core.enums import DocumentType, VerificationStatus
from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class DriverDocument(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "driver_documents"
    __table_args__ = {"schema": "operations_schema"}

    driver_id: Mapped[str] = mapped_column(UUID(as_uuid=False), nullable=False)
    document_type: Mapped[DocumentType] = mapped_column(Enum(DocumentType, name="document_type"), nullable=False)
    file_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    file_path: Mapped[str | None] = mapped_column(Text, nullable=True)
    original_file_name: Mapped[str | None] = mapped_column(Text, nullable=True)
    mime_type: Mapped[str | None] = mapped_column(Text, nullable=True)
    file_size: Mapped[int | None] = mapped_column(BigInteger, nullable=True)
    document_number: Mapped[str | None] = mapped_column(String(255), nullable=True)
    issuing_state: Mapped[str | None] = mapped_column(String(100), nullable=True)
    issuing_country: Mapped[str | None] = mapped_column(String(100), nullable=True)
    issued_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    expires_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    verification_status: Mapped[VerificationStatus] = mapped_column(Enum(VerificationStatus, name="verification_status"), nullable=False)
    submitted_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    reviewed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    reviewed_by_admin_id: Mapped[str | None] = mapped_column(ForeignKey("operations_schema.admins.id", ondelete="SET NULL"), nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    rejection_reason: Mapped[str | None] = mapped_column(Text, nullable=True)
    metadata_json: Mapped[dict | None] = mapped_column(JSON, nullable=True)
