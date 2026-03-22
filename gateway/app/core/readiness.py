from __future__ import annotations

from typing import Iterable

from starlette.requests import Request


def get_request_id(request: Request) -> str | None:
    return getattr(request.state, "request_id", None)


def readiness_status(checks: dict[str, str]) -> str:
    return "ready" if all(value == "ok" for value in checks.values()) else "not_ready"


def has_required_routes(request: Request, required_paths: Iterable[str]) -> bool:
    registered_paths = {route.path for route in request.app.router.routes}
    return all(path in registered_paths for path in required_paths)
