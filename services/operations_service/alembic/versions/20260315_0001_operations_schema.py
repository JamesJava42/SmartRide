"""create operations schema tables

Revision ID: 20260315_0001
Revises:
Create Date: 2026-03-15 21:10:00
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision = "20260315_0001"
down_revision = None
branch_labels = None
depends_on = None


admin_role_enum = postgresql.ENUM("SUPER_ADMIN", "OPS_ADMIN", "ONBOARDING_ADMIN", "REGIONAL_ADMIN", name="admin_role", create_type=False)
onboarding_status_enum = postgresql.ENUM("DRAFT", "SUBMITTED", "UNDER_REVIEW", "DOCS_PENDING", "APPROVED", "REJECTED", name="onboarding_status", create_type=False)
document_type_enum = postgresql.ENUM(
    "GOVT_ID_FRONT",
    "GOVT_ID_BACK",
    "DRIVER_LICENSE",
    "VEHICLE_REGISTRATION",
    "INSURANCE",
    "PROFILE_PHOTO",
    name="document_type",
    create_type=False,
)
verification_status_enum = postgresql.ENUM("SUBMITTED", "UNDER_REVIEW", "APPROVED", "REJECTED", name="verification_status", create_type=False)
alert_severity_enum = postgresql.ENUM("LOW", "MEDIUM", "HIGH", "CRITICAL", name="alert_severity", create_type=False)


def upgrade() -> None:
    op.execute("CREATE SCHEMA IF NOT EXISTS operations_schema")

    postgresql.ENUM("SUPER_ADMIN", "OPS_ADMIN", "ONBOARDING_ADMIN", "REGIONAL_ADMIN", name="admin_role").create(op.get_bind(), checkfirst=True)
    postgresql.ENUM("DRAFT", "SUBMITTED", "UNDER_REVIEW", "DOCS_PENDING", "APPROVED", "REJECTED", name="onboarding_status").create(op.get_bind(), checkfirst=True)
    postgresql.ENUM(
        "GOVT_ID_FRONT",
        "GOVT_ID_BACK",
        "DRIVER_LICENSE",
        "VEHICLE_REGISTRATION",
        "INSURANCE",
        "PROFILE_PHOTO",
        name="document_type",
    ).create(op.get_bind(), checkfirst=True)
    postgresql.ENUM("SUBMITTED", "UNDER_REVIEW", "APPROVED", "REJECTED", name="verification_status").create(op.get_bind(), checkfirst=True)
    postgresql.ENUM("LOW", "MEDIUM", "HIGH", "CRITICAL", name="alert_severity").create(op.get_bind(), checkfirst=True)

    op.create_table(
        "regions",
        sa.Column("code", sa.String(length=64), nullable=False),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.Column("city", sa.String(length=100), nullable=True),
        sa.Column("state", sa.String(length=100), nullable=True),
        sa.Column("country", sa.String(length=100), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("id", sa.UUID(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("code"),
        schema="operations_schema",
    )

    op.create_table(
        "admins",
        sa.Column("user_id", sa.UUID(), nullable=False),
        sa.Column("display_name", sa.String(length=100), nullable=False),
        sa.Column("admin_role", admin_role_enum, nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("id", sa.UUID(), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["auth_schema.users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id"),
        schema="operations_schema",
    )

    op.create_table(
        "admin_regions",
        sa.Column("admin_id", sa.UUID(), nullable=False),
        sa.Column("region_id", sa.UUID(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("id", sa.UUID(), nullable=False),
        sa.ForeignKeyConstraint(["admin_id"], ["operations_schema.admins.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["region_id"], ["operations_schema.regions.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        schema="operations_schema",
    )

    op.create_table(
        "driver_onboarding_profiles",
        sa.Column("driver_id", sa.UUID(), nullable=False),
        sa.Column("region_id", sa.UUID(), nullable=False),
        sa.Column("status", onboarding_status_enum, nullable=False),
        sa.Column("submitted_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("review_started_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("reviewed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("reviewed_by_admin_id", sa.UUID(), nullable=True),
        sa.Column("review_notes", sa.Text(), nullable=True),
        sa.Column("rejection_reason", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("id", sa.UUID(), nullable=False),
        sa.ForeignKeyConstraint(["region_id"], ["operations_schema.regions.id"], ondelete="RESTRICT"),
        sa.ForeignKeyConstraint(["reviewed_by_admin_id"], ["operations_schema.admins.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("driver_id"),
        schema="operations_schema",
    )

    op.create_table(
        "driver_documents",
        sa.Column("driver_id", sa.UUID(), nullable=False),
        sa.Column("document_type", document_type_enum, nullable=False),
        sa.Column("file_url", sa.Text(), nullable=False),
        sa.Column("verification_status", verification_status_enum, nullable=False),
        sa.Column("submitted_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("reviewed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("reviewed_by_admin_id", sa.UUID(), nullable=True),
        sa.Column("rejection_reason", sa.Text(), nullable=True),
        sa.Column("metadata_json", sa.JSON(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("id", sa.UUID(), nullable=False),
        sa.ForeignKeyConstraint(["reviewed_by_admin_id"], ["operations_schema.admins.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
        schema="operations_schema",
    )

    op.create_table(
        "admin_audit_logs",
        sa.Column("admin_id", sa.UUID(), nullable=True),
        sa.Column("action_type", sa.String(length=64), nullable=False),
        sa.Column("entity_type", sa.String(length=64), nullable=False),
        sa.Column("entity_id", sa.UUID(), nullable=True),
        sa.Column("details_json", sa.JSON(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("id", sa.UUID(), nullable=False),
        sa.ForeignKeyConstraint(["admin_id"], ["operations_schema.admins.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
        schema="operations_schema",
    )

    op.create_table(
        "admin_alerts",
        sa.Column("region_id", sa.UUID(), nullable=True),
        sa.Column("alert_type", sa.String(length=64), nullable=False),
        sa.Column("severity", alert_severity_enum, nullable=False),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("message", sa.Text(), nullable=False),
        sa.Column("is_resolved", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("resolved_by_admin_id", sa.UUID(), nullable=True),
        sa.Column("resolved_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("id", sa.UUID(), nullable=False),
        sa.ForeignKeyConstraint(["region_id"], ["operations_schema.regions.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["resolved_by_admin_id"], ["operations_schema.admins.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
        schema="operations_schema",
    )


def downgrade() -> None:
    op.drop_table("admin_alerts", schema="operations_schema")
    op.drop_table("admin_audit_logs", schema="operations_schema")
    op.drop_table("driver_documents", schema="operations_schema")
    op.drop_table("driver_onboarding_profiles", schema="operations_schema")
    op.drop_table("admin_regions", schema="operations_schema")
    op.drop_table("admins", schema="operations_schema")
    op.drop_table("regions", schema="operations_schema")
    postgresql.ENUM("LOW", "MEDIUM", "HIGH", "CRITICAL", name="alert_severity").drop(op.get_bind(), checkfirst=True)
    postgresql.ENUM("SUBMITTED", "UNDER_REVIEW", "APPROVED", "REJECTED", name="verification_status").drop(op.get_bind(), checkfirst=True)
    postgresql.ENUM(
        "GOVT_ID_FRONT",
        "GOVT_ID_BACK",
        "DRIVER_LICENSE",
        "VEHICLE_REGISTRATION",
        "INSURANCE",
        "PROFILE_PHOTO",
        name="document_type",
    ).drop(op.get_bind(), checkfirst=True)
    postgresql.ENUM("DRAFT", "SUBMITTED", "UNDER_REVIEW", "DOCS_PENDING", "APPROVED", "REJECTED", name="onboarding_status").drop(op.get_bind(), checkfirst=True)
    postgresql.ENUM("SUPER_ADMIN", "OPS_ADMIN", "ONBOARDING_ADMIN", "REGIONAL_ADMIN", name="admin_role").drop(op.get_bind(), checkfirst=True)
