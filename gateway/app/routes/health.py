from __future__ import annotations

from fastapi import APIRouter, Request

from app.core.readiness import get_request_id

router = APIRouter(tags=["health"])


@router.get("/health")
async def health(request: Request) -> dict[str, str | None]:
    return {
        "status": "ok",
        "service": "gateway",
        "request_id": get_request_id(request),
    }
