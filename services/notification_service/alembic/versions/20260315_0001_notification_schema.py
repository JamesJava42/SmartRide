"""create notification schema tables

Revision ID: 20260315_0001
Revises:
Create Date: 2026-03-15 22:40:00
"""

from alembic import op
import sqlalchemy as sa


revision = "20260315_0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("CREATE SCHEMA IF NOT EXISTS notification_schema")
    op.create_table(
        "notification_jobs",
        sa.Column("event_type", sa.String(length=64), nullable=False),
        sa.Column("recipient_type", sa.String(length=32), nullable=False),
        sa.Column("recipient_id", sa.UUID(), nullable=False),
        sa.Column("channel", sa.String(length=32), nullable=False),
        sa.Column("subject", sa.String(length=255), nullable=True),
        sa.Column("body_template", sa.String(length=128), nullable=True),
        sa.Column("payload_json", sa.JSON(), nullable=True),
        sa.Column("status", sa.String(length=32), nullable=False),
        sa.Column("scheduled_for", sa.DateTime(timezone=True), nullable=True),
        sa.Column("sent_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("failed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("failure_reason", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("id", sa.UUID(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        schema="notification_schema",
    )
    op.create_table(
        "notification_delivery_logs",
        sa.Column("notification_job_id", sa.UUID(), nullable=False),
        sa.Column("provider", sa.String(length=64), nullable=True),
        sa.Column("provider_message_id", sa.String(length=128), nullable=True),
        sa.Column("delivery_status", sa.String(length=32), nullable=False),
        sa.Column("delivery_payload", sa.JSON(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("id", sa.UUID(), nullable=False),
        sa.ForeignKeyConstraint(["notification_job_id"], ["notification_schema.notification_jobs.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        schema="notification_schema",
    )


def downgrade() -> None:
    op.drop_table("notification_delivery_logs", schema="notification_schema")
    op.drop_table("notification_jobs", schema="notification_schema")
