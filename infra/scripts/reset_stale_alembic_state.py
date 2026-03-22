from __future__ import annotations

import asyncio
import os

from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine


DATABASE_URL = os.getenv(
    "POSTGRES_RESET_DATABASE_URL",
    os.getenv("AUTH_DATABASE_URL", "postgresql+asyncpg://rideconnect:changeme@postgres:5432/rideconnect"),
)


STALE_MIGRATION_CHECKS = (
    ("alembic_version_auth", "auth_schema.users"),
    ("alembic_version_operations", "operations_schema.regions"),
    ("alembic_version_marketplace", "marketplace_schema.rides"),
    ("alembic_version_notification", "notification_schema.notification_jobs"),
)


async def main() -> None:
    engine = create_async_engine(DATABASE_URL)
    try:
        async with engine.begin() as conn:
            for version_table, required_table in STALE_MIGRATION_CHECKS:
                version_exists = await conn.scalar(
                    text("SELECT to_regclass(:table_name)"),
                    {"table_name": f"public.{version_table}"},
                )
                required_exists = await conn.scalar(
                    text("SELECT to_regclass(:table_name)"),
                    {"table_name": required_table},
                )
                if version_exists is not None and required_exists is None:
                    await conn.execute(text(f"DROP TABLE IF EXISTS {version_table}"))
    finally:
        await engine.dispose()


if __name__ == "__main__":
    asyncio.run(main())
