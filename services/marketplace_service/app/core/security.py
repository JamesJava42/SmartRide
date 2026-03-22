from __future__ import annotations

from fastapi import HTTPException, status
from fastapi.responses import JSONResponse

from shared.python.schemas.responses import ErrorResponse


def error_response(
    message: str,
    error_code: str,
    details: dict | None = None,
    status_code: int = status.HTTP_400_BAD_REQUEST,
) -> JSONResponse:
    return JSONResponse(
        status_code=status_code,
        content=ErrorResponse(message=message, error_code=error_code, details=details).model_dump(mode="json"),
    )


def map_http_exception(exc: HTTPException) -> JSONResponse:
    detail = str(exc.detail)
    if detail == "JWT expired":
        code = "TOKEN_EXPIRED"
    elif detail == "JWT invalid":
        code = "TOKEN_INVALID"
    elif detail == "Invalid credentials":
        code = "INVALID_CREDENTIALS"
    elif detail == "Forbidden":
        code = "FORBIDDEN"
    elif detail == "Offer expired":
        code = "OFFER_EXPIRED"
    elif detail == "Offer already responded":
        code = "OFFER_ALREADY_RESPONDED"
    elif detail == "Driver not approved":
        code = "DRIVER_NOT_APPROVED"
    elif detail == "Driver not available":
        code = "DRIVER_NOT_AVAILABLE"
    elif detail == "Invalid ride status transition":
        code = "INVALID_STATUS_TRANSITION"
    elif exc.status_code == status.HTTP_404_NOT_FOUND:
        code = "NOT_FOUND"
    else:
        code = "VALIDATION_ERROR"
    return error_response(detail, code, status_code=exc.status_code)
