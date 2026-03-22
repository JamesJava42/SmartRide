from __future__ import annotations

import logging
import time

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

from app.core.metrics import gateway_metrics

logger = logging.getLogger("gateway.metrics")


class MetricsMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) -> Response:
        start_time = time.perf_counter()
        path = request.url.path
        method = request.method

        try:
            response = await call_next(request)
            status_code = response.status_code
        except Exception:
            status_code = 500
            self._record(method=method, path=path, status_code=status_code, start_time=start_time)
            raise

        self._record(method=method, path=path, status_code=status_code, start_time=start_time)
        return response

    def _record(self, *, method: str, path: str, status_code: int, start_time: float) -> None:
        duration_ms = (time.perf_counter() - start_time) * 1000
        try:
            gateway_metrics.record_request(
                method=method,
                path=path,
                status_code=status_code,
                duration_ms=duration_ms,
            )
        except Exception:
            logger.exception("Failed to record gateway metrics")
