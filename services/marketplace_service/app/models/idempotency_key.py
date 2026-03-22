from __future__ import annotations

from sqlalchemy import String, UniqueConstraint
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class IdempotencyKey(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "idempotency_keys"
    __table_args__ = (
        UniqueConstraint("actor_user_id", "action_scope", "idempotency_key", name="uq_idempotency_actor_scope_key"),
        {"schema": "marketplace_schema"},
    )

    actor_user_id: Mapped[str] = mapped_column(String(36), nullable=False)
    action_scope: Mapped[str] = mapped_column(String(64), nullable=False)
    idempotency_key: Mapped[str] = mapped_column(String(128), nullable=False)
    request_hash: Mapped[str] = mapped_column(String(64), nullable=False)
    response_json: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
