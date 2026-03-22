from __future__ import annotations

from sqlalchemy import JSON, BigInteger, Boolean, Enum, ForeignKey, String, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.core.enums import DocumentType
from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class DocumentRequirement(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "document_requirements"
    __table_args__ = {"schema": "operations_schema"}

    entity_type: Mapped[str] = mapped_column(String(50), nullable=False)
    document_type: Mapped[DocumentType] = mapped_column(Enum(DocumentType, name="document_type"), nullable=False)
    region_id: Mapped[str | None] = mapped_column(UUID(as_uuid=False), ForeignKey("operations_schema.regions.id", ondelete="CASCADE"), nullable=True)
    is_required: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default=text("true"))
    requires_expiry: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default=text("false"))
    requires_document_number: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default=text("false"))
    requires_issued_at: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default=text("false"))
    requires_issuing_state: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default=text("false"))
    requires_issuing_country: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default=text("false"))
    allowed_extensions_json: Mapped[list[str] | None] = mapped_column(JSON, nullable=True)
    max_file_size_bytes: Mapped[int | None] = mapped_column(BigInteger, nullable=True)
    validation_rules_json: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default=text("true"))
