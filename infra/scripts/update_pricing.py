"""Update existing pricing rate cards to 25% below Uber minimums for Long Beach, CA.

Uber approximate UberX rates (Long Beach, CA):
  base $1.25 | $1.15/mi | $0.26/min | min $7.50

RideConnect target (×0.75):
  ECONOMY : base $1.00 | $0.85/mi | $0.20/min | min $5.50
  PREMIUM : base $1.50 | $1.30/mi | $0.26/min | min $7.50
  XL      : base $1.75 | $1.50/mi | $0.30/min | min $9.75
"""
from __future__ import annotations

import asyncio
import os

from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine

DATABASE_URL = os.getenv(
    "MARKETPLACE_DATABASE_URL",
    "postgresql+asyncpg://rideconnect:changeme@postgres:5432/rideconnect",
)

NEW_RATES = {
    "ECONOMY": dict(base_fare=1.00, per_mile_rate=0.85, per_minute_rate=0.20, minimum_fare=5.50, platform_fee=1.50),
    "PREMIUM": dict(base_fare=1.50, per_mile_rate=1.30, per_minute_rate=0.26, minimum_fare=7.50, platform_fee=2.00),
    "XL":      dict(base_fare=1.75, per_mile_rate=1.50, per_minute_rate=0.30, minimum_fare=9.75, platform_fee=2.25),
}


async def main() -> None:
    engine = create_async_engine(DATABASE_URL, future=True)
    async with engine.begin() as conn:
        for vehicle_type, rates in NEW_RATES.items():
            result = await conn.execute(
                text(
                    """
                    UPDATE marketplace_schema.pricing_rate_cards
                    SET
                        base_fare        = :base_fare,
                        per_mile_rate    = :per_mile_rate,
                        per_minute_rate  = :per_minute_rate,
                        minimum_fare     = :minimum_fare,
                        platform_fee     = :platform_fee,
                        updated_at       = now()
                    WHERE vehicle_type = :vehicle_type
                      AND is_active = true
                    """
                ),
                {**rates, "vehicle_type": vehicle_type},
            )
            print(f"Updated {result.rowcount} row(s) for {vehicle_type}")
    await engine.dispose()
    print("Pricing update complete.")


if __name__ == "__main__":
    asyncio.run(main())
