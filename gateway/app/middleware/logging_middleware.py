from __future__ import annotations

import json
import logging
import time

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

logger = logging.getLogger("gateway.access")


class LoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) -> Response:
        start_time = time.perf_counter()
        request_id = getattr(request.state, "request_id", None)
        trace_id = getattr(request.state, "trace_id", None)
        query_params = dict(request.query_params)
        client_ip = request.client.host if request.client else None

        base_log = {
            "request_id": request_id,
            "trace_id": trace_id,
            "method": request.method,
            "path": request.url.path,
            "query_params": query_params,
            "client_ip": client_ip,
        }

        response = await call_next(request)
        duration_ms = round((time.perf_counter() - start_time) * 1000, 2)
        logger.info(
            json.dumps(
                {
                    **base_log,
                    "status_code": response.status_code,
                    "duration_ms": duration_ms,
                }
            )
        )
        return response
