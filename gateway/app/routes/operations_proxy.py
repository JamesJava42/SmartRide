from __future__ import annotations

from fastapi import APIRouter, Request, Response

from app.config import settings
from app.routes.proxy import forward_request

router = APIRouter(tags=["operations-proxy"])


@router.api_route("/api/v1/admin/{path:path}", methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"])
async def proxy_admin(path: str, request: Request) -> Response:
    return await forward_request(request, settings.operations_service_url)


@router.api_route("/api/v1/onboarding/{path:path}", methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"])
async def proxy_onboarding(path: str, request: Request) -> Response:
    return await forward_request(request, settings.operations_service_url)
