from __future__ import annotations

import asyncio
import os
from datetime import datetime, timezone
from uuid import uuid4

import bcrypt
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine


AUTH_DATABASE_URL = os.getenv("AUTH_DATABASE_URL", "postgresql+asyncpg://rideconnect:changeme@localhost:5432/rideconnect")
OPERATIONS_DATABASE_URL = os.getenv("OPERATIONS_DATABASE_URL", "postgresql+asyncpg://rideconnect:changeme@localhost:5432/rideconnect")


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


async def main() -> None:
    auth_engine = create_async_engine(AUTH_DATABASE_URL)
    operations_engine = create_async_engine(OPERATIONS_DATABASE_URL)

    async with auth_engine.begin() as conn:
        existing_user = await conn.execute(text("SELECT id FROM auth_schema.users WHERE email = :email"), {"email": "admin@rideconnect.com"})
        user_id = existing_user.scalar()
        if not user_id:
            user_id = str(uuid4())
            await conn.execute(
                text(
                    """
                    INSERT INTO auth_schema.users (
                        id, email, phone_number, password_hash, role, is_active, is_verified, created_at, updated_at
                    ) VALUES (
                        :id, :email, NULL, :password_hash, 'ADMIN', true, true, :created_at, :updated_at
                    )
                    """
                ),
                {
                    "id": user_id,
                    "email": "admin@rideconnect.com",
                    "password_hash": hash_password("ChangeMe123!"),
                    "created_at": datetime.now(timezone.utc),
                    "updated_at": datetime.now(timezone.utc),
                },
            )

    async with operations_engine.begin() as conn:
        existing_admin = await conn.execute(text("SELECT id FROM operations_schema.admins WHERE user_id = :user_id"), {"user_id": user_id})
        admin_id = existing_admin.scalar()
        if not admin_id:
            admin_id = str(uuid4())
            await conn.execute(
                text(
                    """
                    INSERT INTO operations_schema.admins (
                        id, user_id, display_name, admin_role, is_active, created_at, updated_at
                    ) VALUES (
                        :id, :user_id, :display_name, 'SUPER_ADMIN', true, :created_at, :updated_at
                    )
                    """
                ),
                {
                    "id": admin_id,
                    "user_id": user_id,
                    "display_name": "RideConnect Admin",
                    "created_at": datetime.now(timezone.utc),
                    "updated_at": datetime.now(timezone.utc),
                },
            )

        regions = await conn.execute(text("SELECT id FROM operations_schema.regions"))
        for row in regions.fetchall():
            link_exists = await conn.execute(
                text(
                    "SELECT id FROM operations_schema.admin_regions WHERE admin_id = :admin_id AND region_id = :region_id"
                ),
                {"admin_id": admin_id, "region_id": str(row.id)},
            )
            if not link_exists.scalar():
                await conn.execute(
                    text(
                        """
                        INSERT INTO operations_schema.admin_regions (
                            id, admin_id, region_id, created_at
                        ) VALUES (
                            :id, :admin_id, :region_id, :created_at
                        )
                        """
                    ),
                    {
                        "id": str(uuid4()),
                        "admin_id": admin_id,
                        "region_id": str(row.id),
                        "created_at": datetime.now(timezone.utc),
                    },
                )

    await auth_engine.dispose()
    await operations_engine.dispose()


if __name__ == "__main__":
    asyncio.run(main())
