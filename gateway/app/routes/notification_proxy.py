from __future__ import annotations

from fastapi import APIRouter, Request, Response

from app.config import settings
from app.routes.proxy import forward_request

router = APIRouter(tags=["notification-proxy"])


@router.api_route("/api/v1/notifications/{path:path}", methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"])
async def proxy_notifications(path: str, request: Request) -> Response:
    return await forward_request(request, settings.notification_service_url)
