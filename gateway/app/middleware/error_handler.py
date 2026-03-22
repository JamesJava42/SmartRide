from __future__ import annotations

import json
import logging

from fastapi import HTTPException
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

from app.core.errors import AppError, InternalServerError, ValidationError, build_error_payload

logger = logging.getLogger("gateway.errors")


def _request_context(request: Request) -> dict[str, str | None]:
    return {
        "request_id": getattr(request.state, "request_id", None),
        "trace_id": getattr(request.state, "trace_id", None),
        "method": request.method,
        "path": request.url.path,
    }


def _log_known_error(request: Request, error: AppError) -> None:
    payload = {
        **_request_context(request),
        "status_code": error.status_code,
        "error_code": error.error_code,
        "message": error.message,
        "details": error.details,
        "exception_type": type(error).__name__,
    }
    log_fn = logger.warning if error.status_code < 500 else logger.error
    log_fn(json.dumps(payload))


def _app_error_from_http_exception(exc: HTTPException) -> AppError:
    details = exc.detail if isinstance(exc.detail, dict | list) else None
    message = exc.detail if isinstance(exc.detail, str) else "Request failed"
    return AppError(
        message=message,
        details=details,
        error_code="HTTP_ERROR",
        status_code=exc.status_code,
    )


class ErrorHandlerMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) -> Response:
        try:
            return await call_next(request)
        except AppError as exc:
            _log_known_error(request, exc)
            return JSONResponse(
                status_code=exc.status_code,
                content=build_error_payload(exc, getattr(request.state, "request_id", None)),
            )
        except RequestValidationError as exc:
            app_error = ValidationError(
                message="The request is invalid",
                details=exc.errors(),
            )
            _log_known_error(request, app_error)
            return JSONResponse(
                status_code=app_error.status_code,
                content=build_error_payload(app_error, getattr(request.state, "request_id", None)),
            )
        except HTTPException as exc:
            app_error = _app_error_from_http_exception(exc)
            _log_known_error(request, app_error)
            response = JSONResponse(
                status_code=app_error.status_code,
                content=build_error_payload(app_error, getattr(request.state, "request_id", None)),
            )
            if exc.headers:
                response.headers.update(exc.headers)
            return response
        except Exception as exc:
            app_error = InternalServerError()
            logger.exception(
                json.dumps(
                    {
                        **_request_context(request),
                        "status_code": app_error.status_code,
                        "error_code": app_error.error_code,
                        "message": app_error.message,
                        "details": None,
                        "exception_type": type(exc).__name__,
                    }
                )
            )
            return JSONResponse(
                status_code=app_error.status_code,
                content=build_error_payload(app_error, getattr(request.state, "request_id", None)),
            )
