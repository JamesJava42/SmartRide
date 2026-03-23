from __future__ import annotations

from fastapi import APIRouter, Request, Response

from app.config import settings
from app.routes.proxy import forward_request

router = APIRouter(tags=["marketplace-proxy"])


@router.api_route("/api/v1/rides/{path:path}", methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"])
async def proxy_rides(path: str, request: Request) -> Response:
    return await forward_request(request, settings.marketplace_service_url)


@router.api_route("/api/v1/riders/{path:path}", methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"])
async def proxy_riders(path: str, request: Request) -> Response:
    return await forward_request(request, settings.marketplace_service_url)


@router.api_route("/api/v1/rider/{path:path}", methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"])
async def proxy_rider(path: str, request: Request) -> Response:
    return await forward_request(request, settings.marketplace_service_url)


@router.api_route("/api/v1/drivers/{path:path}", methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"])
async def proxy_drivers(path: str, request: Request) -> Response:
    return await forward_request(request, settings.marketplace_service_url)


@router.api_route("/api/v1/driver/{path:path}", methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"])
async def proxy_driver(path: str, request: Request) -> Response:
    return await forward_request(request, settings.marketplace_service_url)


@router.api_route("/api/v1/tracking/{path:path}", methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"])
async def proxy_tracking(path: str, request: Request) -> Response:
    return await forward_request(request, settings.marketplace_service_url)
