from __future__ import annotations

from fastapi import HTTPException, status
from fastapi.responses import JSONResponse
from pydantic import ValidationError

from shared.python.schemas.responses import ErrorResponse


ERROR_STATUS_MAP = {
    "INVALID_CREDENTIALS": status.HTTP_401_UNAUTHORIZED,
    "TOKEN_EXPIRED": status.HTTP_401_UNAUTHORIZED,
    "TOKEN_INVALID": status.HTTP_401_UNAUTHORIZED,
    "FORBIDDEN": status.HTTP_403_FORBIDDEN,
    "NOT_FOUND": status.HTTP_404_NOT_FOUND,
    "VALIDATION_ERROR": status.HTTP_422_UNPROCESSABLE_ENTITY,
}


def error_response(message: str, error_code: str, details: dict | None = None, status_code: int | None = None) -> JSONResponse:
    return JSONResponse(
        status_code=status_code or ERROR_STATUS_MAP.get(error_code, status.HTTP_400_BAD_REQUEST),
        content=ErrorResponse(message=message, error_code=error_code, details=details).model_dump(mode="json"),
    )


def map_http_exception(exc: HTTPException) -> JSONResponse:
    detail = str(exc.detail)
    if detail == "JWT expired":
        code = "TOKEN_EXPIRED"
    elif detail == "JWT invalid":
        code = "TOKEN_INVALID"
    else:
        code = {
            status.HTTP_401_UNAUTHORIZED: "INVALID_CREDENTIALS",
            status.HTTP_403_FORBIDDEN: "FORBIDDEN",
            status.HTTP_404_NOT_FOUND: "NOT_FOUND",
            status.HTTP_409_CONFLICT: "VALIDATION_ERROR",
        }.get(exc.status_code, "VALIDATION_ERROR")
    return error_response(str(exc.detail), code, status_code=exc.status_code)


def map_validation_exception(exc: ValidationError) -> JSONResponse:
    return error_response("Validation error", "VALIDATION_ERROR", details={"errors": exc.errors()}, status_code=status.HTTP_422_UNPROCESSABLE_ENTITY)
