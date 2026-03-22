"""add no-drivers-found status and dispatch retry count

Revision ID: 20260321_0002
Revises: 20260315_0001
Create Date: 2026-03-21 18:10:00
"""

from alembic import op
import sqlalchemy as sa


revision = "20260321_0002"
down_revision = "20260315_0001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("ALTER TYPE ride_status ADD VALUE IF NOT EXISTS 'NO_DRIVERS_FOUND'")
    op.add_column(
        "rides",
        sa.Column("dispatch_retry_count", sa.Integer(), nullable=False, server_default="0"),
        schema="marketplace_schema",
    )


def downgrade() -> None:
    op.drop_column("rides", "dispatch_retry_count", schema="marketplace_schema")

