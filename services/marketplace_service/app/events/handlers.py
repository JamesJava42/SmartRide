from __future__ import annotations

import asyncio

from sqlalchemy import select

from app.core.enums import DriverStatus
from app.db.session import AsyncSessionLocal
from app.models import Driver
from shared.python.events.streams import ONBOARDING_EVENTS_STREAM, consume_events


async def _handle_onboarding_event(event: dict) -> None:
    payload = event.get("payload", {})
    if event.get("event_type") != "onboarding_approved":
        return
    async with AsyncSessionLocal() as db:
        driver = await db.scalar(select(Driver).where(Driver.id == payload.get("driver_id")))
        if not driver:
            return
        driver.is_approved = True
        driver.status = DriverStatus.ACTIVE
        driver.region_id = payload.get("region_id")
        db.add(driver)
        await db.commit()


async def consume_onboarding_events() -> None:
    async for _event in consume_events(
        ONBOARDING_EVENTS_STREAM,
        group="marketplace_service",
        consumer="marketplace_service-1",
        handler=_handle_onboarding_event,
    ):
        await asyncio.sleep(0)
