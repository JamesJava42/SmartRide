"""add rider feedback and completion state to rides

Revision ID: 20260321_0003
Revises: 20260321_0002
Create Date: 2026-03-21
"""

from alembic import op
import sqlalchemy as sa


revision = "20260321_0003"
down_revision = "20260321_0002"
branch_labels = None
depends_on = None


ride_feedback_status = sa.Enum("PENDING", "SUBMITTED", "SKIPPED", name="ride_feedback_status")


def upgrade() -> None:
    bind = op.get_bind()
    ride_feedback_status.create(bind, checkfirst=True)

    op.add_column(
        "rides",
        sa.Column("rider_rating", sa.SmallInteger(), nullable=True),
        schema="marketplace_schema",
    )
    op.add_column(
        "rides",
        sa.Column("rider_comment", sa.Text(), nullable=True),
        schema="marketplace_schema",
    )
    op.add_column(
        "rides",
        sa.Column("feedback_status", ride_feedback_status, nullable=False, server_default="PENDING"),
        schema="marketplace_schema",
    )
    op.add_column(
        "rides",
        sa.Column("completion_acknowledged", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        schema="marketplace_schema",
    )


def downgrade() -> None:
    op.drop_column("rides", "completion_acknowledged", schema="marketplace_schema")
    op.drop_column("rides", "feedback_status", schema="marketplace_schema")
    op.drop_column("rides", "rider_comment", schema="marketplace_schema")
    op.drop_column("rides", "rider_rating", schema="marketplace_schema")
    bind = op.get_bind()
    ride_feedback_status.drop(bind, checkfirst=True)
