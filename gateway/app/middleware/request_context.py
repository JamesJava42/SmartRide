from __future__ import annotations

from uuid import uuid4

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

REQUEST_ID_HEADER = "X-Request-ID"
TRACE_ID_HEADER = "X-Trace-ID"
REQUEST_ID_PREFIX = "req_"
TRACE_ID_PREFIX = "trace_"


def _generate_request_id() -> str:
    return f"{REQUEST_ID_PREFIX}{uuid4().hex}"


def _generate_trace_id() -> str:
    return f"{TRACE_ID_PREFIX}{uuid4().hex}"


class RequestContextMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) -> Response:
        request_id = request.headers.get(REQUEST_ID_HEADER) or _generate_request_id()
        trace_id = request.headers.get(TRACE_ID_HEADER) or _generate_trace_id()

        request.state.request_id = request_id
        request.state.trace_id = trace_id

        response = await call_next(request)
        response.headers[REQUEST_ID_HEADER] = request_id
        response.headers[TRACE_ID_HEADER] = trace_id
        return response
