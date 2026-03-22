"""upgrade marketplace json columns to jsonb

Revision ID: 20260321_0005
Revises: 20260321_0004
Create Date: 2026-03-21
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision = "20260321_0005"
down_revision = "20260321_0004"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.alter_column(
        "fare_estimates",
        "pricing_snapshot",
        schema="marketplace_schema",
        existing_type=sa.JSON(),
        type_=postgresql.JSONB(astext_type=sa.Text()),
        postgresql_using="pricing_snapshot::jsonb",
        existing_nullable=True,
    )
    op.alter_column(
        "ride_events",
        "event_payload",
        schema="marketplace_schema",
        existing_type=sa.JSON(),
        type_=postgresql.JSONB(astext_type=sa.Text()),
        postgresql_using="event_payload::jsonb",
        existing_nullable=True,
    )


def downgrade() -> None:
    op.alter_column(
        "ride_events",
        "event_payload",
        schema="marketplace_schema",
        existing_type=postgresql.JSONB(astext_type=sa.Text()),
        type_=sa.JSON(),
        postgresql_using="event_payload::json",
        existing_nullable=True,
    )
    op.alter_column(
        "fare_estimates",
        "pricing_snapshot",
        schema="marketplace_schema",
        existing_type=postgresql.JSONB(astext_type=sa.Text()),
        type_=sa.JSON(),
        postgresql_using="pricing_snapshot::json",
        existing_nullable=True,
    )
