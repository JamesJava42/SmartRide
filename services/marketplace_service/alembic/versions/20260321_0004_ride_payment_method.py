"""add ride payment method

Revision ID: 20260321_0004
Revises: 20260321_0003
Create Date: 2026-03-21
"""

from alembic import op
import sqlalchemy as sa


revision = "20260321_0004"
down_revision = "20260321_0003"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "rides",
        sa.Column("payment_method", sa.String(length=64), nullable=False, server_default="CASH"),
        schema="marketplace_schema",
    )


def downgrade() -> None:
    op.drop_column("rides", "payment_method", schema="marketplace_schema")
