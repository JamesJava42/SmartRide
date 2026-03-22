"""create auth schema tables

Revision ID: 20260315_0001
Revises:
Create Date: 2026-03-15 20:35:00
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision = "20260315_0001"
down_revision = None
branch_labels = None
depends_on = None


user_role_enum = postgresql.ENUM("RIDER", "DRIVER", "ADMIN", name="user_role", create_type=False)


def upgrade() -> None:
    op.execute("CREATE SCHEMA IF NOT EXISTS auth_schema")
    postgresql.ENUM("RIDER", "DRIVER", "ADMIN", name="user_role").create(op.get_bind(), checkfirst=True)

    op.create_table(
        "users",
        sa.Column("email", sa.String(length=255), nullable=True),
        sa.Column("phone_number", sa.String(length=32), nullable=True),
        sa.Column("password_hash", sa.String(length=255), nullable=False),
        sa.Column("role", user_role_enum, nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("is_verified", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("last_login_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("id", sa.UUID(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("email"),
        sa.UniqueConstraint("phone_number"),
        schema="auth_schema",
    )

    op.create_table(
        "refresh_tokens",
        sa.Column("user_id", sa.UUID(), nullable=False),
        sa.Column("token_hash", sa.String(length=255), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("revoked_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("id", sa.UUID(), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["auth_schema.users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        schema="auth_schema",
    )

    op.create_table(
        "password_reset_tokens",
        sa.Column("user_id", sa.UUID(), nullable=False),
        sa.Column("token_hash", sa.String(length=255), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("used_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("id", sa.UUID(), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["auth_schema.users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        schema="auth_schema",
    )


def downgrade() -> None:
    op.drop_table("password_reset_tokens", schema="auth_schema")
    op.drop_table("refresh_tokens", schema="auth_schema")
    op.drop_table("users", schema="auth_schema")
    postgresql.ENUM("RIDER", "DRIVER", "ADMIN", name="user_role").drop(op.get_bind(), checkfirst=True)
