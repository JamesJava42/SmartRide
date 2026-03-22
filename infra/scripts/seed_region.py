from __future__ import annotations

import asyncio
import os
from datetime import datetime, timezone
from uuid import uuid4

from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine


DATABASE_URL = os.getenv("OPERATIONS_DATABASE_URL", "postgresql+asyncpg://rideconnect:changeme@localhost:5432/rideconnect")


async def main() -> None:
    engine = create_async_engine(DATABASE_URL)
    async with engine.begin() as conn:
        existing = await conn.execute(text("SELECT id FROM operations_schema.regions WHERE code = :code"), {"code": "long_beach_ca"})
        if existing.scalar():
            return
        await conn.execute(
            text(
                """
                INSERT INTO operations_schema.regions (
                    id, code, name, city, state, country, is_active, created_at, updated_at
                ) VALUES (
                    :id, :code, :name, :city, :state, :country, true, :created_at, :updated_at
                )
                """
            ),
            {
                "id": str(uuid4()),
                "code": "long_beach_ca",
                "name": "Long Beach",
                "city": "Long Beach",
                "state": "CA",
                "country": "USA",
                "created_at": datetime.now(timezone.utc),
                "updated_at": datetime.now(timezone.utc),
            },
        )
    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(main())
