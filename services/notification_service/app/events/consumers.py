from __future__ import annotations

import asyncio

from app.db.session import AsyncSessionLocal
from app.services.notification_service import notification_service
from shared.python.events.streams import ONBOARDING_EVENTS_STREAM, RIDE_EVENTS_STREAM, consume_events


async def _handle_event(event: dict) -> None:
    async with AsyncSessionLocal() as db:
        await notification_service.create_jobs_from_event(db, event.get("event_type", ""), event.get("payload", {}))


async def consume_ride_events() -> None:
    async for _event in consume_events(
        RIDE_EVENTS_STREAM,
        group="notification_service",
        consumer="notification_service-ride",
        handler=_handle_event,
    ):
        await asyncio.sleep(0)


async def consume_onboarding_events() -> None:
    async for _event in consume_events(
        ONBOARDING_EVENTS_STREAM,
        group="notification_service",
        consumer="notification_service-onboarding",
        handler=_handle_event,
    ):
        await asyncio.sleep(0)
