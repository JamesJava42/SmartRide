"""upgrade notification payload columns to jsonb

Revision ID: 20260321_0002
Revises: 20260315_0001
Create Date: 2026-03-21
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision = "20260321_0002"
down_revision = "20260315_0001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.alter_column(
        "notification_jobs",
        "payload_json",
        schema="notification_schema",
        existing_type=sa.JSON(),
        type_=postgresql.JSONB(astext_type=sa.Text()),
        postgresql_using="payload_json::jsonb",
        existing_nullable=True,
    )
    op.alter_column(
        "notification_delivery_logs",
        "delivery_payload",
        schema="notification_schema",
        existing_type=sa.JSON(),
        type_=postgresql.JSONB(astext_type=sa.Text()),
        postgresql_using="delivery_payload::jsonb",
        existing_nullable=True,
    )


def downgrade() -> None:
    op.alter_column(
        "notification_delivery_logs",
        "delivery_payload",
        schema="notification_schema",
        existing_type=postgresql.JSONB(astext_type=sa.Text()),
        type_=sa.JSON(),
        postgresql_using="delivery_payload::json",
        existing_nullable=True,
    )
    op.alter_column(
        "notification_jobs",
        "payload_json",
        schema="notification_schema",
        existing_type=postgresql.JSONB(astext_type=sa.Text()),
        type_=sa.JSON(),
        postgresql_using="payload_json::json",
        existing_nullable=True,
    )
