from __future__ import annotations

import asyncio
import os
from datetime import datetime, timezone
from uuid import uuid4

from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine


DATABASE_URL = os.getenv("MARKETPLACE_DATABASE_URL", "postgresql+asyncpg://rideconnect:changeme@postgres:5432/rideconnect")


async def main() -> None:
    engine = create_async_engine(DATABASE_URL, future=True)
    async with engine.begin() as conn:
        region_id = await conn.scalar(text("SELECT id FROM operations_schema.regions WHERE code = 'long_beach_ca' LIMIT 1"))
        if not region_id:
            raise RuntimeError("Long Beach region not found. Run seed_region.py first.")
        # Rates are set 25% below Uber minimums for Long Beach, CA:
        # Uber approx (UberX): base $1.25, $1.15/mi, $0.26/min, min $7.50 → 25% off
        # Columns: vehicle_type, base_fare, per_mile_rate, per_minute_rate,
        #          minimum_fare, booking_fee, platform_fee, driver_payout_percent
        for row in [
            ("ECONOMY", 1.00, 0.85, 0.20, 5.50, 0.00, 1.50, 80.00),
            ("PREMIUM", 1.50, 1.30, 0.26, 7.50, 0.00, 2.00, 82.00),
            ("XL",      1.75, 1.50, 0.30, 9.75, 0.00, 2.25, 84.00),
        ]:
            existing = await conn.scalar(
                text(
                    """
                    SELECT id
                    FROM marketplace_schema.pricing_rate_cards
                    WHERE region_id = :region_id
                      AND vehicle_type = :vehicle_type
                      AND is_active = true
                    LIMIT 1
                    """
                ),
                {"region_id": str(region_id), "vehicle_type": row[0]},
            )
            if existing:
                continue
            await conn.execute(
                text(
                    """
                    INSERT INTO marketplace_schema.pricing_rate_cards (
                        id, region_id, vehicle_type, base_fare, per_mile_rate, per_minute_rate, minimum_fare,
                        booking_fee, platform_fee, driver_payout_percent, is_active, effective_from, created_at, updated_at
                    )
                    VALUES (
                        :id, :region_id, :vehicle_type, :base_fare, :per_mile_rate, :per_minute_rate, :minimum_fare,
                        :booking_fee, :platform_fee, :driver_payout_percent, true, :effective_from, now(), now()
                    )
                    """
                ),
                {
                    "id": str(uuid4()),
                    "region_id": str(region_id),
                    "vehicle_type": row[0],
                    "base_fare": row[1],
                    "per_mile_rate": row[2],
                    "per_minute_rate": row[3],
                    "minimum_fare": row[4],
                    "booking_fee": row[5],
                    "platform_fee": row[6],
                    "driver_payout_percent": row[7],
                    "effective_from": datetime.now(timezone.utc),
                },
            )
    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(main())
