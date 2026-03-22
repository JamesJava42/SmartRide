from __future__ import annotations

from shared.python.events.streams import RIDE_EVENTS_STREAM, publish_event


async def publish_ride_event(event_type: str, payload: dict) -> str:
    return await publish_event(RIDE_EVENTS_STREAM, event_type, payload)
