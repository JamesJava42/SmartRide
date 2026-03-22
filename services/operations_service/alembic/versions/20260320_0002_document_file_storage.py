"""add filesystem-backed document metadata

Revision ID: 20260320_0002
Revises: 20260315_0001
Create Date: 2026-03-20 12:00:00.000000
"""

from alembic import op
import sqlalchemy as sa


revision = "20260320_0002"
down_revision = "20260315_0001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "driver_documents",
        sa.Column("file_path", sa.Text(), nullable=True),
        schema="operations_schema",
    )
    op.add_column(
        "driver_documents",
        sa.Column("original_file_name", sa.Text(), nullable=True),
        schema="operations_schema",
    )
    op.add_column(
        "driver_documents",
        sa.Column("mime_type", sa.Text(), nullable=True),
        schema="operations_schema",
    )
    op.add_column(
        "driver_documents",
        sa.Column("file_size", sa.BigInteger(), nullable=True),
        schema="operations_schema",
    )
    op.add_column(
        "driver_documents",
        sa.Column("notes", sa.Text(), nullable=True),
        schema="operations_schema",
    )
    op.alter_column(
        "driver_documents",
        "file_url",
        existing_type=sa.Text(),
        nullable=True,
        schema="operations_schema",
    )


def downgrade() -> None:
    op.alter_column(
        "driver_documents",
        "file_url",
        existing_type=sa.Text(),
        nullable=False,
        schema="operations_schema",
    )
    op.drop_column("driver_documents", "notes", schema="operations_schema")
    op.drop_column("driver_documents", "file_size", schema="operations_schema")
    op.drop_column("driver_documents", "mime_type", schema="operations_schema")
    op.drop_column("driver_documents", "original_file_name", schema="operations_schema")
    op.drop_column("driver_documents", "file_path", schema="operations_schema")
