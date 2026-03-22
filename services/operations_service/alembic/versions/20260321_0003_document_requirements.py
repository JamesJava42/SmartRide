"""add document requirements and compliance fields

Revision ID: 20260321_0003
Revises: 20260320_0002
Create Date: 2026-03-21 09:00:00.000000
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision = "20260321_0003"
down_revision = "20260320_0002"
branch_labels = None
depends_on = None


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


def upgrade() -> None:
    op.add_column("driver_documents", sa.Column("document_number", sa.String(length=255), nullable=True), schema="operations_schema")
    op.add_column("driver_documents", sa.Column("issuing_state", sa.String(length=100), nullable=True), schema="operations_schema")
    op.add_column("driver_documents", sa.Column("issuing_country", sa.String(length=100), nullable=True), schema="operations_schema")
    op.add_column("driver_documents", sa.Column("issued_at", sa.DateTime(timezone=True), nullable=True), schema="operations_schema")
    op.add_column("driver_documents", sa.Column("expires_at", sa.DateTime(timezone=True), nullable=True), schema="operations_schema")

    op.create_table(
        "document_requirements",
        sa.Column("entity_type", sa.String(length=50), nullable=False),
        sa.Column("document_type", document_type_enum, nullable=False),
        sa.Column("region_id", postgresql.UUID(as_uuid=False), nullable=True),
        sa.Column("is_required", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("requires_expiry", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("requires_document_number", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("requires_issued_at", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("requires_issuing_state", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("requires_issuing_country", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("allowed_extensions_json", sa.JSON(), nullable=True),
        sa.Column("max_file_size_bytes", sa.BigInteger(), nullable=True),
        sa.Column("validation_rules_json", sa.JSON(), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("id", postgresql.UUID(as_uuid=False), nullable=False),
        sa.ForeignKeyConstraint(["region_id"], ["operations_schema.regions.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        schema="operations_schema",
    )

    op.execute(
        """
        INSERT INTO operations_schema.document_requirements (
            id, entity_type, document_type, region_id, is_required, requires_expiry,
            requires_document_number, requires_issued_at, requires_issuing_state,
            requires_issuing_country, allowed_extensions_json, max_file_size_bytes,
            validation_rules_json, is_active, created_at, updated_at
        )
        VALUES
            (gen_random_uuid(), 'DRIVER', 'GOVT_ID_FRONT', NULL, true, false, false, false, false, false, '[".pdf",".png",".jpg",".jpeg",".webp"]'::json, 10485760, '{"group":"identity"}'::json, true, now(), now()),
            (gen_random_uuid(), 'DRIVER', 'GOVT_ID_BACK', NULL, true, false, false, false, false, false, '[".pdf",".png",".jpg",".jpeg",".webp"]'::json, 10485760, '{"group":"identity"}'::json, true, now(), now()),
            (gen_random_uuid(), 'DRIVER', 'DRIVER_LICENSE', NULL, true, true, true, false, true, true, '[".pdf",".png",".jpg",".jpeg",".webp"]'::json, 10485760, '{"group":"license"}'::json, true, now(), now()),
            (gen_random_uuid(), 'DRIVER', 'VEHICLE_REGISTRATION', NULL, true, true, true, false, true, true, '[".pdf",".png",".jpg",".jpeg",".webp"]'::json, 10485760, '{"group":"vehicle"}'::json, true, now(), now()),
            (gen_random_uuid(), 'DRIVER', 'INSURANCE', NULL, true, true, true, false, true, true, '[".pdf",".png",".jpg",".jpeg",".webp"]'::json, 10485760, '{"group":"insurance"}'::json, true, now(), now()),
            (gen_random_uuid(), 'DRIVER', 'PROFILE_PHOTO', NULL, true, false, false, false, false, false, '[".png",".jpg",".jpeg",".webp"]'::json, 10485760, '{"group":"identity"}'::json, true, now(), now())
        """
    )


def downgrade() -> None:
    op.drop_table("document_requirements", schema="operations_schema")
    op.drop_column("driver_documents", "expires_at", schema="operations_schema")
    op.drop_column("driver_documents", "issued_at", schema="operations_schema")
    op.drop_column("driver_documents", "issuing_country", schema="operations_schema")
    op.drop_column("driver_documents", "issuing_state", schema="operations_schema")
    op.drop_column("driver_documents", "document_number", schema="operations_schema")
