from sqlalchemy import Column, Table
from sqlalchemy.dialects.postgresql import UUID

from shared.python.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin

Table(
    "users",
    Base.metadata,
    Column("id", UUID(as_uuid=False), primary_key=True),
    schema="auth_schema",
    extend_existing=True,
)

__all__ = ["Base", "TimestampMixin", "UUIDPrimaryKeyMixin"]
