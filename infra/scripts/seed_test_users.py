from __future__ import annotations

import asyncio
import os
from datetime import datetime, timezone
from decimal import Decimal
from uuid import uuid4

import bcrypt
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine


AUTH_DATABASE_URL = os.getenv("AUTH_DATABASE_URL", "postgresql+asyncpg://rideconnect:changeme@localhost:5432/rideconnect")
MARKETPLACE_DATABASE_URL = os.getenv(
    "MARKETPLACE_DATABASE_URL",
    "postgresql+asyncpg://rideconnect:changeme@localhost:5432/rideconnect",
)

ADMIN_EMAIL = "admin@rideconnect.com"
ADMIN_PASSWORD = "ChangeMe123!"
RIDER_EMAIL = "rider@rideconnect.com"
RIDER_PHONE = "+15550000001"
RIDER_PASSWORD = "RiderPass123!"
DRIVER_EMAIL = "driver@rideconnect.com"
DRIVER_PHONE = "+15550000002"
DRIVER_PASSWORD = "DriverPass123!"


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


async def upsert_auth_user(conn, *, email: str, phone_number: str | None, password: str, role: str) -> str:
    existing = await conn.execute(
        text("SELECT id FROM auth_schema.users WHERE email = :email"),
        {"email": email},
    )
    user_id = existing.scalar()
    now = datetime.now(timezone.utc)
    if user_id:
        await conn.execute(
            text(
                """
                UPDATE auth_schema.users
                SET phone_number = :phone_number,
                    password_hash = :password_hash,
                    role = :role,
                    is_active = true,
                    is_verified = true,
                    updated_at = :updated_at
                WHERE id = :id
                """
            ),
            {
                "id": user_id,
                "phone_number": phone_number,
                "password_hash": hash_password(password),
                "role": role,
                "updated_at": now,
            },
        )
        return str(user_id)

    user_id = str(uuid4())
    await conn.execute(
        text(
            """
            INSERT INTO auth_schema.users (
                id, email, phone_number, password_hash, role, is_active, is_verified, created_at, updated_at
            ) VALUES (
                :id, :email, :phone_number, :password_hash, :role, true, true, :created_at, :updated_at
            )
            """
        ),
        {
            "id": user_id,
            "email": email,
            "phone_number": phone_number,
            "password_hash": hash_password(password),
            "role": role,
            "created_at": now,
            "updated_at": now,
        },
    )
    return user_id


async def upsert_rider_profile(conn, *, user_id: str, first_name: str, last_name: str | None) -> None:
    existing = await conn.execute(
        text("SELECT id FROM marketplace_schema.riders WHERE user_id = :user_id"),
        {"user_id": user_id},
    )
    rider_id = existing.scalar()
    now = datetime.now(timezone.utc)
    if rider_id:
        await conn.execute(
            text(
                """
                UPDATE marketplace_schema.riders
                SET first_name = :first_name,
                    last_name = :last_name,
                    updated_at = :updated_at
                WHERE id = :id
                """
            ),
            {
                "id": rider_id,
                "first_name": first_name,
                "last_name": last_name,
                "updated_at": now,
            },
        )
        return

    await conn.execute(
        text(
            """
            INSERT INTO marketplace_schema.riders (
                id, user_id, first_name, last_name, default_payment_method, rating_avg, created_at, updated_at
            ) VALUES (
                :id, :user_id, :first_name, :last_name, :default_payment_method, :rating_avg, :created_at, :updated_at
            )
            """
        ),
        {
            "id": str(uuid4()),
            "user_id": user_id,
            "first_name": first_name,
            "last_name": last_name,
            "default_payment_method": "card_visa",
            "rating_avg": Decimal("4.80"),
            "created_at": now,
            "updated_at": now,
        },
    )


async def upsert_driver_profile(conn, *, user_id: str, first_name: str, last_name: str | None, phone_number: str) -> str:
    existing = await conn.execute(
        text("SELECT id FROM marketplace_schema.drivers WHERE user_id = :user_id"),
        {"user_id": user_id},
    )
    driver_id = existing.scalar()
    now = datetime.now(timezone.utc)
    if driver_id:
        await conn.execute(
            text(
                """
                UPDATE marketplace_schema.drivers
                SET first_name = :first_name,
                    last_name = :last_name,
                    phone_number = :phone_number,
                    status = 'ACTIVE',
                    is_online = true,
                    is_available = true,
                    is_approved = true,
                    rating_avg = :rating_avg,
                    total_rides_completed = :total_rides_completed,
                    updated_at = :updated_at
                WHERE id = :id
                """
            ),
            {
                "id": driver_id,
                "first_name": first_name,
                "last_name": last_name,
                "phone_number": phone_number,
                "rating_avg": Decimal("4.95"),
                "total_rides_completed": 24,
                "updated_at": now,
            },
        )
        return str(driver_id)

    driver_id = str(uuid4())
    await conn.execute(
        text(
            """
            INSERT INTO marketplace_schema.drivers (
                id, user_id, first_name, last_name, phone_number, region_id, status,
                is_online, is_available, is_approved, rating_avg, total_rides_completed, created_at, updated_at
            ) VALUES (
                :id, :user_id, :first_name, :last_name, :phone_number, NULL, 'ACTIVE',
                true, true, true, :rating_avg, :total_rides_completed, :created_at, :updated_at
            )
            """
        ),
        {
            "id": driver_id,
            "user_id": user_id,
            "first_name": first_name,
            "last_name": last_name,
            "phone_number": phone_number,
            "rating_avg": Decimal("4.95"),
            "total_rides_completed": 24,
            "created_at": now,
            "updated_at": now,
        },
    )
    return driver_id


async def upsert_vehicle(conn, *, driver_id: str) -> None:
    now = datetime.now(timezone.utc)
    await conn.execute(
        text(
            """
            UPDATE marketplace_schema.vehicles
            SET is_active = false, updated_at = :updated_at
            WHERE driver_id = :driver_id
            """
        ),
        {
            "driver_id": driver_id,
            "updated_at": now,
        },
    )
    existing = await conn.execute(
        text(
            """
            SELECT id FROM marketplace_schema.vehicles
            WHERE driver_id = :driver_id AND plate_number = :plate_number
            ORDER BY created_at DESC
            LIMIT 1
            """
        ),
        {
            "driver_id": driver_id,
            "plate_number": "TEST-DRIVER-1",
        },
    )
    vehicle_id = existing.scalar()
    if vehicle_id:
        await conn.execute(
            text(
                """
                UPDATE marketplace_schema.vehicles
                SET make = :make,
                    model = :model,
                    year = :year,
                    color = :color,
                    vehicle_type = :vehicle_type,
                    seat_capacity = :seat_capacity,
                    fuel_type = :fuel_type,
                    is_active = true,
                    updated_at = :updated_at
                WHERE id = :id
                """
            ),
            {
                "id": vehicle_id,
                "make": "Toyota",
                "model": "Camry",
                "year": 2022,
                "color": "Silver",
                "vehicle_type": "ECONOMY",
                "seat_capacity": 4,
                "fuel_type": "Hybrid",
                "updated_at": now,
            },
        )
        return

    await conn.execute(
        text(
            """
            INSERT INTO marketplace_schema.vehicles (
                id, driver_id, make, model, year, color, plate_number,
                vehicle_type, seat_capacity, fuel_type, mileage_city, mileage_highway, is_active, created_at, updated_at
            ) VALUES (
                :id, :driver_id, :make, :model, :year, :color, :plate_number,
                :vehicle_type, :seat_capacity, :fuel_type, :mileage_city, :mileage_highway, true, :created_at, :updated_at
            )
            """
        ),
        {
            "id": str(uuid4()),
            "driver_id": driver_id,
            "make": "Toyota",
            "model": "Camry",
            "year": 2022,
            "color": "Silver",
            "plate_number": "TEST-DRIVER-1",
            "vehicle_type": "ECONOMY",
            "seat_capacity": 4,
            "fuel_type": "Hybrid",
            "mileage_city": Decimal("42.00"),
            "mileage_highway": Decimal("48.00"),
            "created_at": now,
            "updated_at": now,
        },
    )


async def main() -> None:
    auth_engine = create_async_engine(AUTH_DATABASE_URL)
    marketplace_engine = create_async_engine(MARKETPLACE_DATABASE_URL)

    async with auth_engine.begin() as auth_conn:
        await upsert_auth_user(
            auth_conn,
            email=ADMIN_EMAIL,
            phone_number=None,
            password=ADMIN_PASSWORD,
            role="ADMIN",
        )
        rider_user_id = await upsert_auth_user(
            auth_conn,
            email=RIDER_EMAIL,
            phone_number=RIDER_PHONE,
            password=RIDER_PASSWORD,
            role="RIDER",
        )
        driver_user_id = await upsert_auth_user(
            auth_conn,
            email=DRIVER_EMAIL,
            phone_number=DRIVER_PHONE,
            password=DRIVER_PASSWORD,
            role="DRIVER",
        )

    async with marketplace_engine.begin() as marketplace_conn:
        await upsert_rider_profile(
            marketplace_conn,
            user_id=rider_user_id,
            first_name="Test",
            last_name="Rider",
        )
        driver_id = await upsert_driver_profile(
            marketplace_conn,
            user_id=driver_user_id,
            first_name="Test",
            last_name="Driver",
            phone_number=DRIVER_PHONE,
        )
        await upsert_vehicle(marketplace_conn, driver_id=driver_id)

    await auth_engine.dispose()
    await marketplace_engine.dispose()

    print("Seeded test accounts:")
    print(f"ADMIN  {ADMIN_EMAIL} / {ADMIN_PASSWORD}")
    print(f"RIDER  {RIDER_EMAIL} / {RIDER_PASSWORD}")
    print(f"DRIVER {DRIVER_EMAIL} / {DRIVER_PASSWORD}")


if __name__ == "__main__":
    asyncio.run(main())
