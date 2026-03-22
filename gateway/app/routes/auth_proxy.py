from __future__ import annotations

from fastapi import APIRouter, Request, Response

from app.config import settings
from app.routes.proxy import forward_request

router = APIRouter(tags=["auth-proxy"])


@router.api_route("/api/v1/auth/{path:path}", methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"])
async def proxy_auth(path: str, request: Request) -> Response:
    return await forward_request(request, settings.auth_service_url)


@router.api_route("/api/v1/admin/auth/{path:path}", methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"])
async def proxy_admin_auth(path: str, request: Request) -> Response:
    return await forward_request(request, settings.auth_service_url)
