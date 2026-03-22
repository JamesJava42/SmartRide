from __future__ import annotations

from fastapi import APIRouter, Request, status
from fastapi.responses import JSONResponse

from app.config import settings
from app.core.readiness import get_request_id, has_required_routes, readiness_status

router = APIRouter(tags=["health"])

REQUIRED_ROUTE_PATHS = {
    "/health",
    "/metrics",
    "/ready",
    "/api/v1/auth/{path:path}",
    "/api/v1/marketplace/{path:path}",
    "/api/v1/operations/{path:path}",
    "/api/v1/notifications/{path:path}",
}


def _config_loaded() -> bool:
    return all(
        [
            bool(settings.auth_service_url),
            bool(settings.marketplace_service_url),
            bool(settings.operations_service_url),
            bool(settings.notification_service_url),
        ]
    )


@router.get("/ready")
async def readiness(request: Request) -> JSONResponse:
    checks = {
        "config_loaded": "ok" if _config_loaded() else "failed",
        "routes_loaded": "ok" if has_required_routes(request, REQUIRED_ROUTE_PATHS) else "failed",
        "startup_complete": "ok" if getattr(request.app.state, "startup_complete", False) else "failed",
    }
    status_value = readiness_status(checks)
    payload = {
        "status": status_value,
        "service": "gateway",
        "checks": checks,
        "request_id": get_request_id(request),
    }
    return JSONResponse(
        status_code=status.HTTP_200_OK if status_value == "ready" else status.HTTP_503_SERVICE_UNAVAILABLE,
        content=payload,
    )
