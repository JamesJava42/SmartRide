from __future__ import annotations

import logging

from fastapi import Request
from redis.asyncio import Redis

from app.config import settings

logger = logging.getLogger(__name__)

_redis_client: Redis | None = None


def get_rate_limit_redis() -> Redis:
    global _redis_client
    if _redis_client is None:
        _redis_client = Redis.from_url(settings.redis_url, decode_responses=True)
    return _redis_client


def get_client_ip(request: Request) -> str:
    forwarded_for = request.headers.get("x-forwarded-for")
    if forwarded_for:
        return forwarded_for.split(",")[0].strip()
    if request.client and request.client.host:
        return request.client.host
    return "unknown"


async def check_rate_limit(request: Request, *, bucket: str, limit: int, window_seconds: int) -> tuple[bool, int]:
    redis = get_rate_limit_redis()
    key = f"rate-limit:{bucket}:{get_client_ip(request)}"
    try:
        current = await redis.incr(key)
        if current == 1:
            await redis.expire(key, window_seconds)
        ttl = await redis.ttl(key)
    except Exception:
        logger.exception("Rate limit check failed; allowing request")
        return True, window_seconds
    return current <= limit, max(ttl, 0)
