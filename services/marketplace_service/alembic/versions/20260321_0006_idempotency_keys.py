"""add marketplace idempotency keys

Revision ID: 20260321_0006
Revises: 20260321_0005
Create Date: 2026-03-21 18:30:00
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision = "20260321_0006"
down_revision = "20260321_0005"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "idempotency_keys",
        sa.Column("actor_user_id", sa.String(length=36), nullable=False),
        sa.Column("action_scope", sa.String(length=64), nullable=False),
        sa.Column("idempotency_key", sa.String(length=128), nullable=False),
        sa.Column("request_hash", sa.String(length=64), nullable=False),
        sa.Column("response_json", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("id", postgresql.UUID(as_uuid=False), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("actor_user_id", "action_scope", "idempotency_key", name="uq_idempotency_actor_scope_key"),
        schema="marketplace_schema",
    )


def downgrade() -> None:
    op.drop_table("idempotency_keys", schema="marketplace_schema")
